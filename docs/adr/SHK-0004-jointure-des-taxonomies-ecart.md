# SHK-0004 — Jointure des taxonomies d'écart

- **Statut** : Proposed
- **Date** : 2026-11-10
- **Composants** : `market-expansion-system`, `la-barre`, `radar`

## Contexte

Lu sur `origin/main` le 10 novembre 2026 : `la-barre` au commit `2586992`,
`market-expansion-system` au commit `df37018`, `radar` au commit `2e8d92f`.
Les lignes citées valent pour ces commits. Celles de `shinkiro` valent pour le
commit `835fdeb` ; le plan bouge vite, il est aussi cité par numéro de geste.

### Un mot, deux objets

Le Market Expansion System classe *ce qui change* d'un marché à l'autre :
langue, marque, produit/SKU, réglementaire
(`market-expansion-system/METHODE.md:26-33`). Pour lui, un écart est une
différence autorisée entre le master et une variante
(`market-expansion-system/METHODE.md:15-22`). Tout autre écart « se refuse, ou
il se facture » (`market-expansion-system/METHODE.md:35`).

La Barre classe *qui doit la reprise* : brief, plateforme, bigidea, agence,
donneur (`la-barre/app/ecarts.js:7-14`). Chaque origine porte `qui` et
`facturable` (`la-barre/app/ecarts.js:20-36`). Pour elle, un écart est une
modification due par quelqu'un (`la-barre/app/ecarts.js:1-5`).

Les deux se complètent (`shinkiro/docs/TOPOLOGIE.md:202-211`). Mais elles
s'opposent sur un point. La méthode veut un écart **déclaré avant**
(`market-expansion-system/METHODE.md:86-87`). La Barre veut un écart **calculé,
jamais saisi** (`la-barre/app/ecarts.js:40-42`, `la-barre/app/ecarts.js:56-57`).
La jointure doit trancher cette opposition avant de fixer une forme de données.

### Ce que La Barre stocke aujourd'hui

Rien. Les écarts sont recalculés à chaque lecture
(`la-barre/app/ecarts.js:58-78`). Seule une mise à l'écart serait conservée,
dans `ecartsEcartes`, sous la clé `projet|livrable|origine|quoi`
(`la-barre/app/ecarts.js:82`, `la-barre/app/ecarts.js:218-226`).

Mais `ecarterUn` n'a aucun appelant, et `facturable` n'est lu nulle part
(constat F4, `shinkiro/docs/PLAN-ACHEVEMENT.md:244` ; revérifié sur `2586992`).
La clé contient le libellé `quoi` : changer un libellé ferait réapparaître un
écart déjà écarté.

### Où vit le marché dans La Barre

Un marché du référentiel porte `code`, `nom`, `langues`, `zone`, `sku` et
`mentions` (`la-barre/app/amorce.js:25-38`).

Une adaptation est un KV réécrit pour un marché. Elle porte `niveau:
"adaptation"`, `maitre`, `marche` et un bloc `kv` : marque, accroche, langue,
SKU, mentions, restrictions (`la-barre/app/kv-modele.js:136-156`). Un marché
peut en avoir une, ou zéro (`la-barre/app/kv-modele.js:41-49`). Elle dépend
d'une piste (`la-barre/app/kv-modele.js:107-108`, `la-barre/app/kv-modele.js:142`).

Les contrôles de conformité couvrent déjà trois des quatre types de la
méthode : la langue (`la-barre/app/kv-modele.js:236-242`), les SKU
(`la-barre/app/kv-modele.js:248-254`) et les mentions
(`la-barre/app/kv-modele.js:272-278`). La marque n'est contrôlée que par sa
présence, pas par sa différence avec le master
(`la-barre/app/kv-modele.js:233-234`). Ces manquements deviennent des écarts
d'origine `brief` (`la-barre/app/ecarts.js:92-99`).

Le couple projet × marché n'a pas d'objet propre. Le périmètre et chaque volet
portent une simple liste d'identifiants de marchés
(`la-barre/app/vue-matrice.js:624`, `la-barre/app/vue-matrice.js:656`,
`la-barre/app/intake.js:162`). Un projet ouvert depuis une campagne en hérite
les marchés (`la-barre/app/vue-projets.js:686-708`).

`vue-matrice.js` croise supports et marchés, et crée un livrable par case
(`la-barre/app/vue-matrice.js:652-686`, `la-barre/app/vue-matrice.js:761-781`).
Sur `main`, le « + » d'une case vide plante encore : `volets` n'y est pas
défini (`la-barre/app/vue-matrice.js:773`). La correction est dans la-barre#14,
ouverte, non fusionnée au commit lu.

### Un type ou plusieurs : le Ghana

La méthode cite le Ghana deux fois : en langue et en marque
(`market-expansion-system/METHODE.md:30-31`,
`market-expansion-system/README.md:27-28`).

Le gabarit de cadrage n'a qu'une colonne `ecart_type`. La ligne du Ghana y vaut
`marque`, alors que sa colonne `ecart_declare` dit « bascule marque + langue »
(`market-expansion-system/gabarits/cadrage-matrice.csv:10`). La langue est
perdue dès la saisie.

Le même gabarit emploie des valeurs hors des quatre types : `référence`
(`market-expansion-system/gabarits/cadrage-matrice.csv:2`) et `aucun`
(`market-expansion-system/gabarits/cadrage-matrice.csv:7-9`). Il classe en
`produit` une déclinaison par genre, un marché pilote et un support véhicule
(`market-expansion-system/gabarits/cadrage-matrice.csv:3-6`). La méthode
réserve `produit` au format, au grammage et au prix
(`market-expansion-system/METHODE.md:32`). Dans La Barre, une déclinaison par
genre serait un choix de direction artistique déclaré par la campagne
(`la-barre/app/kv-modele.js:24-27`), pas un écart de marché.

Le second gabarit n'a pas de colonne de type
(`market-expansion-system/gabarits/matrice-deploiement-modele.csv:1`). La
méthode le nomme `Matrice de déploiement — modèle.csv`
(`market-expansion-system/METHODE.md:74`) : ce nom n'existe pas dans le dépôt.

Déduire le type en comparant chaque ligne au master ne suffit pas.
`mentions_legales` vaut « standard » suivi du code pays sur toutes les lignes
(`market-expansion-system/gabarits/cadrage-matrice.csv:2-10`). Le type
réglementaire serait coché partout.

### Où il se déclare

Dans la méthode, l'écart se déclare sur le couple projet × marché : une ligne
par code projet et par pays
(`market-expansion-system/gabarits/cadrage-matrice.csv:1-10`). Il se déclare
au cadrage, « avant le premier crayon »
(`market-expansion-system/METHODE.md:41-42`,
`market-expansion-system/METHODE.md:73`).

Dans La Barre, le seul objet par marché est l'adaptation. Elle naît en
production et dépend de la piste (`la-barre/app/kv-modele.js:119-156`).

### La promesse d'import (geste 4.10, constat F9)

Le README promet que les gabarits « s'importent sans retraitement » dans Radar :
`cadrage-briefs.csv` vers `briefs`, `cadrage-matrice.csv` vers `client_markets`
(`market-expansion-system/README.md:40-44`). La promesse ne tient pas.

- L'amorçage CSV de Radar attend des en-têtes en français, « N° », « Client »…
  (`radar/server/pgrest.js:114-121`). Le gabarit emploie les noms de colonnes
  (`market-expansion-system/gabarits/cadrage-briefs.csv:1`). Aucune ligne n'a
  de `ndeg` reconnu : toutes sont sautées (`radar/server/pgrest.js:136`).
- Cet amorçage ne joue que sur une base vide, et avec `RADAR_SEED_CSV`
  (`radar/server/pgrest.js:157-161`).
- `client_markets` porte `id`, `client` et `data` (`radar/server/pgrest.js:37`).
  C'est une fiche par client, lue par le wiki (`radar/briefs/supa.js:185-189`).
  Elle n'a pas de clé de projet : la matrice projet × marché n'y a pas de
  place. La page wiki lit d'ailleurs `marque`, `pays`, `langue` au premier
  niveau (`radar/briefs/marques.html:149-150`). La forme attendue d'une ligne
  n'est pas établie.
- La nomenclature diffère. Le ticket s'écrit `-R<NN>` dans la méthode
  (`market-expansion-system/METHODE.md:60`) et `.R<N>` dans Radar
  (`radar/server/ingest.js:74`).

La matrice est implémentée dans La Barre, pas dans Radar
(`shinkiro/docs/TOPOLOGIE.md:213-215`). La cible de la promesse dépend donc de
l'option retenue.

## Décision

Rien n'est tranché. Trois options sont posées. Les chemins marqués « à créer »
sont des propositions de nom.

### Option A — Une correspondance de lecture, rien de stocké

La Barre garde sa règle : l'écart est calculé. Chaque écart calculé reçoit, en
plus de son origine, le type de la méthode qui lui correspond.

| Type de la méthode | Contrôle La Barre existant |
|---|---|
| langue | « Langue du marché » (`la-barre/app/kv-modele.js:238`) |
| produit / SKU | « SKU distribués ici » (`la-barre/app/kv-modele.js:250`) |
| réglementaire | « Mentions obligatoires » (`la-barre/app/kv-modele.js:275`) |
| marque | « Marque », présence seule (`la-barre/app/kv-modele.js:233`) |

Un écart calculé a au plus un type. Un marché en porte plusieurs, sur plusieurs
lignes : le Ghana en aurait deux. Les autres contrôles — accroche, choix de
direction artistique — restent sans type.

- **Fichiers `la-barre`** : `app/kv-modele.js`, pour ajouter le type aux
  contrôles (`la-barre/app/kv-modele.js:233-278`) ; `app/ecarts.js`, pour le
  porter dans chaque écart (`la-barre/app/ecarts.js:80-88`) ; l'affichage dans
  `app/vue-attentes.js` (`la-barre/app/vue-attentes.js:37-38`) et
  `app/file-action.js` (`la-barre/app/file-action.js:115-117`). Sur `main`,
  aucun test ne couvre `ecarts.js` ; la-barre#15, ouverte, en ajoute.
- **Fichiers `market-expansion-system`** : `METHODE.md`, pour écrire la
  correspondance (`market-expansion-system/METHODE.md:26-35`) ; `README.md`,
  pour retirer ou réécrire la promesse d'import
  (`market-expansion-system/README.md:40-44`). La colonne `ecart_type` des
  gabarits devient indicative.
- **Migration** : aucune, puisque rien n'est stocké. Les clés de
  `ecartsEcartes` restent valides tant que les libellés ne changent pas
  (`la-barre/app/ecarts.js:82`).
- **Ce qui casse** : rien de stocké. Mais la règle « déclarer avant » reste
  hors de La Barre. Le type `marque` ne détecte pas une bascule, faute de
  comparaison au master. Un écart de confort reste invisible : rien n'est
  déclaré, donc rien n'est dépassé.
- **Ce qu'elle rend possible** : compter les reprises par type et par origine,
  avec le compteur existant (`la-barre/app/ecarts.js:236-243`). Lire dans un
  même relevé ce qui change et qui paie. C'est l'option la moins chère.
- **Promesse d'import** : elle reste sans cible. Le geste 4.10 la retire, ou la
  réécrit vers Radar après conversion.

### Option B — Plusieurs types, déclarés sur l'adaptation

L'adaptation porte la liste de ses écarts déclarés, de zéro à quatre. La Barre
compare chaque champ `kv` de l'adaptation à celui de son master. Une
différence hors de la liste devient un écart calculé.

- **Fichiers `la-barre`** : `app/kv-modele.js` — le champ dans `CHAMPS_KV`
  (`la-barre/app/kv-modele.js:15-22`), son initialisation dans `creer`
  (`la-barre/app/kv-modele.js:119-156`), la comparaison au master dans
  `conformite` (`la-barre/app/kv-modele.js:227-281`) ; `app/ecarts.js`, une
  source d'écart de plus (`la-barre/app/ecarts.js:68`) ; l'affichage dans
  `app/vue-planche.js` (`la-barre/app/vue-planche.js:116-119`) et
  `app/vue-route.js` (`la-barre/app/vue-route.js:201-214`) ; des tests.
- **Fichiers `market-expansion-system`** : `METHODE.md`, pour une colonne à
  plusieurs valeurs (`market-expansion-system/METHODE.md:26-35`,
  `market-expansion-system/METHODE.md:71-77`) ; l'en-tête des deux gabarits
  (`market-expansion-system/gabarits/cadrage-matrice.csv:1`,
  `market-expansion-system/gabarits/matrice-deploiement-modele.csv:1`).
- **Migration** : un champ ajouté à des objets existants. Aucune collection
  nouvelle, donc `VERSION_SCHEMA` n'a pas à bouger
  (`la-barre/app/depot.js:20`, `la-barre/app/depot.js:32-35`). Les adaptations
  existantes n'ont pas de déclaration : « absent » doit se lire « non déclaré »,
  pas « aucun écart ».
- **Ce qui casse** : un marché sans adaptation ne peut rien déclarer
  (`la-barre/app/kv-modele.js:41-49`). La déclaration suit la piste : une
  nouvelle piste retenue la remet à zéro (`la-barre/app/kv-modele.js:107-108`).
  Elle arrive en production, pas au cadrage, contre
  `market-expansion-system/METHODE.md:86-87`. Enfin, l'origine d'un écart non
  déclaré n'est pas calculable. La méthode dit qu'il se refuse ou se facture
  (`market-expansion-system/METHODE.md:35`) : `agence` ou `donneur`, selon qui
  l'a demandé (`la-barre/app/ecarts.js:30-35`). Aucun champ ne dit qui l'a
  demandé, et `def` retombe sur `agence` (`la-barre/app/ecarts.js:38`).
- **Ce qu'elle rend possible** : le Ghana porte ses deux types. La variante qui
  touche autre chose que son écart (`market-expansion-system/METHODE.md:21-22`)
  devient détectable sur les champs du KV.
- **Promesse d'import** : inchangée. Le gabarit gagne une colonne à plusieurs
  valeurs, sans cible d'import.

### Option C — Plusieurs types, déclarés sur le couple projet × marché, au cadrage

Chaque marché du périmètre porte une déclaration : types, détail, date,
auteur. Adaptations et formats de ce marché sont jugés contre elle. La date de
déclaration se compare à celle de la première pièce du marché.

- **Fichiers `la-barre`** : `app/vue-matrice.js` — la saisie dans le périmètre
  et le volet (`la-barre/app/vue-matrice.js:623-650`,
  `la-barre/app/vue-matrice.js:963-990`), les en-têtes de la grille
  (`la-barre/app/vue-matrice.js:669-672`) ; `app/kv-modele.js`, dont
  `conformite` lit la déclaration du marché
  (`la-barre/app/kv-modele.js:227-281`) ; `app/ecarts.js`, une source de plus
  (`la-barre/app/ecarts.js:68`) ; l'initialisation dans `app/intake.js`
  (`la-barre/app/intake.js:162`) et `app/vue-projets.js`
  (`la-barre/app/vue-projets.js:708`). Un import du gabarit, à créer sous
  `outils/`, rapproche le code pays de `marches.code`
  (`la-barre/app/amorce.js:25-38`).
- **Fichiers `market-expansion-system`** : `METHODE.md`
  (`market-expansion-system/METHODE.md:71-77`) ; `README.md`, dont l'import
  vise La Barre (`market-expansion-system/README.md:40-44`) ;
  `gabarits/cadrage-matrice.csv`, avec une colonne à plusieurs valeurs, sans
  `référence` ni `aucun`, et un usage de `produit` conforme à la méthode.
- **Migration**, en deux variantes :
  - **C1** — une table à côté, indexée par marché, sous le périmètre. Aucune
    migration ; « absent » vaut « non déclaré ».
  - **C2** — les listes `marches` du périmètre et des volets deviennent des
    listes d'objets. Il faut une étape dans `migrer`
    (`la-barre/app/depot.js:663-787`) et incrémenter `VERSION_SCHEMA`
    (`la-barre/app/depot.js:20`). Un poste plus ancien refuse alors le fichier :
    « Version de base incompatible » (`la-barre/app/depot.js:228`). Tous les
    lecteurs de ces listes changent, par exemple
    `la-barre/app/vue-matrice.js:385`, `la-barre/app/vue-matrice.js:656`,
    `la-barre/app/dispositif.js:158` et `la-barre/app/compilateur.js:404`.
- **Ce qui casse** : deux projets d'une même campagne qui servent le même
  marché déclarent deux fois. Or la campagne porte déjà les marchés
  (`la-barre/app/vue-projets.js:686-708`). Le bon niveau — projet ou campagne —
  reste à fixer. La saisie passe par une grille dont le « + » plante sur `main`
  (`la-barre/app/vue-matrice.js:773`).
- **Ce qu'elle rend possible** : la règle « déclaré avant » devient
  vérifiable. Le Ghana porte ses deux types. La matrice de la méthode s'importe
  là où elle est implémentée.
- **Promesse d'import** : tenue côté La Barre. Radar n'est plus la cible de la
  matrice. L'import de `cadrage-briefs.csv` vers `briefs` reste à réécrire ou à
  retirer.

À trancher par le propriétaire :

1. Un écart a-t-il un type, ou plusieurs ?
2. Se déclare-t-il sur l'adaptation, sur le couple projet × marché, ou sur le
   couple campagne × marché ?
3. La Barre accepte-t-elle un écart déclaré, ou garde-t-elle sa règle
   « calculé, jamais saisi » ?
4. La promesse d'import du Market Expansion System : tenue vers La Barre,
   réécrite vers Radar, ou retirée ?
5. Le sort des valeurs `référence` et `aucun`, et l'usage de `produit` dans les
   gabarits.

## Signal d'audit

Proposé. **Il n'existe pas encore** : ni dans
`galahad/engine/skills/audit-fleet.json`, ni dans
`shinkiro/scripts/signaux-flotte.mjs`. Cette ADR ne l'ajoute pas.

- `ecart-types-alignes` — la liste des types d'écart est la même dans les
  gabarits du Market Expansion System et dans le code de La Barre. Toute
  valeur de `ecart_type` appartient à cette liste. Si plusieurs types sont
  admis, le séparateur est celui que la méthode documente. Violation : une
  valeur hors liste, ou deux listes qui divergent. Le contrôle ne joue que si
  les deux dépôts sont clonés côte à côte, comme `divergence-perimee`
  (`shinkiro/scripts/signaux-flotte.mjs:189`). Avec l'option A, il vérifie en
  plus que chaque type nomme un contrôle présent dans `kv-modele.js`.

Aujourd'hui, ce signal s'allumerait : `référence` et `aucun` sont hors liste
(`market-expansion-system/gabarits/cadrage-matrice.csv:2`,
`market-expansion-system/gabarits/cadrage-matrice.csv:7-9`).

## Portée

Cette ADR ne choisit pas, et n'écrit aucun code.

Elle ne corrige ni le « + » de la grille (F1), ni `facturable` jamais lu (F4).
Mais une option qui prétend dire qui paie devra lire `facturable`.

Elle ne traite pas des tickets mineurs ou majeurs
(`market-expansion-system/METHODE.md:65-67`). Ils touchent pourtant la mesure
du pilote : voir SHK-0005.

Elle ne règle pas le reste du geste 4.10. La méthode annonce neuf pays et en
liste huit (`market-expansion-system/METHODE.md:4-6`) ; le README en liste neuf
(`market-expansion-system/README.md:5-8`).
