import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class NixOSShortcutsExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._indicator = null;
    }
    
    enable() {
        this._indicator = new NixOSIndicator(this);
        Main.panel.addToStatusArea(this.metadata.uuid, this._indicator);
    }
    
    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}

const NixOSIndicator = GObject.registerClass(
class NixOSIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'NixOS Tools');
        
        this._extension = extension;
        this._settings = extension.getSettings();
        
        // Create the icon
        let iconPath = this._extension.path + '/icons/nixos-symbolic.png';
        let iconFile = Gio.File.new_for_path(iconPath);
        
        if (iconFile.query_exists(null)) {
            this._icon = new St.Icon({
                gicon: new Gio.FileIcon({file: iconFile}),
                style_class: 'system-status-icon'
            });
        } else {
            // Fallback to symbolic icon if PNG is not found
            this._icon = new St.Icon({
                icon_name: 'nixos-symbolic',
                style_class: 'system-status-icon'
            });
        }
        
        // Fallback to a generic icon if neither PNG nor symbolic icon is available
        this._icon.fallback_icon_name = 'applications-system-symbolic';
        
        this.add_child(this._icon);
        
        this._buildMenu();
    }
    
    _buildMenu() {
        // Define default commands
        this._defaultCommands = {
            'rebuild-switch': 'sudo nixos-rebuild switch',
            'rollback-switch': 'sudo nixos-rebuild switch --rollback',
            'empty-garbage': 'nix-collect-garbage --delete-older-than 30d',
            'nix-store-optimize': 'nix-store --optimise',
            'rebuild-boot': 'sudo nixos-rebuild boot',
            'get-latest-packages': 'sudo nix-channel --update',
            'update-and-apply': 'sudo nixos-rebuild switch --upgrade'
        };
        
        // Create menu items
        this._addMenuItem('Rebuild Switch', 'rebuild-switch');
        this._addMenuItem('Rollback Switch', 'rollback-switch');
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this._addMenuItem('Empty Garbage', 'empty-garbage');
        this._addMenuItem('Nix Store Optimize', 'nix-store-optimize');
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this._addMenuItem('Rebuild Boot', 'rebuild-boot');
        this._addMenuItem('Get Latest Packages', 'get-latest-packages');
        this._addMenuItem('Update and Apply', 'update-and-apply');
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Package search section
        this._addPackageSearchBar();
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Settings menu item
        let settingsItem = new PopupMenu.PopupMenuItem('Settings');
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);
    }
    
    _addPackageSearchBar() {
        // Create a container for the search bar
        let searchContainer = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        
        // Create a box to hold the label and entry
        let box = new St.BoxLayout({
            vertical: true,
            style_class: 'popup-menu-item'
        });
        
        // Add label
        let label = new St.Label({
            text: 'Search NixOS Packages:',
            style_class: 'popup-menu-item-label'
        });
        box.add_child(label);
        
        // Create the search entry
        let searchEntry = new St.Entry({
            style_class: 'popup-menu-item-entry',
            hint_text: 'Enter package name...',
            track_hover: true,
            can_focus: true
        });
        
        // Handle Enter key press
        searchEntry.clutter_text.connect('activate', () => {
            let searchText = searchEntry.get_text().trim();
            if (searchText) {
                this._searchPackage(searchText);
                searchEntry.set_text(''); // Clear the entry
                this.menu.close(); // Close the menu
            }
        });
        
        // Handle key press events
        searchEntry.clutter_text.connect('key-press-event', (actor, event) => {
            let symbol = event.get_key_symbol();
            if (symbol === Clutter.KEY_Escape) {
                this.menu.close();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
        
        box.add_child(searchEntry);
        searchContainer.add_child(box);
        
        this.menu.addMenuItem(searchContainer);
    }
    
    _searchPackage(packageName) {
        try {
            let searchUrl = `https://search.nixos.org/packages?query=${encodeURIComponent(packageName)}`;
            console.log(`NixOS Tools: Opening package search for: ${packageName}`);
            console.log(`NixOS Tools: URL: ${searchUrl}`);
            
            // Open the URL in default browser
            Gio.AppInfo.launch_default_for_uri(searchUrl, null);
            
            Main.notify('NixOS Tools', `Searching for package: ${packageName}`);
        } catch (error) {
            console.log(`NixOS Tools: Error opening package search: ${error.message}`);
            Main.notify('NixOS Tools', `Error opening package search: ${error.message}`);
        }
    }
    
    _addMenuItem(label, commandKey) {
        let item = new PopupMenu.PopupMenuItem(label);
        item.connect('activate', () => {
            this._executeCommand(commandKey);
        });
        this.menu.addMenuItem(item);
    }
    
    _executeCommand(commandKey) {
        let command = this._settings.get_string(commandKey);
        if (!command) {
            command = this._defaultCommands[commandKey];
        }
        
        if (command.startsWith('sudo ')) {
            this._executeSudoCommand(command);
        } else {
            this._executeRegularCommand(command);
        }
    }
    
    _executeSudoCommand(command) {
        // Use pkexec for GUI authentication
        let pkexecCommand = `pkexec sh -c "${command.replace('sudo ', '')}"`;
        this._executeRegularCommand(pkexecCommand);
    }
    
    _executeRegularCommand(command) {
        try {
            console.log(`NixOS Shortcuts: Executing command in background: ${command}`);
            
            // Show notification that command is starting
            Main.notify('NixOS Tools', `Executing: ${command.length > 50 ? command.substring(0, 50) + '...' : command}`);
            
            // Execute command in background
            let proc = Gio.Subprocess.new(
                ['bash', '-c', command],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );
            
            // Handle command completion asynchronously
            proc.communicate_utf8_async(null, null, (proc, result) => {
                try {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(result);
                    let exitCode = proc.get_exit_status();
                    
                    if (exitCode === 0) {
                        console.log(`NixOS Tools: Command completed successfully`);
                        if (stdout && stdout.trim()) {
                            console.log(`NixOS Tools: Output: ${stdout}`);
                        }
                        Main.notify('NixOS Tools', 'Command completed successfully');
                    } else {
                        console.log(`NixOS Tools: Command failed with exit code: ${exitCode}`);
                        if (stderr && stderr.trim()) {
                            console.log(`NixOS Tools: Error: ${stderr}`);
                        }
                        Main.notify('NixOS Tools', `Command failed (exit code: ${exitCode})`);
                    }
                } catch (error) {
                    console.log(`NixOS Tools: Error handling command result: ${error.message}`);
                    Main.notify('NixOS Tools', 'Command execution error');
                }
            });
            
        } catch (error) {
            console.log(`NixOS Tools: Error executing command: ${error.message}`);
            
            // Fallback: try simpler spawn method
            try {
                console.log(`NixOS Tools: Trying fallback execution method`);
                GLib.spawn_command_line_async(`bash -c "${command}"`);
                Main.notify('NixOS Tools', 'Command started (fallback method)');
            } catch (fallbackError) {
                console.log(`NixOS Tools: Fallback also failed: ${fallbackError.message}`);
                Main.notify('NixOS Tools', `Error executing command: ${error.message}`);
            }
        }
    }
    
    destroy() {
        super.destroy();
    }
}); 