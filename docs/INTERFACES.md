# Contrats d'interface

**Ces contrats sont déduits du code, pas déclarés par leurs auteurs.** Ils sont donnés pour
qu'un agent puisse travailler ; chacun est à confirmer avant d'être traité comme une
spécification.

Établi par relevé exhaustif au 14 septembre 2026. Ce qui est **constaté** est marqué comme
tel ; ce qui reste **à écrire** l'est aussi — et ce second groupe est le plus important.

## Galahad ↔ Danmem — contexte et travaux

Danmem est un service distinct. Une observation porte son peer, son contenu,
sa source et sa strate ; ce contexte ne modifie pas l'autorité d'un dossier
métier. Les cartes locales du moteur servent la continuité du rôle. Aucune
recopie globale de briefs ou d'approbations entre ces mémoires n'est reçue.

La file existante reçoit `to`, `skill`, des arguments objet et éventuellement
une échéance. Le consommateur lit ses pending, réclame atomiquement puis renvoie
`done` ou `failed`. Le résultat est conservé localement avant acquittement ; un
retour perdu est retenté sans rejouer la procédure. Danmem protège le premier
résultat final et accepte son rejeu identique. Un travail n'est pas une validation
client. Depuis danmem#7, chaque clé porte une identité et un mandat (strates, pairs,
travaux) et chaque écriture enregistre l'identité réelle de la clé ; la clé historique
`MEMORY_API_TOKEN` garde un mandat total sous l'identité `danmem:instance`. Un souvenir
se rectifie ou se retire avec une trace (qui, quand, pourquoi).

La réception croisée utilise PostgreSQL jetable et deux processus Galahad avec
panne de retour 503. Elle ne reçoit pas une interruption pendant l'effet, le
bus des agents vivants ni le retour vers une campagne. Les contrats corrigés
sont dans Git ; les services actifs ne sont pas modifiés par cette réception.
Voir [RECEPTION-GALAHAD-DANMEM.md](RECEPTION-GALAHAD-DANMEM.md).

### Qui écrit quoi

Relevé dans `galahad` et `danmem` le 10 novembre 2026.

| Couche | Où | Ce qui s'y écrit | Écrivain |
|---|---|---|---|
| Cartes du rôle | volume `galahad-memory`, sous `/memory/<rôle>/memory/` | Une carte par sujet, et l'index `MEMORY.md`, seul injecté au réveil | L'outil `remember` (`engine/src/memory.js`) |
| État du monde | même volume, `memory/ETAT_DU_MONDE.md` | Réécrit à chaque patrouille | `engine/src/heartbeat.js` |
| États du rôle | même volume, `data/` | `sessions.json`, `goals.json`, `jobs.json`, `consent.json`, `cerveau.txt`, `manual-runs.json`, budgets commerciaux | Chacun par son module |
| Reçus non acquittés | même volume, `data/job-receipts.json` | Le résultat d'un travail, écrit avant son acquittement | `engine/src/jobs.js` |
| Observations partagées | PostgreSQL de Danmem, tables `peers` et `observations` | Observations attribuées, cartes de pair, dérivations | Le service `danmem` |
| File de travaux | PostgreSQL de Danmem, table `jobs` | Les travaux entre mandataires et leur statut | Le service `danmem` |

Les écritures de `galahad` sont atomiques par renommage, sans verrou entre
processus. Les données de `hermes-cockpit` ne sont couvertes par aucune de ces
couches.

### Ce qui manque avant une restauration recevable

Aucun des deux dépôts ne porte de script de sauvegarde ou de restauration. Dix
manques, dans l'ordre où ils bloquent :

1. **Un script de sauvegarde et de restauration** : base Danmem, volume
   `galahad-memory`, ordre des opérations et gel des écrivains.
2. **Une version de schéma.** Danmem ne vérifie rien au démarrage : sur une base
   non migrée, `/health` répond 500 pendant que `/jobs` fonctionne, car la table
   `jobs` se crée seule (`danmem` `src/index.mjs:233-249`).
3. **La dépendance à pgvector.** La migration échoue sur un PostgreSQL nu.
   L'image qui le porte n'est épinglée que dans la CI.
4. **Un bail sur les travaux réclamés.** Un travail `claimed` au moment de la
   sauvegarde le reste à jamais après restauration (`danmem` `src/index.mjs:323`).
5. **La cohérence entre reçus et base.** Un reçu dont le travail n'existe plus
   est retenté sans fin, sans file morte (`galahad` `engine/src/jobs.js:23-27`).
6. **Les identités.** Un jeton global et un émetteur auto-déclaré : restaurer
   impose de reprovisionner ce jeton chez tous les consommateurs.
7. **L'unité `danmem.service` et un exemple d'environnement**, absents du dépôt.
8. **Un repli mort.** Le dernier recours local pointe sur un service retiré ; le
   code le dit lui-même (`danmem` `src/index.mjs:53-56`).
9. **La rectification et la suppression d'une observation**, qui n'ont pas de
   route.
10. **Les données du cockpit**, hors de toute sauvegarde.

Les points 1 à 5, 7 et 8 se ferment par un commit. Les autres demandent un
arbitrage ou une recette sur le VPS.

**État au 10 novembre, PR ouvertes, non fusionnées.**

| # | Fermé par | Reste |
|---|---|---|
| 1 | [danmem#5](https://github.com/xtincell/danmem/pull/5), [galahad#26](https://github.com/xtincell/galahad/pull/26) : sauvegarde, gel par arrêt des processus, ordre Galahad puis Danmem, restauration vérifiée avant démarrage | Recette sur le VPS : noms réels, version de `pg_dump`, volume réel |
| 2 | [danmem#2](https://github.com/xtincell/danmem/pull/2) pour `/health` ; la restauration compare la signature du schéma | Vérification au démarrage |
| 3 | La restauration refuse une extension absente ou d'une autre version | Épingler l'image hors de la CI |
| 4 | [danmem#4](https://github.com/xtincell/danmem/pull/4) : bail, remise en file, plafond | `release` côté Galahad |
| 5 | [galahad#24](https://github.com/xtincell/galahad/pull/24) : reçus refusés mis de côté ; `--danmem-url` à la restauration | — |
| 7, 8 | [danmem#3](https://github.com/xtincell/danmem/pull/3) | Relire l'unité servie |
| 6, 9, 10 | — | Arbitrage |

## radar — API de données

Interface façon PostgREST sur `/rest/v1/<table>`. Tables et colonnes en **liste blanche** :
tout ce qui n'y figure pas est refusé, ce n'est pas un oubli mais une protection.

| Table | Clé | Rôle |
|---|---|---|
| `briefs` | `id` | Le dossier. `ndeg` est un code métier **unique par instance** depuis [Radar #9](https://github.com/xtincell/radar/pull/9) (contrainte `briefs_ndeg_unique`). Les homonymes anciens sont renommés `<ndeg>-2`, `-3`… sans rien supprimer, et tracés dans `briefs_ndeg_renommes`. `ndeg` ne remplace pas l'identifiant stable `id`. |
| `clients` · `client_markets` · `client_contacts` | `id` | Référentiel client. `data` en JSONB. |
| `task_events` | `id` | **Le journal en lecture seule par REST.** `brief_id` rattache le mouvement ; `private_to` conserve sa confidentialité historique. |
| `comments` | `id` | Fil par `ndeg`. |
| `brief_assets` | `id` | Visuels. Création/suppression par `/visuels` ; seul PATCH de `caption` passe par REST. |
| `app_config` | `key` | Configuration. |

Filtres supportés : `eq` `neq` `gte` `lte` `is` `in` `cs`, plus `select` / `order` / `limit`.

**Le journal est le contrat qui compte.** `task_events` est ce qui rend la mesure
avant/après possible sans déclaratif : `at`, `ndeg`, `statut_old`, `statut_new`, `resp_old`,
`resp_new`, `kind`, `summary`. Depuis [la correction Radar #3](https://github.com/xtincell/radar/pull/3),
le producteur émet cette trace dans la transaction du brief, y compris pour une
écriture SQL autorisée. Une intégration **modifie le dossier et reçoit son résultat** ;
elle n'écrit pas une seconde fois dans `task_events`. Un changement et sa trace
échouent ensemble. La seule modification de `updated_at` ne produit pas de mouvement.

La confidentialité du mouvement et celle du dossier courant sont vérifiées à
la lecture. L'histoire ancienne dont la confidentialité est inconnue reste
conservée mais non publiée et signalée comme incomplète. La suppression privée
ne rend pas ses mouvements publics. Ces règles couvrent aussi fichiers et
commentaires. Le code refuse un rattachement de média sur un code ambigu.

La recette du composant reçoit les échecs de lot et de journal, les transitions
de confidentialité, les médias et le redémarrage. Elle ne reçoit pas les
permissions métier complètes par rôle, la concurrence des codes, la
qualification de l'histoire ni tous les échanges inter-outils. L'accès machine
général reste distinct du filtrage humain. Une trace `closed` n'est pas une preuve
de livraison ni d'accord client. Voir `radar/docs/RECEPTION-JOURNAL.md`.

### Flux sortants

- `GET /feed.xml` — RSS 2.0
- `GET /activity.json` — JSON Feed 1.1

Ils exposent les mouvements publics qualifiés de `task_events`, avec un signal
d'histoire incomplète. Un ancien PostgREST dépourvu du contrat de
confidentialité n'est plus un repli public.

**Privés par défaut** depuis [Radar #9](https://github.com/xtincell/radar/pull/9)
(arbitrage 5.7). `/feed.xml` et `/activity.json` s'ouvrent par
`FEED_PUBLIC=1` ou aux détenteurs de `FEED_TOKEN` ; sinon ils restent derrière
le mur, en aperçu pour `owner`, `supervisor` et la clé machine. `/jour.html` et
`/jour.json` s'ouvrent par `JOUR_PUBLIC=1` ; sinon `/jour.json` suit le
périmètre du rôle. Le CORS n'est posé que sur une sortie publiée. Les
événements à confidentialité inconnue restent privés jusqu'à leur relecture
par `POST /journal/revue`, tout ou rien, avec `revue_par` et `revue_le`.
Relevé du 12 novembre 2026, sans session : les deux instances du VPS,
personnelle et agence, répondent 401 sur `/`, `/feed.xml` et
`/activity.json`. Aucun outil de la flotte ne lisait ces flux.

Côté API, il n'y a pas d'upsert : un `POST` ou un `PATCH` qui prend un code
existant reçoit 409, sans écriture et sans révéler le dossier.

### Entrée libre

`POST /ingest` — texte brut → LLM local (Ollama) → tâches structurées. Tout entre en
`statut = Reçu` et `brief_etat = déduit`. **Repli sans perte si Ollama est injoignable** :
le texte est conservé, la structuration est différée.
Le lot et ses événements sont maintenant atomiques ; une erreur au second
élément ne laisse pas le premier créé en prétendant que tout est reçu.

### Persistance

PostgreSQL conserve les dossiers et leur journal. `/data` conserve le KV SQLite
de mots de passe personnels et les binaires des visuels. Les deux doivent être
persistants et sauvegardés pour une instance déployée ; un conteneur applicatif
seul ne conserve pas `/data` lors de son remplacement. La restauration sur un
même hôte ne reçoit pas l'isolation ou la reprise sur un second serveur.

### Installation Matanga

Le même journal canonique est repris dans
[Matanga-Creative-dashboard #57](https://github.com/xtincell/Matanga-Creative-dashboard/pull/57).
L’installation possède sa propre base et son propre stockage ; elle ne partage
ni les dossiers ni les comptes du Radar personnel. Un raccord doit identifier
l’instance destinataire et le dossier stable, pas seulement un code de projet.

Matanga conserve ses favoris, rôles/groupes de visuels, créneaux calendrier,
portail client et évaluations RH. `brief_assets` reste intégralement en lecture
seule via REST ; les métadonnées passent par `PATCH /visuels/:id`. Le retour
portail, son commentaire et sa trace sont atomiques. La validation d’un visuel
ne clôture pas le dossier. Modifier son contexte retire son ancien accord ; un
no-op le conserve. Le portail et les médias partagent la résolution d’un brief
unique et autorisé, avec refus des codes ambigus et des dossiers privés.

Les tests PostgreSQL et la vérification du code livré ne remplacent pas la
réception native de la cloche et du portail. Les permissions métier complètes,
l’histoire non qualifiée et la reprise dans
un autre environnement restent ouverts. Voir
[le contrat Matanga](https://github.com/xtincell/Matanga-Creative-dashboard/blob/main/docs/RECEPTION-JOURNAL.md).

### La Barre → Radar Matanga — admission, puis rapprochement

[La correction #58](https://github.com/xtincell/Matanga-Creative-dashboard/pull/58)
raccorde le formulaire de création existant à une lecture serveur de La Barre.
`RADAR_INSTANCE_ID`, `BARRE_SOURCE_ID`, `BARRE_SOURCE_URL` et `BARRE_CLIENT_MAP`
désignent la destination, la source et les clients permis. Sans configuration
explicite : 503, aucune admission. Le navigateur ne fournit aucune URL ni clé.

`GET /sources/la-barre/projects/:id` présente les champs de suivi, leurs
qualifications, la version source, le reçu précédent et la version des champs
Radar. `POST` au même chemin reçoit ces versions et la destination. Une
réponse perdue reprend le reçu existant ; une autre version ou destination
n'est pas acceptée silencieusement. Brief, liaison et reçu partagent la
transaction ; le journal canonique produit seul le mouvement métier.

La clé de liaison est `(instance Radar, instance La Barre, project, id source)`.
Le dossier Radar est identifié par son `briefs.id`, distinct de son code
lisible. Les reçus privés conservent les identifiants de client et des marques,
l'empreinte du projet et celle du contexte transféré. Ils suivent la
confidentialité actuelle du dossier. Une suppression ne déclenche pas une
recréation automatique.

La Barre conserve le cadrage ; Radar conserve ses états, responsables,
priorités et accords. L'admission initiale reste Reçu / déduit, non assignée.
Une reprise conserve les corrections locales indépendantes ; deux changements
du même champ demandent un choix, invalidé par un nouveau changement Radar.
Ni la provenance, ni l'admission ne valent accord client ou authentification
de l'auteur de La Barre. Aucun modèle ou agent n'est nécessaire.

Les codes sont attribués sous verrou entre admissions ; les autres créateurs
historiques n'ont pas encore ce même écrivain. Le champ marque historique
reste utilisé dans certains filtres malgré les identifiants distincts
conservés au reçu. Le rattachement Fusée est reçu dans son interface ; l'écran
Radar Matanga, le retour des résultats, le cycle complet et le second locataire
restent ouverts.
Voir [le contrat d'admission](https://github.com/xtincell/Matanga-Creative-dashboard/blob/main/docs/ADMISSION-LA-BARRE.md).

### La Barre → Radar agence — les décisions (SHK-0005, sens 1)

Arbitrage 5.5 du 11 novembre 2026 : **Radar va lire, La Barre n'envoie rien.**
Distinct de l'admission Matanga ci-dessus, qui crée des dossiers dans une
installation hors flotte.

**Côté La Barre** ([la-barre #22](https://github.com/xtincell/la-barre/pull/22)) :
`GET /radar/decisions` sert la seule collection `decisions` du dépôt désigné
par `depots/manifeste.json` ; ni personnes, ni facturation, ni reste de la
base. Jeton `BARRE_RADAR_TOKEN` en Bearer, 32 caractères au moins, comparé en
temps constant : sans jeton configuré, 503 ; jeton absent ou faux, 401 ; autre
méthode que `GET`/`HEAD`, 405. Champs servis : `id`, `projet`, `objet`, `type`,
`verdict`, `motif`, `quand`, `qui`, `acteur`, `titre`, plus `campagne`,
`marque`, `version`, `portee`, `remplace`, `ecart`, `empreinte`,
`revisionSource`, `cree_le` quand la décision les porte. Chaque décision porte
`empreinte_contenu` (SHA-256 du JSON canonique). L'`ETag` ne change qu'avec les
décisions. Une décision sans identifiant ou à identifiant pris deux fois est
nommée dans `ecartees`, pas servie.

**Côté Radar** ([Radar #8](https://github.com/xtincell/radar/pull/8)) :
`server/barre.js` lit toutes les `BARRE_INTERVAL_MIN` minutes (15 par défaut,
0 désactive), une lecture à la fois. Il refuse une redirection, borne la
réponse à 32 Mo et 30 s, recalcule l'empreinte et refuse une décision altérée.
Tables :

- `barre_recus` — un reçu par (instance La Barre, `decision.id`, version). Même
  empreinte : rien. Empreinte changée : version suivante, l'ancienne reste.
  Décision disparue de la même base : version « retiree », jamais effacée.
- `barre_projets` — la correspondance projet La Barre ↔ (instance Radar,
  `briefs.id`), tenue dans Radar. Aucun `ndeg` n'est deviné.
- `barre_lectures` — l'état de la dernière lecture (`statut`, `derniere_reussite`).
- vue `barre_decisions` — versions, remplacement et rattachement calculé.

`quand` garde la date de la décision ; `at` reste l'heure d'écriture dans
Radar. Les décisions sont **privées** : rien dans `briefs` ni `task_events`,
donc rien dans les flux. Les trois tables sont réservées à `owner` et
`supervisor`.

**En production depuis le 12 novembre 2026, 11 h 06 UTC.** Une instance Radar
dédiée à l'agence (`radar-agence`, base propre) lit La Barre par le réseau
interne du VPS (`la-barre-source:3000`), sans exposer la route au public.
Première lecture réussie : zéro décision, La Barre de production étant vide ;
les lectures suivantes répondent « inchangé » (304). Cette heure est la date de
bascule de l'arbitrage 5.6. L'instance personnelle ne lit pas La Barre.

Restent ouverts : le calcul des indicateurs retenus en 5.6 et la saisie de la
correspondance projet ↔ dossier dans l'écran Radar.

## la-fusee ↔ radar — identité et accès au suivi

`BrandNode.sourceRefs` conserve une référence, jamais un état métier copié.
L'identité est `(system, instance, kind, id)` : pour Radar, `kind=brief`, instance
explicite et id numérique stable. Le code lisible sert de libellé. Deux instances
ayant le même id ne sont pas le même dossier. Le lien n'accorde aucun accès.

Le contexte projet est facultatif et qualifie la seule installation La Barre
déjà raccordée : `LA_BARRE / barre-matanga / project / id`. Les anciennes
références La Barre sans instance gardent ce contexte canonique ; une autre
instance est refusée plutôt que lue dans le dépôt global. La lecture conserve
les entrées valides et signale les rejets ; l'écriture reste stricte. Un historique
invalide ne peut pas être tronqué par un formulaire ou un import.

Le formulaire, l'import relançable et le chemin agentique partagent le même
écrivain gouverné. Remplacer les références exige la version lue du nœud ; la
comparaison et l'écriture sont atomiques. Une édition périmée demande une reprise.
La projection dédoublonne le suivi d'un projet partagé entre plusieurs marques.

Réception du 7 octobre 2026 : La Fusée 403, commit `414678d`, raccord manuel de
Bonnet Rouge, Peak et Belle Hollandaise au même brief `491`, code `FRC-076`,
instance `radar-matanga`, origine `PRJ-EOTY26`. Un projet et un accès sont reçus
en vue groupe. Anciens liens et pièce partagée conservés ; aucun statut recopié.
Tests locaux de concurrence et permissions reçus ; autres rôles natifs et
cycles complets ouverts. Voir [ADR-0200](https://github.com/xtincell/ADVE-project/blob/main/docs/governance/adr/0200-portfolio-identites-radar.md).

### la-fusee — tâches, reprises et reçus

`CampaignDeliverable` porte la tâche ; `CampaignChangeRequest` conserve sa
reprise, son motif et sa décision. Le code de tâche utilise l'écrivain existant,
sous verrou de campagne et maximum historique. Le ticket reprend ce code ou
l'identifiant complet du livrable ; un préfixe ambigu demande qualification.

Le `requestId` explicite réutilise l'identifiant du ticket existant. Le même
envoi, même après un nouveau processus, retrouve le même reçu. Un autre contenu
ou un autre livrable avec cet identifiant est refusé ; sans cet identifiant,
deux demandes identiques restent deux demandes. Services router et handlers
Mestor comparent le périmètre déclaré à la vraie campagne. Cette cohérence ne
remplace pas l'autorisation d'accès.

Résolution et rejet sont terminaux, sous verrou. Rejouer exactement la même
résolution conserve le reçu ; une autre décision refuse la réouverture. Un
brief lié appartient à la campagne, le responsable à l'équipe. L'arbitrage local
ne poste aucun message externe. Résoudre une reprise ne livre pas la tâche.

Retirer le statut manuel de tâche recalcule sa santé. Le calcul automatique
de santé de campagne n'existe pas encore : la remise correspondante refuse
l'écriture au lieu de fabriquer du vert. Le choix d'équipe administrateur est
reçu en 409/410, ainsi que les campagnes sans tâche et le sélecteur par nom.
Le rôle opérateur natif distinct, le brouillon après remontage et le cycle
métier complet restent ouverts.
Voir [ADR-0202](https://github.com/xtincell/ADVE-project/blob/main/docs/governance/adr/0202-reprises-campagnes-identite.md)
et [la réception bornée](RECEPTION-REPRISES-SURFACES.md).

### SPAWT — marque, produit et surfaces publiées

Les dépôts SPAWT sont des projets clients. Ils ne rejoignent pas la flotte
(voir [`CLOISON.md`](CLOISON.md)), mais restent inclus dans l'audit intégral. La vitrine `spawt.online`, le quiz `quiz.spawt.online` et la page
historique `bientot.spawt.online` ont des branches et déploiements distincts.
Une annonce exacte dans un dépôt peut rester périmée dans un autre.

Le Quiz Palais pose l'hypothèse de goût ; un Spawt apporte le comportement ; le
Taste Reveal rapproche les deux. La sixième question mesure la notoriété du lieu
(Foule ↔ Secret), sans l'assimiler à son ambiance. Les six questions existantes
et leurs calculs sont conservés. Les annonces de leurs trois surfaces sont
reçues après correction ; cette mise à jour manuelle ne constitue pas encore
une irrigation depuis une version approuvée du dossier de marque dans La Fusée.

La réception future doit rapprocher source de marque, version produit réellement
servie, modification publiée et retour de mesure. Doctrine, fonctionnalité
déclarée et résultat utilisateur reçu restent distincts. Aucun agent n'est requis
pour publier ou corriger ; l'assistance emprunte les mêmes décisions.

La Fusée 432 reçoit un raccord borné de l’identité choisie vers la seule vitrine :
référence CANON → choix id/version/usage → édition public-brand-v2 → huit copies
vérifiées → décodage client et retour v4→v6 reçu. Six couleurs, cinq polices,
trois usages Moka et une citation sont concernés. Le contrat v1 reste lisible ;
références privées et chartes DRAFT restent privées. Chargement, retour au premier
plan et contrôle visible toutes les cinq minutes relisent l’édition choisie.
Cela ne reçoit pas le contrat métier du quiz, l’application ou le retour de mesure.
Voir [la réception partielle](RECEPTION-CORPUS-SPAWT.md).

La page historique ne porte plus de décompte expiré ni de promesse de remplacement
futur de la vitrine déjà en ligne. Elle conserve le quiz et mène au site actuel.
Les magasins mobiles restent annoncés à venir : aucune publication d'app n'est
déduite du seul fait que le site est en ligne.

Le produit Application mobile conserve son lien La Barre et son dépôt, auxquels
s’ajoutent branche active, aperçu, console équipe et backend, retrouvés après
rechargement natif. L’app Expo, la console et le backend ont des sources et
réceptions distinctes du prototype web gelé. La conservation des opérations hors
ligne est partiellement corrigée. Les critères de favoris concurrents, suppression
distante et réponse tardive sont corrigés dans PR #7, avec intention persistée par
compte ; reprise authentifiée, purge et autres callbacks restent à recevoir.
Le rejeu d’apprentissage du Palais garde un défaut reproduit. Une base avec RLS activée n’est
pas une réception des permissions. Voir [la réception application](RECEPTION-SPAWT-APPLICATION.md).

Les liens confidentialité/CGU de l’entrée sont reçus par clic natif vers les pages
existantes de la vitrine. Leurs textes restent à valider. Les liens profonds du
produit et la reprise de contexte après connexion ne sont pas reçus par ce raccord.

### Cockpit — conservation et commandes d’exploitation

Tâches/notes JSON, registre propagé et demandes de configuration ont une autorité
locale. L’acquittement suit la conservation ; l’effet d’un changement de modèle ou
d’un rafraîchissement doit être constaté dans le consommateur. Les refus partiels
du portail conservent leur cause sans effacer les lectures disponibles. Ce contrat
ne remplace pas les décisions Fusée/La Barre, le journal Radar ou les mandats de
Galahad. Concurrence avec les autres écrivains, fraîcheur, permissions et partage
des deux cockpits restent à recevoir. Voir [RECEPTION-COCKPIT.md](RECEPTION-COCKPIT.md).

Le portail utilise aussi un service hôte distinct et sa base `matanga_portal`.
Son raccord PostgreSQL périmé est rétabli après lecture du schéma et du rôle ;
les routes d’accès, codes, visibilité et journal répondent à nouveau. La visibilité
est une correspondance client → numéros. Adresse stable, autres consommateurs et
réception des commandes métier restent ouverts ; cette lecture ne recopie pas
les données de l’employeur dans un registre de marque général.

## indice-maturite → la-fusee — bilan déclaratif conservable

L'Indice conserve ses questions et sa méthode. Un bilan incomplet montre sa
couverture sans note globale ni prescription définitive. Un bilan complet reste
déclaratif : ce n'est ni une performance marché ni une validation de stratégie.
La reprise locale conserve réponses et version de méthode ; le téléchargement
Markdown contient les réponses, les inconnues et les limites.

La destination est le dépôt de sources existant du bon dossier Fusée. Exporter
le bilan ne reçoit ni son admission, ni son analyse, ni l'arbitrage. Aucun second
registre de marques ou de scores n'est créé. Questionnaire, reprise, bilans
partiel/complet et téléchargements sont reçus nativement en ligne le 7 octobre ;
admission dans le dossier et ouverture hors ligne restent à recevoir. Le repli
sans stockage est livré (`indice-maturite` `app.js:46-54`, relevé du 10 novembre). Voir [le contrat de l'outil](https://github.com/xtincell/indice-maturite/blob/main/README.md).

## la-barre → la-fusee — bilan de campagne

« Clore le bilan de campagne » passe par la fabrique de décision de La Barre et
fige une version dans `campagne.bilanVersions`. Chaque version porte une identité
stable `BIL-<campagne>`, un numéro, son empreinte SHA-256 et celle de la version
précédente. Une version n'est jamais réécrite.

La Barre ne propose la transmission que si `contexte.json` déclare
`CAMPAIGN_REVIEW_V1`. Elle n'envoie que l'identité, le numéro et l'empreinte à
`POST /la-barre/bilan`, avec la même garde que la publication. La Fusée relit la
version dans la base de La Barre, recalcule l'empreinte, puis la range comme
proposition dans les sources de la marque, par l'Intent
`INGEST_BARRE_CAMPAIGN_REVIEW`. Un rejeu est sans effet. Sont refusés :

- une autre empreinte sous un numéro déjà reçu ;
- une version plus ancienne ;
- une chaîne d'empreintes rompue ;
- une marque absente ou ambiguë.

Livré le 11 novembre (la-barre#19, ADVE-project#1180, ADR-0244). Depuis
la-barre#20 et ADVE-project#1183 (ADR-0245), La Fusée déclare dans `contexte.json`
la personne connectée (`actorAttestation: "SESSION_V1"`) et scelle chaque nouvelle
décision, ligne de journal et version de bilan à l'enregistrement de la base ; elle
vérifie ce sceau à la réception d'un bilan. Cette attestation suppose que seul La
Fusée joint le port de La Barre. Ne sont pas encore faites :

- la relecture du bilan dans le brief de la campagne suivante ;
- la transmission automatique.

## galahad ↔ radar — MCP

Le pont MCP vit désormais dans `galahad` : `engine/src/radar-mcp.js` et
`engine/src/mcp-stdio.js`, reçus par [galahad #29](https://github.com/xtincell/galahad/pull/29)
(arbitrage 5.3). Talos et Hulysse sont archivés ; `talos/radar-mcp/` n'est plus
qu'une trace historique. Le pont sert les sept outils Radar du rôle par
`runRadarTool` : même portée de rôle, mêmes gardes et même client HTTP que la
boucle d'agent. Il n'y a qu'un contrat, servi par deux transports. Le protocole
est écrit à la main (`initialize`, `ping`, `tools/list`, `tools/call`), sans
dépendance npm. Un test parle au vrai processus du pont, Radar simulé.

Lancement : `GALAHAD_ROLE=guardian node --env-file=.env src/radar-mcp.js`.
Les instances viennent de `RADAR_INSTANCES`, avec `RADAR_<NOM>_URL` et
`RADAR_<NOM>_KEY`. Sans instance déclarée pour un rôle autorisé, le pont sert
zéro outil et le dit sur stderr.

Le contrat ci-dessous a été reconstitué sur le pont Talos ; galahad #29 garde
le nom du serveur (`radar`, version 1.0.0), les noms, les schémas et les
requêtes Radar.

### Le contrat

Reconstitué le 10 novembre 2026 depuis `talos/radar-mcp/index.js` et
`talos/src/mcp.js`, puis rejoué de bout en bout sur un Radar local. Les
paragraphes **Lancement** et **Configuration** décrivent le pont Talos
historique ; ceux du pont galahad sont plus haut.

**Transport.** stdio, JSON-RPC 2.0, aucun port. Le pont Talos utilisait le SDK
`@modelcontextprotocol/sdk` 1.29.0 ; le pont galahad écrit le protocole à la
main. Le serveur se nomme `radar`, version 1.0.0, et ne déclare que des outils.

**Lancement (Talos).** Talos lançait `node --env-file=<dir>/.env <dir>/index.js`, où `<dir>`
vaut `RADAR_MCP_DIR`, par défaut `/opt/talos/radar-mcp`. Ce `.env` est ignoré de
git et l'installeur ne le crée pas. Sans lui, le pont expose zéro outil, sans
erreur visible.

**Configuration (Talos).** `RADAR_MATANGA_URL`, `RADAR_MATANGA_KEY`, `RADAR_PERSO_URL`,
`RADAR_PERSO_KEY`. Les deux instances, `matanga` et `perso`, sont figées dans le
schéma des outils.

**Authentification.** `Authorization: Bearer <clé>`. La clé doit égaler le
`RADAR_API_KEY` de l'instance. Radar la traite comme l'identité `service@radar`,
avec accès complet : le mur et le périmètre de confidentialité sont levés.

**Outils.** Chaque appel vise `<URL>/rest/v1/<chemin>`. `radar` est requis partout.

| Outil | Entrée | Appel Radar | Retour |
|---|---|---|---|
| `radar_list` | `query` facultatif | `GET briefs`, neuf colonnes, 5 000 lignes au plus ; filtre côté pont, plafond 200 | `{count, tasks[]}` |
| `radar_get` | `ndeg` | `GET briefs?select=*&ndeg=eq.<ndeg>` | La première ligne |
| `radar_create` | `fields` (objet) | `POST briefs`, corps `[fields]` | `{created}` |
| `radar_update` | `ndeg`, `patch` | `PATCH briefs?ndeg=eq.<ndeg>` | `{updated[]}` |
| `radar_delete` | `ndeg` | `DELETE briefs?ndeg=eq.<ndeg>` | Un texte |
| `radar_comment` | `ndeg`, `text`, `author` facultatif | `POST comments`, auteur « Claude » par défaut | `{comment}` |
| `radar_activity` | `limit` de 1 à 200, 30 par défaut | `GET task_events`, dix colonnes, du plus récent | `{count, events[]}` |

**Erreurs.** Jamais d'erreur de protocole. Tout échec revient en
`{isError: true}` avec le texte `Erreur : <radar> <MÉTHODE> <chemin> → HTTP <code>`.
Le schéma d'entrée n'est pas validé côté serveur, et aucun délai ne borne l'appel.

### Les écarts avec Radar

Relevés le 10 novembre sur le pont Talos, revus le 12 novembre sur le pont
galahad et Radar #9.

1. **`ndeg` n'est pas unique** — *fermé côté Radar.* Depuis Radar #9, un code
   ne désigne qu'un dossier par instance ; `radar_get`, `radar_update`,
   `radar_delete` et `radar_comment` ne touchent plus d'homonymes. Le pont
   ignore toujours `briefs.id`.
2. **La confidentialité est sautée** — *ouvert.* La clé machine lève le filtre
   de `task_events`. `radar_activity` ne lit ni `private_to` ni l'en-tête
   `X-Radar-Unqualified-Events` : un mouvement privé arrive au modèle sans
   marque.
3. **`radar_delete` échappe à la confirmation** — *fermé par galahad #29.*
   Il exige le consentement existant (« oui », `/grant`, nuit autorisée),
   contrôlé avant toute requête. Par le pont, seule la fenêtre `/grant` de la
   même installation compte : un client MCP ne confirme pas à la place de
   l'opérateur.
4. **Une création sans `ndeg`** — *à vérifier.* Les champs inconnus sont
   ignorés en silence.
5. **Les branches « Aucune tâche »** — *à revérifier sur le pont galahad.*
6. **La liste des événements est périmée** — *ouvert.* Radar émet aussi
   `deleted`, `reopened`, `unfrozen`, `deadline`, `visibility`, `updated`,
   `asset`, `asset_deleted` et désormais `renamed`.
7. **Toute écriture est anonyme** — *ouvert.* Elle porte l'identité
   `service@radar` ; l'auteur d'un commentaire est le nom de l'agent par
   défaut.
8. **Le client de test n'affirme rien** — *fermé.* Le test de galahad #29
   affirme le contrat contre un Radar simulé.
9. **Aucun test ne lie les deux côtés** — *ouvert.* Le test simule Radar ; il
   ne joue pas contre un Radar réel.

L'instance `matanga` tourne sur un autre code, hors flotte : sa parité n'est pas
vérifiée, et ne peut pas l'être d'ici.

### Qui s'en sert

La boucle d'agent de `galahad` appelle les mêmes outils en HTTP direct
(`galahad` `engine/src/integrations.js`) ; le pont les sert à un client MCP
(Claude Code…). Depuis [galahad #22](https://github.com/xtincell/galahad/pull/22),
une panne d'intégration revient à l'opérateur au lieu de tuer le tour.

## galahad — sas-admin, le sas de sécurité

`galahad/deploy/sas-admin/` porte une passerelle Python (`gateway/app.py`, Dockerfile,
`requirements.txt`, compose) et trois scripts : `close-ports.sh`, `issue-fable-token.py`,
`revoke-token.py`.

C'est l'**émission et la révocation de jetons**, plus la fermeture de ports sur l'hôte.
Aucun agent ne doit toucher à ce répertoire sans comprendre ce qu'il ouvre et ce qu'il ferme.

## galahad — patrouille

`deploy/patrol/` tourne par cron (`galahad-patrol.cron`) : `brain-health.sh`,
`deliver-watchdog.sh`, `deliver.sh`, `purge.sh`, `prune-coolify-images.sh`.

La patrouille **purge les images Coolify** — c'est l'une des trois preuves que Coolify est la
plateforme du VPS. Voir [`TOPOLOGIE.md`](TOPOLOGIE.md).

## galahad — compétences d'agent

`engine/skills/` contient `audit-coherence.json` et `diagnostic-coolify.json`, décrites dans
`engine/skills/README.md`. Le format des compétences est un contrat interne au moteur.

## galahad — rôles

Une image moteur, trois conteneurs portant le même code avec un rôle différent.

| Rôle | Fichier | Contrat |
|---|---|---|
| **Chef** | `engine/roles/chef.md` | Face humaine. Route le travail et délègue. |
| **Guardian** | `engine/roles/guardian.md` | Patrouille santé et QA. Une patrouille de routine est **un pur contrôle shell, à coût nul en tokens** — le cerveau ne s'éveille qu'à l'anomalie. |
| **Traveler** | `engine/roles/traveler.md` | Explorateur autonome, bâtisseur de nuit. **Demande avant de livrer.** |

Le cerveau est **n'importe quel endpoint compatible OpenAI**. Aucune dépendance à un
fournisseur : ne pas en introduire.

## Secrets

Inventaire par dépôt. **Aucun n'est dans ce dépôt** — il faut les demander.

| Dépôt | Secret | Usage |
|---|---|---|
| `ADVE-project` | `DATABASE_URL` | Postgres de production. Injoignable depuis les runners GitHub — c'est un problème ouvert, pas une configuration à copier. |
| `radar` | `DATABASE_URL` | Postgres de l'instance. Une instance = une base. |
| `radar` | mot de passe partagé | Mur d'authentification email + mot de passe. |
| `galahad` | jeton Telegram | Canal opérateur. |
| `galahad` | clé du endpoint LLM | Compatible OpenAI, fournisseur libre. |

Chacun a son `.env.example` — sauf `la-barre`, qui n'en a pas besoin : aucun serveur, aucun
compte.

## hermes-cockpit → galahad — changer le modèle d'un agent

Relevé dans le code le 10 novembre 2026. Trois maillons, dont un seul hors git.

| Maillon | Où | Ce qu'il fait |
|---|---|---|
| 1. Demande | `hermes-cockpit` `portal.mjs`, `requestBrain()` | `POST /api/brain` écrit `{ <agent>: <modèle> }` dans `agent-brains.json`, sous le dossier de données du cockpit. Le modèle doit figurer dans `options` de `agent-brains-status.json`, sinon la demande est refusée. Seuls `talos` et `hulysse` sont proposés. |
| 2. Application | sur l'hôte, **dans aucun dépôt** | Une tâche planifiée (`brain-apply.sh`, puis `dan-brain set`) lit `agent-brains.json` et écrit `data/cerveau.txt` dans le dossier de l'agent. Elle produit aussi `agent-brains-status.json`, que le cockpit relit. |
| 3. Prise en compte | `galahad` `engine/src/brain.js`, `getModel()` | Le moteur relit `data/cerveau.txt` dès que sa date de modification change, sans redémarrage. `GALAHAD_MODEL` ne sert qu'au premier démarrage. |

Trois conséquences :

- **Une demande n'est pas un changement.** Le cockpit enregistre une demande ;
  rien ne confirme qu'elle a été appliquée, sauf le statut que produit le maillon 2.
- **Le maillon 2 ne se restaure pas depuis git.** Une réinstallation de l'hôte le
  perd. `galahad` `LESSONS.md` (§ 3.5) décrit un incident de juillet où la chaîne
  semblait cassée alors que c'est le moteur qui ne relisait plus le fichier.
- **Le fichier est le contrat.** Un modèle mal écrit dans `cerveau.txt` est pris
  tel quel au prochain appel ; aucune validation n'a lieu côté moteur.

## Ce qui n'a pas de contrat, et devrait

État au 10 novembre 2026. Deux des trois liaisons listées ici ont désormais leur
contrat ; la troisième n'était pas ce qu'on en disait.

| Liaison | État |
|---|---|
| `galahad` (pont MCP) → `radar` | **Contrat écrit ci-dessus.** Repris de `talos/radar-mcp` par galahad #29. Trois écarts fermés (1, 3, 8), six ouverts ou à vérifier. |
| `hermes-cockpit` → `radar` | **Cette liaison n'existe pas.** Le cockpit ne lit aucune santé de Radar. Il relaie le portail client de l'installation de l'employeur, par `PORTAL_API_URL`. |
| `hermes-cockpit` → `danmem` | Le cockpit lit un fichier, `danmem-status.json`, et non le service. **Le producteur de ce fichier est sur le VPS, dans aucun dépôt.** |
| `danmem` ↔ `galahad/engine/src/memory.js` | **Responsabilités et manques écrits ci-dessus.** Restauration, droits et parcours vivant non reçus. |
| `hermes-cockpit` → `galahad` (modèle d'un agent) | **Contrat écrit ci-dessous.** Le maillon central, sur l'hôte, n'est dans aucun dépôt. |

L'admission La Barre → Radar Matanga a désormais un contrat ci-dessus. Elle
ne reçoit pas encore le cycle de mesure avant/après du Transformation Pilot.
