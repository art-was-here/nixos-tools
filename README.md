# NixOS Tools GNOME Extension

A GNOME Shell extension that provides quick access to common NixOS tools and commands from the status bar.

## Features

- **Status Bar Icon**: Adds a NixOS icon to your GNOME Shell status bar
- **Quick Commands**: Access common NixOS operations with a single click
- **Sudo Authentication**: Uses GNOME's built-in authentication for sudo commands
- **Customizable**: Configure custom commands for each menu item
- **Terminal Integration**: Commands run in GNOME Terminal with output visibility

## Default Commands

- **Rebuild Switch**: `sudo nixos-rebuild switch`
- **Rollback Switch**: `sudo nixos-rebuild switch --rollback`
- **Empty Garbage**: `nix-collect-garbage --delete-older-than 30d`
- **Nix Store Optimize**: `nix-store --optimise`
- **Rebuild Boot**: `sudo nixos-rebuild boot`
- **Get Latest Packages**: `sudo nix-channel --update`
- **Update and Apply**: `sudo nixos-rebuild switch --upgrade`

## Installation

### Method 1: Using Make

```bash
# Clone or download the extension
git clone https://github.com/art-was-here/nixos-tools.git
cd nixos-tools

# Install the extension
make install

# Restart GNOME Shell (Alt+F2, type 'r', press Enter)
# Or logout and login again

# Enable the extension using GNOME Extensions app
```

### Method 2: Manual Installation

```bash
# Create extension directory
mkdir -p ~/.local/share/gnome-shell/extensions/nixos-tools@art-was-here.github.io

# Copy extension files
cp -r * ~/.local/share/gnome-shell/extensions/nixos-tools@art-was-here.github.io/

# Compile GSettings schemas
cd ~/.local/share/gnome-shell/extensions/nixos-tools@art-was-here.github.io
glib-compile-schemas schemas/

# Restart GNOME Shell and enable the extension
```

## Usage

1. After installation and enabling the extension, you'll see a NixOS icon in your status bar
2. Click the icon to open the menu with available commands
3. Click any command to execute it
4. For sudo commands, GNOME's authentication dialog will appear
5. Commands run in GNOME Terminal so you can see the output

## Customization

1. Click the NixOS icon in the status bar
2. Select "Settings" from the menu
3. Modify any command as needed
4. Click "Default" next to any command to reset it to the original
5. Changes are applied immediately

## Requirements

- GNOME Shell 45 or later
- NixOS system
- `pkexec` for sudo authentication (usually pre-installed)
- `gnome-terminal` for command execution

## Troubleshooting

### Extension not showing up
- Make sure you've restarted GNOME Shell after installation
- Check that the extension is enabled in GNOME Extensions app
- Verify the extension directory structure is correct

### Commands not working
- Ensure you have the necessary permissions for NixOS commands
- Check that `pkexec` is available for sudo authentication
- Verify that `gnome-terminal` is installed and working

### Icon not displaying
- The extension will fall back to a generic system icon if the NixOS icon isn't available
- You can install additional icon themes that include NixOS icons

## Development

To modify the extension:

1. Edit the relevant files (`extension.js`, `prefs.js`, etc.)
2. Run `make install` to reinstall
3. Restart GNOME Shell to see changes
4. Use `journalctl -f -o cat /usr/bin/gnome-shell` to see debug output

## Uninstallation

```bash
make uninstall
```

Or manually:

```bash
rm -rf ~/.local/share/gnome-shell/extensions/nixos-tools@art-was-here.github.io
```

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

## About

A GNOME extension to bring quick access to common NixOS tools and commands. Commands can be customized in the settings.

For more information, visit: https://github.com/art-was-here/nixos-tools 