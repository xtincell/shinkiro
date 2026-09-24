#!/usr/bin/env node
/* construire.mjs — génère le portail depuis le manifeste.
 *
 * Un portail écrit à la main est faux la semaine suivante : c'est la maladie
 * que tout ce dépôt combat, et il serait absurde de l'introduire par sa propre
 * vitrine. Celui-ci ne contient donc AUCUNE affirmation qui ne vienne d'un
 * fichier — fleet.yml pour le jugement, fleet.lock.yml pour les faits, les
 * documents pour la doctrine, les ADR pour les décisions, et signaux-flotte.mjs
 * pour la liste des contrôles.
 *
 * Tout ce qui est affiché porte sa source. Ce qui est déduit est marqué déduit.
 *
 *   node portail/construire.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseYaml } from "../scripts/yaml.mjs";
import { rendre, inline, ancre } from "./markdown.mjs";

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, "..");
const SORTIE = join(ICI, "site");

const lire = (f) => readFileSync(join(RACINE, f), "utf8");
const existe = (f) => existsSync(join(RACINE, f));

const fleet = parseYaml(lire("fleet.yml"));
const lock = parseYaml(lire("fleet.lock.yml"));
const LOCK_PAR_NOM = Object.fromEntries((lock.composants || []).map((c) => [c.nom, c]));

/* ── petites aides ──────────────────────────────────────────────────── */

const ech = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const etiquette = (v, prefixe = "") =>
  v ? `<span class="et et-${ancre(String(v))}">${ech(prefixe)}${ech(v)}</span>` : "";

const source = (chemin, deduit = false) =>
  `<span class="source${deduit ? " infere" : ""}">${ech(chemin)}</span>`;

const encart = (titre, corps, variante = "") => corps
  ? `<div class="encart ${variante}"><div class="encart-titre">${ech(titre)}</div>${
      /^\s*</.test(corps) ? corps : `<p>${inline(corps)}</p>`}</div>`
  : "";

const ko = (n) => n == null ? "—"
  : n >= 1024 ? `${(n / 1024).toFixed(n >= 10240 ? 0 : 1)} Mo` : `${n} Ko`;

/* ── la page ────────────────────────────────────────────────────────── */

const NAV = [
  ["index.html", "Accueil"],
  ["suite.html", "La suite"],
  ["la-barre.html", "La Barre"],
  ["catalogue.html", "Le catalogue"],
  ["topologie.html", "Topologie"],
  ["decisions.html", "Décisions"],
  ["dispositif.html", "Anti-dérive"],
  ["livrables.html", "Livrables"],
  ["perimetre.html", "Périmètre"],
];

function page({ fichier, titre, sous = "", corps, profondeur = 0 }) {
  const base = "../".repeat(profondeur);
  const nav = NAV.map(([h, n]) =>
    `<a href="${base}${h}"${h === fichier ? ' aria-current="page"' : ""}>${n}</a>`).join("");
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ech(titre)} — Shinkiro</title>
<meta name="description" content="${ech(sous || titre)}">
<link rel="stylesheet" href="${base}style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#9673;</text></svg>">
</head>
<body>
<header class="bandeau"><div class="bandeau-int">
<a class="marque" href="${base}index.html">◉ SHIN<span>KIRO</span></a>
<nav class="nav">${nav}</nav>
</div></header>
<main>
${corps}
</main>
<footer class="pied">
<p>Généré par <code>portail/construire.mjs</code> depuis <code>fleet.yml</code>,
<code>fleet.lock.yml</code> et <code>docs/</code>. Relevé du ${ech(lock.releve_le)}.
Rien n'est écrit ici à la main : ce qui est faux dans le portail est faux dans le manifeste.</p>
</footer>
</body>
</html>`;
  const dest = join(SORTIE, fichier);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
}

/* Les liens internes des documents pointent vers d'autres .md : on les réécrit
 * vers les pages du portail quand elles existent, sinon vers GitHub. */
const DOC_VERS_PAGE = {
  "PORTFOLIO.md": "catalogue.html", "TOPOLOGIE.md": "topologie.html",
  "DERIVE.md": "dispositif.html", "CLOISON.md": "perimetre.html",
  "LA-BARRE.md": "la-barre.html",
  "MATURITE.md": "maturite.html", "INTERFACES.md": "interfaces.html",
  "adr/README.md": "decisions.html",
};
const lienDoc = (profondeur) => (href) => {
  if (/^(https?:|#|mailto:)/.test(href)) return href;
  const base = "../".repeat(profondeur);
  const propre = href.replace(/^\.\//, "").replace(/^\.\.\//, "");
  for (const [md, pg] of Object.entries(DOC_VERS_PAGE))
    if (propre.endsWith(md)) return base + pg;
  const adr = propre.match(/(SHK-\d{4}[^/]*)\.md/);
  if (adr) return `${base}decisions.html#${ancre(adr[1])}`;
  if (/^adr\/?$/.test(propre)) return `${base}decisions.html`;
  if (propre.endsWith(".md")) return `https://github.com/xtincell/shinkiro/blob/main/docs/${propre}`;
  /* Tout ce qui n'est pas une page du portail est un fichier du dépôt : on y
   * renvoie plutôt que de fabriquer un lien qui ne mène nulle part. Le contrôle
   * des liens morts a trouvé `fleet.yml` et `adr/` dans cet état. */
  const depuisRacine = existsSync(join(RACINE, propre));
  if (depuisRacine) return `https://github.com/xtincell/shinkiro/blob/main/${propre}`;
  return `https://github.com/xtincell/shinkiro/blob/main/docs/${propre}`;
};

/* ── 1 · accueil ────────────────────────────────────────────────────── */

const readme = lire("README.md");
const sectionMd = (md, titre) => {
  const re = new RegExp(`^##+\\s+${titre}[\\s\\S]*?(?=^##\\s|\\Z)`, "m");
  const m = md.match(re);
  return m ? m[0] : "";
};

function accueil() {
  const composants = fleet.composants || [];
  const parCouche = {};
  for (const c of composants) (parCouche[c.couche] ||= []).push(c);

  const COUCHES = {
    method: ["01 · Méthode", "la propriété intellectuelle"],
    company: ["02 · Entreprise", "ce qui parle au marché"],
    execution: ["03 · Exécution", "agents et infrastructure"],
    tools: ["04 · Outils métier", "ce qui démontre"],
  };

  const corps = `
<h1>Shinkiro</h1>
<p class="intro">Le programme qui industrialise la chaîne de valeur créative — du brief au
livrable, du diagnostic au paiement. ${composants.length} composants, ${
  (fleet.derives_non_canon || []).length} dérivés déclarés, et un dispositif qui
empêche cette page de mentir.</p>

<div class="grille grille-4">
  <div class="carte"><div class="chiffre">${composants.length}</div><div class="chiffre-lib">composants</div></div>
  <div class="carte"><div class="chiffre">${lock.depots}</div><div class="chiffre-lib">dépôts relevés</div></div>
  <div class="carte"><div class="chiffre">${
    (lock.composants || []).reduce((n, c) => n + (+c.fichiers || 0), 0).toLocaleString("fr-FR")
  }</div><div class="chiffre-lib">fichiers</div></div>
  <div class="carte"><div class="chiffre">${
    ko((lock.composants || []).reduce((n, c) => n + (+c.poids_ko || 0), 0))
  }</div><div class="chiffre-lib">d'arbre</div></div>
</div>

<h2 id="a-ne-pas-confondre">Trois noms, trois choses</h2>
<div class="grille grille-3">
  <div class="carte"><h3>Shinkiro</h3><p class="sous"><strong>Le programme, et la suite.</strong>
  Il ne porte aucun code de produit : le manifeste, l'ordre de construction, les décisions,
  l'audit, et la présentation qu'il génère de lui-même.</p></div>
  <div class="carte"><h3><code>galahad</code></h3><p class="sous"><strong>Un produit du
  portefeuille.</strong> Une équipe d'IA organisée en agents qui fait tourner l'agence en
  autonomie depuis un serveur dédié.</p></div>
  <div class="carte"><h3>ADVE</h3><p class="sous"><strong>La méthode.</strong> La couche
  décisionnelle : elle dit quoi construire et pourquoi. Son dépôt canonique est
  <code>ADVE-project</code>.</p></div>
</div>
<p>${source("docs/adr/SHK-0001-programme-et-deux-etages.md")}</p>

${rendre(sectionMd(readme, "La thèse").replace(/^##\s+La thèse\s*/m, "## La thèse\n"), lienDoc(0))}

<h2 id="les-quatre-couches">Les quatre couches</h2>
<p>Ce ne sont pas des étages hiérarchiques : c'est le trajet d'une affirmation, de sa
formulation à sa démonstration.</p>
<div class="grille grille-2">
${Object.entries(COUCHES).map(([cle, [nom, quoi]]) => `  <div class="carte">
    <h3>${nom}</h3><p class="sous">${quoi}</p>
    <div class="ets">${(parCouche[cle] || []).map((c) =>
      `<a class="et" href="composants/${ancre(c.nom)}.html">${ech(c.nom)}</a>`).join("")}</div>
  </div>`).join("\n")}
</div>

<section class="entree-metier">
<h2>La suite, à hauteur de métier</h2>
<p>${inline(String(composants.find(c => c.nom === "la-barre")?.description || ""))}</p>
<a href="la-barre.html">Comprendre le parcours La Barre</a>
<p>${source("fleet.yml")} ${source("docs/LA-BARRE.md")}</p>
</section>
<h2 id="entrer">Par où entrer</h2>
<div class="grille grille-2">
  <a class="carte" href="suite.html"><h3>La suite →</h3><p class="sous">Les ${composants.length}
  composants, un par un : rôle, déploiement, volumétrie relevée, ce qui manque, points de
  vigilance. Sans filtre.</p></a>
  <a class="carte" href="catalogue.html"><h3>Le catalogue →</h3><p class="sous">Les sept
  produits, ce qui les livre, leurs livrables dérivés du code — chaque ligne sourcée — et ce
  qui manque pour les vendre.</p></a>
  <a class="carte" href="dispositif.html"><h3>Le dispositif anti-dérive →</h3><p class="sous">
  Pourquoi le manifeste se recalcule, les quatorze contrôles, et l'angle mort assumé.</p></a>
  <a class="carte" href="decisions.html"><h3>Les décisions →</h3><p class="sous">La série
  <code>SHK-</code> : ce qui arbitre entre composants, et le signal qui défend chaque ADR.</p></a>
</div>`;
  page({ fichier: "index.html", titre: "Le programme", sous: "Shinkiro — le programme, la suite, et le dispositif qui l'empêche de dériver", corps });
}

/* ── 2 · la suite ───────────────────────────────────────────────────── */

const LIB_COUCHE = { method: "Méthode", company: "Entreprise", execution: "Exécution", tools: "Outils métier" };

function suite() {
  const composants = fleet.composants || [];
  const lignes = composants.map((c) => {
    const l = LOCK_PAR_NOM[c.nom] || {};
    return `<tr data-couche="${ech(c.couche)}" data-etage="${ech(c.etage)}" data-maturite="${ech(c.maturite)}">
      <td><a href="composants/${ancre(c.nom)}.html"><code>${ech(c.nom)}</code></a></td>
      <td>${ech(LIB_COUCHE[c.couche] || c.couche)}</td>
      <td>${etiquette(c.etage)}</td>
      <td>${etiquette(c.maturite)}</td>
      <td>${etiquette(c.vitalite)}</td>
      <td><code>${ech(c.deploiement?.mode || "—")}</code></td>
      <td class="n">${l.fichiers ?? "—"}</td>
      <td class="n">${ko(l.poids_ko)}</td>
      <td class="n">${l.commits_90j ?? "—"}</td>
    </tr>`;
  }).join("\n");

  const boutons = (cle, valeurs) => valeurs.map((v) =>
    `<button class="filtre" data-cle="${cle}" data-val="${ech(v)}" aria-pressed="false">${ech(LIB_COUCHE[v] || v)}</button>`).join("");

  const corps = `
<h1>La suite</h1>
<p class="intro">${composants.length} composants. Chacun s'adopte seul ou dans la suite —
c'est ce que recouvre la distinction <code>reference</code> / <code>verse</code> : ce qu'un
client peut prendre seul, contre ce qui n'a de sens que dans le flux d'un autre.</p>

<div class="filtres">
  ${boutons("couche", ["method", "company", "execution", "tools"])}
  ${boutons("etage", ["reference", "verse"])}
  ${boutons("maturite", ["produit", "utilisable", "partiel", "a-qualifier"])}
  <button class="filtre" data-raz="1">tout</button>
</div>

<div class="table-enveloppe"><table id="flotte">
<thead><tr><th>Composant</th><th>Couche</th><th>Étage</th><th>Maturité</th><th>Vitalité</th>
<th>Déploiement</th><th class="n">Fichiers</th><th class="n">Poids</th><th class="n">90 j</th></tr></thead>
<tbody>${lignes}</tbody>
</table></div>
<p>${source("fleet.yml")} ${source("fleet.lock.yml")}</p>

<h2 id="ordre">L'ordre de construction</h2>
<p>Un agent qui découvre le programme ne commence pas où il veut.</p>
<div class="table-enveloppe"><table><thead><tr><th>#</th><th>Composant</th><th>Pourquoi là</th></tr></thead><tbody>
${composants.filter((c) => c.ordre_construction)
  .sort((a, b) => a.ordre_construction - b.ordre_construction)
  .map((c) => `<tr><td><code>${c.ordre_construction}</code></td>
    <td><a href="composants/${ancre(c.nom)}.html"><code>${ech(c.nom)}</code></a></td>
    <td>${inline(String(c.attention || c.description || "").slice(0, 150))}…</td></tr>`).join("")}
</tbody></table></div>
<p>${source("fleet.yml")} · détail dans <code>AGENTS.md</code></p>

<script>
(function () {
  var actifs = {};
  var lignes = [].slice.call(document.querySelectorAll('#flotte tbody tr'));
  function appliquer() {
    lignes.forEach(function (tr) {
      var ok = Object.keys(actifs).every(function (k) {
        return !actifs[k].length || actifs[k].indexOf(tr.dataset[k]) > -1;
      });
      tr.hidden = !ok;
    });
  }
  document.querySelectorAll('.filtre').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.raz) {
        actifs = {};
        document.querySelectorAll('.filtre').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        return appliquer();
      }
      var k = b.dataset.cle, v = b.dataset.val;
      actifs[k] = actifs[k] || [];
      var i = actifs[k].indexOf(v);
      if (i > -1) { actifs[k].splice(i, 1); b.setAttribute('aria-pressed', 'false'); }
      else { actifs[k].push(v); b.setAttribute('aria-pressed', 'true'); }
      appliquer();
    });
  });
})();
</script>`;
  page({ fichier: "suite.html", titre: "La suite", sous: `Les ${composants.length} composants du programme`, corps });
}

/* ── 3 · une fiche par composant ────────────────────────────────────── */

function fiches() {
  const composants = fleet.composants || [];
  for (const c of composants) {
    const l = LOCK_PAR_NOM[c.nom] || {};
    const url = `https://github.com/xtincell/${c.nom}`;

    const dep = c.deploiement || {};
    const depLignes = Object.entries(dep).map(([k, v]) =>
      `<tr><td><code>${ech(k)}</code></td><td>${
        Array.isArray(v) ? v.map((x) => `<code>${ech(x)}</code>`).join(" ") :
        /^https?:/.test(String(v)) ? `<a href="${ech(v)}">${ech(v)}</a>` : `<code>${ech(v)}</code>`
      }</td></tr>`).join("");

    const contient = c.contient ? Object.entries(c.contient).map(([k, v]) =>
      `<tr><td><code>${ech(k)}</code></td><td>${
        Array.isArray(v) ? v.map((x) => `<code>${ech(x)}</code>`).join(" ") : inline(String(v))
      }</td></tr>`).join("") : "";

    const artefacts = l.artefacts ? Object.entries(l.artefacts).map(([k, v]) =>
      `<tr><td><code>${ech(k)}</code></td><td>${[].concat(v).map((x) => `<code>${ech(x)}</code>`).join(" ")}</td></tr>`).join("") : "";

    const produits = [].concat(c.produits_portefeuille || []);

    const corps = `
<p class="fil"><a href="../index.html">Shinkiro</a> › <a href="../suite.html">La suite</a> ›
${ech(LIB_COUCHE[c.couche] || c.couche)}</p>

<h1><code>${ech(c.nom)}</code></h1>
<div class="ets" style="margin:-.4rem 0 1rem">
  ${etiquette(c.etage)} ${etiquette(c.maturite)} ${etiquette(c.vitalite)}
  <span class="et">${ech(LIB_COUCHE[c.couche] || c.couche)}</span>
  <span class="et">${ech(c.licence || "—")}</span>
  ${l.prive === false ? '<span class="et et-actif">public</span>' : '<span class="et">privé</span>'}
</div>

<p class="intro">${inline(String(c.description || ""))}</p>

${c.parcours ? `<p><a class="carte" href="${lienDoc(1)(c.parcours)}">Le parcours métier et ses connexions</a></p>` : ""}
${produits.length ? `<h2 id="produits">Ce qu'il sert</h2>
<div class="grille grille-2">${produits.map((p) =>
  `<a class="carte" href="../produits/${p.slice(0, 2)}.html"><h3>${ech(p)}</h3></a>`).join("")}</div>
<p>${source("fleet.yml")}</p>` : ""}

${encart("Point de vigilance", c.attention ? inline(String(c.attention)) : "", "encart-attention")}
${encart("Ce qui manque", c.manque ? inline(String(c.manque)) : "", "encart-manque")}
${encart("La pépite", c.pepite ? inline(String(c.pepite)) : "", "encart-pepite")}
${encart("Divergence mesurée", c.divergence
  ? `<p>Diverge de <code>${ech(c.divergence.avec)}</code> de <strong>${ech(c.divergence.mesure_pct)} %</strong>
     sur <code>${ech(c.divergence.chemin)}</code>, mesuré le ${ech(c.divergence.le)}.
     Reproductible : <code>node scripts/mesure-divergence.mjs</code>.</p>` : "")}
${encart("Source partagée", c.source_partagee
  ? `<p>Produit <code>${ech(c.source_partagee.produit)}</code> — rôle
     <strong>${ech(c.source_partagee.role)}</strong>${c.source_partagee.via
       ? ` via <code>${ech(c.source_partagee.via)}</code>` : ""}. Voir
     <a href="../decisions.html#shk-0002-argos-une-bibliotheque-deux-surfaces">SHK-0002</a>.</p>` : "")}
${c.voir_aussi ? encart("Voir aussi", inline(String(c.voir_aussi))) : ""}

<h2 id="deploiement">Déploiement</h2>
<div class="table-enveloppe"><table><tbody>${depLignes}</tbody></table></div>
<p>${source("fleet.yml")} — mode constaté dans le dépôt, jamais supposé.</p>

<h2 id="releve">Ce que le relevé constate</h2>
<div class="grille grille-3">
  <div class="carte"><div class="chiffre">${l.fichiers ?? "—"}</div><div class="chiffre-lib">fichiers</div></div>
  <div class="carte"><div class="chiffre">${ko(l.poids_ko)}</div><div class="chiffre-lib">d'arbre</div></div>
  <div class="carte"><div class="chiffre">${l.commits_90j ?? "—"}</div><div class="chiffre-lib">commits / 90 j</div></div>
</div>
<div class="table-enveloppe"><table><tbody>
<tr><td>branche</td><td><code>${ech(l.branche || "—")}</code></td></tr>
<tr><td>langue</td><td>${l.langue && l.langue !== "null" ? `<code>${ech(l.langue)}</code>` : "—"}</td></tr>
<tr><td>fichier LICENSE</td><td>${l.licence === "presente"
  ? '<span class="et et-actif">présent</span>'
  : '<span class="et et-a-qualifier">ABSENT</span>'}</td></tr>
<tr><td>topics</td><td>${[].concat(l.topics || []).map((t) => `<code>${ech(t)}</code>`).join(" ") || "—"}</td></tr>
<tr><td>racines déployables</td><td>${[].concat(l.racines || []).map((t) => `<code>${ech(t)}</code>`).join(" ") || "—"}</td></tr>
</tbody></table></div>
${artefacts ? `<h3>Artefacts détectés</h3>
<div class="table-enveloppe"><table><tbody>${artefacts}</tbody></table></div>` : ""}
<p>${source("fleet.lock.yml")} — relevé du ${ech(lock.releve_le)}, régénéré par <code>make releve</code>.</p>

${contient ? `<h2 id="contient">Ce qu'il contient</h2>
<div class="table-enveloppe"><table><tbody>${contient}</tbody></table></div>
<p>${source("fleet.yml")}</p>` : ""}

${c.stack ? `<h2 id="stack">Stack</h2><p>${[].concat(c.stack).map((s) => `<code>${ech(s)}</code>`).join(" ")}</p>` : ""}

<h2 id="depot">Le dépôt</h2>
<p><a href="${url}">${url}</a></p>`;

    page({ fichier: `composants/${ancre(c.nom)}.html`, titre: c.nom, sous: String(c.description || "").slice(0, 160), corps, profondeur: 1 });
  }
}

/* ── 4 · documents rendus tels quels ────────────────────────────────── */

function documents() {
  const DOCS = [
    ["topologie.html", "docs/TOPOLOGIE.md", "Topologie"],
    ["dispositif.html", "docs/DERIVE.md", "Anti-dérive"],
    ["maturite.html", "docs/MATURITE.md", "Maturité"],
    ["interfaces.html", "docs/INTERFACES.md", "Interfaces"],
    ["la-barre.html", "docs/LA-BARRE.md", "La Barre, du brief à la décision"],
  ];
  for (const [fichier, doc, titre] of DOCS) {
    if (!existe(doc)) continue;
    let md = lire(doc);
    /* DERIVE.md porte un tableau des signaux écrit à la main : lisible sur
     * GitHub, mais périssable. Le portail le REMPLACE par celui qu'il extrait
     * de scripts/signaux-flotte.mjs — la liste vivante chasse la copie. */
    if (fichier === "dispositif.html") {
      md = md.replace(/^\| Signal \| Ce qu'il empêche \|\n\|[-\s|]+\|\n(?:\|.*\n)+/m, "@@SIGNAUX@@\n");
    }
    let corps = rendre(md, lienDoc(0));
    if (fichier === "dispositif.html") {
      corps = corps.includes("@@SIGNAUX@@")
        ? corps.replace(/<p>@@SIGNAUX@@<\/p>/, signauxHtml())
        : corps + signauxHtml();
    }
    corps += `\n<p>${source(doc)}</p>`;
    page({ fichier, titre, sous: titre, corps });
  }
}

/* Les contrôles sont extraits de leur source, pas recopiés : la liste et les
 * commentaires qui les justifient vivent dans signaux-flotte.mjs. */
function signauxHtml() {
  const src = lire("scripts/signaux-flotte.mjs");
  const bloc = src.slice(src.indexOf("const SIGNAUX = {"));
  const re = /\/\*([\s\S]*?)\*\/\s*"([a-z][a-z0-9-]+)":/g;
  const out = [];
  let m;
  while ((m = re.exec(bloc))) {
    const texte = m[1].split("\n").map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .join(" ").replace(/\s+/g, " ").trim();
    out.push([m[2], texte]);
  }
  const tous = [...bloc.matchAll(/^\s{2}"([a-z][a-z0-9-]+)":/gm)].map((x) => x[1]);
  for (const s of tous) if (!out.some(([n]) => n === s)) out.push([s, ""]);
  return `
<p>Extraits de <code>scripts/signaux-flotte.mjs</code> — la liste vivante, pas une copie.
Chacun n'écrit rien quand tout va bien.</p>
<div class="table-enveloppe"><table><thead><tr><th>Signal</th><th>Ce qu'il empêche</th></tr></thead><tbody>
${out.map(([n, t]) => `<tr><td><code>${ech(n)}</code></td><td>${inline(t)}</td></tr>`).join("\n")}
</tbody></table></div>
<p>${source("scripts/signaux-flotte.mjs")}</p>`;
}

/* ── 5 · les décisions ──────────────────────────────────────────────── */

function decisions() {
  const dir = join(RACINE, "docs/adr");
  const fichiers = readdirSync(dir).filter((f) => /^SHK-\d{4}.*\.md$/.test(f)).sort();
  const corps = `
<h1>Les décisions de flotte</h1>
${rendre(lire("docs/adr/README.md").replace(/^#\s+.*$/m, "").replace(/^## Index[\s\S]*$/m, ""), lienDoc(0))}

${fichiers.map((f) => {
  const md = lire(`docs/adr/${f}`);
  const titre = (md.match(/^#\s+(.*)$/m) || [, f])[1];
  return `<section id="${ancre(titre)}">\n${rendre(md, lienDoc(0))}\n<p>${source(`docs/adr/${f}`)}</p></section>`;
}).join("\n<hr>\n")}`;
  page({ fichier: "decisions.html", titre: "Décisions", sous: `La série SHK — ${fichiers.length} décisions de flotte`, corps });
}

/* ── 6 · le périmètre ───────────────────────────────────────────────── */

function perimetre() {
  const mortes = fleet.lignees_mortes || [];
  const derives = fleet.derives_non_canon || [];
  const hors = fleet.hors_perimetre || {};

  const corps = `
<h1>Le périmètre</h1>
<p class="intro">Ce qui appartient au programme, ce qui n'y appartient pas, et ce qui
ressemble à un actif du programme sans en être un.</p>

<h2 id="derives">Dérivés non canon — ${derives.length} skills</h2>
<p>Des skills encodent une partie de la méthode. Elles <strong>n'ont pas suivi l'évolution
du programme</strong> : ce sont des copies figées, pas des sources. Les verser dans la flotte
ferait deux porteurs d'une même source sans propriétaire désigné — ce que
<a href="decisions.html#shk-0002-argos-une-bibliotheque-deux-surfaces">SHK-0002</a> interdit.</p>
<div class="encart encart-attention"><div class="encart-titre">Angle mort assumé</div>
<p>L'audit n'inspecte que des dépôts GitHub. Une skill vivant dans un compte Claude
n'est vue par <strong>aucun</strong> des contrôles. Les déclarer ici est tout ce qu'on peut
en faire.</p></div>
<div class="table-enveloppe"><table><thead><tr><th>Skill</th><th>Où elle vit</th><th>Qui fait foi</th><th>Note</th></tr></thead><tbody>
${derives.map((d) => `<tr><td><code>${ech(d.nom)}</code></td><td><code>${ech(d.ou)}</code></td>
  <td>${d.canon === "hors-programme" ? '<span class="et">hors programme</span>'
    : `<a href="composants/${ancre(d.canon)}.html"><code>${ech(d.canon)}</code></a>`}</td>
  <td>${d.note ? inline(String(d.note)) : "—"}</td></tr>`).join("\n")}
</tbody></table></div>
<p>${source("fleet.yml")}</p>

<h2 id="lignees">Lignées archivées — ${mortes.length}</h2>
<p>La méthode a été éclatée en plusieurs dépôts sous trois orthographes. <code>ADVE-project</code>
est canonique ; celles-ci portent le topic pour l'historique, hors flotte vivante.</p>
<div class="table-enveloppe"><table><thead><tr><th>Dépôt</th><th>Fichiers</th><th>Note</th></tr></thead><tbody>
${mortes.map((m) => {
  const l = LOCK_PAR_NOM[m.nom] || {};
  return `<tr><td><code>${ech(m.nom)}</code></td><td>${l.fichiers ?? "—"}</td><td>${inline(String(m.note || ""))}</td></tr>`;
}).join("\n")}
</tbody></table></div>
<p>${source("fleet.yml")} ${source("fleet.lock.yml")}</p>

<h2 id="cloison">La cloison</h2>
${rendre(lire("docs/CLOISON.md").replace(/^#\s+.*$/m, ""), lienDoc(0))}
<div class="table-enveloppe"><table><thead><tr><th>Nature</th><th>Dépôts</th></tr></thead><tbody>
${Object.entries(hors).map(([k, v]) =>
  `<tr><td><code>${ech(k)}</code></td><td>${[].concat(v).map((x) => `<code>${ech(x)}</code>`).join(" ")}</td></tr>`).join("\n")}
</tbody></table></div>
<p>${source("fleet.yml")} ${source("docs/CLOISON.md")}</p>`;
  page({ fichier: "perimetre.html", titre: "Périmètre", sous: "Ce qui appartient au programme, et ce qui n'y appartient pas", corps });
}


/* ── 7 · le catalogue ───────────────────────────────────────────────── */

const LIVRABLES = existsSync(join(ICI, "donnees/livrables.json"))
  ? JSON.parse(readFileSync(join(ICI, "donnees/livrables.json"), "utf8")) : { familles: [] };

/* Chaque famille de livrables vient d'un dépôt. Ce dépôt sert des produits,
 * déclarés dans fleet.yml. La chaîne produit → composant → famille est donc
 * DÉRIVÉE, jamais inventée. */
const DEPOT_DE_FAMILLE = {
  "La production créative": "la-barre",
  "Le document stratégique": "ADVE-project",
  "Le déploiement multi-marchés": "market-expansion-system",
};

const portfolio = lire("docs/PORTFOLIO.md");

const PRODUITS = [...portfolio.matchAll(/^\| (\d{2}) \| \*\*(.+?)\*\* \| (.+?) \| (.+?) \|$/gm)]
  .map((m) => ({ num: m[1], nom: m[2].trim(), prix: m[3].trim(), livre: m[4].trim() }));

const ECHELLE = (portfolio.match(/^FREE CHECK.*$/m) || [""])[0]
  .split("→").map((x) => x.trim()).filter(Boolean);

/* Les composants qui servent un produit : déclaré dans fleet.yml, pas déduit
 * du texte de PORTFOLIO.md — le manifeste fait foi et l'audit le vérifie
 * (signal produit-inconnu). */
const composantsDuProduit = (num) => (fleet.composants || [])
  .filter((c) => [].concat(c.produits_portefeuille || []).some((p) => p.startsWith(num)));

function catalogue() {
  const criteres = (portfolio.match(/^## Le sixième critère\n([\s\S]*?)(?=^## )/m) || [, ""])[1];

  const corps = `
<h1>Le catalogue</h1>
<p class="intro">Ce qui se vend n'est pas ce qui livre — mais c'est une règle de
<strong>nommage</strong>, pas de visibilité. On ne vend pas « des agents IA » : on vend une
agence qui tourne toute seule sur un serveur dédié. Même logiciel, autre cadrage.</p>

<h2 id="echelle">L'échelle</h2>
<div class="echelle">
${PRODUITS.map((p) => `  <a class="echelon" href="produits/${p.num}.html">
    <span class="num">${p.num}</span><span class="nom">${ech(p.nom)}</span>
    <span class="prix">${ech(p.prix)}</span></a>`).join("\n")}
</div>
<p>${source("docs/PORTFOLIO.md")}</p>

<h2 id="qui-livre-quoi">Qui livre quoi</h2>
<div class="table-enveloppe"><table>
<thead><tr><th>#</th><th>Produit</th><th>Prix</th><th>Composants déclarés</th></tr></thead><tbody>
${PRODUITS.map((p) => {
  const cs = composantsDuProduit(p.num);
  return `<tr><td><code>${p.num}</code></td>
    <td><a href="produits/${p.num}.html">${ech(p.nom)}</a></td>
    <td>${ech(p.prix)}</td>
    <td>${cs.length ? cs.map((c) => `<a class="et" href="composants/${ancre(c.nom)}.html">${ech(c.nom)}</a>`).join(" ")
      : '<span class="et et-a-qualifier">aucun</span>'}</td></tr>`;
}).join("\n")}
</tbody></table></div>
<p>${source("docs/PORTFOLIO.md")} pour les produits · ${source("fleet.yml")} pour les composants —
le signal <code>produit-inconnu</code> vérifie que les deux concordent.</p>

<h2 id="sixieme-critere">Le sixième critère</h2>
${rendre(criteres, lienDoc(0))}

<h2 id="livrables">Les livrables</h2>
<p>Ils ne sont documentés nulle part : ils existent en <strong>code</strong>, dans trois
dépôts. Extraits à la source, chacun porte son chemin.</p>
<div class="grille grille-3">
${LIVRABLES.familles.map((f) => `  <a class="carte" href="livrables.html#${ancre(f.titre)}">
    <h3>${ech(f.titre)}</h3><p class="sous">${ech(f.quoi)}</p>
    <div class="ets"><span class="source">${ech(f.source)}</span></div></a>`).join("\n")}
</div>

<h2 id="reste">Ce qu'il reste à faire</h2>
${rendre((portfolio.match(/^## Ce qu'il reste à faire\n([\s\S]*?)$/m) || [, ""])[1], lienDoc(0))}`;
  page({ fichier: "catalogue.html", titre: "Le catalogue", sous: "Les sept produits, ce qui les livre, et leurs livrables", corps });
}

function produits() {
  for (const p of PRODUITS) {
    const cs = composantsDuProduit(p.num);
    const depots = new Set(cs.map((c) => c.nom));
    const familles = LIVRABLES.familles.filter((f) => depots.has(DEPOT_DE_FAMILLE[f.titre]));

    const corps = `
<p class="fil"><a href="../index.html">Shinkiro</a> › <a href="../catalogue.html">Le catalogue</a> › ${p.num}</p>
<h1>${p.num} · ${ech(p.nom)}</h1>
<div class="ets" style="margin:-.4rem 0 1rem"><span class="et et-produit">${ech(p.prix)}</span></div>
<p class="intro">${inline(p.livre, lienDoc(1))}</p>
<p>${source("docs/PORTFOLIO.md")}</p>

<h2 id="livre-par">Ce qui le livre</h2>
${cs.length ? `<div class="grille grille-2">${cs.map((c) => `
  <a class="carte" href="../composants/${ancre(c.nom)}.html">
    <h3><code>${ech(c.nom)}</code></h3>
    <p class="sous">${inline(String(c.description || "").slice(0, 190))}…</p>
    <div class="ets">${etiquette(c.maturite)} ${etiquette(c.vitalite)}</div>
  </a>`).join("")}</div>
<p>${source("fleet.yml")} — champ <code>produits_portefeuille</code>.</p>`
: `<div class="encart encart-manque"><div class="encart-titre">Aucun composant déclaré</div>
<p>Aucun composant de <code>fleet.yml</code> ne revendique ce produit. Soit la déclaration
manque, soit le produit n'a pas encore de porteur.</p></div>`}

${familles.length ? `<h2 id="livrables">Les livrables</h2>
<p>Dérivés du code des composants ci-dessus. Chaque famille porte sa source.</p>
${familles.map((f) => `<div class="carte" style="margin:.9rem 0">
  <h3><a href="../livrables.html#${ancre(f.titre)}">${ech(f.titre)} →</a></h3>
  <p class="sous">${ech(f.quoi)}</p>
  ${f.types ? `<p>${f.types.map((t) => `<span class="et">${ech(t.nom)}</span>`).join(" ")}</p>` : ""}
  ${f.formats ? `<p>${f.formats.map((x) => `<span class="et">${ech(x.format)}</span>`).join(" ")}</p>` : ""}
  ${f.gabarits ? `<p>${f.gabarits.map((g) => `<span class="et">${ech(g.fichier)}</span>`).join(" ")}</p>` : ""}
  <div class="ets"><span class="source">${ech(f.source)}</span></div>
</div>`).join("")}`
: `<h2 id="livrables">Les livrables</h2>
<div class="encart encart-attention"><div class="encart-titre">Non documentés</div>
<p>Aucune des trois familles extraites ne provient d'un composant déclaré sur ce produit.
Ce qu'il remet au client reste à écrire — le portail montre le manque plutôt que de le combler.</p></div>`}`;

    page({ fichier: `produits/${p.num}.html`, titre: `${p.num} · ${p.nom}`, sous: p.prix, corps, profondeur: 1 });
  }
}

function livrables() {
  const corps = `
<h1>Les livrables</h1>
<p class="intro">Aucun document du programme ne dit ce que le client reçoit. Le code, lui, le
dit — dans trois dépôts. Cette page l'extrait à la source : <strong>chaque ligne porte son
chemin</strong>, et rien n'est affirmé qui n'ait été lu.</p>
<p>Extrait le ${ech(LIVRABLES.extrait_le)} par <code>portail/extraire-livrables.mjs</code>.</p>

${LIVRABLES.familles.map((f) => `
<h2 id="${ancre(f.titre)}">${ech(f.titre)}</h2>
<p>${ech(f.quoi)} ${source(f.source)}</p>

${f.types ? `<div class="table-enveloppe"><table>
<thead><tr><th>Livrable</th><th>Formats</th><th>Ce que c'est</th><th>Pour qui</th><th>Ce que coûte son absence</th></tr></thead><tbody>
${f.types.sort((a, b) => a.rang - b.rang).map((t) => `<tr>
  <td><strong>${ech(t.nom)}</strong>${t.signable ? ' <span class="et et-produit">signable</span>' : ""}</td>
  <td><code>${ech(t.extensions)}</code></td><td>${ech(t.quoi)}</td><td>${ech(t.pour)}</td>
  <td>${ech(t.cout)}</td></tr>`).join("\n")}
</tbody></table></div>` : ""}

${f.regles ? `<h3>Ce qu'un support exige</h3>
<p>Un support ne demande pas les quatre étages. Règles telles qu'elles sont exécutées :</p>
<div class="table-enveloppe"><table><thead><tr><th>Si</th><th>Alors</th></tr></thead><tbody>
${f.regles.map((r) => `<tr><td><code>${ech(r.condition)}</code></td><td><code>${ech(r.exige)}</code></td></tr>`).join("\n")}
${f.regle_par_defaut ? `<tr><td><em>sinon</em></td><td><code>${ech(f.regle_par_defaut)}</code></td></tr>` : ""}
</tbody></table></div>
<p>${source(f.source + " — fonction exiges()")}</p>` : ""}

${f.flux ? `<h3>Le flux</h3><pre class="code"><code>${ech(f.flux)}</code></pre>` : ""}
${f.formats ? `<div class="table-enveloppe"><table><thead><tr><th>Format</th><th>Pour</th></tr></thead><tbody>
${f.formats.map((x) => `<tr><td><code>${ech(x.format)}</code></td><td>${ech(x.pour)}</td></tr>`).join("\n")}
</tbody></table></div>` : ""}
${f.suivi ? `<h3>Le suivi</h3>
<p>États <code>${ech(f.suivi.etats)}</code>, calculés depuis <code>${ech(f.suivi.calcul)}</code>
— sauf surcharge opérateur explicite. ${source(f.suivi.source)}</p>` : ""}

${f.produit ? `<h3>Ce que le système produit</h3>${rendre(f.produit, lienDoc(0))}` : ""}
${f.ecarts ? `<h3>Les écarts autorisés</h3>${rendre(f.ecarts, lienDoc(0))}` : ""}
${f.chaine ? `<h3>La chaîne</h3>${rendre(f.chaine, lienDoc(0))}` : ""}
${f.gabarits ? `<h3>Les gabarits</h3>
<div class="table-enveloppe"><table><thead><tr><th>Fichier</th><th>Colonnes</th></tr></thead><tbody>
${f.gabarits.map((g) => `<tr><td><code>${ech(g.fichier)}</code></td>
  <td>${g.colonnes.map((c) => `<span class="et">${ech(c)}</span>`).join(" ")}</td></tr>`).join("\n")}
</tbody></table></div>` : ""}
`).join("\n<hr>\n")}`;
  page({ fichier: "livrables.html", titre: "Les livrables", sous: "Ce que le client reçoit, extrait du code", corps });
}

/* ── exécution ──────────────────────────────────────────────────────── */

rmSync(SORTIE, { recursive: true, force: true });
mkdirSync(SORTIE, { recursive: true });
copyFileSync(join(ICI, "style.css"), join(SORTIE, "style.css"));

accueil();
suite();
fiches();
documents();
decisions();
perimetre();
catalogue();
produits();
livrables();

/* Le portail déclare l'empreinte exacte des sources dont il est issu. Comparer
 * des dates ne suffirait pas : fleet.yml peut changer deux fois le même jour.
 * Le signal portail-perime recalcule cette empreinte — si elle diffère, le
 * portail affiche un manifeste qui n'existe plus. */
const empreinte = createHash("sha256")
  .update(lire("fleet.yml")).update(lire("fleet.lock.yml"))
  .digest("hex").slice(0, 16);

writeFileSync(join(SORTIE, "source.json"), JSON.stringify({
  genere_le: new Date().toISOString().slice(0, 10),
  releve_le: lock.releve_le,
  empreinte_sources: empreinte,
  composants: (fleet.composants || []).length,
  depots: lock.depots,
}, null, 2) + "\n");

const pages = [];
(function compte(d) {
  for (const f of readdirSync(d, { withFileTypes: true }))
    f.isDirectory() ? compte(join(d, f.name)) : f.name.endsWith(".html") && pages.push(f.name);
})(SORTIE);
process.stderr.write(`portail/site — ${pages.length} pages, relevé du ${lock.releve_le}\n`);
