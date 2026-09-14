# Shinkiro — matérialiser la flotte
#
# La flotte n'est pas un monorepo : chaque composant garde son dépôt, sa CI et
# son cycle de vie. Ce Makefile la rassemble localement en une commande.
#
#   make clone-all   clone tout ce qui est référencé, dans ../
#   make pull-all    met à jour ce qui est déjà cloné
#   make status      état git de chaque composant
#   make build-order rappelle l'ordre de construction
#   make tools       initialise les outils versés (submodules)
#   make releve      régénère fleet.lock.yml depuis GitHub
#   make derive      relève et échoue si le .lock committé ne reflète plus la réalité

OWNER  := xtincell
ROOT   := ..
# Les deux étages sortent de fleet.yml, jamais d'une liste tenue à la main :
# une liste en dur est exactement la chose qui dérive. Un composant `reference`
# se clone à côté ; un composant `verse` vit sous tools/ en submodule, et
# clone-all ne doit pas en faire un second exemplaire.
REFS   := $(shell awk '/^  - nom: /{n=$$3} /^    etage: reference/{print n}' fleet.yml)
VERSES := $(shell awk '/^  - nom: /{n=$$3} /^    etage: verse/{print n}' fleet.yml)

.PHONY: clone-all pull-all status build-order tools releve derive help

help:
	@sed -n 's/^#   //p' Makefile

clone-all:
	@for r in $(REFS); do \
	  if [ -d "$(ROOT)/$$r/.git" ]; then printf "  = %s\n" "$$r"; \
	  else printf "  + %s\n" "$$r"; gh repo clone $(OWNER)/$$r "$(ROOT)/$$r" -- -q || printf "  ! %s inaccessible\n" "$$r"; fi; \
	done
	@printf "\n%s composants autonomes dans %s. Les outils versés sont sous tools/ : make tools\n" "$(words $(REFS))" "$(ROOT)"
	@printf "Ordre de construction : make build-order\n"

pull-all:
	@for r in $(REFS); do \
	  [ -d "$(ROOT)/$$r/.git" ] && printf "  %-24s %s\n" "$$r" "$$(git -C $(ROOT)/$$r pull -q 2>&1 | tail -1 || echo ko)"; \
	done

status:
	@printf "%-26s %-10s %s\n" COMPOSANT BRANCHE MODIFS
	@for r in $(REFS); do \
	  if [ -d "$(ROOT)/$$r/.git" ]; then \
	    printf "%-26s %-10s %s\n" "$$r" "$$(git -C $(ROOT)/$$r branch --show-current)" \
	      "$$(git -C $(ROOT)/$$r status --porcelain | wc -l | tr -d ' ')"; \
	  else printf "%-26s %s\n" "$$r" "absent"; fi; \
	done

build-order:
	@echo "1 · galahad       moteur d'agents — se lance et se vérifie seul"
	@echo "2 · radar         le journal task_events, base de toute mesure"
	@echo "3 · talos/hulysse/danmem   modules du moteur, pas avant que galahad tourne"
	@echo "4 · la-barre      poste de travail — ouvrir index.html, rien à installer"
	@echo "5 · ADVE-project  ~100 Mo, 17 workflows, 192 ADR — EN DERNIER"
	@echo "6 · Argos-studio / charadesign-generator   autonomes"
	@echo ""
	@echo "Détail et tests de vie : AGENTS.md"

tools:
	@git submodule update --init --recursive
	@printf "Outils versés sous tools/ : %s\n" "$(VERSES)"

# ── le relevé ──────────────────────────────────────────────────────────────
# fleet.yml est le jugement, fleet.lock.yml sont les faits. Les faits se
# recalculent ; leur diff est ce qui a bougé dans la flotte.

releve:
	@node scripts/releve-flotte.mjs

# En CI : relève, puis échoue si le fichier committé n'est plus à jour.
# Le diff affiché EST le rapport — pas besoin d'en écrire un autre.
derive: releve
	@git diff --quiet --exit-code fleet.lock.yml || { \
	  printf "\nDÉRIVE — fleet.lock.yml committé ne reflète plus GitHub :\n\n"; \
	  git --no-pager diff fleet.lock.yml; \
	  printf "\nCorriger avec : make releve && git add fleet.lock.yml\n"; exit 1; }
	@echo "Flotte conforme au relevé committé."
