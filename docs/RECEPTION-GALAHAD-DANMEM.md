# Galahad et Danmem — recevoir les moyens de travail

Galahad coordonne et entretient l'infrastructure. Danmem conserve du contexte
partagé et transporte les travaux. Les spécialistes métier de La Fusée,
l'autorité de marque, le suivi Radar et le suivi campagne La Barre conservent
leurs responsabilités. Un diagnostic serveur n'est pas une décision de campagne ;
une mémoire ou un résultat calculé n'est pas une approbation client.

## Galahad : moteur existant corrigé

[PR #3](https://github.com/xtincell/galahad/pull/3), canon `3f62b0d`.
Neuf contre-exemples reproduits sur `2ff861a`, puis quinze scénarios verts sous
Node 22 en CI `37635597133` sur le head `e9d4584`.

Le lot refuse les confirmations négatives/citées et les durées invalides,
valide les procédures avant exécution, garde toutes leurs portes shell,
distingue l'échec de décision IA et respecte le seuil exact de jetons. Il
conserve le résultat d'un travail avant son acquittement. Une procédure manuelle
avec effet vérifié fonctionne sans appel de chat. Aucune dépendance npm ajoutée.

Le garde est fondé sur des motifs de commandes, sans sandbox ni mandat lié à
une cible/montant. Le compteur n'est pas un coût persistant de flotte. Setup,
cockpit, agents dans Telegram et exploitation client restent à recevoir.

## Danmem : service réel remis dans Git

[PR #1](https://github.com/xtincell/danmem/pull/1), base canonique `d2d6686`.
Le service réel possédait rappel hybride, worker cumulatif et `/jobs`, absents
du dépôt initial. Source lue en lecture seule : SHA-256
`7430261674992db1c94409cf5822e805f5e59d34f087854baf93040a88dbf216`.
GET `/jobs` pour un destinataire synthétique : 401 sans clé, 200 avec clé.
Aucun souvenir privé, contenu de travail ou jeton publié.

Le schéma, ses index et son trigger sont versionnés. Les corrections protègent
authentification, choix du worker, classification S7, identité bigint, échéance,
transitions et premier compte rendu final. La réponse rapporte le chemin modèle
utilisé ; l'ancien worker « local » ne prouve ni résidence ni gratuité.

Réception locale : dix-huit scénarios verts sur PostgreSQL 17 ; deux contrôles
vectoriels explicitement sautés. CI `37638341311`, head `25447a9` : dix-neuf cas
verts, dont schéma rejouable sans perte et rappel sémantique sans mot commun.
L'image utilisée est celle de production identifiée par digest
`pgvector/pgvector@sha256:ad2e18408bf447f62092a8a5259e7df10505c5a0360bd1a1853ac8b8b0763da2`.
Le consommateur Galahad d'un autre dépôt est explicitement sauté dans cette CI.

## Réception croisée et portée

Un travail synthétique est reçu par Danmem, réclamé par le moteur Galahad et
exécuté sans IA. Une panne HTTP 503 empêche son retour. Le compte rendu reste
sur disque. Un nouveau processus le remet ; le statut devient done, la trace
de mémoire est présente et un marqueur atteste une seule exécution. La reprise
du retour est reçue avec les deux composants et PostgreSQL, sans fournisseur réel.

Ce lot ne reçoit pas une interruption pendant l'effet, un bail de claim, la
restauration d'une sauvegarde, les identités de mandataires, l'isolation TPE,
la rectification des souvenirs, un coût récurrent ou le cycle Noël. Les nouvelles
observations S7 ne partent pas vers l'embedding ; l'historique n'est pas purgé.
Les traitements automatiques peuvent être désactivés. Les services et agents
actifs ne sont ni migrés, ni reconfigurés, ni redémarrés.
