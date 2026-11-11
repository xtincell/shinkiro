# Inventaire des points ouverts

Relevé le 10 novembre 2026, par lecture intégrale des documents de gouvernance de
ce dépôt. C'est la matière du [plan d'achèvement](PLAN-ACHEVEMENT.md).

**Ce que cet inventaire est.** Tout ce que les documents déclarent encore ouvert,
dédoublonné : 111 points. Une ligne peut fusionner plusieurs limites voisines qui
se ferment par la même preuve.

**Ce qu'il n'est pas.** Il ne dit pas l'état du code. Les constats tirés du code
sont dans la section 3 du plan.

**Références.** Les numéros de ligne sont ceux de `main` au commit `f852443`.

| Alias | Fichier | Alias | Fichier |
|---|---|---|---|
| MAT | `docs/MATURITE.md` | R-CS | `docs/RECEPTION-CORPUS-SPAWT.md` |
| INT | `docs/INTERFACES.md` | R-AF | `docs/RECEPTION-ADMISSION-FORGE.md` |
| TOPO | `docs/TOPOLOGIE.md` | R-SA | `docs/RECEPTION-SPAWT-APPLICATION.md` |
| PORT | `docs/PORTFOLIO.md` | R-RS | `docs/RECEPTION-REPRISES-SURFACES.md` |
| LAB | `docs/LA-BARRE.md` | R-DB | `docs/RECEPTION-DECISIONS-BILANS.md` |
| DER | `docs/DERIVE.md` | R-RR | `docs/RECEPTION-RADAR-ROLES.md` |
| CLO | `docs/CLOISON.md` | R-AT | `docs/RECEPTION-ATELIERS-SPECIALISES.md` |
| SHK1–3 | `docs/adr/SHK-000x-*.md` | R-GD | `docs/RECEPTION-GALAHAD-DANMEM.md` |
| INST | `installation/README.md` | R-TH | `docs/RECEPTION-TALOS-HULYSSE.md` |
| J1 | `installation/reception-2026-10-19.json` | R-MM | `docs/RECEPTION-METHODE-MARQUE.md` |
| J2 | `installation/reception-poste-2026-10-19.json` | R-CK | `docs/RECEPTION-COCKPIT.md` |
| FLEET | `fleet.yml` | R-AR | `docs/RECEPTION-ARGOS.md` |
| R-DC | `docs/RECEPTION-DATACOLLECTOR.md` | R-BH | `docs/RECEPTION-BANAHEALTH.md` |
| R-15B | `docs/RECEPTION-15B-STORIES.md` | | |

**Classes.** Une seule par point, la plus contraignante.

| Classe | Ce qui ferme le point |
|---|---|
| `[commit]` | Un changement de code ou de document, sans rien d'extérieur |
| `[prod]` | L'accès au VPS, à la production ou à des données en service |
| `[secret]` | Une clé, un jeton, un fournisseur |
| `[décision]` | Un arbitrage du propriétaire |
| `[tiers]` | Un tiers réel : client, cycle de campagne, facture |

Un « ? » marque une classe incertaine.

## Synthèse

| Composant | commit | prod | secret | décision | tiers | Total |
|---|---|---|---|---|---|---|
| ADVE-project | 6 | 5 | 3 | 0 | 2 | 16 |
| la-fusee-blueprint | 1 | 0 | 0 | 0 | 1 | 2 |
| indice-maturite | 1 | 1 | 0 | 0 | 0 | 2 |
| market-expansion-system | 1 | 0 | 0 | 1 | 0 | 2 |
| galahad-landing | 1 | 1 | 0 | 0 | 0 | 2 |
| galahad | 2 | 2 | 1 | 0 | 0 | 5 |
| radar | 1 | 1 | 0 | 2 | 2 | 6 |
| talos | 2 | 1 | 0 | 0 | 0 | 3 |
| hulysse | 0 | 1 | 0 | 1 | 0 | 2 |
| danmem | 2 | 3 | 0 | 0 | 0 | 5 |
| hermes-cockpit | 1 | 3 | 0 | 0 | 0 | 4 |
| la-barre | 5 | 0 | 0 | 0 | 1 | 6 |
| Argos-studio | 3 | 1 | 1 | 1 | 1 | 7 |
| charadesign-generator | 1 | 0 | 1 | 0 | 1 | 3 |
| character-engine | 1 | 0 | 0 | 0 | 0 | 1 |
| datacollector | 2 | 1 | 1 | 0 | 0 | 4 |
| generateur-approches, portail | 0 | 0 | 0 | 0 | 0 | 0 |
| installation | 3 | 4 | 0 | 0 | 1 | 8 |
| transverse | 3 | 0 | 1 | 3 | 2 | 9 |
| SPAWT | 4 | 3 | 1 | 2 | 3 | 13 |
| BanaHealth | 1 | 0 | 1 | 0 | 2 | 4 |
| FrieslandCampina | 0 | 0 | 0 | 1 | 1 | 2 |
| hors flotte audité | 2 | 0 | 1 | 2 | 0 | 5 |
| **Total** | **43** | **27** | **11** | **13** | **17** | **111** |

68 points sur 111 ne se ferment pas par un commit seul.

## Par composant

Format : `[classe]` énoncé — ce qui le fermerait — référence.

### ADVE-project (La Fusée)

- F1 `[prod]` Le contrôle SLO n'a jamais mesuré : la base de production est injoignable depuis les runners — un run SLO qui mesure — MAT:335 ; INT:338
- F2 `[commit]` Conflit de contrats : maturité COMPLETE/100, sources périmées, schéma strict (80 chemins refusés) — un contrat unique pour le S, ses écrivains et ses consommateurs — R-AF:209-213 ; R-CS:1023-1025
- F3 `[secret?]` Stress global en échec : 22 findings, 230 surfaces HTTP non reçues — un stress vert sur un artefact isolé — R-AF:228-230, 258-260
- F4 `[commit]` Comparaison schéma/migrations non mesurée en CI — un job vert avec une base temporaire — R-AF:231-233, 152-153
- F5 `[secret]` Aucune forge réelle : zéro tâche Ptah en production — une forge tracée de la demande au coffre — R-AF:241-251, 49-52
- F6 `[secret]` Octets durables après expiration de l'URL du fournisseur — relecture d'un média réel après expiration — R-AF:253-255
- F7 `[tiers]` Facture du fournisseur et coût réel — une facture rapprochée d'un reçu de coût — R-AF:255-256, 178
- F8 `[commit]` Écrivains à faire converger vers le gateway ; 76 archives sans filiation — tests PostgreSQL verts — R-AF:244-246 ; R-CS:564, 652-656
- F9 `[commit]` Santé de campagne automatique inexistante ; brouillon après remontage ; éditions concurrentes — calcul et tests — INT:197-202 ; R-RS:26-28
- F10 `[prod]` Rôle opérateur natif jamais reçu en production — recette sous un compte opérateur réel — R-RS:60-61 ; MAT:205-206
- F11 `[prod]` Compensation jamais soumise sur une archive réelle ; restauration du SI non reçue — une annulation réelle et une restauration complète — R-CS:647-650, 655
- F12 `[prod]` Stockage : récupération, reprise stockage et clé, orphelins `HTTP_BLOB` — restauration prouvée du volume privé — R-CS:908-911, 1003-1005
- F13 `[commit]` Résiduels : clé MCP limitée refusée ; premier clic Sources sans effet ; historique des identifiants produit — correctifs et tests — R-CS:355-357, 183-184, 305-306, 269-271
- F14 `[prod]` Aucun chargement intégral sans échec ; mobile réel, thème jour, partage public non reçus (répété ×10) — trace complète sur appareil réel — R-CS:1026-1027, 245-247, 74 ; R-AF:215-218
- F15 `[tiers]` Aucun cycle métier réel : stratégie validée, production, validation, livraison — un cycle client complet — MAT:28, 166-167 ; R-CS:216-218
- F16 `[commit]` Les « autres promesses publiques » — recette de chaque section publique — MAT:300-301 ; FLEET:84-85

### Méthode et entreprise

- BP1 `[commit]` `la-fusee-blueprint` : la vue interactive est restée sur une itération antérieure — schéma régénéré et recette visuelle — R-MM:39-41, 49-50
- BP2 `[tiers]` `la-fusee-blueprint` : une révision de méthode réellement appliquée à une décision métier — R-MM:52-54
- IM1 `[prod]` `indice-maturite` : admission du bilan exporté dans le bon dossier Fusée — INT:278-283 ; MAT:312-313
- IM2 `[commit]` `indice-maturite` : ouverture hors ligne et repli sans stockage — INT:282-283
- ME1 `[décision]` `market-expansion-system` : en faire une offre packagée — MAT:348
- ME2 `[commit]` `market-expansion-system` : jointure avec la taxonomie d'écarts de La Barre — TOPO:153-166, 206-207
- GL1 `[commit]` `galahad-landing` : réécrire pour le patron d'agence — PORT:84-88
- GL2 `[prod]` `galahad-landing` : aucune page publiée — MAT:345 ; FLEET:158. **Faux au 10 novembre** : la page est servie sur `galahad.powerupgraders.com`, au commit de `main`. Reste GL1, le contenu.

### galahad

- G1 `[prod]` Canon corrigé non déployé, aucun agent migré — services épinglés sur le canon — MAT:150-151 ; R-GD:58-59
- G2 `[secret]` Setup, cockpit, agents dans Telegram, alertes de patrouille non reçus — recette native — R-GD:22-23 ; R-TH:35, 80
- G3 `[commit]` Garde par motifs, sans sandbox ni mandat lié à une cible ou un montant — R-GD:21-22
- G4 `[commit]` Outbox interrompue pendant l'effet ; objectifs non isolés entre entreprises — R-GD:54 ; R-TH:66-71
- G5 `[prod]` Coût persistant, cycle des agents actifs, exploitation par une seconde TPE — R-GD:22, 56 ; R-TH:80-81

### radar

- RA1 `[décision]` Histoire ancienne à confidentialité inconnue (125 événements) — R-RR:19-21, 32-33 ; INT:55-56
- RA2 `[tiers?]` Trois rôles réels non prouvés sur le Radar personnel — R-RR:34-35
- RA3 `[commit]` Permissions par rôle, concurrence des codes (`ndeg` non unique) — INT:37, 61-63
- RA4 `[décision]` Flux publics par défaut : choix de `FEED_TOKEN` par installation — INT:72-75
- RA5 `[prod]` PostgreSQL et `/data` sauvegardés ; reprise sur un second serveur — INT:87-91
- RA6 `[tiers]` Gestes client réels, circulation des décisions, coût complet — R-RR:89-91

### talos et hulysse

- TA1 `[commit]` Protocole MCP `talos/radar-mcp` ↔ `radar` écrit nulle part (répété ×6) — contrat figé dans INT — INT:285-295 ; TOPO:200-201 ; SHK3:87-89
- TA2 `[commit]` Fusion décidée, non exécutée ; parité des capacités donneuses — SHK3:52-56, 83-85 ; R-TH:41-43
- TA3 `[prod]` Services différents de git : quinze modules servis, aucun identique au dépôt — R-TH:18, 73-78
- HU1 `[décision]` Politique de veille et autorité d'action par installation — R-TH:44 ; FLEET:269-270
- HU2 `[prod]` Reprise des sessions nommées — R-TH:41 ; FLEET:279

### danmem

- DM1 `[prod]` Corrections reçues sur copies, non livrées au service actif — TOPO:12 ; MAT:157-158
- DM2 `[prod]` Installation, restauration d'une sauvegarde, isolation, coût récurrent — TOPO:36 ; R-GD:54-56
- DM3 `[commit]` Clés globales : identités et mandats, bail de claim, rectification des souvenirs — INT:22 ; R-GD:54-57
- DM4 `[commit]` CI : consommateur Galahad sauté, deux contrôles vectoriels sautés en local — R-GD:39-44
- DM5 `[prod]` Bus des agents vivants et retour vers une campagne — INT:25-26

### hermes-cockpit

- CK1 `[prod]` `portal-api.service` raccordé à une adresse de conteneur — un endpoint stable — R-CK:75-78 ; INT:266-267
- CK2 `[prod]` Navigateur authentifié et effet réel d'une commande — R-CK:71-73, 82 ; INT:256-257
- CK3 `[prod]` Fraîcheur par source, identité des agents, isolation, restauration, coûts — R-CK:16-18, 81-83
- CK4 `[commit]` Écrivains externes concurrents ; format des sondes non écrit — R-CK:80-81 ; INT:355

### la-barre

- LB1 `[commit]` Aucun envoi des décisions vers Radar ou La Fusée avec leur trace — LAB:17 ; R-DB:81-83 ; TOPO:208-209
- LB2 `[commit]` Transfert ADVE vers le brief manuel ; boucle de retour à construire — LAB:15, 18 ; FLEET:352-355
- LB3 `[commit]` Acteur authentifié, autres gestes de choix, portée des déviations — R-DB:80-83 ; MAT:307-308
- LB4 `[commit]` Geste natif du bilan de campagne et sa réception dans La Fusée — R-DB:86-89
- LB5 `[tiers]` Validation des cinq gestes avec des directeurs de création — LAB:62-70 ; R-DB:37-41
- LB6 `[commit]` Publier la refonte ; vitrine : page, démonstration fictive, README — LAB:59-60, 71-72 ; PORT:82

### Argos-studio

- AR1 `[décision]` Trois PR en brouillon : CI verte et relecteur exigés — R-AR:38-41
- AR2 `[prod]` Aucun déploiement ; projection distante depuis La Fusée non reçue — R-AR:15-18, 42 ; MAT:268
- AR3 `[commit]` Authentifier l'admission ; espace privé absent ; licence par actif ; amendement concurrent — R-AR:47-50
- AR4 `[commit]` Erreurs, focus, clavier, mobile, fraîcheur — R-AR:50-51
- AR5 `[secret]` Collecte vivante : sécurité des URL, quotas, modèle payant — R-AR:52
- AR6 `[commit]` SHK-0002 non exécutée côté Fusée : lecture encore sur le dossier interne — R-AR:19 ; SHK2:52-56, 96-97
- AR7 `[tiers]` Boucle de mesure vers les résultats client — MAT:342 ; PORT:52, 81

Le code montre que trois des quatre parties d'AR3 sont livrées : voir la section
3.4 du plan.

### Ateliers et outils versés

- CD1 `[commit]` `charadesign-generator` : propriétaire des écritures, retours tardifs, import versionné — R-AT:39-42
- CD2 `[secret]` `charadesign-generator` : routes du fournisseur absentes en production — TOPO:61-64
- CD3 `[tiers]` `charadesign-generator` : validation qualitative humaine des sorties — R-AT:80-82 ; MAT:286
- CE1 `[commit]` `character-engine` : contradiction scorée valide, prompt tronqué, vecteur non conservé — R-AT:12 ; FLEET:422-425
- DC1 `[secret]` `datacollector` : fournisseurs réels jamais appelés — R-DC:21-22, 29
- DC2 `[commit]` `datacollector` : interface native, exports, règles d'URL — R-DC:21-22, 29-30
- DC3 `[commit]` `datacollector` : admission versionnée vers Seshat et Argos — R-DC:24-27
- DC4 `[prod]` `datacollector` : déploiement de service, droits, restauration — TOPO:53-57 ; R-DC:30-31

`generateur-approches` et le portail n'ont aucun point ouvert déclaré.

### installation

- IN1 `[commit]` Écrivain sur identifiant étranger : HTTP 500 au lieu d'un 404 typé — J1:70-76, 85-89
- IN2 `[prod]` Fusée 6.27.493 : choix de marque et retour portefeuille sur l'image CI — INST:132-133, 152-156 ; J2:33
- IN3 `[prod]` Image La Barre qualifiée seulement dans le cache du VPS de recette — INST:156-158 ; J2:34
- IN4 `[commit]` Profil sans Radar, Argos, rôles d'agents, files ni mémoires — INST:109-115, 141-142 ; J1:95
- IN5 `[prod]` Proxy HTTPS public, sauvegardes hors hôte, rétention — INST:111-112 ; J1:96
- IN6 `[prod]` RPO et RTO de service, charge, coût mensuel réel — J1:97 ; J2:36
- IN7 `[commit]` Comptes ordinaires : rétrogradation, suppression, réaffectation — R-CS:405-406
- IN8 `[tiers]` Tout est sur données fictives : aucune seconde entreprise réelle installée — J1:6 ; R-CS:602-604

### Transverse

- TR1 `[décision]` Partage `galahad/cockpit` ↔ `hermes-cockpit` — TOPO:144-151, 202-203 ; MAT:370-371 ; CLO:65-66
- TR2 `[commit]` Liaisons sans contrat : sondes du cockpit, `danmem` ↔ `memory.js` — INT:347-356
- TR3 `[tiers]` Mesure avant/après du cycle complet — MAT:376-378 ; INT:358-359
- TR4 `[décision]` Critères d'acceptation de Content Operations ; modèle de Content Velocity — PORT:50-51, 79-80
- TR5 `[tiers]` Grille tarifaire à valider sur coûts réels et premiers pilotes — PORT:83, 90
- TR6 `[décision]` Lignées : 80 à qualifier, 111 modifications non commitées d'`ADVERT_01`, sort de `BrandForge` — MAT:350, 354-357, 368-369
- TR7 `[secret]` Secrets à demander ; `FLEET_TOKEN` ; endpoints de modèles — INT:334-342 ; DER:124-128 ; TOPO:194-196
- TR8 `[commit]` Signal « deux composants, un seul produit », promis par SHK-0001, jamais écrit — SHK1:100-105 ; SHK2:74-85
- TR9 `[commit]` Documents du programme périmés — voir plus bas

### Clients suivis

**SPAWT**

- SP1 `[commit]` Irrigation du quiz et de l'application depuis l'édition publiée — R-CS:1002-1005, 1032-1033 ; INT:231
- SP2 `[tiers]` Retour de valeur : version choisie, usages publiés, effet mesuré — R-CS:47-48, 143-144 ; R-SA:276
- SP3 `[décision]` Aucune approbation humaine : piliers proposés par l'IA, S v3 non approuvable — R-CS:388-393, 948-949 ; R-AF:207-208
- SP4 `[décision]` Arbitrages non tranchés : mue, seuil, amendement du PRD absent de `main` — R-CS:420-427, 496-497
- SP5 `[prod]` Données anciennes hors schéma — amendements gouvernés — R-CS:223-225, 398-399, 503-505, 1031
- SP6 `[prod]` Filiation HD des masters ; équivalence WOFF2 ; deux slugs invalides — R-CS:941-945, 736-739
- SP7 `[secret]` Application jamais reçue authentifiée — R-SA:39-40, 113-115, 274-276 ; R-RS:126-131
- SP8 `[tiers]` Publication iOS et Android ; paiement — R-SA:69, 288 ; R-CS:528-532
- SP9 `[commit]` Rejeu d'avis déplaçant plusieurs fois le Palais — R-SA:116-119, 183-184
- SP10 `[commit]` File analytique, isolation, purge, finalisations simultanées — R-SA:111-115, 206-207, 274-276
- SP11 `[commit]` Liens profonds restés sur `spawt.ci` — R-SA:85-87 ; INT:250-251
- SP12 `[tiers?]` Confidentialité et CGU en brouillon juridique — R-SA:84-85 ; INT:249-250
- SP13 `[prod]` Permissions non reçues ; fichier Edge servi différent du canon — R-SA:46-47, 241-242 ; R-CS:494-495

**BanaHealth**

- BH1 `[tiers]` Droits client, chemin de l'éditeur client — R-BH:11-12, 28-29, 51-52
- BH2 `[secret?]` Prochaine publication et son retour arrière — R-BH:41-42, 52
- BH3 `[commit]` Revue visuelle et accessibilité, rattachement marque et projet — R-BH:50-51
- BH4 `[tiers]` Coûts de maintenance ; assertions médicales non validées — R-BH:7, 52

**FrieslandCampina**

- FC1 `[tiers]` Noël EVAP 2026 : brief ni validé ni livré, aucune production — R-RS:65, 98-101 ; R-AF:220-225, 260
- FC2 `[décision]` Budget non renseigné ; échéance lue au 20 octobre, dépassée — R-AF:222-223 ; R-CS:80-81

### Hors flotte, mais dans l'audit

- HF1 `[commit]` 15B Stories : quatre ruptures reproduites — R-15B:20-45
- HF2 `[décision]` 15B ↔ Ngoma : aucun import compatible — R-15B:47-57
- HF3 `[commit]` CosmicMachine, Atlas, Tauri-v1 : défauts listés — R-AT:14-16, 57-58
- HF4 `[secret]` BrandForge : clé de fournisseur en dur à révoquer — R-MM:17-35
- HF5 `[décision]` Radar de l'employeur : autres créateurs de codes, 995 événements non qualifiés — INT:109-112, 144-149 ; R-RR:81-88 ; R-CS:593-598

## État des points `[commit]` au 11 novembre

Le palier P2 du plan exige que chaque point `[commit]` soit fermé, PR fusionnée et
CI verte. Voici où en est chacun des 43.

| État | Points |
|---|---|
| **Fermé** (PR fusionnée, ou déjà vrai sur `main`) | TA1 (contrat MCP écrit), CD1 (charadesign-generator#5), CE1 (character-engine#2, #3), TR8 (déjà couvert par le signal `source-partagee` de SHK-0002 ; l'inventaire était en retard), TR9 (documents repris, plan 3.6), F4 (le diff schéma/migrations tourne en CI depuis le lot 451, reconfirmé par #1168), IM2 (indice-maturite#2), G4 (galahad#27), DC2 (datacollector#5), TR2 (contrat `danmem` ↔ `memory.js`, puis format des sondes dans hermes-cockpit#5), IN1 (ADVE-project#1170), AR4 (Argos-studio#5), IN7 (ADVE-project#1172), DM3 (bail : danmem#4 ; identités, mandats et rectification : danmem#7), F16 (ADVE-project#1173 ; 21 engagements contractuels ou commerciaux restent au propriétaire), AR6 (ADVE-project#1174 ; branchement réel du studio après l'arbitrage 5.8) |
| **Fermé en partie** | F13 : clé MCP limitée à un serveur et premier clic Sources corrigés (ADVE-project#1171) ; l'historique des retraits et réintroductions des identifiants produit reste à faire. LB3 : gestes de choix et portée des déviations faits (la-barre#18) ; l'acteur authentifié attend une identité transmise par La Fusée. CK4 : format des sondes écrit (`hermes-cockpit/docs/SONDES.md`) et lecture tolérante aux écrivains concurrents (hermes-cockpit#5) ; il manque un verrou entre processus, et la forme réelle des fichiers produits par l'hôte n'est pas relue |
| **En cours** | DM4 (danmem#6, attend le secret `GALAHAD_DEPLOY_KEY`), F8 (agent lancé le 11 novembre) |
| **Attend un arbitrage** | ME2 (5.4), LB1 (5.5, 5.6), GL1 (5.12), TA2 et G3 (5.3), RA3 (5.7), BP1 (5.11), AR3 (5.8) |
| **Faisable par un agent** | F2, F9 (`ADVE-project`) ; LB2, LB4, LB6 (`la-barre`) ; DC3 (`datacollector`) ; IN4 (profil d'installation, demande un démon Docker) |
| **Hors programme** | SP1, SP9, SP10, SP11 (SPAWT) et BH3 (BanaHealth) sont des projets clients ; HF1 (15B Stories) et HF3 (CosmicMachine, Atlas, Tauri) sont au `labo`. [`CLOISON.md`](CLOISON.md) les tient hors du programme : ils se traitent dans leur propre cadre et ne conditionnent pas P2. |

## Contradictions entre documents

Dix-huit endroits où deux documents se contredisent, ou où un document affirme
ce qu'un autre, plus récent, corrige.

> **Mise à jour du 10 novembre.** Les points 1 à 13 et 16 à 18 sont corrigés : à
> la source, ou, pour le tableau historique de `MATURITE.md`, par une table de
> corrections qui le suit. Les points 14 et 15 sont des journaux de réception
> datés ; le README avertit qu'ils se lisent comme tels. Les numéros de ligne
> ci-dessous sont ceux du relevé initial.

1. **Version de La Fusée.** « v6.19, 192 ADR » (README.md:72 ; MAT:335 ; SHK2:93) contre les lots 6.27.404 à 439 (R-CS:1020) et le socle 492/493 (INST:132). Le dépôt est en 6.27.552.
2. **Déploiement.** Vercel pour `ADVE-project` et Argos (TOPO:49) contre Coolify (TOPO:22-23 ; FLEET:74). Corrigé le 10 novembre.
3. **La Barre.** « Aucun serveur, aucun compte » (README.md:100 ; AGENTS.md:32 ; MAT:341) contre un conteneur servi (R-DB:34, 72) et une image d'entreprise (INST:122-127).
4. **La Barre ↔ Radar.** « Rien ne les relie » (MAT:341 ; TOPO:190-191) contre une admission reçue (INT:115-150), mais sur l'installation de l'employeur, hors flotte.
5. **Moteurs.** « Rôles du même moteur » (README.md:89-91 ; AGENTS.md:31) contre SHK3:15-27, qui le dément, contre R-TH:18, qui le rétablit pour les services.
6. **Talos.** « Ne réimplémente ni la boucle, ni les outils, ni les sessions » (AGENTS.md:67-69) contre son propre `agent-loop` (FLEET:249 ; SHK3:36-39).
7. **Danmem.** « 5 fichiers, rapport avec `memory.js` établi nulle part » (README.md:91 ; MAT:340) contre TOPO:9-18 et INT:10-28.
8. **MCP.** « Toute modification de l'API Radar peut casser Talos » (INT:293-295) contre INT:288-290 : les modules servis n'appellent pas ce client.
9. **Radar.** « Une seule instance, pas de docs » (MAT:337) contre INT:65 et MAT:302.
10. **galahad-landing.** « À trancher » (MAT:345) contre « tranché » (FLEET:150-152) ; « page publique » (README.md:79) contre « aucune page publiée » (FLEET:158).
11. **Tableau historique de MATURITE.** Indice « aucun manque » (MAT:347) contre MAT:311-313 ; outils « gelés » (MAT:349) contre FLEET:407, 432.
12. **Numérotation des produits.** Indice = 00, MES = 04 (README.md:115-116) contre 01 et 06 (PORT:47, 52 ; FLEET:114, 129).
13. **Promesses au présent.** « Before/after mesuré » (PORT:49, 69-70) contre INT:358-359 ; « 15 min, 48 h » (README.md:72) contre MAT:28.
14. **Compteurs de parcours.** 96, 100, 102 selon les réceptions, contre 116 (R-CS:576 ; MAT:114).
15. **Limites ouvertes puis fermées plus bas**, dans le même fichier : R-CS:43-45, 252-254, 335-336, 791 ; R-AF:155 ; R-CK:42-44.
16. **MATURITE et README s'arrêtent au 9 octobre** (MAT:7 ; README.md:125). Ni le lot 439 ni le socle du 19 octobre n'y figurent. README.md:128-132 cite 5 des 15 réceptions.
17. **Périmètre.** SPAWT « projets clients de la flotte » (INT:208) contre « hors flotte » (CLO:25 ; FLEET:483-487).
18. **Dispositif.** « 15 contrôles » (DER:83) contre « douze signaux » (FLEET:453). Le script en porte 15 : c'est le manifeste qui est en retard.

## Ce que les documents disent des chantiers

- **C1** : jamais cité par son numéro dans ce dépôt.
- **C2, C3, C4**, cités ensemble : la chaîne « version de marque choisie, usages, effet mesuré » (R-CS:47-49).
- **C3, C4, C6** : acceptation suspendue à la factorisation du conflit de contrats sur la maturité (R-AF:209-213).
- **C4, C5** : stress global à reprendre sur une instance isolée (R-AF:228-230).
- **C5** : filiation et réversibilité des écritures gouvernées « avant délégation » (R-CS:395-398, 506).
- **C7** : le paquet complet d'entreprise (INST:109-112).
- **Règle commune** : « les nouveaux écarts alimentent leur périmètre existant » (R-CS:608-609).
- **Portes R01 à R10** : leurs identifiants n'apparaissent nulle part dans ce dépôt.
- **Parcours** : « 116 parcours requis » sur « 40 dépôts, 28 identités » (R-DB:91). Zéro parcours large reçu (MAT:114-118). La liste des 116 n'est pas dans le dépôt.
- **Lignées** : « 80 lignées donneuses restent à qualifier » (R-DB:94). La liste des 80 n'est pas dans le dépôt.

Le plan complète ces lectures par celles du dépôt `ADVE-project`.
