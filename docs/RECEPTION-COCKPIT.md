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

### Réception du raccord amont et du format de visibilité

Le service hôte `portal-api.service` pointe vers l’ancienne adresse PostgreSQL
`10.0.1.10`. La base existante `matanga_portal` est retrouvée uniquement dans
`kgnzh4642i1p30lc2ewsvwk9`, à `10.0.1.17` ; ses quatre tables existent et le rôle
configuré les lit dans une session explicitement read-only. Le champ `PGHOST`
du fichier partagé est corrigé, permissions root/0600 conservées ; seul le
service API est relancé. Processus et configuration effectifs sont relus. Les
quatre routes répondent 200 ; leurs résultats vides sont maintenant réellement
lus. Cela ne reçoit pas une restauration de données historiques.

Le premier contrôle immédiat après relance ne retrouve pas encore `PGHOST` dans
l’environnement observé. La relecture indépendante reçoit le processus effectif ;
aucune seconde relance. Aucun agent, bot ou PostgreSQL redémarré, aucun contenu,
code d’accès, droit ou mandat créé/modifié par cette recette.

La réponse réelle `/visible` est `{ client: [numéros, ...] }`, pas une liste.
Le lecteur introduit dans la PR #1 la refusait à tort. La
[PR #2](https://github.com/xtincell/hermes-cockpit/pull/2), canon `1ea757b`, reçoit
ce contrat et refuse les valeurs incompatibles : critère rouge avant correction,
treize contrôles et deux CI verts après. Le service source garde son format.

Livraison `1ea757b` terminée à 22:26:56Z ; image
`sha256:1a270b6ed55484787de422f2a42c04b7ec11bd3af5b923a451facdc7fd271070`, trois
fichiers exécutés et volumes rapprochés. Lecture authentifiée bornée : sept sources
disponibles, `partial: false`. HTML reçu 200, routes privées anonymes 401. Cela
reçoit la lecture HTTP et ses formats, pas l’approbation de chaque donnée ou un
parcours navigateur authentifié.

Le raccord réparé dépend encore d’une adresse de conteneur. Sa stabilité après
recréation, les autres consommateurs du fichier partagé, la source/déploiement du
service hôte et ses permissions métier restent à recevoir. Ce point est une dette
d’exploitation identifiée, pas un nouveau produit ou une fonction à ajouter.

Ces contrôles ne reçoivent pas les écrivains externes, une coupure électrique ou
un remplacement de lien entre contrôle et ouverture. Fraîcheur de toutes les
sources, identité réelle des agents, effet appliqué, navigateur authentifié,
isolation TPE, restauration et coûts restent ouverts. Aucun agent redémarré,
aucun changement de modèle ou mandat ni notification Telegram exécuté.

Rapport opérateur : `audit-shinkiro-2026-09-25/release/AUDIT-COCKPIT-EXPLOITATION.md`,
preuves `preuves-cockpit/`. Aucun parcours large ni chantier clos.
