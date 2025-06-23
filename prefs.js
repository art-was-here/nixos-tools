import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class NixOSShortcutsPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('NixOS Tools Configuration'),
            description: _('Customize the commands for each menu item'),
        });
        page.add(group);

        // Command configurations
        const commands = [
            { key: 'rebuild-switch', label: 'Rebuild Switch', default: 'sudo nixos-rebuild switch' },
            { key: 'rollback-switch', label: 'Rollback Switch', default: 'sudo nixos-rebuild switch --rollback' },
            { key: 'empty-garbage', label: 'Empty Garbage', default: 'nix-collect-garbage --delete-older-than 30d' },
            { key: 'nix-store-optimize', label: 'Nix Store Optimize', default: 'nix-store --optimise' },
            { key: 'rebuild-boot', label: 'Rebuild Boot', default: 'sudo nixos-rebuild boot' },
            { key: 'get-latest-packages', label: 'Get Latest Packages', default: 'sudo nix-channel --update' },
            { key: 'update-and-apply', label: 'Update and Apply', default: 'sudo nixos-rebuild switch --upgrade' }
        ];

        commands.forEach(cmd => {
            const row = new Adw.ActionRow({
                title: cmd.label,
                subtitle: `Default: ${cmd.default}`
            });

            const entry = new Gtk.Entry({
                text: settings.get_string(cmd.key) || cmd.default,
                hexpand: true,
                valign: Gtk.Align.CENTER,
            });

            entry.connect('changed', () => {
                settings.set_string(cmd.key, entry.get_text());
            });

            const defaultButton = new Gtk.Button({
                label: 'Default',
                valign: Gtk.Align.CENTER,
                css_classes: ['suggested-action'],
            });

            defaultButton.connect('clicked', () => {
                entry.set_text(cmd.default);
                settings.set_string(cmd.key, cmd.default);
            });

            const box = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                spacing: 6,
            });

            box.append(entry);
            box.append(defaultButton);
            row.add_suffix(box);
            group.add(row);
        });
    }
} 