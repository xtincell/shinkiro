# État de maturité

Ce que le code fait réellement, par opposition à ce que les README annoncent. À relire avant
toute planification — c'est le document qui évite de construire contre une fiction.

**Établi par relevé exhaustif des arborescences GitHub au 14 septembre 2026.** Les volumétries
sont comptées, pas estimées. Voir [`fleet.yml`](../fleet.yml) pour le détail par composant et
[`TOPOLOGIE.md`](TOPOLOGIE.md) pour les modes de déploiement.

Légende : **produit** = tourne en conditions réelles · **utilisable** = fonctionne, non
éprouvé à l'échelle · **partiel** = des pans manquent · **à qualifier** = documentation
insuffisante pour trancher.

| Composant | État | Ce qui tourne | Ce qui manque |
|---|---|---|---|
| `ADVE-project` (La Fusée) | **produit** | v6.19, cap APOGEE atteint (7/7 Neteru), 192 ADR, 17 workflows, `packages/sdk`, Next.js + Prisma + Playwright + plugin ESLint maison | Le contrôle SLO **n'a jamais mesuré** : la base de prod est injoignable depuis les runners (`ECONNREFUSED`). Correctif de workflow en cours, cause d'infrastructure non résolue. |
| `galahad` | **utilisable** | **70 fichiers.** Moteur de 15 modules sans dépendance npm · bridge Claude · cockpit · assistant de configuration · patrouille par cron (dont purge des images Coolify) · **sas-admin**, passerelle Python d'émission et révocation de jetons avec fermeture de ports · routage Caddy et Traefik · MIT | Le moteur existe **en trois exemplaires** — ici, dans `talos` et dans `hulysse` — alors que le README promet « une image, trois rôles ». Dette structurelle n°1. |
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
   AVERTIS. `ADVE-project` est canonique ; les cinq autres sont des lignées mortes à archiver
   après récupération du meilleur README (celui de `LaFusee_ADVE`).
2. **Le moteur existe en trois exemplaires.** `galahad/engine/src/`, `talos/src/` et
   `hulysse/src/` portent les mêmes modules, alors que le README de `galahad` promet « une
   image moteur, trois rôles ». La fusion par `git subtree` doit préserver les spécificités :
   `brain`, `goals`, `heartbeat`, `integrations`, `jobs`, `roles`, `skill-runner` côté
   galahad ; `cron`, `mcp`, `ollama`, `soul` et `radar-mcp/` côté talos ; `goals` côté hulysse.
3. **Aucun contrat d'interface n'est écrit.** Voir `docs/INTERFACES.md` — rédigé à partir du
   code, à confirmer par les auteurs.
4. **Le clone local d'`ADVERT_01` porte 111 modifications non commitées.** À trancher avant
   d'archiver le dépôt : récupérer ou jeter.
5. **Deux cockpits coexistent** — `galahad/cockpit/index.html` et le dépôt `hermes-cockpit` —
   sans partage de responsabilité écrit.
6. **Deux taxonomies d'écart, non reliées.** Le Market Expansion System classe *ce qui change*
   selon le marché (langue, marque, SKU, réglementaire) ; `la-barre/app/ecarts.js` classe *qui
   doit la reprise et si elle se facture* (brief, plateforme, bigidea, agence, donneur). La
   seconde est la plus avancée. Voir [`TOPOLOGIE.md`](TOPOLOGIE.md).
7. **`la-barre` n'est pas câblé à `radar`.** La Barre produit les décisions, Radar tient le
   journal `task_events`. Sans le lien, la mesure avant/après du Transformation Pilot — le
   sixième critère de gouvernance — n'est pas tenable.
