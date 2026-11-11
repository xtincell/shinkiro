# Installer le socle manuel d’une entreprise

Ce profil installe La Fusée et sa base PostgreSQL/pgvector à partir d’images
figées. Chaque installation reçoit ses secrets de session et de chiffrement,
sa base, ses réseaux et son volume d’originaux. Le fonctionnement ne demande
aucun fournisseur d’IA, OAuth, abonnement ou agent.

Il s’agit du **socle manuel**, pas encore du paquet complet de Shinkiro. Trois
composants s’y ajoutent sur le même modèle, chacun par une option du fichier
d’entreprise : La Barre (`barre`), Radar (`radar`) et la mémoire Danmem
(`danmem`). Chacun garde son stockage propre, dans des volumes de l’installation,
et entre dans la même sauvegarde. Argos-studio et les rôles d’agents de Galahad
n’y entrent pas ; la raison est écrite plus bas. Aucun exemple, corpus, compte
ou secret d’une entreprise existante n’est utilisé pour préparer une nouvelle
installation.

## Préparer et démarrer

Prérequis : Python 3.10 ou supérieur, Docker Engine 25 ou supérieur avec Compose
2.20.2 ou supérieur (sondes de démarrage distinctes), accès en lecture aux
deux images désignées dans `entreprise.py`. La réception du 19 octobre utilise un
hôte Linux amd64. Le script ne déploie pas de serveur Docker et n’achète rien.

Copier `entreprise.exemple.json`, puis renseigner le nom, un identifiant
d’installation unique, l’origine et le port local. Deux entreprises doivent
avoir des hôtes différents : les cookies ne sont pas isolés par numéro de port.
Pour une recette locale, utiliser `localhost` et `127.0.0.1`. Pour une entreprise,
prévoir son propre domaine HTTPS et le reverse proxy existant. Seul le port
loopback est publié ; aucune base n’est ouverte au réseau de l’hôte.

```sh
make instance ARGS='preparer installation/entreprise.exemple.json installation/instances/demo'
make instance ARGS='demarrer installation/instances/demo'
```

La préparation refuse de remplacer un dossier. Les secrets ne sont jamais
affichés, les fichiers privés ont les droits `600` dans un dossier `700`, et les
variables d’un autre déploiement ou fournisseur ne sont pas héritées. Le
démarrage refuse les ressources Docker portant le même nom mais une autre
identité d’installation. Les images sont tirées si elles ne sont pas présentes,
avec leurs digests immuables.

Les sondes HTTP tournent toutes les 60 secondes en régime stable et la sonde
PostgreSQL toutes les 30 secondes. Le démarrage conserve des contrôles rapides
pendant sa période initiale ; un échec HTTP, une absence de réponse ou un délai
dépassé ne reçoit pas la santé. La lecture des migrations reste obligatoire.

Après une réception, arrêter les installations de recette inutilisées : leur
accumulation sur un petit VPS consomme la capacité des services réels.

```sh
make instance ARGS='arreter installation/instances/demo'
```

Cette commande vérifie l’identité de l’installation avant son arrêt gracieux.
Elle conserve conteneurs, volumes, réseaux, images, clés et sauvegardes ;
`demarrer` reprend la même installation. Ne pas laisser plusieurs reprises de
recette tourner pour conserver une preuve : le reçu et les données arrêtées
assurent cette conservation. Cette commande vise uniquement l’installation
désignée, jamais un arrêt global du serveur.

Le serveur natif démarre même si une migration a échoué. La commande
`demarrer` ne considère donc pas un simple HTTP 200 comme une réception : elle
contrôle chaque migration et son checksum dans la base. Un échec reste visible.

## Rattacher le premier responsable

Le responsable crée son compte par le formulaire d’inscription existant de
**sa** Fusée. Il conserve la maîtrise du mot de passe et des conditions affichées.
Le provisionnement rattache ensuite ce compte précisément désigné :

```sh
make instance ARGS='provisionner installation/instances/demo --compte-inscrit responsable@entreprise.example'
```

Cette commande ne fonctionne que si l’installation n’a aucun opérateur, client
ou stratégie, et contient exactement un compte `USER` non rattaché avec cet
email. Elle crée l’opérateur d’essai et nomme ce compte administrateur de cette
installation. Elle ne remplace aucun mot de passe et n’accorde aucun accès à
une autre entreprise. Le responsable se reconnecte ensuite pour renouveler sa
session. La liste historique des comptes fondateurs est explicitement désactivée.

## Sauvegarder et restaurer

```sh
make instance ARGS='sauvegarder installation/instances/demo --destination installation/sauvegardes/demo-01'
make instance ARGS='restaurer installation/sauvegardes/demo-01 installation/instances/reprise --instance entreprise-reprise --origine http://localhost:3394 --port 3394'
```

La sauvegarde interrompt uniquement l’application de cette installation,
conserve PostgreSQL disponible pour `pg_dump`, puis relance l’application dans
un bloc `finally`. Elle contient la base complète, les originaux chiffrés, leurs
clés et la configuration nécessaires à leur relecture. Elle doit rester privée.
Les empreintes portent sur les cinq fichiers du paquet et sur le contenu de
chaque table, sans exporter les lignes dans le compte rendu.

Une installation qui porte Radar restaure aussi Radar sur un nouveau port local :
ajouter `--port-radar <port>`. Sans lui, la restauration refuse avant toute
commande Docker, parce que le Radar d’origine peut encore servir sur son port.

La restauration exige un dossier et des ressources Docker nouveaux. Elle
vérifie les fichiers avant toute commande Docker, refuse les chemins sortants
et les liens dans l’archive de médias, restaure PostgreSQL et les médias, puis
compare les empreintes des tables **avant** de démarrer l’application. Elle
réutilise les images et les clés du paquet avec la recette courante de ce profil.
Les autres entreprises restent en service. En cas d’échec partiel, les ressources
de reprise sont conservées pour diagnostic ; aucune purge automatique ni
restauration par-dessus une entreprise existante n’est proposée.

## Réception et périmètre restant

`make test-installation` vérifie les frontières de configuration, les secrets
distincts, le refus d’écrasement et d’archives altérées ou dangereuses. Avec
Docker Compose présent, deux tests lisent aussi le compose effectif : services
du socle inchangés par les options, composants sans réseau commun avec La Fusée,
ports sur `127.0.0.1` seulement, images par digest, étiquettes d’installation. Ces tests
ne remplacent pas une création de marque, un téléchargement d’original et une
restauration sur le vrai runtime. Le suivi de release distingue ces preuves.

Le chantier C7 reste ouvert tant que le paquet complet n’a pas reçu les droits,
fichiers, bases, sessions, files et mémoires de tous ses composants, sa continuité
et son coût mensuel. Le reverse proxy HTTPS, les sauvegardes hors de l’hôte et
leur rétention demandent aussi leur réception. La distribution actuelle de La
Barre historique contient des matériaux de Matanga : seule sa distribution neutre
entre dans le profil optionnel décrit ci-dessous. Les agents facultatifs seront
raccordés aux mécanismes existants, sans partager leurs identités ou mémoires.

La [réception du socle du 19 octobre](reception-2026-10-19.json) précise les
preuves natives, les 233 tables restaurées, les refus HTTP et les limites ouvertes.
La [réception du 11 novembre](reception-2026-11-11.json) reçoit Radar et Danmem
dans le profil et rejoue ces contrôles d’accès sur La Fusée 6.27.567 puis 6.27.569 :
un identifiant de source d’une autre entreprise reçoit désormais 404 `NOT_FOUND`,
la même réponse qu’un identifiant inconnu, sans écriture métier.

## Poste de projet La Barre — extension en réception

Le profil optionnel `barre: true` ajoute le même moteur La Barre, distribué sans
corpus d’entreprise, sur le réseau privé. `barreImage` exige un digest immuable
qualifié ; une étiquette `latest` n’est pas admise. Le fichier de profil ne
contient que les choix de la maison ; les projets, décisions et personnes restent
dans deux volumes propres à l’installation. Le processus n’a aucun port public.
La Fusée expose déjà `/la-barre/` avec sa session et ses contrôles d’origine.

L’identité de source et l’opérateur du raccord sont distincts du nom Docker. Une
reprise les conserve avec les données et les clés : renommer le déploiement ne
transforme pas les références historiques en références d’une autre entreprise.
Le raccord de portefeuille/configuration requiert la version Fusée 6.27.493 ; le
socle 492 déjà reçu reste un profil distinct et ne prouve pas cette intégration.

La sauvegarde v2 fige les deux writers de l’entreprise, puis conserve PostgreSQL,
les originaux chiffrés, le dépôt La Barre, les médias et éditions de revue, le
profil et la configuration privée. La restauration compare les contenus des
233 tables et les fichiers La Barre avant de démarrer les applications ; elle
refuse une destination existante, un fichier altéré, un lien ou un chemin sortant
de l’archive. Les sauvegardes du profil v1 restent lisibles et conservent leur
périmètre plus étroit. Les autres stockages, mémoires et services de la flotte ne
sont pas implicitement sauvegardés par cette extension.

État courant : 11 contrôles de frontière locaux ; distribution neutre canonique
La Barre `e911153`, image de recette construite depuis `464503f`. Sur entreprise
fictive possédée, projet et fiche d’asset créés par les écrans natifs, fichier de
revue relu à l’identique. La reprise commune conserve les 233 tables, le dépôt,
les fichiers et leurs permissions, les clés et l’identité du raccord avant boot.
Une nouvelle note native persiste dans la reprise et reste absente de l’original.
Les lectures anonymes du dépôt et du fichier sont refusées (401).

Cette réception utilise Fusée 492 : le stockage commun est reçu, le parcours
automatique marque–projet de 493 reste ouvert. La tentative Next dev local/base
distante a rencontré un tunnel interrompu (« Broken pipe »), pas une saturation
démontrée. Recevoir l’image CI dans le réseau privé avant de déclarer ce parcours
reçu ; ne pas supprimer les vérifications d’accès pour passer le test. Le digest
La Barre ci-dessus est qualifié dans le cache du VPS de recette ; son accès depuis
un hôte neuf n’a pas encore été reçu.

La [réception de reprise commune](reception-poste-2026-10-19.json) conserve ce
périmètre, distinct de l’intégration complète et des autres composants.

## Choisir l’image La Fusée

Sans option, le profil garde l’image La Fusée qualifiée ci-dessus. Le champ
`fuseeImage` en désigne une autre, toujours par son digest
(`ghcr.io/xtincell/adve-project@sha256:…`) ; une étiquette est refusée avant
toute création. Une reprise conserve l’image du paquet.

## Radar — dossiers et journal de l’entreprise

Le profil optionnel `radar: true` ajoute Radar avec **sa propre base** : un
PostgreSQL distinct, sur un réseau interne que ni La Fusée ni sa base ne
rejoignent, et deux volumes (`radar-database`, `radar-data` pour les mots de
passe personnels et les visuels). Champs, le fuseau étant facultatif :

```json
"radar": true,
"radarImage": "sha256:…",
"radarPort": 3411,
"radarAdminEmail": "responsable@entreprise.example",
"radarTimezone": "Africa/Douala"
```

`radarImage` exige un digest ; `radarPort` est un port local distinct de celui
de La Fusée, publié sur `127.0.0.1` seulement, comme La Fusée, derrière le
reverse proxy de l’entreprise. Le réseau d’entrée de Radar est le sien, sans
traduction d’adresse sortante : Radar n’atteint ni Internet, ni La Fusée. `radarTimezone`
fixe le mois courant du périmètre membre (UTC par défaut). Radar et Danmem
tournent derrière un `init` : Node en PID 1 ignore SIGTERM, et l’arrêt attendait
sinon son délai avant de tuer le processus.

La préparation génère cinq secrets propres à l’installation : mot de passe de
la base, mot de passe partagé du mur d’authentification, secret de session,
clé machine `RADAR_API_KEY` et jeton des flux d’activité. Le responsable se
connecte avec `radarAdminEmail` et le mot de passe partagé, lu dans le fichier
privé `.env`, puis choisit son mot de passe personnel sur `/profil`. Les flux
`/feed.xml` et `/activity.json` exigent le jeton ; `/jour.html` et `/jour.json`
restent publics par contrat de Radar (liste limitée, non privée) : le reverse
proxy décide s’il les expose. L’entrée libre `/ingest` n’a pas de modèle local :
elle conserve le texte sans le structurer.

**Raccord à La Fusée.** La Fusée ne lit pas Radar et ne partage aucun réseau
avec lui. Le raccord est le contrat d’identité existant (`docs/INTERFACES.md`,
« la-fusee ↔ radar ») : un nœud de portefeuille porte une référence
`RADAR / instance / brief / id`, sans état recopié. L’instance est l’identité
`SHINKIRO_RADAR_INSTANCE` générée à la préparation (`radar-…`) ; comme
l’identité La Barre, elle est distincte du nom Docker et une reprise la garde.
`verifier` relit les références de La Fusée qui désignent cette instance et
contrôle, avec la clé machine, que chaque dossier existe dans ce Radar ; il
vérifie aussi que l’API refuse l’accès anonyme (401). Les références vers une
autre instance sont comptées, jamais résolues ici.

Limite constatée dans Radar : les mots de passe personnels choisis sur `/profil`
sont conservés en clair dans `dash-users.sqlite3` (volume `radar-data`). La
sauvegarde les transporte ; elle doit rester privée. Le correctif relève du
dépôt Radar.

## Danmem — mémoire et file de travaux

Le profil optionnel `danmem: true` (avec `danmemImage`, un digest) ajoute la
mémoire partagée et la file de travaux des agents de l’entreprise. Danmem a sa
propre base PostgreSQL/pgvector, sur un réseau interne, et **aucun port** : seul
un service raccordé au réseau interne `memoire` atteint son API ; aucun service
du socle ne l’est. Le service tourne en mode déterministe (`WORKER_ENABLED=false`,
aucune clé de fournisseur) : observations, rappel plein texte, cartes déjà
écrites et travaux fonctionnent ; les appels de modèle répondent « aucun
fournisseur disponible » et les embeddings sont absents.

La préparation génère le mot de passe de la base et la clé héritée
`MEMORY_API_TOKEN` (identité `danmem:instance`, mandat total). Les clés à
identité et mandat se créent dans le conteneur, par le script du dépôt :

```sh
docker compose … exec danmem node scripts/cles.mjs creer guardian --mandat '{"ecrire":["S2"],"pairs":["guardian"]}'
```

La clé en clair n’est affichée qu’une fois ; la base n’en garde que l’empreinte,
qui voyage avec la sauvegarde. Le service ponctuel `danmem-migrate` applique les
migrations `sql/NNN-*.sql` de l’image figée avant le service, à chaque
démarrage ; elles sont additives et rejouables. Changer d’image Danmem sur une
installation existante demande d’abord une sauvegarde.

L’image vient du `Dockerfile` du dépôt Danmem (branche
`claude/profil-installation`). Elle ne contient pas `pg_dump` : la sauvegarde du
profil utilise celui du conteneur de base, de même version majeure. Elle compare
les contenus des tables et la version de pgvector ; elle ne reprend pas la
signature de schéma lue par les scripts `sauvegarder`/`restaurer` de Danmem.

## Sauvegarde v3

Avec Radar ou Danmem, `sauvegarder` écrit le schéma 3 (`socle-manuel-fusee-v3`)
et la liste `components`. Tous les writers de l’entreprise (La Fusée, La Barre,
Radar, Danmem) sont arrêtés ensemble, puis relancés dans un bloc `finally`. Le
paquet ajoute `radar.dump`, `radar-data.tar` et `danmem.dump` aux fichiers du
profil, avec les empreintes des tables de chaque base, des fichiers Radar et de
leurs droits, la version de pgvector et les identifiants des travaux Danmem
réclamés (un effet peut avoir été interrompu). La restauration refuse un
composant différent de l’installation sauvegardée, une empreinte absente, un
fichier altéré, un lien ou un chemin sortant, et compare les trois bases, les
fichiers Radar et pgvector **avant** de démarrer les applications. Les
sauvegardes v1 et v2 restent produites et lues comme avant.

## Ce qui n’est pas raccordé, et pourquoi

**Argos-studio.** SHK-0002 en fait la bibliothèque canonique, publique et
autonome, pas un stockage d’entreprise. Le contrat existant de La Fusée vers
Argos exige un point d’accès HTTPS public et refuse un hôte privé
(`ADVE-project`, `seshat/argos/studio-url.ts`, garde SSRF) : un Argos placé sur
le réseau privé de l’installation serait refusé par ce contrat. Le dépôt n’a pas
non plus de Dockerfile, sa base est un SQLite sous `prisma/` (PostgreSQL est une
migration distincte), et l’authentification de l’administration et du POST
reste à recevoir. Il faudrait d’abord décider qu’une entreprise peut héberger un
Argos privé, puis changer ce contrat dans La Fusée.

**Rôles d’agents de Galahad.** Le moteur refuse de démarrer un rôle sans
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` et `LLM_API_KEY`
(`engine/src/config.js`, `requireAgentConfiguration`) : un bot Telegram créé par
l’opérateur pour chaque rôle et la clé d’un fournisseur de modèle. Aucun de ces
secrets ne se génère par installation ; le profil ne les invente pas. Les rôles
doivent aussi joindre Telegram et le fournisseur, alors que l’installation n’a
aucune sortie réseau. Leur image se construit localement (`latest`), sans digest
publié.

**Files de travaux.** La file entre rôles est la table `jobs` de Danmem : elle
est installée, isolée et sauvegardée avec Danmem. Le côté consommateur, le volume
`galahad-memory` (cartes, états, reçus non acquittés), ne l’est pas. Pour le
raccorder, il faudra : le canal et le fournisseur choisis par l’entreprise, une
image Galahad publiée par digest, une sortie réseau limitée à ces deux hôtes, une
clé Danmem à identité et mandat par rôle, le réseau `memoire`, et la sauvegarde
dans l’ordre du dépôt Danmem (geler Galahad puis Danmem ; restaurer Danmem puis
Galahad).

Talos et Hulysse sont des dépôts historiques sans service propre. Les données de
`hermes-cockpit` et le producteur de `danmem-status.json` restent hors de tout
dépôt et de toute sauvegarde.
