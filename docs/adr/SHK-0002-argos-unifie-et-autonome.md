# SHK-0002 — Argos : une bibliothèque, deux surfaces

- **Statut** : Accepted
- **Date** : 2026-09-14
- **Composants** : `Argos-studio`, `ADVE-project`

## Contexte

`ADR-0100` d'ADVE-project, datée du 14 juin 2026, constate *« Argos n'était **pas
déployable** — 0 % de backend »* et réimplémente le harvester à neuf. `Argos-studio`
existait depuis le 15 mai, 184 fichiers, API v1 complète. Le récit de cette dérive
est dans [`docs/DERIVE.md`](../DERIVE.md).

Mais le relevé des deux modèles dément la lecture simple — « deux fois la même
chose ». Ce n'est pas le cas, et c'est ce qui rend l'arbitrage possible.

**`Argos-studio` porte une bibliothèque.** Neuf entités relationnelles autour de
`Reference` : une taxonomie de patterns (`patternKind`, `manipulationMode`,
`funnelStage`, piliers ADVE, `operationGoals`, `victoryTypes`), une preuve de
performance à niveau d'attribution explicite — `PROVEN_CAUSAL`, `CORRELATED`,
`ESTIMATED`, `CLAIMED` — la filiation entre campagnes, les annotations d'expert, la
provenance nominative du chercheur. Plus une API v1 sur neuf familles de ressources
et une voie d'entrée `POST /api/v1/ingest/dossier`, validée en Zod et **idempotente
sur le slug** : une resoumission amende au lieu de dupliquer.

**`ADVE-project/src/server/services/seshat/argos/` porte une gouvernance.** Un
`CampaignReferenceDossier` à champs JSON — `dna`, `editorial`, `sources` — mais
surtout ce que le studio n'a pas : un verdict de sûreté **déterministe et sans LLM**
(`PASS` / `QUARANTINE` / `REJECT`, auto-publication si et seulement si `PASS`), le
passage obligé par le LLM Gateway, les intents `SESHAT_HARVEST_REFERENCE` et
`OPERATOR_CREATE_REFERENCE_DOSSIER` avec leurs SLO, la parité manual-first, et le
lien `intentEmissionId` vers le journal de gouvernance.

Le recouvrement réel est étroit mais coûteux : les deux persistent une référence de
campagne avec marque, secteur, marché et sources, et les deux ont une notion de
publication. **Deux modèles à tenir d'accord, indéfiniment.**

## Décision

**`Argos-studio` est canonique pour la bibliothèque.** Un seul modèle de référence,
une seule taxonomie, une seule échelle d'attribution. C'est là que vit le fonds.

**`ADVE-project` en devient un client gouverné.** Il garde intégralement ce qui fait
sa valeur et que le studio n'a pas — mais comme **politique au-dessus d'une source
partagée**, plus comme seconde bibliothèque :

1. Le Hunter récolte via le Gateway, inchangé.
2. `computeSafetyVerdict` rend son verdict, déterministe, inchangé.
3. **Sur `PASS` uniquement**, le dossier est projeté en `research-dossier-v1` et
   poussé sur `POST /api/v1/ingest/dossier`. L'idempotence sur le slug fait que
   rejouer est sans danger.
4. `CampaignReferenceDossier` cesse d'être la bibliothèque et devient le **journal
   de gouvernance** : ce qui a été récolté, par quel intent, quel verdict, par qui,
   quand. C'est une trace d'audit, pas un fonds documentaire.
5. Les lectures publiques — `listPublicDossiers`, `getPublicDossierByRef` — passent
   par l'API v1 du studio.

**L'autonomie des deux est préservée, et c'est une contrainte, pas un effet de bord.**
`Argos-studio` se déploie seul sur Vercel depuis `app/` : c'est sa raison d'être, la
bibliothèque publique et son moteur de recherche. `ADVE-project` fonctionne sans lui :
le studio injoignable, la porte de gouvernance continue de juger et de journaliser,
et la projection se rejoue plus tard — l'idempotence est ce qui rend ce report sûr.

**Les trois interdits vendor d'ADR-0100 restent entiers.** Ils portent sur
`docs/external-design/argos-hunter-v1/`, qui n'est ni importé, ni exécuté, ni modifié.
Cette ADR ne les touche pas.

**`ADR-0100` est amendée, non annulée.** Son port est valable et le reste : la
gouvernance qu'elle a construite est précisément ce qui manquait au studio. Seule sa
prémisse — *« 0 % de backend »* — est corrigée.

## Signal d'audit

- `source-partagee` — lorsque deux composants se partagent une source, `fleet.yml`
  le déclare : un `produit` commun, exactement un `role: canonique`, et tout `role:
  client` nomme l'interface `via` par laquelle il y accède. Zéro canonique signifie
  que personne ne possède la source ; deux signifient qu'on a rebâti ce qui existait.

C'est le contrôle qui aurait épargné ADR-0100 : contraint de déclarer qui possède
Argos, son auteur aurait trouvé `Argos-studio`.

Il est volontairement déclaratif et sans réseau, donc exécutable par la patrouille à
coût nul. Une recherche de code à travers les dépôts dirait mieux, mais exige un
jeton, donc le workflow, donc une seule exécution par semaine — et surtout elle ne
détecte qu'un symbole déjà dupliqué, quand celui-ci détecte l'intention de le faire.

## Portée

Cette ADR ne fusionne pas les dépôts. Absorber `Argos-studio` dans `ADVE-project`
détruirait l'autonomie qui est l'objet même de la contrainte posée.

Elle ne dicte pas le calendrier du branchement. Le côté ADVE est un dépôt gouverné
— 192 ADR, plugin ESLint maison, intents et SLO — et son propre processus décide
comment et quand. `SHK-` arbitre entre composants ; il ne légifère pas à l'intérieur.

Elle ne traite pas de la migration des dossiers déjà récoltés côté ADVE. Ils sont
rejouables sur la voie d'entrée, précisément parce qu'elle est idempotente.
