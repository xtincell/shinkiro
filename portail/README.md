# Le portail

Ce que Shinkiro montre de lui-même : la suite composant par composant, et le
catalogue avec ses livrables.

**Il n'est pas écrit à la main.** Il est généré depuis `fleet.yml`,
`fleet.lock.yml`, `docs/` et `docs/adr/` — parce qu'un portail rédigé à la main
serait faux la semaine suivante, ce qui est exactement la maladie que ce dépôt
combat. Il aurait été absurde de l'introduire par sa propre vitrine.

```bash
node portail/construire.mjs          # régénère site/
node portail/extraire-livrables.mjs  # régénère donnees/livrables.json (nécessite gh)
```

## Ce qui vient d'où

| Page | Source |
|---|---|
| Accueil, La suite, fiches composants | `fleet.yml` + `fleet.lock.yml` |
| Topologie, Anti-dérive, Maturité, Interfaces | `docs/*.md`, rendus tels quels |
| Décisions | `docs/adr/SHK-*.md` |
| Les contrôles | extraits de `scripts/signaux-flotte.mjs` |
| Catalogue, produits | `docs/PORTFOLIO.md` + `produits_portefeuille` de `fleet.yml` |
| Livrables | `portail/donnees/livrables.json`, extrait de trois dépôts |

Tout ce qui est affiché porte son chemin de fichier. Ce qui serait déduit est
marqué comme tel — rien n'est présenté comme établi sans l'être.

## Fraîcheur

`site/` est committé, et `site/source.json` porte l'empreinte SHA-256 des deux
manifestes dont il est issu. Le signal `portail-perime` la recalcule : si elle
diffère, le portail montre un programme qui n'existe plus, et l'audit le dit.

Comparer des dates n'aurait pas suffi — le manifeste peut changer deux fois le
même jour.

## Déploiement

nginx alpine servant `site/`, piloté par Coolify depuis ce sous-dossier. Le site
étant déjà généré, l'image n'a pas besoin du dépôt entier en contexte.
