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

OWNER  := xtincell
ROOT   := ..
REFS   := $(shell sed -n 's/^  - nom: //p' fleet.yml)
VERSES := indice-maturite market-expansion-system generateur-approches character-engine datacollector

.PHONY: clone-all pull-all status build-order tools help

help:
	@sed -n 's/^#   //p' Makefile

clone-all:
	@for r in $(REFS); do \
	  if [ -d "$(ROOT)/$$r/.git" ]; then printf "  = %s\n" "$$r"; \
	  else printf "  + %s\n" "$$r"; gh repo clone $(OWNER)/$$r "$(ROOT)/$$r" -- -q || printf "  ! %s inaccessible\n" "$$r"; fi; \
	done
	@printf "\nFlotte dans %s. Ordre de construction : make build-order\n" "$(ROOT)"

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
	@echo "5 · ADVE-project  150 Mo, 17 workflows, 192 ADR — EN DERNIER"
	@echo "6 · Argos-studio / charadesign-generator   autonomes"
	@echo ""
	@echo "Détail et tests de vie : AGENTS.md"

tools:
	@git submodule update --init --recursive
	@printf "Outils versés : %s\n" "$(VERSES)"
