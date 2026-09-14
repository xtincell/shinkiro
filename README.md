# Shinkiro

**Le programme qui unifie la méthode, l'entreprise, l'exécution et les outils.**

Construit par [UPgraders](https://github.com/xtincell). Anciennement désigné « Galahad 360 »,
renommé pour lever une ambiguïté coûteuse.

---

## À ne pas confondre

| Nom | Ce que c'est |
|---|---|
| **Shinkiro** | Le **programme**. Unifie l'ensemble des projets et technologies, ADVE compris. |
| [`galahad`](https://github.com/xtincell/galahad) | Un **produit** : l'équipe d'agents LLM auto-hébergée sur un VPS. Une brique de Shinkiro. |
| **ADVE** | La **méthode** propriétaire. La couche décisionnelle au-dessus du programme. |

Le premier contient les deux autres. Ce n'est pas un synonyme — et c'est précisément la
confusion qui a motivé le renommage.

---

## La thèse

> Aucune structure de classe mondiale ne sert correctement le marché créatif en Afrique
> francophone. Les groupes internationaux maintiennent des bureaux à Abidjan, Douala,
> Dakar — des boîtes aux lettres. Leurs méthodologies restent à Paris ou Londres. Le client
> africain reçoit un service de tier 3 au prix du tier 1. Les agences locales ont du talent,
> de l'intuition, de la débrouillardise. Mais rien de codifié, rien de reproductible, rien
> de mesurable. Chaque projet est un artisanat. C'est ce qui empêche le marché de scaler.

Shinkiro **industrialise** la chaîne de valeur créative — du brief au livrable, du
diagnostic au paiement.

**ADVE est la courroie.** Elle a cessé d'être un produit posé à côté du business pour
devenir la couche décisionnelle au-dessus : elle dit quoi construire et pourquoi ; les
couches en dessous disent comment.

```
                        ┌──────────────────────────┐
                        │           ADVE           │
                        │ méthode · courroie · moat│
                        └────────────┬─────────────┘
                                     │
              DIAGNOSTIC → SCORE DE MATURITÉ 0-5 → PLAN DE TRANSFORMATION
                                     │
     ┌───────────────┬───────────────┼───────────────┬───────────────┐
     ▼               ▼                               ▼               ▼
 ┌────────┐    ┌────────────┐                  ┌───────────┐  ┌──────────────┐
 │   01   │    │     02     │                  │    03     │  │      04      │
 │MÉTHODE │    │ ENTREPRISE │                  │ EXÉCUTION │  │ OUTILS MÉTIER│
 │La Fusée│    │ UPgraders  │                  │  galahad  │  │   La Barre   │
 │  ADVE  │    │            │                  │agents·VPS │  │    Argos     │
 └───┬────┘    └────────────┘                  └───────────┘  └──────────────┘
     │
     └──────────────► BOUCLE D'APPRENTISSAGE ──────────────► retour vers ADVE
```

---

## Les quatre couches

### 01 · Méthode — la propriété intellectuelle

| Dépôt | Rôle |
|---|---|
| [`ADVE-project`](https://github.com/xtincell/ADVE-project) | **Canonique.** La Fusée v6.19 — Industry OS du marché créatif africain. Un brief entre en PDF, le diagnostic tombe en 15 min, la stratégie est écrite sous 48 h. Modules Neteru (7/7 actifs), Oracle, APOGEE, gouvernance Thot. |
| [`la-fusee-blueprint`](https://github.com/xtincell/la-fusee-blueprint) | Atlas doctrinal — la doctrine, pas le code. |

### 02 · Entreprise — la couche qui parle au marché

| Dépôt | Rôle |
|---|---|
| [`galahad-landing`](https://github.com/xtincell/galahad-landing) | Page publique. |

> UPgraders utilise ADVE pour identifier les transformations créatives à plus forte valeur,
> puis construit les systèmes qui permettent de les exécuter à grande échelle.

### 03 · Exécution — agents et infrastructure

| Dépôt | Rôle |
|---|---|
| [`galahad`](https://github.com/xtincell/galahad) | **Canonique.** Équipe d'agents LLM coordonnés sur un seul VPS, pilotée depuis Telegram, agnostique au fournisseur. Zéro build, zéro port entrant, MIT. |
| [`talos`](https://github.com/xtincell/talos) | Rôle **Guardian** — patrouille santé et QA code. |
| [`hulysse`](https://github.com/xtincell/hulysse) | Rôle **Traveler** — explorateur autonome, bâtisseur de nuit. |
| [`danmem`](https://github.com/xtincell/danmem) | Couche mémoire — peers, deriver, dialectique. |
| [`radar`](https://github.com/xtincell/radar) | Tracker de tâches auto-hébergeable. **Reste autonome** : c'est sa valeur. |

Les trois rôles sont décrits dans `galahad/engine/roles/{chef,guardian,traveler}.md`.

### 04 · Outils métier — ce qui démontre le positionnement

| Dépôt | Rôle |
|---|---|
| [`la-barre`](https://github.com/xtincell/la-barre) | **Pièce maîtresse.** Le poste de travail du directeur de la création : du brief au livrable, et les talents qui les font. Aucun serveur, aucun compte. |
| [`Argos-studio`](https://github.com/xtincell/Argos-studio) | La plus grande bibliothèque qualifiée de campagnes. Socle du Content Performance Loop. |
| [`charadesign-generator`](https://github.com/xtincell/charadesign-generator) | Pipeline LSI-CD v3.4 — de l'archétype triangulé à la sortie multi-vues. |

Un directeur de la création qui construit l'outil de son propre métier n'a pas besoin
d'argumenter qu'il connaît le process : il le montre.

---

## Outils versés

Outils légers, chacun dans son dépôt et monté en submodule sous `tools/`.

| Dépôt | Rôle |
|---|---|
| [`indice-maturite`](https://github.com/xtincell/indice-maturite) | **Produit 00 du portefeuille** — le diagnostic d'entrée gratuit. Seize questions, quatre axes, score 0-5, prescription. [En ligne](https://xtincell.github.io/indice-maturite/). |
| [`market-expansion-system`](https://github.com/xtincell/market-expansion-system) | **Produit 04** — décliner une campagne d'un marché à N marchés sans perdre la marque. Preuve terrain sur **neuf pays**, bascule de marque et de langue au Ghana. Inclut la matrice de déploiement et les gabarits de cadrage. |
| [`generateur-approches`](https://github.com/xtincell/generateur-approches) | Générateur d'approches publicitaires, sans API ni dépendance. |
| [`character-engine`](https://github.com/xtincell/character-engine) | Moteur à 48 paramètres et règles de direction artistique. |
| [`datacollector`](https://github.com/xtincell/datacollector) | Collecte multi-sources pour l'intelligence marketing. |

---

## Navigation

**Pour construire** — commence par là, dans cet ordre :

- [`fleet.yml`](fleet.yml) — le manifeste des dix-sept composants. `make clone-all` matérialise la flotte.
- [`AGENTS.md`](AGENTS.md) — ordre de construction, tests de vie, règles de contribution
- [`docs/MATURITE.md`](docs/MATURITE.md) — ce qui est fini, bouchonné ou aspirationnel. **À lire avant de planifier.**
- [`docs/INTERFACES.md`](docs/INTERFACES.md) — contrats entre composants et inventaire des secrets

**Pour comprendre** :

- [`docs/PORTFOLIO.md`](docs/PORTFOLIO.md) — comment chaque composant sert les sept produits commerciaux
- [`docs/CLOISON.md`](docs/CLOISON.md) — ce qui n'appartient pas à Shinkiro, et pourquoi

Les dépôts du programme portent le topic [`shinkiro`](https://github.com/search?q=user%3Axtincell+topic%3Ashinkiro&type=repositories),
plus un topic de couche : `layer-method`, `layer-company`, `layer-execution`, `layer-tools`.
