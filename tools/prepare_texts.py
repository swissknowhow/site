"""Prépare l'extraction des textes intégraux : texte brut des PDF, page par page, lignes numérotées.

Sortie : work/texts/<magazine>.txt (=== PAGE n === puis « L<num> texte ») et <magazine>.todo.json
(articles sans texte intégral, avec titre, entreprises, page imprimée et pages PDF connues, en base 1).
Usage : python3 -I tools/prepare_texts.py
"""
import glob, json, os, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'work' / 'texts'
OUT.mkdir(parents=True, exist_ok=True)
src = json.load(open(ROOT / 'data/sources.json', encoding='utf-8'))
pm = json.load(open(ROOT / 'data/pagemap.json', encoding='utf-8'))['articles']
texts = {Path(f).stem: json.load(open(f, encoding='utf-8')) for f in glob.glob(str(ROOT / 'data/texts/*.json'))}

for f in sorted(glob.glob(str(ROOT / 'data/magazines/*.json'))):
    m = json.load(open(f, encoding='utf-8')); s = m['slug']
    todo = [a for a in m['articles'] if a.get('type') != 'annonce' and a['slug'] not in texts.get(s, {})]
    pdf = src.get(s, {}).get('pdf', '')
    rel = pdf.split('swissknowhow.ch/', 1)[-1] if pdf else ''
    p = ROOT / 'docs' / rel
    if not todo or not rel or not p.exists():
        continue
    comp = {c['slug']: c.get('name', '') for c in m.get('companies', [])}
    n = int([l for l in subprocess.run(['pdfinfo', str(p)], capture_output=True, text=True).stdout.splitlines() if l.startswith('Pages:')][0].split()[1])
    lines, num = [], 0
    for pg in range(1, n + 1):
        t = subprocess.run(['pdftotext', '-f', str(pg), '-l', str(pg), '-enc', 'UTF-8', str(p), '-'], capture_output=True, text=True).stdout
        lines.append(f'=== PAGE {pg} ===')
        for ln in t.splitlines():
            ln = ln.strip()
            if not ln:
                continue
            num += 1
            lines.append(f'L{num} {ln}')
    (OUT / f'{s}.txt').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    items = []
    for a in todo:
        k = f'{s}:{a["slug"]}'
        items.append({'slug': a['slug'], 'type': a.get('type'), 'title': a.get('title'), 'subtitle': a.get('subtitle', ''),
                      'companies': [comp.get(c, c) for c in a.get('companies', [])], 'printedPage': a.get('page', ''),
                      'pdfPages': [x + 1 for x in pm[k]['pages']] if k in pm else []})
    (OUT / f'{s}.todo.json').write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{s:38} pages={n:4} lignes={num:6} articles={len(items)}')
