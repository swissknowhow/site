# Swiss Knowhow — annuaire

Site statique (HTML/CSS/JS, sans dépendance) qui reprend le contenu des magazines
**Swiss Knowhow** : annuaire des entreprises avec coordonnées, articles et interviews,
thèmes, recherche instantanée et onglet **Magazines PDF** (miniatures + téléchargement).

## Structure

| Dossier | Rôle |
|---|---|
| `data/magazines/*.json` | Données extraites des PDF, un fichier par magazine (format : `data/SCHEMA.md`) |
| `data/images.json` | Photos associées aux articles/entreprises (généré) |
| `tools/build.mjs` | Générateur : lit `data/` et écrit tout le site dans `docs/` |
| `tools/extract_images.py` | Extrait les photos des PDF locaux → `docs/assets/img/` |
| `tools/ingest.sh` | Décode un PDF téléchargé depuis Google Drive, extrait texte + couverture |
| `docs/` | **Site publié** (GitHub Pages : Settings → Pages → branche, dossier `/docs`) |

## Commandes

```bash
npm run images   # (optionnel) extraire les photos des PDF présents localement
npm run build    # régénérer le site dans docs/
npm run serve    # aperçu sur http://localhost:8080
```

## Fonctionnalités

- **Annuaire** : fiches entreprise (présentation, adresse, téléphone, e-mail, site, interlocuteurs,
  lien carte, parutions), filtres par thème, canton, lettre, masquage des annonceurs seuls.
- **Articles** : résumé, citation, personnes, entreprises liées, lien vers le PDF.
- **Thèmes** : 11 secteurs (horlogerie, industrie, santé, construction, collectivités…).
- **Recherche** : instantanée (Ctrl K ou /), insensible aux accents, sur entreprises, personnes,
  villes, articles et magazines ; page `/recherche/?q=…`.
- **Magazines PDF** : toutes les éditions avec couverture, téléchargement et lecture en ligne.
- Mode sombre, responsive mobile, données structurées schema.org (SEO).

## Sécurité

Site 100 % statique (pas de serveur, de base de données ni de formulaire) : la surface d'attaque est minimale.

- **Politique de sécurité du contenu (CSP)** sur chaque page : seuls les fichiers du site lui-même peuvent
  être chargés ; aucun script ni style inline, aucun service tiers (polices hébergées localement).
- **Échappement systématique** de toutes les données insérées dans les pages ; liens « site web » limités
  aux adresses http(s) valides, e-mails validés. Testé avec des données piégées (XSS) : aucune injection.
- **Anti-clickjacking** : intégrée dans un cadre d'un autre site, la page se remplace par un simple lien.
- **Liens externes** en `rel="noopener"`, politique de référent `strict-origin-when-cross-origin`.
- **PDF** contrôlés : aucun JavaScript ni action automatique (`tools/inspect_pdfs.py`).
- `/.well-known/security.txt` (contact sécurité) et `robots.txt`.

Limites dues à GitHub Pages (pas d'en-têtes HTTP personnalisés) : pas de HSTS ni de `frame-ancestors`.
Pour les obtenir, placer un CDN (ex. Cloudflare) devant le site.

## Points d'attention

- Les PDF sont hébergés avec le site sous `docs/wp-content/uploads/…` (mêmes adresses que l'ancien
  WordPress) ; l'Arc jurassien 2013 (245 Mo, trop lourd pour GitHub) est indiqué « disponible sur demande ».
- Les anciennes adresses WordPress (`/swiss-horlogerie-2019/`, `/qui-sommes-nous/`…) redirigent vers les
  nouvelles pages.
- Résumés rédigés à partir des magazines ; les coordonnées sont celles imprimées (pas de vérification
  de leur actualité). Corrections de coquilles : `data/CORRECTIONS.md`.
