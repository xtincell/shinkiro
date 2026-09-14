# AGENTS.md — construire le vaisseau

Ce fichier existe parce qu'un agent indépendant, mis devant ce dépôt, **ne pouvait pas**
construire Shinkiro. Le README dit ce que chaque composant *est*. Il ne disait pas dans
quel ordre bâtir, comment les pièces se parlent, ni ce qui est déjà fait.

## Avant de commencer

0. **Lis `fleet.yml`, puis lance `make clone-all`.** Le manifeste décrit les dix-sept
   composants — couche, maturité, licence, ordre de construction, vitalité réelle — et la
   commande les matérialise tous à côté de cet index. C'est ton point d'entrée.
   `make build-order` rappelle la séquence, `make status` donne l'état de chacun.
1. **Accès.** La plupart des dépôts sont privés. Sans invitation ou token, tu ne vois rien.
   Demande l'accès avant de planifier quoi que ce soit.
2. **Lis `docs/MATURITE.md` en premier.** Il dit ce qui est fini, bouchonné ou aspirationnel.
   Construire contre le README seul revient à construire contre une fiction.
3. **Lis `docs/CLOISON.md`.** Certains dépôts ne rejoignent jamais ce programme. Ce n'est pas
   négociable.

## Ordre de construction

L'ordre n'est pas arbitraire : chaque étape rend la suivante vérifiable.

| # | Étape | Dépôt | Pourquoi ici |
|---|---|---|---|
| 1 | Le moteur d'agents | `galahad` | Zéro dépendance npm, zéro build. Se lance seul, se vérifie seul. Tout le reste s'y branche. |
| 2 | Le tracker | `radar` | Postgres + Node stdlib. Fournit le **journal d'événements** dont dépend toute mesure avant/après. |
| 3 | Les modules d'agents | `talos`, `hulysse`, `danmem` | Guardian, Traveler, mémoire. Ne les construis pas avant que `galahad` tourne : ce sont des rôles du même moteur. |
| 4 | Le poste de travail | `la-barre` | Aucun serveur, aucun compte. Se teste en ouvrant `index.html`. |
| 5 | La méthode | `ADVE-project` | 150 Mo, 17 workflows, Next.js + Prisma. **Le plus lourd — en dernier.** Lis ses 192 ADR avant de toucher quoi que ce soit. |
| 6 | Les outils spécialisés | `Argos-studio`, `charadesign-generator` | Autonomes, sans dépendance sur le reste. |

**Ne commence jamais par `ADVE-project`.** C'est le dépôt le plus impressionnant et le plus
piégeux : sa gouvernance est stricte, ses ADR font foi, et une modification mal cadrée y
coûte cher.

## Vérifier que ça tourne

Chaque étape a un test de vie. Si celui d'une étape échoue, ne passe pas à la suivante.

```bash
# 1 · galahad — le moteur répond
docker compose -f galahad/docker-compose.yml config
docker compose -f galahad/docker-compose.yml up -d && docker compose logs chef | tail

# 2 · radar — l'API sert et le journal s'écrit
cd radar && npm ci && npm start
curl -s localhost:3000/rest/v1/briefs?limit=1
curl -s localhost:3000/activity.json | head

# 4 · la-barre — rien à installer
open la-barre/index.html    # ou : node servir.mjs 5173

# 5 · ADVE-project — le plus long
cd ADVE-project && npm ci && npx prisma generate && npm test
```

## Ce qui n'est pas écrit ailleurs

- **`radar` reste autonome.** Il se branche sur `galahad`, il ne s'y fond pas. C'est sa valeur :
  une instance = une équipe = une base.
- **`galahad` n'a aucune dépendance npm** dans son moteur. Si tu en ajoutes une, tu casses la
  promesse « zéro build » du README. Justifie-le dans une ADR.
- **Le cerveau agentique est délégué**, pas réécrit. Talos ne réimplémente ni la boucle, ni
  les outils, ni les sessions : il écrit la mémoire stratifiée, la patrouille, le canal, le
  journal, et câble les garde-fous en dur.

## Règles de contribution

- **Une ADR pour toute décision structurante** dans `ADVE-project` — la numérotation continue
  après 0192.
- **Le français est la langue des documents de gouvernance.** Le code et les commentaires
  techniques peuvent rester en anglais.
- **Ne remonte jamais la technologie au catalogue commercial.** Voir `docs/PORTFOLIO.md` :
  ce qui se vend n'est pas ce qui livre.
