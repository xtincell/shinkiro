# Talos et Hulysse : préserver ce qui tourne avant de factoriser

## Rôle dans le produit

Talos rend l'infrastructure observable et traite ses incidents. Hulysse reçoit
les objectifs d'exploration et prépare leur avancement. Ces rôles maintiennent
les moyens de travail ; ils n'acquièrent ni l'autorité de marque de La Fusée,
ni le droit de livrer une campagne ou d'approuver un résultat client.
Leur valeur tient à la continuité : contexte conservé, résultat identifiable,
échec visible, retour retrouvable. Une conversation IA n'est pas une réception.

## Trois états distincts, constat du 7 octobre 2026

| Source | État vérifié |
|---|---|
| Talos Git `5869e4e598bd8f6a9543f9fb2beb5b4ef8a2f4b6` | Ancien moteur Ollama, sessions persistées, cron, briefing et pont MCP Radar. |
| Hulysse Git `6d06b8e49c77f19922e9e4faf035fe300e448cc7` | Ancien moteur Ollama, sessions persistées, objectifs ; veille conservée mais désactivée dans l'entrée. |
| Services `talos.service` et `hulysse.service`, sources lues à 14:51 UTC | Quinze modules identiques à l'octet entre les deux services. Aucun ne correspond au fichier homologue de son dépôt Git. Onze correspondent exactement au Galahad `2ff861a` ; quatre ajoutent missions isolées et Agora. Route du cerveau : relais OAuth local `/v1` sur le port 8646. |

Les sources servies ont été copiées en lecture seule et comparées par SHA-256,
sans publier les environnements, les conversations, les souvenirs ni les travaux.
Cette mesure décrit les fichiers sous les points d'entrée des services, pas
une preuve que chacun de leurs chemins a été exercé en production.

La décision Shinkiro SHK-0003 mesure les dépôts Git de septembre. Elle ne décrit
pas cette convergence de fait sur le VPS. Une suppression des anciens dépôts
fondée sur les seuls fichiers servis ferait perdre les capacités donneuses ;
une remise en production des anciens dépôts ferait perdre missions et Agora.
Ce lot préserve les dépôts historiques et ne migre aucun service.

## Capacités et frontières

| Capacité existante | Source et traitement |
|---|---|
| Patrouille, rapport et cadence à chaud | Moteur servi et Galahad ; code commun déjà présent. Réception des alertes réelles encore ouverte. |
| Cerveau agnostique, relais OAuth, fallback | Moteur commun. Le fournisseur reste configurable ; aucune clé statique ajoutée et aucun appel réel dans les tests. |
| Procédures déterministes et bus Danmem | Galahad corrigé en 0.1.1 ; compte rendu conservé avant retour. Une procédure sans `decide` n'appelle pas le chat. |
| Missions libres `skill: mission`, `args.instruction` | Présentes dans les services, absentes de Git Galahad. Réintégrées dans la même boucle, avec historique isolé et résultat final explicite. |
| Agora | Présente dans les services. Réintégrée comme canal facultatif, avec mention/réponse et autorité limitée à l'opérateur identifié. Le bus reste le transport des travaux entre agents. |
| Objectifs | Schémas historiques `status: done` et courant `done: true` lus sans rouvrir les objectifs clos. Métadonnées conservées, écriture atomique ; fichier illisible non remplacé. |
| Sessions nommées persistées | Capacité donneuse des anciens dépôts, absente du moteur servi. Réception/migration encore ouverte ; aucune conversation réelle déplacée. |
| Cron déclaratif et briefing Talos | Capacités donneuses Git, absentes des quinze modules servis. Ne pas les déclarer actives ; qualifier les routines externes et leur contrat de reprise avant migration. |
| Pont MCP Radar Talos | Client et serveur conservés dans le dépôt historique. Le moteur servi utilise des clients HTTP ; le contrat MCP et la parité des outils restent à recevoir. |
| Veille Hulysse | L'ancienne entrée est réactive ; la veille n'y est plus appelée. Le Traveler commun possède une fenêtre nocturne configurable. Ces politiques ne sont pas déclarées équivalentes sans réception de la configuration. |

## Défauts reproduits et réception 0.1.2

Sur une copie des quinze modules servis, huit scénarios donnent **six échecs** :
mission à limite de tours pourtant `done`, réponse vide pourtant `ok`, retour
perdu après échec de transport, commande d'un autre membre de l'Agora admise,
rapport privé concurrent envoyé au groupe, refus HTTP/applicatif Telegram masqué.
L'isolation de conversation et le refus d'une instruction manquante passent déjà.

Deux contre-exemples supplémentaires sur le module d'objectifs partagé
reproduisent la réouverture d'un objectif historique clos et l'écrasement d'un
fichier illisible lors d'un ajout. Les anciens enregistrements restent inchangés.

**25 scénarios verts** et syntaxe vérifiée sous Node 22, sans dépendance npm,
sans Telegram réel, sans fournisseur, sans action d'infrastructure. Les tests
injectent les réponses de transport et utilisent des homes jetables.
Le compte rendu d'une mission suit l'outbox existante : persisté, acquitté,
puis éventuellement visible dans l'Agora. Après un retour en échec, un nouveau
consommateur remet le résultat sans rappeler le modèle. Le contexte asynchrone
de réponse évite qu'un rapport privé concurrent parte dans le groupe.

Le miroir Telegram est best-effort : son refus est journalisé, le résultat
acquitté reste dans Danmem. Il n'est pas garanti livré une seule fois à travers
tout crash. L'outbox ne couvre toujours pas une interruption pendant l'effet.
Une réponse finale non vide est une fin de boucle, pas la preuve d'un livrable
métier correct. Fichiers/objectifs ne sont pas isolés entre entreprises ;
l'écriture atomique ne constitue pas un verrou entre plusieurs processus.

## Avant une convergence de déploiement

Recevoir la parité des capacités donneuses et leurs politiques, identifier les
configurations effectives et les stocks à conserver, faire une restauration
sur une instance isolée, puis épingler un même moteur pour chaque profil.
Ne pas remplacer deux forks par trois copies d'un nouveau `src/`.
Aucun agent actif, gateway, conversation ou mémoire n'est modifié par ce lot.
La réception native dans Telegram et l'exploitation par une deuxième TPE
restent ouvertes. Les sept chantiers Shinkiro restent ouverts.

Canon Galahad `a9bb98a`, [PR #4](https://github.com/xtincell/galahad/pull/4)
fusionnée après les deux CI vertes `37641962927` et `37642005433` sur `8acf981`.
