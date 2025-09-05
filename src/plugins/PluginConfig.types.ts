import { Plugin } from './types';

/**
 * Configuration for individual plugin instances
 */
export interface PluginConfig<TOptions = unknown> {
  /** The plugin instance or plugin factory function */
  plugin: Plugin | ((options?: TOptions) => Plugin);
  
  /** Whether the plugin should be enabled (default: true) */
  enabled?: boolean;
  
  /** Plugin-specific configuration options */
  options?: TOptions;
}

/**
 * Plugin configuration array
 * Each plugin must be explicitly configured
 */
export type PluginsConfig = PluginConfig[];

/**
 * Helper to initialize and filter enabled plugins
 */
export function initializePlugins(configs?: PluginsConfig): Plugin[] {
  if (!configs || configs.length === 0) return [];
  
  return configs
    .filter(config => config.enabled !== false)
    .map(config => {
      // If plugin is a factory function, call it with options
      if (typeof config.plugin === 'function') {
        return config.plugin(config.options);
      }
      // Otherwise it's already a plugin instance
      return config.plugin;
    });
}

/**
 * Type guard to check if a value is a PluginConfig
 */
export function isPluginConfig(value: unknown): value is PluginConfig {
  return value && typeof value === 'object' && 'plugin' in value;
}

/**
 * Type guard to check if a value is a PluginsConfig array
 */
export function isPluginsConfig(value: unknown): value is PluginsConfig {
  return Array.isArray(value) && value.every(isPluginConfig);
}