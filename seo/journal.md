# Journal de l'agent SEO quotidien

## 2026-11-10

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis.
- Audit SEO (docs/) : 0 page sans titre/description/canonical, h1 unique partout, 0 image sans alt, JSON-LD valide, 0 page orpheline, sitemap ↔ pages cohérents (hors noindex : /404.html, /recherche/ ; 38 redirections).

**Problèmes relevés**
- 59 titres dupliqués (articles republiés d'une édition à l'autre, ex. « Aiguilla SA – … » 2019/2020).
- 1360 titres > 70 caractères (titres d'articles longs + « · Swiss Knowhow ») : non traité, à arbitrer (voir ci-dessous).
- Descriptions < 70 car. sur /articles/ (59), /magazines/ (49), /recherche/ (41, noindex) : mineur.

**Correction faite (tools/build.mjs)**
- Titre `<title>` des articles dont l'intitulé existe plusieurs fois : ajout de l'édition, ex. « Aiguilla SA – … (Horlogerie 2019) ». Doublons : 59 → 4. Contenu, h1 et JSON-LD inchangés. Contrepartie : +37 titres > 70 car.
- 4 doublons restants : même série et même année dans deux éditions régionales (Stadt Solothurn ×2, Énergies nouvelles Vaud, ZHK – Direktion).

**Rotation sites d'entreprises** (655 liens « Site web » ; fiches 1 à 30 par ordre alphabétique, de `2b8` à `amt-fuer-kultur-und-sport-solothurn`)
- En panne (domaine inexistant, NXDOMAIN) : abarthel (www.abarthel.ch), agg-bern (www.bve.be.ch), amt-fuer-kultur-und-sport-solothurn (www.aks.so.ch).
- Non vérifiables depuis la session (délai dépassé / TLS / 403 anti-robot / 502, DNS résolu) : a-a-z-emplois, a-carre-architecture-amenagement, adax, adhezion (403), admo-plastique, adtime, aee-suisse (403), afdt, agosi-allgemeine-suisse, alexion-pharma-international (502), alpiq-intec-ticino.
- OK (200) : les 16 autres.
- Reprise au prochain passage : fiche n° 31 (`amt-fuer-staedtebau-winterthur`).

**Actions humaines requises**
- Vérifier/remplacer les sites web de abarthel, agg-bern (l'office BVE bernois a été réorganisé, domaine www.bve.be.ch disparu) et amt-fuer-kultur-und-sport-solothurn. L'agent ne modifie pas les coordonnées.
- Décider de la politique sur les titres > 70 car. (ex. ne plus suffixer « · Swiss Knowhow » sur les articles, ou tronquer au mot) : changement massif, pas fait en autonomie.
