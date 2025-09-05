/**
 * Plugin Registry - Manages plugin registration and lifecycle
 */

import React from 'react';
import { Plugin, PluginRegistry as IPluginRegistry, PluginCommand, PluginToolbarItem } from './types';
import { EditorInstance } from '../components/Editor/Editor.types';

class PluginRegistryImpl implements IPluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private editorInstance: EditorInstance | null = null;
  private initialized: boolean = false;
  private static instance: PluginRegistryImpl | null = null;

  // Singleton pattern
  static getInstance(): PluginRegistryImpl {
    if (!PluginRegistryImpl.instance) {
      PluginRegistryImpl.instance = new PluginRegistryImpl();
    }
    return PluginRegistryImpl.instance;
  }

  // Reset for testing or re-initialization
  static reset(): void {
    if (PluginRegistryImpl.instance) {
      PluginRegistryImpl.instance.clear();
    }
    PluginRegistryImpl.instance = null;
  }

  // Private constructor for singleton
  private constructor() {}

  /**
   * Set the editor instance
   */
  setEditor(editor: EditorInstance): void {
    this.editorInstance = editor;
  }

  /**
   * Check if a plugin is already registered
   */
  isRegistered(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Register a plugin
   */
  register(plugin: Plugin): void {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }

    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already registered`);
      return;
    }

    // Validate plugin
    this.validatePlugin(plugin);

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${plugin.name}" requires "${dep}" which is not registered`);
        }
      }
    }

    // Register the plugin
    this.plugins.set(plugin.name, plugin);

    // Enable by default if specified
    if (plugin.enabled !== false) {
      this.enabledPlugins.add(plugin.name);
    }

    // Initialize if editor is ready
    if (this.initialized && this.editorInstance && plugin.enabled !== false) {
      this.initializePlugin(plugin);
    }
  }

  /**
   * Unregister a plugin
   */
  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (!plugin) return;

    // Call destroy hook if plugin is enabled
    if (this.enabledPlugins.has(name) && plugin.onDestroy) {
      try {
        plugin.onDestroy();
      } catch (error) {
        console.error(`Error destroying plugin "${name}":`, error);
      }
    }

    // Remove from registry
    this.plugins.delete(name);
    this.enabledPlugins.delete(name);

    // Check if other plugins depend on this one
    this.plugins.forEach(p => {
      if (p.dependencies?.includes(name)) {
        console.warn(`Plugin "${p.name}" depends on "${name}" which has been unregistered`);
      }
    });
  }

  /**
   * Get a registered plugin
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Enable a plugin
   */
  async enable(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    if (this.enabledPlugins.has(name)) {
      return; // Already enabled
    }

    this.enabledPlugins.add(name);

    // Initialize if editor is ready
    if (this.initialized && this.editorInstance) {
      await this.initializePlugin(plugin);
    }
    
    // Notify listeners of change
    this.notifyChange();
  }

  /**
   * Disable a plugin
   */
  async disable(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) return;

    if (!this.enabledPlugins.has(name)) {
      return; // Already disabled
    }

    // Call destroy hook
    if (plugin.onDestroy) {
      try {
        await plugin.onDestroy();
      } catch (error) {
        console.error(`Error disabling plugin "${name}":`, error);
      }
    }

    this.enabledPlugins.delete(name);
    
    // Notify listeners of change
    this.notifyChange();
  }
  
  /**
   * Get list of all registered plugins with their enabled state
   */
  getPluginStates(): Array<{name: string, enabled: boolean}> {
    const states: Array<{name: string, enabled: boolean}> = [];
    for (const [name] of this.plugins) {
      states.push({ name, enabled: this.enabledPlugins.has(name) });
    }
    return states;
  }
  
  // Listeners for plugin state changes
  private changeListeners: Set<() => void> = new Set();
  
  /**
   * Add a listener for plugin state changes
   */
  addChangeListener(listener: () => void): void {
    this.changeListeners.add(listener);
  }
  
  /**
   * Remove a change listener
   */
  removeChangeListener(listener: () => void): void {
    this.changeListeners.delete(listener);
  }
  
  /**
   * Notify all listeners of a change
   */
  private notifyChange(): void {
    this.changeListeners.forEach(listener => listener());
  }

  /**
   * Check if plugin is enabled
   */
  isEnabled(name: string): boolean {
    return this.enabledPlugins.has(name);
  }

  /**
   * Initialize all enabled plugins
   */
  async initializeAll(editor: EditorInstance): Promise<void> {
    this.editorInstance = editor;
    this.initialized = true;

    // Sort plugins by dependencies
    const sortedPlugins = this.topologicalSort();

    // Initialize each enabled plugin
    for (const plugin of sortedPlugins) {
      if (this.enabledPlugins.has(plugin.name)) {
        await this.initializePlugin(plugin);
      }
    }
  }

  /**
   * Destroy all plugins
   */
  async destroyAll(): Promise<void> {
    // Destroy in reverse order
    const sortedPlugins = this.topologicalSort().reverse();

    for (const plugin of sortedPlugins) {
      if (this.enabledPlugins.has(plugin.name) && plugin.onDestroy) {
        try {
          await plugin.onDestroy();
        } catch (error) {
          console.error(`Error destroying plugin "${plugin.name}":`, error);
        }
      }
    }

    this.initialized = false;
    this.editorInstance = null;
  }

  /**
   * Clear all plugins and reset state
   */
  clear(): void {
    // Destroy all plugins first if initialized
    if (this.initialized) {
      this.destroyAll().catch(console.error);
    }
    
    // Clear all collections
    this.plugins.clear();
    this.enabledPlugins.clear();
    this.editorInstance = null;
    this.initialized = false;
  }

  /**
   * Call beforeChange hooks
   */
  beforeChange(oldContent: string, newContent: string): boolean {
    for (const plugin of this.plugins.values()) {
      if (this.enabledPlugins.has(plugin.name) && plugin.beforeChange) {
        try {
          const result = plugin.beforeChange(this.editorInstance!, oldContent, newContent);
          if (result === false) {
            return false; // Prevent change
          }
        } catch (error) {
          console.error(`Error in plugin "${plugin.name}" beforeChange:`, error);
        }
      }
    }
    return true;
  }

  /**
   * Call afterChange hooks
   */
  afterChange(content: string): void {
    for (const plugin of this.plugins.values()) {
      if (this.enabledPlugins.has(plugin.name) && plugin.afterChange) {
        try {
          plugin.afterChange(this.editorInstance!, content);
        } catch (error) {
          console.error(`Error in plugin "${plugin.name}" afterChange:`, error);
        }
      }
    }
  }

  /**
   * Call selection change hooks
   */
  onSelectionChange(selection: Selection | null): void {
    for (const plugin of this.plugins.values()) {
      if (this.enabledPlugins.has(plugin.name) && plugin.onSelectionChange) {
        try {
          plugin.onSelectionChange(this.editorInstance!, selection);
        } catch (error) {
          console.error(`Error in plugin "${plugin.name}" onSelectionChange:`, error);
        }
      }
    }
  }

  /**
   * Get toolbar items from all enabled plugins
   */
  getToolbarItems(): PluginToolbarItem[] {
    const items: PluginToolbarItem[] = [];

    for (const plugin of this.plugins.values()) {
      if (this.enabledPlugins.has(plugin.name) && plugin.toolbarItems) {
        // Add plugin name to each toolbar item
        const pluginItems = plugin.toolbarItems.map(item => ({
          ...item,
          pluginName: plugin.name
        }));
        items.push(...pluginItems);
      }
    }

    return items;
  }

  /**
   * Get icon overrides from all enabled plugins
   */
  getIconOverrides(): Map<string, React.ReactNode> {
    const overrides = new Map<string, React.ReactNode>();

    // Process plugins in reverse order so later plugins can override earlier ones
    const pluginsArray = Array.from(this.plugins.values()).reverse();
    
    for (const plugin of pluginsArray) {
      if (this.enabledPlugins.has(plugin.name) && plugin.iconOverrides) {
        for (const override of plugin.iconOverrides) {
          overrides.set(override.format, override.icon);
        }
      }
    }

    return overrides;
  }

  /**
   * Get commands from all enabled plugins
   */
  getCommands(): Map<string, PluginCommand> {
    const commands = new Map();

    for (const plugin of this.plugins.values()) {
      if (this.enabledPlugins.has(plugin.name) && plugin.commands) {
        for (const command of plugin.commands) {
          commands.set(command.name, command);
        }
      }
    }

    return commands;
  }

  /**
   * Initialize a single plugin
   */
  private async initializePlugin(plugin: Plugin): Promise<void> {
    if (!this.editorInstance) {
      throw new Error('Editor instance not set');
    }

    try {
      if (plugin.onInit) {
        await plugin.onInit(this.editorInstance);
      }
    } catch (error) {
      console.error(`Error initializing plugin "${plugin.name}":`, error);
      // Disable plugin on initialization error
      this.enabledPlugins.delete(plugin.name);
      throw error;
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.version) {
      throw new Error(`Plugin "${plugin.name}" must have a version`);
    }

    // Validate event handlers
    if (plugin.events) {
      for (const event of plugin.events) {
        if (!event.event || !event.handler) {
          throw new Error(`Invalid event handler in plugin "${plugin.name}"`);
        }
      }
    }

    // Validate commands
    if (plugin.commands) {
      for (const command of plugin.commands) {
        if (!command.name || !command.execute) {
          throw new Error(`Invalid command in plugin "${plugin.name}"`);
        }
      }
    }
  }

  /**
   * Topological sort for dependency resolution
   */
  private topologicalSort(): Plugin[] {
    const sorted: Plugin[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (plugin: Plugin) => {
      if (visited.has(plugin.name)) return;
      if (visiting.has(plugin.name)) {
        throw new Error(`Circular dependency detected involving plugin "${plugin.name}"`);
      }

      visiting.add(plugin.name);

      // Visit dependencies first
      if (plugin.dependencies) {
        for (const depName of plugin.dependencies) {
          const dep = this.plugins.get(depName);
          if (dep) {
            visit(dep);
          }
        }
      }

      visiting.delete(plugin.name);
      visited.add(plugin.name);
      sorted.push(plugin);
    };

    for (const plugin of this.plugins.values()) {
      visit(plugin);
    }

    return sorted;
  }
}

// Export singleton instance
export const pluginRegistry = PluginRegistryImpl.getInstance();

// Export class for type checking if needed
export const PluginRegistry = PluginRegistryImpl;