/* markdown.mjs — rendu Markdown vers HTML, sans dépendance.
 *
 * Les documents du programme sont écrits à la main en Markdown ; le portail les
 * rend tels quels. Couvre ce qu'ils utilisent réellement — titres, tableaux,
 * listes, citations, blocs de code, gras, italique, code inline, liens — et
 * rien de plus. Un moteur complet serait une dépendance à tenir à jour pour des
 * fonctions qu'aucun document n'emploie.
 */

const SENTINELLE = "";

const echappe = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Le style inline s'applique APRÈS échappement, sinon un `<div>` en code inline
 * ressortirait en balise. L'ordre compte aussi entre eux : le code inline se
 * pose en premier et met son contenu à l'abri du reste. */
export function inline(t, lien = (h) => h) {
  const codes = [];
  let s = echappe(t).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return SENTINELLE + (codes.length - 1) + SENTINELLE;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, href) => `<a href="${lien(href)}">${txt}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  return s.replace(new RegExp(SENTINELLE + "(\\d+)" + SENTINELLE, "g"), (_, i) => `<code>${codes[i]}</code>`);
}

const cellules = (l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

export const ancre = (t) => t.toLowerCase().normalize("NFD")
  .replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function rendre(md, lien = (h) => h) {
  const L = md.split("\n");
  const out = [];
  let i = 0;

  while (i < L.length) {
    const l = L[i];
    if (!l.trim()) { i++; continue; }

    if (l.startsWith("```")) {
      const langue = l.slice(3).trim();
      const buf = [];
      i++;
      while (i < L.length && !L[i].startsWith("```")) buf.push(L[i++]);
      i++;
      out.push(`<pre class="code"${langue ? ` data-langue="${echappe(langue)}"` : ""}><code>${echappe(buf.join("\n"))}</code></pre>`);
      continue;
    }

    const titre = l.match(/^(#{1,6})\s+(.*)$/);
    if (titre) {
      const n = titre[1].length;
      out.push(`<h${n} id="${ancre(titre[2])}">${inline(titre[2], lien)}</h${n}>`);
      i++; continue;
    }

    if (/^\s*[-*]{3,}\s*$/.test(l)) { out.push("<hr>"); i++; continue; }

    if (l.trimStart().startsWith("|") && L[i + 1] && /^\|[\s:|-]+\|?$/.test(L[i + 1].trim())) {
      const entete = cellules(l.trim());
      i += 2;
      const corps = [];
      while (i < L.length && L[i].trim().startsWith("|")) corps.push(cellules(L[i++].trim()));
      out.push(`<div class="table-enveloppe"><table><thead><tr>${
        entete.map((c) => `<th>${inline(c, lien)}</th>`).join("")}</tr></thead><tbody>${
        corps.map((r) => `<tr>${r.map((c) => `<td>${inline(c, lien)}</td>`).join("")}</tr>`).join("")
      }</tbody></table></div>`);
      continue;
    }

    if (l.trimStart().startsWith(">")) {
      const buf = [];
      while (i < L.length && L[i].trimStart().startsWith(">")) buf.push(L[i++].replace(/^\s*>\s?/, ""));
      out.push(`<blockquote>${rendre(buf.join("\n"), lien)}</blockquote>`);
      continue;
    }

    const puce = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (puce) {
      const ordonnee = /\d/.test(puce[2]);
      const base = puce[1].length;
      const items = [];
      const memeType = (m) => /\d/.test(m[2]) === ordonnee;
      while (i < L.length) {
        const m = L[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (m && m[1].length === base && memeType(m)) {
          const buf = [m[3]];
          i++;
          while (i < L.length && L[i].trim()
                 && !/^\s*([-*]|\d+\.)\s+/.test(L[i])
                 && L[i].match(/^ */)[0].length > base) buf.push(L[i++].trim());
          items.push(buf.join(" "));
          continue;
        }
        /* Une ligne vide ne coupe la liste que si la suivante la continue —
         * même indentation ET même nature. Sans le second test, « 1. » venait
         * s'ajouter à la liste à puces qui précédait. */
        const suiv = L[i + 1] && L[i + 1].match(/^(\s*)([-*]|\d+\.)\s+/);
        if (!L[i].trim() && suiv && suiv[1].length === base && /\d/.test(suiv[2]) === ordonnee) { i++; continue; }
        break;
      }
      const t = ordonnee ? "ol" : "ul";
      out.push(`<${t}>${items.map((x) => `<li>${inline(x, lien)}</li>`).join("")}</${t}>`);
      continue;
    }

    const buf = [];
    while (i < L.length && L[i].trim()
           && !/^(#{1,6}\s|```|\s*\||\s*>|\s*([-*]|\d+\.)\s)/.test(L[i])) buf.push(L[i++]);
    if (buf.length) out.push(`<p>${inline(buf.join(" "), lien)}</p>`);
    else i++;
  }
  return out.join("\n");
}

/* Le premier titre de niveau 1, pour nommer une page depuis son document. */
export const titreDe = (md) => (md.match(/^#\s+(.*)$/m) || [, null])[1];
