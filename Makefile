NODE_VERSION           ?= 6.9.4

IONIC_BINARY           := ionic
IONIC_CMD_SERVE        := serve -c

NPM_BINARY             := npm
NPM_CMD_INSTALL_GLOBAL := install -g

install_global_npm     = sudo $(NPM_BINARY) $(NPM_CMD_INSTALL_GLOBAL) $(1)

run: run-development

run-development: 
	@$(IONIC_BINARY) $(IONIC_CMD_SERVE)

install: clean install-global-binaries install-local-deps install-typings restore-ionic-state
	@echo "Done! Run 'make run' to serve the application locally."

install-global-binaries:
	@echo "Installing global binaries..."
	@$(call install_global_npm,ionic@2.2.1)
	@$(call install_global_npm,cordova@6.5.0)
	@$(call install_global_npm,typings@2.1.0)

install-local-deps:
	@echo "Installing local npm dependencies"
	@npm install
	# There's a duplicate typings, which can be removed
	@rm node_modules/angularfire2/node_modules/firebase/firebase.d.ts 

install-typings:
	@echo "Installing typings from typings.json..."
	@typings install

restore-ionic-state:
	@ionic state restore

clean:
	@rm -rf ./node_modules
