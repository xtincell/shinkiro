# Plan d'achèvement

Établi le 10 novembre 2026. Ce document dit ce qui reste pour terminer Shinkiro,
ce qui bloque chaque point, et dans quel ordre intervenir.

Il repose sur trois lectures faites le même jour :

- les documents de gouvernance de ce dépôt, lus en entier (4 853 lignes) ;
- les 18 dépôts de la flotte, clonés côte à côte, tests rejoués ;
- l'état GitHub de chaque dépôt : PR, issues, dernière CI.

Ce plan est un jugement daté. Les faits qu'il cite ont une référence
`fichier:ligne` ; ils périment au prochain commit, et le plan avec eux.

## En une page

**Le programme n'est pas achevé, et aucun document ne dit ce qu'« achevé » veut
dire.** Les réceptions parlent de sept chantiers, de dix portes de release, de
116 parcours et de 80 lignées. Leur définition n'est dans aucun dépôt : elle vit
dans LeRadar et dans des dossiers de preuves privés.

Les documents déclarent **111 points ouverts**, une fois dédoublonnés
([l'inventaire](INVENTAIRE-POINTS-OUVERTS.md) les liste un par un) :

| Ce qui ferme le point | Points | Qui peut agir |
|---|---|---|
| Un commit dans un dépôt | 43 | un agent, seul |
| Un accès au VPS ou à la production | 27 | un agent, **si** l'accès existe |
| Une clé, un jeton, un fournisseur | 11 | le propriétaire fournit, l'agent agit |
| Un arbitrage | 13 | le propriétaire |
| Un tiers réel : client, cycle, facture | 17 | le marché |

La lecture du code ajoute des constats que les documents ne portent pas, dont
plusieurs touchent la sécurité. Ils sont en [section 3](#3-constats-que-les-documents-ne-portent-pas).

**Six blocages décident de tout le reste** ([section 2](#2-les-blocages)) :

1. Le secret `FLEET_TOKEN` est refusé par GitHub depuis le 21 septembre.
2. Aucun agent n'a de voie d'accès au VPS.
3. La définition d'« achevé » est hors de git.
4. Les clés des fournisseurs ne sont accessibles à aucun agent.
5. Une vingtaine d'arbitrages attendent.
6. Dix-sept points exigent un client, un cycle réel ou une facture.

**L'ordre proposé** ([section 4](#4-le-plan-dintervention)) : rendre les contrôles
mesurables, fermer les failles, écrire ce qui n'est écrit nulle part, réparer
dépôt par dépôt, puis recevoir en production.

**Au 11 novembre, 5 h UTC** : les 37 premiers gestes du [lot 0](#lot-0--fait-le-10-novembre)
sont fusionnés, toutes CI vertes, dans l'ordre de la [section 4 ter](#4-ter-fusionner-les-pr-ouvertes).
Cinq ressources Coolify servent désormais `main` :

- La Barre, au commit `e771494` ;
- `hermes-cockpit`, au commit `f8ed2c5` ;
- Radar ;
- `galahad-landing` ;
- La Fusée en 6.27.565.

Au premier redéploiement, La Barre et `hermes-cockpit` sont revenues sur d'anciens
commits, parce que Coolify les épinglait (`9735c56` du 19 octobre et `1ea757b` du
7 octobre). Les épingles ont ensuite été déplacées vers `main`, ce qui tranche
l'arbitrage 5.19 dans le sens de la consigne « tout déployer ».

Restent à redéployer sur l'hôte, où aucun agent n'a d'accès : les services systemd
(`danmem`, `talos`, `hulysse`) et le moteur `galahad`, qui tourne en compose et en
unités systemd et n'a pas de ressource visible par l'API Coolify. L'état de chacun des 43 points `[commit]` est dans
l'[inventaire](INVENTAIRE-POINTS-OUVERTS.md#état-des-points-commit-au-11-novembre).

## 1. Ce qu'« achevé » peut vouloir dire

Faute de définition, ce plan en propose une, en quatre paliers. Chacun a un
critère de sortie qu'une commande ou un reçu peut vérifier.

| Palier | Énoncé | Critère de sortie | État au 10 novembre |
|---|---|---|---|
| **P1** | Le programme se mesure lui-même | `signaux-flotte.mjs --strict` vert, `make derive` vert, workflow hebdomadaire vert, un SLO réellement mesuré | Vert en local. Bloqué en CI par `FLEET_TOKEN`. SLO jamais mesuré. |
| **P2** | Tout ce qu'un commit peut fermer est fermé | Chaque point `[commit]` a sa PR fusionnée, CI verte | À faire. Aucun prérequis extérieur. |
| **P3** | Ce qui est construit est reçu en service | Chaque point `[prod]` et `[secret]` a son reçu daté | Exige l'accès au VPS et les clés. |
| **P4** | Le programme est vendu et mesuré | Un pilote réel avec sa mesure avant/après, une facture | Exige des tiers. Ne se décrète pas. |

P1 et P2 sont à portée d'agent. P3 dépend de deux gestes du propriétaire. P4
dépend du marché : aucun plan ne le ferme, il se constate.

**Ce que les documents permettent de reconstruire des chantiers**, sans
garantie :

| Code | Périmètre déduit de l'usage | Source dans `ADVE-project` |
|---|---|---|
| C1 | Parité et inventaire des capacités. Indices faibles. | `docs/governance/RESIDUAL-DEBT.md:3429` |
| C2 | Le corpus et les dossiers réels des marques | `docs/governance/RESIDUAL-DEBT.md:850` |
| C3 | Des sources vers ADVE : admission, mutations manuelles, propagation | `docs/governance/REFONTE-PLAN.md:1454,1858` |
| C4 | L'expérience et la lecture native : interfaces, mobile, rôles | `docs/governance/RESIDUAL-DEBT.md:2032,2916` |
| C5 | La qualité du conseil et des sorties d'IA | `docs/governance/REFONTE-PLAN.md:1658` |
| C6 | Le cycle réel et la remise commerciale ; porte le MVP | `CLAUDE.md:1020` |
| C7 | L'exploitation vendable : coûts, quotas, sécurité, restauration | `docs/governance/REFONTE-PLAN.md:1946-1947` ; ici `installation/README.md:109-112` |
| R07 | Fraîcheur et propagation des dérivés. Une seule occurrence. | `docs/governance/RESIDUAL-DEBT.md:3142` |
| R09 | Exploitation et contrat de release, couplée à C7 | `docs/governance/REFONTE-PLAN.md:1948` |
| R10 | Recette transverse, couplée à C4 | `docs/governance/RESIDUAL-DEBT.md:3121` |
| R01–R06, R08 | Non déductible : ils n'apparaissent que dans « R01–R10 » | — |

L'état que le dépôt se donne lui-même : « 0/7 chantiers, 0/10 gates, 0/80 lignées
et global null » (`ADVE-project` `docs/governance/REFONTE-PLAN.md:1951-1952`).

Le mandat courant, lui, est écrit : « MVPs prioritaires, d'abord audits/scoring de
La Fusée comme entrée du service pour financer Shinkiro » (`ADVE-project`
`CLAUDE.md:1020`). Ce plan ne le contredit pas : P1 et les failles de la
section 3 se traitent en parallèle, sans toucher au MVP.

## 2. Les blocages

### 2.1 Ce que seul le propriétaire peut lever

**B1 — `FLEET_TOKEN` est refusé par GitHub.**
L'issue [xtincell/shinkiro#5](https://github.com/xtincell/shinkiro/issues/5)
affiche « Contrôle NON MESURABLE » depuis le 21 septembre. Le journal dit
`Bad credentials (HTTP 401)` : le secret existe, mais il est expiré ou révoqué.
Le workflow hebdomadaire est rouge chaque lundi.

Le geste :

1. Créer un jeton d'accès personnel à granularité fine, propriétaire `xtincell`,
   sur tous les dépôts, avec `Contents` et `Metadata` en lecture seule.
2. Le poser dans *Settings → Secrets and variables → Actions → `FLEET_TOKEN`* du
   dépôt `shinkiro`.
3. Fusionner d'abord la PR qui porte ce plan : elle corrige la comparaison qui
   aurait rendu le contrôle rouge chaque semaine une fois le jeton réparé.

**Ce geste ne peut pas être fait par une session d'agent cloud.** Constaté le
10 novembre : le proxy de la session remplace tout jeton GitHub fourni par le
sien, et refuse l'écriture des secrets Actions. Un jeton transmis dans une
conversation n'y sert donc à rien ; il est exposé, et doit être révoqué.

**B2 — L'accès au VPS est partiel.**
Depuis le 10 novembre, une session d'agent lit et déclenche Coolify par son API.
Elle n'entre toujours pas sur l'hôte : ni SSH, ni systemd. Les points `[prod]` qui
touchent `talos`, `hulysse`, `danmem` et la flotte commerciale de `galahad`, tous
sous systemd, en dépendent encore. Le relevé obtenu est en [section 2.4](#23-relevé-de-production-du-10-novembre).

Le jeton Coolify transmis donne un accès large : il lit jusqu'à la liste des clés
privées du serveur. Un jeton limité à la lecture et au déploiement suffirait.

Trois voies possibles pour le reste, de la plus simple à la plus complète :

| Voie | Ce qu'elle ouvre | Ce qu'elle demande |
|---|---|---|
| Clé API Coolify | État des déploiements, journaux, images servies, redéploiement | **Obtenue le 10 novembre** |
| Session d'agent sur un poste qui a déjà SSH | Tout ce que le poste peut faire | Lancer la session sur ce poste plutôt que dans le cloud |
| Recettes jouées par `galahad` lui-même | Les réceptions, sans ouvrir le VPS | Écrire les recettes comme procédures `galahad`, et un canal pour en lire les reçus |

La troisième est la plus cohérente avec le programme : `galahad` est déjà sur le
VPS, il a des procédures à verdict humain et des reçus. Elle demande du travail
avant de servir.

**B3 — La définition d'« achevé » est hors de git.**
Sept chantiers, dix portes, 116 parcours, 80 lignées : tous cités, aucun défini.
Le découpage vit dans LeRadar (`ADVE-project` `docs/governance/RESIDUAL-DEBT.md:888`,
« Actualiser LeRadar à chaque reçu ») et dans des dossiers `preuves-…/` privés.

C'est la maladie que ce dépôt combat, appliquée à lui-même : un agent ne peut pas
finir ce qui n'est pas défini là où il lit.

Le MVP est dans le même cas. Ses cinq étapes « gardent les critères du contrat
privé `release/preuves-mvp-commercial-20261020/requirements-and-baseline.json` »
(`ADVE-project` `docs/governance/RESIDUAL-DEBT.md:1829-1830`). Le dossier
`release/` n'existe pas dans git.

Le geste : exporter de LeRadar la liste des chantiers et de leurs lots, la liste
des portes, et les critères du MVP, dans un fichier de ce dépôt. Les preuves
restent privées ; seule la définition entre.

**B4 — Les clés des fournisseurs.**
Aucune n'est dans un dépôt, et c'est voulu. Mais onze points en dépendent :

| Clé | Ce qu'elle débloque |
|---|---|
| Jeton Telegram et point d'accès du modèle | La recette native de `galahad` |
| Jeton API Coolify | La sonde de patrouille, la voie d'accès B2 |
| Clés Anthropic et OpenAI | La veille d'Argos, l'atelier `charadesign-generator` |
| Serper, PageSpeed, accès Reddit | Les collectes de `datacollector` |
| Identifiants des fournisseurs de forge | Une forge réelle dans La Fusée |
| Accès SFTP | La prochaine publication BanaHealth |

**B5 — Les arbitrages.** Ils sont listés en [section 5](#5-les-arbitrages-attendus).

**B6 — Le marché.** Dix-sept points exigent un tiers : un pilote réel mesuré
avant et après, un cycle complet de campagne, un client qui valide, une facture
rapprochée d'un coût, une seconde entreprise réellement installée, des séances de
validation avec des directeurs de création.

### 2.2 Ce qui limite une session d'agent

| Limite | Effet | Contournement |
|---|---|---|
| Pas de démon Docker | Ni `compose up`, ni construction d'image | `compose config` et les tests hors Docker passent |
| `/user/repos` refusé aux jetons liés à des dépôts | Le relevé sortait en code 3 | Corrigé : repli sur la recherche |
| LeRadar inaccessible | La définition des chantiers reste illisible | Voir B3 |
| `labarre.powerupgraders.com` répond 401 | Pas de recette native de La Barre | Normal : le dépôt est protégé |
| Le serveur MCP de La Fusée répond | Lecture de la stratégie des marques en production | C'est un atout : certaines réceptions peuvent s'y vérifier |

Vercel n'est pas utilisé ; ce n'est donc pas un blocage. Trois projets Supabase
existent, tous inactifs (`ADVE-project`, `NEFER RADAR`, `Spawt Mobile CI`) : ils
ne servent rien, et leur sort est un arbitrage mineur.

### 2.3 Relevé de production du 10 novembre

Lu par l'API Coolify, en lecture seule, puis confronté aux dépôts. Seuls les
composants de la flotte figurent ici.

| Composant | Domaine | Servi | `main` | Constat |
|---|---|---|---|---|
| Portail Shinkiro | `shinkiro.powerupgraders.com` | 14 septembre (`43724f7`) | 10 novembre | **Deux mois de retard.** Le déploiement automatique est activé mais ne s'est plus déclenché : la GitHub App de Coolify ne transmet plus les poussées. Redéployé depuis `main` (`f852443`) le 10 novembre, vérifié servi. |
| `la-barre` | `labarre.powerupgraders.com` | `9735c56`, 19 octobre | `2586992` | **Quatre commits de retard**, dont la distribution neutre et le raccord aux identités de marque. Voulu ou non : à confirmer. |
| `galahad-landing` | `galahad.powerupgraders.com` | `57fbc17` | `57fbc17` | **Publiée**, contrairement à ce que disait le manifeste. Le titre servi parle toujours au développeur. |
| `hermes-cockpit` | `cockpit.powerupgraders.com` | `1ea757b` | `1ea757b` | À jour. |
| `radar` (instance personnelle) | `radar-perso.…sslip.io` | `2e8d92f` | `2e8d92f` | À jour, derrière son mur (401). |
| `indice-maturite` | GitHub Pages | identique au dépôt | — | `app.js` servi et `app.js` du dépôt ont la même empreinte. |
| `ADVE-project` | `powerupgraders.com` | image `ghcr`, 6 novembre | 6.27.552 | Livrée par image : fusionner ne déploie rien. |

Trois constats de plus :

- **Deux instances de La Fusée hors canon tournent** : `lafuseev8.powerupgraders.com`
  sert la lignée archivée `ADVE_v8`, et une seconde instance sert une branche
  d'`ADVE-project`, chacune avec sa base. Elles consomment le VPS. Leur arrêt est un
  arbitrage (5.18).
- **Le service d'embeddings local `ollama-embed` est arrêté.** C'est cohérent avec
  le repli mort que le code de `danmem` signale lui-même.
- **Aucun domaine n'est exposé pour `galahad`, `danmem`, `talos` ni `hulysse`** :
  ils tournent hors Coolify, sous systemd ou en composition hôte.

### 2.4 Une erreur de diagnostic à ne pas répéter

Au début de cette session, `gh auth status` déclarait le jeton invalide, et le
relevé a été jugé impossible sans avoir été lancé. C'était faux : l'API
répondait, et un seul appel sur une centaine échouait. **Un contrôle se juge en
l'exécutant, pas en lisant l'état de son outil.**

## 3. Constats que les documents ne portent pas

Chaque ligne a été lue ou exécutée le 10 novembre. Les chemins sont relatifs au
dépôt nommé.

### 3.1 Sécurité

| # | Dépôt | Constat | Référence |
|---|---|---|---|
| S1 | `galahad` | Le garde de commandes laisse passer 12 des 16 commandes destructrices sondées : `systemctl stop`, `ufw disable`, `git reset --hard`, `poweroff`, `shred`, écriture sous `/etc`. Celui de `talos` les bloque. | `engine/src/hooks.js:24-29` ; `talos` `src/hooks.js:16-31` |
| S2 | `talos` | `radar_delete` échappe à la confirmation « oui » : les outils du pont contournent le garde. | `src/agent-loop.js:80-82`, `src/hooks.js:34,100` |
| S3 | `talos`, `galahad` | La clé machine de Radar saute le filtre de confidentialité. Un mouvement privé arrive au modèle sans marque. | `radar` `server/pgrest.js:308,343-345` |
| S4 | `la-barre` | `servir.mjs` écoute sur `0.0.0.0` par défaut, sans authentification, en lecture et en écriture. | `servir.mjs:360-449,487` |
| S5 | `hermes-cockpit` | Le lien « Terminal » pointe en direct sur `http://…:7681`. Son filtrage est à vérifier sur le VPS. | `index.html:331`, `docker-compose.yaml:35` |
| S6 | `Argos-studio` | `next` 15.5.18 porte une alerte critique ; 13 alertes côté application. | `app/package.json:29` |
| S7 | `charadesign-generator` | Le serveur de développement écoute sur le réseau local avec les clés des fournisseurs derrière son proxy. | `lsi-cd-app/vite.config.js:25-26,153` |
| S8 | `datacollector` | Aucune politique sur les URL sortantes : adresses privées et redirections sont suivies. | `server.py:73`, `collectors/threat.py:214-218` |
| S9 | `BrandForge` | Une clé de fournisseur est en dur dans un dépôt archivé. À révoquer. | `docs/RECEPTION-METHODE-MARQUE.md:17-35` |
| S10 | `talos` | `npm audit` : 9 alertes dont 1 critique, via `@modelcontextprotocol/sdk` ≤ 1.31.0 utilisé par le pont MCP. Relevé le 10 novembre. | `package-lock.json` racine |

### 3.2 Défauts fonctionnels

| # | Dépôt | Constat | Référence |
|---|---|---|---|
| F1 | `la-barre` | Le « + » d'une case vide de la grille support × marché plante : `volets is not defined`. C'est la pièce que le manifeste dit la plus démonstrative. | `app/vue-matrice.js:773` |
| F2 | `la-barre` | Le test de parcours échoue sur une attente périmée (`PRJ-` au lieu de `PRO-`). Il est hors CI. | `tests/parcours.mjs:68` |
| F3 | `la-barre` | `soumis_le` n'est écrit par aucune décision : le délai de verdict du bilan est toujours vide. | `app/bilan.js:138` |
| F4 | `la-barre` | `facturable` n'est lu nulle part. `ecarterUn` et `reprendre` n'ont aucun appelant. | `app/ecarts.js:22-34,221-226` |
| F5 | `galahad` | Une erreur HTTP d'intégration lève une exception non rattrapée : le tour meurt sans réponse à l'opérateur. | `engine/src/integrations.js:46`, `engine/src/tools.js:115` |
| F6 | `danmem` | Sur une base non migrée, `/health` répond 500 pendant que `/jobs` fonctionne. Aucune version de schéma. | `src/index.mjs:233-249` |
| F7 | `danmem` | Un travail réclamé le reste à jamais : pas de bail, pas de remise en file. | `src/index.mjs:323` |
| F8 | `character-engine` | La troncature à 3 000 caractères supprime en silence le bloc des interdits. Le compteur reste vert. | `character_engine.html:161-164` |
| F9 | `market-expansion-system` | L'import « sans retraitement » est faux : le gabarit sème zéro ligne dans Radar. | `README.md:43-44` ; `radar` `server/pgrest.js:114-121` |
| F10 | `hermes-cockpit` | « Guardian online » s'affiche dès qu'un processus exécute `src/index.js`, donc dès que `hulysse` tourne. | `portal.mjs:90` |
| F11 | `talos` | L'installeur ne tourne pas depuis git : il copie deux chemins ignorés et absents. Le README décrit un autre logiciel. | `ops/install.sh:42,61` |
| F12 | `hulysse` | Le README est celui de `talos`, à l'octet. La veille annoncée n'est jamais appelée. | `src/veille.js:39-41`, `src/index.js:3,65` |
| F13 | `radar` | Le README dit que `migrations/` s'applique au démarrage. C'est faux : le dossier n'est référencé nulle part. | `README.md:42,104`, `server/pgrest.js:154-155` |
| F14 | `Argos-studio` | La Fusée poste sans `If-Match` : un second envoi d'un dossier modifié reçoit 409 et passe pour une panne. | `ADVE-project` `src/server/services/seshat/argos/studio-client.ts:33-34` |

### 3.3 Contrôles qui ne mesurent pas

| # | Dépôt | Constat |
|---|---|---|
| M1 | `ADVE-project` | 211 issues ouvertes, toutes « SLO breach detected », une par exécution. La base de production est injoignable depuis GitHub : aucun SLO n'a jamais été mesuré. La PR [#873](https://github.com/xtincell/ADVE-project/pull/873) qui corrige cela est verte et sans conflit depuis le 14 septembre. |
| M2 | `shinkiro` | Voir B1. |
| M3 | `talos`, `hulysse`, `character-engine`, `galahad-landing`, `market-expansion-system` | Aucune CI. |
| M4 | `galahad`, `danmem`, `hermes-cockpit`, `talos`, `hulysse` | Aucun script de sauvegarde ou de restauration, dans aucun des cinq. |
| M5 | `shinkiro` | Aucun signal ne confrontait `deploiement.mode` aux artefacts, alors que l'en-tête de `fleet.yml` l'annonçait surveillé. **Fermé le 10 novembre** par `mode-dementi`. |
| M6 | `shinkiro` | `vitalite: gele` n'est jamais démenti. Examen fait : les commits récents de `talos`, `hulysse` et `character-engine` sont des commits d'hygiène du programme ; seuls `la-fusee-blueprint` et `charadesign-generator` ont reçu de vraies corrections, le 7 octobre. |
| M7 | `ADVE-project` | Huit fichiers de tests PostgreSQL ne tournent dans aucun workflow. Les reçus « PostgreSQL isolés » du lot 549 sont donc seulement locaux. |
| M8 | `ADVE-project` | Le job PostgreSQL de la CI ne fixe pas la mémoire de Node. Rejoué ici, il échoue par manque de mémoire sur `tests/integration/asset-original.postgres.test.ts` ; il passe avec 6 Gio. Son vert dépend de la machine. |
| M9 | `ADVE-project` | `scheduled-ops` est vert sans rien appeler quand `PROD_BASE_URL` manque. `lighthouse` a un préréglage invalide. `preflight` mesure l'absence d'un fichier. |
| M10 | `ADVE-project` | `deploy.yml` appelle un script absent. `release.yml` appelle `npm run build:sdk`, qui n'existe pas : il échouerait au premier tag. |

### 3.4 Jugements périmés du manifeste

`fleet.yml` est écrit à la main et ne dérive pas par accident : il dérive parce
que les dépôts avancent. Les jugements de dix composants étaient périmés. Ils ont
été repris le 10 novembre ; ce tableau garde la trace de ce qui était écrit.

| Composant | Ce que disait `fleet.yml` | Ce que montre le code |
|---|---|---|
| `radar` | « L'admission La Barre est configurée par instance » (`fleet.yml:233`) | Le dépôt `radar` n'en contient aucune. Elle vit dans le dépôt employeur, hors flotte. |
| `galahad` | Trois rôles, quatorze modules, une unité systemd | Quatre rôles (`commercial`), 23 modules, trois unités, un relais `dan-oauth` |
| `talos`, `hulysse` | Cron, briefing et sessions « à recevoir » | Déjà reçus dans `galahad` (`CHANGELOG.md:38-42`) |
| `hermes-cockpit` | « lit la santé de `radar` et `danmem` » (`docs/TOPOLOGIE.md:164`, `docs/INTERFACES.md:355`) | Ne lit aucune santé Radar ; lit Danmem par fichier |
| `Argos-studio` | Trois manques : authentification, licence par actif, amendements concurrents | Les trois sont livrés |
| `galahad-landing` | Cite « self-host in 60 seconds » | La phrase a été retirée le 14 octobre |
| `generateur-approches` | Aucun raccord | Un raccord La Barre existe depuis le 19 octobre |
| `indice-maturite` | Repli sans stockage « à recevoir » | Livré (`app.js:46-54`) |
| `datacollector` | `mode: statique` | L'entrée réelle est `python server.py` |
| `charadesign-generator` | `mode: statique` | Chaque étape appelle un proxy qui n'existe qu'en développement |

Les documents se contredisent aussi entre eux en dix-huit endroits : version de
La Fusée (« v6.19 » contre 6.27.552), numérotation des produits (00/04 contre
01/06), La Barre « sans serveur » contre un conteneur servi. La liste complète
est dans [l'inventaire](INVENTAIRE-POINTS-OUVERTS.md#contradictions-entre-documents) ;
les corriger est l'intervention 3.6.

## 4. Le plan d'intervention

Chaque intervention nomme son dépôt, son geste, sa preuve et son prérequis.
« Agent » signifie : faisable par un agent sans rien d'extérieur.

### Lot 0 — Fait le 10 novembre

| # | Geste | Preuve |
|---|---|---|
| 0.1 | Repli du relevé sur la recherche quand `/user/repos` est refusé | Relevé écrit, 41 dépôts, mêmes 40 qu'au 20 octobre plus un |
| 0.2 | `make derive` et le workflow ignorent la ligne de date | Date seule changée : conforme. Un fait changé : dérive vue |
| 0.3 | Relevé du 10 novembre, portail régénéré | `--strict` : `COHÉRENT — aucune dérive` |
| 0.4 | `wiki-prive` écarté sous `adjacent` | Signal `non-classe` éteint |
| 0.5 | Vercel retiré de la topologie, Argos déclaré non déployé | `docs/TOPOLOGIE.md`, `fleet.yml` |
| 0.6 | Tests de vie d'AGENTS.md corrigés et rejoués | `galahad` 156/156, `talos` et `hulysse` `check` verts |
| 0.7 | Contrat MCP, partage des cockpits et couches mémoire écrits (3.1 à 3.3) | `docs/INTERFACES.md`, `docs/TOPOLOGIE.md` ; chaque fait relu dans le code |
| 0.8 | Jugements périmés de `fleet.yml` repris ; version et numéros de produits du README alignés | `--strict` : `COHÉRENT — aucune dérive` |
| 0.9 | Garde de `galahad` étendu aux formes hôte, pannes d'intégration rendues à l'opérateur (2.1, 2.2) | [galahad#22](https://github.com/xtincell/galahad/pull/22), 164 tests verts, CI verte |
| 0.10 | Grille de La Barre réparée, écoute locale par défaut, parcours navigateur réparé (2.3, et F1 et F2 de 4.8) | [la-barre#14](https://github.com/xtincell/la-barre/pull/14), parcours `PASS` |
| 0.11 | Relevé de production par Coolify ; portail public redéployé | Section 2.3 ; `shinkiro.powerupgraders.com` sert le 20 octobre au lieu du 14 septembre |
| 0.12 | Signal `mode-dementi` (1.6) ; l'unité systemd de `danmem`, absente de tout dépôt, est désormais déclarée | S'allume quand l'état n'est pas déclaré, se tait sinon ; `--strict` vert |
| 0.13 | `radar` : schéma réellement appliqué documenté, `pg` figé dans l'image, `RADAR_INSTANCES` décrit comme `galahad` le lit (4.3) | [radar#6](https://github.com/xtincell/radar/pull/6) |
| 0.14 | `hermes-cockpit` : Hulysse n'est plus compté comme Guardian, titre distinct (F10 et titre de 4.7) | [hermes-cockpit#3](https://github.com/xtincell/hermes-cockpit/pull/3), 15/15 |
| 0.15 | `charadesign-generator` : écoute locale du serveur de dev, clés documentées, vite au dernier correctif (2.5) | [charadesign-generator#4](https://github.com/xtincell/charadesign-generator/pull/4), 20/20, `npm audit` 0 |
| 0.16 | `danmem` : « schéma absent » au lieu d'une erreur 500 brute (F6) | [danmem#2](https://github.com/xtincell/danmem/pull/2), 21/21 avec pgvector et le test croisé `galahad` |
| 0.17 | `Argos-studio` : alerte critique de `next` fermée ; alertes de 13 à 3 (app) et de 5 à 1 (workers), sans majeure (2.4) | [Argos-studio#4](https://github.com/xtincell/Argos-studio/pull/4), CI rejouée verte |
| 0.18 | `galahad` : quatre rôles documentés, et l'enregistrement obligatoire d'un rôle (part de 4.1) | [galahad#23](https://github.com/xtincell/galahad/pull/23) |
| 0.19 | Une CI réelle sur les cinq dépôts qui n'en avaient pas (1.5) ; chacune a prouvé qu'elle échoue quand c'est cassé | [talos#1](https://github.com/xtincell/talos/pull/1), [hulysse#1](https://github.com/xtincell/hulysse/pull/1), [character-engine#1](https://github.com/xtincell/character-engine/pull/1), [galahad-landing#2](https://github.com/xtincell/galahad-landing/pull/2), [market-expansion-system#1](https://github.com/xtincell/market-expansion-system/pull/1) |
| 0.20 | `datacollector` : adresses internes et redirections vers elles refusées (2.6) | [datacollector#3](https://github.com/xtincell/datacollector/pull/3), 25 tests ; la course DNS reste ouverte |
| 0.21 | `character-engine` : les interdits du prompt ne sont plus coupés en silence (F8) | [character-engine#2](https://github.com/xtincell/character-engine/pull/2), sortie identique sous la limite |
| 0.22 | Contrat du changement de modèle d'un agent écrit (3.8) ; README du cockpit d'exploitation (4.7) | `docs/INTERFACES.md` ; [hermes-cockpit#4](https://github.com/xtincell/hermes-cockpit/pull/4) |
| 0.23 | `datacollector` : CDN figés (empreinte sauf Tailwind, dont le CDN refuse le contrôle), fichiers générés retirés du suivi, `flask-cors` mort retiré (4.15) | [datacollector#4](https://github.com/xtincell/datacollector/pull/4), 18 + 4 tests, page chargée sans erreur |
| 0.24 | `character-engine` : le vecteur survit au rechargement, s'exporte et s'importe ; les contradictions s'affichent sans bloquer (4.13) | [character-engine#3](https://github.com/xtincell/character-engine/pull/3), prompt identique à l'octet sur 32 vecteurs |
| 0.25 | `danmem` : unité systemd et environnement d'exemple versionnés, contrôlés par un test ; le chat ne tente plus un port Ollama mort (4.5) | [danmem#3](https://github.com/xtincell/danmem/pull/3), 27 + 1 sauté avec pgvector. À la fusion, l'état déclaré dans `fleet.yml` change |
| 0.26 | `galahad` : relais `dan-oauth` testé en CI avec ses dépendances ; reçus refusés par Danmem (404, 409) mis de côté au lieu d'être retentés sans fin (part de 4.1) | [galahad#24](https://github.com/xtincell/galahad/pull/24), 163 tests moteur, 22 relais |
| 0.27 | `la-barre` : le délai de verdict se lit sur la version jugée, les verdicts sans date sont comptés à part (F3) ; tests de `ecarts.js` et `registre-radar.js` en CI (4.8) | [la-barre#15](https://github.com/xtincell/la-barre/pull/15), 0/7 puis 7/7 |
| 0.28 | `danmem` : bail et remise en file d'un travail réclamé, plafond de tentatives (F7) | [danmem#4](https://github.com/xtincell/danmem/pull/4), 5 échecs puis 25/25 ; fusionner après #3 |
| 0.29 | ADR proposées sur la jointure des taxonomies (3.4) et le câblage La Barre → Radar (3.5) | [SHK-0004](adr/SHK-0004-jointure-des-taxonomies-ecart.md), [SHK-0005](adr/SHK-0005-cablage-la-barre-radar.md) ; 213 références relues |
| 0.30 | `galahad` : la flotte commerciale attend le relais ; `deliver.sh` paramétré ; une erreur HTTP de Telegram n'est plus archivée comme livrée ; le jeton ne passe plus en argument (part de 4.1) | [galahad#25](https://github.com/xtincell/galahad/pull/25), 167 tests |
| 0.31 | `la-barre` : README au niveau du code (4.8) ; production relevée : servie sous `powerupgraders.com/la-barre`, derrière la session, et les outils du poste dédié n'y écrivent plus | [la-barre#16](https://github.com/xtincell/la-barre/pull/16) ; `fleet.yml`, `AGENTS.md`, `docs/TOPOLOGIE.md` |
| 0.32 | `charadesign-generator` : retours tardifs annulés, écritures liées à leur dossier, import validé et versionné (4.14) | [charadesign-generator#5](https://github.com/xtincell/charadesign-generator/pull/5), 14 rouges puis 32/32 |
| 0.33 | `la-barre` : une fabrique unique pour les huit écrivains de décision, forme stockée identique à l'octet (4.9) | [la-barre#17](https://github.com/xtincell/la-barre/pull/17), 33 tests, cinq régressions volontaires détectées |
| 0.34 | Sauvegarde et restauration de la mémoire : gel par arrêt, paquet vérifié, ordre Galahad puis Danmem, restauration confrontée entre les deux (4.6) | [danmem#5](https://github.com/xtincell/danmem/pull/5), [galahad#26](https://github.com/xtincell/galahad/pull/26) ; recette croisée locale, contre-épreuves refusées |
| 0.35 | `ADVE-project` : un compte supprimé ne retrouve plus sa session ; seuil CODB, préflight du relais, Oracle vide et Lighthouse corrigés (4.11.b, c, e, f, g), lot 6.27.554 | [ADVE-project#1165](https://github.com/xtincell/ADVE-project/pull/1165), 16 échecs puis 25/25, 5 696 tests unitaires |
| 0.36 | `ADVE-project` : huit suites PostgreSQL orphelines branchées en CI, mémoire du job fixée ; `deploy.yml` (mort, trompeur) et `release.yml` (mort) retirés (4.11.h, 4.11.i), lot 6.27.555 | [ADVE-project#1167](https://github.com/xtincell/ADVE-project/pull/1167), 767 tests PostgreSQL en rejeu local ; une assertion périmée depuis 519 révélée |
| 0.37 | `ADVE-project` : 9 alertes critiques et 21 hautes fermées, arbre de production sans alerte ; `next` 16.4.6 ferme des failles d'exécution de code à distance (4.11.j), lot 6.27.556 | [ADVE-project#1168](https://github.com/xtincell/ADVE-project/pull/1168), build et smoke compilé, 5 672 unitaires, 726 PostgreSQL ; constat : la garde de couches ESLint ne signale rien |
| 0.38 | `indice-maturite` : la page se rouvre sans réseau après une première visite ; un stockage indisponible ne promet plus de conserver la progression (IM2) | [indice-maturite#2](https://github.com/xtincell/indice-maturite/pull/2), **fusionnée** le 11 novembre ; 16 tests, dont 9 neufs rouges sur l'ancien code ; score identique sur 50 101 jeux de réponses |
| 0.39 | `danmem` : la CI de réception exécute 41 tests sur 41, consommateur Galahad compris (DM4) | [danmem#6](https://github.com/xtincell/danmem/pull/6), 41/41 en local ; **bloquée** : la CI attend le secret `GALAHAD_DEPLOY_KEY`, à créer par le propriétaire (commandes dans la PR) |
| 0.40 | `galahad` : un effet interrompu n'est ni perdu ni rejoué ; objectifs isolés par installation et par marque (G4) | [galahad#27](https://github.com/xtincell/galahad/pull/27), **fusionnée** le 11 novembre ; 206 tests, dont 10 neufs (8 rouges sur `main`) |
| 0.41 | `datacollector` : règles d'URL vérifiées sur l'adresse effectivement connectée, redirections revalidées, codes de refus ; états de source dans le rapport et son PDF (DC2) | [datacollector#5](https://github.com/xtincell/datacollector/pull/5), **fusionnée** ; 36 tests Python et 9 tests Node, 19 rouges avant correction |
| 0.42 | `la-barre` : les autres gestes de choix passent par la fabrique de décision ; une déviation déclare sa portée (LB3, partiel) | [la-barre#18](https://github.com/xtincell/la-barre/pull/18), **fusionnée** et déployée ; `test:decisions` 50/50. L'acteur authentifié reste ouvert : aucune identité ne parvient de La Fusée à La Barre |
| 0.43 | `hermes-cockpit` : format des sondes écrit ; une sonde tronquée ou de forme inconnue n'est plus affichée comme un état valide ; écritures concurrentes relues avant renommage (CK4, TR2) | [hermes-cockpit#5](https://github.com/xtincell/hermes-cockpit/pull/5), **fusionnée** et déployée (`f8ed2c5`, `/healthz` 200) ; 27/27, dont 12 rouges sur l'ancien code |
| 0.44 | `ADVE-project` : un écrivain de source répond 404 typé à un id inconnu ou étranger, au lieu d'un 500 Prisma (IN1), lot 6.27.557 | [ADVE-project#1170](https://github.com/xtincell/ADVE-project/pull/1170), **fusionnée** et livrée en production ; 17 unitaires et 12 PostgreSQL neufs, rouges sur l'ancien code ; 14 contrôles CI verts |
| 0.45 | `Argos-studio` : erreurs lisibles avec reprise, focus et clavier, 390 px sans débordement, dates enregistrées sans date inventée (AR4) | [Argos-studio#5](https://github.com/xtincell/Argos-studio/pull/5), **fusionnée** ; 23 scénarios Playwright (22 rouges sur `main`) et 26 tests unitaires ; pas de ressource Coolify pour Argos (arbitrage 5.8) |
| 0.46 | `ADVE-project` : la note de version ouverte d'elle-même ne vole plus le premier clic ; les clés MCP limitées à un serveur sont reçues sur PostgreSQL réel, et la console émet toutes les portées (F13, partiel : l'historique des identifiants produit reste), lot 6.27.558 | [ADVE-project#1171](https://github.com/xtincell/ADVE-project/pull/1171), **fusionnée** et livrée en production ; 7 tests PostgreSQL, 5 unitaires et un e2e, rouges sur l'ancien code ; 15 contrôles CI verts |
| 0.47 | `ADVE-project` : un compte rétrogradé perd ses droits sur sa session déjà ouverte ; refus typés au lieu de 500 ; suppression refusée proprement quand un lien la retient (IN7), lot 6.27.559 | [ADVE-project#1172](https://github.com/xtincell/ADVE-project/pull/1172), **fusionnée** et livrée en production ; 9 tests PostgreSQL par la vraie connexion Auth.js (4 rouges avant), 10 unitaires ; 14 contrôles CI verts |
| 0.48 | `danmem` : chaque clé porte une identité et un mandat ; écritures attribuées à la clé réelle ; rectification tracée des souvenirs ; une erreur du traitement de fond n'arrête plus le service (DM3) | [danmem#7](https://github.com/xtincell/danmem/pull/7), **fusionnée** ; 55/55 sur PostgreSQL et pgvector, consommateur Galahad compris ; migration additive `sql/003` à passer sur l'hôte avant redémarrage, avec `sql/002` |
| 0.49 | `ADVE-project` : recette des promesses publiques. Sur 53 pages, 129 promesses : 39 reçues, 69 corrigées, 21 laissées au propriétaire. `/status` n'affiche plus « Opérationnel » sans mesure (F16), lot 6.27.560 | [ADVE-project#1173](https://github.com/xtincell/ADVE-project/pull/1173), **fusionnée** et livrée en production ; verrou de 80 fichiers publics (72 formules relevées avant correction) ; 16 contrôles CI verts. Recette : `docs/governance/RECEPTION-PROMESSES-PUBLIQUES.md` du dépôt |
| 0.50 | `ADVE-project` : les lectures publiques d'Argos passent par l'API v1 du studio quand `ARGOS_STUDIO_URL` est posée, sinon par le journal avec la source affichée ; jamais de 500 (AR6, SHK-0002 point 5), lot 6.27.561 | [ADVE-project#1174](https://github.com/xtincell/ADVE-project/pull/1174), **fusionnée** et livrée ; 14 tests de service et 11 de rendu, rouges sur l'ancien code ; studio réel lu en local, 8/8 références. Variable non posée en production tant que le studio n'est pas déployé (5.8) et que les anciens liens `/argos/…` ne sont pas redirigés |
| 0.51 | `ADVE-project` : un seul restaurateur de piliers ; l'historique et le retrait Notoria compensent comme le journal (ADR-0207), avec des refus typés au lieu de 500 (F8), lot 6.27.562 | [ADVE-project#1175](https://github.com/xtincell/ADVE-project/pull/1175), **fusionnée** et livrée, migration comprise ; 14 tests PostgreSQL (10 rouges avant) et un test HARD contre tout second restaurateur. Les 76 archives historiques restent sans filiation inventée ; deux cas de retrait attendent une décision métier |
| 0.52 | `ADVE-project` : santé de campagne calculée sans modèle, « non calculable » plutôt qu'un vert fabriqué ; le brouillon de reprise survit au remontage ; les éditions concurrentes de tâches et de reprises sont refusées en 409 au lieu de s'écraser (F9), lot 6.27.563 | [ADVE-project#1176](https://github.com/xtincell/ADVE-project/pull/1176), **fusionnée** et livrée ; 11 unitaires, 8 de composant et 15 PostgreSQL, rouges avant. Décision au propriétaire : le défaut historique `GREEN` des campagnes jamais calculées |
| 0.53 | `ADVE-project` : un seul contrat pour S. La maturité est bornée par le schéma strict, et le gateway, l'auto-filler, la composition et `sequence-vault` lisent le même verdict (F2, ADR-0214 amendé), lot 6.27.564 | [ADVE-project#1177](https://github.com/xtincell/ADVE-project/pull/1177), **fusionnée** et livrée ; 20 unitaires et 2 PostgreSQL neufs, rouges avant. Effet en production : les S réels de forme historique passent « Brouillon » jusqu'à leur recalcul gouverné |
| 0.54 | `datacollector` et `ADVE-project` : le reçu exporté porte une enveloppe versionnée et vérifiable (schéma, identité, empreinte SHA-256, provenance par mesure, absences jamais à 0). La Fusée l'admet par `INGEST_EXTERNAL_METRIC` (ADR-0146 amendé), avec rejeu idempotent et conflit d'empreinte refusé (DC3), lot 6.27.565 | [datacollector#6](https://github.com/xtincell/datacollector/pull/6) et [ADVE-project#1178](https://github.com/xtincell/ADVE-project/pull/1178), **fusionnées**, La Fusée livrée ; 49 tests Python et 12 Node, 59 unitaires et 5 PostgreSQL côté La Fusée, rouges avant ; vrai reçu admis en local. Pas encore de dépôt depuis une page de console |

### Lot 1 — Rendre les contrôles mesurables

Sans ce lot, rien de ce qui suit ne peut être déclaré fini.

| # | Dépôt | Geste | Preuve attendue | Prérequis |
|---|---|---|---|---|
| 1.1 | `shinkiro` | Régénérer `FLEET_TOKEN` | Workflow hebdomadaire vert, issue #5 fermée d'elle-même | **Propriétaire** (B1) |
| 1.2 | `ADVE-project` | Fusionner la PR #873 | Une seule issue SLO, à titre stable | **Accord du propriétaire.** Sans effet sur la production : fusionner sur `main` ne déploie rien (`.github/workflows/build-image.yml:19-25`). Mais le job sera rouge toutes les six heures tant que 1.4 n'est pas fait |
| 1.3 | `ADVE-project` | Fermer les 211 issues « SLO breach » | Zéro issue de ce titre | Après 1.2. Agent, sur accord : 211 notifications |
| 1.4 | `ADVE-project`, `galahad` | Mesurer le SLO depuis le VPS, où la base est joignable, plutôt que depuis GitHub | Un relevé SLO daté, lu par le workflow | Arbitrage : procédure `galahad` ou tâche planifiée. Puis B2 |
| 1.5 | `talos`, `hulysse`, `character-engine`, `galahad-landing`, `market-expansion-system` | Une CI minimale par dépôt : syntaxe, liens, gabarits | Cinq workflows verts | **Fait** — cinq PR, lot 0.19 |
| 1.6 | `shinkiro` | Signal `mode-dementi` : un mode déclaré sans son artefact est une dérive | Il a relevé `danmem` ; Argos l'assume par son état déclaré | **Fait** |
| 1.7 | `shinkiro` | Étendre `vitalite-dementie` aux composants « gelés » qui bougent | — | **Écarté** : un compte de commits ne distingue pas l'hygiène du programme d'un vrai travail ; le signal crierait au loup |
| 1.8 | `shinkiro` | Faire ouvrir par le workflow une PR du lock rafraîchi | Le geste hebdomadaire devient une fusion | Arbitrage |

### Lot 2 — Fermer les failles

À faire avant toute nouvelle réception en production.

| # | Dépôt | Geste | Preuve attendue | Prérequis |
|---|---|---|---|---|
| 2.1 | `galahad` | Porter dans le garde les motifs que `talos` bloque (S1) | Les 16 commandes sondées deviennent un test, toutes refusées | **Fait** — galahad#22 |
| 2.2 | `galahad` | Rattraper l'erreur d'intégration et la rendre à l'opérateur (F5) | Un test : Radar en 404, le tour répond | **Fait** — galahad#22 |
| 2.3 | `la-barre` | Écouter sur `127.0.0.1` par défaut (S4) | Test de démarrage ; l'image d'entreprise garde son réglage explicite | **Fait** — la-barre#14 |
| 2.4 | `Argos-studio` | Monter `next` et les dépendances en alerte (S6) | `npm audit` sans alerte critique, CI verte | **Fait** — Argos-studio#4 ; restent 4 alertes hautes qui exigent une majeure (`prisma` 7, `zod` 4) |
| 2.5 | `charadesign-generator` | Écoute locale, `.env.example`, `vite` à jour (S7) | CI verte | **Fait** — charadesign-generator#4 |
| 2.6 | `datacollector` | Refuser adresses privées et redirections (S8) | Tests des cas refusés | **Fait** — datacollector#3 ; la course DNS reste ouverte |
| 2.7 | `talos` | Soumettre `radar_delete` à la confirmation (S2), ou archiver le dépôt | Test, ou dépôt archivé | Arbitrage 5.3 |
| 2.8 | VPS | Vérifier le filtrage du terminal `:7681` (S5) | Un reçu : port fermé depuis l'extérieur | B2. Tenté le 10 novembre : la session ne joint aucun port non standard, même chez un témoin. À vérifier depuis un poste. |
| 2.9 | Fournisseur | Révoquer la clé en dur de `BrandForge` (S9) | Clé révoquée | **Propriétaire** |

### Lot 3 — Écrire ce qui n'est écrit nulle part

Tout se passe dans ce dépôt. Les faits sont déjà relevés ; il reste à les poser.

**État au 10 novembre.** 3.1 et 3.3 sont écrits. 3.2 est écrit et attend sa
confirmation. 3.6 est fait : `fleet.yml`, README, `AGENTS.md`, une table de
corrections sous le tableau historique de `docs/MATURITE.md`, et les seize
contradictions corrigibles de l'inventaire. Les deux autres (14 et 15) sont des
journaux datés : le README le dit, sans les réécrire.

| # | Geste | Matière disponible | Prérequis |
|---|---|---|---|
| 3.1 | Le contrat MCP `talos` ↔ `radar` dans `docs/INTERFACES.md` | Transport stdio, sept outils avec leurs appels, douze écarts avec Radar | Agent |
| 3.2 | Le partage des cockpits dans `docs/TOPOLOGIE.md` | Tableau de onze capacités ; deux recouvrements seulement | Agent, puis arbitrage 5.2 |
| 3.3 | Les couches mémoire : qui écrit quoi, et les dix manques avant une restauration recevable | Relevé complet des deux dépôts | Agent |
| 3.4 | Une ADR sur la jointure des taxonomies d'écart | **Proposée** : [SHK-0004](adr/SHK-0004-jointure-des-taxonomies-ecart.md), trois options chiffrées en fichiers touchés | Arbitrage 5.4, puis passage en Accepted |
| 3.5 | Une ADR sur le câblage La Barre → Radar | **Proposée** : [SHK-0005](adr/SHK-0005-cablage-la-barre-radar.md), trois sens, fichiers de chaque côté, neuf points pour 5.6 | Arbitrages 5.5 et 5.6, puis passage en Accepted |
| 3.6 | Reprendre les jugements périmés de `fleet.yml` et les dix-huit contradictions | Section 3.4 | Agent |
| 3.7 | La définition d'« achevé » | — | **B3** |
| 3.8 | Le contrat de fichier `agent-brains.json` → `cerveau.txt` | **Écrit** dans `docs/INTERFACES.md` ; le maillon central reste hors git | Verser le script de l'hôte dans un dépôt : B2 |

### Lot 4 — Réparer, dépôt par dépôt

Dans l'ordre de construction d'AGENTS.md. Une PR par dépôt et par sujet.

| # | Dépôt | Gestes | Prérequis |
|---|---|---|---|
| 4.1 | `galahad` | **Faits** : rôles (galahad#23), `dan-oauth` en CI et reçus refusés (galahad#24). Unité commerciale et `deliver.sh` **faits** (galahad#25). Les trois scripts de patrouille sont alignés (galahad#25). Restent le `CHANGELOG` à 0.1.16 (après fusion des PR), la version de Hermes servie, et l'appel de `release` vers Danmem (danmem#4), utile seulement si un consommateur rend un travail sans le finir | Agent ; B2 pour la version servie |
| 4.2 | `galahad` | Recevoir les capacités donneuses : garde d'isolation, contrôles de patrouille, alerte de repli | Arbitrage 5.3 |
| 4.3 | `radar` | README des migrations (F13) ; `npm ci` dans le Dockerfile ; format `RADAR_INSTANCES` | **Fait** — radar#6 |
| 4.4 | `radar` | Unicité de `ndeg` : aujourd'hui un POST rejoué crée un doublon, et `update` frappe tous les homonymes | Arbitrage 5.7 |
| 4.5 | `danmem` | **Faits** : F6 (danmem#2), unité, environnement et défauts morts (danmem#3), bail et remise en file F7 (danmem#4, à fusionner après #3). Restent l'appel de `release` côté Galahad et la relecture de l'unité servie | B2 pour l'unité servie |
| 4.6 | `danmem`, `galahad` | **Écrit et éprouvé localement** (danmem#5, galahad#26). Reste la recette sur le VPS : noms réels, version de `pg_dump`, volume, stockage hors hôte | Recette B2 |
| 4.7 | `hermes-cockpit` | F10, titre et README **faits** (hermes-cockpit#3, #4) ; reste la configuration morte du compose | Arbitrage : retirer des montages de production |
| 4.8 | `la-barre` | F1, F2 (la-barre#14), F3 et les tests (la-barre#15), README (la-barre#16) **faits**. Restent les constats sur `ecarts.js` (écarter un écart est impossible depuis l'interface, `facturable` n'est jamais lu) et les outils du poste dédié coupés par la session | Arbitrage pour `facturable` et pour les outils |
| 4.9 | `la-barre` | **Fait** (la-barre#17). Restent l'unicité entre postes et le passage de l'import par la fabrique | Arbitrage 5.5 |
| 4.10 | `market-expansion-system` | Gabarits cohérents avec la méthode ; promesse d'import tenue ou retirée (F9) | Arbitrage 5.4 |
| 4.11 | `ADVE-project` | Voir [section 4 bis](#4-bis-la-fusée) | — |
| 4.12 | `Argos-studio` | Artefact de déploiement pour le VPS ; `If-Match` côté Fusée (F14) ; isolation des consultations ; bouchons | Arbitrage 5.8 pour l'hébergement |
| 4.13 | `character-engine` | **Fait** : F8 (character-engine#2), export et contradictions (character-engine#3). Reste un test versionné du parcours | — |
| 4.14 | `charadesign-generator` | **Fait** (charadesign-generator#5). Restent le statut partiel des étapes déjà affichées, les retours tardifs de `ImageGen.jsx`, une recette navigateur avec fournisseur | Agent ; 5.9 pour le service |
| 4.15 | `datacollector` | **Fait** (datacollector#4) ; l'entrée réelle était déjà au manifeste. Reste : servir Tailwind localement pour lui donner une empreinte | 5.9 pour le service |
| 4.16 | `galahad-landing` | Réécriture pour le bon acheteur | Arbitrage 5.12 |
| 4.17 | `la-fusee-blueprint` | Régénérer la vue ou l'archiver | Arbitrage 5.11 |
| 4.18 | `installation` | Étendre le profil : Radar, Argos, mémoires ; comptes ordinaires | Agent, puis recette B2 |

### Lot 5 — Recevoir en production

Ce lot ne commence pas sans B2. Il reprend les 27 points `[prod]`, dont :

- déployer les canons corrigés de `galahad` et de `danmem`, aujourd'hui reçus sur
  copies seulement ;
- relever les configurations réellement servies de `talos` et `hulysse` : quinze
  modules servis, aucun identique au dépôt ;
- restaurer pour de vrai : base Radar, base Danmem, volume `galahad-memory`,
  stockage privé de La Fusée ;
- recevoir le socle d'entreprise sur un hôte neuf, avec proxy HTTPS et
  sauvegardes hors de l'hôte ;
- publier `galahad-landing` et vérifier la version servie d'`indice-maturite`.

### Lot 6 — Le marché

Ce lot ne se planifie pas, il se prépare. Trois préparations sont à portée :

1. Définir les indicateurs de la mesure avant/après et la date de bascule
   (arbitrage 5.6). Aujourd'hui `docs/PORTFOLIO.md:49` dit seulement que la
   mesure « se lit dans les données », et aucun code ne la calcule.
2. Fixer les critères d'acceptation et les prix (arbitrage 5.13).
3. Choisir le premier pilote.

## 4 bis. La Fusée

`ADVE-project` est le composant le plus lourd. Son état au 10 novembre :

- **Version 6.27.552**, fusionnée le 6 novembre (`package.json:3`).
- **Le test de vie d'AGENTS.md passe** : `npm ci` en 87 s, puis 5 671 tests
  passés sur 567 fichiers, aucun échec, en 113 s.
- **Les lots 549 à 552 ne sont pas reçus en production.** Le dernier reçu écrit
  est le lot 548. Le lot 551 embarque une migration.
- **Fusionner sur `main` ne déploie rien.** Livrer demande deux actes manuels :
  construire l'image, puis redéployer la ressource Coolify.
- **Aucun MVP entier n'est reçu** (`CLAUDE.md:415`). Ses cinq étapes :

| Étape | Périmètre | Ce qui reste |
|---|---|---|
| MVP-FUSEE-01 | Le score public | Coût réel du scan, conversion |
| MVP-FUSEE-02 | L'audit guidé et l'import | Parcours client complet en production |
| MVP-FUSEE-03 | Le rapport, sa provenance, ses droits | Qualité commerciale ; chiffres « 80 % / 98 % » non sourcés |
| MVP-FUSEE-04 | Le passage au service : offre, paiement, remise | Identifiants CinetPay, compte d'envoi d'e-mails, offres et prix |
| MVP-FUSEE-05 | La réception du cycle : coût, admission, conservation | Coûts des autres parcours, quota global |

### Ce qu'un agent peut fermer seul

| # | Geste | Référence |
|---|---|---|
| 4.11.a | Le compositeur de production appelle l'outil cible avec une entrée vide | `docs/governance/RESIDUAL-DEBT.md:109-131` |
| 4.11.b | **Fait** (#1165) — Seuil faux du calculateur CODB | `src/server/services/glory-tools/calculators.ts:95` |
| 4.11.c | **Fait** (#1165) — `generateAiFollowUps` teste les clés et ignore le relais OAuth | `src/server/services/quick-intake/question-bank.ts:302-304` |
| 4.11.d | Chiffres non sourcés dans la restitution | `docs/governance/RESIDUAL-DEBT.md:1750-1759` |
| 4.11.e | **Fait** (#1165) — Oracle annonce « 6 sections complètes » pour zéro section rédigée | `docs/governance/RESIDUAL-DEBT.md:3768-3782` |
| 4.11.f | **Fait** (#1165) — Un utilisateur supprimé peut être recréé depuis un jeton encore signé | `docs/governance/RESIDUAL-DEBT.md:3501-3509` |
| 4.11.g | **Fait** (#1165) — Préréglage Lighthouse invalide | `.lighthouserc.json:5` |
| 4.11.h | **Fait** (#1167) — Brancher en CI les huit fichiers de tests PostgreSQL orphelins, et fixer la mémoire du job (M7, M8) | `.github/workflows/ci.yml:73-125` |
| 4.11.i | **Fait** (#1167) — Réparer ou retirer `deploy.yml` et `release.yml` (M10) | `.github/workflows/` |
| 4.11.j | **Fait** (#1168) — 63 alertes de dépendances, dont 9 critiques ; restent 15 moderate d'outillage, sans correctif publié | relevé à l'installation |
| 4.11.k | Formats ADVE anciens hors des schémas stricts | `docs/governance/RESIDUAL-DEBT.md:252-275` |
| 4.11.l | Le document de 112 s sous un plafond de 120 s | `docs/governance/RESIDUAL-DEBT.md:342-352` |

Chacun passe par une ADR quand il est structurant, selon la règle de ce dépôt.

### Ce qui attend le propriétaire

- **Recevoir 549 à 552 en production** : construire l'image, redéployer, relire.
- **Deux secrets** : les identifiants CinetPay et un compte d'envoi d'e-mails.
  Sans eux, l'étape 04 du MVP ne peut pas être reçue.
- **Un piège à connaître** : le workflow `ops-env-fix.yml` cible par défaut
  l'application arrêtée volontairement pour servir de retour arrière. Le lancer
  la redémarre (`.github/workflows/ops-env-fix.yml:16`).
- **Les PR en attente** : 14 ouvertes, dont neuf mises à jour automatiques, #873
  et #875 prêtes depuis le 14 septembre, #696 en conflit depuis le 31 juillet.

## 4 ter. Fusionner les PR ouvertes

**Fait le 11 novembre** : les 31 PR ci-dessous hors `shinkiro` sont fusionnées dans
cet ordre, CI verte. Les conflits de `CHANGELOG` ont été résolus en gardant les deux
listes ; le bloc `JOB_LEASE_S` est dans `deploy/danmem.env.example`. Les déploiements
ont été déclenchés par l'API Coolify, sans attendre l'App GitHub.

- La Fusée : l'image `sha-d52ffad…` a été construite, démarrée en smoke-test, puis
  publiée. La ressource de production est passée de `sha-b9bfbfb…` (6.27.552) à
  `sha-d52ffad…` (6.27.556), sans migration nouvelle : 107 migrations sur 107 étaient
  déjà en base. Revenir en arrière, c'est remettre l'ancien tag et redéployer.
  Même geste ensuite pour #1170 : `sha-564bcc2…`, 6.27.557, toujours 107 migrations
  sur 107 déjà en base, `/api/version` et `/login` à 200. Puis #1171 : `sha-fbbad43…`,
  6.27.558, même résultat. Puis #1172 : `sha-9ec5661…`, 6.27.559, et #1173 : `sha-ccbd083…`, 6.27.560, même résultat ;
  `/status`, `/pricing` et `/lafusee` à 200. Puis #1174 : `sha-4bb5ebb…`, 6.27.561 ;
  `/argos`, `/sitemap.xml` et `/leaderboard` à 200. Puis #1175 : `sha-567f28a…`, 6.27.562,
  la migration additive `20261111120000_recommendation_applied_intent` appliquée au démarrage (108 sur 108). Puis #1176 : `sha-0f2f336…`, 6.27.563, et #1177 : `sha-394856f…`, 6.27.564, puis #1178 : `sha-0e0dd69…`, 6.27.565.
- La Barre et `hermes-cockpit` étaient épinglées dans Coolify sur des commits
  d'octobre. Les épingles sont passées respectivement de `9735c56` à `e771494` et
  de `1ea757b` à `2ec9fe1`, puis à `f8ed2c5` après hermes-cockpit#5. Revenir en arrière, c'est remettre l'ancien SHA dans
  `git_commit_sha` et redéployer. Radar, `galahad-landing` et le portail suivent `HEAD`.
- Les migrations `sql/002` et `sql/003` de `danmem` restent à passer **avant** de
  redémarrer le service de l'hôte. Aucun accès à l'hôte n'est ouvert à un agent.

| Dépôt | Ordre | Ce qu'il faut savoir |
|---|---|---|
| `shinkiro` | #56 | Ce plan. **Fusionnée** le 11 novembre ; portail redéployé, `source.json` servi identique à `main`. |
| `galahad` | #22, #23, #24, #25, #26 | Aucun conflit deux à deux. Le `CHANGELOG` à 0.1.16 se fait après les cinq. |
| `danmem` | #2, #3, #4, #5 | #4 après #3 : conflit `CHANGELOG` à résoudre en gardant les deux listes, et le bloc `JOB_LEASE_S` à ajouter à `deploy/danmem.env.example` (texte dans #4). #5 : conflit `CHANGELOG` seul. En production, la migration `sql/002` passe **avant** le redémarrage. |
| `la-barre` | #14, #15, #17, puis #16 | #16 (README) en dernier : reprendre la ligne `HOST`, la liste des étapes de CI et la ligne `test:decisions`. |
| `character-engine` | #1, puis #2 et #3 | #1 apporte la CI ; #2 et #3 n'en ont pas tant qu'elle n'est pas sur `main`. |
| `charadesign-generator` | #4, puis #5 | Aucun conflit. |
| `datacollector` | #3, puis #4 | Aucun conflit. |
| `hermes-cockpit` | #3, #4 | Aucun conflit. |
| `ADVE-project` | #1165, #1167, #1168 | Versions 6.27.554, 555, 556 : réconcilier la version et la tête du `CHANGELOG` à chaque fusion. Livrer exige ensuite de construire l'image puis de redémarrer la ressource Coolify. |
| `radar`, `Argos-studio`, `talos`, `hulysse`, `galahad-landing`, `market-expansion-system` | une PR chacun | Indépendantes. |

## 5. Les arbitrages attendus

Chacun est posé comme une question. Une réponse courte suffit.

| # | Question | Ce qu'elle débloque |
|---|---|---|
| 5.1 | Quel palier vise-t-on : P1, P2, P3 ou P4 ? | L'ordre de tout le reste |
| 5.2 | Le partage des cockpits est-il celui que montre le code : `galahad/cockpit` pour exécuter dans une installation, `hermes-cockpit` pour observer et exploiter l'hôte ? | 3.2 |
| 5.3 | `talos` et `hulysse` : les archiver comme dépôts historiques, ou les réparer ? Quelles capacités porter dans `galahad` : serveur MCP, mur S7, garde d'isolation ? | 2.7, 4.2 |
| 5.4 | Taxonomies : un écart a-t-il un type ou plusieurs (le Ghana en a deux) ? Se déclare-t-il sur l'adaptation ou sur le couple projet × marché ? | 3.4, 4.10 |
| 5.5 | La Barre → Radar : Radar lit le fichier de La Barre, La Barre pousse, ou un humain dépose un paquet ? | 3.5 |
| 5.6 | Quels indicateurs pour la mesure avant/après, et quelle date de bascule ? | Lot 6 |
| 5.7 | Radar : `ndeg` doit-il devenir unique ? Les flux sont-ils publics par défaut ? Que faire des 125 événements anciens à confidentialité inconnue ? | 4.4 |
| 5.8 | Argos sur le VPS : SQLite sur volume, ou PostgreSQL ? Des comptes, ou une clé unique assumée ? | 4.12 |
| 5.9 | `charadesign-generator` et `datacollector` : outils locaux d'opérateur, ou services ? | 4.14, 4.15 |
| 5.10 | `character-engine` : verser des profils, ou retirer le sélecteur ? | 4.13 |
| 5.11 | `la-fusee-blueprint` : rattraper le canon (ADR 0083 à 0243), ou assumer une photographie de mai ? | 4.17 |
| 5.12 | `galahad-landing` : quel acheteur, quelle promesse, quel prix ? | 4.16 |
| 5.13 | Critères d'acceptation de Content Operations, modèle de Content Velocity, grille tarifaire | Lot 6 |
| 5.14 | Les PR en attente : #875, #696, #679 sur `ADVE-project` ; les brouillons de `la-fusee-blueprint`, `galahad`, `radar`, `charadesign-generator`. Fusionner ou fermer ? | L'hygiène de chaque dépôt |
| 5.15 | L'admission La Barre écrite pour l'employeur peut-elle entrer dans le canon `radar`, ou doit-elle être réécrite ? | 3.5 ; voir `docs/CLOISON.md` |
| 5.16 | `galahad` suit un profil personnel (`deploy/dan-hermes/wiki-Alexandre_Profil.md`). Doit-il rester dans ce dépôt ? | `docs/CLOISON.md` |
| 5.17 | `wiki-prive` est-il bien `adjacent` ? | Le classement posé le 10 novembre |
| 5.18 | Deux instances de La Fusée hors canon tournent sur le VPS, chacune avec sa base : la lignée archivée `ADVE_v8`, et une branche d'`ADVE-project`. Les arrêter ? | La capacité du VPS ; le classement des lignées |
| 5.19 | ~~La Barre en production a quatre commits de retard sur `main`. Est-ce voulu ?~~ *Tranché le 11 novembre* : l'épingle Coolify est passée de `9735c56` à `e771494` | — |

## 6. Ce qui se fait selon ce qui est débloqué

| Si le propriétaire… | Alors un agent peut… |
|---|---|
| ne fait rien de plus | Les gestes « Agent » restants : 4.11.a, d, k, l ; la garde de couches ESLint inerte (constat de #1168) ; 4.18, qui demande un démon Docker |
| fusionne les 32 PR | *Fait le 11 novembre*, avec cinq ressources Coolify redéployées. Reste à redémarrer les services systemd de l'hôte |
| régénère `FLEET_TOKEN` | Fermer P1 côté flotte |
| donne son accord sur #873 | Fermer 1.2 et 1.3 |
| ouvre une voie vers le VPS | Commencer le lot 5 |
| exporte la définition des chantiers | Écrire 3.7, et rattacher chaque intervention à son chantier |
| tranche les arbitrages 5.2 à 5.5 | Passer SHK-0004 et SHK-0005 en Accepted, écrire leurs signaux d'audit, lancer le câblage |

## Méthode et limites

- Les clones sont superficiels : aucun ajout n'est datable par l'historique.
- Aucune recette n'a été jouée sur le VPS ni sur des données de service.
- Les dépôts employeur et client n'ont pas été ouverts : la cloison l'interdit.
  L'admission La Barre qui s'y trouve n'a donc pas été lue.
- Les classes `[commit]`, `[prod]`, `[secret]`, `[décision]`, `[tiers]` retiennent
  toujours la plus contraignante. Un point `[prod]` contient souvent un commit
  préalable.
- Le nombre de 111 compte des regroupements : une ligne peut fusionner plusieurs
  limites voisines qui se ferment par la même preuve.
