# Série SHK — décisions de flotte

Une seconde série d'ADR, à côté des 192 d'ADVE-project. C'est un risque assumé :
les séries parallèles meurent, l'une prend le pas et l'autre se fossilise. Deux
règles la maintiennent en vie.

## Règle 1 — elle ne gouverne qu'entre composants

Une décision interne à un composant reste chez lui. `ADVE-project` garde sa série
`ADR-NNNN` sous `docs/governance/adr/`, et rien ici ne la remplace.

`SHK-` n'arbitre que ce qu'aucun dépôt ne peut trancher seul : le partage d'une
source entre deux composants, le rang d'un composant dans le programme, la
frontière entre ce qui est référencé et ce qui est versé.

Le préfixe existe pour qu'aucune collision de numéro ne soit possible : `SHK-0001`
et `ADR-0001` ne se confondent pas, même cités hors contexte.

## Règle 2 — l'audit la lit

Toute ADR `Accepted` qui énonce une règle vérifiable déclare un **signal d'audit**,
et ce signal existe dans `galahad/engine/skills/audit-fleet.json`.

    ## Signal d'audit
    `id-du-signal` — ce qui est attendu, et ce qui constitue une violation.

Une ADR sans signal est une ADR que personne ne vérifie : l'audit la signale comme
telle. Une décision qu'aucun contrôle ne défend n'a pas d'effet, et vaut mieux
écrite nulle part qu'écrite et ignorée — c'est ainsi qu'on obtient un document qui
affirme le contraire de la réalité.

Une ADR peut légitimement n'avoir aucun signal — elle porte alors `Signal d'audit :
aucun`, et dit pourquoi. C'est une déclaration, pas un oubli.

## Forme

`docs/adr/SHK-NNNN-slug.md`, numéros attribués dans l'ordre, jamais réutilisés.

    # SHK-NNNN — Titre

    - **Statut** : Proposed | Accepted | Superseded by SHK-NNNN
    - **Date** : AAAA-MM-JJ
    - **Composants** : ceux que la décision engage

    ## Contexte      ce qui a été constaté, avec de quoi le recouper
    ## Décision      ce qui est tranché
    ## Signal d'audit  comment on vérifie que ça tient
    ## Portée        ce que la décision ne dit pas

## Index

| ADR | Objet | Statut |
|---|---|---|
| [SHK-0001](SHK-0001-programme-et-deux-etages.md) | Le programme, et ses deux étages | Accepted |
