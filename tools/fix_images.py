"""Contrôle des photos : chaque photo d'article doit venir d'une page où l'article est imprimé.

- pages de l'article : data/texts (pdfPages, base 1, issus du texte intégral) sinon data/pagemap.json (base 0) ;
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

def render(mag, page0):
    out = ROOT / 'docs' / 'assets' / 'pages' / mag / f'p{page0:03d}.webp'
    if not out.exists():
        pdf = pdf_path(mag)
        if not pdf: return ''
        out.parent.mkdir(parents=True, exist_ok=True)
        tmp = out.with_suffix('')
        subprocess.run(['pdftoppm', '-f', str(page0 + 1), '-l', str(page0 + 1), '-scale-to-x', '1000', '-scale-to-y', '-1', '-singlefile', '-png', str(pdf), str(tmp)], check=True, capture_output=True)
        im = Image.open(str(tmp) + '.png').convert('RGB'); im.save(out, 'WEBP', quality=80, method=6); Path(str(tmp) + '.png').unlink()
    return str(out.relative_to(ROOT / 'docs'))

def pages_of(mag, a):
    t = texts.get(mag, {}).get(a['slug'], {})
    if t.get('pdfPages'): return {p - 1 for p in t['pdfPages']}, 'texte'
    p = pm.get(f"{mag}:{a['slug']}")
    return (set(p['pages']), 'pagemap') if p else (set(), '')

out = {'articles': {}, 'companies': {}, 'pageImages': {}}
stats = collections.Counter()
for mag, m in mags.items():
    for a in m.get('articles', []):
        k = f"{mag}:{a['slug']}"
        pages, how = pages_of(mag, a)
        imgs = []
        for s in raw['articles'].get(k, []):
            mm = PAT.match(s)
            if not mm: continue
            if (mm.group(1), mm.group(3)) in recurring: stats['répété'] += 1; continue
            if pages and int(mm.group(2)) not in pages: stats['hors page'] += 1; continue
            imgs.append(s)
        if imgs: out['articles'][k] = imgs; stats['articles avec photos'] += 1
        elif pages and a.get('type') != 'annonce':
            r = render(mag, min(pages))
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
