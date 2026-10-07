# DataCollector dans le circuit Shinkiro

Réception partielle du 7 octobre 2026, commit main
`d5b8d3ec286d63a7432e3498a64d4c1d94ba49e4`,
[PR #1](https://github.com/xtincell/datacollector/pull/1),
[CI main](https://github.com/xtincell/datacollector/actions/runs/37623623343).

Cette IP acquiert des observations publiques hétérogènes. Elle conserve la
source, la date, le périmètre demandé et l'échec éventuel ; elle ne possède ni
la stratégie ni la décision. Les clés historiques `RISK`/`THREAT` ne valident
pas une menace ou un risque. Des votes Reddit ne sont pas un sentiment.

CLI et HTTP utilisent le même reçu (`batch.py`). Chaque fichier est publié
atomiquement, sans écraser la collecte précédente. Le rejeu identique retrouve
son reçu ; une collision différente échoue. L'interface remet le JSON, en plus
de son export PDF existant. Les valeurs absentes restent absentes et les états
de sources restent visibles, y compris quatre échecs dans un rapport HTTP 200.

Quatorze tests Python et quatre VM Node passent sans réseau fournisseur.
Les défauts sont reproduits avant correction ; concurrence de vingt écritures,
rejeu, panne d'écriture et route Flask sont exercés. Ce n'est pas une preuve
d'hydratation, de téléchargement navigateur ou de réponse fournisseur réelle.

La Fusée possède déjà PageSpeed et Reddit. La convergence doit utiliser son
admission Seshat/KnowledgeEntry et les dossiers Argos selon le sens de la source,
avec identité, version et provenance. Un export JSON ne reçoit pas encore ce
raccord. Aucun second scoreur, écrivain pilier ou agent d'interprétation ajouté.

Restent ouverts : admission métier versionnée, fournisseurs autorisés, interface
native et exports JSON/PDF, règles d'URL/redirection, droits d'entreprise,
restauration et consommation. Le backend Flask de développement reste local,
sans debug ; aucune exposition publique n'est impliquée par cette réception.
