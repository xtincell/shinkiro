/* yaml.mjs — lecteur YAML, sous-ensemble suffisant et structurel.
 *
 * Lire fleet.yml à coups d'expressions régulières casse dès que le manifeste
 * gagne un niveau d'indentation — c'est arrivé sur le bloc `contient:` de
 * galahad, et seize faux positifs en sont sortis. Un lecteur par indentation
 * tient là où les regex lâchent, et coûte cent lignes plutôt qu'une dépendance
 * à maintenir.
 *
 * Couvre ce que les manifestes du programme utilisent : maps imbriquées, listes
 * de maps, flow inline {a: 1, b: [x]} y compris sur PLUSIEURS lignes, scalaires
 * de bloc >- et |, commentaires de fin de ligne.
 *
 * Une seule implémentation, importée par signaux-flotte.mjs et par le portail :
 * corrigée une fois, correcte partout.
 */

/* En YAML, un « # » précédé d'une espace ouvre un commentaire — sauf entre
 * guillemets. `programme: shinkiro   # ce dépôt-ci` vaut « shinkiro », pas la
 * phrase entière ; sans cette règle, aucune valeur commentée n'est lisible. */
export const sansCommentaire = (v) => {
  let guillemet = null;
  for (let i = 0; i < v.length; i++) {
    const c = v[i];
    if (guillemet) { if (c === guillemet) guillemet = null; continue; }
    if (c === '"' || c === "'") { guillemet = c; continue; }
    if (c === "#" && (i === 0 || /\s/.test(v[i - 1]))) return v.slice(0, i);
  }
  return v;
};

/* Solde des accolades et crochets hors guillemets. Positif = la flow map n'est
 * pas refermée, donc la ligne suivante la continue. */
const solde = (s) => {
  let n = 0, guillemet = null;
  for (const c of s) {
    if (guillemet) { if (c === guillemet) guillemet = null; continue; }
    if (c === '"' || c === "'") { guillemet = c; continue; }
    if (c === "{" || c === "[") n++;
    else if (c === "}" || c === "]") n--;
  }
  return n;
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

export const deflow = (v) => {
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

export function parseYaml(texte) {
  /* Préparation. Le découpage en lignes précède l'analyse, donc une flow map
   * écrite sur deux lignes — ce que fait tout `{nom: x,\n note: "…"}` un peu
   * long — devenait deux entrées dont aucune n'était lisible. Les lignes dont
   * la flow map n'est pas refermée absorbent donc la suivante AVANT tout le
   * reste. C'est le défaut qui faisait échouer quatre dérivés sur dix. */
  const brutes = texte.split("\n").filter((l) => l.trim() && !/^\s*#/.test(l));
  const lignes = [];
  for (let k = 0; k < brutes.length; k++) {
    let l = brutes[k];
    const indent = l.match(/^ */)[0].length;
    let txt = l.trim();
    while (solde(sansCommentaire(txt)) > 0 && k + 1 < brutes.length) txt += " " + brutes[++k].trim();
    lignes.push({ indent, txt });
  }

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
