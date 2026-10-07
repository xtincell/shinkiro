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
client. Les clés sont globales à l'instance ; les identités et mandats restent ouverts.

La réception croisée utilise PostgreSQL jetable et deux processus Galahad avec
panne de retour 503. Elle ne reçoit pas une interruption pendant l'effet, le
bus des agents vivants ni le retour vers une campagne. Les contrats corrigés
sont dans Git ; les services actifs ne sont pas modifiés par cette réception.
Voir [RECEPTION-GALAHAD-DANMEM.md](RECEPTION-GALAHAD-DANMEM.md).

## radar — API de données

Interface façon PostgREST sur `/rest/v1/<table>`. Tables et colonnes en **liste blanche** :
tout ce qui n'y figure pas est refusé, ce n'est pas un oubli mais une protection.

| Table | Clé | Rôle |
|---|---|---|
| `briefs` | `id` | Le dossier. `ndeg` est un code métier actuellement non unique ; il ne remplace pas l'identifiant stable. |
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
d'histoire incomplète. Leur publication publique par défaut et l'option
`FEED_TOKEN` restent à prendre en compte pour chaque installation. Un ancien
PostgREST dépourvu du contrat de confidentialité n'est plus un repli public.

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

Les dépôts SPAWT sont des projets clients de la flotte, et restent inclus dans
l'audit intégral. La vitrine `spawt.online`, le quiz `quiz.spawt.online` et la page
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

La page historique ne porte plus de décompte expiré ni de promesse de remplacement
futur de la vitrine déjà en ligne. Elle conserve le quiz et mène au site actuel.
Les magasins mobiles restent annoncés à venir : aucune publication d'app n'est
déduite du seul fait que le site est en ligne.

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
admission dans le dossier, ouverture hors ligne et repli sans stockage restent
à recevoir. Voir [le contrat de l'outil](https://github.com/xtincell/indice-maturite/blob/main/README.md).

## talos ↔ radar — MCP

`talos/radar-mcp/` contient `index.js`, son `package.json` et un `test-client.mjs`. C'est le
pont MCP historique prévu pour exposer Radar au rôle Guardian. Les quinze
modules actuellement servis n’appellent pas ce client ; ils possèdent une
intégration HTTP distincte. Le contrat MCP reste une capacité donneuse à recevoir,
pas une connexion active prouvée. Voir [la réception des rôles](RECEPTION-TALOS-HULYSSE.md).

**Le protocole n'est décrit nulle part.** Il existe un client de test — c'est le point de
départ pour le reconstituer, puis le figer ici. Tant que ce n'est pas fait, toute
modification de l'API Radar peut casser Talos sans que rien ne le signale.

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

## Ce qui n'a pas de contrat, et devrait

Trois liaisons existent dans les faits mais ne sont spécifiées nulle part. Elles sont
listées ici pour qu'un agent sache qu'il improvise s'il y touche.

| Liaison | État |
|---|---|
| `talos/radar-mcp` → `radar` | Code présent, client de test présent, **protocole non écrit** |
| `hermes-cockpit` → `radar` et `danmem` | Le cockpit lit leur santé — **format des sondes non écrit** |
| `danmem` ↔ `galahad/engine/src/memory.js` | Responsabilités décrites ci-dessus ; **restauration, droits et parcours vivant non reçus** |

L'admission La Barre → Radar Matanga a désormais un contrat ci-dessus. Elle
ne reçoit pas encore le cycle de mesure avant/après du Transformation Pilot.
