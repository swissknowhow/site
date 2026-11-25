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

## 2026-11-12

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : 0 page sans titre/description/canonical, h1 unique, 0 image sans alt, JSON-LD valide, 0 orpheline, sitemap ↔ pages cohérents. Titres > 70 car. : 361 (inchangé) ; doublons : 4 (inchangé).

**Problèmes relevés**
- Meta descriptions trop courtes sur /articles/ (59 car.) et /magazines/ (49 car.).

**Correction faite (tools/build.mjs)**
- Descriptions complétées sans changer les faits : /articles/ « … publireportages Swiss Knowhow sur les entreprises suisses, à filtrer par thème, type et magazine. » (124 car.) ; /magazines/ « … : horlogerie, économie régionale, collectivités, santé, énergie, grands travaux. » (128 car., séries réellement présentes dans data/magazines). Descriptions < 70 car. restantes : /recherche/ et /404.html (noindex). 2 pages régénérées.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `ba-consulting` à `bonalumi-e-ferrari`)
- En panne :
  - ba-consulting (BA ConsultinG SA, Etagnières) : https://www.architectes.ch/baconsulting → 404 (la page n'existe plus sur l'annuaire architectes.ch). Zefix : pas de « BA ConsultinG SA » à Etagnières ; « B.A. Consulting SA », Crissier, CHE-107.991.215, active. Probablement la même société, à confirmer.
  - bcp-tourbillons (BCP Tourbillons SA, La Chaux-de-Fonds) : www.bcpsa.ch → domaine inexistant (NXDOMAIN). Zefix : BCP Tourbillons SA, La Chaux-de-Fonds, CHE-480.215.236, active. Société toujours inscrite, site à retrouver.
- Non vérifiables depuis la session (erreur TLS/proxy après 2 essais, DNS en échec temporaire ou 403 anti-robot) : bandi, bates, bbp (DNS SERVFAIL), bm-entreprise-du-batiment, baselworld (403), bergauer (403).
- OK (200) : les 22 autres.
- Reprise au prochain passage : première fiche après `bonalumi-e-ferrari`.

**Actions humaines requises**
- Trouver le site actuel de BCP Tourbillons SA et de BA ConsultinG / B.A. Consulting SA (vérifier si c'est bien la société de Crissier), puis mettre à jour les fiches. L'agent ne modifie pas les coordonnées.
- baselworld : le salon a pris fin en 2020 (fait connu, non vérifié ici) ; à vérifier si la fiche doit le signaler.
- Toujours en attente : arbitrage des 4 titres en doublon (nom de la personne interviewée ?).

## 2026-11-13

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : inchangé (titres > 70 car. : 361, doublons : 4, descriptions < 70 car. : /recherche/ et /404.html seulement, tous deux noindex).
- Contexte (session du 12/11 avec l'éditeur) : sitemap soumis dans Google Search Console et Bing Webmaster Tools. Au 9/11, Google n'avait indexé que 50 URL, toutes de l'ancien WordPress (PDF, anciennes pages, dossiers du thème Divi). Point prévu le 3/12.

**Correction faite (tools/build.mjs)**
- Pages de redirection des anciennes URL WordPress (38) : `<link rel="canonical">` désormais en URL absolue (`https://swissknowhow.ch/contact/` au lieu de `../contact/`), comme le recommande Google ; le meta refresh et le lien « continuer » restent relatifs. 38 pages régénérées, aucune autre.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `bovard` à `cett-heig-vd`)
- En panne :
  - canton-de-vaud-affaires-exterieures : page www.vd.ch/…/affaires-exterieures → 404 (site vd.ch en ligne, page déplacée). Administration publique, pas de recherche Zefix.
  - ceff-industrie : www.ceff.ch/ceff-industrie → 404 (www.ceff.ch en ligne). École publique, pas de recherche Zefix.
  - cett-heig-vd : www.heig-vd.ch/rad/cett → 404 (www.heig-vd.ch en ligne). Institut de haute école, pas de recherche Zefix.
  - bp-conseils (Genève) : www.bp-conseils.ch → domaine inexistant. Zefix : « BP Conseils, Brigitte Philips », Genève, CHE-201.995.669, **radiée le 2024-03-01**.
  - centre-laser-victor-hugo : www.operation-presbytie.com → domaine inexistant. Zefix : aucune entreprise correspondante (probablement un centre français ; le téléphone de la fiche, « +41 (0)15 573 02 02 », ressemble à un numéro parisien mal converti).
- Non vérifiables (TLS/proxy après 2 essais, DNS résolu) : bryek-horlogerie, casabat, brain-and-behaviour-laboratory, brasport ; celio-costruzioni répond 500 (erreur du serveur, peut-être passagère).
- OK (200) : les 21 autres.
- Reprise au prochain passage : première fiche après `cett-heig-vd`.

**Actions humaines requises**
- bp-conseils : société radiée en 2024, décider du sort de la fiche (mention « radiée », comme pour ABarthel ?).
- centre-laser-victor-hugo : vérifier le site actuel et le numéro de téléphone (format suspect).
- Mettre à jour les liens des 3 institutions publiques (Vaud, ceff, HEIG-VD) vers leurs nouvelles pages.
- À trancher : les pages de redirection portent à la fois `noindex` et une canonical, deux signaux contradictoires pour Google ; retirer le `noindex` serait plus propre (non fait, en attente d'accord).

## 2026-11-14

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : inchangé (titres > 70 car. : 361, doublons : 4, descriptions < 70 car. : /recherche/ et /404.html, noindex).
- comconsulting.ch : toujours la page « en construction » d'OVH (redirection pas encore en place).

**Problème relevé**
- Le JSON-LD `Article` des 1184 articles ne contenait que `headline`, `description` et `isPartOf` : ni URL, ni image, ni éditeur, ni langue.

**Correction faite (tools/build.mjs)**
- JSON-LD `Article` complété : `url` et `mainEntityOfPage` (URL canonique), `image` (URL absolue, seulement pour les 704 articles qui ont une image ; 704/704 fichiers vérifiés présents), `inLanguage: fr`, `publisher` (Organization « Com Consulting Sàrl », url du site). Aucune date inventée (seule l'année de l'édition, déjà présente dans `isPartOf`). 1184 pages régénérées, une seule ligne modifiée par page (le bloc JSON-LD) ; 0 JSON-LD invalide.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `cff-infrastructure-region-sud` à `comptoir-immobilier`)
- En panne (404/410 ou domaine inexistant) : aucun. Pas de recherche Zefix nécessaire.
- Non vérifiables (DNS résolu ; délai, erreur TLS du proxy ou 403 anti-robot après 2 essais) : cinelec, cifom, citroen-suisse-geneve, cff-infrastructure-region-sud (403, ffs.ch), cff-leman-2030 (403, sbb.ch).
- OK (200) : les 25 autres.
- Reprise au prochain passage : première fiche après `comptoir-immobilier`.

**Actions humaines requises**
- Rien de nouveau. Restent en attente : fiches bp-conseils (radiée) et centre-laser-victor-hugo (site et téléphone), liens des 3 institutions publiques en 404, doublon `noindex` + canonical sur les pages de redirection, redirection comconsulting.ch.

## 2026-11-15

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : inchangé (titres > 70 car. : 361, doublons : 4, descriptions < 70 car. : /recherche/ et /404.html, noindex).
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Problème relevé**
- Les 31 pages de magazines n'avaient aucun JSON-LD.

**Correction faite (tools/build.mjs)**
- JSON-LD `PublicationIssue` ajouté sur chaque page de magazine : nom, description, URL, année de parution, langues, couverture, éditeur (Com Consulting Sàrl), `isPartOf` Periodical « Swiss Knowhow » et, quand le PDF est public, `encoding` MediaObject (URL absolue, application/pdf). Vérifié : 31 JSON-LD valides, 30 PDF présents sur le site (le 31e numéro n'a pas de PDF public, donc pas d'`encoding`), toutes les couvertures présentes. 31 pages régénérées, une ligne ajoutée par page.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `concept-cnc-design` à `demhosa`)
- En panne (404/410 ou domaine inexistant) : aucun.
- Non vérifiables (DNS résolu ; erreur TLS ou 502 du proxy après 2 essais) : concept-cnc-design, cornu-cie, corum, cronal, ctm-centre-de-technologies-microtechniques, cyberis, d-tec-dubois, demhosa.
- darwin-airline (Lugano) : le site répond 406 (refus du serveur, non vérifiable). Pour information, Zefix : « Darwin Airline SA in liquidazione », Lugano, CHE-110.176.084, **en liquidation**.
- OK (200) : les 21 autres.
- Reprise au prochain passage : première fiche après `demhosa`.

**Actions humaines requises**
- darwin-airline : société en liquidation au registre du commerce ; décider du sort de la fiche (comme bp-conseils, radiée).
- Toujours en attente : bp-conseils, centre-laser-victor-hugo, liens des 3 institutions publiques en 404, `noindex` + canonical sur les pages de redirection, redirection comconsulting.ch.

## 2026-11-16

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : inchangé (titres > 70 car. : 361, doublons : 4, descriptions < 70 car. : /recherche/ et /404.html, noindex).
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Problème relevé**
- La page d'accueil n'avait aucun JSON-LD (identité du site et de l'éditeur absente des données structurées).

**Correction faite (tools/build.mjs)**
- JSON-LD `WebSite` sur l'accueil : nom, URL, langue, description, et `publisher` Organization Com Consulting Sàrl avec les coordonnées déjà publiées sur /contact/ (constante `PUBLISHER`). Pas de `SearchAction` (abandonnée par Google). JSON-LD valide ; 1 page régénérée, 1 ligne modifiée.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `departement-chemie-universitat-basel` à `effitec`)
- En panne :
  - departement-de-physiologie-unil : www.unil.ch/physiologie → 404 (www.unil.ch en ligne). Université, pas de recherche Zefix.
  - departement-economie-sport-vaud : www.vd.ch/decs → 404 (www.vd.ch en ligne). Administration, pas de recherche Zefix.
  - dgmr-vaud : www.vd.ch/…/dirh/dgmr → 404. Administration, pas de recherche Zefix.
  - departement-de-medecine-genetique-et-developpement-unige : medgen.unige.ch → domaine inexistant (www.unige.ch en ligne). Université, pas de recherche Zefix.
  - ecole-francaise-de-berne (Berne) : www.ecole-francaise-de-berne.ch → domaine inexistant. Zefix : seule « Association de l'Ecole Française de Berne », CHE-109.989.057, **radiée le 2013-12-12** ; l'école peut être exploitée par une autre entité, à vérifier.
  - ecole-minerva (Lausanne) : www.ecole-minerva.ch → domaine inexistant. Zefix : « Ecole Minerva S.à r.l. », Lausanne, CHE-107.035.709, **active** ; site à retrouver.
- Non vérifiables (DNS résolu ; erreur TLS/proxy ou 503 après 2 essais) : des-systemes-de-securite, dssa-dumont-schneider, dm-surfaces (503).
- OK (200) : les 21 autres.
- Reprise au prochain passage : première fiche après `effitec`.

**Actions humaines requises**
- Retrouver les nouvelles adresses : École Minerva (active), École française de Berne (statut à vérifier), et les pages déplacées de l'UNIL, de l'UNIGE et de l'État de Vaud (DECS, DGMR). Les liens vd.ch cassés commencent à s'accumuler (4 fiches) : une passe groupée sur les fiches « Canton de Vaud » serait efficace.
- Toujours en attente : darwin-airline (en liquidation), bp-conseils (radiée), centre-laser-victor-hugo, `noindex` + canonical sur les redirections, redirection comconsulting.ch.

## 2026-11-17

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : inchangé (titres > 70 car. : 361, doublons : 4, descriptions < 70 car. : /recherche/ et /404.html, noindex).
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Problème relevé**
- Le fil d'Ariane existait en HTML sur toutes les pages internes mais pas en données structurées.

**Correction faite (tools/build.mjs)**
- JSON-LD `BreadcrumbList` généré automatiquement à partir du fil d'Ariane HTML (même libellés, URL absolues ; dernier élément sans URL, comme Google l'autorise). Vérifié : 2019 pages concernées, exactement une `BreadcrumbList` sur chaque page qui affiche un fil d'Ariane et aucune ailleurs (accueil, 404), toutes les URL pointent vers une page existante. Diff : 2019 fichiers, 1 ligne ajoutée chacun, rien d'autre.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `eichenberger-futuretech` à `fart`)
- En panne :
  - eichenberger-futuretech (Baar) : www.eb-futuretech.ch → domaine inexistant. Zefix : « Eichenberger Futuretech AG in Liquidation », Baar, CHE-406.513.346, **radiée le 2019-12-19**.
  - ensemble-hospitalier-de-la-cote (Morges) : www.ehc.vd.ch → domaine inexistant. Zefix : Ensemble Hospitalier de la Côte, Morges, CHE-105.940.939, **actif**. Le domaine www.ehc-vd.ch répond 200 : probablement le nouveau site, à confirmer.
- Non vérifiables (DNS résolu ; délai ou erreur TLS du proxy après 2 essais) : engie-services, endetec-neroxis, fart (www.centovalli.ch).
- OK (200) : les 25 autres.
- Reprise au prochain passage : première fiche après `fart`.

**Actions humaines requises**
- eichenberger-futuretech : société radiée en 2019, décider du sort de la fiche.
- ensemble-hospitalier-de-la-cote : vérifier puis remplacer le lien par www.ehc-vd.ch.
- Toujours en attente : écoles Minerva et EFB, liens UNIL/UNIGE/vd.ch (4 fiches), darwin-airline, bp-conseils, centre-laser-victor-hugo, `noindex` + canonical sur les redirections, redirection comconsulting.ch.

## 2026-11-18

**Consignes et contexte**
- `seo/AGENT.md` modifié : interdiction de modifier, résumer ou réécrire les textes des articles (`data/texts`, texte de l'édition imprimée validé par les entreprises) et de réintroduire images ou résumés IA. Appliqué.
- Gros commit humain du 17/11 (`edb0fb5d`) : texte intégral imprimé pour 1 175 articles, photos contrôlées, retrait des images et résumés IA. Les meta descriptions sont désormais un extrait du texte imprimé.

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis.
- Audit SEO : titres > 70 car. 361, titres en double 4 (inchangés). Nouveau : **739 meta descriptions dupliquées** (718 entre une fiche entreprise et son article, la fiche reprenant le même extrait ; 21 entre articles republiés) et 35 descriptions < 70 car. (annonces au texte très court, plus /404.html).
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Correction faite (tools/build.mjs)**
- Meta description des fiches entreprises : « Nom, Ville : » suivi du début du texte imprimé (coupé au mot, ≤ 155 car.), au lieu du même extrait que l'article. Aucun texte réécrit ni résumé : seuls le nom et la ville, déjà sur la fiche, sont ajoutés devant. Doublons : 739 → 54 (restent uniquement des articles republiés à l'identique d'une édition à l'autre). 750 fiches régénérées, seules les lignes description / og:description changent.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `fasmed` à `geotherm`)
- En panne (domaine inexistant) :
  - fondation-osirix (Genève) : www.foundation.osirixfoundation.com → inexistant. Zefix : Fondation OsiriX, Genève, CHE-114.620.706, **active**. www.osirixfoundation.com répond 200 : lien probablement à corriger (sous-domaine erroné).
  - gems-world-academy-etoy (Etoy) : www.gemsworldacademy-etoy.com → inexistant. Zefix : « GEMS World Academy SA en liquidation », Etoy, CHE-338.023.933, **en liquidation**.
- Non vérifiables : frigaz (DNS en échec temporaire), gainerie-moderne, genevaccord (erreur TLS du proxy), ferring (403 anti-robot).
- OK (200) : les 24 autres.
- Reprise au prochain passage : première fiche après `geotherm`.

**Actions humaines requises**
- fondation-osirix : vérifier puis corriger le lien en https://www.osirixfoundation.com/.
- gems-world-academy-etoy : école en liquidation, décider du sort de la fiche.
- À trancher : les 54 descriptions encore dupliquées concernent des articles republiés mot pour mot (ex. Meyer Sintermetall 2015-2018). Proposition : ajouter l'édition en tête de description, comme pour les titres, ou désigner une édition de référence par canonical.
- Toujours en attente : ehc (nouveau lien probable www.ehc-vd.ch), eichenberger (radiée), écoles Minerva et EFB, liens UNIL/UNIGE/vd.ch, darwin-airline, bp-conseils, centre-laser-victor-hugo, `noindex` + canonical sur les redirections, redirection comconsulting.ch.

## 2026-11-19

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : titres > 70 car. 361, titres en double 4, descriptions < 70 car. 35 (annonces au texte court + /404.html), descriptions en double 54.
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Correction faite (tools/build.mjs)**
- Meta description des articles dont l'extrait imprimé est identique à celui d'un autre article (texte republié d'une édition à l'autre) : l'édition est placée en tête, ex. « Horlogerie 2016 : Meyer Sintermetall est une des rares… ». Texte imprimé inchangé, seule l'édition est ajoutée devant. Descriptions en double : 54 → 1 (Stadt Solothurn – Kurt Fluri, même édition et même année dans deux éditions régionales). 141 articles régénérés, seules les lignes description / og:description changent.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `gepy-papaux` à `henri-badoux`)
- En panne :
  - hastag-zuerich (Birmensdorf) : www.hastag.ch redirige vers une page Jura Materials qui répond 404. Zefix : « HASTAG (Zürich) AG », Birmensdorf, CHE-105.874.811, **radiée le 2012-06-20** ; ses succursales radiées en 2020. Activité probablement reprise par Jura Materials (déduit de la redirection, non vérifié).
  - gs-time (Dongio) : www.gstime-watches.ch → domaine inexistant. Zefix : « GS Time Sagl in liquidazione », Acquarossa, CHE-221.525.858, **radiée le 2024-04-30**.
  - guillod-gunther (La Chaux-de-Fonds) : www.guillod-gunther.ch → domaine inexistant. Zefix : « Guillod-Günther S.A. en liquidation », CHE-101.935.307, **radiée le 2022-05-09**.
- Non vérifiables : griffes-consulting (erreur TLS du proxy), groupe-e (403 anti-robot).
- OK (200) : les 25 autres.
- Reprise au prochain passage : première fiche après `henri-badoux`.

**Actions humaines requises**
- Trois sociétés radiées de plus (HASTAG Zürich, GS Time, Guillod-Günther). Avec bp-conseils, eichenberger (radiées), darwin-airline et gems (en liquidation), cela fait 7 fiches d'entreprises disparues en 6 jours de rotation : une règle générale serait utile (mention « Société radiée » sur la fiche, comme pour ABarthel ?).
- Toujours en attente : liens OsiriX et EHC à corriger, écoles Minerva et EFB, liens UNIL/UNIGE/vd.ch, centre-laser-victor-hugo, `noindex` + canonical sur les redirections, redirection comconsulting.ch.

## 2026-11-20

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : titres > 70 car. 361, titres en double 4, descriptions en double 1. Descriptions < 70 car. : 35 (24 fiches entreprises sans article complet, réduites au nom, parfois avec « Non précisé » ou la ville répétée ; 9 annonces/articles très courts ; /recherche/).
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Correction faite (tools/build.mjs)**
- Description de repli des fiches entreprises sans article complet (`companyFallbackDescription`) : nom, secteur (sauf « Non précisé »), ville (sauf si déjà dans le nom), puis uniquement ce que la fiche affiche réellement : « coordonnées » si adresse/téléphone/e-mail, « site web » si lien, et le nombre d'éditions où l'entreprise paraît. Ex. « B. Braun Medical AG — Produits et services médicaux, Sempach : coordonnées, site web et parution dans les magazines Swiss Knowhow. » Descriptions < 70 car. : 35 → 24 (restent les noms très courts et les annonces, dont le texte imprimé ne peut pas être allongé). 35 fiches régénérées, seules les lignes description / og:description changent.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `henri-robert` à `incabloc`)
- En panne :
  - hestia-constructions (Carouge) : www.hestia.ch → domaine inexistant. Zefix : « HESTIA CONSTRUCTIONS SA », Plan-les-Ouates, CHE-116.281.242, **radiée le 2022-06-29** (probablement la même société après déménagement, non certain).
  - imh (Le Locle) : imhsa.ch → domaine inexistant. Zefix : « I.M.H. Innovations Manufactures Horlogères SA, en liquidation », La Chaux-de-Fonds, CHE-113.657.380, **radiée le 2025-05-13**.
  - iffp (Lausanne) : www.iffp.swiss → domaine inexistant ; www.iffp.ch répond 200 (l'institut a été renommé HEFP, fait connu non vérifié ici). Institution fédérale, pas de recherche Zefix.
  - hiv-biel-seeland : page www.bern-cci.ch/biel-seeland/… → 404 (www.bern-cci.ch en ligne). Association patronale, page déplacée.
- Non vérifiables (DNS résolu ; erreur TLS/proxy ou 403) : hopitaux-universitaires-de-geneve, hygin-debons, ibaarau, id-imagerie-developpement, il-falegname-fabrizio, hktdc (403).
- OK (200) : les 20 autres.
- Reprise au prochain passage : première fiche après `incabloc`.

**Actions humaines requises**
- Deux sociétés radiées de plus (Hestia Constructions, IMH) : 9 fiches d'entreprises disparues en 7 jours de rotation.
- Liens à mettre à jour : IFFP (www.iffp.ch ou nouveau site HEFP), HIV Biel-Seeland (nouvelle page bern-cci.ch).
- Toujours en attente : liens OsiriX et EHC, écoles Minerva et EFB, liens UNIL/UNIGE/vd.ch, centre-laser-victor-hugo, règle pour les sociétés radiées, `noindex` + canonical sur les redirections, redirection comconsulting.ch.

## 2026-11-21

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : inchangé (titres > 70 car. 361, titres en double 4, descriptions en double 1, descriptions < 70 car. 24).
- Maillage interne mesuré : toutes les fiches entreprises ont ≥ 3 liens entrants, les magazines ≥ 3 ; seuls 7 annonces n'ont qu'un lien (depuis leur magazine), ce qui est voulu.
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Problème relevé**
- JSON-LD `Organization` des fiches : `addressCountry` en toutes lettres (« Suisse » ×739, « France » ×2, « Hong Kong » ×1) au lieu du code ISO 3166-1 attendu par schema.org/Google.

**Correction faite (tools/build.mjs)**
- Conversion à la génération (`countryIso`) : Suisse → CH, France → FR, Hong Kong → HK (table de correspondance, code à deux lettres conservé tel quel, nom inconnu laissé en clair). Données (`data/`) et texte affiché inchangés. Vérifié : 742 JSON-LD valides (CH 739, FR 2, HK 1) ; 742 fiches régénérées, une seule ligne (le JSON-LD) modifiée par page.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `infra-suisse` à `la-cible-trefilage-profilage`)
- En panne (domaine inexistant) :
  - itpc (Zürich) : www.itpc.ch. Zefix : « ITPC AG », Zürich, CHE-112.882.365, **radiée le 2022-02-04**.
  - jakob-stiefel (Wetzikon) : www.jstiefelgmbh.ch. Zefix : « Jakob Stiefel GmbH in Liquidation », CHE-106.951.928, **en liquidation** ; il existe aussi « Jakob Stiefel Technik AG », Wetzikon, CHE-103.649.203, **active** (successeur probable, non vérifié).
  - jp-muller (Horgen) : jpmuellerag.ch. Zefix : aucune « J.P. Müller AG » à Horgen trouvée (recherches « J.P. Müller », « J. P. Müller », « JP Mueller ») ; statut inconnu.
  - inselspital-universitatsklinik-hno (Berne) : www.hno.insel.ch inexistant, mais hno.insel.ch (sans « www ») répond 200. Hôpital public : lien à corriger.
- Non vérifiables : joseph-bonvallat (erreur TLS du proxy), interprofession-du-gruyere (403 anti-robot).
- OK (200) : les 24 autres.
- Reprise au prochain passage : première fiche après `la-cible-trefilage-profilage`.

**Actions humaines requises**
- Liens à corriger : Inselspital HNO (https://hno.insel.ch/), puis OsiriX, EHC, IFFP, HIV Biel-Seeland, UNIL/UNIGE/vd.ch.
- Sociétés disparues : ITPC (radiée) ; Jakob Stiefel GmbH (en liquidation, à rattacher éventuellement à Jakob Stiefel Technik AG) ; J.P. Müller AG à vérifier. Total depuis le 13/11 : 11 fiches concernées. Règle générale toujours à décider.
- Toujours en attente : écoles Minerva et EFB, centre-laser-victor-hugo, `noindex` + canonical sur les redirections, redirection comconsulting.ch.

## 2026-11-22

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : inchangé (titres > 70 car. 361, titres en double 4, descriptions en double 1, descriptions < 70 car. 24).
- Images : 23 666 balises `<img>` sans `width`/`height` (risque de décalage de mise en page, Core Web Vitals). **Non corrigé en autonomie** : plusieurs règles CSS imposent un `aspect-ratio` sans hauteur (`.article-img`), qu'un attribut `height` écraserait ; l'ajout demande une passe CSS et une vérification visuelle (proposition ci-dessous).
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Correction faite (tools/build.mjs)**
- `og:type` = `article` sur les 1184 pages d'articles (au lieu de `website`), pour les aperçus sur les réseaux sociaux et messageries. Nouveau paramètre `ogType` de `layout()`, `website` par défaut. Diff : 1184 fichiers, exactement 1 ligne changée chacun.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `la-manufacture-des-franches-montagnes` à `medacta-international`)
- En panne (domaine inexistant) :
  - la-manufacture-des-franches-montagnes (Montfaucon) : www.mfmsa.ch. Zefix : « La Manufacture des Franches-Montagnes S.A. en liquidation », CHE-113.087.040, **radiée le 2019-09-05**.
  - lernpaedagogisches-zentrum (Zürich) : www.lpz-zh.ch. Zefix : « Lernpädagogisches Zentrum AG in Liquidation », CHE-113.290.546, **radiée le 2020-04-09**.
  - le-futur-du-cadran (annonceur, sans ville) : www.le-futur-du-cadran.ch. Zefix : aucune entrée trouvée.
- Non vérifiables (DNS résolu ; délai, TLS/proxy ou 503) : made-in-art, lhc-lausanne-hospitality-consulting, luzi, mecanor, laboroute, ligues-de-sante-du-canton-de-fribourg, meco, manufactures-d-outils-dumont (503).
- OK (200) : les 19 autres.
- Reprise au prochain passage : première fiche après `medacta-international`.

**Actions humaines requises**
- Deux sociétés radiées de plus (Manufacture des Franches-Montagnes, LPZ) + « Le futur du cadran » introuvable : 14 fiches concernées depuis le 13/11. Règle générale toujours à décider.
- Proposition à valider : ajouter `width`/`height` aux images (avec `height: auto` en CSS là où aucune hauteur n'est imposée), avec contrôle visuel des pages types avant mise en ligne.
- Toujours en attente : liens Inselspital HNO, OsiriX, EHC, IFFP, HIV Biel-Seeland, UNIL/UNIGE/vd.ch ; écoles Minerva et EFB ; centre-laser-victor-hugo ; `noindex` + canonical sur les redirections ; redirection comconsulting.ch.

## 2026-11-23

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : titres > 70 car. 361, descriptions en double 1, descriptions < 70 car. 24, **titres en double 4**.
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Correction faite (tools/build.mjs)**
- Deuxième passe dans la désambiguïsation des titres d'articles : quand deux pages gardent le même titre après ajout de l'édition (même série, même année), on ajoute la personne interviewée si elle diffère, sinon l'intitulé de l'édition régionale. Résultat :
  - « Énergies nouvelles Vaud – Patrick Chiché » / « – Michel Herzen » ; « Zürcher Handelskammer (ZHK) – Direktion – Beat Zimmermann » / « – Regine Sauter » ;
  - « Stadt Solothurn – … (Fribourg, Berne-Bienne et Tessin, mai 2015) » / « (Genève et La Côte, janvier 2015) » ; idem pour l'interview Kurt Fluri 2014 (Suisse alémanique / Valais et Neuchâtel).
- Titres en double : 4 → 0 ; titres > 70 car. inchangés (361). 8 articles régénérés, seules `<title>` et `og:title` changent.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `medeco-ch` à `neuenschwander-composants-horlogers`)
- En panne (domaine inexistant) :
  - nat-new-ambrosetti-technologies (Barbengo) : www.newambrosetti-tech.com. Zefix : « NEW AMBROSETTI TECHNOLOGIES SA in liquidazione », Lugano, CHE-105.203.858, **radiée le 2014-11-28**.
  - my-private-care (Genève) : www.myprivatecare.ch. Zefix : « My Private Care SARL », Carouge, CHE-115.815.833, **active** ; site à retrouver.
  - minnovarc (La Chaux-de-Fonds) : www.minnovarc.eu. Zefix : aucune entrée (projet franco-suisse, probablement sans entité au registre).
- Non vérifiables (DNS résolu ; erreur TLS/proxy ou 406) : medileg, merusa, monnier, metafil-lagirolle, mps-micro-precision-systems, meyrincentre (406).
- OK (200) : les 21 autres.
- Reprise au prochain passage : première fiche après `neuenschwander-composants-horlogers`.

**Actions humaines requises**
- NAT New Ambrosetti radiée (2014) ; My Private Care active, nouveau site à trouver ; Minnovarc (projet) probablement terminé. 17 fiches concernées depuis le 13/11.
- Toujours en attente : règle pour les sociétés radiées ; liens Inselspital HNO, OsiriX, EHC, IFFP, HIV Biel-Seeland, UNIL/UNIGE/vd.ch ; écoles Minerva et EFB ; centre-laser-victor-hugo ; width/height des images ; `noindex` + canonical sur les redirections ; redirection comconsulting.ch.

## 2026-11-24

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- Audit SEO : titres en double 0, titres > 70 car. 361, descriptions < 70 car. 24, **descriptions en double 1**.
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Correction faite (tools/build.mjs)**
- `articleDescription` : quand deux articles de même série et même année partagent le même extrait imprimé (même texte dans deux éditions régionales), l'édition régionale est nommée en tête au lieu de la série. Ex. « Union des villes suisses : Valais et Neuchâtel, 2014 : Interview mit Nationalrat Kurt Fluri… ». Descriptions en double : 1 → 0. 2 articles régénérés, seules description / og:description changent. Plus aucun titre ni description en double sur le site.

**Rotation sites d'entreprises** (654 liens ; 30 fiches de `ngl-cleaning-technology` à `polirapid-swiss`)
- En panne :
  - placor (Marin-Epagnier) : www.placor.ch → domaine inexistant. Zefix : « Placor SA », Laténa, CHE-102.281.106, **active** (Laténa = commune issue de la fusion incluant Marin-Epagnier) ; site à retrouver.
- Non vérifiables : pesa (erreur TLS du proxy), orion-protection-juridique (400), osc-organizzazione-sociopsichiatrica-cantonale (403, ti.ch), polirapid-swiss (403).
- OK (200) : les 25 autres.
- Reprise au prochain passage : première fiche après `polirapid-swiss`.

**Actions humaines requises**
- placor : société active, trouver son site actuel.
- Toujours en attente : règle pour les sociétés radiées (17 fiches) ; liens Inselspital HNO, OsiriX, EHC, IFFP, HIV Biel-Seeland, UNIL/UNIGE/vd.ch ; écoles Minerva et EFB ; My Private Care ; centre-laser-victor-hugo ; width/height des images ; `noindex` + canonical sur les redirections ; redirection comconsulting.ch.

### 2026-11-24 (suite, à la demande de l'éditeur)

**Registre du commerce (Zefix, détail des publications FOSC) pour les fiches dont le site a disparu**

| Fiche | Statut au registre | Détail |
|---|---|---|
| placor | **Active** (Placor SA, Laténa, CHE-102.281.106) | Pas de liquidation. Dernière publication 13.02.2025 : seul changement de commune (fusion La Tène → Laténa). Site à retrouver. |
| itpc | Radiée 04.02.2022 – **fusion** | Absorbée par SoftwareOne AG, Stans (CHE-107.401.257, active). |
| hestia-constructions | Radiée 29.06.2022 – **fusion** | Reprise par Swissroc Construction SA, Plan-les-Ouates (CHE-371.855.790, active). |
| hastag-zuerich | Radiée 20.06.2012 – **reprise** | Reprise par JURA Materials Kies & Beton AG (CHE-106.473.886, active) ; le site redirige d'ailleurs vers Jura Materials. |
| ecole-minerva | **Active** – **rachetée** | Parts cédées à Cita Holding SA, Lausanne (CHE-272.856.188), FOSC 26.08.2025 ; nouveau gérant. Site à retrouver. |
| darwin-airline | **En liquidation** (Lugano) | Toujours « in liquidazione », pas encore radiée. |
| gems-world-academy-etoy | **Faillite** 14.12.2023 | Dissoute par le tribunal (art. 731b CO) puis déclarée en faillite. |
| jakob-stiefel | **En liquidation** (Wetzikon) | Une société distincte, Jakob Stiefel Technik AG (CHE-103.649.203), est active à Wetzikon ; aucune reprise inscrite entre les deux. |
| eichenberger-futuretech | Radiée 19.12.2019 – liquidation | Liquidation terminée, aucune reprise. |
| guillod-gunther | Radiée 09.05.2022 – liquidation | Dissoute par l'AG du 02.12.2020. |
| imh | Radiée 13.05.2025 – liquidation | Dissoute par l'AG du 25.08.2021. |
| la-manufacture-des-franches-montagnes | Radiée 05.09.2019 – liquidation | Dissolution décidée le 23.05.2018. |
| lernpaedagogisches-zentrum | Radiée 09.04.2020 – liquidation | |
| gs-time | Radiée 30.04.2024 – liquidation | |
| nat-new-ambrosetti-technologies | Radiée 28.11.2014 – liquidation | |
| bp-conseils | Radiée 01.03.2024 – cessation d'activité | Entreprise individuelle. |
| ecole-francaise-de-berne | Association radiée 12.12.2013 | L'école peut être exploitée par une autre entité : non trouvée au registre. |
| my-private-care | **Active** (Carouge) | Site à retrouver. |
| bcp-tourbillons | **Active** (La Chaux-de-Fonds) | Site à retrouver. |
| jp-muller, le-futur-du-cadran, minnovarc, centre-laser-victor-hugo | Introuvables au registre | Aucune entité correspondante (projet, annonceur ou entité étrangère probable). |

**Images : dimensions déclarées (tools/build.mjs + docs/assets/css/style.css)**
- Constat : poids correct (1 840 WebP, 130 Mo, max 262 Ko, ≤ 1 600 px) ; en revanche aucune des 23 666 balises `<img>` ne déclarait `width`/`height`, d'où des décalages de mise en page au chargement (indicateur CLS des Core Web Vitals).
- Correction : `width`/`height` réels ajoutés à toutes les images (helper `dims()` sur les 7 gabarits), plus une règle CSS de priorité nulle `:where(img[width][height]) { height: auto; }` pour que les règles existantes gardent la main.
- Vérifications : 3 821 images contrôlées, dimensions déclarées = dimensions réelles (0 écart) ; captures avant/après de 11 pages types en bureau (1366 px) et mobile (390 px) : hauteurs de page identiques partout ; les seules zones différentes sont des images pas encore chargées au moment de la capture (dans un sens comme dans l'autre), pas des changements de mise en page.

**Placor (complément 24.11, information de l'éditeur)** : site disparu et numéro de téléphone attribué à une autre personne. La société reste inscrite comme active au registre (dernière publication 02.2025, changement de commune uniquement), mais elle n'est plus joignable par ses coordonnées publiées : activité probablement arrêtée, sans radiation. Parution unique : Sous-traitance horlogère 2016, p. 105 (article commun avec Kyburz & Cie SA). Aucune trace d'un successeur trouvée.

## 2026-11-25

**Contrôles**
- https://swissknowhow.ch/, /sitemap.xml, /robots.txt : 200. Sitemap : 2019 URL ; 20 URL tirées au hasard : 20 × 200.
- `node tools/build.mjs` + `check_site.py` : 2059 pages, 0 lien cassé, 0 valeur vide. `git status` : seul `security.txt` (date), remis. Pas de nouveau commit ni de changement de consignes depuis hier.
- En ligne : mention Placor publiée ; attributs width/height des images présents en production.
- Audit SEO : 0 titre ni description en double ; titres > 70 car. 361 ; descriptions < 70 car. 24. Aucun lien sans texte accessible.
- comconsulting.ch : toujours la page « en construction » d'OVH.

**Problème relevé**
- /recherche/ porte un meta `noindex` mais était aussi bloquée par `Disallow: /recherche/` dans robots.txt. Google ne peut alors pas lire le noindex (signalé dans la Search Console : « Bloquée par le fichier robots.txt : 1 »).

**Correction faite (tools/build.mjs)**
- Ligne `Disallow: /recherche/` retirée de robots.txt : la page reste exclue de l'index par son meta noindex, que Google pourra désormais lire. Vérifié : /recherche/ n'est pas dans le sitemap, aucun lien interne avec paramètres de recherche (pas de risque d'URL en série). Fichiers modifiés : robots.txt uniquement.

**Rotation sites d'entreprises** (653 liens ; 30 fiches de `polissages-gautier` à `reymond-freres`)
- En panne :
  - poyry-schweiz (Zürich) : www.poyry.ch → 404. Zefix : Pöyry Schweiz AG **renommée** AFRY Schweiz AG, Zürich, CHE-108.100.605, **active** (rachat de Pöyry par le groupe AFRY) ; nouveau site probable afry.com (répond 200).
  - queloz (Saignelégier) : www.quelozsa.ch → domaine inexistant. Zefix : aucune « Queloz SA » à Saignelégier (seules des entreprises individuelles Queloz, dont une menuiserie active) ; statut inconnu.
  - posalux : www.posalux.com/site/fr → 404, mais www.posalux.com répond 200 (page déplacée).
  - prefecture-biel-bienne : www.jgk.be.ch → domaine inexistant (réorganisation des domaines du canton de Berne). Administration publique.
  - prefecture-de-nyon : page vd.ch → 404 (5e lien vd.ch cassé).
- Non vérifiables : procolor (erreur TLS), promotion-bracelets (délai), pwc (403), regio-energie-solothurn (503).
- OK (200) : les 21 autres.
- Reprise au prochain passage : première fiche après `reymond-freres`.

**Actions humaines requises**
- Pöyry → AFRY Schweiz AG (renommage) : mettre à jour le lien (et éventuellement la mention « aujourd'hui AFRY Schweiz AG »).
- Posalux : remplacer par https://www.posalux.com/ ; Préfecture de Biel/Bienne et de Nyon : nouvelles pages officielles à trouver.
- Queloz SA : vérifier par téléphone.
- Toujours en attente : mentions pour les sociétés radiées, en liquidation ou rachetées (tableau du 24.11) ; liens Inselspital HNO, OsiriX, EHC, IFFP, HIV Biel-Seeland, UNIL/UNIGE/vd.ch ; `noindex` + canonical sur les redirections ; redirection comconsulting.ch.
