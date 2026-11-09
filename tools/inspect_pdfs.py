"""Inspection du contenu actif des PDF publiés (JavaScript, actions automatiques, formulaires, fichiers joints).

Nécessite pypdf : python3 -m venv .venv && .venv/bin/pip install pypdf && .venv/bin/python tools/inspect_pdfs.py
"""
import glob
import sys
from pypdf import PdfReader
from pypdf.generic import IndirectObject

from pathlib import Path
ROOT = str(Path(__file__).resolve().parent.parent / 'docs' / 'wp-content' / 'uploads')


def R(o):
    return o.get_object() if isinstance(o, IndirectObject) else o


def walk_names(node, out, depth=0):
    node = R(node)
    if depth > 20 or node is None:
        return
    if '/Names' in node:
        arr = R(node['/Names'])
        for i in range(0, len(arr), 2):
            out.append((str(arr[i]), R(arr[i + 1])))
    for k in R(node.get('/Kids', [])) or []:
        walk_names(k, out, depth + 1)


for f in sorted(glob.glob(ROOT + '/**/*.pdf', recursive=True)):
    name = f.split('uploads/')[1]
    try:
        r = PdfReader(f)
    except Exception as e:
        print(f'{name}: illisible ({e})')
        continue
    cat = r.trailer['/Root']
    found = []
    oa = cat.get('/OpenAction')
    if oa is not None:
        oa = R(oa)
        if isinstance(oa, dict) and oa.get('/S') in ('/JavaScript', '/Launch', '/SubmitForm', '/ImportData', '/GoToE', '/URI'):
            found.append(f"OpenAction {oa.get('/S')}")
    if '/AA' in cat:
        found.append('AA (actions automatiques du document)')
    names = R(cat.get('/Names'))
    if names:
        if '/JavaScript' in names:
            js = []
            walk_names(names['/JavaScript'], js)
            for n, a in js:
                code = R(a.get('/JS'))
                txt = code.get_data().decode('latin-1', 'replace') if hasattr(code, 'get_data') else str(code)
                found.append(f"JavaScript « {n} » : {txt.strip()[:160]!r}")
        if '/EmbeddedFiles' in names:
            ef = []
            walk_names(names['/EmbeddedFiles'], ef)
            for n, spec in ef:
                fs = R(spec)
                fname = fs.get('/UF') or fs.get('/F') or n
                emb = R(R(fs.get('/EF', {})).get('/F')) if fs.get('/EF') else None
                size = len(emb.get_data()) if emb is not None else 0
                found.append(f"Fichier joint « {fname} » ({size} octets)")
    if '/AcroForm' in cat and R(cat['/AcroForm']).get('/XFA'):
        found.append('Formulaire XFA')
    for i, page in enumerate(r.pages, 1):
        if '/AA' in page:
            found.append(f'page {i} : actions automatiques')
        for an in R(page.get('/Annots', [])) or []:
            an = R(an)
            for key in ('/A', '/AA'):
                act = R(an.get(key))
                if isinstance(act, dict):
                    acts = [act] if key == '/A' else [R(v) for v in act.values()]
                    for a in acts:
                        if isinstance(a, dict) and a.get('/S') in ('/JavaScript', '/Launch', '/SubmitForm', '/ImportData', '/GoToE'):
                            found.append(f"page {i} : annotation {a.get('/S')}")
            if an.get('/Subtype') == '/FileAttachment':
                found.append(f'page {i} : pièce jointe en annotation')
    print(f"{name[-58:]:60} {'OK' if not found else ''}")
    for x in found:
        print('     ⚠', x)
