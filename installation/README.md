# Installer le socle manuel d’une entreprise

Ce profil installe La Fusée et sa base PostgreSQL/pgvector à partir d’images
figées. Chaque installation reçoit ses secrets de session et de chiffrement,
sa base, ses réseaux et son volume d’originaux. Le fonctionnement ne demande
aucun fournisseur d’IA, OAuth, abonnement ou agent.

Il s’agit du **socle manuel**, pas encore du paquet complet de Shinkiro. La Barre,
Radar, Argos et les mémoires/agents gardent leurs propres stockages et leur
réception. Aucun exemple, corpus, compte ou secret d’une entreprise existante
n’est utilisé pour préparer une nouvelle installation.

## Préparer et démarrer

Prérequis : Python 3.10 ou supérieur, Docker avec Compose v2, accès en lecture aux
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
distincts, le refus d’écrasement et d’archives altérées ou dangereuses. Ces tests
ne remplacent pas une création de marque, un téléchargement d’original et une
restauration sur le vrai runtime. Le suivi de release distingue ces preuves.

Le chantier C7 reste ouvert tant que le paquet complet n’a pas reçu les droits,
fichiers, bases, sessions, files et mémoires de tous ses composants, sa continuité
et son coût mensuel. Le reverse proxy HTTPS, les sauvegardes hors de l’hôte et
leur rétention demandent aussi leur réception. La distribution actuelle de La
Barre contient encore des matériaux de Matanga : elle n’entre pas dans ce profil
tant qu’une distribution neutre n’a pas été reçue. Les agents facultatifs seront
raccordés aux mécanismes existants, sans partager leurs identités ou mémoires.

La [réception du socle du 19 octobre](reception-2026-10-19.json) précise les
preuves natives, les 233 tables restaurées, les refus HTTP et les limites ouvertes.
