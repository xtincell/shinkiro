# Topologie de déploiement

Le relevé initial du 14 septembre 2026 est complété par les réceptions datées.
Une arborescence, une installation réellement servie et un parcours reçu sont
trois preuves distinctes.

## Correction du 10 novembre — pas de Vercel

Le propriétaire le confirme : **Vercel n'est pas utilisé, tout est servi par le
VPS.** Le mode « Vercel » du relevé initial est donc une supposition tirée des
fichiers, pas un déploiement.

- `ADVE-project` est livré par Coolify. Le `vercel.json` de son arbre est un
  reliquat.
- `Argos-studio` n'est déployé nulle part. Son dépôt ne porte ni Dockerfile ni
  compose : il lui manque l'artefact qui permettrait de le servir depuis le VPS.
  `fleet.yml` le déclare désormais `coolify`, avec son état : non déployé.
- [`SHK-0002`](adr/SHK-0002-argos-unifie-et-autonome.md) écrit qu'Argos « se
  déploie seul sur Vercel ». La décision d'autonomie tient ; la plateforme
  nommée ne tient plus, et l'ADR reste à amender.

Il reste quatre modes en service, et non cinq.

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
| **Coolify** *(le VPS)* | `galahad`, `hermes-cockpit`, `la-barre` | compose piloté par Coolify, labels Traefik, TLS par FQDN, réseau `coolify` externe ; `la-barre` depuis son Dockerfile, sous `powerupgraders.com/la-barre`, derrière la session de La Fusée |
| **systemd** *(l'hôte)* | `talos`, `hulysse`, `danmem`, `galahad` (pare-feu docker) | unités des rôles ; `danmem.service` observé sur l'hôte ; `deploy/systemd/galahad-docker-firewall.service` |
| ~~Vercel~~ *(non utilisé — voir la correction du 10 novembre)* | `ADVE-project`, `Argos-studio` | `next.config.ts`, `vercel.json`, Prisma |
| **Docker autonome** | `radar`, `galahad-landing` | Dockerfile sans orchestration imposée |
| **Statique / Pages** | `indice-maturite`, `la-barre` (hors production), `charadesign-generator`, `generateur-approches`, `character-engine`, `la-fusee-blueprint`, front `datacollector` | `index.html` ouvrable, ou Pages |

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

`galahad/cockpit/index.html` et le dépôt `hermes-cockpit`. Le relevé du
10 novembre 2026 les a lus tous les deux : ils se recouvrent très peu.

| Capacité | `galahad/cockpit` | `hermes-cockpit` |
|---|---|---|
| Charge, mémoire, disque et modèle d'un rôle | oui | non |
| Présence des agents | partiel : les services compose de l'installation | oui : tout l'hôte, par le socket Docker et `/proc` |
| Procédures : catalogue, lancement, reprise, abandon, verdict humain, reçus | **lui seul** | non |
| Construction de l'image, écriture du `.env`, déploiement compose | **lui seul** | non |
| Modèle d'un agent | lecture | lecture, et demande de changement pour `talos` et `hulysse` |
| Projets et domaines Coolify, registre des projets | non | **lui seul** |
| Tâches, notes, calendrier, coffre, alerte de repli | non | **lui seul** |
| Mémoire Danmem | non | **lui seul**, par fichier |
| Espace de travail partagé | non | **lui seul** |
| Portail client de l'employeur | non | **lui seul** |
| Santé de Radar | non | non |
| Exposition | boucle locale, sans compte, une installation | Traefik et TLS, authentification Basic, l'hôte entier |

Deux recouvrements seulement : la présence des agents, par deux mécanismes, et la
lecture du modèle.

**Le partage, confirmé le 11 novembre 2026 (arbitrage 5.2)** : `galahad/cockpit`
est le poste d'exécution d'une installation ; `hermes-cockpit` est le poste
d'observation et d'exploitation de l'hôte. Le signal `frontiere-cockpits` le
défend dans le code : le premier ne touche ni au socket Docker, ni à Coolify, ni à
`/proc` de l'hôte ; le second ne lance ni procédure `/operate`, ni construction
d'image, ni déploiement compose.

Trois défauts entretiennent encore la confusion :

- les deux pages portent presque le même titre, « Galahad · Cockpit » et
  « Galahad — Cockpit » ;
- le second affiche le Guardian en ligne dès qu'un processus de l'hôte exécute
  `src/index.js`, ce que fait aussi `hulysse` (`hermes-cockpit` `portal.mjs:90`) ;
- les exemples de routage de `galahad` décrivent un cockpit statique, alors qu'il
  dépend de `/status` et `/operate`, et que son serveur refuse tout hôte non local.

Le relevé initial disait que `hermes-cockpit` « lit la santé de `radar` et
`danmem` ». C'était inexact : il ne lit rien de Radar, et lit Danmem par un
fichier. Voir [`INTERFACES.md`](INTERFACES.md).

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

État au 12 novembre 2026. Les cinq points sont écrits. Le partage cockpit et la
jointure des taxonomies sont tranchés et défendus par un signal ; le câblage est
tranché (Radar lit La Barre), sa mesure attend l'arbitrage 5.6.

1. **Le contrat MCP `talos ↔ radar`.** Écrit dans [`INTERFACES.md`](INTERFACES.md).
   Neuf écarts de sens avec Radar restent à fermer.
2. **Le partage cockpit.** Qui affiche quoi est écrit plus haut. Le partage est
   confirmé depuis le 11 novembre (arbitrage 5.2), et défendu par le signal
   `frontiere-cockpits`.
3. **Les couches mémoire.** Qui écrit quoi, et les dix manques avant une
   restauration recevable, sont dans [`INTERFACES.md`](INTERFACES.md). La
   restauration elle-même reste à recevoir.
4. **La jointure des deux taxonomies d'écart** est faite depuis le 11 novembre
   ([SHK-0004](adr/SHK-0004-jointure-des-taxonomies-ecart.md), option C) : un
   même vocabulaire de types, plusieurs types par couple projet × marché, et le
   format `ecarts-marche` v1 lu et écrit par la méthode et par La Barre. Le signal
   `ecart-types-alignes` défend l'alignement. Reste à faire juger les adaptations
   contre leur écart déclaré.
5. **Le câblage `la-barre` → `radar`.** La Barre produit les décisions, Radar
   tient le journal. La mesure avant/après du Transformation Pilot en dépend.
   Aujourd'hui, dans la flotte, aucune décision ne circule, dans aucun sens, et
   le dépôt `radar` ne contient aucune admission La Barre. L'admission décrite
   dans [`INTERFACES.md`](INTERFACES.md) vit dans l'installation de l'employeur,
   hors flotte. Les trois sens de flux sont posés dans
   [SHK-0005](adr/SHK-0005-cablage-la-barre-radar.md). Le 11 novembre,
   l'arbitrage 5.5 a retenu le sens 1 : Radar lit La Barre. La mesure
   avant/après attend l'arbitrage 5.6.
