# SHK-0003 — Deux moteurs, pas trois

- **Statut** : Accepted
- **Date** : 2026-09-14
- **Composants** : `galahad`, `talos`, `hulysse`

## Contexte

Ce manifeste a porté, sur `talos`, la note suivante :

> *`src/` recouvre `galahad/engine/src/`. Le moteur existe en trois exemplaires —
> galahad, talos, hulysse — alors que le README de galahad promet « une image moteur,
> trois rôles ». C'est la dette structurelle n°1.*

Elle était fausse, et un plan de fusion par `git subtree` en a découlé. Personne ne
l'avait mesurée : trois répertoires portant les mêmes noms de fichiers avaient suffi
à conclure.

La mesure, reproductible par `scripts/mesure-divergence.mjs` :

| Paire | Fichiers partagés | Divergence |
|---|---|---|
| `talos` ↔ `hulysse` | 10 | **17 %** |
| `galahad` ↔ `talos` | 9 | 73 % |
| `galahad` ↔ `hulysse` | 9 | 71 % |

**Il n'y a pas trois exemplaires. Il y en a deux, et un troisième moteur différent.**

`talos` et `hulysse` sont bien le même moteur : `journal.js`, `ollama.js` et
`telegram.js` sont **identiques à l'octet**, `tools.js` ne diffère que par ses
commentaires. Ce qui les sépare est fonctionnel, pas structurel — `talos` porte
`cron`, `heartbeat` et le pont MCP vers radar ; `hulysse` porte `goals` et `veille`.

`galahad` est autre chose. Aucun de ses fichiers n'est identique à son homologue.
Là où les deux autres appellent `ollama.js`, il appelle `brain.js`, agnostique au
fournisseur. Il porte `roles.js`, `skill-runner.js`, `integrations.js`, `jobs.js` —
que ni l'un ni l'autre n'a. Son `agent-loop.js` fait 47 lignes contre 105 et 96 : une
session roulante par processus, là où les autres persistent des fils dans
`sessions.json` avec compaction.

Et la promesse citée à l'appui de la note ne disait pas ce qu'on lui faisait dire.
« Une seule image, trois rôles » désigne **chef, guardian et traveler** — trois
personas de galahad, déjà livrés par `roles.js` en pure configuration :

> *A role is pure configuration: the same engine binary runs any of them.*

Cette promesse est tenue, à l'intérieur de galahad. Elle n'a jamais porté sur
`talos` ni `hulysse`.

## Décision

**La convergence porte sur `talos` et `hulysse`, et sur eux seuls.** Ils deviennent
un moteur unique à deux rôles — exactement le motif que `galahad` a déjà éprouvé
avec `roles.js` : `cron`, `heartbeat` et le pont MCP d'un côté, `goals` et `veille`
de l'autre, deviennent des capacités de rôle et non deux forks. Les trois fichiers
identiques à l'octet cessent d'exister en double le jour où la fusion est faite.

**`galahad` ne fusionne pas.** À 73 % et 71 %, ce ne serait pas une fusion mais une
réécriture, et elle détruirait ce qui fait sa valeur propre — l'agnosticisme au
fournisseur, le `skill-runner` qui porte cet audit même, les rôles, les jobs. Le
programme assume deux moteurs : l'un agnostique et outillé, l'autre lié à Ollama et
multi-fils.

**Aucune duplication ne s'affirme plus sans être chiffrée.** Une déclaration de
divergence dans `fleet.yml` porte sa mesure, son chemin et sa date. Le chiffre est
reproductible par `scripts/mesure-divergence.mjs`, qui compte par plus longue
sous-séquence commune — la seule mesure indépendante de l'ordre des arguments.

## Signal d'audit

- `divergence-perimee` — toute `divergence:` déclarée porte `avec`, `chemin`,
  `mesure_pct` et `le`. Quand les deux dépôts se trouvent clonés côte à côte, le
  contrôle **refait la mesure** : plus de dix points d'écart avec le chiffre déclaré
  est une dérive, pas une approximation. Sinon il vérifie que la mesure a moins de
  quatre-vingt-dix jours.

Une opinion écrite dans un manifeste finit par être lue comme un fait, puis par
fonder un plan. C'est ce qui vient de se produire, et c'est ce que ce contrôle
empêche de recommencer.

## Portée

Cette ADR n'exécute pas la fusion de `talos` et `hulysse`. Ce sont deux agents en
service sur le VPS, sous systemd ; leur convergence est un travail de code à mener
avec ses tests de vie, pas un effet de bord documentaire.

Elle ne dit rien du protocole MCP `talos ↔ radar`, qui reste à reconstituer depuis
`radar-mcp/test-client.mjs`. C'est un prérequis à la fusion : `mcp.js` doit devenir
une capacité de rôle, et on ne déplace pas ce qu'on ne sait pas décrire.

Elle ne révise pas la promesse de `galahad`. Elle est tenue.
