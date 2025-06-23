EXTENSION_NAME = nixos-tools@art-was-here.github.io
EXTENSION_DIR = $(HOME)/.local/share/gnome-shell/extensions/$(EXTENSION_NAME)

all: install

install: compile-schemas
	@echo "Installing NixOS Tools extension..."
	@mkdir -p $(EXTENSION_DIR)
	@cp -r . $(EXTENSION_DIR)
	@echo "Extension installed to: $(EXTENSION_DIR)"
	@echo "Please restart GNOME Shell (Alt+F2, type 'r', press Enter) or logout/login"
	@echo "Then enable the extension in GNOME Extensions app"

compile-schemas:
	@echo "Compiling GSettings schemas..."
	@glib-compile-schemas schemas/

uninstall:
	@echo "Uninstalling NixOS Tools extension..."
	@rm -rf $(EXTENSION_DIR)
	@echo "Extension uninstalled"

clean:
	@echo "Cleaning compiled files..."
	@rm -f schemas/gschemas.compiled

.PHONY: all install compile-schemas uninstall clean 