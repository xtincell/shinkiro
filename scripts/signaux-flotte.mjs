#!/usr/bin/env node
/* signaux-flotte.mjs — les contrôles de dérive, un par sous-commande.
 *
 * Chaque signal répond à la même convention : il n'écrit RIEN quand tout va
 * bien, et une ligne par anomalie sinon. C'est ce qui permet à la skill
 * galahad de les enchaîner à coût nul et de ne solliciter le modèle qu'une
 * fois, sur des sorties déjà réduites.
 *
 *   node scripts/signaux-flotte.mjs            tous les signaux
 *   node scripts/signaux-flotte.mjs <signal>   un seul
 *
 * Les identifiants de signaux sont cités par les ADR de la série SHK : une ADR
 * qui énonce une règle vérifiable nomme ici le contrôle qui la défend.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { parseYaml } from "./yaml.mjs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const RACINE = process.env.SHINKIRO_HOME || join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (f) => (existsSync(join(RACINE, f)) ? readFileSync(join(RACINE, f), "utf8") : null);

const FY = lire("fleet.yml");
const LK = lire("fleet.lock.yml");
if (!FY || !LK) {
  console.log(`[signal indisponible] fleet.yml ou fleet.lock.yml introuvable sous ${RACINE} — définir SHINKIRO_HOME`);
  process.exit(0);
}

/* Le lecteur YAML vit dans yaml.mjs — une seule implémentation, importée ici
 * et par le portail. Corrigée une fois, correcte partout. */

const fleet = parseYaml(FY);
const lock  = parseYaml(LK);

const composantsFY  = fleet.composants || [];
const lignesMortesFY = (fleet.lignees_mortes || []).map((e) => e.nom).filter(Boolean);
const horsPerimetre  = new Set(Object.values(fleet.hors_perimetre || {}).flat());
const composantsLK   = lock.composants || [];
const sansTopic      = lock.sans_topic || [];
const derives        = fleet.derives_non_canon || [];

const parNom   = Object.fromEntries(composantsLK.map((c) => [c.nom, c]));
const declares = new Set([...composantsFY.map((c) => c.nom), ...lignesMortesFY]);

/* ── les signaux ───────────────────────────────────────────────────────── */
const SIGNAUX = {

  /* SHK-0001 — un dépôt du compte qui n'est ni dans la flotte, ni écarté
   * nommément, n'existe pour personne. C'est ainsi que cinq outils ont vécu
   * hors de tout manifeste jusqu'au 14 septembre 2026. */
  "non-classe": () =>
    sansTopic.filter((r) => !horsPerimetre.has(r))
      .map((r) => `${r} — ni topic shinkiro, ni écarté par hors_perimetre`),

  /* SHK-0001 — le topic dit l'appartenance, fleet.yml dit le rôle. Un dépôt
   * qui a le premier sans le second est entré dans la flotte sans être jugé.
   * Le dépôt du programme lui-même est exempt : il porte le manifeste, il n'y
   * figure pas. Encore faut-il qu'il se nomme — d'où `programme:`. */
  "absent-du-manifeste": () =>
    composantsLK.filter((c) => !declares.has(c.nom) && c.nom !== fleet.programme)
      .map((c) => `${c.nom} — porte le topic shinkiro mais absent de fleet.yml`),

  /* SHK-0001 — fleet.yml déclare une licence choisie ; le relevé dit si le
   * fichier existe. Douze dépôts sur treize n'en avaient aucun. */
  "licence-absente": () =>
    composantsFY.filter((c) => parNom[c.nom]?.licence === "ABSENTE")
      .map((c) => `${c.nom} — fleet.yml déclare « ${c.licence} », aucun fichier LICENSE dans le dépôt`),

  /* SHK-0001 — `vitalite` est un jugement. Le relevé peut le démentir, et
   * c'est ce démenti qui est le signal : un composant dit actif sans un seul
   * commit en quatre-vingt-dix jours ne l'est pas. */
  "vitalite-dementie": () =>
    composantsFY.filter((c) => c.vitalite === "actif" && Number(parNom[c.nom]?.commits_90j) === 0)
      .map((c) => `${c.nom} — déclaré actif, zéro commit sur 90 jours`),

  /* SHK-0001 — trois composants ont leur point d'entrée en sous-dossier. Une
   * racine déclarée que le dépôt ne porte pas rend le composant indéployable
   * pour qui suit le manifeste, sans qu'aucune erreur ne le dise. */
  "racine-fantome": () =>
    composantsFY.flatMap((c) => {
      const racine = c.deploiement?.racine;
      if (!racine || !parNom[c.nom]) return [];
      const reelles = parNom[c.nom].racines || [];
      return reelles.includes(racine) ? []
        : [`${c.nom} — racine déclarée « ${racine} », absente du dépôt (relevées : ${reelles.join(", ") || "aucune"})`];
    }),

  /* SHK-0001 — un point d'entrée statique qui n'est pas dans le dépôt rend le
   * composant inouvrable. Le relevé porte les racines, pas les fichiers : on
   * vérifie donc que la racine existe, et que le mode statique en déclare une
   * ou un fichier à la racine du dépôt. */
  "entree-fantome": () =>
    composantsFY.flatMap((c) => {
      const d = c.deploiement || {};
      if (d.mode !== "statique" || !d.entree) return [];
      const reelles = parNom[c.nom]?.racines || [];
      const attendue = d.racine || ".";
      return reelles.includes(attendue) ? []
        : [`${c.nom} — entrée « ${d.entree} » annoncée sous « ${attendue} », qui ne porte aucun point d'entrée`];
    }),

  /* SHK-0001 — le jugement ne réénonce pas les faits. Un champ factuel qui
   * réapparaît dans fleet.yml est une régression vers le manifeste écrit à la
   * main, qui était vrai le jour du relevé et faux au commit suivant. */
  "faits-dans-le-jugement": () =>
    [...FY.matchAll(/^\s{4}(volumetrie|fichiers|poids_ko|poids_mo|commits_90j|branche|topics):/gm)]
      .map((m) => `fleet.yml réénonce « ${m[1]} » — ce fait appartient à fleet.lock.yml`),

  /* SHK-0001 — deux étages, et deux seulement. Un outil versé sans submodule
   * sous tools/ est versé sur le papier uniquement. */
  "etage-invalide": () =>
    composantsFY.flatMap((c) => {
      if (!["reference", "verse"].includes(c.etage)) return [`${c.nom} — etage « ${c.etage} » : attendu reference ou verse`];
      if (c.etage !== "verse") return [];
      return (lire(".gitmodules") || "").includes(`tools/${c.nom}`) ? []
        : [`${c.nom} — déclaré versé, aucun submodule tools/${c.nom} dans .gitmodules`];
    }),

  /* SHK-0002 — deux composants qui se partagent une source doivent le dire, et
   * dire qui la possède. C'est le contrôle qui aurait épargné l'ADR-0100 : son
   * auteur, contraint de déclarer qui possède Argos, aurait trouvé Argos-studio
   * au lieu de reconstruire son backend un mois plus tard.
   *
   * Déclaratif et sans réseau, donc exécutable par la patrouille à coût nul. Une
   * recherche de code dirait mieux, mais ne détecte qu'un symbole DÉJÀ dupliqué —
   * celui-ci détecte l'intention de le faire. */
  "source-partagee": () => {
    const parts = composantsFY.flatMap((c) =>
      [].concat(c.source_partagee || []).filter((x) => x && x.produit)
        .map((x) => ({ composant: c.nom, ...x })));

    const produits = [...new Set(parts.map((p) => p.produit))];
    const erreurs = [];

    for (const prod of produits) {
      const groupe = parts.filter((p) => p.produit === prod);
      const canoniques = groupe.filter((p) => p.role === "canonique");
      if (canoniques.length === 0)
        erreurs.push(`source « ${prod} » — aucun composant ne la possède (${groupe.map((g) => g.composant).join(", ")})`);
      if (canoniques.length > 1)
        erreurs.push(`source « ${prod} » — ${canoniques.length} composants se déclarent canoniques : ${canoniques.map((c) => c.composant).join(", ")}`);
      for (const g of groupe) {
        if (!["canonique", "client"].includes(g.role))
          erreurs.push(`${g.composant} — role « ${g.role } » sur « ${prod} » : attendu canonique ou client`);
        else if (g.role === "client" && !g.via)
          erreurs.push(`${g.composant} — client de « ${prod} » sans interface déclarée (champ via)`);
      }
    }
    return erreurs;
  },

  /* SHK-0003 — une affirmation de duplication sans chiffre est une opinion, et
   * une opinion écrite dans un manifeste finit par être lue comme un fait. Ce
   * manifeste a porté « le moteur existe en trois exemplaires, dette
   * structurelle n°1 » : c'était faux, et un plan en a découlé.
   *
   * Toute déclaration de divergence porte donc sa mesure et sa date. Quand les
   * deux dépôts se trouvent clonés côte à côte, le contrôle la REFAIT : un
   * chiffre déclaré à plus de dix points de la réalité est une dérive, pas une
   * approximation. Sinon il vérifie seulement qu'elle n'a pas plus de 90 jours. */
  "divergence-perimee": () =>
    composantsFY.flatMap((c) => {
      const d = c.divergence;
      if (!d) return [];
      const manquants = ["avec", "chemin", "mesure_pct", "le"].filter((k) => !(k in d));
      if (manquants.length) return [`${c.nom} — divergence déclarée sans ${manquants.join(", ")}`];

      /* Re-mesure si les deux dépôts sont là : ROOT est le répertoire qui
       * accueille make clone-all, soit le parent de shinkiro. */
      const ici = join(RACINE, "..", c.nom, d.chemin);
      const la  = join(RACINE, "..", d.avec, d.chemin);
      if (existsSync(ici) && existsSync(la)) {
        try {
          const sortie = execFileSync(process.execPath,
            [join(RACINE, "scripts/mesure-divergence.mjs"), ici, la],
            { encoding: "utf8", timeout: 60000 });
          const reel = Number(sortie.match(/^mesure_pct:\s*(\d+)/m)?.[1]);
          if (Number.isFinite(reel) && Math.abs(reel - Number(d.mesure_pct)) > 10)
            return [`${c.nom} — divergence déclarée ${d.mesure_pct} % avec ${d.avec}, mesurée ${reel} % à l'instant`];
          return [];
        } catch { /* la mesure a échoué : on retombe sur le contrôle de fraîcheur */ }
      }

      const jours = Math.floor((Date.now() - Date.parse(String(d.le))) / 864e5);
      return jours > 90
        ? [`${c.nom} — divergence avec ${d.avec} mesurée il y a ${jours} jours, jamais revérifiée`]
        : [];
    }),

  /* Le manifeste et le portefeuille numérotaient les produits différemment —
   * 00/04/05 d'un côté, 01 à 07 de l'autre — et les TROIS valeurs déclarées
   * étaient fausses. Personne ne l'avait vu parce qu'aucun contrôle ne lisait
   * les deux fichiers ensemble. Une dérive n'a pas besoin de deux dépôts pour
   * exister : deux documents du même dépôt suffisent. */
  "produit-inconnu": () => {
    const doc = lire("docs/PORTFOLIO.md");
    if (!doc) return ["docs/PORTFOLIO.md introuvable — la liste des produits n'a plus de référence"];
    const connus = [...doc.matchAll(/^\|\s*(\d{2})\s*\|\s*\*\*(.+?)\*\*/gm)]
      .map((m) => `${m[1]} · ${m[2].trim()}`);
    if (!connus.length) return ["docs/PORTFOLIO.md ne déclare aucun produit — le tableau a changé de forme"];
    return composantsFY.flatMap((c) =>
      [].concat(c.produits_portefeuille || []).filter(Boolean)
        .filter((p) => !connus.includes(p))
        .map((p) => `${c.nom} — produit « ${p} » absent de docs/PORTFOLIO.md (connus : ${connus.join(" · ")})`));
  },

  /* Les skills encodent une partie de la méthode et n'ont pas suivi le
   * programme. Elles vivent hors de tout dépôt, donc hors de portée des onze
   * autres signaux — l'audit n'inspecte que GitHub. Le seul contrôle possible
   * est déclaratif : chaque dérivé nomme le composant qui fait foi, et ce
   * composant existe. Un dérivé dont le canon a disparu est une copie devenue
   * la seule source, sans que personne l'ait décidé. */
  "derive-sans-canon": () =>
    derives.flatMap((d) => {
      const manquants = ["nom", "ou", "canon"].filter((k) => !d?.[k]);
      if (manquants.length) return [`dérivé ${d?.nom || "(sans nom)"} — déclaré sans ${manquants.join(", ")}`];
      if (d.canon === "hors-programme") return [];
      return declares.has(d.canon) ? []
        : [`${d.nom} — canon déclaré « ${d.canon} », qui n'est pas un composant de fleet.yml`];
    }),

  /* Le portail est généré depuis fleet.yml et fleet.lock.yml. S'il a été
   * publié avant leur dernière modification, il montre un programme qui
   * n'existe plus — et il le montre à qui vient regarder. Comparer des dates
   * ne suffirait pas : le manifeste peut changer deux fois le même jour. On
   * compare donc l'empreinte exacte que le portail a inscrite en se générant. */
  "portail-perime": () => {
    const src = lire("portail/site/source.json");
    if (!src) return existsSync(join(RACINE, "portail/construire.mjs"))
      ? ["portail/site/source.json absent — le portail n'a jamais été généré"] : [];
    let decl;
    try { decl = JSON.parse(src); } catch { return ["portail/site/source.json illisible"]; }
    const reelle = createHash("sha256")
      .update(lire("fleet.yml") || "").update(lire("fleet.lock.yml") || "")
      .digest("hex").slice(0, 16);
    return decl.empreinte_sources === reelle ? []
      : [`portail généré sur un manifeste qui a changé depuis (${decl.empreinte_sources} ≠ ${reelle}) — lancer node portail/construire.mjs`];
  },

  /* La série SHK ne survit que si l'audit la lit. Une ADR acceptée qui énonce
   * une règle vérifiable nomme son signal ; sans quoi la décision est écrite
   * et rien ne la défend. Une ADR peut déclarer « aucun » — c'est un choix,
   * pas un oubli. */
  "adr-sans-signal": () => {
    const dir = join(RACINE, "docs/adr");
    if (!existsSync(dir)) return [];
    const connus = Object.keys(SIGNAUX);
    return readdirSync(dir).filter((f) => /^SHK-\d{4}.*\.md$/.test(f)).sort().flatMap((f) => {
      const t = readFileSync(join(dir, f), "utf8");
      if (!/^\s*-\s*\*\*Statut\*\*\s*:\s*Accepted/m.test(t)) return [];
      const sect = t.match(/^## Signal d'audit\n([\s\S]*?)(?=^## |$(?![\s\S]))/m);
      if (!sect) return [`${f} — Accepted, aucune section « Signal d'audit »`];
      /* Un signal cité mais inexistant est pire qu'aucun signal : l'ADR a
       * l'air défendue et ne l'est pas. C'est la dérive sous sa forme la
       * plus sournoise — un document qui affirme un contrôle absent. */
       /* Un identifiant de signal se déclare en tête d'item de liste, comme
        * le prescrit docs/adr/README.md — sans quoi le moindre mot entre
        * accents graves passerait pour un contrôle. */
      const nommes = [...sect[1].matchAll(/^[-*]\s+`([a-z][a-z0-9-]+)`/gm)].map((m) => m[1]);
      const inventes = nommes.filter((n) => !connus.includes(n));
      if (inventes.length) return inventes.map((n) => `${f} — cite le signal « ${n} », qui n'existe pas dans signaux-flotte.mjs`);
      if (nommes.length) return [];
      if (/\baucun\b/i.test(sect[1])) return [];
      return [`${f} — Accepted, section présente mais aucun signal cité`];
    });
  },

  /* Le relevé n'est utile que frais. Au-delà de quinze jours, fleet.lock.yml
   * redevient ce qu'il remplaçait : un instantané qui affirme. */
  "releve-perime": () => {
    const d = String(lock.releve_le || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return ["fleet.lock.yml ne porte pas de date de relevé"];
    const jours = Math.floor((Date.now() - Date.parse(d)) / 864e5);
    return jours > 15 ? [`relevé vieux de ${jours} jours (${d}) — lancer make releve`] : [];
  },
};

/* ── sortie ──────────────────────────────────────────────────────────────
 * Par défaut le script sort en 0 même s'il trouve : c'est ce qu'attend le
 * runner galahad, qui interrompt une skill dès qu'une étape rend non nul et
 * n'atteindrait jamais son point de décision.
 *
 * --strict inverse la convention pour la CI, où « j'ai trouvé une dérive » doit
 * teindre le job en rouge. Les deux appelants ont besoin de conventions
 * opposées ; mieux vaut un drapeau qu'un second script. */
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const demande = args.find((a) => !a.startsWith("--"));
if (demande && !(demande in SIGNAUX)) {
  console.error(`Signal inconnu « ${demande} ». Connus : ${Object.keys(SIGNAUX).join(", ")}`);
  process.exit(2);
}

let total = 0;
for (const [nom, f] of Object.entries(SIGNAUX)) {
  if (demande && nom !== demande) continue;
  let lignes = [];
  try { lignes = f() || []; } catch (e) { lignes = [`[contrôle en échec] ${nom} : ${e.message}`]; }
  total += lignes.length;
  for (const l of lignes) console.log(demande ? l : `${nom}: ${l}`);
}
if (!demande && total === 0) console.log("COHÉRENT — aucune dérive");
if (strict && total > 0) process.exit(1);
