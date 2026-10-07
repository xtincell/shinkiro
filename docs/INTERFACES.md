# Contrats d'interface

**Ces contrats sont déduits du code, pas déclarés par leurs auteurs.** Ils sont donnés pour
qu'un agent puisse travailler ; chacun est à confirmer avant d'être traité comme une
spécification.

Établi par relevé exhaustif au 14 septembre 2026. Ce qui est **constaté** est marqué comme
tel ; ce qui reste **à écrire** l'est aussi — et ce second groupe est le plus important.

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
qualification de l'histoire ni le raccord La Barre → Radar. L'accès machine
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
réception native de la cloche et du portail. Le raccord idempotent La Barre,
les permissions métier complètes, l’histoire non qualifiée et la reprise dans
un autre environnement restent ouverts. Voir
[le contrat Matanga](https://github.com/xtincell/Matanga-Creative-dashboard/blob/main/docs/RECEPTION-JOURNAL.md).

## talos ↔ radar — MCP

`talos/radar-mcp/` contient `index.js`, son `package.json` et un `test-client.mjs`. C'est le
pont MCP qui expose Radar au rôle Guardian.

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

Quatre liaisons existent dans les faits mais ne sont spécifiées nulle part. Elles sont
listées ici pour qu'un agent sache qu'il improvise s'il y touche.

| Liaison | État |
|---|---|
| `talos/radar-mcp` → `radar` | Code présent, client de test présent, **protocole non écrit** |
| `hermes-cockpit` → `radar` et `danmem` | Le cockpit lit leur santé — **format des sondes non écrit** |
| `danmem` ↔ `galahad/engine/src/memory.js` | Deux couches mémoire, **articulation non établie** |
| `la-barre` → `radar` | **Aucun lien.** La Barre décide, Radar journalise — la mesure avant/après en dépend |

La dernière est la plus coûteuse : sans elle, le sixième critère de gouvernance du
portefeuille — la méthode de preuve — n'est pas tenable pour le Transformation Pilot.
