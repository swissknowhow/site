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

## 2026-11-11

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis.
- Audit SEO : 0 page sans titre/description/canonical, h1 unique, 0 image sans alt, JSON-LD valide, 0 orpheline, sitemap ↔ pages cohérents.
- Pris en compte depuis hier (commits humains) : titres ≤ 70 car. quand la marque tient, 3 fiches corrigées, mesure d'audience Umami (exception autorisée, non touchée).

**Problèmes relevés**
- 405 titres > 70 car., dont 110 allongés par le suffixe d'édition ajouté hier (ex. « … (Horlogerie 2019) »).
- 4 titres encore dupliqués (même édition et même année : Stadt Solothurn ×2, Énergies nouvelles Vaud, ZHK – Direktion).
- Descriptions < 70 car. sur /articles/, /magazines/ (et /recherche/, noindex) : mineur, inchangé.

**Correction faite (tools/build.mjs)**
- Titres d'articles en doublon : si « (Série Année) » fait dépasser 70 car. et que l'année suffit à distinguer les éditions, seule l'année est ajoutée, ex. « Aiguilla SA – … (2019) ». Titres > 70 : 405 → 361 ; doublons : 4 (inchangé) ; 104 pages d'articles régénérées, aucune autre.

**Rotation sites d'entreprises** (654 liens « Site web » ; 30 fiches de `amt-fuer-staedtebau-winterthur` à `b-braun-medical`)
- En panne (404/410 ou domaine inexistant) : aucun. Pas de recherche Zefix nécessaire.
- Non vérifiables depuis la session (DNS résolu, mais erreur TLS / délai / 502 du proxy après 2 essais) : amt-fuer-staedtebau-winterthur (bau.winterthur.ch), apex-tool-switzerland, aqc, arcam, astuto, atmos-medical.
- OK (200) : les 24 autres.
- Reprise au prochain passage : première fiche après `b-braun-medical` dans l'ordre alphabétique.

**Actions humaines requises**
- Facultatif : les 4 doublons restants pourraient être distingués par la personne interviewée (ex. « Énergies nouvelles Vaud – Patrick Chiche ») ; à valider avant de le faire.
- Les 361 titres > 70 car. restants sont des titres d'articles longs en eux-mêmes : les raccourcir supposerait de réécrire des titres (hors autonomie).
