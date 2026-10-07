# SPAWT — application, exploitation et continuité de marque

Réception partielle du 7 octobre 2026. La mise en ligne du site ne reçoit pas
l’application, ses magasins ni la boucle d’apprentissage du produit.

## Rôle dans le Shinkiro

La Meute formule une hypothèse de goût en six questions. L’application conserve
l’identité, l’héritage éventuel de pionnier et le Palais personnel, puis rapproche
ce profil des lieux, des choix et des expériences exprimées. L’ADN collectif des
lieux agrège des contributions distinctes. La console équipe entretient contenu,
modération, accès et offres. La valeur attendue est un choix plus pertinent puis
un apprentissage réutilisable ; aucun résultat commercial n’est déduit de la
présence de ces fonctions.

La Fusée conserve le dossier de marque et les sources appliquées ; La Barre
cadre les travaux et Radar les suit. Le backend SPAWT garde le domaine produit.
La cohésion à recevoir porte sur les identités, décisions, versions livrées et
preuves de résultats. Elle n’exige ni recopier les données personnelles dans une
base générale ni rendre un agent obligatoire. Les six questions publiques et les
cinq axes du Palais ne sont pas deux versions du même questionnaire.

Crew, Mode Rapide, Explore, progression/titres, coups de cœur, suggestions,
réservations et Wrapped possèdent aussi des routes actuelles. Leurs usages
collectifs, éditoriaux et d’apprentissage restent distincts ; les flags de démo
ne valent pas activation ou réception sur le backend vivant. Ces capacités ne
sont pas retirées du périmètre par les anciens guides qui les classent hors V1.

## Sources et distribution confrontées

`spawt-ci-mobile-v1-mvp` contient l’app Expo dans `app/`, la console équipe dans
`spawt-admin/` et le backend dans `supabase/`. Le prototype web racine est gelé.
La branche produit active est `claude/app-finale-ios-android-f8ewrp`, distincte
du `main` historique.

L’aperçu `app-preview.spawt.online` servait `73ea5c3`, ancêtre strict de `618e70f`
avec 112 commits de retard, et un repli fixtures réellement constaté. Configuration
backend publique rétablie au build et démo désactivée ; première livraison sur
`618e70f` reçue par commit du conteneur, image et bundle. Aucun compte authentifié,
OTP, GPS ni paiement utilisé pour cette vérification.

La console `admin.spawt.online` affiche son entrée staff. Son sous-arbre servi
`3adf520`, comparé à `618e70f`, ne diffère que par documentation et test de fontes ;
aucune divergence fonctionnelle distribuée démontrée. Lecture SQL `READ ONLY` :
66 migrations enregistrées, de `0001` à `0068` avec deux réservations ; huit tables
sélectionnées avec RLS et cinq fonctions centrales présentes. Les permissions et
opérations authentifiées ne sont pas reçues par cette lecture.

Les 160 tests de la console passent dans 17 fichiers, logique et formulaires avec
données simulées. Le contrôle des binaires de fontes est exclu du checkout de
sources ; aucun export des fontes ni réception de permissions par ces tests.

## Reprise corrigée, parcours encore ouvert

[PR #5](https://github.com/xtincell/spawt-ci-mobile-v1-mvp/pull/5) fusionnée au
canon `73b61af3c7013565cad325a366dad4f07277e061`, après deux CI vertes sur
`e4bbabf4aa8e978f5ebbb7fe3309c15334d99b2e` : `37688700133` et `37688707157`.

Huit défauts reproduits puis corrigés : les écritures de file sont sérialisées,
l’acquittement relit les identités stables, un ajout concurrent ou une purge n’est
plus annulé, une lecture/écriture impossible est signalée, le plafond refuse la
nouvelle entrée sans supprimer l’ancienne et les échecs répétés ne détruisent
plus l’opération. L’inspecteur affiche l’échec et permet de réessayer. La route
de fiche lieu est déclarée sous son vrai nom, `place/[id]/index`.

Vingt contrôles de file et un d’inspecteur reçus. Suite app : 817 tests, quatre
sauts explicites, quatre snapshots ; types/vocabulaire/i18n verts. Assets simulés
dans le checkout local de sources ; export web avec les vrais assets reçu en CI.
Le workflow ne lance ni EAS, ni OTA, ni publication en magasin.

Le correctif `73b61af` est livré : déploiement `qogr6yzqntzro4gpsf8g9vpe` terminé
à 21:35:25Z, conteneur `ao9yhx6fzxhwi1crbswmli1c-212840566425`,
image `sha256:ef6aef66cb795ecb2073d9fc075f1b3b2774298bf7829578f684dad61c5ece14`.
Bundle public et configuration backend rapprochés. Entrée native remountée sans
avertissement de route ; deux avertissements web conservés (notifications,
animation). Aucun consentement accepté ni parcours authentifié reçu.

[PR #6](https://github.com/xtincell/spawt-ci-mobile-v1-mvp/pull/6) fusionnée au
canon `4d7ee596176c66884e0b8f0cf2204f743d161ef2`, CI `37691004953` verte.
Les liens d’entrée auparavant sur `spawt.ci` mènent aux deux pages existantes de
`spawt.online`. Livraison terminée le 7 octobre à 21:49:27Z ; conteneur, image
`sha256:86e423545ac64ce48681ffe6c17cd5bba015ece88892ba2429ba2328f35c0d63`
et bundle public rapprochés. Les deux clics natifs ouvrent confidentialité et
CGU ; aucune case cochée. Ces pages restent des brouillons juridiques, avec
mentions à valider. Les liens de partage de lieu/Crew sur l’ancien domaine ne
sont pas déplacés vers la vitrine, qui ne possède pas leurs routes produit.
La réception de ces liens profonds et de la distribution mobile reste ouverte.

Une interruption simultanée des accès GitHub/VPS/aperçu a différé la relecture.
Après retour du réseau, statut, image, bundle et navigation ont été reçus. Deux
assertions prématurées sur un fichier de statut ancien relèvent du dispositif de
réception ; elles ne sont ni un échec du déploiement ni une panne démontrée de SPAWT.

Quatre contre-exemples distincts restent ouverts : favoris concurrents perdus,
suppression serveur ressuscitée à l’hydratation, réponse distante après reset
repeuplant les favoris du compte précédent, même avis rejoué déplaçant encore le
Palais. Les tests constatent ces mauvais comportements ; ils ne reçoivent pas
leurs parcours. Isolation et ordre de file, UX des erreurs des callers, reprise
authentifiée sur deux comptes/appareils, édition et apprentissage restent ouverts.

Le helper client ADN ne réalise plus l’écriture distante décrite dans son ancien
commentaire. L’agrégation serveur existe déjà dans le SQL ; ajouter une seconde
agrégation à partir de ce commentaire créerait un doublon.

## Raccordement natif reçu

Le produit Fusée existant Application mobile, toujours « À achever », conserve
son lien La Barre et son dépôt. Quatre références ajoutées par le formulaire natif
sont retrouvées après rechargement sous 410 : branche active, aperçu, console
équipe et backend. Les six références sont conservées dans Sources & liens,
cinq points d’accès web sont visibles dans le produit. Aucun contenu de marque,
permission ou activation modifié. Publication depuis une version de marque
approuvée et retour de résultats restent à recevoir.

Rapport et preuves opérateur :
`audit-shinkiro-2026-09-25/release/AUDIT-SPAWT-APPLICATION.md`,
`preuves-spawt-app/`. Registre : 91 parcours examinés partiellement sur 116,
25 non audités, aucun parcours large reçu ni chantier clos. Ce rapport ne clôture
pas les lignées donneuses restantes.
