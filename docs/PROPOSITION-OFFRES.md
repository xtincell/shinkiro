# Proposition — Content Operations, Content Velocity System, grille tarifaire

> **À valider par le propriétaire.** Rédigée le 12 novembre 2026 (arbitrage 5.13). Ce document
> propose des critères et un modèle ; il n'engage rien tant qu'il n'est pas validé. Il ne
> s'appuie que sur ce que les outils savent faire aujourd'hui, et il dit ce qui reste à mesurer.
> Aucun chiffre de résultat n'y est promis.

Le [portefeuille](PORTFOLIO.md) laisse trois trous : les critères d'acceptation de **Content
Operations** (produit 05), le modèle opératoire du **Content Velocity System** (produit 04) et
la validation de la **grille tarifaire**. Les voici, proposés.

---

## 1. Content Operations — critères d'acceptation

**Ce que le client achète.** Une production continue, suivie, sans que le dirigeant ait à
tout porter. Il la pilote depuis l'écran Direction et Telegram (`galahad`), et chaque
événement est journalisé dans Radar.

**Principe.** Un critère n'est recevable que s'il se lit dans les données. Les seuils ne sont
pas fixés à l'avance : ils partent de la **baseline**, c'est-à-dire du premier mois mesuré
chez le client. On s'engage sur une amélioration par rapport à son point de départ, pas sur
un chiffre de marché.

### Critères mensuels proposés

| # | Critère | Comment il se lit | Seuil proposé |
|---|---|---|---|
| C1 | Toute demande reçue est suivie | Radar : chaque demande a un dossier, un responsable et une échéance | 100 % des demandes reçues par les canaux convenus, dossier ouvert sous 1 jour ouvré |
| C2 | Les retours clients deviennent des tâches vérifiables | `galahad` : retour découpé en tâches ; texte brut gardé si la lecture automatique échoue | 100 % des retours conservés ; aucune tâche fermée sans vérification humaine |
| C3 | Ponctualité | Radar : `closed_at` avant `deadline` | Supérieure ou égale à la baseline dès le 2ᵉ mois, cible d'amélioration fixée au cadrage |
| C4 | Durée d'un dossier | Radar : de `created` à `closed`, par dossier | Médiane inférieure ou égale à la baseline dès le 3ᵉ mois |
| C5 | Qualité du premier jet | La Barre : taux de reprise des versions, tours au-delà du vendu | Inférieurs ou égaux à la baseline ; tout tour au-delà du vendu est signalé avant d'être produit |
| C6 | Stabilité | Radar : réouvertures, réattributions, reports d'échéance | En baisse par rapport à la baseline, ou expliqués dans le relevé |
| C7 | Rien d'engageant sans accord | Journal `galahad` : action risquée, payante ou livrée à un tiers précédée d'un « oui » tracé | 100 % ; une seule exception non tracée est un manquement |
| C8 | Relevé mensuel livré | Le relevé lit C1 à C7 dans les données, il ne se rédige pas | Livré avant le 5 du mois suivant |

**Ce qui fait échouer la réception.** C1, C2 ou C7 non tenus, ou C8 non livré. C3 à C6 se
jugent en tendance et s'expliquent dans le relevé.

**Ce qui n'est pas promis.** Un résultat commercial du client, une décision à sa place, une
disponibilité de service non écrite au cadrage (voir la page publique, section « Ce que nous
ne promettons pas »).

**Ce qui manque pour tenir ces critères.**
- Le relevé avant/après est calculé par Radar depuis le 12 novembre (`/mesure/avant-apres`).
  Il couvre C3, C4 et C6. Le taux de reprise et les tours au-delà du vendu (C5) restent
  dans La Barre : le relevé mensuel doit encore les y lire.
- L'écran Direction doit lire Radar pour afficher C3 et C4. Il ne le fait pas encore.

---

## 2. Content Velocity System — modèle opératoire

**Ce que le client achète.** Plus de contenus validés par semaine, sur plus de marchés, sans
plus de réunions. C'est un **système installé**, pas un abonnement.

### La chaîne

1. **Cadrer** (La Barre, Market Expansion System). Plateforme, liste des marchés, écarts
   déclarés par couple projet × marché, avant le premier crayon.
2. **Concevoir le master** (La Barre). Une seule big idea, produite dans le format le plus
   contraint.
3. **Valider le master** (La Barre, décision tracée). Un seul aller-retour client. Aucune
   variante avant cette validation.
4. **Décliner** (La Barre, `galahad`). D'abord les variantes marché, puis les formats.
   Une adaptation hors de son écart déclaré est signalée à la revue.
5. **Bon à tirer** (La Barre). La décision est datée et attribuée, puis lue par Radar.
6. **Mesurer** (Radar). Durée brief → BAT, reprises, tours au-delà du vendu.

### Rôles

| Rôle | Qui | Ce qu'il fait |
|---|---|---|
| Directeur de création | Humain, agence | Arbitre la big idea et valide le master |
| Coordinateur | `galahad`, rôle chef | Suit les demandes, découpe les retours, relance |
| Production | Humains, avec les outils de La Fusée | Produit le master et les variantes |
| Gardien | `galahad`, rôle guardian | Surveille le serveur et l'installation |
| Client | Humain | Valide le master et le BAT ; ses retours entrent par les canaux convenus |

### La mesure de la vélocité

- **Vélocité** : nombre de contenus parvenus au BAT par semaine, par marché.
- **Délai** : médiane brief → BAT.
- **Qualité** : taux de reprise et tours au-delà du vendu.

La baseline est le mois qui précède l'installation, quand les données existent. Sinon, c'est
le premier mois d'usage. La bascule est le jour où Radar commence à lire La Barre (arbitrage
5.6).

**Ce qui manque.** L'assemblage technique La Barre + `galahad` sur une installation
d'entreprise n'a pas de recette jouée de bout en bout. Le profil d'installation porte Radar
et la mémoire, pas encore La Barre.

---

## 3. Grille tarifaire — méthode de validation

La grille du portefeuille reste une **grille de positionnement**. On ne la change pas sans
données. Voici comment la valider.

### Ce que coûte un mois de Content Operations

| Poste | Où il se lit |
|---|---|
| Serveur dédié (part du VPS ou serveur propre) | Facture de l'hébergeur |
| Fournisseur d'IA | Journal de coûts de La Fusée (`AICostLog`) et compte du fournisseur ; aujourd'hui partiel, pas une facture |
| Heures humaines (coordination, production, revue) | Radar : temps des dossiers ; feuille de temps tant que Radar ne suffit pas |
| Mise en place (amortie) | Heures du cadrage et de l'installation, réparties sur 12 mois |

### Les trois étapes

1. **Mesurer deux pilotes réels** pendant trois mois : coûts ci-dessus, volume produit,
   critères C1 à C8.
2. **Calculer le coût par contenu parvenu au BAT** et la marge obtenue à 900 K FCFA/mois,
   puis à 3 M FCFA/mois.
3. **Fixer la grille** : un plancher qui couvre le coût réel avec la marge visée, et des
   paliers liés au volume et au nombre de marchés, pas au nombre d'outils.

**Ce qui doit être décidé par le propriétaire.**
- La marge visée.
- Le volume inclus par palier.
- Le prix d'un marché supplémentaire.
- Si le fournisseur d'IA est inclus ou refacturé.

---

## Ce que ce document ne fait pas

- Il ne publie aucun prix nouveau. La page publique de `galahad` garde la fourchette
  existante, « à partir de 900 K FCFA par mois ».
- Il ne promet aucun résultat chiffré au client.
- Il ne remplace pas les deux pilotes : sans eux, la grille reste une hypothèse.
