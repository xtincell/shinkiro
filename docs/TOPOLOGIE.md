# Topologie de déploiement

Relevé exhaustif des arborescences au 14 septembre 2026. Chaque fait est
constaté dans un dépôt, aucun n'est supposé.

## Le principe, et son arbitrage

> *Tout ou presque devrait pouvoir être déployé de manière autonome **et** dans
> la suite Shinkiro.*

C'est juste, et c'est déjà presque vrai : **quinze composants sur dix-sept sont
déployables seuls**. Deux exceptions, et elles sont fondées :

| Composant | Pourquoi il ne se déploie pas seul |
|---|---|
| `market-expansion-system` | C'est une **méthode**, pas un service. Elle se lit, se remplit, s'importe dans Radar. Lui donner un conteneur n'aurait aucun sens. |
| `danmem` | C'est un **module** de `galahad`. Le déployer à part contredirait la conception « une image moteur, trois rôles ». |

**En revanche, une suite qui monterait d'un seul `docker compose up` serait une
fiction.** La flotte tourne réellement en cinq modes, et les forcer en un seul
casserait ce qui fonctionne. La composition existe — elle passe par Coolify, pas
par un compose racine.

## Les cinq modes, et qui tourne dans chacun

| Mode | Composants | Artefact constaté |
|---|---|---|
| **Coolify** *(le VPS)* | `galahad`, `hermes-cockpit` | compose piloté par Coolify, labels Traefik, TLS par FQDN, réseau `coolify` externe |
| **systemd** *(l'hôte)* | `talos`, `hulysse`, `galahad` (pare-feu docker) | `ops/*.service` + `ops/install.sh` ; `deploy/systemd/galahad-docker-firewall.service` |
| **Vercel** | `ADVE-project`, `Argos-studio` | `next.config.ts`, `vercel.json`, Prisma |
| **Docker autonome** | `radar`, `galahad-landing`, `datacollector` | Dockerfile sans orchestration imposée |
| **Statique / Pages** | `indice-maturite`, `la-barre`, `charadesign-generator`, `generateur-approches`, `character-engine`, `la-fusee-blueprint` | `index.html` ouvrable, ou Pages |

### Coolify est la plateforme, et ce n'est écrit nulle part ailleurs

Trois preuves concordantes dans le code :

- `hermes-cockpit/docker-compose.yaml` — *« déploiement Coolify, build-pack
  dockercompose »*, réseau `coolify` déclaré en externe.
- `galahad/deploy/patrol/prune-coolify-images.sh` — la patrouille **purge les
  images Coolify** sur l'hôte.
- `galahad/engine/skills/diagnostic-coolify.json` — une compétence d'agent
  dédiée au **diagnostic Coolify**.

Le routage est prêt pour les deux frontaux : `galahad/routing/` contient un
`Caddyfile.example` **et** un `traefik-dynamic.example.yml`.

## Le point d'entrée n'est pas toujours à la racine

Trois composants ont leur application dans un sous-dossier. Sans cette
information, un agent les croit non déployables — c'est le piège le plus bête de
la flotte.

| Composant | Racine réelle | Stack |
|---|---|---|
| `Argos-studio` | `app/` | Next, Prisma, Tailwind, Biome — plus `workers/` |
| `charadesign-generator` | `lsi-cd-app/` | Vite |
| `la-fusee-blueprint` | `views/` | `LA_FUSEE_PHILO_VIEW.html`, 52 Ko |

## Trois chevauchements structurels

Ils ne sont pas des bugs. Ce sont des décisions qui n'ont jamais été écrites, et
chacune coûtera cher à qui l'ignore.

### 1 · Le moteur existe en trois exemplaires

`galahad/engine/src/`, `talos/src/` et `hulysse/src/` portent les mêmes modules —
`agent-loop`, `config`, `hooks`, `journal`, `memory`, `telegram`, `tools`.

Or le README de `galahad` promet : *« une image moteur ; chaque conteneur est le
même code portant un rôle différent »*. La promesse et le dépôt divergent.

Spécificités par exemplaire — c'est ce qui devra être préservé à la fusion :

| | En plus |
|---|---|
| `galahad/engine` | `brain`, `goals`, `heartbeat`, `integrations`, `jobs`, `roles`, `skill-runner` |
| `talos` | `cron`, `mcp`, `ollama`, `soul`, plus `radar-mcp/` |
| `hulysse` | `goals` |

**C'est la dette structurelle n°1.** La fusion par `git subtree` doit conserver
les trois historiques.

### 2 · Deux cockpits

`galahad/cockpit/index.html` et le dépôt `hermes-cockpit`. Le second est déployé
sur Coolify, voit les process de l'hôte (`pid: host`, `SYS_PTRACE`), lit la santé
de `radar` et `danmem`, et sert un portail client.

Le premier n'est pas documenté. **Le partage de responsabilité n'est écrit nulle
part** — à trancher avant qu'un agent ne construise sur le mauvais.

### 3 · Deux taxonomies d'écart, complémentaires et non reliées

| Source | Classe | Valeurs |
|---|---|---|
| `market-expansion-system/METHODE.md` | **Ce qui change** selon le marché | langue · marque · produit/SKU · réglementaire |
| `la-barre/app/ecarts.js` | **Qui doit la reprise**, et si elle se facture | brief · plateforme · bigidea · agence · donneur |

La seconde est plus avancée que la première : chaque origine porte `qui` et
`facturable`. Les deux modèles se complètent — l'un dit *ce qui diffère*, l'autre
*qui paie*. Rien ne les relie aujourd'hui.

Et `la-barre/app/vue-matrice.js` **implémente déjà la matrice support × marché**,
en trois lectures — calendrier, mur, grille — avec mémoire du mode par dossier.
Le Market Expansion System documente une mécanique que La Barre exécute.

## Dépendances réelles

```
                     ┌──────────────┐
                     │   Telegram   │  canal opérateur
                     └──────┬───────┘
                            │
   ┌────────────────────────▼────────────────────────┐
   │  galahad  ·  chef · guardian · traveler         │   Coolify
   │  bridge Claude · sas-admin (jetons, ports)      │   + systemd
   │  patrol (cron) · engine/skills                  │
   └───┬──────────────────┬──────────────────┬───────┘
       │                  │                  │
   ┌───▼────┐      ┌──────▼──────┐    ┌──────▼───────┐
   │ danmem │      │    radar    │    │hermes-cockpit│
   │mémoire │      │ task_events │◀───│ santé + portail│
   │(module)│      │  Postgres   │    │  pid: host    │
   └────────┘      └──────┬──────┘    └──────────────┘
                          │
                   talos/radar-mcp  ── pont MCP, protocole non documenté
                          │
                   ┌──────▼──────┐
                   │  la-barre   │  consomme le journal (à câbler)
                   └─────────────┘
```

`radar` requiert **Postgres**. C'est la seule dépendance externe dure de la
flotte, avec les endpoints LLM compatibles OpenAI.

## Ce qui reste à écrire

1. **Le contrat MCP `talos ↔ radar`.** `talos/radar-mcp/index.js` existe, le
   protocole n'est décrit nulle part.
2. **Le partage cockpit.** Qui affiche quoi, entre `galahad/cockpit` et
   `hermes-cockpit`.
3. **Le rapport `danmem` ↔ `galahad/engine/src/memory.js`.** Deux couches
   mémoire, aucune articulation écrite.
4. **La jointure des deux taxonomies d'écart**, et le branchement de
   `la-barre/vue-matrice` sur le Market Expansion System.
5. **Le câblage `la-barre` → `radar`.** La Barre produit les décisions, Radar
   tient le journal. La mesure avant/après du Transformation Pilot en dépend.
