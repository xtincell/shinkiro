# SPAWT — application, exploitation et continuité de marque

Réception partielle des 7 et 8 octobre 2026. La mise en ligne du site ne reçoit pas
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

Quatre contre-exemples avaient été reproduits sur le store : favoris concurrents
perdus, suppression distante recréée, réponse tardive après déconnexion et même
avis déplaçant plusieurs fois le Palais. Les trois premiers critères sont corrigés
par la [PR #7](https://github.com/xtincell/spawt-ci-mobile-v1-mvp/pull/7), canon
`49db8c10f9de5806d73c5d8a63b263ef1736e1b3`, CI `37698954673` verte. Cache et
intentions non acquittées sont persistés ensemble, identifiés par compte, sous la
clé existante. Le serveur fait foi pour le reste ; une réponse ancienne n’acquitte
pas un choix contraire plus récent. Le réseau ne bloque pas les gestes locaux.
Les reprises utilisent les listeners réseau et foreground existants.

Vingt-cinq contrôles supplémentaires, suite app de 842 tests et quatre sauts,
quatre snapshots, types/vocabulaire/i18n et export web avec assets réels reçus.
Les refus d’enregistrement sont visibles dans les trois écrans concernés ; une
liste illisible reste intacte et laisse le reste du compte accessible. La sortie
purge aussi l’identité persistée, le Palais, les spawts et les consentements ;
les retours de Gold, statut interne et archétype lancés avant sortie sont écartés.

La politique de purge locale à la déconnexion reste explicite, y compris pour
les favoris non synchronisés. Le cache historique ne permet pas de distinguer
un ancien ajout hors ligne d’une suppression distante : il n’est pas promu en
mutations à rejouer. Ces limites et la recette sur deux comptes/appareils restent
ouvertes, avec l’isolation de la file des spawts et les autres callbacks.
Le rejeu d’avis déplaçant le Palais est encore reproduit après ces corrections ;
il ne devient pas un critère reçu parce que son test constate ce défaut.
L’avis et son effet sur le Palais étant persistés séparément, la suite doit traiter
l’écriture interrompue, l’édition et le rejeu ensemble. L’agrégation ADN des lieux
est un flux distinct déjà présent côté SQL ; elle ne doit pas être dupliquée.

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
`preuves-spawt-app/`. Registre actualisé après BanaHealth : 100 parcours examinés
partiellement sur 116, 16 non audités, aucun parcours large reçu ni chantier clos. Ce rapport ne clôture
pas les lignées donneuses restantes.


Livraison du lot favoris reçue : déploiement `irhw3g306531fua7pa36dv69` terminé à
23:03:33Z le 7 octobre (UTC), source `49db8c10f9de5806d73c5d8a63b263ef1736e1b3`. Conteneur
`ao9yhx6fzxhwi1crbswmli1c-225647741816`, image
`sha256:e13b4fd184d9764d0e18589121641d7190b73be5584f24b59b05f392e976a0d5` ; bundle public 200, empreinte
`b4419102d512581c71bd691767ba9ba9c9d2e64efb56a0102a5d9e0aab7d8cf3`, raccord backend et marqueurs de continuité rapprochés.
La configuration autre que le commit et les variables de backend sont conservées.
Cette relecture reçoit le code servi, pas un parcours authentifié.

[PR #8](https://github.com/xtincell/spawt-ci-mobile-v1-mvp/pull/8), canon
`db526127a3cc81637fbb6b16aef16c1d89319565`, répare uniquement l’adaptateur Jest CommonJS.
CI `37699941903`, suite de 843 tests et quatre sauts, export web et autres gates
verts. Le diff avec le runtime ne touche que documentation et dispositif de test ;
la configuration Babel de production exclut ce plugin. Le runtime reste sur le
lot produit qualifié `49db8c1`, sans nouveau déploiement pour ce correctif de test.


## Refus d’écriture du profil et du Palais — PR #9 livrée

[PR #9](https://github.com/xtincell/spawt-ci-mobile-v1-mvp/pull/9) fusionnée au canon
`cb26f0424a6442bc1d0684e5c60abd27951d7bf1`, CI `37711836611` verte sur `a1e845b`.
Deux refus Supabase rouges avant correction : les helpers profil/Palais résolvaient
leur promesse malgré l’erreur retournée. Ils rejettent maintenant cette erreur,
ce qui rend les mécanismes existants de signalement/reprise atteignables. Six
contrôles passent ; suite standard CI 849 tests, quatre sauts, quatre snapshots,
112 suites vertes et export web avec tous les assets. Localement, la première
suite sparse ne chargeait pas seize fichiers faute de médias ; elle ne vaut pas
gate verte. La suite de sources avec assets simulés passe ensuite les 849 tests.
Aucun modèle, migration, axe de goût, build EAS, OTA ou magasin modifié.

Déploiement `zsgue44girr4sji3wrf03kx1` terminé le 8 octobre à 01:26:07 UTC,
image `sha256:ec82a0eb818f386bb1e857a6eeb51f629edd7d693f2ba9111d908f9002031fc2`.
Conteneur unique, commit et configuration relus ; seul le commit cible change.
Bundle public et bundle chargé nativement rapprochés par SHA-256
`e813877985444bf33fa689c7a545788d1885f3d77cf0a0e3c868f23ca7a8c3c2`.
L’entrée consentement est reçue, cases décochées, Continuer désactivé. Seize
réponses observées, zéro exception ; un envoi analytics anonyme `user_signals`
est refusé 401 avant consentement. Ce résidu est distinct du correctif livré,
et n’est pas caché dans un bilan « zéro erreur ». Deux avertissements web
historiques subsistent. Aucun consentement accepté ni OTP envoyé.

Le rejet remonté ne prouve pas une file durable du Palais ni la fin du rejeu
d’avis. Éditions/interruption/concurrence, isolation de la télémétrie et réception
authentifiée restent ouvertes. Reçus : `preuves-spawt-app/erreurs-profil-*`.

## Envois analytiques sans session — PR #10 livrée

[PR #10](https://github.com/xtincell/spawt-ci-mobile-v1-mvp/pull/10), canon
`df38e41f8bb84f59f71fe05b68555a2e072d8973`, CI `37713813404` verte sur `04df7df`.
L'écriture `user_signals` est différée tant qu'aucune session n'existe. Lorsque
la session existe, les lignes portent explicitement le propriétaire lu. La voie
locale de conservation/reprise reste en place ; aucune modification de schéma,
consentement ou questionnaire. Cinq contre-exemples rouges, sept contrôles ciblés
verts, suite standard de 856 tests, quatre sauts, quatre snapshots, export web
avec tous les assets et autres contrôles reçus.

Déploiement `cc7ue8iy599mynoqwlygebxg` terminé à 01:47:11 UTC le 8 octobre.
Image `sha256:a8b37f8e6f1a9e63ab9fc5c7d38acba4f8040d2fcb18d830ea7449911298d383` ;
bundle servi et chargé nativement rapprochés par empreinte
`224375530a2a412206c2d81b47b85830d86b47613262896d87c3bcdbde19fa96`.
L'entrée consentement produit seize réponses sans erreur HTTP ni exception,
sans requête `user_signals` ; cases décochées, aucune session authentifiée reçue.
Le 401 constaté sous PR #9 est donc résolu sur cette entrée.

La propriété historique de la file analytique, ses acquittements, la reprise après
création du profil et le rejeu durable du Palais restent ouverts. Ces limites
ne sont pas reçues par la disparition du 401. Preuves opérateur privées :
`preuves-spawt-app/analytics-auth-*`.

## Six réponses vers le Palais — PR #11 livrée

[PR #11](https://github.com/xtincell/spawt-ci-mobile-v1-mvp/pull/11), canon
`f8cc80acf0a02cea8ae622ed8dacee9ea31bc814`. Le quiz utilise déjà la même base
`postgres` que le produit, avec son rôle limité. Le trou était dans le contrat :
les axes étaient conservés en base mais écartés au retour OTP. Un héritage complet
rejoint désormais la révélation, avec « Revoir mes préférences » pour rouvrir la
calibration existante. Un héritage absent ou incomplet conserve les questions.
Carte, analytics et première sauvegarde partagent le même calcul ; conversion
inverse exacte de l'échelle du moteur existant, sans nouvel axe.

Trois critères applicatifs et deux contre-exemples SQL reproduits avant correction.
CI app `37717741870` et PostgreSQL 15 `37717741738` vertes sur `a70218a` : 878 tests,
quatre sauts, quatre snapshots, types/vocabulaire/i18n et export complet reçus.
3 125 vecteurs vérifient la conversion sans perte. Preview sans création de profil,
numéro non confirmé, droits, JSON invalide, idempotence et retour arrière/réapplication
reçus sur base jetable. Aucun compte vivant, OTP, consentement, GPS ni magasin testé.

Migration 0069 appliquée, 67 migrations enregistrées : la RPC propriétaire utilise
le numéro confirmé dans Auth, plutôt que le téléphone public modifiable. Le chemin
Edge trusted est conservé ; aucun droit élargi. La première tentative sous
`postgres` a été refusée « must be owner of function claim_meute_heritage » et
entièrement annulée. La livraison utilise le propriétaire existant `supabase_admin`,
sans changement de rôle ni de permissions. Aucun Palais existant réécrit par la
migration. Déploiement `fwyuioocsrvje6ob2oxf98n9` terminé à 02:35:17 UTC.
Image `sha256:6b20036e946790308305ba2e7b0a3adf3db622a5e50805e670d82bcbc9d68e31`.
Bundle public et réellement chargé rapprochés par SHA-256
`0be524f6d423ee9f9543e88435b709254849e5ec32b5108a1627c34c0d100224`.
Seize réponses sans erreur HTTP ni exception ; deux consentements décochés et
Continuer désactivé. L'héritage authentifié n'est pas reçu par cette entrée.
Le fichier Edge servi diffère globalement du canon ; son helper de claim et son
appel post-OTP sont identiques après normalisation AST. Aucun Edge redémarré.
Un premier contrôle cherchait le libellé UTF-8 brut dans un bundle qui l'encode
en `\\xe9` : ce faux négatif du dispositif est corrigé et conservé dans les preuves.

L'énumération théorique des 4 096 parcours du quiz montre que le sixième choix peut
changer l'archétype sur 526 des 1 024 préfixes à cinq réponses. Les treize archétypes
sont atteignables ; aucun écart quiz/Taste Reveal. Le clamp F existant fusionne deux
choix pour 256 préfixes. Cela ne mesure ni une population ni la justesse empirique
des recommandations, et ne reconstitue pas la sixième réponse d'anciens pionniers.

La reprise du profil et du Palais après connexion est corrigée dans la
[PR #12](https://github.com/xtincell/spawt-ci-mobile-v1-mvp/pull/12), canon
`8aae5d846efad0c54a5e4912a45f2e3ba24f421a`. Le lecteur RLS utilisé auparavant par
le helper de développement est partagé avec le parcours normal, sans déplacer
son opt-in ni ses identifiants dans la voie de production. Un compte complet
retrouve ses axes mûris, son stade, son rang et ses consentements sans upsert
d'initialisation. L'absence confirmée du compte ouvre seule une inscription ;
une panne reste distincte et se retente sans renvoyer l'OTP consommé.

Un profil sans premier Palais et sans progression reprend les étapes existantes
préremplies. La sauvegarde préserve date, rang et consentements d'origine ; sa
relecture adopte un Palais apparu entre-temps sans compter une seconde activation.
La publication locale pose le profil après le Palais et les consentements ;
les changements de session et générations écartent les réponses tardives.
Aucune migration, table, permission ni fonction serveur ajoutée.

Cinq critères d'écran rouges avant correction. CI `37720454001` sur `c5eaebd` :
921 tests, quatre sauts, quatre snapshots ; types, vocabulaire, i18n et export web
complet avec médias reçus. Le checkout local avait seize modules en échec faute
de médias ; le mapper statique de tests déjà existant reçoit la suite source,
sans constituer un export local ni une réception native.

Historique et collection complets, cache de démarrage confronté à Auth, reprise
durable Palais, finalisations simultanées, compte avancé sans Palais, deux appareils
et retour des apprentissages au dossier de marque restent à recevoir.
Aucun parcours large ni chantier clos.
Preuves opérateur privées : `preuves-spawt-app/heritage-*` et
`preuves-spawt-vitrine/sixieme-contribution.json`.

L’aperçu existant sert ce canon après déploiement terminé le 8 octobre à
03:07:10 UTC. Image `sha256:c2fc06c0fa19d8c570bf7cc8c53e6cf1bdf26f4e840093f623e1f48f15d024d6` ;
bundle public et chargé rapprochés par empreinte
`ca38bb782c5e70ba7bc1453b5671d699de50979f99a656db8c32dd9b2bcb6f07`.
Entrée navigateur : quinze réponses, zéro erreur HTTP et zéro exception ; quatre
fetch d’accueil annulés, sans cause établie, conservés dans les preuves. Deux
consentements décochés, Continuer désactivé, aucun débordement horizontal.
Cette entrée ne reçoit ni la reprise authentifiée ni une app iOS/Android.

Preuves opérateur privées complémentaires : `preuves-spawt-app/reprise-*`.
