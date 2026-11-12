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

- La Barre, au commit `45dda9c` ;
- `hermes-cockpit`, au commit `ef95e0c` ;
- Radar ;
- `galahad-landing` ;
- La Fusée en 6.27.571.

**Au 12 novembre, midi UTC**, le VPS sert :

- La Fusée en 6.27.584 ;
- La Barre au commit `b1d2031`, et sa vitrine sur données fictives, republiée depuis ce commit ;
- deux instances Radar au commit `3a3e532` : la personnelle, et celle de
  l'agence, qui lit La Barre depuis 11 h 06 UTC et calcule la mesure avant/après ;
- `galahad-landing` réécrite ;
- Argos-studio, avec son espace privé UPgraders et ses vrais 404 (Argos-studio#7, #8).

Les deux copies hors canon de La Fusée sont retirées (ligne 0.66).

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
| 0.55 | `la-barre` et `ADVE-project` : « Clore le bilan de campagne » fige une version par la fabrique de décision (identité stable, numéro, empreinte chaînée, jamais réécrite) ; La Fusée la relit dans la base de La Barre, recalcule son empreinte et la range comme proposition dans les sources de la marque (Intent `INGEST_BARRE_CAMPAIGN_REVIEW`, ADR-0244) (LB4), lot 6.27.566 | [la-barre#19](https://github.com/xtincell/la-barre/pull/19) et [ADVE-project#1180](https://github.com/xtincell/ADVE-project/pull/1180), **fusionnées**, La Barre et La Fusée redéployées ; 11 tests La Barre, 7 de route et 8 PostgreSQL côté La Fusée, rouges avant ; recette croisée locale (versions 1 et 2 reçues, rejeu sans seconde source). Restent : relecture du bilan dans le brief suivant, transmission manuelle version par version, acteur déclaré et non authentifié |
| 0.56 | `ADVE-project` : la route d'admission des observations authentifie avant de lire le corps ; un appel anonyme reçoit 401 sans détail de contrat (défaut constaté en production 6.27.565), lot 6.27.567 | [ADVE-project#1181](https://github.com/xtincell/ADVE-project/pull/1181), **fusionnée** et livrée ; un test rouge sur 6.27.566 puis vert, 5 PostgreSQL sur base neuve ; 401 relu en production |
| 0.57 | `ADVE-project` : un produit retiré du catalogue garde son identifiant ; un nouvel homonyme en reçoit un autre, ses liens ne basculent plus, et seule la restauration de la version qui le contenait le réintroduit. Panneau « Historique du catalogue » sur la page Offre & Pricing (F13, ADR-0205 amendé), lot 6.27.568 | [ADVE-project#1182](https://github.com/xtincell/ADVE-project/pull/1182), **fusionnée** et livrée avec 6.27.569 ; 8 unitaires et 3 PostgreSQL, rouges avant. Règle de réintroduction validée par le propriétaire le 11 novembre |
| 0.58 | `la-barre` et `ADVE-project` : servie derrière La Fusée, chaque nouvelle décision, ligne de journal et version de bilan porte l'identité de la session, scellée par La Fusée à l'enregistrement ; le navigateur ne peut ni la forger, ni la modifier, ni l'effacer (LB3, ADR-0245), lot 6.27.569 | [la-barre#20](https://github.com/xtincell/la-barre/pull/20) et [ADVE-project#1183](https://github.com/xtincell/ADVE-project/pull/1183), **fusionnées**, La Barre et La Fusée redéployées ; 12 tests La Barre et 14 La Fusée, rouges avant, PostgreSQL 9/9, recette croisée locale. Le port de La Barre ne doit être joint que par La Fusée. Immuabilité d'une décision attestée validée par le propriétaire le 11 novembre |
| 0.59 | `hermes-cockpit` : verrou consultatif entre processus sur les fichiers partagés, avec reprise d'un verrou abandonné et refus borné, et `fsync` du répertoire après renommage ; protocole écrit pour les écrivains de l'hôte (CK4) | [hermes-cockpit#6](https://github.com/xtincell/hermes-cockpit/pull/6), **fusionnée** et redéployée ; 12 tests multi-processus, rouges avant (29 à 42 incréments perdus sur 200 sans verrou, aucun avec). Les écrivains de l'hôte ne sont dans aucun dépôt |
| 0.60 | `shinkiro` et `danmem` : le profil d'installation d'une entreprise porte Radar (`radar: true`, base, volumes et secrets propres, aucun réseau partagé avec La Fusée) et la mémoire `danmem` (`danmem: true`, base pgvector, migrations, file `jobs`) ; sauvegarde v3 vérifiée par empreintes, v1/v2 toujours lisibles, profil sans option identique à l'octet (IN4) | [shinkiro#58](https://github.com/xtincell/shinkiro/pull/58) et [danmem#8](https://github.com/xtincell/danmem/pull/8), **fusionnées** ; 27 tests d'installation (10 nouveaux rouges avant), recette Docker réelle sur entreprises fictives : 237 + 8 + 5 tables identiques après restauration, `foreign_id_writer_in_B` en 404 sur 6.27.569. Argos-studio (bibliothèque publique commune) et les rôles Galahad (secrets externes) restent hors du profil, raisons dans `installation/README.md` |
| 0.61 | `radar` : les mots de passe personnels choisis sur `/profil` étaient stockés et sauvegardés en clair (constat de la recette IN4). Ils sont désormais stockés sous empreinte PBKDF2-SHA256 (600 000 itérations, sel aléatoire, comparaison en temps constant), les anciennes valeurs converties à la connexion ou par `server/hash-passwords.js` ; en-tête Basic décodé en UTF-8 | [radar#7](https://github.com/xtincell/radar/pull/7), **fusionnée** et redéployée (`e0e4b38`) ; 11 tests, 8 rouges avant, suite 45/45. Conversion en masse lancée en production après déploiement : 0 entrée, donc aucun mot de passe personnel en clair à convertir. Pas de limitation des tentatives de connexion |
| 0.62 | `ADVE-project` : un identifiant inconnu ou refusé reçoit le même 404, sans message Prisma ni fuite d'existence, dans les 45 routeurs (161 lectures converties) ; refus documentaires typés ; cinq écrivains qui acceptaient une entité d'une autre marque corrigés ; cliquet à 0 lecture `OrThrow` keyée par l'entrée (dette 557) | [ADVE-project#1184](https://github.com/xtincell/ADVE-project/pull/1184), **fusionnée**, livrée avec 6.27.571 ; PostgreSQL deux entreprises 13 rouges sur 14 avant, 14/14 après. Restent `brand-node` (404/403 distincts) et les lectures des services |
| 0.63 | `ADVE-project` : le script lancé au démarrage de l'image ne dépend plus de tRPC (`TypedRefusal` de domaine, converti par un middleware de base) ; garde qui rejoue le bundle du Dockerfile et refuse tout paquet absent de l'image, lot 6.27.571 | [ADVE-project#1185](https://github.com/xtincell/ADVE-project/pull/1185), **fusionnée** et livrée ; image 570 refusée par son test de démarrage, production restée en 6.27.569 jusqu'à la 571 |
| 0.64 | `market-expansion-system` et `la-barre` : un même vocabulaire de types d'écart (`langue`, `marque`, `produit`, `reglementaire`), plusieurs types déclarés sur le couple projet × marché, format `ecarts-marche` v1 lu et écrit des deux côtés ; signal `ecart-types-alignes` ajouté ; SHK-0004 Accepted, option C (ME2, arbitrage 5.4) | [market-expansion-system#2](https://github.com/xtincell/market-expansion-system/pull/2) et [la-barre#21](https://github.com/xtincell/la-barre/pull/21), **fusionnées**, La Barre redéployée (`45dda9c`) ; 11 et 42 tests, rouges avant. Le classement du cas Bonnet Rouge est à requalifier par le propriétaire ; une adaptation qui sort de son écart déclaré n'en produit pas encore |
| 0.65 | `Argos-studio` : clé unique `ARGOS_ADMIN_KEY` pour toute écriture et l'administration (session signée, comparaison en temps constant, fermé sans clé), image Docker, SQLite sur le volume `/data` avec sauvegarde à chaud (AR3, arbitrage 5.8). Déployé sur le VPS : https://argos.76-13-128-23.sslip.io, 8 dossiers publics du dépôt admis | [Argos-studio#6](https://github.com/xtincell/Argos-studio/pull/6), **fusionnée** ; 39 tests et 24 Playwright (14 et 17 rouges avant), recette Docker de 22 contrôles. En production : lecture 200, écriture sans clé 401, administration redirigée vers la connexion. La Fusée lit encore son journal (13 dossiers) : la projection de ces dossiers vers le studio passe par la console, puis `ARGOS_STUDIO_URL` ; espace privé fait (ligne 0.72) |
| 0.66 | VPS : les deux copies de La Fusée hors canon sont retirées (arbitrage 5.18) — `lafusee-v7` (branche d'`ADVE-project`) et `lafusee-v8` (lignée `ADVE_v8`), avec leurs bases `lafusee-v7-db` et `lafusee-db` ; variable morte `LAFUSEE_DATABASE_URL` retirée de `hermes-cockpit`, que son code ne lit pas. Partage des cockpits confirmé (5.2) et défendu par le signal `frontiere-cockpits` ; `talos` et `hulysse` passent en `vitalite: archive` (5.3) | Sauvegardes `pg_dump` réussies avant suppression (54 657 et 118 802 octets), conservées sur le VPS sous `/data/coolify/backups/databases/root-team-0/` ; la suppression d'une base n'efface pas ce dossier. Production `lafusee-postgres` et l'application de repli intactes, `/api/version` en 200 ; anciens domaines en 503. Archivage GitHub des deux dépôts : geste du propriétaire |
| 0.67 | `galahad`, `galahad-landing`, `market-expansion-system`, `wiki-prive` : pont MCP Radar avec suppression sous confirmation, garde d'isolation d'`hulysse` et mur S7 de `talos` repris dans le moteur 0.1.17 (5.3) ; landing réécrite pour le dirigeant d'agence, avec le prix de Content Operations (5.12) ; écarts Bonnet Rouge typés selon les SKU distribués, seul le master reste sans écart, le Ghana porte `langue+marque+produit` ; profil personnel sorti de `galahad` vers `wiki-prive` (5.16) | [galahad#29](https://github.com/xtincell/galahad/pull/29) (238 tests, 25 rouges avant), [galahad-landing#3](https://github.com/xtincell/galahad-landing/pull/3) redéployée et servie, [market-expansion-system#3](https://github.com/xtincell/market-expansion-system/pull/3) (11 tests), [galahad#28](https://github.com/xtincell/galahad/pull/28) et [wiki-prive#1](https://github.com/xtincell/wiki-prive/pull/1), **fusionnées**. Recette Docker d'isolation de galahad jouée par la CI, pas sur le VPS ; la landing porte une illustration marquée fictive et deux termes de service à valider |
| 0.68 | `la-barre` et `radar` : câblage des décisions, sens 1 de SHK-0005 (arbitrages 5.5 et 5.6) — La Barre sert ses seules décisions sur `GET /radar/decisions` derrière `BARRE_RADAR_TOKEN` ; Radar les lit, en reçus versionnés sans doublon, privées, hors du journal et des flux. Radar : `ndeg` unique par instance, flux privés par défaut, anciens événements privés jusqu'à relecture (5.7). Nouvelle instance `radar-agence` sur le VPS, base propre, branchée sur La Barre par le réseau interne ; **bascule le 12 novembre 2026 à 11 h 06 UTC** ; signal `decisions-barre-radar`, SHK-0005 Accepted | [la-barre#22](https://github.com/xtincell/la-barre/pull/22) (6 tests), [radar#8](https://github.com/xtincell/radar/pull/8) (12 tests), [radar#9](https://github.com/xtincell/radar/pull/9) (69/69, 13 rouges avant), **fusionnées** et déployées. Production : première lecture « reçue », zéro décision, puis « inchangé » (304). Radar personnel migré après sauvegarde (164 Ko) : 4 codes en double, 4 dossiers renommés et tracés, 1 ancien rattachement ambigu conservé ; ses flux répondent 401. Le calcul des indicateurs n'est pas écrit |
| 0.69 | `la-barre` : une adaptation hors de son écart déclaré est signalée, la revue tranche (décision du 12 novembre, SHK-0004) ; vitrine du brief-au-BAT sur une marque fictive, démonstration isolée (LB6) | [la-barre#23](https://github.com/xtincell/la-barre/pull/23), **fusionnée** et déployée (12 tests hors écart, rouges avant). Vitrine publiée en distribution statique, extraite du commit `adf4540` et vérifiée (155 fichiers) : https://la-barre-vitrine.powerupgraders.com. Pages en 200, fichiers du dépôt en 404, démonstration chargée sans erreur dans Chromium |
| 0.70 | `character-engine` : cinq profils d'exemple, marqués fictifs (5.10) ; `la-fusee-blueprint` : livre et vue rattrapés sur le canon actuel (5.11) | [character-engine#4](https://github.com/xtincell/character-engine/pull/4) et [la-fusee-blueprint#4](https://github.com/xtincell/la-fusee-blueprint/pull/4), **fusionnées** |
| 0.71 | `ADVE-project` : lots 6.27.572 à 6.27.580 — restitution d'intake sans statistiques non sourcées (4.11.d), garde de couches ESLint réparée, compositeur sans appel à entrées vides (4.11.a), grand document en 2 s (4.11.l), transaction de vente sérialisée rejouée après attente, marque non évaluée plus affichée à zéro, canaux et calendrier du playbook repris des pièces de référence, canons de démonstration au bon contrat et deux nombres retirés au modèle, contrôle SLO sans issue par exécution (1.2, 1.3) | [#1188](https://github.com/xtincell/ADVE-project/pull/1188), [#1189](https://github.com/xtincell/ADVE-project/pull/1189), [#1190](https://github.com/xtincell/ADVE-project/pull/1190), [#1191](https://github.com/xtincell/ADVE-project/pull/1191), [#1192](https://github.com/xtincell/ADVE-project/pull/1192), [#1150](https://github.com/xtincell/ADVE-project/pull/1150), [#1152](https://github.com/xtincell/ADVE-project/pull/1152), [#696](https://github.com/xtincell/ADVE-project/pull/696), [#873](https://github.com/xtincell/ADVE-project/pull/873), **fusionnées** dans l'ordre et livrées le 12 novembre : image du commit `6ea7abd` (build 43207899853, test de démarrage vert), `/api/version` 6.27.580, 108 migrations déjà en base, `/login` 200, écritures anonymes refusées 401. Les anciennes PR #696 et #873 relèvent du tri 5.14 |
| 0.72 | `Argos-studio` : espace privé UPgraders, lu par la seule clé d'administration et purgé 24 mois après sa dernière modification (ADR-0010 du dépôt). Sans clé, un dossier privé répond comme une adresse inconnue et n'apparaît dans aucune liste, recherche ou exportation ; publier revérifie les règles d'admission ; purge quotidienne avec aperçu à blanc. `la-barre` : notice de la vitrine publiée | [Argos-studio#7](https://github.com/xtincell/Argos-studio/pull/7) (53/53 tests, 13 rouges avant ; Playwright 25/25 ; recette Docker verte en CI après correction de son attente de page), **fusionnée** et déployée : migration additive appliquée, 8 dossiers publics identiques avant et après, purge active, admission privée et purge sans clé 401. [la-barre#24](https://github.com/xtincell/la-barre/pull/24), **fusionnée**, La Barre redéployée sur `86efbf2`. Une page dynamique inconnue répond encore 200 avec la page introuvable (défaut antérieur, suivi à part) |
| 0.73 | `ADVE-project` : les cinq mises à jour Dependabot reprises en un lot — actions Docker `setup-buildx` v4, `login` v4, `build-push` v7 ; `recharts` 3.10.1 ; `commitlint` 21.2.4 —, lot 6.27.581. Fin du tri 5.14 sur ce dépôt : aucune PR ouverte | [#1193](https://github.com/xtincell/ADVE-project/pull/1193), **fusionnée** et livrée : image du commit `ff6a0d0` construite par les nouvelles actions (build 43210242262, test de démarrage vert), `/api/version` 6.27.581, 108 migrations déjà en base, `/login` 200, écritures anonymes 401. #483, #484, #701, #702 et #703 fermées avec un renvoi vers #1193 |
| 0.74 | `ADVE-project` : la projection d'un dossier vers le studio Argos lit la version courante et envoie `If-Match` ; un conflit est nommé (`VERSION_CONFLICT`, `VISIBILITY_CONFLICT`) au lieu d'être lu comme une panne (F14), lot 6.27.582 | [#1194](https://github.com/xtincell/ADVE-project/pull/1194), **fusionnée** et livrée : 13 tests (6 rouges avant), suite unitaire 5 952 verte ; `/api/version` 6.27.582, `/login` 200. Slugs et versions recalculés identiques sur le studio public, en lecture seule. Reste la projection réelle des 13 dossiers depuis la console |
| 0.75 | `radar` : la mesure avant/après des trois familles de 5.6 (`/mesure/avant-apres`, page `briefs/mesure.html`), fenêtres égales autour de la bascule, dossiers « à cheval » à part, assise `n` sur chaque chiffre, filtres de confidentialité de la REST | [radar#10](https://github.com/xtincell/radar/pull/10), **fusionnée** et déployée sur les deux instances ; 9 cas rouges puis verts, suite 78/78, 12 contre-épreuves. `MESURE_BASCULE` posée à `2026-11-12T11:06:21Z` sur l'instance de l'agence ; le relevé de production répond, fenêtres tronquées et vides le disant, 401 sans clé |
| 0.76 | `la-barre` : écarter un écart avec motif puis le reprendre, par la fabrique de décision (4.8, F4). `galahad` : mémoire stratifiée, contrôles de patrouille et alerte de repli repris de Talos, moteur 0.1.18 (4.1, 4.2). `Argos-studio` : une page inconnue ou privée sans clé répond 404 | [la-barre#25](https://github.com/xtincell/la-barre/pull/25) (9 rouges puis verts, La Barre redéployée sur `b062469`) ; [galahad#30](https://github.com/xtincell/galahad/pull/30) (267/267, 25 rouges avant ; mise en service sur l'hôte : B2) ; [Argos-studio#8](https://github.com/xtincell/Argos-studio/pull/8) (56/56, Playwright 26/26, recette Docker verte, redéployée : `/work/<inconnu>` et `/brand/<inconnu>` en 404, pages publiques en 200), **fusionnées** |
| 0.77 | `character-engine` : « NOUVEAU VECTEUR » ne sort plus toujours un TANK (200 sur 200 avant, six rôles répartis après). `datacollector` : Tailwind servi localement avec son empreinte (4.15). `charadesign-generator` : étapes partielles affichées comme telles, retours tardifs d'image sans écrasement (4.14) | [character-engine#5](https://github.com/xtincell/character-engine/pull/5), [datacollector#7](https://github.com/xtincell/datacollector/pull/7), [charadesign-generator#6](https://github.com/xtincell/charadesign-generator/pull/6), **fusionnées** ; outils locaux, rien à déployer. Recette de charadesign avec un vrai fournisseur : clés Anthropic et OpenAI |
| 0.78 | `la-barre` : identifiants de décision uniques entre postes (`DEC-<poste>-<12>`), renommage tracé en cas de collision, jamais de fusion de deux décisions ; l'import de fichier passe par la fabrique et ne retire plus aucune décision du registre ; le serveur refuse une base qui dupliquerait ou remplacerait une décision (4.9). Vitrine republiée depuis ce commit | [la-barre#26](https://github.com/xtincell/la-barre/pull/26), **fusionnée** et déployée sur `b1d2031` (30 rouges avant, 266 tests verts, Playwright vert) ; contrat `GET /radar/decisions` inchangé, Radar agence lit toujours. Vitrine : distribution de `b1d2031` vérifiée, chargée sans erreur |
| 0.79 | `ADVE-project` : inventaire en lecture seule des formes ADVE hors schéma strict (`npm run audit:adve-shapes`), étape 1 de la dette « Formats ADVE legacy » (4.11.k) ; un enum absent n'est plus classé « hors énumération », lot 6.27.583 | [#1195](https://github.com/xtincell/ADVE-project/pull/1195), **fusionnée** et livrée (`/api/version` 6.27.583, `/login` 200). Sur les canons : 623 chemins refusés, dont 346 comptés présents par la maturité ; UPgraders et La Fusée VALIDATED à 100 % malgré 7 à 46 refus chacun. Lancement en production et normalisation : revue humaine |
| 0.80 | `ADVE-project` : l'inventaire des formes ADVE est bundlé dans l'image de production (`node adve-shapes-audit.cjs`), garde des paquets étendue, lot 6.27.584 ; puis **lancé sur la base de production** par une tâche Coolify ponctuelle, supprimée après usage | [#1196](https://github.com/xtincell/ADVE-project/pull/1196) et [#1197](https://github.com/xtincell/ADVE-project/pull/1197), **fusionnées** ; 6.27.584 livrée. Lecture `READ ONLY` / `REPEATABLE READ` confirmée, 4 s : 69 stratégies, 274 piliers, 263 refusés ; 2 691 chemins (708 valeurs présentes refusées, dont 546 comptées présentes ; 1 422 absents à côté de clés hors schéma ; 561 absents). Sortie nominative hors dépôt |

### Lot 1 — Rendre les contrôles mesurables

Sans ce lot, rien de ce qui suit ne peut être déclaré fini.

| # | Dépôt | Geste | Preuve attendue | Prérequis |
|---|---|---|---|---|
| 1.1 | `shinkiro` | Régénérer `FLEET_TOKEN` | Workflow hebdomadaire vert, issue #5 fermée d'elle-même | **Propriétaire** (B1) |
| 1.2 | `ADVE-project` | Fusionner la PR #873 | Une seule issue SLO, à titre stable | **Fait le 12 novembre** (tri 5.14, lot 6.27.580). Le contrôle restera rouge, sans ouvrir d'issue, tant que 1.4 n'est pas fait |
| 1.3 | `ADVE-project` | Fermer les 211 issues « SLO breach » | Zéro issue de ce titre | **Confié au workflow** depuis #873 : un job ferme les anciennes issues, avec un commentaire, à chaque passage planifié, jusqu'à épuisement (216 comptées à la fusion). À constater après le prochain passage |
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
| 2.7 | `talos` | **Fait** — dépôt en `archive` (5.3) ; `radar_delete` passe sous confirmation dans le pont MCP de `galahad` ([galahad#29](https://github.com/xtincell/galahad/pull/29)) | Test, ou dépôt archivé | Archivage GitHub : propriétaire |
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
| 3.1 | Le contrat MCP avec `radar` dans `docs/INTERFACES.md` | **Fait** — pont repris par `galahad` (galahad#29) ; trois écarts fermés, six ouverts ou à vérifier | — |
| 3.2 | Le partage des cockpits dans `docs/TOPOLOGIE.md` | **Fait** — tableau de onze capacités, partage confirmé (5.2), signal `frontiere-cockpits` | — |
| 3.3 | Les couches mémoire : qui écrit quoi, et les dix manques avant une restauration recevable | **Fait** le 10 novembre, dans `docs/INTERFACES.md` ; la restauration elle-même reste à recevoir (4.6) | Recette B2 |
| 3.4 | Une ADR sur la jointure des taxonomies d'écart | **Accepted** : [SHK-0004](adr/SHK-0004-jointure-des-taxonomies-ecart.md), option C ; hors écart signalé (la-barre#23) | — |
| 3.5 | Une ADR sur le câblage La Barre → Radar | **Accepted** : [SHK-0005](adr/SHK-0005-cablage-la-barre-radar.md), sens 1, en production depuis le 12 novembre (ligne 0.68), signal `decisions-barre-radar` ; calcul de la mesure fait (ligne 0.75) | Saisie projet ↔ dossier dans Radar : usage |
| 3.6 | Reprendre les jugements périmés de `fleet.yml` et les dix-huit contradictions | **Fait** le 10 novembre : seize contradictions corrigées à la source, deux journaux datés laissés tels quels ; jugements repris à chaque lot depuis | — |
| 3.7 | La définition d'« achevé » | — | **B3** |
| 3.8 | Le contrat de fichier `agent-brains.json` → `cerveau.txt` | **Écrit** dans `docs/INTERFACES.md` ; le maillon central reste hors git | Verser le script de l'hôte dans un dépôt : B2 |

### Lot 4 — Réparer, dépôt par dépôt

Dans l'ordre de construction d'AGENTS.md. Une PR par dépôt et par sujet.

| # | Dépôt | Gestes | Prérequis |
|---|---|---|---|
| 4.1 | `galahad` | **Faits** : rôles (galahad#23), `dan-oauth` en CI et reçus refusés (galahad#24), unité commerciale et `deliver.sh` (galahad#25), CHANGELOG reconstitué jusqu'à 0.1.18 (galahad#30). L'appel `release` vers Danmem n'est pas nécessaire : le seul consommateur termine chaque travail ; le cas « disque plein » est un choix de politique laissé au propriétaire | B2 pour la version servie |
| 4.2 | `galahad` | **Fait** ([galahad#29](https://github.com/xtincell/galahad/pull/29), [galahad#30](https://github.com/xtincell/galahad/pull/30), moteur 0.1.18) — pont MCP Radar, garde d'isolation, mur S7, mémoire stratifiée, contrôles de patrouille, alerte de repli ; sessions nommées, cron, briefing et veille étaient déjà couverts. Le rappel horaire et la sonde Coolify de Talos ne sont pas repris, avec leurs raisons | Mise en service sur l'hôte : B2 |
| 4.3 | `radar` | README des migrations (F13) ; `npm ci` dans le Dockerfile ; format `RADAR_INSTANCES` | **Fait** — radar#6 |
| 4.4 | `radar` | **Fait** ([radar#9](https://github.com/xtincell/radar/pull/9)) — `ndeg` unique par instance, homonymes renommés sans perte, flux privés par défaut ; en production sur les deux instances (ligne 0.68) | — |
| 4.5 | `danmem` | **Faits** : F6 (danmem#2), unité, environnement et défauts morts (danmem#3), bail et remise en file F7 (danmem#4, à fusionner après #3). Restent l'appel de `release` côté Galahad et la relecture de l'unité servie | B2 pour l'unité servie |
| 4.6 | `danmem`, `galahad` | **Écrit et éprouvé localement** (danmem#5, galahad#26). Reste la recette sur le VPS : noms réels, version de `pg_dump`, volume, stockage hors hôte | Recette B2 |
| 4.7 | `hermes-cockpit` | F10, titre et README **faits** (hermes-cockpit#3, #4) ; reste la configuration morte du compose | Arbitrage : retirer des montages de production |
| 4.8 | `la-barre` | F1, F2 (la-barre#14), F3 et les tests (la-barre#15), README (la-barre#16), écarter et reprendre un écart (la-barre#25) **faits**. Restent `facturable`, jamais lu, et les outils du poste dédié coupés par la session | Arbitrage pour `facturable` et pour les outils |
| 4.9 | `la-barre` | **Fait** (la-barre#17, la-barre#26) — fabrique de décision, identifiants uniques entre postes, import par la fabrique. Restent les identifiants des autres objets (projets, livrables) et l'écriture directe du fichier, non contrôlée | — |
| 4.10 | `market-expansion-system` | **Fait** (market-expansion-system#2, #3) — gabarits cohérents avec la méthode et ses types d'écart ; la promesse d'import vise La Barre, et le README dit que `cadrage-briefs.csv` ne s'importe pas tel quel dans Radar (F9) | — |
| 4.11 | `ADVE-project` | Voir [section 4 bis](#4-bis-la-fusée) | — |
| 4.12 | `Argos-studio` | **Faits** : déploiement sur le VPS (Argos-studio#6), espace privé (Argos-studio#7), vrais 404 (Argos-studio#8), `If-Match` côté Fusée (F14, #1194). Reste la projection réelle des 13 dossiers depuis la console | Propriétaire (console) |
| 4.13 | `character-engine` | **Fait** : F8 (character-engine#2), export et contradictions (character-engine#3), cinq profils d'exemple fictifs (character-engine#4, 5.10), « NOUVEAU VECTEUR » réparé et testé à graine fixe en CI (character-engine#5) | — |
| 4.14 | `charadesign-generator` | **Fait** (charadesign-generator#5, #6) ; outil local (5.9). Reste la recette navigateur avec fournisseur | Clés Anthropic et OpenAI |
| 4.15 | `datacollector` | **Fait** (datacollector#4, #7) ; outil local (5.9), Tailwind servi localement avec son empreinte | — |
| 4.16 | `galahad-landing` | **Fait** ([galahad-landing#3](https://github.com/xtincell/galahad-landing/pull/3)), servie sur `galahad.powerupgraders.com` | — |
| 4.17 | `la-fusee-blueprint` | **Fait** (la-fusee-blueprint#4) — livre et vue rattrapés sur le canon actuel | — |
| 4.18 | `installation` | **Fait** (IN4, ligne 0.60) — Radar et la mémoire `danmem` dans le profil, responsable rattaché par son compte ordinaire ; Argos-studio et les rôles Galahad écartés avec leurs raisons | Recette B2 sur le VPS |

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
| 4.11.a | **Fait** (#1190) — Le compositeur de production appelle l'outil cible avec une entrée vide | `docs/governance/RESIDUAL-DEBT.md:109-131` |
| 4.11.b | **Fait** (#1165) — Seuil faux du calculateur CODB | `src/server/services/glory-tools/calculators.ts:95` |
| 4.11.c | **Fait** (#1165) — `generateAiFollowUps` teste les clés et ignore le relais OAuth | `src/server/services/quick-intake/question-bank.ts:302-304` |
| 4.11.d | **Fait** (#1188) — Chiffres non sourcés dans la restitution | `docs/governance/RESIDUAL-DEBT.md:1750-1759` |
| 4.11.e | **Fait** (#1165) — Oracle annonce « 6 sections complètes » pour zéro section rédigée | `docs/governance/RESIDUAL-DEBT.md:3768-3782` |
| 4.11.f | **Fait** (#1165) — Un utilisateur supprimé peut être recréé depuis un jeton encore signé | `docs/governance/RESIDUAL-DEBT.md:3501-3509` |
| 4.11.g | **Fait** (#1165) — Préréglage Lighthouse invalide | `.lighthouserc.json:5` |
| 4.11.h | **Fait** (#1167) — Brancher en CI les huit fichiers de tests PostgreSQL orphelins, et fixer la mémoire du job (M7, M8) | `.github/workflows/ci.yml:73-125` |
| 4.11.i | **Fait** (#1167) — Réparer ou retirer `deploy.yml` et `release.yml` (M10) | `.github/workflows/` |
| 4.11.j | **Fait** (#1168) — 63 alertes de dépendances, dont 9 critiques ; restent 15 moderate d'outillage, sans correctif publié | relevé à l'installation |
| 4.11.k | **Étape 1 faite et lancée en production** (#1195, #1196, #1197) — 2 691 chemins inventoriés sur 69 stratégies ; normalisation soumise à revue humaine | `docs/governance/RESIDUAL-DEBT.md` (« Formats ADVE legacy ») |
| 4.11.l | **Fait** (#1191) — Le document de 112 s sous un plafond de 120 s | `docs/governance/RESIDUAL-DEBT.md:342-352` |

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
  *Au 12 novembre : aucune PR ouverte sur ce dépôt (tri 5.14, lignes 0.71 et 0.73).*

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
  la migration additive `20261111120000_recommendation_applied_intent` appliquée au démarrage (108 sur 108). Puis #1176 : `sha-0f2f336…`, 6.27.563, et #1177 : `sha-394856f…`, 6.27.564, puis #1178 : `sha-0e0dd69…`, 6.27.565, puis #1180 : `sha-d085132…`, 6.27.566, toujours 108 migrations sur 108 ; `/la-barre/bilan` refuse l'appel anonyme en 401. Puis #1181 : `sha-4ff1c14…`, 6.27.567 ; `/api/ingest/metrics` répond désormais 401 à un appel anonyme, au lieu de 400 avec le détail du contrat. Puis #1182 et #1183 ensemble : `sha-e079613…`, 6.27.569 (l'image 568 seule a été remplacée par celle-ci avant d'être livrée), toujours 108 migrations sur 108. L'image 570 (#1184) a été refusée par son test de démarrage : un service importait `@trpc/server`, absent de l'image ; corrigé par #1185, `sha-c9858bc…`, 6.27.571, livrée avec les refus typés de la 570.
- La Barre et `hermes-cockpit` étaient épinglées dans Coolify sur des commits
  d'octobre. Les épingles sont passées respectivement de `9735c56` à `e771494`, puis à `f3bc903`
  après la-barre#19, à `49e5744` après la-barre#20 et à `45dda9c` après la-barre#21, et de `1ea757b` à `2ec9fe1`, puis à `f8ed2c5` après hermes-cockpit#5 et à `ef95e0c` après hermes-cockpit#6. Revenir en arrière, c'est remettre l'ancien SHA dans
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
| 5.1 | ~~Quel palier vise-t-on : P1, P2, P3 ou P4 ?~~ *Tranché le 11 novembre* : P2, chaque point `[commit]` fermé, PR fusionnée, CI verte | — |
| 5.2 | ~~Le partage des cockpits est-il celui que montre le code : `galahad/cockpit` pour exécuter dans une installation, `hermes-cockpit` pour observer et exploiter l'hôte ?~~ *Tranché le 11 novembre* : oui, ce partage ; signal `frontiere-cockpits` | 3.2 |
| 5.3 | ~~`talos` et `hulysse` : les archiver comme dépôts historiques, ou les réparer ? Quelles capacités porter dans `galahad` : serveur MCP, mur S7, garde d'isolation ?~~ *Tranché le 11 novembre* : archiver ; porter dans `galahad` le pont MCP de Radar (suppression sous confirmation) et la garde d'isolation | 2.7, 4.2 |
| 5.4 | ~~Taxonomies : un écart a-t-il un type ou plusieurs (le Ghana en a deux) ? Se déclare-t-il sur l'adaptation ou sur le couple projet × marché ?~~ *Tranché le 11 novembre* : plusieurs types possibles, déclarés sur le couple projet × marché | 3.4, 4.10 |
| 5.5 | ~~La Barre → Radar : Radar lit le fichier de La Barre, La Barre pousse, ou un humain dépose un paquet ?~~ *Tranché le 11 novembre* : Radar lit La Barre | 3.5 |
| 5.6 | ~~Quels indicateurs pour la mesure avant/après, et quelle date de bascule ?~~ *Tranché le 12 novembre* : les trois familles — durée et ponctualité (Radar), reprises et tours en trop (La Barre), réouvertures, réattributions, reports et révisions (Radar) ; bascule le jour où Radar commence à lire La Barre en production | Lot 6 |
| 5.7 | ~~Radar : `ndeg` doit-il devenir unique ? Les flux sont-ils publics par défaut ? Que faire des 125 événements anciens à confidentialité inconnue ?~~ *Tranché le 12 novembre* : `ndeg` unique par instance, homonymes dédoublonnés sans perte ; flux privés par défaut ; les 125 anciens événements traités comme privés jusqu'à relecture | 4.4 |
| 5.8 | ~~Argos sur le VPS : SQLite sur volume, ou PostgreSQL ? Des comptes, ou une clé unique assumée ?~~ *Tranché le 11 novembre* : SQLite sur volume et une clé unique pour l'administration | 4.12 |
| 5.9 | ~~`charadesign-generator` et `datacollector` : outils locaux d'opérateur, ou services ?~~ *Tranché le 12 novembre* : outils locaux d'opérateur, mode `poste` dans `fleet.yml`, aucun hébergement | 4.14, 4.15 |
| 5.10 | ~~`character-engine` : verser des profils, ou retirer le sélecteur ?~~ *Tranché le 12 novembre* : verser des profils d'exemple, marqués fictifs | 4.13 |
| 5.11 | ~~`la-fusee-blueprint` : rattraper le canon (ADR 0083 à 0243), ou assumer une photographie de mai ?~~ *Tranché le 12 novembre* : rattraper le canon actuel | 4.17 |
| 5.12 | ~~`galahad-landing` : quel acheteur, quelle promesse, quel prix ?~~ *Tranché le 12 novembre* : le dirigeant d'agence ; « votre agence avance, même quand vous n'y êtes pas » ; Content Operations à partir de 900 K FCFA par mois, fourchette 900 K – 3 M ; fait (ligne 0.67) | 4.16 |
| 5.13 | Critères d'acceptation de Content Operations, modèle de Content Velocity, grille tarifaire — *12 novembre* : proposition rédigée, **à valider** ([`PROPOSITION-OFFRES.md`](PROPOSITION-OFFRES.md)) ; la grille ne se fixe qu'après deux pilotes mesurés | Lot 6 |
| 5.14 | ~~Les PR en attente : #875, #696, #679 sur `ADVE-project` ; les brouillons de `la-fusee-blueprint`, `galahad`, `radar`, `charadesign-generator`. Fusionner ou fermer ?~~ *Tranché le 11 novembre* : tri délégué, fusion de ce qui est juste et vert, fermeture motivée du reste ; **fait le 12 novembre** sur `ADVE-project` : #696 et #873 remises à jour et livrées, les cinq mises à jour Dependabot reprises dans #1193, aucune PR ouverte (lignes 0.71 et 0.73) | L'hygiène de chaque dépôt |
| 5.15 | ~~L'admission La Barre écrite pour l'employeur peut-elle entrer dans le canon `radar`, ou doit-elle être réécrite ?~~ *Tranché le 12 novembre* : réécrite neuve dans `radar`, sans rien reprendre de l'employeur | 3.5 ; voir `docs/CLOISON.md` |
| 5.16 | ~~`galahad` suit un profil personnel (`deploy/dan-hermes/wiki-Alexandre_Profil.md`). Doit-il rester dans ce dépôt ?~~ *Tranché le 12 novembre* : non ; il vit dans `wiki-prive` ([wiki-prive#1](https://github.com/xtincell/wiki-prive/pull/1)), retiré de galahad ([galahad#28](https://github.com/xtincell/galahad/pull/28)) | `docs/CLOISON.md` |
| 5.17 | ~~`wiki-prive` est-il bien `adjacent` ?~~ *Tranché le 12 novembre* : oui | Le classement posé le 10 novembre |
| 5.18 | ~~Deux instances de La Fusée hors canon tournent sur le VPS, chacune avec sa base : la lignée archivée `ADVE_v8`, et une branche d'`ADVE-project`. Les arrêter ?~~ *Tranché le 11 novembre* : arrêter et supprimer, après sauvegarde ; fait (ligne 0.66) | La capacité du VPS ; le classement des lignées |
| 5.19 | ~~La Barre en production a quatre commits de retard sur `main`. Est-ce voulu ?~~ *Tranché le 11 novembre* : l'épingle Coolify est passée de `9735c56` à `e771494` | — |

## 6. Ce qui se fait selon ce qui est débloqué

| Si le propriétaire… | Alors un agent peut… |
|---|---|
| ne fait rien de plus | Plus aucun geste « Agent » ouvert. 4.11.k a son étape 1 (#1195) ; les suivantes demandent une revue humaine des formes, puis une écriture par les rails existants |
| fusionne les 32 PR | *Fait le 11 novembre*, avec cinq ressources Coolify redéployées. Reste à redémarrer les services systemd de l'hôte |
| régénère `FLEET_TOKEN` | Fermer P1 côté flotte |
| ~~donne son accord sur #873~~ | *Fait le 12 novembre* : #873 fusionnée au tri 5.14 ; 1.3 se ferme par le workflow |
| ouvre une voie vers le VPS | Commencer le lot 5 |
| exporte la définition des chantiers | Écrire 3.7, et rattacher chaque intervention à son chantier |
| ~~tranche les arbitrages 5.2 à 5.5~~ | *Fait le 12 novembre* : SHK-0004 et SHK-0005 Accepted, signaux `ecart-types-alignes` et `decisions-barre-radar`, câblage en production. Reste le calcul des indicateurs 5.6 |

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
