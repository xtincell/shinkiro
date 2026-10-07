# Cockpit d’exploitation — audit partiel du 7 octobre 2026

Le cockpit doit rendre les services, agents et commandes d’exploitation lisibles,
avec leur fraîcheur et leurs résultats. Il ne remplace ni les dossiers de marque
Fusée, ni le cadrage La Barre, ni les réceptions Radar. Tâches/notes locales et
registre propagé ne constituent pas à eux seuls une continuité métier reçue.
Son recouvrement avec le cockpit Galahad reste à qualifier par usages.

Source canonique `d4943ee8904fba0f8357aa418e50f19408693a18`, sept fichiers et
zéro dépendance npm. Le fichier `portal.mjs` exécuté est identique au canon :
SHA-256 `f3b51c4703792433df47889aa75a86273c0031d4dad1b4bff82d92e53c47fff4`.
L’image porte un ancien tag distinct ; cela ne prouve pas une divergence du code.
Service existant `cockpit.powerupgraders.com` : santé anonyme 200, état et
workspace 401. Aucune réception navigateur authentifiée, aucun droit changé.

Lecture bornée par le sas existant reçue 200 : 19 applications et dix projets du
registre, source datée du 5 juillet. Timestamp d’assemblage et rafraîchissement
rapporté ne reçoivent pas la fraîcheur de chaque source ni un projet métier.

Cinq contre-exemples sur fonctions exactes en VM : tâches/notes acquittées malgré
échec d’écriture ; tâches concurrentes perdues ; carnet corrompu remplacé par un
nouveau ; sept erreurs de portail réduites à null sans cause ; chemin lexical
interne traversant un lien symbolique vers une fixture extérieure. Réseau interdit,
stockage simulé et fichiers temporaires synthétiques ; aucun secret réel lu ni
commande de production exécutée. Ces constats ne sont pas des critères satisfaits.

[PR #1](https://github.com/xtincell/hermes-cockpit/pull/1) fusionnée au canon
`fbcdb20eb9abb44a80f4d50d612eb95f1ce3bebb` après deux CI vertes sur `ea2d8f3`.
Sept des huit premiers critères échouent avant correction ; douze passent après,
dont les routes du serveur réel sur loopback, stockage synthétique et réseau de
production interdit. Mutations JSON sérialisées dans le processus, remplacement
atomique et permissions conservées ; JSON invalides refusés sans remplacement.
Le formulaire garde le texte sans confirmation et bloque les doubles envois
pendant la requête. Les demandes de modèle/rafraîchissement sont conservées et
annoncées comme demandées, sans promettre leur effet. Lectures partielles du
portail distinctes des listes vides ; liens extérieurs et pendants refusés.

Livraison terminée le 7 octobre à 22:09:08Z, source `fbcdb20` : conteneur, image
et trois fichiers exécutés rapprochés du correctif. Montages workspace, données,
socket Docker et Talos conservés ; configuration et environnement non changés.
Santé anonyme 200, routes privées 401, état authentifié borné et HTML reçus 200.
Le portail rapporte maintenant quatre refus HTTP 500 (accès, codes, visibilité,
journal), avec trois lectures disponibles. Leur cause amont reste à diagnostiquer ;
la nouvelle observabilité ne permet pas d’attribuer la panne à cette livraison.

Ces contrôles ne reçoivent pas les écrivains externes, une coupure électrique ou
un remplacement de lien entre contrôle et ouverture. Fraîcheur de toutes les
sources, identité réelle des agents, effet appliqué, navigateur authentifié,
isolation TPE, restauration et coûts restent ouverts. Aucun agent redémarré,
aucun changement de modèle ou mandat ni notification Telegram exécuté.

Rapport opérateur : `audit-shinkiro-2026-09-25/release/AUDIT-COCKPIT-EXPLOITATION.md`,
preuves `preuves-cockpit/`. Aucun parcours large ni chantier clos.
