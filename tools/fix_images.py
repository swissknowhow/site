"""Contrôle des photos : chaque photo d'article doit venir d'une page où l'article est imprimé.

- pages de l'article (numérotation PDF, base 1, comme les noms des photos pNNN) : data/texts (pdfPages)
  sinon data/pagemap.json ; une page voisine sans texte d'un autre article (page photo d'ouverture) est admise ;
- retire les éléments répétés sur ≥ 3 pages d'un même magazine (bandeaux, logos de rubrique) ;
- sans photo restante : la page du magazine est reproduite (docs/assets/pages/<mag>/pNNN.webp) ;
- fiches entreprise : photos des articles qui la concernent (sans les pages collectives de > 3 entreprises).
Entrée : data/images.json (extraction brute) ; sortie : data/images_final.json, lue par build.mjs.
Usage : python3 -I tools/fix_images.py
"""
import collections, glob, json, re, subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / 'data'
src = json.load(open(D / 'sources.json', encoding='utf-8'))
pm = json.load(open(D / 'pagemap.json', encoding='utf-8'))['articles']
raw = json.load(open(D / 'images.json', encoding='utf-8'))
texts = {Path(f).stem: json.load(open(f, encoding='utf-8')) for f in glob.glob(str(D / 'texts/*.json'))}
mags = {json.load(open(f, encoding='utf-8'))['slug']: json.load(open(f, encoding='utf-8')) for f in glob.glob(str(D / 'magazines/*.json'))}
PAT = re.compile(r'assets/img/([^/]+)/p(\d+)-([0-9a-f]+)\.webp$')

# éléments répétés (même image sur ≥ 3 pages d'un magazine)
seen = collections.defaultdict(set)
for kind in ('articles', 'companies'):
    for v in raw[kind].values():
        for s in v:
            m = PAT.match(s)
            if m: seen[(m.group(1), m.group(3))].add(int(m.group(2)))
recurring = {k for k, p in seen.items() if len(p) >= 3}

def pdf_path(mag):
    u = src.get(mag, {}).get('pdf', '')
    rel = u.split('swissknowhow.ch/', 1)[-1] if u else ''
    p = ROOT / 'docs' / rel
    return p if rel and p.exists() else None

def render(mag, page):
    out = ROOT / 'docs' / 'assets' / 'pages' / mag / f'p{page:03d}.webp'
    if not out.exists():
        pdf = pdf_path(mag)
        if not pdf: return ''
        out.parent.mkdir(parents=True, exist_ok=True)
        tmp = out.with_suffix('')
        subprocess.run(['pdftoppm', '-f', str(page), '-l', str(page), '-scale-to-x', '1000', '-scale-to-y', '-1', '-singlefile', '-png', str(pdf), str(tmp)], check=True, capture_output=True)
        im = Image.open(str(tmp) + '.png').convert('RGB'); im.save(out, 'WEBP', quality=80, method=6); Path(str(tmp) + '.png').unlink()
    return str(out.relative_to(ROOT / 'docs'))

OWNERS = collections.Counter(s for v in raw['articles'].values() for s in set(v))

def pages_of(mag, a):
    t = texts.get(mag, {}).get(a['slug'], {})
    if t.get('pdfPages'): base = set(t['pdfPages'])
    else:
        p = pm.get(f"{mag}:{a['slug']}")
        if not p: return set(), set(), set()
        base = set(p['pages'])
    # page voisine sans texte d'aucun autre article : page photo d'ouverture ou de fin
    other = TEXT_PAGES[mag] - base
    lines = LINES.get(mag, {})
    near = {q for b in base for q in (b - 1, b + 1) if q > 0 and q not in base and q not in other}
    photo = {q for q in near if lines.get(q, 99) <= 12}
    return base, photo, near - photo

# nombre de lignes de texte par page (work/texts/<mag>.txt) : une page photo n'en a presque pas
LINES = {}
for f in glob.glob(str(ROOT / 'work' / 'texts' / '*.txt')):
    cnt, pg = collections.Counter(), 0
    for ln in Path(f).read_text(encoding='utf-8').splitlines():
        if ln.startswith('=== PAGE '): pg = int(ln.split()[2]); cnt[pg] += 0
        else: cnt[pg] += 1
    LINES[Path(f).stem] = cnt

TEXT_PAGES = collections.defaultdict(set)
for mag, d in texts.items():
    for v in d.values(): TEXT_PAGES[mag].update(v.get('pdfPages') or [])

out = {'articles': {}, 'companies': {}, 'pageImages': {}}
stats = collections.Counter()
for mag, m in mags.items():
    for a in m.get('articles', []):
        k = f"{mag}:{a['slug']}"
        base, extra, near = pages_of(mag, a) if pages_of(mag, a)[0] else (set(), set(), set())
        pages = base | extra
        imgs = []
        for s in raw['articles'].get(k, []):
            mm = PAT.match(s)
            if not mm: continue
            if (mm.group(1), mm.group(3)) in recurring: stats['répété'] += 1; continue
            pg = int(mm.group(2))
            # page voisine avec du texte (index, sommaire…) : la photo n'est gardée que si l'extraction l'a attribuée à ce seul article
            if pages and pg not in pages and not (pg in near and OWNERS[s] <= 1): stats['hors page'] += 1; continue
            imgs.append(s)
        if imgs: out['articles'][k] = imgs; stats['articles avec photos'] += 1
        elif base and a.get('type') != 'annonce':
            r = render(mag, min(base))
            if r: out['pageImages'][k] = r; stats['page reproduite'] += 1
        else: stats['sans rien'] += 1
    for c in m.get('companies', []):
        ck = f"{mag}:{c['slug']}"
        mine = [a for a in m.get('articles', []) if c['slug'] in (a.get('companies') or []) and len(a.get('companies') or []) <= 3]
        imgs = []
        for a in mine: imgs += out['articles'].get(f"{mag}:{a['slug']}", [])
        imgs = list(dict.fromkeys(imgs))
        if imgs: out['companies'][ck] = imgs[:12]
        else:
            pg = [out['pageImages'][f"{mag}:{a['slug']}"] for a in mine if f"{mag}:{a['slug']}" in out['pageImages']]
            if pg: out['pageImages'][ck] = pg[0]
json.dump(out, open(D / 'images_final.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(dict(stats), 'fiches avec photos :', len(out['companies']))
