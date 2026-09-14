#!/usr/bin/env node
/* releve-flotte.mjs — régénère fleet.lock.yml depuis la réalité GitHub.
 *
 * fleet.yml porte le JUGEMENT : descriptions, arbitrages, points de vigilance,
 * ordre de construction. Écrit à la main, jamais généré.
 *
 * fleet.lock.yml porte les FAITS : volumétrie, topics, licence, branche,
 * vitalité, artefacts de déploiement. Ils périment au prochain commit, donc ils
 * se recalculent. Le diff du .lock est ce qui a bougé dans la flotte.
 *
 * Aucune dépendance npm — gh fournit l'authentification.
 *   node scripts/releve-flotte.mjs [--owner xtincell] [--topic shinkiro]
 */

import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const OWNER = arg("owner", "xtincell");
const TOPIC = arg("topic", "shinkiro");
const JOURS = 90;

const gh = (path, jq) => {
  try {
    const a = ["api", path];
    if (jq) a.push("--jq", jq);
    return execFileSync("gh", a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch {
    return "";
  }
};

/* Artefacts de déploiement, détectés dans l'arborescence. L'ordre compte :
 * Coolify pilote un docker-compose, donc « compose » se lit avant « dockerfile »,
 * sinon un déploiement Coolify passe pour un Docker autonome. */
const SIGNAUX = [
  ["compose",    /(^|\/)docker-compose\.ya?ml$/i],
  ["dockerfile", /(^|\/)Dockerfile$/],
  ["systemd",    /\.service$/],
  ["next",       /(^|\/)next\.config\.[tjm]s$/],
  ["vercel",     /(^|\/)vercel\.json$/],
  ["pages_edge", /(^|\/)(_redirects|_headers|netlify\.toml|wrangler\.toml)$/],
  ["index_html", /(^|\/)index\.html$/],
  ["package",    /(^|\/)package\.json$/],
  ["python",     /(^|\/)(requirements\.txt|pyproject\.toml|server\.py|main\.py)$/],
  ["prisma",     /(^|\/)prisma\//],
  ["workflows",  /^\.github\/workflows\//],
  ["env_example",/(^|\/)\.env\.example$/],
];

const depots = gh(
  `search/repositories?q=user:${OWNER}+topic:${TOPIC}&per_page=100`,
  ".items[].name"
).split("\n").filter(Boolean).sort();

if (!depots.length) {
  console.error(`Aucun dépôt portant le topic « ${TOPIC} » chez ${OWNER}. gh est-il authentifié ?`);
  process.exit(1);
}

const depuis = new Date(Date.now() - JOURS * 864e5).toISOString().slice(0, 10);
const releve = [];

for (const nom of depots) {
  const meta = JSON.parse(
    gh(`repos/${OWNER}/${nom}`,
       "{branche:.default_branch, prive:.private, archive:.archived, langue:.language}") || "{}");

  /* Les tailles viennent de l'arbre, pas de repos.size : ce dernier est calculé
   * en tâche de fond par GitHub et renvoie 0 sur un dépôt fraîchement créé. Un
   * chiffre qui bouge sans que rien n'ait bougé fabrique de fausses dérives ;
   * la somme des blobs est déterministe et sort de l'appel déjà fait. */
  const blobs = gh(`repos/${OWNER}/${nom}/git/trees/${meta.branche}?recursive=1`,
                   '.tree[] | select(.type=="blob") | "\\(.size)\\t\\(.path)"')
    .split("\n").filter(Boolean)
    .map((l) => { const i = l.indexOf("\t"); return { taille: +l.slice(0, i) || 0, chemin: l.slice(i + 1) }; });

  const arbre = blobs.map((b) => b.chemin);
  const poids_ko = Math.round(blobs.reduce((n, b) => n + b.taille, 0) / 1024);

  const artefacts = {};
  for (const [cle, re] of SIGNAUX) {
    const hits = arbre.filter((p) => re.test(p)).sort();
    if (hits.length) artefacts[cle] = hits.slice(0, 4);
  }

  const topics = gh(`repos/${OWNER}/${nom}/topics`, '.names | join(",")')
    .split(",").filter(Boolean).sort();

  releve.push({
    nom,
    branche: meta.branche || "?",
    prive: !!meta.prive,
    archive: !!meta.archive,
    langue: meta.langue || null,
    fichiers: arbre.length,
    poids_ko,
    licence: arbre.some((p) => /^LICEN[SC]E(\.[a-z]+)?$/i.test(p)) ? "presente" : "ABSENTE",
    topics,
    commits_90j: Number(gh(`repos/${OWNER}/${nom}/commits?since=${depuis}&per_page=100`, "length") || 0),
    artefacts,
  });
  process.stderr.write(`  ${nom.padEnd(26)} ${String(arbre.length).padStart(5)} fichiers · ${String(poids_ko).padStart(7)} Ko\n`);
}

/* Sérialisation YAML minimale — pas de dépendance pour écrire vingt lignes. */
const esc = (v) =>
  typeof v === "string" && /[:#\-{}[\],&*?|>'"%@`]|^\s|\s$|^$/.test(v) ? JSON.stringify(v) : v;
const liste = (a) => (a.length ? `[${a.map(esc).join(", ")}]` : "[]");

let out = `# fleet.lock.yml — RELEVÉ AUTOMATIQUE, NE PAS ÉDITER À LA MAIN
#
# Régénéré par scripts/releve-flotte.mjs depuis l'API GitHub.
# Le jugement — descriptions, arbitrages, vigilance — vit dans fleet.yml.
# Ici, uniquement des faits, et uniquement des faits déterministes : la
# volumétrie est la somme des blobs de l'arbre, pas repos.size, qui est calculé
# en tâche de fond et vaut 0 sur un dépôt neuf.
#
#   make releve                régénère ce fichier
#   git diff fleet.lock.yml    ce qui a bougé dans la flotte depuis le dernier relevé
#
releve_le: "${new Date().toISOString().slice(0, 10)}"
owner: ${OWNER}
topic: ${TOPIC}
fenetre_vitalite_jours: ${JOURS}
depots: ${releve.length}

composants:
`;

for (const d of releve) {
  out += `  - nom: ${d.nom}\n`;
  out += `    branche: ${d.branche}\n`;
  out += `    prive: ${d.prive}\n`;
  if (d.archive) out += `    archive: true\n`;
  out += `    langue: ${d.langue ? esc(d.langue) : "null"}\n`;
  out += `    fichiers: ${d.fichiers}\n`;
  out += `    poids_ko: ${d.poids_ko}\n`;
  out += `    licence: ${d.licence}\n`;
  out += `    commits_90j: ${d.commits_90j}\n`;
  out += `    topics: ${liste(d.topics)}\n`;
  const cles = Object.keys(d.artefacts);
  if (cles.length) {
    out += `    artefacts:\n`;
    for (const k of cles) out += `      ${k}: ${liste(d.artefacts[k])}\n`;
  }
}

const dest = "fleet.lock.yml";
const sansDate = (t) => t.replace(/^releve_le:.*$/m, "");
const avant = existsSync(dest) ? readFileSync(dest, "utf8") : "";
writeFileSync(dest, out);
const etat = !avant ? "création" : sansDate(avant) === sansDate(out) ? "aucun changement" : "CHANGEMENTS — lire le diff";
process.stderr.write(`\n${dest} — ${releve.length} composants · ${etat}\n`);
