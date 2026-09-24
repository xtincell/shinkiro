# La Barre dans Shinkiro

La Barre est le poste de travail du directeur de la création. Dans Shinkiro,
elle tient le passage entre une intention créative et une décision explicite :
ce qui est proposé, ce qui est retenu, ce qui doit revenir et ce qui peut partir
à la production.

[Ouvrir La Barre](https://labarre.powerupgraders.com/) ·
[Consulter son code](https://github.com/xtincell/la-barre)

## Un parcours, quatre responsabilités

| Moment | Responsable | Passage concret |
|---|---|---|
| Cadrer | ADVE / La Fusée | Le diagnostic et la stratégie alimentent le brief. Le transfert reste manuel. |
| Examiner et décider | La Barre | Bureau de revue par pièce, version et projet ; critères, retours et verdicts. |
| Organiser l'exécution | Radar / Galahad | Le registre Radar peut être consulté dans La Barre. Aucun envoi automatique de décisions vers `task_events` n'est livré. |
| Apprendre | Argos / ADVE | Les références et le bilan nourrissent la prochaine campagne. La boucle de retour automatique reste à construire. |

La cohérence du programme vient du partage des responsabilités. La Barre ne
refait ni le diagnostic ADVE, ni le suivi de tâches Radar, ni la bibliothèque
Argos. Elle porte le jugement créatif et conserve le contexte de ce jugement.

## Le parcours du directeur de la création

Le **Bureau** présente une pièce à la fois, avec son projet, sa version, son
responsable, l'échéance et un accès au brief. Une intention sans image reste
identifiée comme telle. Un filtre permet de se concentrer sur un projet.

Les **Décisions** regroupent les retours client, arbitrages, responsabilités et
engagements. Chaque retour client conserve son propre verbatim et les seuls
livrables touchés par sa portée. Le nombre de sujets ne doit pas être lu comme
un nombre de livrables uniques : deux retours peuvent viser la même pièce.

Les projets gardent leurs parcours détaillés : brief, stratégie, pistes, KV,
déclinaisons, présentation et livraison. Une route retenue ne remplace pas un
BAT ; une validation sur une version ne valide pas automatiquement la suivante.

## Autonome, et présent dans la suite

Le code et les données restent dans le périmètre de La Barre. Le portail
Shinkiro référence le produit et expose son rôle ; il ne l'embarque pas dans
une iframe et ne crée pas de copie de sa base. La Barre renvoie vers Shinkiro
par un lien configurable dans `MAISON.suite`.

Le stockage de travail est celui du navigateur ou du serveur local configuré.
L'export JSON reste la sauvegarde transportable. Un lien entre produits n'est
ni une synchronisation, ni une authentification commune.

## Ce que le portfolio démontre

Folio Spark reste le portfolio personnel d'Alexandre Djengue, hors flotte.
Le cas La Barre démontre la conception d'un outil de direction créative et
son articulation dans Shinkiro : compréhension du métier, architecture de
l'information, interaction et implémentation.

Les retours qualitatifs à l'origine de la refonte sont un signal de conception,
pas une mesure d'impact. Aucun gain de temps, taux d'adoption ou résultat
commercial n'est revendiqué sans mesure. Les captures publiques doivent venir
d'un jeu de démonstration, sans importer les dossiers de travail de l'agence.

## Validation à mener avec les DC

- Trouver une pièce, identifier son projet et consulter son brief.
- Rendre un verdict motivé sur la bonne version, puis retrouver sa trace.
- Traiter deux retours distincts sur une même pièce sans additionner leurs impacts.
- Retrouver un dossier et reprendre le travail après rechargement.
- Exporter son travail et comprendre ce qui est effectivement sauvegardé.

La refonte doit être évaluée sur ces gestes avant de revendiquer une amélioration
mesurée de l'UX. Sa disponibilité publique dépend de la publication des changements
dans le dépôt La Barre ; le lien du produit peut encore montrer la version précédente.
