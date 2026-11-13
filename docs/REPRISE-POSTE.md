# Reprise depuis le poste du propriétaire

À ouvrir dans une session Claude Code lancée **sur un poste qui a les droits** :
SSH sur le VPS (`powerupgraders.com`), droits d'administration sur les dépôts
`xtincell/*`, compte administrateur Coolify. Une session dans le cloud n'a aucun
de ces trois accès : c'est pourquoi ces gestes sont regroupés ici.

État au 12 novembre 2026, 17 h 30 UTC, **mis à jour le 13 novembre, 1 h 15 UTC**
après une première reprise depuis le poste. Plan détaillé : [`PLAN-ACHEVEMENT.md`](PLAN-ACHEVEMENT.md).
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
`/opt/danmem-avant-20261113T0045Z`. Restent : l'unité durcie du dépôt (utilisateur
dédié) et une sauvegarde hors de l'hôte.

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

### galahad : moteur 0.1.18, jamais installé sur l'hôte

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
  P1 comme condition de maintien. Elle vaut dès que le propriétaire fusionne la
  PR qui la porte.
- **Le 26 novembre** : budgets SLO de `GENERATE_RECOMMENDATIONS`,
  `INVOKE_GLORY_TOOL` et `LEGACY_GLORY_EXECUTE_SEQUENCE`, d'après les relevés de
  la tâche `slo-check` (rappel déjà planifié).
