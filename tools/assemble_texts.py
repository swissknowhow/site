"""Assemble les textes intégraux à partir des plages de lignes choisies (work/texts/<mag>.out.json).

Le texte vient mot pour mot du PDF (work/texts/<mag>.txt) ; seules les corrections de lettrines/coupures
fournies dans "x" sont admises, et vérifiées (≥ 92 % de mots identiques au texte brut des lignes citées).
Écrit data/texts/<mag>.json (fusion avec l'existant) et work/texts/<mag>.report.txt.
Usage : python3 -I tools/assemble_texts.py [mag ...]
"""
import difflib, glob, json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = ROOT / 'work' / 'texts'

def load_lines(mag):
    L, page, pages = {}, 0, {}
    for ln in (W / f'{mag}.txt').read_text(encoding='utf-8').splitlines():
        if ln.startswith('=== PAGE '):
            page = int(ln.split()[2]); continue
        n, _, t = ln.partition(' ')
        L[int(n[1:])] = t; pages[int(n[1:])] = page
    return L, pages

CLEAN = {'\u00ad': '', '\x07': '', '\ufb01': 'fi', '\ufb02': 'fl', '\ufb00': 'ff', '\ufb03': 'ffi', '\ufb04': 'ffl'}
def clean(t):
    for a, b in CLEAN.items(): t = t.replace(a, b)
    return t

def join(lines):
    out = ''
    for t in lines:
        t = t.strip()
        if not t: continue
        if not out: out = t
        elif out.endswith('-') and t[:1].islower(): out = out[:-1] + t
        else: out += ' ' + t
    out = re.sub(r'\s+', ' ', out).replace(' ,', ',').replace(' .', '.')
    return out.strip()

# pdftotext supprime le trait d'union des mots composés coupés en fin de ligne (« savoir-/faire » → « savoirfaire »).
# On le rétablit quand la forme avec trait d'union existe ailleurs dans les magazines.
_COMP = None
_CAP = {}
def compounds():
    global _COMP
    if _COMP is None:
        import collections
        hy, joined = collections.Counter(), collections.Counter()
        for f in glob.glob(str(W / '*.txt')):
            t = Path(f).read_text(encoding='utf-8')
            for m in re.finditer(r"(?<![\w-])([^\W\d_]{2,})-([^\W\d_]{2,})(?![\w-])", t): hy[m.group(1) + '-' + m.group(2)] += 1
        tot = collections.Counter()
        for k, n in hy.items(): tot[k.lower()] += n
        best = {}
        for k, n in sorted(hy.items(), key=lambda x: -x[1]): best.setdefault(k.lower(), k)   # graphie la plus fréquente (majuscules comprises)
        _COMP = {k.replace('-', ''): best[k] for k, n in tot.items() if n >= 2 and len(k) >= 8}
        global _CAP
        _CAP = {}
        for k in hy:
            a, b = k.split('-', 1)
            if b[:1].isupper(): _CAP.setdefault(k.lower().replace('-', ''), k)
    return _COMP
def fix_compounds(txt):
    C = compounds()
    def sub(m):
        w = m.group(0); h = C.get(w.lower())
        if not h: return w
        if w.isupper(): return h.upper()
        if any(ch.isupper() for ch in w[1:]) and w.lower() in _CAP: h = _CAP[w.lower()]   # « MonodPiguet » → « Monod-Piguet »
        return h[0].upper() + h[1:] if w[0].isupper() else h
    return re.sub(r"[^\W\d_]{8,}", sub, txt)

def words(s):
    s = unicodedata.normalize('NFKD', s.lower().replace('-', ''))
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.findall(r'[a-z0-9]+', s)

def build(mag):
    L, P = load_lines(mag)
    spec = json.loads((W / f'{mag}.out.json').read_text(encoding='utf-8'))
    todo = {a['slug']: a for a in json.loads((W / f'{mag}.todo.json').read_text(encoding='utf-8'))}
    dest = ROOT / 'data' / 'texts' / f'{mag}.json'
    data = json.loads(dest.read_text(encoding='utf-8')) if dest.exists() else {}
    report, ok = [], 0
    for slug, a in spec.items():
        if slug not in todo: report.append(f'INCONNU {slug}'); continue
        if a.get('skip'): report.append(f'SAUTÉ {slug} : {a["skip"]}'); continue
        blocks, used = [], set()
        bad = None
        for b in a.get('blocks', []):
            ids = []
            for r in b.get('l', []):
                r = r if isinstance(r, list) else [r, r]
                ids += list(range(int(r[0]), int(r[-1]) + 1))
            if any(i not in L for i in ids): bad = f'ligne hors fichier dans {slug}'; break
            raw = join([clean(L[i]) for i in ids])
            txt = fix_compounds(clean(b.get('x') or raw)).strip()
            if b.get('x'):
                ra, xa = words(raw), words(txt)
                sim = difflib.SequenceMatcher(None, ra, xa, autojunk=False).ratio() if ra else 0
                if sim < 0.92: bad = f'correction trop éloignée du PDF ({sim:.2f}) dans {slug} : {txt[:80]}'; break
            used.update(ids)
            t = {'lead': 'p', 'p': 'p', 'h': 'h', 'q': 'q'}.get(b.get('t', 'p'), 'p')
            if txt: blocks.append({'t': t, 'x': txt} | ({'lead': True} if b.get('t') == 'lead' else {}))
        if bad: report.append('REJETÉ ' + bad); continue
        nwords = sum(len(words(b['x'])) for b in blocks)
        if nwords < 40: report.append(f'TROP COURT {slug} ({nwords} mots)'); continue
        pages = sorted({P[i] for i in used})
        prev = data.get(slug, {})
        data[slug] = {'lang': a.get('lang', 'fr'), 'pages': todo[slug].get('printedPage') and f"p. {todo[slug]['printedPage']}" or '',
                      'pdfPages': pages, 'source': 'pdf', 'blocks': blocks}
        ok += 1
    missing = [s for s in todo if s not in spec]
    for s in missing: report.append(f'MANQUANT {s}')
    dest.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    (W / f'{mag}.report.txt').write_text('\n'.join(report) + '\n', encoding='utf-8')
    print(f'{mag:38} écrits={ok:3} / {len(todo):3}  problèmes={len(report)}')

mags = sys.argv[1:] or sorted(Path(f).name[:-9] for f in glob.glob(str(W / '*.out.json')))
for m in mags: build(m)
