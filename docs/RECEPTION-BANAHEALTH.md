# BanaHealth — source des coordonnées et maintenance du projet

Réception partielle du 8 octobre 2026. BanaHealth est un projet client : un site
statique bilingue et ses supports de contact, avec un cycle de maintenance
distinct du produit Shinkiro. Le site présente la facilitation des soins, voyages
et séjours ; il ne fournit pas les soins et ne constitue pas un dossier patient.
Les assertions des textes client ne sont pas validées médicalement par cet audit.

Le Shinkiro doit conserver textes autorisés, identité, modifications et version
publiée. Un agent autonome et une copie de données médicales ne sont nécessaires
à aucun des parcours examinés. L'édition demeure dans les fichiers ; les droits
client, le raccord de marque et la prochaine publication reçue restent ouverts.

## Source unique rendue effective

Le canon initial `ccc66f17` annonçait un fichier commun de coordonnées, mais les
deux pages Contact et les téléphones des signatures en gardaient des recopies.
Le contre-exemple local produit onze observations incorrectes sur seize.
Pied de page, données structurées et adresses des signatures suivaient déjà le
fichier commun : ces voies sont conservées.

[PR #1](https://github.com/xtincell/banahealth/pull/1), canon
`e29f51e38d9279c720a5e452818d4db243918bb0`, CI `37714789222` verte sur `3e0d70a` :
les cartes Contact résolvent leurs valeurs depuis le YAML existant, les signatures
référencent un téléphone par identifiant stable et leurs personnes sont éditables
dans ce même fichier. Repère inconnu, référence absente et ambiguïté sont refusés.
Aucun nouveau service, agent, écran ou collecte. Le guide précise compilation,
publication et réinstallation des signatures ; les messageries installées ne
se mettent pas à jour automatiquement.

Neuf tests, dont compilation d'une copie temporaire modifiée et génération des
deux formats de signature. Le contre-exemple reçoit ensuite seize observations
correctes. Les deux HTML Contact sont identiques octet pour octet à leur version
précédente ; les seize corps Markdown anglais sont conservés. La CI vérifie aussi
que les signatures générées ne diffèrent pas des fichiers enregistrés.

## Site et limites reçus

34 routes publiques répondent 200, langue et canonical corrects, avec un HTML
identique octet pour octet à la compilation corrigée. Les 35 HTML générés
comprennent la 404. Aucune republication d'octets identiques ni opération SFTP.
Cette preuve ne reçoit ni la prochaine mise à jour, ni son retour arrière.

Consultation native FR → EN → Contact EN → Contact FR reçue, puis menu responsive
vers Contact à 390 pixels, sans débordement horizontal observé. Liens mail et
téléphones lus seulement ; aucun message, appel ou dossier médical transmis.
Le checkout BanaHealth déjà modifié est conservé intact ; travail effectué dans
une copie séparée du canon. L'atelier de design local n'est pas déclaré publié.

Restent : revue visuelle/accessibilité complète, fidélité historique intégrale,
accès et chemin de l'éditeur client, rattachement marque/projet, installation des
signatures, prochaine publication et restauration, coûts de maintenance mesurés.
Les quatre parcours passent de non audités à examinés partiellement ; aucun
parcours large ni gate close. État courant : **100 parcours examinés partiellement
sur 116, 16 non audités, zéro parcours large pleinement reçu**. Les sept chantiers
et dix gates restent ouverts.

Rapport opérateur privé : `release/AUDIT-BANAHEALTH.md` et
`release/preuves-banahealth/` dans le dossier d'audit. Aucun corpus client,
secret, sauvegarde compromise ou dossier patient n'est publié avec ce relevé.
