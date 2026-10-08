# Radar — autorité des tâches protégées, 8 octobre 2026

Le filtre du rôle membre existait dans l’interface, mais l’API permettait de lire
et de se réattribuer une tâche étrangère. Les médias, commentaires et imports
n’appliquaient pas ce contrat. Deux contre-exemples HTTP initiaux ont été
complétés par neuf cas rouges, une URL RH encodée et une réutilisation de code.

Les [PR #4](https://github.com/xtincell/radar/pull/4) et
[PR #5](https://github.com/xtincell/radar/pull/5) sont intégrées au canon
`2e8d92f3c7a686332df7db3de870f6312f93f736`. La même autorité s’applique aux tâches,
commentaires, journal, médias, CSV et contexte de l’import. Co-responsable exact,
mois courant de l’instance et travail ouvert sans date suivent le contrat de
l’interface. Les lots refusés ne produisent aucune écriture partielle. Une
transmission de son propre travail reste possible ; l’écran recharge son
périmètre après réception. L’accès machine complet explicite est conservé.

Les nouveaux commentaires/médias sont liés à l’identifiant stable du dossier ;
réutiliser son code ne transfère plus ses pièces. Les nouveaux événements
conservent leur qualification de rôle. Aucun historique n’est requalifié à
partir d’un état actuel : anciens événements et rattachements restent conservés,
mais leur provenance complète est encore à recevoir.

Réception : 34 scénarios HTTP sur PostgreSQL jetable, sans saut ; CI exacte du
canon [37819560263](https://github.com/xtincell/radar/actions/runs/37819560263)
verte. Verrou concurrent réel, imports concurrents, refus atomiques et
redémarrage reçus. Trois identités synthétiques dans les écrans existants :
portées membre/superviseur/owner, clôture manuelle et transmission, puis retrait
de la ligne sans rechargement manuel. Le journal de 126 requêtes conserve ses
404 de ressources de fixture absentes ; aucune assertion de réseau sans erreur.

Radar personnel livré à 17:52:19 UTC : douze fichiers servis conformes, trois
colonnes de qualification présentes. Empreintes avant/après des 77 tâches,
125 événements, quatre commentaires, zéro média et du stockage persistant
identiques. Aucune écriture métier de production. Cette instance ne possède
qu’un rôle owner, en timezone UTC ; elle ne prouve pas les trois rôles réels.

L’installation Matanga a reçu une adaptation distincte dans la
[PR #59](https://github.com/xtincell/Matanga-Creative-dashboard/pull/59), canon
`97c8d309a281bf2cee916645f300a41c0dfa2648`. Le contrat est factorisé dans son
`brief-access.js` existant ; roster, RH/admin, favoris, admission La Barre et
transactions du portail sont conservés. Les rôles des visuels, créneaux,
retrait d’accord après révision et refus des codes ambigus restent éprouvés.
Les liens du portail sont réservés à la direction jusque dans REST.

Dix-neuf contre-exemples rouges deviennent verts ; réception finale de 69 tests,
dont les 18 cas d’admission La Barre et les raccords front. CI du canon
[37822722523](https://github.com/xtincell/Matanga-Creative-dashboard/actions/runs/37822722523)
verte. Recette native sur base isolée : trois rôles, confidentialité, clôture
persistée et journalisée avec compteur 3→2 sans rechargement, panne explicite sans
exemples de kit. La coche personnelle de « Ma journée » reste distincte de cette
clôture métier dans « Tâches » ; sa cohérence reste à traiter.

L’autodéploiement Matanga est terminé à 18:15:12 UTC. Dix-sept fichiers du runtime
correspondent au code reçu ; les trois colonnes nullable sont présentes, sans
requalification historique. Les lectures HTTP des trois rôles réels sont reçues :
le compte membre contrôlé reçoit 18 tâches autorisées, contre 473 auparavant.
Empreintes identiques des onze tables suivies, hors seules colonnes ajoutées,
et du stockage persistant : 474 tâches, 996 événements, 21 médias et trois
commentaires. Aucun dossier réel modifié par la recette ; aucune demande de
redéploiement manuel supplémentaire.

Le CSV et les fiches wiki sont désormais des projections de la base autorisée ;
les archives Markdown du dépôt ne sont pas une API parallèle. Un document
projet exige un rattachement explicite au dossier accessible. L’ancien historique,
dont 995 événements sans confidentialité qualifiée, et les anciens commentaires
ou médias sans identifiant restent à qualifier ; la compatibilité historique de
la direction et du portail ne prouve pas leur origine. Les gestes client réels,
blocages, dépendances, circulation des décisions, seconde TPE, restauration et
coût complet restent ouverts. Aucun des sept chantiers n’est clôturé.

Preuves privées : `preuves-parcours-radar/` et `preuves-radar-matanga-roles/`.
