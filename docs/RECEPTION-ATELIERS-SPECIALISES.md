# Ateliers spécialisés — réception partielle du 7 octobre 2026

Les fonctions source et leurs rôles sont confrontés aux dépôts actuels. Cette
passe ne reçoit ni les UX natives, ni une circulation complète, ni une release.
Les IP de laboratoire demeurent dans l'audit intégral ; leur classification ne
les transforme pas en composants à déployer chez chaque client.

## Rôle et trous constatés

| IP | Valeur propre | Trous reçus ou limites d'examen |
|---|---|---|
| Character Engine | Contraindre les choix de direction artistique d'un personnage. | Une contradiction manuelle reçoit le même score qu'un vecteur valide ; prompt tronqué et vecteur non conservé. Schéma embarqué, profils absents. |
| LSI-CD | Conduire l'élaboration sémantique puis conserver le dossier d'auteur. | Bibliothèque et brouillon existent ; navigation, interruption tardive, fragments et import restent à recevoir. |
| CosmicMachine | Explorer, affiner et décliner des concepts avant arbitrage. | Deux sorties dans la même minute s'écrasent ; affinage CLI sans contenu réel du concept. Wrappers Higgsfield documentés absents du dépôt. |
| Atlas of Recorded Sound | Explorer un corpus éditorial de filiations musicales. | Recherche d'artiste et ouverture Entrée divergent ; clavier et sources éditoriales non reçus. Ce n'est pas une bibliothèque audio licenciée. |
| Factures & Reçus / Tauri-v1 | Retrouver mouvements, soldes et justificatifs de trésorerie. | Expression SMS invalide, justificatif retiré avant réception de l'opération, erreurs locales masquées et export CSV erroné. Le code ne produit pas de facture commerciale. |
| BlackNoteWeb | Canevas de développement donneur. | Aucun module ni écran métier ; ne pas fabriquer un produit pour combler son répertoire vide. |

Les défauts sont reproduits sur fonctions exactes en VM, avec fixtures. Aucun
fournisseur payant appelé, média exporté ou donnée financière réelle utilisée.
Le nom d'un outil ne suffit pas à déduire son autorité ni sa maturité.

## Correction LSI-CD intégrée, service non reçu

[PR #2](https://github.com/xtincell/charadesign-generator/pull/2) intégrée au canon
`0bc3f774506dd2df554a92f6b3f19a4f7f2809a9` après CI verte sur
`eaaefbe07fec4eee060efe5f89660923e41156a7`.

- Le reçu attend la complétion de transaction IndexedDB. Abandon et erreur
  synchrone rejettent ; les connexions sont refermées, le magasin est conservé.
- Le pipeline attend ses checkpoints et sa sauvegarde finale. Un échec de
  fournisseur ou de persistance ne déclare plus la complétion.
- Une lecture initiale échouée reste visible et réessayable sans monter un
  éditeur vide susceptible d'écraser le brouillon.

Six échecs de persistance puis quatre d'orchestration sont reproduits avant
correction. Douze tests locaux et CI verts, build Vite 6.4.4 reçu ; installation
CI sans vulnérabilité signalée. [CI 37676247727](https://github.com/xtincell/charadesign-generator/actions/runs/37676247727).
Ces preuves de contrats ne valent pas une recette IndexedDB dans le navigateur.
Aucun déploiement de service reçu. Propriétaire des écritures après navigation,
arrêt des retours tardifs, statut partiel, import versionné et admission du
master restent ouverts. Aucun parcours large n'est clôturé par ce lot.

## Sources de la passe

Heads rapprochés avant correction : Character Engine `75c5c79`, LSI-CD
`7d99f4a`, CosmicMachine `058fe6e`, Atlas `5c6f9db`, Tauri `6d4df1f`,
BlackNote `f490b52`. Le canon LSI-CD ci-dessus est postérieur à cette passe.

Le rapport détaillé `audit-shinkiro-2026-09-25/release/AUDIT-ATELIERS-SPECIALISES.md`
et les preuves `preuves-character-design/` sont dans le dossier de réception
de l'opérateur. Les snapshots de code et leurs empreintes sont consignés dans
`recensement/programmes/audit-specialistes-chargement.json`.

Suite : fermer les pertes de travail, recevoir la reprise native et raccorder
les résultats aux autorités existantes avec origine, version et décision
humaine. Aucun atelier ne devient une étape obligatoire d'une campagne dont
le travail n'en a pas besoin ; aucun nouveau stockage transversal n'est déduit
par cette seule passe d'audit.
