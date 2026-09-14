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

import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = process.env.SHINKIRO_HOME || join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (f) => (existsSync(join(RACINE, f)) ? readFileSync(join(RACINE, f), "utf8") : null);

const FY = lire("fleet.yml");
const LK = lire("fleet.lock.yml");
if (!FY || !LK) {
  console.log(`[signal indisponible] fleet.yml ou fleet.lock.yml introuvable sous ${RACINE} — définir SHINKIRO_HOME`);
  process.exit(0);
}

/* ── lecture YAML, sous-ensemble suffisant et structurel ────────────────
 * Lire ces deux fichiers à coups d'expressions régulières casse dès que le
 * manifeste gagne un niveau d'indentation — c'est arrivé à la première
 * écriture de ce script, sur le bloc `contient:` de galahad. Un lecteur par
 * indentation tient là où les regex lâchent, et coûte quarante lignes plutôt
 * qu'une dépendance à maintenir.
 *
 * Couvre ce que les deux fichiers utilisent : maps imbriquées, listes de maps,
 * flow inline {a: 1, b: [x]}, scalaires de bloc >- et |, commentaires. */

/* En YAML, un « # » précédé d'une espace ouvre un commentaire — sauf entre
 * guillemets. `programme: shinkiro   # ce dépôt-ci` vaut « shinkiro », pas la
 * phrase entière ; sans cette règle, aucune valeur commentée n'est lisible. */
const sansCommentaire = (v) => {
  let guillemet = null;
  for (let i = 0; i < v.length; i++) {
    const c = v[i];
    if (guillemet) { if (c === guillemet) guillemet = null; continue; }
    if (c === '"' || c === "'") { guillemet = c; continue; }
    if (c === "#" && (i === 0 || /\s/.test(v[i - 1]))) return v.slice(0, i);
  }
  return v;
};

const deflow = (v) => {
  v = sansCommentaire(v).trim();
  if (v.startsWith("{") && v.endsWith("}")) {
    const o = {};
    for (const part of decoupeFlow(v.slice(1, -1))) {
      const i = part.indexOf(":");
      if (i > 0) o[part.slice(0, i).trim()] = deflow(part.slice(i + 1));
    }
    return o;
  }
  if (v.startsWith("[") && v.endsWith("]")) return decoupeFlow(v.slice(1, -1)).map(deflow);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
};

/* Découpe sur les virgules de premier niveau : une virgule dans "a, b" ou dans
 * [x, y] n'est pas un séparateur. */
const decoupeFlow = (s) => {
  const out = []; let prof = 0, cur = "", guillemet = null;
  for (const c of s) {
    if (guillemet) { cur += c; if (c === guillemet) guillemet = null; continue; }
    if (c === '"' || c === "'") { guillemet = c; cur += c; continue; }
    if (c === "{" || c === "[") prof++;
    if (c === "}" || c === "]") prof--;
    if (c === "," && prof === 0) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
};

function parseYaml(texte) {
  const lignes = texte.split("\n")
    .filter((l) => l.trim() && !/^\s*#/.test(l))
    .map((l) => ({ indent: l.match(/^ */)[0].length, txt: l.trim(), brut: l }));

  let i = 0;
  const bloc = (indentMin) => {
    /* Une liste si la première ligne du bloc commence par « - », sinon une map. */
    const liste = i < lignes.length && lignes[i].txt.startsWith("- ");
    const out = liste ? [] : {};
    while (i < lignes.length && lignes[i].indent >= indentMin) {
      const { indent, txt } = lignes[i];
      if (indent > indentMin) { i++; continue; }        // continuation d'un scalaire de bloc
      if (liste !== txt.startsWith("- ")) break;

      if (liste) {
        const corps = txt.slice(2);
        const j = corps.indexOf(":");
        if (corps.startsWith("{") || j < 0) { out.push(deflow(corps)); i++; continue; }
        /* « - nom: x » ouvre un élément dont les champs suivent à indent + 2 */
        const el = {};
        el[corps.slice(0, j).trim()] = deflow(corps.slice(j + 1));
        i++;
        if (i < lignes.length && lignes[i].indent > indent) Object.assign(el, bloc(lignes[i].indent));
        out.push(el);
        continue;
      }

      const j = txt.indexOf(":");
      const cle = txt.slice(0, j).trim();
      const reste = txt.slice(j + 1).trim();
      i++;
      if (reste && !/^[>|][-+]?$/.test(reste)) { out[cle] = deflow(reste); continue; }
      /* scalaire de bloc, ou map imbriquée */
      if (i < lignes.length && lignes[i].indent > indent) {
        if (/^[>|]/.test(reste)) {
          const buf = [];
          while (i < lignes.length && lignes[i].indent > indent) buf.push(lignes[i++].txt);
          out[cle] = buf.join(" ");
        } else out[cle] = bloc(lignes[i].indent);
      } else out[cle] = "";
    }
    return out;
  };
  return bloc(0);
}

const fleet = parseYaml(FY);
const lock  = parseYaml(LK);

const composantsFY  = fleet.composants || [];
const lignesMortesFY = (fleet.lignees_mortes || []).map((e) => e.nom).filter(Boolean);
const horsPerimetre  = new Set(Object.values(fleet.hors_perimetre || {}).flat());
const composantsLK   = lock.composants || [];
const sansTopic      = lock.sans_topic || [];

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
