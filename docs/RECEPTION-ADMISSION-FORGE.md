# Réception partielle de l’admission d’une production — 8 octobre 2026

La Fusée **6.27.425** reçoit une frontière de persistance et sa livraison.
Un résultat fournisseur peut reprendre après une interruption sans créer
une seconde version, un second actif ou un second reçu de coût déclaré.
Ce reçu ne démontre ni un média durable ni une forge réelle SPAWT/Noël.

## Défaut et comportement reçu

Une tâche pouvait être déclarée terminée avant l’écriture des versions et
leur rangement dans le coffre. Une panne tardive laissait alors une tâche
terminale incomplète que le rejeu ne réparait pas.

Le correctif étend les contrats existants : `GenerativeTask`, `AssetVersion`,
`BrandAsset` et le reçu de coût. Le résultat est enregistré avant l’admission,
puis versions, coffre, coût déclaré et état terminé sont validés ensemble.
Un échec annule l’admission et conserve le résultat pour reprendre. Les appels
concurrents retrouvent les mêmes identifiants ; un actif archivé reste archivé.
La portée marque/équipe/campagne/brief/source est contrôlée pour les références
présentes, sans inventer celles absentes. Aucun modèle, service, outil ou Intent
supplémentaire n’est introduit.

Le webhook authentifié et la réconciliation synchrone passent par l’Intent
existant. Les futures tâches utilisent leur émission parent réelle ; aucune
émission historique n’est reconstruite.

## Preuves bornées

- [Source 2a296152](https://github.com/xtincell/ADVE-project/commit/2a2961522b20c41a98f385ea47fe278235256cf5).
  [CI 37850685120](https://github.com/xtincell/ADVE-project/actions/runs/37850685120) :
  4 144 unitaires et 219 PostgreSQL verts. Les 24 cas d’admission sont inclus
  dans les 219 ; dix contre-exemples initiaux étaient rouges avant correction.
  La suite locale de gouvernance compte 1 610 cas verts ; zéro cycle,
  lint sans erreur et 24 warnings préexistants.
- HTTP sur serveur local réel : refus 400/403/400 ; une panne de coffre injectée
  rend 500 et conserve le résultat, sans version, actif ou coût admis. Après
  arrêt puis lancement d’un nouveau processus, retry et replay rendent 200,
  le même corps et les mêmes identifiants. Une version, un actif et un reçu de
  coût ; chaîne d’émissions FAILED → OK → OK vérifiée. Résultat synthétique déjà
  enregistré, zéro appel fournisseur, fixture nettoyée et serveur arrêté.
- [Image 37850690058](https://github.com/xtincell/ADVE-project/actions/runs/37850690058) :
  démarrage sur base neuve, `/login` 200 et relecture d’un PDF de deux pages
  avant publication. La configuration publiée correspond à celle démarrée.
  Index `sha256:73b98b427ccb4ed0d39e9e4349cd5b27d14c46cee3e59be6a7883e6f0b977bca`.
- Déploiement unique terminé à 22:14:28 UTC le 8 octobre. Conteneur exact,
  version publique 6.27.425, utilisateur `nextjs` et volume de médias privé
  conservé. En production, lecture du webhook 200, requête incomplète 400 et
  tâche/secret fictifs 403 ; aucune fixture métier ni forge déclenchée.
- Corpus rapproché avant/après : 12 sources, 40 piliers, deux usages partagés,
  256 actifs, 108 fragments de sources, 2 431 reçus de coût et 19 processus
  inchangés. Zéro tâche Ptah et zéro version forgée observées en production
  avant et après : aucun historique réel de forge réparé.
- L’édition publique SPAWT choisie reste la version 1, empreinte inchangée,
  lue avec CORS exact sur ses trois origines ; ETag 304 et export privé 401.
  La vitrine principale est relue nativement : six questions annoncées et aucun
  décompte expiré. Voir [la réception SPAWT](RECEPTION-CORPUS-SPAWT.md).

Les reçus détaillés et fixtures restent dans le dossier d’audit privé ; aucune
pièce client, valeur de secret ou donnée de marque privée n’est redistribuée.

[Documentation de réception 411087b6](https://github.com/xtincell/ADVE-project/commit/411087b6)
actualisée séparément : diff applicatif vide avec la source de l’image,
contrôles locaux verts et aucun redéploiement pour ce seul reçu documentaire.

## Complément reçu — livraison commune 426 et 427

La Fusée **6.27.427** conserve les références campagne, brief et actif source
présentes à l’entrée jusqu’à la tâche de production. Leur portée est contrôlée
avant fournisseur et admission. La régénération refuse aussi une tâche historique
de portée différente avant tout appel fournisseur. Les entrées existantes MCP,
tRPC, séquence et Oracle sont étendues, sans nouveau modèle, service ou Intent.

La demande manuelle Oracle persistait une tâche différée puis rendait HTTP 500 :
sa post-condition attendait une sortie racine et excluait DEFERRED. Le contrat
reconnaît désormais la racine ou l’enveloppe Intent OK et admet DEFERRED, sans
accepter les enveloppes refusées ou une tâche déjà terminée. Après redémarrage
local, cette route rend HTTP 200/Intent OK/DEFERRED, avec les mêmes références
métier et sa véritable émission enfant. Ce reçu n’est pas celui du bouton natif.

- [Source 919cebb4](https://github.com/xtincell/ADVE-project/commit/919cebb49fcfc5f5599ccd3dab5101b7b9f62d0e),
  [CI 37856242347](https://github.com/xtincell/ADVE-project/actions/runs/37856242347) :
  4 151 unitaires et 230 PostgreSQL verts. Les 35 cas ciblés de filiation sont
  inclus dans les 230 ; neuf contre-exemples initiaux étaient rouges. Le contrat
  de résultat compte 11 cas verts, après deux rouges initiaux. Gouvernance locale :
  1 610 verts, types/lint sans erreur, 24 warnings préexistants et zéro cycle.
- MCP discovery/catalogue/appel et tRPC reçus sur fixtures locales ; refus de
  source étrangère, réconciliation et rejeu stables. Zéro appel fournisseur.
  Le descripteur distingue l’admission en base des octets durables encore absents.
- [Image 37856486468](https://github.com/xtincell/ADVE-project/actions/runs/37856486468) :
  base neuve, `/login` 200 et PDF relu avant publication ; configuration publiée
  identique à celle démarrée. Index
  `sha256:4a88ee5d9914ab389981dc24f0515178f7ae7ed2949362c036a365bd5686af14`.
  Déploiement unique terminé le 8 octobre à 23:06:42 UTC ; version publique 427,
  conteneur exact, utilisateur nextjs et volume privé RW conservés.
- Lectures/refus de production 200/400/403 ; corpus rapproché inchangé et toujours
  zéro tâche/version de forge. Édition SPAWT v1 et empreinte conservées, CORS exact
  trois origines, ETag 304 et export privé 401. Connexions rechargée/hydratée
  nativement : version 427 et édition v1, aucune saisie ou production déclenchée.

426 n’a pas été déployée seule. Les preuves détaillées restent privées dans
`preuves-filiation-forge-426/` et `preuves-sortie-forge-427/`. La présence des
trois références ne reçoit pas une provenance documentaire complète.

## Demande manuelle et garde reçues — 9 octobre, version 428

L’Oracle distingue la demande acceptée de sa production. DEFERRED affiche
« En attente de configuration », aucune production démarrée et demande conservée.
Le contrôle partage OperatorSurface et la garde de route existants. La recette
a révélé qu’un membre de la même équipe était refusé : la session ne porte pas
operatorId. Le chokepoint relit désormais le rattachement courant avant l’accès
à la marque et l’émission ; un rattachement JWT périmé est refusé.

- [Source cdd9f6c0](https://github.com/xtincell/ADVE-project/commit/cdd9f6c01423bdfb8b9da37240c5f9fcb8bef5e4),
  [CI 37862693091](https://github.com/xtincell/ADVE-project/actions/runs/37862693091) :
  4 167 unitaires et 230 PostgreSQL verts ; gouvernance locale 1 617, zéro erreur,
  24 warnings préexistants et zéro cycle. UI : huit rouges puis neuf verts ;
  garde de contexte : deux rouges puis sept verts, plus cinq contrôles ownership.
- Bouton natif sur fixtures locales : opérateur refusé sans effet avant patch,
  puis HTTP 200/Intent OK/DEFERRED, une tâche et deux émissions, zéro version/coût/
  appel fournisseur. Founder sans commande et HTTP 403 direct, sans nouvel effet.
  Fenêtres de recette sans réponse >=500 ni exception ; fixtures nettoyées.
  Ces préconditions synthétiques ne valident aucun noyau de marque réel.
- [Image 37862922982](https://github.com/xtincell/ADVE-project/actions/runs/37862922982) :
  démarrage sur base neuve, connexion 200 et PDF de deux pages relu. Configuration
  candidate/publiée identique ; index
  `sha256:dd0b929865341017fb3a64ead096b5953f672bbd385051c1998e9b1e2b13f973`.
  Déploiement unique terminé le 9 octobre à 00:19:53 UTC ; version 428, conteneur
  exact, utilisateur nextjs et volume privé RW reçus.
- En production : lectures/refus 200/400/403, corpus inchangé, zéro tâche/version
  de forge ; édition SPAWT v1/empreinte, CORS trois origines, ETag 304 et export
  privé 401 conservés. Connexions rechargée et hydratée nativement : version 428
  et édition v1, aucune saisie ou production métier déclenchée.

Preuves privées : `preuves-ux-forge-428/`. La garde et la distinction d’états
sont reçues ; aucune forge réelle SPAWT/Noël, facture ou média n’en découle.

## Ce qui reste à recevoir

L’émission upstream réelle, les lots multi-sources, les reçus documentaires et
l’invalidation après correction restent à recevoir jusqu’au matériau. Le gate
activeBriefId doit contrôler sa relation, son type et son état ; la succession
parentAssetId reste incomplète. Aucun de ces trous n’est comblé par une référence
inventée ou une première source choisie arbitrairement.

Une tâche DEFERRED n’a pas encore de chemin reçu pour reprendre la même tâche
après configuration : la réconciliation attend un résultat fournisseur et ne
lance pas la production. Le chemin réel de configuration et une reprise manuelle
sans double appel doivent être reçus ; aucun redémarrage automatique n’est promis.

Les octets doivent être conservés et relus après expiration de l’URL temporaire,
avec propagation de leur référence durable au coffre. Les adaptateurs Canva/Figma,
la facture fournisseur et la fermeture durable du journal après le commit métier
restent ouverts. Un coût déclaré nul ne démontre pas la gratuité.

Le stress isolé n’a reçu ni pages ni tRPC, et a différé les forges. Ce lot ne reçoit
pas un stress E2E complet, une délégation native complète ou le cycle réel Noël.
Les sept chantiers et dix critères de release restent ouverts. Les 116 fiches
de parcours ont reçu un examen borné ; aucun parcours large n’est pleinement
accepté et aucun pourcentage global n’est déduit de cette livraison.
