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

L’installation Matanga reste distincte et inchangée par ce lot. Son roster,
portail, administration/RH, favoris, médias et sources La Barre interdisent une
substitution globale par le backend générique. Qualification historique,
propagation métier, autres gestes natifs, seconde TPE, restauration et coût
complet restent ouverts. Les surfaces publiques ont leur contrat propre ; les
règles d’édition du wiki et de configuration ne sont pas reçues ici. Aucun des
sept chantiers n’est clôturé.

Preuves privées : `preuves-parcours-radar/`.
