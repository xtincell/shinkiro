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

## Ce qui reste à recevoir

Les références métier et documentaires doivent encore circuler depuis le writer
réel jusqu’au matériau ; une correction de source doit invalider ses dérivés.
La régénération doit refuser une version reliée à une tâche d’une autre portée
avant tout appel fournisseur. Le descripteur MCP doit décrire la frontière réelle
et son exercice natif reste à recevoir.

Les octets doivent être conservés et relus après expiration de l’URL temporaire,
avec propagation de leur référence durable au coffre. Les adaptateurs Canva/Figma,
la facture fournisseur et la fermeture durable du journal après le commit métier
restent ouverts. Un coût déclaré nul ne démontre pas la gratuité.

Le stress isolé n’a reçu ni pages ni tRPC, et a différé les forges. Ce lot ne reçoit
pas un stress E2E complet, une délégation native complète ou le cycle réel Noël.
Les sept chantiers et dix critères de release restent ouverts. Les 116 fiches
de parcours ont reçu un examen borné ; aucun parcours large n’est pleinement
accepté et aucun pourcentage global n’est déduit de cette livraison.
