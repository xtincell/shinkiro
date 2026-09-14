# Contrats d'interface

**Ces contrats sont déduits du code, pas déclarés par leurs auteurs.** Ils sont donnés pour
qu'un agent puisse travailler ; chacun est à confirmer avant d'être traité comme une
spécification.

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

`talos/radar-mcp/` expose Radar au rôle Guardian via MCP. **Le protocole exact n'est pas
documenté** : à lire dans le code avant toute modification, et à figer dans ce document
ensuite.

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
