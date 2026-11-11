# AGENTS.md — construire le vaisseau

Ce fichier existe parce qu'un agent indépendant, mis devant ce dépôt, **ne pouvait pas**
construire Shinkiro. Le README dit ce que chaque composant *est*. Il ne disait pas dans
quel ordre bâtir, comment les pièces se parlent, ni ce qui est déjà fait.

## Avant de commencer

0. **Lis `fleet.yml`, puis lance `make clone-all`.** Le manifeste décrit les
   composants — couche, maturité, licence, ordre de construction, vitalité réelle — et la
   commande les matérialise tous à côté de cet index. C'est ton point d'entrée.
   `make build-order` rappelle la séquence, `make status` donne l'état de chacun.
1. **Accès.** La plupart des dépôts sont privés. Sans invitation ou token, tu ne vois rien.
   Demande l'accès avant de planifier quoi que ce soit.
2. **Lis `docs/TOPOLOGIE.md`** — les cinq modes de déploiement, les trois points d'entrée
   qui ne sont pas à la racine, et les trois chevauchements structurels. C'est là que se
   trouvent les pièges qu'aucun README ne signale.
3. **Lis `docs/MATURITE.md`.** Il dit ce qui est fini, bouchonné ou aspirationnel.
   Construire contre le README seul revient à construire contre une fiction.
4. **Lis `docs/CLOISON.md`.** Certains dépôts ne rejoignent jamais ce programme. Ce n'est pas
   négociable.

## Ordre de construction

L'ordre n'est pas arbitraire : chaque étape rend la suivante vérifiable.

| # | Étape | Dépôt | Pourquoi ici |
|---|---|---|---|
| 1 | Le moteur d'agents | `galahad` | Zéro dépendance npm, zéro build. Se lance seul, se vérifie seul. Tout le reste s'y branche. |
| 2 | Le tracker | `radar` | Postgres + Node stdlib. Fournit le **journal d'événements** dont dépend toute mesure avant/après. |
| 3 | Les modules d'agents | `talos`, `hulysse`, `danmem` | Guardian, Traveler, mémoire. Ne les construis pas avant que `galahad` tourne. `talos` et `hulysse` sont des dépôts historiques : les services servent une variante de `galahad`. `danmem` est un service distinct, avec sa base. |
| 4 | Le poste de travail | `la-barre` | S'ouvre sans serveur ni compte : `index.html` ouvert seul montre un jeu d'exemple. Ses tests passent par `node --test` et Playwright. En production, Coolify la sert depuis son Dockerfile, sous `powerupgraders.com/la-barre`, derrière la session de La Fusée ; `servir.mjs` n'a pas d'authentification propre. |
| 5 | La méthode | `ADVE-project` | Next.js + Prisma. **Le plus lourd — en dernier.** Consulte le relevé `fleet.lock.yml` et les ADR courantes du dépôt avant de le modifier. |
| 6 | Les outils spécialisés | `Argos-studio`, `charadesign-generator` | Autonomes, sans dépendance sur le reste. |

**Ne commence jamais par `ADVE-project`.** C'est le dépôt le plus impressionnant et le plus
piégeux : sa gouvernance est stricte, ses ADR font foi, et une modification mal cadrée y
coûte cher.

## Vérifier que ça tourne

Chaque étape a un test de vie. Si celui d'une étape échoue, ne passe pas à la suivante.

```bash
# 1 · galahad — la composition se résout, le moteur passe ses tests
cp galahad/.env.example galahad/.env          # puis renseigner GALAHAD_INSTANCE
docker compose -f galahad/docker-compose.yml config -q
(cd galahad/engine && npm test)               # aucune dépendance, aucun Docker
# avec un démon Docker et un .env réel :
docker compose -f galahad/docker-compose.yml up -d
docker compose -f galahad/docker-compose.yml logs chef | tail

# 2 · radar — l'API sert et le journal s'écrit
cd radar && npm ci
DATABASE_URL=postgres://user:motdepasse@localhost:5432/radar npm start
curl -s 'localhost:3000/rest/v1/briefs?limit=1'
curl -s localhost:3000/activity.json | head

# 3 · talos, hulysse, danmem — la syntaxe tient, la mémoire passe ses contrats
(cd talos && npm run check)
(cd hulysse && npm run check)
(cd danmem && npm run check)
# danmem exige une base jetable dédiée, jamais la base de service :
(cd danmem && DANMEM_TEST_DATABASE_URL=postgresql://user:motdepasse@127.0.0.1:5432/shinkiro_danmem_reception_local npm test)

# 4 · la-barre — rien à installer
open la-barre/index.html    # ou : (cd la-barre && node servir.mjs 5173)

# 5 · ADVE-project — le plus long
cd ADVE-project && npm ci && npx prisma generate && npm test
```

Quatre pièges, relevés en rejouant ces tests le 10 novembre 2026 :

- **`galahad` sans `.env` échoue dès `config`** : `GALAHAD_INSTANCE` est requis. Ce
  n'est pas une panne, c'est l'isolation par installation.
- **`radar` sans `DATABASE_URL` démarre quand même** et sert ses pages, mais l'API
  répond 503. Un `curl` qui échoue ne dit donc pas que le serveur est en panne.
- **`talos` et `hulysse` n'ont ni test ni CI.** `npm run check` ne vérifie que la
  syntaxe. Leur vrai test de vie exige un jeton Telegram et un modèle.
- **`npm ci` dans `ADVE-project` installe husky**, qui pose `core.hooksPath` sur le
  clone. Chaque commit y passe ensuite par le lint de gouvernance.

## Ce qui n'est pas écrit ailleurs

- **`radar` reste autonome.** Il se branche sur `galahad`, il ne s'y fond pas. C'est sa valeur :
  une instance = une équipe = une base.
- **`galahad` n'a aucune dépendance npm** dans son moteur. Si tu en ajoutes une, tu casses la
  promesse « zéro build » du README. Justifie-le dans une ADR.
- **Le cerveau agentique se délègue, il ne se réécrit pas.** C'est la règle de la
  convergence, pas encore l'état des dépôts : le dépôt historique `talos` porte sa propre
  boucle, ses outils et ses sessions. Ce que `galahad` doit en recevoir, c'est le reste :
  la mémoire stratifiée, des contrôles de patrouille, et ses garde-fous câblés en dur.

## Règles de contribution

- **Une ADR pour toute décision structurante** dans `ADVE-project` — relever le dernier
  numéro dans `docs/governance/adr/` de ce dépôt avant de réserver le suivant.
- **Le français est la langue des documents de gouvernance.** Le code et les commentaires
  techniques peuvent rester en anglais.
- **Ne remonte jamais la technologie au catalogue commercial.** Voir `docs/PORTFOLIO.md` :
  ce qui se vend n'est pas ce qui livre.


---

## Avant de committer quoi que ce soit dans ce dépôt

```bash
make releve                       # les faits se recalculent, jamais ne s'écrivent
node scripts/signaux-flotte.mjs   # attendu : « COHÉRENT — aucune dérive »
```

Trois règles, et l'audit les fait respecter :

1. **Ne jamais éditer `fleet.lock.yml` à la main.** C'est un relevé. Pour le
   corriger, corrige la réalité puis relance `make releve`.
2. **Ne jamais réintroduire un fait dans `fleet.yml`** — volumétrie, comptage,
   branche, topics. Le signal `faits-dans-le-jugement` refuse la régression.
3. **Un nouveau composant, c'est trois gestes** : le topic `shinkiro` sur le dépôt,
   une entrée dans `fleet.yml`, et `make releve`. Sans le premier il est invisible ;
   sans le second il est non jugé ; l'audit dit lequel manque.

Pour poser une décision qui engage plusieurs composants, lis
[`docs/adr/README.md`](docs/adr/README.md) : une ADR acceptée nomme le contrôle qui
la défend, et ce contrôle doit exister.

Le pourquoi de tout ceci est dans [`docs/DERIVE.md`](docs/DERIVE.md).
