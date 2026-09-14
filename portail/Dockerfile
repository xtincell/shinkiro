# Le portail est du HTML statique déjà généré et committé sous site/.
#
# Pourquoi ne pas le construire ici : le générateur lit fleet.yml, fleet.lock.yml
# et docs/, qui vivent à la racine du dépôt. Construire dans l'image obligerait
# à lui donner tout le dépôt en contexte pour produire des fichiers qu'un
# `node portail/construire.mjs` produit déjà en local, en une seconde.
#
# Le risque d'un site committé — qu'il vieillisse — est couvert : le signal
# portail-perime compare l'empreinte des sources inscrite dans site/source.json
# à celle du manifeste, et échoue si elles diffèrent.
FROM nginx:1.27-alpine

COPY site/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/source.json >/dev/null 2>&1 || exit 1
