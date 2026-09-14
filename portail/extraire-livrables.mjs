#!/usr/bin/env node
/* extraire-livrables.mjs — les livrables ne sont documentés nulle part.
 *
 * Ils existent en CODE, dans trois dépôts, et aucun document ne dit ce que le
 * client reçoit pour chaque produit. Ce script va les lire à la source et les
 * fige dans portail/donnees/livrables.json — chaque entrée portant le chemin
 * d'où elle vient.
 *
 * Même doctrine que fleet.lock.yml : des faits, régénérés, jamais écrits à la
 * main. Et le même refus de mentir — si une source ne peut pas être lue, le
 * fichier n'est PAS réécrit.
 *
 *   node portail/extraire-livrables.mjs
 */

import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ICI = dirname(fileURLToPath(import.meta.url));
const echecs = [];

const fichier = (depot, chemin, branche = "main") => {
  try {
    const b64 = execFileSync("gh", ["api", `repos/xtincell/${depot}/contents/${chemin}?ref=${branche}`, "--jq", ".content"],
      { encoding: "utf8", maxBuffer: 32 << 20 }).trim();
    return Buffer.from(b64, "base64").toString("utf8");
  } catch (e) {
    echecs.push(`${depot}/${chemin} — ${String(e.stderr || e.message).trim().split("\n")[0].slice(0, 120)}`);
    return null;
  }
};

/* ── 1 · la production créative — la-barre/app/production.js ──────────
 * TYPES y définit les étages d'une production : ce que c'est, pour qui, et
 * surtout LE COÛT DE SON ABSENCE. C'est cette dernière colonne qui fait la
 * valeur du modèle — elle dit pourquoi un livrable manquant se paie. */
function productionCreative() {
  const src = fichier("la-barre", "app/production.js");
  if (!src) return null;
  const bloc = src.slice(src.indexOf("var TYPES = {"), src.indexOf("/* Un support ne demande pas"));
  const types = [];
  /* Les entrées se ferment par « }, » en FIN de ligne, pas en début — la
   * première version de ce script attendait l'inverse et n'extrayait rien.
   * On découpe donc sur les clés de premier niveau plutôt que sur la
   * fermeture, qui n'a pas de forme stable. */
  const cles = [...bloc.matchAll(/^\s{4}(\w+):\s*\{/gm)];
  for (let k = 0; k < cles.length; k++) {
    const debut = cles[k].index;
    const fin = k + 1 < cles.length ? cles[k + 1].index : bloc.length;
    const entree = bloc.slice(debut, fin);
    const tete = entree.match(/(\w+):\s*\{\s*rang:\s*(\d+),\s*nom:\s*"([^"]+)",\s*ext:\s*"([^"]+)"/);
    if (!tete) continue;
    const m = [, tete[1], tete[2], tete[3], tete[4]];
    const reste = entree;
    const champ = (n) => {
      const x = reste.match(new RegExp(`${n}:\\s*"((?:[^"\\\\]|\\\\.)*)"(?:\\s*\\+\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)")?`));
      return x ? (x[1] + (x[2] || "")).replace(/\\"/g, '"') : null;
    };
    types.push({
      cle: m[1], rang: +m[2], nom: m[3], extensions: m[4],
      quoi: champ("quoi"), pour: champ("pour"), cout: champ("cout"),
      signable: /signable:\s*true/.test(reste),
    });
  }

  /* La règle support → livrables exigés. Recopiée telle qu'elle est écrite,
   * pas réinterprétée : c'est du code exécuté, pas une intention. */
  const ex = src.slice(src.indexOf("function exiges("), src.indexOf("function fichiers("));
  const regles = [...ex.matchAll(/if \((.+?)\) return (.+?);/g)].map((x) => ({ condition: x[1].trim(), exige: x[2].trim() }));
  const defaut = (ex.match(/\n\s*return (avantSignature[^;]+);/g) || []).pop();

  return {
    source: "la-barre/app/production.js",
    titre: "La production créative",
    quoi: "Ce qu'un livrable créatif exige pour être fini — et ce que coûte chaque pièce manquante.",
    types,
    regles,
    regle_par_defaut: defaut ? defaut.replace(/\n\s*return /, "").replace(/;$/, "") : null,
  };
}

/* ── 2 · le document stratégique — ADVE-project ───────────────────────
 * Le compilateur assemble des GloryOutputs en documents exportables. Le
 * routage de format est écrit dans son en-tête. */
function documentStrategique() {
  const src = fichier("ADVE-project", "src/server/services/artemis/tools/deliverable-compiler.ts");
  if (!src) return null;
  const entete = src.slice(0, src.indexOf("*/"));
  const formats = [...entete.matchAll(/^\s*\*\s+(PDF|HTML|JSON)\s+→\s+(.+)$/gm)]
    .map((m) => ({ format: m[1], pour: m[2].trim() }));
  const flux = (entete.match(/Flow:\s*\n\s*\*\s+(.+)/) || [, null])[1];

  const suivi = fichier("ADVE-project", "src/server/services/campaign-deliverable/index.ts");
  const rag = suivi ? (suivi.match(/Le RAG \(([^)]+)\) est \*\*calculé automatiquement\*\* depuis\s*\n\s*\*\s*(.+?),/s) || null) : null;

  return {
    source: "ADVE-project/src/server/services/artemis/tools/deliverable-compiler.ts",
    titre: "Le document stratégique",
    quoi: "Les sorties d'une séquence assemblées en document exportable.",
    flux: flux ? flux.trim() : null,
    formats,
    suivi: rag ? {
      source: "ADVE-project/src/server/services/campaign-deliverable/index.ts",
      etats: rag[1],
      calcul: rag[2].replace(/\s*\*\s*/g, " ").trim(),
    } : null,
  };
}

/* ── 3 · le déploiement multi-marchés — market-expansion-system ───────
 * Sa méthode dit ce que le système produit, et ses gabarits sont les
 * livrables eux-mêmes : leurs colonnes disent ce qu'on remet. */
function deploiementMarches() {
  const md = fichier("market-expansion-system", "METHODE.md");
  if (!md) return null;
  const section = (t) => {
    const m = md.match(new RegExp(`^## ${t}\\n([\\s\\S]*?)(?=^## |\\Z)`, "m"));
    return m ? m[1].trim() : null;
  };
  const gabarits = [];
  for (const g of ["cadrage-briefs.csv", "cadrage-matrice.csv", "matrice-deploiement-modele.csv"]) {
    const csv = fichier("market-expansion-system", `gabarits/${g}`);
    if (csv) gabarits.push({
      fichier: g, source: `market-expansion-system/gabarits/${g}`,
      colonnes: csv.split("\n")[0].split(",").map((c) => c.trim()).filter(Boolean),
      lignes: csv.trim().split("\n").length - 1,
    });
  }
  return {
    source: "market-expansion-system/METHODE.md",
    titre: "Le déploiement multi-marchés",
    quoi: "Un master, N marchés, sans perdre la marque.",
    produit: section("Ce que le système produit"),
    ecarts: section("Les quatre types d'écart"),
    chaine: section("La chaîne, du brief au bon à tirer"),
    gabarits,
  };
}

/* ── écriture ─────────────────────────────────────────────────────── */

const familles = [productionCreative(), documentStrategique(), deploiementMarches()].filter(Boolean);

if (echecs.length) {
  console.error(`EXTRACTION INCOMPLÈTE — ${echecs.length} source(s) illisible(s) :`);
  for (const e of echecs) console.error(`  ${e}`);
  console.error("\nlivrables.json n'est PAS réécrit : un catalogue amputé affirmerait moins qu'il n'y a.");
  process.exit(3);
}

mkdirSync(join(ICI, "donnees"), { recursive: true });
writeFileSync(join(ICI, "donnees/livrables.json"),
  JSON.stringify({ extrait_le: new Date().toISOString().slice(0, 10), familles }, null, 2) + "\n");

process.stderr.write(`portail/donnees/livrables.json — ${familles.length} familles, ${
  familles.reduce((n, f) => n + (f.types?.length || f.formats?.length || f.gabarits?.length || 0), 0)} entrées\n`);
