# État de maturité

Ce que le code fait réellement, par opposition à ce que les README annoncent. À relire avant
toute planification — c'est le document qui évite de construire contre une fiction.

Légende : **produit** = tourne en conditions réelles · **utilisable** = fonctionne, non
éprouvé à l'échelle · **partiel** = des pans manquent · **à qualifier** = documentation
insuffisante pour trancher.

| Composant | État | Ce qui tourne | Ce qui manque |
|---|---|---|---|
| `ADVE-project` (La Fusée) | **produit** | v6.19, cap APOGEE atteint (7/7 Neteru), 192 ADR, 17 workflows, `packages/sdk`, Next.js + Prisma + Playwright + plugin ESLint maison | Le contrôle SLO **n'a jamais mesuré** : la base de prod est injoignable depuis les runners (`ECONNREFUSED`). Correctif de workflow en cours, cause d'infrastructure non résolue. |
| `galahad` | **utilisable** | Moteur ~500 lignes, zéro dépendance npm, trois rôles décrits dans `engine/roles/`, Dockerfile, `install.sh`, MIT | Les rôles sont **documentés mais pas implémentés ici** — ils vivent dans `talos` et `hulysse`. Le monorepo n'est pas fait. |
| `radar` | **utilisable** | API façon PostgREST, schéma `briefs`/`clients`/`client_markets`/`task_events`/`comments`, flux RSS et JSON, ingestion LLM local, écran Direction, trois niveaux d'autorité | Une seule instance déployée, pour Shinkiro. L'instance agence n'existe pas. Pas de `docs/`. |
| `talos` | **partiel** | Rôle Guardian, `src/`, `ops/`, `memory-seed/`, `SOUL.md`, `radar-mcp/` | Le contrat MCP vers `radar` **n'est écrit nulle part**. Dépôt séparé alors que c'est un module. |
| `hulysse` | **partiel** | Rôle Traveler, même forme que `talos` | Idem : module déguisé en dépôt. README identique à celui de `talos` — à différencier. |
| `danmem` | **à qualifier** | 5 Ko, `src/`, `package.json` | **Aucun README.** Couche mémoire (peers, deriver, dialectique, S0→S7) décrite seulement dans la description GitHub. |
| `la-barre` | **utilisable** | Poste de travail DC, zéro serveur zéro compte, README de 14 Ko, `servir.mjs` | Pas de `docs/`, pas de Dockerfile, pas de `.env.example`. La mesure avant/après du pilote n'est pas branchée. |
| `Argos-studio` | **partiel · relance prioritaire** | 36 Mo de TypeScript, bibliothèque de campagnes, `docs/` fourni | README de 2,2 Ko pour 36 Mo de code. **La boucle de mesure vers les résultats client manque** — sans elle, pas de Content Performance Loop vendable. |
| `charadesign-generator` | **utilisable · gelé** | Pipeline LSI-CD v3.4, UI Atelier clair, tracker 9 étapes | README de 2,4 Ko. Autonome, faible enjeu. |
| `la-fusee-blueprint` | **produit** | Atlas doctrinal, vue philosophique interactive | C'est de la doctrine, pas du code. Ne pas chercher à l'exécuter. |
| `galahad-landing` | **partiel** | Page publique, 13 Ko | **À trancher** : sert-elle le produit `galahad` ou le programme Shinkiro ? Les deux ne s'adressent pas au même public. |
| `hermes-cockpit` | **à qualifier** | 118 Ko, HTML | Ni README ni description. Porte le même nom qu'un dépôt Matanga — **vérifier de quel côté de la cloison il tombe** avant de le documenter. |
| `indice-maturite` | **produit** | HTML autonome, 16 questions / 4 axes / score 0-5, **déployé** sur GitHub Pages | Aucun. C'est le produit 00 du portefeuille, et il est en ligne. |
| `market-expansion-system` | **produit** | Méthode, matrice modèle, gabarits calqués sur le schéma Radar. Preuve terrain neuf marchés | Aucun manque fonctionnel. Reste à en faire une offre packagée. |
| `generateur-approches` · `character-engine` · `datacollector` | **utilisable** | Outils DA autonomes, sans dépendance externe | **Gelés — sans reprise prévue.** Versionnés pour ne plus vivre sur un disque. |
| `BrandForge` | **archivé** | — | README vide, aucun commit depuis février. Soit il devient le Brand Distinctiveness System, soit il reste archivé. |

## Dette structurelle connue

1. **La méthode est éclatée en huit dépôts** sous trois orthographes — ADVE, ADVERTIS,
   AVERTIS. `ADVE-project` est canonique ; les cinq autres sont des lignées mortes à archiver
   après récupération du meilleur README (celui de `LaFusee_ADVE`).
2. **Trois dépôts d'agents sont des modules déguisés.** `talos`, `hulysse` et `danmem` portent
   exactement les rôles décrits dans `galahad/engine/roles/`. Ils doivent y entrer par
   `git subtree`, pour conserver l'historique.
3. **Aucun contrat d'interface n'est écrit.** Voir `docs/INTERFACES.md` — rédigé à partir du
   code, à confirmer par les auteurs.
4. **Le clone local d'`ADVERT_01` porte 111 modifications non commitées.** À trancher avant
   d'archiver le dépôt : récupérer ou jeter.
