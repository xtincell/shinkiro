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

**B2 — Aucun agent n'a de voie d'accès au VPS.**
Tout est servi par le VPS, et une session d'agent n'y entre pas : ni SSH, ni API
Coolify, ni dossier partagé depuis un poste. Les 27 points `[prod]` en dépendent.

Trois voies possibles, de la plus simple à la plus complète :

| Voie | Ce qu'elle ouvre | Ce qu'elle demande |
|---|---|---|
| Clé API Coolify en lecture | État des déploiements, journaux, images servies | Une clé et l'hôte Coolify autorisé dans l'environnement de la session |
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

### 2.3 Une erreur de diagnostic à ne pas répéter

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
| M5 | `shinkiro` | Aucun signal ne confronte `deploiement.mode` aux artefacts. L'en-tête de `fleet.yml` l'annonce comme une tension surveillée ; elle ne l'est pas. |
| M6 | `shinkiro` | `vitalite: gele` n'est jamais démenti : trois dépôts « gelés » ont des commits récents. |
| M7 | `ADVE-project` | Huit fichiers de tests PostgreSQL ne tournent dans aucun workflow. Les reçus « PostgreSQL isolés » du lot 549 sont donc seulement locaux. |
| M8 | `ADVE-project` | Le job PostgreSQL de la CI ne fixe pas la mémoire de Node. Rejoué ici, il échoue par manque de mémoire sur `tests/integration/asset-original.postgres.test.ts` ; il passe avec 6 Gio. Son vert dépend de la machine. |
| M9 | `ADVE-project` | `scheduled-ops` est vert sans rien appeler quand `PROD_BASE_URL` manque. `lighthouse` a un préréglage invalide. `preflight` mesure l'absence d'un fichier. |
| M10 | `ADVE-project` | `deploy.yml` appelle un script absent. `release.yml` appelle `npm run build:sdk`, qui n'existe pas : il échouerait au premier tag. |

### 3.4 Jugements périmés du manifeste

`fleet.yml` est écrit à la main et ne dérive pas par accident : il dérive parce
que les dépôts avancent. Les jugements de dix composants sont à reprendre.

| Composant | Ce que dit `fleet.yml` | Ce que montre le code |
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

### Lot 1 — Rendre les contrôles mesurables

Sans ce lot, rien de ce qui suit ne peut être déclaré fini.

| # | Dépôt | Geste | Preuve attendue | Prérequis |
|---|---|---|---|---|
| 1.1 | `shinkiro` | Régénérer `FLEET_TOKEN` | Workflow hebdomadaire vert, issue #5 fermée d'elle-même | **Propriétaire** (B1) |
| 1.2 | `ADVE-project` | Fusionner la PR #873 | Une seule issue SLO, à titre stable | **Accord du propriétaire.** Sans effet sur la production : fusionner sur `main` ne déploie rien (`.github/workflows/build-image.yml:19-25`). Mais le job sera rouge toutes les six heures tant que 1.4 n'est pas fait |
| 1.3 | `ADVE-project` | Fermer les 211 issues « SLO breach » | Zéro issue de ce titre | Après 1.2. Agent, sur accord : 211 notifications |
| 1.4 | `ADVE-project`, `galahad` | Mesurer le SLO depuis le VPS, où la base est joignable, plutôt que depuis GitHub | Un relevé SLO daté, lu par le workflow | Arbitrage : procédure `galahad` ou tâche planifiée. Puis B2 |
| 1.5 | `talos`, `hulysse`, `character-engine`, `galahad-landing`, `market-expansion-system` | Une CI minimale par dépôt : syntaxe, liens, gabarits | Cinq workflows verts | Agent |
| 1.6 | `shinkiro` | Signal `mode-dementi` : un mode déclaré sans son artefact est une dérive | Le signal s'allume sur Argos, qui n'a ni Dockerfile ni compose | Agent |
| 1.7 | `shinkiro` | Étendre `vitalite-dementie` aux composants « gelés » qui bougent | Le signal nomme les trois dépôts concernés | Agent |
| 1.8 | `shinkiro` | Faire ouvrir par le workflow une PR du lock rafraîchi | Le geste hebdomadaire devient une fusion | Arbitrage |

### Lot 2 — Fermer les failles

À faire avant toute nouvelle réception en production.

| # | Dépôt | Geste | Preuve attendue | Prérequis |
|---|---|---|---|---|
| 2.1 | `galahad` | Porter dans le garde les motifs que `talos` bloque (S1) | Les 16 commandes sondées deviennent un test, toutes refusées | Agent |
| 2.2 | `galahad` | Rattraper l'erreur d'intégration et la rendre à l'opérateur (F5) | Un test : Radar en 404, le tour répond | Agent |
| 2.3 | `la-barre` | Écouter sur `127.0.0.1` par défaut (S4) | Test de démarrage ; l'image d'entreprise garde son réglage explicite | Agent |
| 2.4 | `Argos-studio` | Monter `next` et les dépendances en alerte (S6) | `npm audit` sans alerte critique, CI verte | Agent |
| 2.5 | `charadesign-generator` | Écoute locale, `.env.example`, `vite` à jour (S7) | CI verte | Agent |
| 2.6 | `datacollector` | Refuser adresses privées et redirections (S8) | Tests des cas refusés | Agent |
| 2.7 | `talos` | Soumettre `radar_delete` à la confirmation (S2), ou archiver le dépôt | Test, ou dépôt archivé | Arbitrage 5.3 |
| 2.8 | VPS | Vérifier le filtrage du terminal `:7681` (S5) | Un reçu : port fermé depuis l'extérieur | B2 |
| 2.9 | Fournisseur | Révoquer la clé en dur de `BrandForge` (S9) | Clé révoquée | **Propriétaire** |

### Lot 3 — Écrire ce qui n'est écrit nulle part

Tout se passe dans ce dépôt. Les faits sont déjà relevés ; il reste à les poser.

| # | Geste | Matière disponible | Prérequis |
|---|---|---|---|
| 3.1 | Le contrat MCP `talos` ↔ `radar` dans `docs/INTERFACES.md` | Transport stdio, sept outils avec leurs appels, douze écarts avec Radar | Agent |
| 3.2 | Le partage des cockpits dans `docs/TOPOLOGIE.md` | Tableau de onze capacités ; deux recouvrements seulement | Agent, puis arbitrage 5.2 |
| 3.3 | Les couches mémoire : qui écrit quoi, et les dix manques avant une restauration recevable | Relevé complet des deux dépôts | Agent |
| 3.4 | Une ADR sur la jointure des taxonomies d'écart | Deux options chiffrées en fichiers touchés | Arbitrage 5.4 |
| 3.5 | Une ADR sur le câblage La Barre → Radar | Trois sens de flux possibles, fichiers à créer de chaque côté | Arbitrages 5.5 et 5.6 |
| 3.6 | Reprendre les jugements périmés de `fleet.yml` et les dix-huit contradictions | Section 3.4 | Agent |
| 3.7 | La définition d'« achevé » | — | **B3** |
| 3.8 | Le contrat de fichier `agent-brains.json` → `cerveau.txt` | Chaîne relevée ; le producteur est sur le VPS | Agent, puis B2 |

### Lot 4 — Réparer, dépôt par dépôt

Dans l'ordre de construction d'AGENTS.md. Une PR par dépôt et par sujet.

| # | Dépôt | Gestes | Prérequis |
|---|---|---|---|
| 4.1 | `galahad` | Documentation des quatre rôles ; `dan-oauth` en CI avec ses dépendances ; `CHANGELOG` à 0.1.16 ; dépendance de l'unité commerciale sur `dan-oauth` ; file morte pour les reçus refusés ; valeurs d'instance en dur dans `deliver.sh` | Agent |
| 4.2 | `galahad` | Recevoir les capacités donneuses : garde d'isolation, contrôles de patrouille, alerte de repli | Arbitrage 5.3 |
| 4.3 | `radar` | README des migrations (F13) ; `npm ci` dans le Dockerfile ; format `RADAR_INSTANCES` | Agent |
| 4.4 | `radar` | Unicité de `ndeg` : aujourd'hui un POST rejoué crée un doublon, et `update` frappe tous les homonymes | Arbitrage 5.7 |
| 4.5 | `danmem` | Version de schéma vérifiée au démarrage (F6) ; bail et remise en file (F7) ; unité et exemple d'environnement dans le dépôt ; défauts morts | Agent |
| 4.6 | `danmem`, `galahad` | Script de sauvegarde et de restauration : base, volume, ordre, gel des écrivains | Agent, puis recette B2 |
| 4.7 | `hermes-cockpit` | README ; configuration morte ; faux positif (F10) ; titre distinct de celui de `galahad` | Agent |
| 4.8 | `la-barre` | F1, F2, F3 ; tests pour `ecarts.js`, `vue-matrice.js`, `registre-radar.js` ; README | Agent |
| 4.9 | `la-barre` | Une fabrique unique pour les huit écrivains de décision | Agent ; prérequis de 3.5 |
| 4.10 | `market-expansion-system` | Gabarits cohérents avec la méthode ; promesse d'import tenue ou retirée (F9) | Arbitrage 5.4 |
| 4.11 | `ADVE-project` | Voir [section 4 bis](#4-bis-la-fusée) | — |
| 4.12 | `Argos-studio` | Artefact de déploiement pour le VPS ; `If-Match` côté Fusée (F14) ; isolation des consultations ; bouchons | Arbitrage 5.8 pour l'hébergement |
| 4.13 | `character-engine` | F8 ; export du vecteur ; contradiction affichée ; tests | Agent |
| 4.14 | `charadesign-generator` | Annulation des retours tardifs ; import validé | Agent ; 5.9 pour le service |
| 4.15 | `datacollector` | CDN figés ; fichiers suivis par erreur ; entrée réelle au manifeste | Agent ; 5.9 pour le service |
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
| 4.11.b | Seuil faux du calculateur CODB | `src/server/services/glory-tools/calculators.ts:95` |
| 4.11.c | `generateAiFollowUps` teste les clés et ignore le relais OAuth | `src/server/services/quick-intake/question-bank.ts:302-304` |
| 4.11.d | Chiffres non sourcés dans la restitution | `docs/governance/RESIDUAL-DEBT.md:1750-1759` |
| 4.11.e | Oracle annonce « 6 sections complètes » pour zéro section rédigée | `docs/governance/RESIDUAL-DEBT.md:3768-3782` |
| 4.11.f | Un utilisateur supprimé peut être recréé depuis un jeton encore signé | `docs/governance/RESIDUAL-DEBT.md:3501-3509` |
| 4.11.g | Préréglage Lighthouse invalide | `.lighthouserc.json:5` |
| 4.11.h | Brancher en CI les huit fichiers de tests PostgreSQL orphelins, et fixer la mémoire du job (M7, M8) | `.github/workflows/ci.yml:73-125` |
| 4.11.i | Réparer ou retirer `deploy.yml` et `release.yml` (M10) | `.github/workflows/` |
| 4.11.j | 63 alertes de dépendances, dont 9 critiques | relevé à l'installation |
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

## 6. Ce qui se fait selon ce qui est débloqué

| Si le propriétaire… | Alors un agent peut… |
|---|---|
| ne fait rien de plus | Lots 1.5 à 1.7, 2.1 à 2.6, 3.1 à 3.3, 3.6, et tous les gestes « Agent » du lot 4 |
| régénère `FLEET_TOKEN` | Fermer P1 côté flotte |
| donne son accord sur #873 | Fermer 1.2 et 1.3 |
| ouvre une voie vers le VPS | Commencer le lot 5 |
| exporte la définition des chantiers | Écrire 3.7, et rattacher chaque intervention à son chantier |
| tranche les arbitrages 5.2 à 5.5 | Écrire les deux ADR et lancer le câblage |

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
