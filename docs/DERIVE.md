# La dérive, et ce qui la retient

## Ce que ça a coûté

`ADVE-project/docs/governance/adr/0100-argos-hunter-backend-port.md`, daté du
14 juin 2026, ouvre son contexte ainsi :

> Audit (2026-06-14) : Argos n'était **pas déployable** — 0 % de backend.

Le même jour, `Argos-studio` contenait 184 fichiers : une API v1 complète —
`agencies`, `awards`, `brands`, `assets`, `markets`, `references`, `sectors`,
`years`, `ingest/dossier` — un `schema.prisma`, une migration `20260512171730_init`,
un seed, et une bibliothèque qualifiée réelle. Le tout posé en un commit le 15 mai,
intouché depuis.

```bash
gh api 'repos/xtincell/Argos-studio/commits?until=2026-06-14T23:59:59Z&per_page=1'
```

Un mois d'écart. Un backend reconstruit parce que rien, nulle part, ne disait que
l'autre existait. Le coût n'est pas le temps perdu : c'est qu'il y a désormais deux
modèles de dossier de campagne à tenir d'accord, pour toujours.

Ce n'est pas un défaut de rigueur. C'est un défaut d'inventaire vivant, et
documenter davantage ne le répare pas : une documentation écrite à la main dérive
par construction.

## Le remède était déjà écrit

`galahad/engine/skills/audit-coherence.json` :

> *Declared-vs-real consistency audit (read-only) […] The vaccine against the drift
> disease — what a component SAYS it is vs what it DOES.*

Et `galahad/engine/skills/README.md` :

> *A skill is a declarative JSON contract that wraps a light model so it cannot
> drift. The deterministic shell does the work at zero token ; the model judges only
> at explicit `decide` points […] This is the shape of the one component that never
> drifted (the patrol) — generalised.*

Le mécanisme était inventé, éprouvé sur un composant, et formalisé. Il ne restait
qu'à le porter à l'échelle de la flotte. `audit-fleet` est `audit-coherence` d'un
cran au-dessus : le second surveille un agent contre son hôte, le premier surveille
le programme entier contre GitHub.

## 1 · Le manifeste se recalcule

`fleet.yml` mélangeait deux natures qui n'ont pas la même durée de vie.

| Nature | Exemples | Durée de vie |
|---|---|---|
| **Fait** | volumétrie, topics, licence, branche, vitalité, racines, artefacts | périmée au prochain commit |
| **Jugement** | description, `attention`, `manque`, étage, ordre de construction | stable, rédigé par un humain |

Elles sont séparées :

- **`fleet.yml`** — le jugement. Écrit à la main, jamais généré.
- **`fleet.lock.yml`** — les faits. Régénérés par `scripts/releve-flotte.mjs`.

```bash
make releve     # régénère les faits depuis l'API GitHub
make derive     # échoue si le fichier committé ne reflète plus la réalité
```

Le relevé ne mesure **que du déterministe**. La volumétrie est la somme des blobs de
l'arbre, jamais `repos.size` : ce dernier est calculé en tâche de fond par GitHub et
renvoie 0 sur un dépôt fraîchement créé, ce qui faisait diverger deux passes
consécutives. Un chiffre qui bouge sans que rien n'ait bougé fabrique de fausses
dérives, et une alarme qui crie au loup finit par ne plus être lue — c'est ainsi
qu'un `slo-check` a produit 541 issues que personne n'a ouvertes.

**La tension entre les deux fichiers est l'audit.** Trois champs de `fleet.yml`
ressemblent à des faits mais sont des jugements, et c'est leur démenti par le `.lock`
qui constitue un signal :

| Jugement dans `fleet.yml` | Démenti par `fleet.lock.yml` |
|---|---|
| `vitalite: actif` | `commits_90j: 0` |
| `licence: proprietaire` | `licence: ABSENTE` |
| `deploiement: {racine: views}` | `racines: [.]` |

## 2 · Douze contrôles, deux points d'exécution

`scripts/signaux-flotte.mjs` porte les contrôles. Chacun n'écrit **rien** quand tout
va bien, et une ligne par anomalie sinon.

```bash
node scripts/signaux-flotte.mjs              # tous
node scripts/signaux-flotte.mjs non-classe   # un seul
node scripts/signaux-flotte.mjs --strict     # sort en 1 s'il trouve (pour la CI)
```

| Signal | Ce qu'il empêche |
|---|---|
| `non-classe` | un dépôt qui n'est ni dans la flotte ni écarté nommément |
| `absent-du-manifeste` | un dépôt entré dans la flotte sans être jugé |
| `licence-absente` | une licence déclarée sans fichier |
| `vitalite-dementie` | un composant dit actif qui ne l'est plus |
| `racine-fantome` | une racine de déploiement que le dépôt ne porte pas |
| `entree-fantome` | un point d'entrée statique annoncé sous une racine vide |
| `faits-dans-le-jugement` | la scission défaite par commodité |
| `etage-invalide` | un outil versé sur le papier seulement |
| `source-partagee` | une source que personne ne possède, ou que deux composants revendiquent |
| `divergence-perimee` | une duplication affirmée sans chiffre, ou dont le chiffre a menti |
| `adr-sans-signal` | une décision que rien ne défend — ou qui cite un contrôle inexistant |
| `releve-perime` | un relevé qui redevient un instantané |

Deux points d'exécution, parce qu'ils voient deux réalités différentes :

- **La patrouille galahad** exécute la skill `audit-fleet`, à coût nul, avec
  `SHINKIRO_HOME` pointant sur une copie du programme. Elle voit le VPS.
- **`.github/workflows/fleet-drift.yml`**, chaque lundi. Il voit GitHub : il relève,
  compare, et tient **une** issue — titre stable, mise à jour sur place, fermée
  d'elle-même quand la flotte redevient conforme.

Le workflow a **trois états, jamais deux** : `conforme`, `derive`, et
`non-mesurable`. Un contrôle qui ne peut pas mesurer n'est pas un contrôle qui
passe : il échoue en rouge et le dit. C'est la leçon exacte des 541 fausses issues.

> **Prérequis** — le relevé lit vingt-trois dépôts, en majorité privés.
> `GITHUB_TOKEN` ne voit que le dépôt courant : le workflow a besoin d'un secret
> `FLEET_TOKEN` avec la portée `repo` en lecture. Sans lui, il n'échoue pas en
> silence — il déclare qu'il n'a pas pu mesurer.

## 3 · Les décisions, adossées aux contrôles

La série `SHK-` vit dans [`docs/adr/`](adr/) et n'arbitre qu'**entre** composants —
les décisions internes restent chez eux. Chaque ADR `Accepted` qui pose une règle
vérifiable nomme le signal qui la défend, et ce signal existe : `adr-sans-signal`
rejette aussi bien l'ADR sans contrôle que celle qui en cite un imaginaire.

Une ADR peut légitimement déclarer `Aucun`. C'est une déclaration, pas un oubli.

## Contrôler le contrôleur

```bash
make releve && git diff --exit-code fleet.lock.yml   # relevé reproductible
node scripts/signaux-flotte.mjs                      # « COHÉRENT — aucune dérive »
```

Puis laisser passer un cycle complet sans intervenir, et lire l'issue.

- Vide : le dispositif tient.
- Des dérives réelles : il fonctionne.
- **Du bruit : c'est lui qui a dérivé.** Le corriger avant de s'y fier — sinon on
  reproduit précisément ce qu'il est censé empêcher.
