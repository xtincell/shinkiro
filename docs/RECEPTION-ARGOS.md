# Argos — réception partielle, 7 octobre 2026

Argos qualifie la mémoire externe de ce qui a été fait : opérations, actifs,
axes de lecture, filiations, annotations et preuves attribuées. Sa valeur est
autonome, conformément à SHK-0002. La Fusée porte le contexte privé de la marque
et la décision d'employer une référence. Une campagne de référence ne devient
ni un brief client, ni un droit de réutiliser ses actifs.

Le chemin manuel `research-dossier-v1` ne dépend pas d'un agent. La veille
facultative collecte des signaux candidats ; son JSON n'est pas une admission
éditoriale dans le fonds canonique. Les personas documentés ne prouvent pas
l'exécution de six agents. Les axes et les choix d'actifs conservent des
arbitrages heuristiques, à qualifier avant de les présenter comme une mesure.

La projection HTTPS Fusée → studio existe déjà : intention opérateur, journal
PASS avec reviewer, sources du journal, périmètre et empreinte contrôlés.
Le reçu HTTP distant reste distinct du PASS local. Cette inspection ne reçoit
ni les credentials réels, ni la projection distante, ni le retour de résultats.
La lecture Fusée encore portée par son dossier interne reste à faire converger.

## Corrections éprouvées

- [Dossier manuel, PR #1](https://github.com/xtincell/Argos-studio/pull/1) :
  citations/URL conservées, champs retirés corrigés, filiation atomique et
  collision refusées, contact privé exclu du DTO, seed conservateur. Onze tests
  sur leur propre SQLite, défauts principaux reproduits avant correction.
- [Veille, PR #2](https://github.com/xtincell/Argos-studio/pull/2) : pas de fixture
  à la place d'une source vivante indisponible ; panne partielle conservant les
  autres observations ; opérations distinctes sous une même ombrelle ; mesures
  de sources/dates/valeurs distinctes ; option inconnue refusée avant le mode
  payant. Dix tests sans réseau/LLM payant, typecheck et CI workers reçus.
- [App, PR #3](https://github.com/xtincell/Argos-studio/pull/3) : lint complet
  fermé sans règle réduite ; quatorze
  tests dont JSON-LD contenant un terminateur de script, avec JSON intact et
  aucune injection d'élément. Dialogue/recherche/séparateur sémantiques et clés
  de preuve stables ; aucune recette native déduite de ces contrôles.

Les trois PRs restent en brouillon. Le lint app des deux premiers commits
reste historiquement rouge ; la CI du lot intégré 31cb881 reçoit intégrité,
build et workers. La convention du studio exige une CI verte et un reviewer
avant fusion. Aucun reset de base
opérateur, aucun brief client importé, aucun appel payant ni déploiement.

## Conditions encore ouvertes

Les quatre parcours larges restent ouverts : collecte, recherche, lecture/
correction, composition/transfert. Authentifier et autoriser le POST et l'admin ;
recevoir le namespace privé annoncé mais absent du modèle de consultation ;
stocker preuve/licence par actif ; protéger un amendement concurrent ; qualifier
les scores sans métrique et les contenus de démonstration. Recevoir ensuite les
erreurs, le focus/clavier/mobile, la fraîcheur et la projection canonique réelle.
La collecte vivante nécessite aussi la sécurité des URL et les quotas. Un
résultat vide n'est pas une preuve de couverture complète d'une source.

Les preuves détaillées restent dans l'audit privé
`audit-shinkiro-2026-09-25/release/preuves-argos/` ; aucun contenu client n'est
versé dans cette documentation du programme.
