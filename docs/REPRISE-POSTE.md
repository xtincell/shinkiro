# Reprise depuis le poste du propriétaire

À ouvrir dans une session Claude Code lancée **sur un poste qui a les droits** :
SSH sur le VPS (`powerupgraders.com`), droits d'administration sur les dépôts
`xtincell/*`, compte administrateur Coolify. Une session dans le cloud n'a aucun
de ces trois accès : c'est pourquoi ces gestes sont regroupés ici.

**Depuis le 17 novembre, 23 h 21 UTC, le SSH ne répond plus sur l'adresse
publique** (ligne 0.97) : il faut le tunnel WireGuard du poste activé, et viser
`192.168.177.1` (alias `vps` du poste).

État au 12 novembre 2026, 17 h 30 UTC, **mis à jour le 13 novembre, 1 h 15 UTC**
après une première reprise depuis le poste, puis le 16 novembre (décisions,
ordre de la suite, sobriété des agents et réseau privé le soir) et le 17
(SSH public fermé). Plan détaillé : [`PLAN-ACHEVEMENT.md`](PLAN-ACHEVEMENT.md).
Inventaire : [`INVENTAIRE-POINTS-OUVERTS.md`](INVENTAIRE-POINTS-OUVERTS.md).

## Fait le 13 novembre depuis le poste

Reçus en lignes 0.86 à 0.89 du plan.

| Geste | État |
|---|---|
| 2. `GALAHAD_DEPLOY_KEY`, danmem#6 | **Fait** : danmem#6 fusionnée, 41/41 en CI |
| 3. Archiver `talos` et `hulysse` | **Fait** |
| 4. danmem en service | **Fait**, par une autre voie que celle écrite plus bas : voir la section 4 |
| 4. galahad 0.1.18 | **Pas un redéploiement** : le moteur n'a jamais été installé sur l'hôte (section 4) |
| 5. CK4 et port 7681 | **Faits** : écrivains versés dans `hermes-cockpit/ops/hote/` et posés (hermes-cockpit#8), port fermé de l'extérieur |
| 1, `FLEET_TOKEN` (section 2), 6, 7, 8 | **Restent** au propriétaire, ou attendent un de ses gestes |

## Suite décidée le 16 novembre

Relevé du jour : rien n'a bougé depuis le 13. Le propriétaire a tranché (ligne
0.90 du plan) et fixé l'ordre de ce qui reste. Chaque étape se clôt par un reçu.

1. **Sauvegardes hors de l'hôte**, avant toute bascule : Danmem, Radar agence et
   perso, La Fusée et son stockage privé, chiffrés puis envoyés vers le Google
   Drive déjà raccordé à l'hôte ; une restauration réelle depuis ce Drive vaut
   réception (DM2, RA5, F11, F12). **Fait le 16 novembre** (ligne 0.91) : huit
   éléments envoyés, huit reçus, cron chaque nuit à 3 h 15 UTC. Mise en place,
   réception et restauration : `hermes-cockpit/ops/sauvegarde/README.md`.
2. **Danmem durci** : l'unité du dépôt, sous un utilisateur dédié (DM2, 4.5).
   **Fait le 16 novembre** (ligne 0.92), après répétition sur une copie. Le
   modèle du worker avait été retiré par le fournisseur, et les deux comptes
   étaient sans crédit : le cerveau de Danmem passe désormais par le relais
   OAuth local de talos et hulysse (`dan-oauth`, port 8646), et le worker
   produit de nouveau ses cartes.
3. **Moteur `galahad` 0.1.18 épinglé sous systemd** pour `talos.service` et
   `hulysse.service`, après réception sur une copie de leur état (G1, TA3, HU2) ;
   recette native dans Telegram avec le propriétaire (G2). **Réception sur
   copie faite le 16 novembre** (ligne 0.93) : canon posé dans
   `/opt/galahad-engine-0.1.18/`, 23 contrôles sur 23 pour chaque agent.
   **Bascule faite le même jour** (ligne 0.94), hulysse à 16 h 50 UTC puis
   talos à 17 h 21. Reste la recette native complète dans Telegram : `/status`,
   l'Agora, et talos.
4. **Cockpit** : point d'accès stable de `portal-api.service`, parcours
   authentifié, fraîcheur des sources (CK1 à CK3). **Fait le 16 novembre**
   (ligne 0.95) : CK1 fermé par un relais nommé ; CK2 et CK3 reçus par l'API.
   Restent le parcours dans un navigateur, l'identité réelle des agents,
   l'isolation et les coûts.
5. **Argos** : la section 6 ci-dessous, inchangée. La projection ne se lance que
   depuis la console de La Fusée : aucun outil de son connecteur ne la porte.
   Ne pas poser `ARGOS_STUDIO_URL` avant elle, la page publique lirait un
   studio vide.
6. **Tri du reste de l'inventaire** `[prod]` et `[secret]` : un reçu, ou une
   décision datée qui sort le point du programme. **Fait le 16 novembre** :
   tableau en fin d'inventaire. Six fermés, neuf en partie, six sortis,
   dix-sept qui attendent un geste, une clé, un hôte ou un usage.
7. **Le 26 novembre** : budgets SLO (section 8).
8. **En dernier, les clés** : la section 1 ci-dessous, les rotations, puis
   `FLEET_TOKEN` (section 2). Le contrôle hebdomadaire reste rouge jusque-là.
   La carte « quelle clé vit dans quel fichier, quoi relancer » est remise au
   propriétaire hors de ce dépôt.

Ce qui reste après le 16 novembre, et qu'aucune session ne peut faire seule :
la recette native dans Telegram (`/status`, l'Agora, talos), la projection
Argos dans la console, les clés (étape 8), et, le 26 novembre, les budgets SLO.

**Soir du 16 novembre, hors plan, sur demande du propriétaire** (ligne 0.96) :
un seul gardien de l'hôte (talos), hulysse sans contrôles et à la demande,
moteur 0.1.19, FABLE à la demande, écrivains du cockpit déclenchés par
changement de fichier, livraison du soir en plusieurs messages. Un réseau
privé WireGuard est monté (`wg0`, `192.168.177.1`, UDP 51820) et le port 22 y
est admis. **Le SSH public est fermé depuis le 17 novembre, 23 h 21 UTC**
(ligne 0.97), après preuve du tunnel depuis le poste : le port 22 ne répond
plus qu'à `wg0` et à `10.0.0.0/8`, dont Coolify a besoin. Le rouvrir, par le
tunnel : `ufw allow OpenSSH`. Seul le poste a son tunnel activé ; le
téléphone et l'appareil de secours restent à activer par le propriétaire. Un
second appareil de travail a son propre pair (`vps-appareil2`,
`192.168.177.5`) et une clé d'enrôlement à usage unique, valable jusqu'au
25 novembre : il installe sa clé SSH par `/usr/local/sbin/enroler-cle-ssh`
(ligne 0.98) ; un appareil de plus se prépare de la même façon. Sur le poste,
la connexion distante de Claude Code vise `root@192.168.177.1`. Si le
tunnel du poste tombe : un autre appareil du tunnel, le terminal de serveur de
l'interface Coolify (non essayé), puis le mode de récupération du hPanel ; le
terminal du navigateur du hPanel passe par le port 22 et ne compte plus.
Deux décisions reviennent au propriétaire : les ports 6001 et 6002 de
Coolify, ouverts à tous ; la clé `claude-spawt`, mise en commentaire avec deux
autres lignes de `authorized_keys`. La pile Honcho, elle, **ne doit pas être
arrêtée** : son API ne sert plus, mais son Ollama calcule les vecteurs de
`danmem` et de La Fusée (ligne 0.99) ; il faudrait d'abord leur donner un
autre modèle.

**18 novembre, `danmem`** (ligne 0.99) : un quart des souvenirs n'avait pas de
vecteur, la première écriture après chaque silence perdant le sien. Le worker
les rattrape désormais et le modèle reste chargé (`EMBED_KEEP_ALIVE=24h`
dans `/etc/danmem/danmem.env`). Le worker de cet hôte passe toutes les
trente minutes : `WORKER_EMBED_BATCH=30` y règle trente vecteurs par passage. À suivre :
`unembedded` dans `/health` doit tomber à zéro, puis y rester.

## Ce qui est déjà fait

- Tous les points `[commit]` sont fermés. DM4 et CK4 l'ont été le 13 novembre
  (gestes 2 et 5 ci-dessous).
- Le VPS sert :
  - La Fusée 6.27.587, avec la tâche planifiée `slo-check` toutes les 6 h ;
  - La Barre `ce6abe7` et sa vitrine ;
  - Radar perso et agence `3a3e532` ;
  - le cockpit `23def21`, Argos-studio, `galahad-landing` et le portail Shinkiro.
- Aucun arbitrage n'est en attente dans le plan.
- Un rappel est planifié le 26 novembre pour proposer les budgets SLO.

## Règles pour la session qui reprend

- Ne jamais écrire un secret dans un fichier versionné, un message de commit ou une PR.
- Sauvegarder avant toute migration de base.
- Après chaque geste, consigner le reçu (date, commande, résultat) dans
  `PLAN-ACHEVEMENT.md`, une ligne `0.8x`, puis `node scripts/signaux-flotte.mjs`
  (doit afficher `COHÉRENT`), puis une PR fusionnée.
- Ne jamais redéployer l'application Coolify `rfkgtj7us50jlbaiz1tjke2a`, arrêtée
  volontairement : c'est le retour arrière de La Fusée. La production est
  `q9b4m57yh93gxbjykj470giy`.

## 1. Révoquer les accès transmis le 12 novembre (urgent)

1. Coolify → Keys & Tokens : révoquer le token API utilisé par la session cloud.
   Relevé le 13 novembre : c'est le n° 24, `FableAcces`, sans aucun consommateur
   sur l'hôte. **Ne pas révoquer le n° 8 (`claude-deploy`)** : le cockpit,
   `refresh-core.sh` et le coffre de l'hôte s'en servent. Inutile d'en créer un
   nouveau pour l'hôte. Les n° 3 (`hermes`), 7 (`claude-deploy`) et 12 (`talos`)
   ne servent plus depuis juillet.
2. GitHub → Settings → Developer settings → Personal access tokens : révoquer le
   jeton transmis dans la conversation.

## 2. Secrets GitHub

| Secret | Dépôt | Contenu | Débloque |
|---|---|---|---|
| `FLEET_TOKEN` | `xtincell/shinkiro` | jeton fin, lecture de tous les dépôts `xtincell/*`, écriture *Contents* et *Pull requests* sur `shinkiro` | contrôle hebdomadaire vert (P1), PR du verrou rafraîchi (1.8) |
| `GALAHAD_DEPLOY_KEY` | `xtincell/danmem` | clé privée d'une clé de déploiement en lecture ajoutée à `xtincell/galahad` | DM4 : fusionner danmem#6 |

`GALAHAD_DEPLOY_KEY` est posé et danmem#6 fusionnée depuis le 13 novembre. Reste
`FLEET_TOKEN` : le secret existe, mais GitHub le refuse (401). Créer un jeton fin
(propriétaire `xtincell`, tous les dépôts, `Contents` et `Metadata` en lecture,
`Pull requests` en lecture et écriture), puis le coller **à l'invite** de
`gh secret set FLEET_TOKEN -R xtincell/shinkiro`, jamais dans une conversation.
Ensuite, `gh workflow run fleet-drift.yml -R xtincell/shinkiro`.

Commandes d'origine, pour mémoire :

```bash
ssh-keygen -t ed25519 -N '' -C danmem-ci -f /tmp/galahad_deploy
gh repo deploy-key add /tmp/galahad_deploy.pub -R xtincell/galahad -t danmem-ci
gh secret set GALAHAD_DEPLOY_KEY -R xtincell/danmem < /tmp/galahad_deploy
shred -u /tmp/galahad_deploy /tmp/galahad_deploy.pub
gh secret set FLEET_TOKEN -R xtincell/shinkiro    # coller le jeton à l'invite
gh pr checks 6 -R xtincell/danmem --watch && gh pr merge 6 -R xtincell/danmem --merge
gh workflow run fleet-drift.yml -R xtincell/shinkiro
```

## 3. Archiver `talos` et `hulysse` (arbitrage 5.3)

```bash
gh repo archive xtincell/talos --yes
gh repo archive xtincell/hulysse --yes
```

## 4. Sur le VPS : danmem et galahad (palier P3)

### danmem : fait le 13 novembre, par une autre voie

L'hôte ne correspondait pas à la procédure ci-dessous, tirée du README :
`/opt/danmem` était la lignée locale d'origine (`82b4182`), sans remote ni `sql/`,
et l'unité tourne en root, sans utilisateur `danmem`. Ce qui a été fait (ligne
0.87 du plan) :

1. `postgresql-client-16` installé sur l'hôte ; clé de déploiement en lecture
   pour `xtincell/danmem`, alias SSH `github-danmem` dans `/root/.ssh/config`.
2. `main` cloné dans `/opt/danmem-next`, `npm ci --ignore-scripts`.
3. `npm run sauvegarder -- --unite danmem.service`, paquet sous `/root/sauvegardes/`.
4. Réception sur une copie restaurée, dans un conteneur jetable de la même image :
   24 contrôles sur 24, script `/root/reception-danmem/recevoir-danmem.sh`.
5. Bascule : arrêt, sauvegarde à froid, `node scripts/migrate.mjs`, échange des
   dossiers, démarrage. 5 s d'arrêt.

`/opt/danmem` est désormais un clone de `main`. Mise à jour suivante : sauvegarde,
`git pull --ff-only`, `npm ci --ignore-scripts`, `node scripts/migrate.mjs` avec
l'environnement du service, redémarrage. Retour arrière de cette bascule :
`/opt/danmem-avant-20261113T0045Z`. La sauvegarde hors de l'hôte est en place
depuis le 16 novembre (ligne 0.91), et l'unité durcie du dépôt sert sous
l'utilisateur `danmem` depuis le même jour (ligne 0.92). L'unité servie ne
diffère de `deploy/danmem.service` que par `After=docker.service`.

Procédure d'origine, qui ne s'appliquait pas telle quelle :

Le service refuse de fonctionner sans elles (`/health` en 503
`schema: incomplet`). Elles sont additives et rejouables.

```bash
ssh <vps>
systemctl cat danmem.service          # relire l'unité servie avant tout
sudo -u danmem bash -lc 'cd /opt/danmem && git fetch && git log --oneline -1 origin/main'
# Sauvegarde d'abord, depuis un poste qui a pg_dump de la même version majeure :
DATABASE_URL=… npm run sauvegarder -- --destination <dossier-neuf> --unite danmem.service
cd /opt/danmem && sudo -u danmem git pull --ff-only && sudo -u danmem npm ci --ignore-scripts
sudo systemd-run --uid=danmem --wait --pipe -p WorkingDirectory=/opt/danmem \
  -p EnvironmentFile=/etc/danmem/danmem.env /usr/bin/node scripts/migrate.mjs
sudo systemctl restart danmem && curl -s localhost:8790/health
```

Reçu attendu :
- trois lignes `Danmem: schema 00N-… received` ;
- `/health` en 200, avec le schéma complet.

Chemins et noms d'unité à confirmer avec `systemctl cat` : ils viennent du README,
pas de l'hôte.

### galahad : moteur 0.1.19, en service depuis le 16 novembre

Hulysse puis talos tournent sur le canon, épinglé dans
`/opt/galahad-engine-0.1.19/` depuis 19 h 32 UTC (ligne 0.96), après quelques
heures sur `/opt/galahad-engine-0.1.18/` (lignes 0.93 et 0.94), gardé comme
retour arrière. Seul le dossier de travail des deux unités change, par
`/etc/systemd/system/<agent>.service.d/10-canon.conf` ; le retirer suffit à
revenir au code d'avant le canon. Talos est le seul gardien de l'hôte :
`/etc/hulysse/hulysse.env` porte `GALAHAD_PATROL_CHECKS=off`. Passer à une
version suivante : poser un nouveau dossier versionné, rejouer
`/root/reception-galahad/recevoir-moteur.sh` sur une copie de l'état (variable
`CANON`, et `SANS_CONTROLES=1` pour hulysse), puis
`/root/reception-galahad/changer-version-moteur.sh <agent> <version>`, qui
remet l'ancien chemin si le moteur ne tient pas vingt secondes. L'outil d'état du
canon ne s'applique pas à ces dossiers (liens vers `/opt/dan/core`) : leur
sauvegarde passe par `/opt/sauvegarde-hors-hote/`. Le relevé du 13 novembre, plus
bas, décrit l'état d'avant.

Relevé le 13 novembre (ligne 0.89) : `/opt/galahad` n'est pas un dépôt et ne
porte que des scripts (`bin/`, `bureau/`, `patrol/`, `recall/`). Aucun conteneur ni
projet compose du moteur ne tourne. Six des sept scripts communs avec
`galahad/deploy/` diffèrent du dépôt, et quatre n'y sont pas. Les commandes
ci-dessous ne s'appliquent donc pas. Installer le moteur est une installation
neuve (points G1 et G2) : trois bots Telegram, un `.env` privé, puis la bascule de
`talos.service` et `hulysse.service`. À décider avant de la faire.

La patrouille est conforme : les lignes de `/etc/cron.d/galahad-patrol` portent
`root`.

Commandes d'origine :

```bash
cd /opt/galahad            # ou le dossier réel, à confirmer
git fetch && git log --oneline -1 origin/main     # attendu : a0e8426 ou plus récent
git pull --ff-only
docker compose up -d       # + --profile bridge si le pont est utilisé
docker compose ps
```

Vérifier aussi la patrouille : `cat /etc/cron.d/galahad-patrol` doit porter
l'utilisateur `root` (voir `deploy/patrol/README.md`).

## 5. Sur le VPS : relectures (CK4, port 7681)

**Faites le 13 novembre** (lignes 0.88 et 0.89). Les sept fichiers ont la forme
exigée et sont frais. Leurs écrivains écrivaient sur place et sans verrou : ils sont
versés dans `hermes-cockpit/ops/hote/` et posés par `ops/hote/installer.sh`
(hermes-cockpit#8). Port 7681 refusé depuis l'extérieur.

- **CK4** : comparer les fichiers réellement écrits par l'hôte avec le contrat
  `hermes-cockpit/docs/SONDES.md`. Les fichiers se trouvent sous
  `/home/hermes-agent/hermes-config/data/` vu de l'hôte, ou `/data` dans le
  conteneur. Les relire tous :
  - `projets.json` ;
  - `agent-status/fallback.json` ;
  - `dan-refresh.json` ;
  - `vault-index.json` ;
  - `agent-brains-status.json` ;
  - `danmem-status.json` ;
  - `agent-brains.json`.

  Pour chacun, noter la forme, la fraîcheur et l'écrivain. Vérifier aussi que les
  écrivains de l'hôte suivent le verrou `<fichier>.lock`. Verser le script
  `agent-brains.json` → `cerveau.txt` dans un dépôt (3.8).
- **Port 7681** (terminal web lié au cockpit) : depuis un réseau extérieur au VPS,
  `nc -vz powerupgraders.com 7681`. Le résultat attendu est « refused » ou un délai
  dépassé ; sinon, fermer le port au pare-feu.

## 6. Argos-studio

1. Dans la console de La Fusée, lancer la projection des 13 dossiers vers le studio.
2. Poser la variable `ARGOS_STUDIO_URL` sur l'application de production
   `q9b4m57yh93gxbjykj470giy`, puis la redémarrer : une variable n'est lue qu'au
   démarrage. Une session sur le poste peut le faire, une fois l'étape 1 faite,
   avec le jeton Coolify du coffre de l'hôte. Le studio est servi sur
   `https://argos.76-13-128-23.sslip.io`.

## 7. Autres gestes du propriétaire

- Révoquer chez son fournisseur la clé écrite en dur dans BrandForge.
- Relire la normalisation ADVE, à partir de l'inventaire des 2 691 chemins
  (`npm run audit:adve-shapes` dans `ADVE-project` ; sortie à garder hors dépôt).
- Saisir dans Radar agence les correspondances projet ↔ dossier.
- Décider s'il faut réécrire l'historique git de `galahad`.

## 8. Ce qui ne se fait qu'en écrivant

- **Définition d'« achevé » (point 3.7)** : l'écrire, même brièvement, dans
  `PLAN-ACHEVEMENT.md`, section 1. Proposition de départ :
  - P2 fermé ;
  - P3 avec un reçu daté pour chaque point `[prod]` et `[secret]` ;
  - P4 constaté : un pilote réel, sa mesure avant/après et une facture.

  **Écrite le 13 novembre** en section 1 du plan (« Définition retenue »), avec
  P1 comme condition de maintien. **Validée telle quelle par le propriétaire le
  16 novembre** (ligne 0.90).
- **Le 26 novembre** : budgets SLO de `GENERATE_RECOMMENDATIONS`,
  `INVOKE_GLORY_TOOL` et `LEGACY_GLORY_EXECUTE_SEQUENCE`, d'après les relevés de
  la tâche `slo-check` (rappel déjà planifié).
