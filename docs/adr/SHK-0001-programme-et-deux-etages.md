# SHK-0001 — Le programme, et ses deux étages

- **Statut** : Accepted
- **Date** : 2026-09-14
- **Composants** : tous les dépôts portant le topic `shinkiro`

## Contexte

Trois noms circulaient pour trois choses différentes, et le même mot désignait
tantôt l'ensemble, tantôt une de ses pièces. « Galahad 360 » nommait le programme
entier ; `galahad` nommait aussi une équipe d'agents auto-hébergée, qui n'en est
qu'un composant. Une confusion de ce genre ne reste pas verbale longtemps : elle
finit en dépôt créé deux fois.

Elle l'a déjà fait. `ADVE-project/docs/governance/adr/0100-argos-hunter-backend-port.md`,
daté du 14 juin 2026, ouvre son contexte par *« Argos n'était **pas déployable** —
0 % de backend »* et réimplémente le harvester à neuf.

Le même jour, dans `Argos-studio`, il y avait 184 fichiers. Une API v1 complète —
`agencies`, `awards`, `brands`, `assets`, `markets`, `references`, `sectors`,
`years`, `ingest/dossier` — un `schema.prisma`, une migration `20260512171730_init`
et un seed. Le tout posé en un seul commit le 15 mai, et intouché depuis. C'est
vérifiable en une commande :

    gh api 'repos/xtincell/Argos-studio/commits?until=2026-06-14T23:59:59Z&per_page=1'

Un mois d'écart. Un backend reconstruit parce que rien, nulle part, ne disait que
l'autre existait. Le coût n'est pas le temps perdu : c'est qu'il y a désormais
deux modèles de dossier de campagne à tenir d'accord.

Deuxième constat, de nature différente : les composants n'ont pas la même masse.
Le relevé déterministe donne 101 855 Ko d'arbre pour `ADVE-project` contre 233 Ko
pour `galahad` — 437 pour 1. Les traiter pareil, c'est soit imposer à un outil de
trois fichiers la cérémonie d'un dépôt de 3 314, soit charger le programme de cent
mégaoctets à chaque clonage.

## Décision

**Shinkiro est le programme.** Il ne contient aucun code applicatif : il porte le
manifeste, l'ordre de construction, les décisions de flotte et l'audit. `galahad`
est un produit parmi d'autres. ADVE est la méthode, et son dépôt canonique est
`ADVE-project`. Ces trois noms ne sont pas interchangeables, et le README l'énonce
avant toute autre chose.

**Un composant appartient à un étage, et un seul.**

| | `reference` | `verse` |
|---|---|---|
| Ce que c'est | composant autonome | outil léger |
| Son dépôt | le sien, son cycle, sa CI | le sien aussi |
| Dans shinkiro | cloné à côté par `make clone-all` | submodule sous `tools/` |
| Critère | se déploie et se vérifie seul | ne vit que dans le flux d'un autre |

Le critère n'est pas la taille — c'est l'autonomie. La taille explique seulement
pourquoi les deux étages ne peuvent pas être un seul : verser `ADVE-project` en
submodule imposerait ses 100 Mo à quiconque clone le programme pour lire trois
fichiers de doctrine.

**L'appartenance au programme se déclare par le topic `shinkiro`**, et par lui
seul. C'est ce que le relevé interroge ; un dépôt sans le topic n'existe pas pour
la flotte, un dépôt avec le topic mais absent de `fleet.yml` est une dérive.

**`fleet.yml` porte le jugement, `fleet.lock.yml` porte les faits.** Le premier
est écrit à la main et dit à quoi sert un composant ; le second est régénéré par
`make releve` et dit ce qu'il est. Trois champs du premier — `vitalite`, `licence`,
`deploiement.mode` — ressemblent à des faits mais sont des jugements : c'est
précisément leur contradiction par le second qui constitue un signal.

## Signal d'audit

- `non-classe` — un dépôt du compte qui ne porte pas le topic `shinkiro` et que
  `hors_perimetre` n'écarte pas nommément. Constaté : cinq outils vivaient hors de
  tout manifeste avant le 14 septembre 2026.
- `absent-du-manifeste` — un dépôt qui porte le topic mais n'apparaît dans
  `fleet.yml` ni comme composant, ni comme lignée morte. Il est entré dans la flotte
  sans être jugé.
- `etage-invalide` — un composant dont `etage` n'est ni `reference` ni `verse`, ou
  qui se déclare versé sans submodule correspondant sous `tools/`. Constaté : les
  cinq outils versés l'étaient sur le papier seulement.
- `faits-dans-le-jugement` — un champ factuel réapparu dans `fleet.yml`. La scission
  ne tient que si personne ne la défait par commodité.
- `licence-absente`, `vitalite-dementie`, `racine-fantome`, `entree-fantome` — les
  trois champs de jugement démentis par le relevé, plus le point d'entrée.
- `releve-perime` — un `fleet.lock.yml` de plus de quinze jours redevient ce qu'il
  remplaçait : un instantané qui affirme.

Le signal qui aurait épargné l'ADR-0100 — *deux composants, un seul produit* — n'est
pas dans cette liste. Il demande une recherche de code à travers les dépôts, donc un
jeton, donc le workflow et non la patrouille ; et il n'a de sens qu'une fois désigné
le dépôt canonique d'Argos. Il relève de `SHK-0002`, et c'est là qu'il sera écrit.
Le nommer ici sans l'implémenter aurait produit exactement ce que cette ADR combat :
un document qui affirme un contrôle absent.

## Portée

Cette ADR ne dit pas où tel composant doit aller — `fleet.yml` le dit, composant
par composant, et se corrige sans ADR.

Elle ne crée pas de monorepo et n'impose pas un mode de déploiement unique. Cinq
modes coexistent — Coolify, systemd, Vercel, Docker autonome, statique — parce
qu'ils correspondent à cinq réalités ; les uniformiser casserait ce qui tourne.
`docs/TOPOLOGIE.md` en tient le détail.

Elle ne dit rien du contenu des composants. Un dépôt reste maître de ses propres
décisions ; `SHK-` n'arbitre qu'entre eux.
