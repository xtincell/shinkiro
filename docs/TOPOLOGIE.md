# Topologie de déploiement

Le relevé initial du 14 septembre 2026 est complété par les réceptions datées.
Une arborescence, une installation réellement servie et un parcours reçu sont
trois preuves distinctes.

## Correction du 7 octobre — Galahad et Danmem

Danmem est un service HTTP Node sous systemd avec PostgreSQL/pgvector. Il ne
partage pas l'image des rôles Galahad. Sa file `/jobs` existait sur le VPS mais
pas dans Git ; sa source et son schéma sont désormais repris dans le canon.
Les corrections reçues sur copies ne sont pas déployées au service actif.

`galahad/engine/src/memory.js` conserve les cartes et l'index de continuité d'un
rôle. Danmem conserve les observations partagées et leurs dérivations. L'outbox
locale Galahad conserve un résultat non acquitté ; Danmem reste propriétaire du
statut du travail. Ces stockages ont des responsabilités distinctes. Leur
présence ne reçoit pas l'isolation d'entreprise ni une restauration complète.
Voir [la réception croisée](RECEPTION-GALAHAD-DANMEM.md).

Les tableaux de modes ci-dessous décrivent le relevé initial, complété pour
DataCollector. Ils ne remplacent pas les reçus de livraison : La Fusée est
aujourd'hui livrée par Coolify, et Danmem fonctionne sous systemd.

## Le principe, et son arbitrage

> *Tout ou presque devrait pouvoir être déployé de manière autonome **et** dans
> la suite Shinkiro.*

La flotte réunit services, outils et méthodes. Leur autonomie s'éprouve pour
chaque installation ; elle ne se déduit pas d'un README ou d'un Dockerfile.

| Composant | Nature et autonomie |
|---|---|
| `market-expansion-system` | C'est une **méthode**, pas un service. Elle se lit, se remplit, s'importe dans Radar. Lui donner un conteneur n'aurait aucun sens. |
| `danmem` | L'exception initiale était fausse : service HTTP distinct, avec sa base. Son installation et sa restauration restent à recevoir. |

**En revanche, une suite qui monterait d'un seul `docker compose up` serait une
fiction.** La flotte tourne réellement en cinq modes, et les forcer en un seul
casserait ce qui fonctionne. La composition existe — elle passe par Coolify, pas
par un compose racine.

## Les cinq modes, et qui tourne dans chacun

| Mode | Composants | Artefact constaté |
|---|---|---|
| **Coolify** *(le VPS)* | `galahad`, `hermes-cockpit` | compose piloté par Coolify, labels Traefik, TLS par FQDN, réseau `coolify` externe |
| **systemd** *(l'hôte)* | `talos`, `hulysse`, `danmem`, `galahad` (pare-feu docker) | unités des rôles ; `danmem.service` observé sur l'hôte ; `deploy/systemd/galahad-docker-firewall.service` |
| **Vercel** | `ADVE-project`, `Argos-studio` | `next.config.ts`, `vercel.json`, Prisma |
| **Docker autonome** | `radar`, `galahad-landing` | Dockerfile sans orchestration imposée |
| **Statique / Pages** | `indice-maturite`, `la-barre`, `charadesign-generator`, `generateur-approches`, `character-engine`, `la-fusee-blueprint`, front `datacollector` | `index.html` ouvrable, ou Pages |

DataCollector ne possède pas de Dockerfile. Son front HTML appelle un serveur
Flask distinct (`server.py`, dépendances Python) ; ouvrir le HTML ne reçoit pas
la collecte. La CLI et l'API partagent désormais le reçu et la sauvegarde, sans
appel agentique. Le serveur de développement reste en boucle locale, sans debug.
Son déploiement de service TPE et son admission métier restent à recevoir.

### LSI-CD : front statique et fournisseurs distincts

Le build Vite produit le front ; le proxy fournisseur constaté est un plugin
du serveur de développement. Un build réussi ne reçoit pas les routes API en
production. La correction de sauvegarde de la PR #2 est intégrée au canon,
mais aucune livraison de service ni recette native n'est reçue pour l'atelier.
Voir [la réception des spécialistes](RECEPTION-ATELIERS-SPECIALISES.md).

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

### 1 · Dépôts historiques et moteurs servis

**Réception du 7 octobre.** La mesure ci-dessous porte sur les dépôts de
septembre. Les services Talos et Hulysse présentent aujourd’hui quinze modules
identiques, dont onze correspondent au Galahad initial. Missions et Agora
constituent les ajouts servis. Les capacités donneuses des dépôts historiques
restent à recevoir avant convergence de déploiement. Voir
[la réception des rôles](RECEPTION-TALOS-HULYSSE.md).
La conclusion historique qui suit ne doit pas être appliquée au code servi.

#### Mesure Git de septembre

Cette section affirmait le contraire : *« le moteur existe en trois exemplaires …
c'est la dette structurelle n°1 »*. Personne ne l'avait mesurée — trois
répertoires portant les mêmes noms de fichiers avaient suffi à conclure, et un
plan de fusion par `git subtree` en avait découlé.

La mesure, reproductible par `scripts/mesure-divergence.mjs` :

| Paire | Fichiers partagés | Divergence |
|---|---|---|
| `talos` ↔ `hulysse` | 10 | **17 %** |
| `galahad` ↔ `talos` | 9 | 73 % |
| `galahad` ↔ `hulysse` | 9 | 71 % |

`talos` et `hulysse` sont bien le même moteur : `journal.js`, `ollama.js` et
`telegram.js` sont **identiques à l'octet**, `tools.js` ne diffère que par ses
commentaires. Ce qui les sépare est fonctionnel — `cron`, `heartbeat` et le pont
MCP chez l'un ; `goals` et `veille` chez l'autre.

`galahad` est autre chose. Aucun fichier identique à son homologue. Là où les
deux autres appellent `ollama.js`, il appelle `brain.js`, agnostique au
fournisseur. Il porte `roles.js`, `skill-runner.js`, `integrations.js` et
`jobs.js`, que ni l'un ni l'autre n'a. Son `agent-loop.js` fait 47 lignes contre
105 et 96 : une session roulante contre des fils persistés avec compaction.

Et la promesse citée à l'appui de l'ancienne section ne disait pas ce qu'on lui
faisait dire. *« Une seule image, trois rôles »* désigne **chef, guardian et
traveler** — trois personas de `galahad`, déjà livrés par `roles.js` en pure
configuration. Elle est tenue, et n'a jamais porté sur `talos` ni `hulysse`.

**La convergence porte donc sur `talos` et `hulysse`, et sur eux seuls.** Voir
[`SHK-0003`](adr/SHK-0003-deux-moteurs-pas-trois.md). Le signal
`divergence-perimee` refait la mesure dès que les deux dépôts sont clonés côte à
côte : un chiffre déclaré à plus de dix points du réel est une dérive.

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
   │ HTTP/PG│      │  Postgres   │    │  pid: host    │
   └────────┘      └──────┬──────┘    └──────────────┘
                          │
                   talos/radar-mcp  ── pont MCP, protocole non documenté
                          │
                   ┌──────▼──────┐
                   │  la-barre   │  consomme le journal (à câbler)
                   └─────────────┘
```

`radar`, Danmem et La Fusée ont des dépendances de persistance. Les endpoints
LLM et les sources de collecte restent d'autres dépendances à recevoir. Aucune
promesse d'installation ne peut les réduire à une seule dépendance commune.

## Ce qui reste à écrire

1. **Le contrat MCP `talos ↔ radar`.** `talos/radar-mcp/index.js` existe, le
   protocole n'est décrit nulle part.
2. **Le partage cockpit.** Qui affiche quoi, entre `galahad/cockpit` et
   `hermes-cockpit`.
3. **La réception des couches mémoire.** Leurs responsabilités sont décrites
   ci-dessus ; restauration, droits et reprise de tous les effets restent ouverts.
4. **La jointure des deux taxonomies d'écart**, et le branchement de
   `la-barre/vue-matrice` sur le Market Expansion System.
5. **Le câblage `la-barre` → `radar`.** La Barre produit les décisions, Radar
   tient le journal. La mesure avant/après du Transformation Pilot en dépend.
