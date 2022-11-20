#Copyright © 2022 Jon Allen <jon@ylixir.io>
#This work is free. You can redistribute it and/or modify it under the terms
#of the Just World License. See the top level LICENSE.md file for more details.

.PHONY: default build install uninstall clean check format

TSTL := npx tstl

# WoW will load the modules in the order they are specified here
MODULES := main
TARGET_DIR := ./dist
TARGETS := $(MODULES:%=$(TARGET_DIR)/%.lua)
SOURCES := $(MODULES:%=%.ts)
INSTALL_DIR ?= "/mnt/c/Program Files \(x86\)/World of Warcraft/_retail_/Interface/Addons/nyrotyc"

default: build
build: $(TARGET_DIR) $(TARGET_DIR)/nyrotyc.toc $(TARGET_DIR)/LICENSE.md $(TARGETS)

check:
	npx prettier --check .
format:
	npx prettier --write .
install: build
	mkdir -p "$(INSTALL_DIR)"
	cp -r $(TARGET_DIR)/. "$(INSTALL_DIR)"

uninstall:
	rm -rf "$(INSTALL_DIR)"

clean:
	rm -rf $(TARGET_DIR)
	rm -rf node_modules
	npm ci

$(TARGET_DIR):
	@echo "  $@"
	@mkdir -p $(TARGET_DIR)

$(TARGET_DIR)/LICENSE.md: LICENSE.md $(TARGET_DIR)
	@echo "  $@"
	@cp $< $@

# Note that we are injecting the file dependencies here
# so we don't have to track them in the TOC stub
$(TARGET_DIR)/nyrotyc.toc: nyrotyc.toc $(TARGET_DIR)
	@echo "  $@"
	@cp $< $@
	@echo $(MODULES:%=%.lua) | sed -e 's/\.lua\s/.lua\n/g' >> $@

# dist goes second so that the rule can target the source with $<
$(TARGET_DIR)/main.lua : src/main.ts src/nyrotapp/index.ts $(TARGET_DIR)
	@echo "  $@"
	@$(TSTL) --luaBundleEntry $< --luaBundle $@
