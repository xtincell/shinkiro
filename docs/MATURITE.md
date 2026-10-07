# État de maturité

Les réceptions datées complètent le relevé historique ; ni une arborescence ni
un déploiement ne constituent une release reçue. Les statuts historiques ci-dessous
ne permettent pas de déclarer toutes les IP ou tous leurs parcours achevés.

## Réceptions partielles au 7 octobre 2026

- Galahad : consentement, procédures, décisions indisponibles, seuil de jetons
  et retour délégué confrontés au canon. Neuf contre-exemples rouges, puis quinze
  scénarios verts et CI reçue ; [PR #3](https://github.com/xtincell/galahad/pull/3)
  intégrée au canon. Configuration native, mandat précis, coût et cycle des
  agents actifs restent ouverts ; aucun redémarrage.
- Danmem : source servie et schéma retrouvés, puis repris dans
  [PR #1](https://github.com/xtincell/danmem/pull/1). Neuf contre-exemples rouges,
  dix-huit cas locaux verts dont reprise croisée Galahad après 503 dans un nouveau
  processus, une seule exécution et aucun appel IA. CI : dix-neuf cas verts sur
  l'image pgvector de production, dont rejeu du schéma et rappel sémantique ; le
  consommateur d'un autre dépôt y est explicitement sauté. Ces réceptions ne
  valent pas migration du service, restauration de sauvegarde ou seconde TPE.
  Voir [RECEPTION-GALAHAD-DANMEM.md](RECEPTION-GALAHAD-DANMEM.md).
- La Fusée 404 : besoin manuel, conversion atomique, conflit/relecture, mission
  exacte dans les deux portails et retrait motivé reçus sur la marque de démo
  BLISS, sans delta IA/Process. La liste console admin vide découverte pendant
  cette recette est corrigée et reçue nativement en production 405. Les filtres,
  colonnes et le besoin exact sont reçus ; le clic de dernière ligne masqué par
  le retour flottant est corrigé au shell et reçu en production 406. Le viewport
  mobile 390 × 844 et son dialogue sont reçus ; rôles distincts et cycle
  production → validation → livraison restent ouverts.
- La Fusée 407 : les cartes d'assets regroupent les références à une même URL
  complète en conservant les lecteurs et usages distincts. Grille, recherche,
  filtre et dialogues SPAWT reçus en bureau et viewport mobile ; groupe Noël
  partagé et aperçus produits FrieslandCampina reçus. Les versions stratégiques,
  la provenance des corpus et le contraste du logo sombre restent à corriger.
- La Fusée 408 : identité de tâche et de reprise, rejouement explicite, périmètre
  réel et reçus terminaux corrigés dans les services partagés. CI : 4 054 tests
  unitaires et 57 PostgreSQL ; HTTP authentifié et build reçus. Image, conteneur,
  version et volume privé rapprochés en production. Écran sans équipe reçu sans
  chargement infini ; choix d'équipe admin, remount du brouillon, éditions
  concurrentes ouvertes et cycle métier complet restent à recevoir. La remise
  en automatique d'une campagne sans calcul disponible refuse l'écriture.
  Voir [RECEPTION-REPRISES-SURFACES.md](RECEPTION-REPRISES-SURFACES.md).
- SPAWT : la vitrine principale et la page historique sont distinctes. Le quiz
  conserve six questions ; leurs annonces sont corrigées sur les trois surfaces
  servies. Décompte expiré retiré de l'ancienne page, lien vers la vitrine actuelle,
  CI et livraisons reçues ; bureau et viewports mobiles reçus. Le calcul n'est
  pas changé : 50 tests locaux, dont équilibre des 4 096 parcours. Contact/carte,
  application, droits et irrigation complète du corpus de marque restent ouverts.
- DataCollector : collecteurs, CLI/API et interface confrontés à leur rôle.
  Reçu partagé, sauvegarde atomique, erreurs et inconnues conservées ; faux
  sentiment, score de santé et progression simulée retirés. Quatorze tests Python
  et quatre VM Node sans fournisseur, CI main reçue après PR #1. Les fournisseurs,
  exports navigateur JSON/PDF et admission au dossier restent ouverts.
  La mention historique « sans dépendance externe » est fausse pour cet outil :
  front HTML, Flask et sources PageSpeed/Reddit/Serper/profil sont distincts.
- Argos : fonds canonique autonome, contrat manuel et veille facultative
  confrontés à leur code. Onze tests SQLite sur dossier/citations/amendement/
  filiation/seed et dix tests workers hors réseau/LLM payant passent. Le worker
  conserve la collecte partielle, qualifie ses sources et ne remplace plus une
  source vivante indisponible par une fixture. Deux PRs en brouillon ; le build
  CI passe, le lint historique de ces commits reste rouge. La PR #3 ferme le
  lint complet, avec quatorze tests dont le rendu JSON-LD hostile ; sa CI reçoit
  les trois jobs intégrité, build et workers sur le commit 31cb881.
  Aucun déploiement ni collecte vivante reçu. Authentification, isolation,
  preuve/licence par actif, UX native et projection réelle restent ouverts.
  Voir [RECEPTION-ARGOS.md](RECEPTION-ARGOS.md).

- La Fusée 403 : raccords qualifiés par instance, édition concurrente protégée,
  trois marques reliées au même suivi Noël, projet et accès uniques en vue groupe
  reçus nativement. Les sept fonctions publiques rendent l'aide IA facultative ;
  les autres promesses publiques, le corpus complet et les cycles restent ouverts.
- Radar personnel et installation Matanga sont distincts et déployés. Journal
  canonique partagé ; admission La Barre → Radar Matanga versionnée et idempotente
  reçue par API. L'écran Matanga, les autres créateurs de codes, certains filtres
  multimarques et les permissions métier complètes restent à recevoir.
- La Barre : master, adaptation, format, reprises et réception de référence ont
  reçu une correction livrée. Cette réception ne couvre pas l'authentification
  des dépôts ni le retour de décisions et résultats entre tous les outils.
  La provenance des complétions distingue désormais chaque champ et l'inférence
  motivée ; l'historique n'est pas réécrit rétroactivement.
- Indice : bilans incomplets sans note globale, déclaratif explicite, reprise
  locale et exports reçus nativement. Admission du bilan au dossier destinataire,
  fonctionnement hors ligne et repli sans stockage restent à recevoir.

Le recensement intégral conserve toutes les IP et leurs lignées donneuses. Aucun
classement historique « gelé » ou « archivé » ne retire une capacité de l'audit.
Les contrats et limites de circulation figurent dans [INTERFACES.md](INTERFACES.md).

## Relevé historique — 14 septembre 2026

**Établi par relevé exhaustif des arborescences GitHub au 14 septembre 2026.** Les volumétries
sont comptées, pas estimées. Voir [`fleet.yml`](../fleet.yml) pour le détail par composant et
[`TOPOLOGIE.md`](TOPOLOGIE.md) pour les modes de déploiement.

**Table historique des arbres Git de septembre : « ce qui tourne » y décrit
le code recensé, pas une réception des services.** Les réceptions ultérieures
ci-dessus et les rapports liés priment sur ces états initiaux.

Légende : **produit** = tourne en conditions réelles · **utilisable** = fonctionne, non
éprouvé à l'échelle · **partiel** = des pans manquent · **à qualifier** = documentation
insuffisante pour trancher.

| Composant | État | Ce qui tourne | Ce qui manque |
|---|---|---|---|
| `ADVE-project` (La Fusée) | **produit** | v6.19, cap APOGEE atteint (7/7 Neteru), 192 ADR, 17 workflows, `packages/sdk`, Next.js + Prisma + Playwright + plugin ESLint maison | Le contrôle SLO **n'a jamais mesuré** : la base de prod est injoignable depuis les runners (`ECONNREFUSED`). Correctif de workflow en cours, cause d'infrastructure non résolue. |
| `galahad` | **utilisable** | **70 fichiers.** Moteur de 15 modules sans dépendance npm · bridge Claude · cockpit · assistant de configuration · patrouille par cron (dont purge des images Coolify) · **sas-admin**, passerelle Python d'émission et révocation de jetons avec fermeture de ports · routage Caddy et Traefik · licence propriétaire | **Produit du portefeuille** (05 · Content Operations, 04 · Content Velocity System), pas seulement un composant de livraison. Aucun recouvrement avec `talos` ni `hulysse` : 73 % et 71 % de divergence mesurée. Sa promesse « une image, trois rôles » — chef, guardian, traveler — est tenue par `roles.js`. |
| `radar` | **utilisable** | **69 fichiers.** API façon PostgREST sur 8 tables, flux RSS et JSON, ingestion LLM local, front complet (dashboard, direction, entrées, équipe, faits, gabarits, gantt, gel, archive, bilan) avec ses fontes, `_headers` et `_redirects` | Une seule instance déployée, pour Shinkiro. L'instance agence n'existe pas. Pas de `docs/`. Requiert **Postgres** — seule dépendance externe dure de la flotte. |
| `talos` | **partiel** | **28 fichiers.** Rôle Guardian · 13 modules dont `cron`, `mcp`, `ollama`, `soul` · `radar-mcp/` avec client de test · `memory-seed/` · unité systemd et installateur | Le contrat MCP vers `radar` **n'est écrit nulle part**. Son `src/` recouvre celui de `galahad`. Figé depuis le 5 juillet. |
| `hulysse` | **partiel** | **23 fichiers.** Rôle Traveler · 9 modules, dont `goals` qui lui est propre · `memory-seed/` · unité systemd | README **identique** à celui de `talos`, au mot près. Son `src/` recouvre celui de `galahad`. Figé depuis le 5 juillet. |
| `danmem` | **à qualifier** | **5 fichiers**, un seul de code : `src/index.mjs`. Mémoire homebrew — peers, deriver, dialectique, S0→S7 | **Aucun README.** Et `galahad/engine/src/memory.js` couvre déjà une couche mémoire : le rapport entre les deux n'est établi nulle part. |
| `la-barre` | **utilisable** | **148 fichiers.** Modèle métier complet en français — jurisprudence, verdict-coût, rétroplanning, écarts, validation, vault — et 18 vues dont **`vue-matrice.js`, qui implémente la matrice support × marché** en trois lectures | Pas de `docs/`, pas de Dockerfile. **Non câblé à `radar`** : La Barre produit les décisions, Radar tient le journal, rien ne les relie. La mesure avant/après du pilote en dépend. |
| `Argos-studio` | **partiel · relance prioritaire** | **185 fichiers.** Application Next + Prisma + Tailwind sous `app/`, plus `workers/`. **Données réelles en place** : dossiers Apple 1984, Think Different, Get a Mac, Nike Just Do It, Dream Crazy, Find Your Greatness, Patagonia | Point d'entrée **dans `app/`**, non déclaré jusqu'ici. **La boucle de mesure vers les résultats client manque** — sans elle, pas de Content Performance Loop vendable. |
| `charadesign-generator` | **utilisable · gelé** | **20 fichiers.** Pipeline LSI-CD v3.4, UI Atelier clair, tracker 9 étapes. Application Vite | Point d'entrée **dans `lsi-cd-app/`**, non déclaré jusqu'ici. Gelé, sans reprise prévue. |
| `la-fusee-blueprint` | **produit** | **600 Ko de markdown.** `LA_FUSEE_BLUEPRINT.md` (146 Ko) est la source de vérité unique — neuf livres cosmogoniques en trois voix ; cahier des charges de 120 Ko ; cinq archives ; `views/LA_FUSEE_PHILO_VIEW.html` (52 Ko) | Doctrine, pas code. Point d'entrée **dans `views/`**. |
| `galahad-landing` | **partiel** | **4 fichiers** : Dockerfile et `index.html` | **À trancher** : sert-elle le produit `galahad` ou le programme Shinkiro ? Aucune page publiée à ce jour. |
| `hermes-cockpit` | **utilisable** | **7 fichiers.** Cockpit d'exploitation déployé sur **Coolify** : lit la santé de `radar` et `danmem`, détecte les process Talos et Claude (`pid: host`, `SYS_PTRACE`), sert un portail client. `portal.mjs` en tout et pour tout | **Toujours aucun README.** Et `galahad` porte déjà `cockpit/index.html` : deux cockpits, partage de responsabilité non écrit. |
| `indice-maturite` | **produit** | HTML autonome, 16 questions / 4 axes / score 0-5, **déployé** sur GitHub Pages | Aucun. C'est le produit 00 du portefeuille, et il est en ligne. |
| `market-expansion-system` | **produit** | Méthode, matrice modèle, gabarits calqués sur le schéma Radar. Preuve terrain neuf marchés | Aucun manque fonctionnel. Reste à en faire une offre packagée. |
| `generateur-approches` · `character-engine` · `datacollector` | **utilisable** | Outils DA autonomes, sans dépendance externe | **Gelés — sans reprise prévue.** Versionnés pour ne plus vivre sur un disque. |
| `BrandForge` | **archivé** | — | README vide, aucun commit depuis février. Soit il devient le Brand Distinctiveness System, soit il reste archivé. |

## Dette structurelle connue

1. **La méthode est éclatée en huit dépôts** sous trois orthographes — ADVE, ADVERTIS,
   AVERTIS. `ADVE-project` est canonique ; les autres lignées restent à qualifier
   sémantiquement avant récupération ou décision d'archivage. Un nom de dépôt
   ne suffit pas à conclure que ses capacités sont présentes dans le canon.
2. **Convergence servie non représentée dans les dépôts historiques.** La mesure
   Git de septembre reste reproductible ; elle ne décrit pas les services actuels.
   Talos et Hulysse servent quinze modules identiques, sur une variante Galahad.
   Missions/Agora et objectifs compatibles sont reçus dans le moteur canonique,
   sans migration des agents. Cron, briefing, MCP et sessions persistées restent
   des capacités donneuses ; politiques de veille, coût et restauration restent
   ouverts. Voir [la réception des rôles](RECEPTION-TALOS-HULYSSE.md).
3. **Contrats d'interface partiellement reçus.** Voir `docs/INTERFACES.md` : journal
   Radar, admission La Barre et raccords Fusée documentés ; les autres interfaces
   ne doivent pas être assimilées à ces réceptions.
4. **Le clone local d'`ADVERT_01` porte 111 modifications non commitées.** À trancher avant
   d'archiver le dépôt : récupérer ou jeter.
5. **Deux cockpits coexistent** — `galahad/cockpit/index.html` et le dépôt `hermes-cockpit` —
   sans partage de responsabilité écrit.
6. **Deux taxonomies d'écart, non reliées.** Le Market Expansion System classe *ce qui change*
   selon le marché (langue, marque, SKU, réglementaire) ; `la-barre/app/ecarts.js` classe *qui
   doit la reprise et si elle se facture* (brief, plateforme, bigidea, agence, donneur). La
   seconde est la plus avancée. Voir [`TOPOLOGIE.md`](TOPOLOGIE.md).
7. **Admission reçue, boucle de résultat ouverte.** La Barre produit le cadrage,
   Radar Matanga admet le projet avec reçu ; les états restent dans Radar.
   Cette liaison ne reçoit pas encore la mesure avant/après du cycle complet.
