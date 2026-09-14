#!/usr/bin/env node
/* mesure-divergence.mjs — chiffrer un recouvrement au lieu de l'affirmer.
 *
 * fleet.yml a longtemps porté la note « le moteur existe en trois exemplaires,
 * c'est la dette structurelle n°1 ». Personne ne l'avait mesurée. Elle était
 * fausse : galahad diverge de talos et de hulysse à plus de 70 %, tandis que
 * talos et hulysse ne divergent que de 17 %. Il n'y avait pas trois exemplaires
 * d'un moteur — il y en avait deux, et un troisième moteur différent.
 *
 * Une affirmation de duplication sans chiffre est une opinion. Ce script rend
 * le chiffre reproductible, et signaux-flotte.mjs vérifie qu'il est à jour.
 *
 *   node scripts/mesure-divergence.mjs <repertoire-a> <repertoire-b>
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const [a, b] = process.argv.slice(2);
if (!a || !b || !existsSync(a) || !existsSync(b)) {
  console.error("usage : mesure-divergence.mjs <repertoire-a> <repertoire-b>  (les deux doivent exister)");
  process.exit(2);
}

const fichiers = (d) => readdirSync(d).filter((f) => statSync(join(d, f)).isFile()).sort();
const lignes = (p) => readFileSync(p, "utf8").split("\n");

/* Plus longue sous-séquence commune, en lignes : c'est ce que calcule diff, et
 * c'est la seule mesure qui ne dépende pas de l'ordre des arguments. */
const communes = (x, y) => {
  const n = x.length, m = y.length;
  let prec = new Uint32Array(m + 1), cur = new Uint32Array(m + 1);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++)
      cur[j] = x[i - 1] === y[j - 1] ? prec[j - 1] + 1 : Math.max(prec[j], cur[j - 1]);
    [prec, cur] = [cur, prec];
    cur.fill(0);
  }
  return prec[m];
};

const fa = fichiers(a), fb = fichiers(b);
const partages = fa.filter((f) => fb.includes(f));

let totalLignes = 0, totalDiff = 0;
const detail = [];
for (const f of partages) {
  const x = lignes(join(a, f)), y = lignes(join(b, f));
  const c = communes(x, y);
  const diff = (x.length - c) + (y.length - c);
  const tot = x.length + y.length;
  totalLignes += tot; totalDiff += diff;
  detail.push({ f, pct: tot ? Math.round((diff * 100) / tot) : 0, a: x.length, b: y.length });
}

const pct = totalLignes ? Math.round((totalDiff * 100) / totalLignes) : 0;
detail.sort((p, q) => p.pct - q.pct);

console.log(`${a}\n${b}\n`);
for (const d of detail)
  console.log(`  ${String(d.pct).padStart(3)}%  ${d.f.padEnd(18)} ${d.a}/${d.b} lignes${d.pct === 0 ? "   identique" : ""}`);
for (const f of fa.filter((f) => !fb.includes(f))) console.log(`       ${f.padEnd(18)} à gauche seulement`);
for (const f of fb.filter((f) => !fa.includes(f))) console.log(`       ${f.padEnd(18)} à droite seulement`);
console.log(`\n  ${partages.length} fichiers partagés · divergence ${pct}%`);
console.log(`\nmesure_pct: ${pct}`);
