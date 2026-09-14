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
| `briefs` | `id` | Le projet. Clé métier : `ndeg`. |
| `clients` · `client_markets` · `client_contacts` | `id` | Référentiel client. `data` en JSONB. |
| `task_events` | `id` | **Le journal.** Chaque changement d'état y laisse une trace horodatée. |
| `comments` | `id` | Fil par `ndeg`. |
| `brief_assets` | `id` | Visuels. Écriture REST interdite — passer par `/visuels`. |
| `app_config` | `key` | Configuration. |

Filtres supportés : `eq` `neq` `gte` `lte` `is` `in` `cs`, plus `select` / `order` / `limit`.

**Le journal est le contrat qui compte.** `task_events` est ce qui rend la mesure
avant/après possible sans déclaratif : `at`, `ndeg`, `statut_old`, `statut_new`, `resp_old`,
`resp_new`, `kind`, `summary`. Toute intégration qui modifie un brief **doit** écrire son
événement, sinon la preuve se perd.

### Flux sortants

- `GET /feed.xml` — RSS 2.0
- `GET /activity.json` — JSON Feed 1.1

Alimentés automatiquement par `task_events`. C'est par là qu'un système externe observe
Radar sans l'interroger.

### Entrée libre

`POST /ingest` — texte brut → LLM local (Ollama) → tâches structurées. Tout entre en
`statut = Reçu` et `brief_etat = déduit`. **Repli sans perte si Ollama est injoignable** :
le texte est conservé, la structuration est différée.

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
