# Clôture du programme

Le programme Shinkiro est **clos le 18 novembre 2026**.

**Qui décide.** Le propriétaire a délégué la décision ce jour-là, depuis son poste : carte
blanche pour clore, la responsabilité restant la sienne. Ce document est la décision et
sa justification. Les reçus sont dans [`PLAN-ACHEVEMENT.md`](PLAN-ACHEVEMENT.md) (lignes
0.82 à 1.00) ; l'issue de chaque point est dans
[`INVENTAIRE-POINTS-OUVERTS.md`](INVENTAIRE-POINTS-OUVERTS.md).

## Clos n'est pas « achevé »

La définition validée le 16 novembre (plan, section 1) posait trois conditions. Deux
sont remplies. La troisième ne l'est pas, et aucune décision ne peut la remplir : elle
est retirée du programme, non déclarée atteinte.

| Condition | État à la clôture |
|---|---|
| **P2** — tout ce qu'un commit peut fermer est fermé | Rempli depuis le 12 novembre |
| **P3** — chaque point `[prod]` et `[secret]` a un reçu daté ou une décision datée qui le sort | Rempli le 18 novembre, par les décisions ci-dessous |
| **P4** — un pilote réel mesuré et une facture | **Non constaté.** Retiré du programme : ce sera un projet commercial à part |
| **P1**, condition de maintien — le contrôle hebdomadaire est vert | **Suspendu.** Il lui faut un jeton que seul le propriétaire peut créer ; il se lance désormais à la main |

Clore veut dire : plus aucun travail n'est prévu sous ce nom ; ce qui tourne sur le
serveur continue de tourner seul ; ce dépôt garde la trace, et dit ce qui rouvrirait le
programme.

## Les décisions

La règle suivie : garder ce qui est prouvé, abandonner ce qui demandait la présence du
propriétaire, une dépense ou un second serveur.

### Neuf points reçus en partie : le reçu vaut tel quel, le reste sort

| Points | Ce qui est reçu | Ce qui sort, et pourquoi |
|---|---|---|
| F11, F12, RA5 | Sauvegardes hors de l'hôte chaque nuit, restauration sur copie (0.91) | La reprise sur un second serveur : il n'y en a pas |
| DM2 | Sauvegarde, restauration, unité durcie, vecteurs rattrapés (0.91, 0.92, 0.99) | L'isolation entre installations et le coût : une seule installation existe |
| HU2 | Conversation persistée en service (0.94), toujours sur le disque après le redémarrage du 16 novembre | La reprise par un message réel : elle demandait le propriétaire |
| CK2, CK3 | Reçus par l'API du cockpit (0.95) | Le parcours dans un navigateur, l'identité réelle des agents, les coûts |
| G2 | Un message réel, une alerte de patrouille, et toute la recette sur copie, Telegram simulé (0.93, 0.94) | La recette native dans Telegram : elle demandait le propriétaire |
| AR2 | Studio servi et sain | La projection, qui ne se lance que depuis la console de La Fusée. Argos reste autonome ; `ARGOS_STUDIO_URL` n'est pas posée |

### Dix-sept points sortis le 18 novembre

| Ils attendaient | Points | Pourquoi ils sortent |
|---|---|---|
| Le propriétaire | TR7, HF4, F10, F14, IM1 | Un jeton à créer, une clé à révoquer chez un fournisseur, un compte et un appareil réels : il ne travaille plus sur ce programme |
| Une clé de fournisseur | F3, F5, F6, AR5, CD2, DC1 | Aucune dépense ne se justifie pour un programme qu'on arrête |
| Un second hôte | IN2, IN3, IN5, IN6 | Aucun n'est prévu |
| Un usage réel | G5, DM5 | Ils relèvent de P4, retiré |

Six points étaient déjà sortis (DC4 par l'arbitrage 5.9 ; SP5, SP6, SP7, SP13 et BH2
par [`CLOISON.md`](CLOISON.md)) et six fermés par un reçu.

### Hors inventaire

| Sujet | Décision | Pourquoi |
|---|---|---|
| Contrôle hebdomadaire de la flotte | Suspendu dans `fleet-drift.yml`, lançable à la main | Rouge chaque lundi faute de `FLEET_TOKEN`, sans personne pour le lire |
| Budgets SLO prévus le 26 novembre | Non fixés ; la tâche `slo-check` continue de mesurer toutes les six heures | Un budget que personne ne suit ne sert à rien |
| Ports 6001 et 6002 de Coolify | Laissés ouverts | Fonctionnement prévu de Coolify ; les fermer couperait le terminal de son interface, qui sert de porte de secours |
| Pile Honcho | Laissée en marche | Son modèle calcule les vecteurs de `danmem` et de La Fusée (0.99) |
| Rotation des clés | Faite pour ce qu'une session pouvait changer seule ; le reste est remis au propriétaire | Les comptes des fournisseurs ne sont pas accessibles depuis une session |
| Chantiers de LeRadar | Hors programme, comme avant | Leur définition n'a jamais été versée ici |

## Les gestes de clôture

Faits le 18 novembre, chacun réversible, l'état d'avant gardé sur l'hôte (ligne 1.00).

- Le passage hebdomadaire du contrôle de flotte est retiré ; le lancement manuel reste.
- Trois jetons de l'API Coolify, inutilisés depuis juillet, sont mis à échéance.
- Le terminal web de l'hôte est arrêté et désactivé. Il tournait sous `root`, son mot de
  passe avait été exposé, et il n'était joignable par aucune route en service.
- La clé SSH du poste, exposée en juillet, est remplacée ; l'ancienne n'ouvre plus l'hôte.
- Le mot de passe du cockpit et le jeton du portail sont remplacés. Une empreinte du
  premier avait été affichée par erreur pendant ce travail, le second l'avait été le 16.

## Ce qui reste, et à qui

**Au titulaire des comptes, hors programme.** Cinq révocations ne peuvent se faire que
chez les fournisseurs : le jeton de l'API de l'hébergeur, le jeton GitHub transmis le
12 novembre, les clés du service de modèles, le jeton d'un bot Telegram, la clé en dur
de BrandForge (HF4). La liste, sans aucune valeur, est remise au propriétaire.

**Risques acceptés.**

- Les secrets internes exposés et non changés (ponts, base de la mémoire) ne se
  joignent que depuis l'hôte lui-même.
- Un seul appareil a son tunnel activé. Les voies de secours sont un autre appareil du
  tunnel, le terminal de l'interface Coolify, puis le mode de récupération de l'hébergeur.
- La clé qui déchiffre les sauvegardes existe sur l'hôte et sur le poste du propriétaire.
- Les versions successives des pages du wiki s'accumulent dans la mémoire des agents.

## Ce qui tourne seul

Patrouille horaire de Talos et ses alertes ; rapport du soir et son contrôle ;
sauvegardes hors de l'hôte chaque nuit ; worker de la mémoire toutes les trente minutes ;
déclencheurs du cockpit ; mesure SLO toutes les six heures ; mises à jour de sécurité
du système ; tunnel et pare-feu au démarrage. Hulysse et FABLE n'agissent qu'à la demande.

Personne ne suit : les renouvellements de noms de domaine et les mises à jour de Coolify.

## Ce qui rouvrirait le programme

| Si un jour | Alors | Points |
|---|---|---|
| Un client accepte un pilote | Mesure avant et après dans Radar, facture : c'est P4 | G5, DM5 |
| Un second serveur est loué | Restauration complète et réception du socle d'entreprise | F11, F12, RA5, IN2, IN3, IN5, IN6 |
| Une clé de fournisseur est engagée | Une forge réelle, son média relu après expiration | F3, F5, F6, AR5 |
| Argos doit se brancher à La Fusée | Projection depuis la console, puis `ARGOS_STUDIO_URL` ([`REPRISE-POSTE.md`](REPRISE-POSTE.md), section 6) | AR2 |
| Le contrôle du lundi doit revenir | Poser `FLEET_TOKEN`, remettre deux lignes dans `fleet-drift.yml` | TR7 |

Aucun de ces événements n'est nécessaire à ce qui tourne aujourd'hui.
