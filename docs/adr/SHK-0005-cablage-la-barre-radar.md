# SHK-0005 — Câblage La Barre → Radar

- **Statut** : Proposed
- **Date** : 2026-11-10
- **Composants** : `la-barre`, `radar`

## Contexte

Lu sur `origin/main` le 10 novembre 2026 : `la-barre` au commit `2586992`,
`radar` au commit `2e8d92f`. Les lignes citées valent pour ces commits. Celles
de `shinkiro` valent pour le commit `835fdeb` ; le plan bouge vite, il est aussi
cité par numéro de geste ou d'arbitrage.

### Ce que vend le portefeuille

Le Transformation Pilot promet une mesure avant/après : « le before/after est
mesuré, pas déclaré » (`shinkiro/docs/PORTFOLIO.md:49`). Sa méthode de preuve
repose sur Radar et La Barre (`shinkiro/docs/PORTFOLIO.md:65`). Le même
document pose la condition : tant que La Barre ne verse pas ses décisions dans
Radar, le before/after se rédige (`shinkiro/docs/PORTFOLIO.md:72-75`). Aucun
code ne calcule cette mesure (`shinkiro/docs/PLAN-ACHEVEMENT.md:428-430`).

### Aucun câblage dans la flotte

`la-barre` n'appelle pas l'API de Radar : aucune occurrence de `rest/v1`, de
`RADAR_API_KEY` ni de `X-Radar-Key` dans le dépôt, hors bibliothèque tierce.
`radar` ne lit rien de La Barre. Son propre reçu le dit : la correction du
journal « ne reçoit ni un raccord La Barre → Radar idempotent »
(`radar/docs/RECEPTION-JOURNAL.md:48-53`).

Une admission existe dans l'installation de l'employeur, hors flotte
(`shinkiro/fleet.yml:247-250`). Elle n'est ni décrite ni reprise ici
(`shinkiro/docs/CLOISON.md:6-17`). Son sort relève de l'arbitrage 5.15
(`shinkiro/docs/PLAN-ACHEVEMENT.md:505`).

Un relevé existe dans l'autre sens, et il porte des briefs, pas des décisions.
`outils/ingerer-corpus.mjs` lit un CSV de briefs Radar déposé à la main
(`la-barre/outils/ingerer-corpus.mjs:118`) et écrit le dépôt
(`la-barre/outils/ingerer-corpus.mjs:25-26`). Le registre l'affiche
(`la-barre/app/registre-radar.js:15-16`, `la-barre/app/depot.js:50-56`). La clé
est `ndeg` (`la-barre/outils/ingerer-corpus.mjs:237`,
`la-barre/app/registre-radar.js:117`). Un projet garde la liste de ses codes
Radar (`la-barre/outils/ingerer-corpus.mjs:540`,
`la-barre/app/vue-projets.js:273-276`), sans identifiant stable ni instance.

### La forme des décisions dans La Barre

Les décisions forment une collection du dépôt (`la-barre/app/depot.js:77`).
Huit écrivains l'alimentent.

| Écrivain | Type écrit |
|---|---|
| `la-barre/app/bigidea-ecoles.js:242-243` | `bigidea` |
| `la-barre/app/campagne.js:361-371` | `reference-campagne` |
| `la-barre/app/validation.js:169-172` | la clé de la section validée |
| `la-barre/app/vue-atelier.js:221-223` | `idee` |
| `la-barre/app/vue-bigidea.js:341-342` | `piste` |
| `la-barre/app/vue-livrable.js:432-433` | `livrable` |
| `la-barre/app/vue-revue.js:284-287` | le type de la pièce revue |
| `la-barre/app/vue-route.js:397-398` | `piste` |

Leur forme commune : `objet`, `type`, `projet`, `verdict`, `motif`, `quand`,
`qui`, `titre`. `DEPOT.ajoute` pose `id` et `cree_le`
(`la-barre/app/depot.js:95-101`). Deux écrivains ajoutent `acteur`, `version`
et `portee` (`la-barre/app/validation.js:169-172`,
`la-barre/app/campagne.js:361-366`). Celui de la campagne ajoute `remplace` :
une décision peut en supplanter une autre (`la-barre/app/campagne.js:366`).
Il y a quatre verdicts : `approuve`, `reserve`, `retour`, `hors`
(`la-barre/app/maison-base.js:243-248`).

Quatre faits comptent pour un câblage.

- **L'identifiant** est un préfixe suivi de six caractères aléatoires
  (`la-barre/app/outils.js:163-165`). Rien ne vérifie son unicité
  (`la-barre/app/depot.js:95-98`).
- **L'auteur** n'est pas authentifié. `qui` vaut le poste titulaire de
  l'installation, `direction-generale` par défaut
  (`la-barre/app/maison-base.js:166`). `acteur` est choisi sur le poste ; « les
  accès serveur restent distincts » (`la-barre/app/acteur.js:1-2`).
- **Le projet** est un identifiant La Barre, pas un dossier Radar
  (`la-barre/app/vue-livrable.js:432`, `la-barre/app/campagne.js:362`).
- **La soumission** n'est pas datée : sur `main`, `soumis_le` n'est écrit par
  aucun écrivain (`la-barre/app/bilan.js:137-141` ; constat F3,
  `shinkiro/docs/PLAN-ACHEVEMENT.md:243`). La-barre#15, ouverte, change la
  lecture du délai de verdict.

Le geste 4.9 demande une fabrique unique pour ces huit écrivains. Il est noté
prérequis de ce câblage (`shinkiro/docs/PLAN-ACHEVEMENT.md:399`).

### Comment La Barre conserve et expose

Le dépôt est un seul fichier JSON sous `depots/`
(`la-barre/servir.mjs:171-177`). `depots/manifeste.json` nomme le fichier de
référence (`la-barre/app/depot.js:494-500`). Le serveur le sert en `GET`, avec
une empreinte de version, l'`ETag` (`la-barre/servir.mjs:471-476`). Il l'écrit
en `PUT` conditionnel, par remplacement atomique
(`la-barre/servir.mjs:421-444`, `la-barre/servir.mjs:158-163`).

Il n'y a ni route de décisions, ni export dédié. `DEPOT.exporter` télécharge
toute la base (`la-barre/app/depot.js:555-566`). Elle contient aussi les
personnes et les pièces de facturation (`la-barre/app/depot.js:39`,
`la-barre/app/depot.js:64-68`).

Le journal local se tronque au-delà de 2 000 entrées, sauf celles qui nomment
une marque (`la-barre/app/depot.js:143-149`). Les décisions, elles, ne sont
pas tronquées.

`servir.mjs` n'a aucune authentification (`la-barre/servir.mjs:140-143`). Sur
`main`, il écoute sur toutes les interfaces par défaut
(`la-barre/servir.mjs:487` ; constat S4,
`shinkiro/docs/PLAN-ACHEVEMENT.md:229`). En production, il est servi derrière
le raccord authentifié de La Fusée
(`la-barre/docs/INSTALLATION-ENTREPRISE.md:58-63`).

### Ce que l'API Radar accepte

- **Routes** : `/rest/v1/<table>`, `/index.csv`, `/jour.json`, `/ingest`,
  `/visuels`, `/token`, `/profil`, `/feed.xml`, `/activity.json`
  (`radar/server/index.js:53-72`). Aucune tâche périodique : le démarrage
  prépare la base et purge les visuels orphelins, rien d'autre
  (`radar/server/index.js:89-94`).
- **Tables** : une liste blanche (`radar/server/pgrest.js:25-50`). Aucune
  table de décision, aucune colonne pour une référence externe. `briefs` a
  cinq colonnes JSON libres : `brief_client`, `brief_creatif`,
  `brief_production`, `case_study`, `suivi` (`radar/server/pgrest.js:31-32`).
- **Écritures** : `POST` insère sans clé qui empêcherait un doublon
  (`radar/server/pgrest.js:354-385`). `PATCH` et `DELETE` exigent un filtre et
  frappent toutes les lignes qui le satisfont
  (`radar/server/pgrest.js:387-419`). Le filtre sur `id` est permis
  (`radar/server/pgrest.js:26`).
- **`ndeg`** : un index simple, non unique (`radar/server/pgrest.js:67`). Un
  commentaire sur un code ambigu est refusé en 409
  (`radar/server/pgrest.js:221-226`). Le geste 4.4 constate le reste : un
  `POST` rejoué crée un doublon, un `PATCH` par `ndeg` frappe tous les
  homonymes (`shinkiro/docs/PLAN-ACHEVEMENT.md:394`). L'arbitrage 5.7 décide de
  son unicité (`shinkiro/docs/PLAN-ACHEVEMENT.md:497`).
- **Journal** : `task_events` est en lecture seule par REST
  (`radar/server/pgrest.js:41`, `radar/server/pgrest.js:274`). Un déclencheur
  sur `briefs` l'écrit (`radar/server/journal.sql:15-53`), les visuels aussi
  (`radar/server/visuels.js:141-144`, `radar/server/visuels.js:203-206`). Les
  commentaires n'y écrivent rien. Les types émis sont `created`, `deleted`,
  `frozen`, `unfrozen`, `closed`, `reopened`, `status`, `reassigned`,
  `deadline`, `visibility` et `updated` (`radar/server/journal.sql:22-40`).
  Aucun type « décision ». Une ligne inchangée, hors `updated_at`, n'émet rien
  (`radar/server/journal.sql:27`). L'heure `at` est celle de l'écriture
  (`radar/server/pgrest.js:85` ; `radar/server/journal.sql:42-43` ne la fixe
  pas).
- **`/activity.json`** : public par défaut, `FEED_TOKEN` en option
  (`radar/functions/_feed.js:136-142`, `radar/functions/_middleware.js:145-146`).
  Il ne publie que les mouvements publics qualifiés
  (`radar/functions/_feed.js:52-55`), 200 au plus
  (`radar/functions/_feed.js:46`). Un élément porte le code `ndeg`, pas
  `brief_id` (`radar/functions/_feed.js:78`).
- **Authentification** : la clé `RADAR_API_KEY`, en `Bearer` ou en
  `X-Radar-Key`, donne l'identité `service@radar` et lève la confidentialité
  (`radar/functions/_middleware.js:148-160` ; constat S3,
  `shinkiro/docs/PLAN-ACHEVEMENT.md:228`). Sinon, le mur Basic et son cookie
  (`radar/functions/_middleware.js:187-233`), avec trois rôles
  (`radar/functions/_authz.js:8-11`, `radar/functions/_authz.js:70-82`). Aucune
  clé de portée réduite n'existe (`radar/docs/RECEPTION-JOURNAL.md:51-53`).
- **Navigateur** : `/rest/v1` n'envoie aucun en-tête d'accès entre origines
  (CORS). Seuls les flux et `/jour.json` en portent
  (`radar/functions/_feed.js:156`, `radar/functions/_feed.js:160`,
  `radar/server/index.js:40`).
- **Entrées existantes** : `/ingest` transforme un texte libre en tâches par
  un modèle local, en statut « Reçu » (`radar/server/ingest.js:1-14`,
  `radar/server/ingest.js:148-175`). L'amorçage CSV ne joue que sur une base
  vide (`radar/server/pgrest.js:157-161`). Aucune n'accepte un lot de
  décisions.

## Décision

Rien n'est tranché. Trois sens de flux sont posés. Les chemins marqués « à
créer » sont des propositions de nom.

### Ce qui vaut pour les trois sens

- **La clé de liaison n'existe pas.** Une décision nomme un projet La Barre.
  Radar identifie un dossier par `briefs.id` ; `ndeg` n'est pas unique. Il faut
  une correspondance projet ↔ (instance Radar, `briefs.id`), tenue d'un côté ou
  de l'autre.
- **La décision n'a pas de place dans Radar.** Trois choix sont possibles. La
  traduire en changement de `statut`, qui émet `status`. L'écrire dans une
  colonne JSON, qui émet `updated` avec le seul texte « Dossier modifié »
  (`radar/server/journal.sql:40`). Ou créer une table ou un type d'événement,
  ce qui change le contrat du journal et les libellés du flux
  (`radar/functions/_feed.js:14-28`).
- **La confidentialité.** Une décision La Barre ne porte pas de `private_to`.
  Écrite dans un dossier public, elle part dans le flux public par défaut
  (`radar/functions/_feed.js:136-138`).
- **L'horloge.** `at` est l'heure d'écriture dans Radar. La date de la
  décision, `quand`, doit voyager à part. Sinon, tout retard de transfert
  fausse les délais mesurés.
- **La fabrique unique** du geste 4.9 donne une seule forme de décision à
  transférer.

### Sens 1 — Radar lit le fichier, ou un export, de La Barre

Radar va chercher. Il lit le dépôt désigné par `depots/manifeste.json`, ou une
route qui ne sert que les décisions.

- **Fichiers `radar`** : un lecteur, à créer (`server/barre.js`) ; son
  déclenchement dans `server/index.js`, qui n'a aucune tâche périodique
  (`radar/server/index.js:89-94`) ; une table de reçus et la correspondance
  projet ↔ dossier, à créer dans le schéma (`radar/server/pgrest.js:55-97`) ou
  dans `server/journal.sql` ; leurs cas dans `tests/reception.test.mjs`.
- **Fichiers `la-barre`** : aucun si Radar lit tout le dépôt. Sinon, une route
  de lecture dans `servir.mjs` (`la-barre/servir.mjs:307-485`) qui ne sert que
  les décisions.
- **Authentification** : `servir.mjs` n'en a pas. En production, l'accès passe
  par La Fusée. Un accès machine à ce raccord n'est décrit dans aucun des dépôts
  lus : **non trouvé**. Côté Radar, l'écriture est interne, sans requête HTTP.
- **Rejeu sans doublon** : un reçu par (instance La Barre, `decision.id`).
  L'`ETag` permet de sauter un fichier inchangé (`la-barre/servir.mjs:475`). Le
  remplacement atomique évite de lire un fichier à moitié écrit
  (`la-barre/servir.mjs:158-163`). Il faut une règle pour une décision
  supprimée ou remplacée (`la-barre/app/campagne.js:366`).
- **Ce qu'il engage** : sans route dédiée, Radar reçoit toute la base,
  personnes et facturation comprises. L'intervalle de lecture décale `at`.

### Sens 2 — La Barre pousse vers l'API Radar

La Barre écrit dans Radar. Le navigateur ne peut pas le faire : `/rest/v1` ne
porte pas d'en-tête CORS, et la clé y serait exposée. La poussée part donc de
`servir.mjs`, ou d'un outil sous `outils/`.

- **Fichiers `la-barre`** : la fabrique unique, à créer (geste 4.9), et les
  huit écrivains qui l'appellent ; une file d'envoi déclarée dans `vide()`
  (`la-barre/app/depot.js:26-80`), car une collection absente de cette liste
  est perdue au chargement (`la-barre/app/depot.js:32-35`) ; la route d'envoi
  dans `servir.mjs` ; leurs tests, leur script dans `package.json` et leur
  ligne dans `.github/workflows/verification.yml`.
- **Fichiers `radar`** : aucun, si l'on s'en tient à la REST existante ; la
  décision est alors forcée dans une colonne de `briefs`. Ou une route
  d'admission dédiée, à créer (`server/barre.js`, aiguillée dans
  `radar/server/index.js:53-72`), avec sa table de reçus et ses tests. Cette
  route recouvre ce que pose l'arbitrage 5.15.
- **Authentification** : soit `RADAR_API_KEY`, accès complet et
  confidentialité levée ; soit un compte du mur en Basic, rôle `supervisor`,
  qui voit tout le non-privé (`radar/functions/_authz.js:75`,
  `radar/functions/_authz.js:96`). Ce compte ne touche pas un dossier privé
  d'autrui. Le secret vit côté serveur La Barre.
- **Rejeu sans doublon** : un `POST` rejoué crée un doublon. Un `PATCH` par
  `id`, au contenu identique, n'émet aucun événement
  (`radar/server/journal.sql:27`) : il se rejoue sans doublon. Un `PATCH` par
  `ndeg` frappe les homonymes. La Barre doit donc connaître `briefs.id` et
  l'instance ; elle ne garde que des codes. Une réponse perdue se reprend
  depuis la file d'envoi et son reçu.
- **Ce qu'il engage** : le transfert est immédiat, et `at` reste proche de
  `quand`. Le dossier Radar peut avoir changé entre-temps : il faut dire qui
  l'emporte.

### Sens 3 — Un humain dépose un paquet

La Barre exporte les décisions ; une personne dépose le fichier dans Radar.

- **Fichiers `la-barre`** : un export des seules décisions, à créer à côté de
  `exporter` (`la-barre/app/depot.js:555-566`), avec un bouton sur le modèle de
  celui des réglages (`la-barre/app/vue-reglages.js:101-102`).
- **Fichiers `radar`** : une route de dépôt, une page sous `briefs/` et une
  table de reçus, tous à créer. Aucune entrée existante ne convient : `/ingest`
  passe par un modèle et crée des tâches (`radar/server/ingest.js:1-14`).
- **Authentification** : la session Radar du déposant. Elle authentifie le
  dépôt, pas l'auteur de la décision, qui reste déclaré
  (`la-barre/app/acteur.js:1-2`).
- **Rejeu sans doublon** : un reçu par `decision.id`. Le même paquet rejoué ne
  change rien ; deux paquets qui se recouvrent se dédoublonnent. Le précédent
  existe dans l'autre sens (`la-barre/outils/ingerer-corpus.mjs:25-26`,
  `la-barre/outils/ingerer-corpus.mjs:118`).
- **Ce qu'il engage** : la cadence est humaine, et `at` est l'heure du dépôt.
  Sans la date `quand`, un paquet hebdomadaire écrase toute mesure de délai.

À trancher par le propriétaire (arbitrage 5.5,
`shinkiro/docs/PLAN-ACHEVEMENT.md:495`) : lequel des trois sens ; où vit la
correspondance projet ↔ dossier ; où vit la décision dans Radar ; quelle
authentification ; et si la route d'admission s'écrit neuve ou reprend celle
de l'employeur (arbitrage 5.15).

### Ce que l'arbitrage 5.6 doit fixer

L'arbitrage 5.6 choisit les indicateurs et la date de bascule
(`shinkiro/docs/PLAN-ACHEVEMENT.md:496`). Les candidats ci-dessous sont ceux
que les données permettent aujourd'hui. Aucun n'est choisi ici.

**Candidats tirés de Radar :**

- la durée d'un dossier, de `created` à `closed`, par `brief_id`
  (`radar/server/journal.sql:25`, `radar/server/journal.sql:34`) ;
- les réouvertures, `reopened` (`radar/server/journal.sql:35`) ;
- les réattributions, `reassigned` (`radar/server/journal.sql:37`) ;
- les reports d'échéance, `deadline` (`radar/server/journal.sql:38`) ;
- la ponctualité, `closed_at` avant `deadline`
  (`radar/briefs/sla.html:114-117`) ;
- les révisions par dossier maître : entrées `Révision`, de code `PARENT.RN`
  (`radar/server/ingest.js:65-75`, `radar/server/ingest.js:161-169`).

**Candidats tirés de La Barre :**

- le taux de reprise sur les versions (`la-barre/app/bilan.js:155-183`) ;
- les tours au-delà du vendu (`la-barre/app/bilan.js:185-200`) ;
- les propositions retenues au premier tour (`la-barre/app/bilan.js:124-133`) ;
- les écarts par origine, dont ceux du donneur d'ordre, facturables
  (`la-barre/app/ecarts.js:236-243`). Ils sont calculés à la lecture, sans
  historique : leur valeur « avant » n'existe que si on la photographie.

**Non calculables sur `main` :**

- le délai de verdict, faute de `soumis_le` (`la-barre/app/bilan.js:137-141`) ;
- la reprise mineure ou majeure de la méthode
  (`market-expansion-system/METHODE.md:65-67`) : aucun champ, ni dans `radar`
  ni dans `la-barre` — **non trouvé**.

**Ce que 5.6 doit fixer en plus des indicateurs :**

1. **La date de bascule** : à partir de quand chaque décision est transmise.
   Et la règle des dossiers ouverts avant la bascule et clos après.
2. **La fenêtre « avant » et sa source.** Si l'équipe n'utilisait pas Radar
   avant la bascule, il n'y a pas d'« avant » mesuré.
3. **L'histoire ancienne** : 125 événements à confidentialité inconnue
   (`radar/docs/RECEPTION-JOURNAL.md:13-14`). Les anciens n'ont ni `brief_id`
   ni instantané de périmètre (`radar/server/journal.sql:1-8`). Les inclure,
   ou non.
4. **Ce qui termine un dossier.** `closed` couvre Livré, Closed, Clôturé,
   Terminé (`radar/server/journal.sql:34`). Le périmètre d'autorité tient
   aussi pour finis « Envoyé dans Slack », « Livré (cycle) », « Validé »,
   « Bouclé », « Archivé » (`radar/functions/_authz.js:61`). « Validé » ou
   « Bouclé » produisent `status`, pas `closed`. Et `closed` ne prouve ni
   livraison ni accord client (`radar/docs/RECEPTION-JOURNAL.md:49-51`).
5. **L'horloge** : `at` de Radar ou `quand` de La Barre ; et le fuseau de
   l'instance (`radar/.env.example:11-12`, `radar/functions/_authz.js:59-60`).
6. **Les champs saisis.** `deadline` et `date_reception` sont du texte
   (`radar/server/pgrest.js:28`). La ponctualité ne compte que les échéances
   au format jour (`radar/briefs/sla.html:124`, `radar/briefs/sla.html:131`).
7. **La cohorte** : quelle instance Radar, quelle installation La Barre, quels
   projets.
8. **L'assise minimale.** La Barre distingue déjà un zéro mesuré d'un registre
   vide (`la-barre/app/bilan.js:7-14`). Chaque chiffre doit dire sur combien
   de faits il repose.
9. **L'accès en lecture.** Le flux public s'arrête à 200 éléments publics
   (`radar/functions/_feed.js:46`, `radar/functions/_feed.js:52-55`). La mesure
   demande la REST avec une identité, ou la base elle-même.

## Signal d'audit

Proposés. **Ils n'existent pas encore** : ni dans
`galahad/engine/skills/audit-fleet.json`, ni dans
`shinkiro/scripts/signaux-flotte.mjs`. Cette ADR ne les ajoute pas.

- `flux-declare` — `fleet.yml` déclare tout flux entre composants, avec `de`,
  `vers`, `via` et `cle`, sur le modèle de `source_partagee`
  (`shinkiro/scripts/signaux-flotte.mjs:155-176`). Violation : un champ
  manquant ; une route `via` introuvable dans le dépôt récepteur quand il est
  cloné à côté ; une `cle` qui nomme `ndeg` tant que `ndeg` n'est pas unique.
- `mesure-sans-flux` — tant qu'aucun flux `la-barre → radar` n'est déclaré,
  `docs/PORTFOLIO.md` garde sa condition « le before/after se rédige »
  (`shinkiro/docs/PORTFOLIO.md:72-75`). Violation : la condition retirée sans
  flux déclaré.

## Portée

Cette ADR ne choisit ni le sens ni les indicateurs. Elle n'écrit aucun code.

Elle ne rend pas `ndeg` unique : c'est le geste 4.4 et l'arbitrage 5.7. Les
sens 1 et 2 en dépendent pourtant.

Elle ne décrit ni ne reprend l'admission de l'installation de l'employeur. Elle
ne touche ni au pont MCP entre `talos` et `radar`, ni à La Fusée.

Elle ne reçoit aucune mesure. Un flux câblé rend la mesure possible ; il ne la
prouve pas.
