/**
 * Plugin System Types and Interfaces
 */

import React from 'react';
import { EditorInstance } from '../components/Editor/Editor.types';

/**
 * Plugin metadata
 */
export interface PluginMeta {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
}

/**
 * Toolbar item definition for plugins
 */
export interface PluginToolbarItem {
  name: string;
  icon: string | React.ReactNode;
  tooltip?: string;
  action: (editor: EditorInstance) => void;
  isActive?: (editor: EditorInstance) => boolean;
  position?: 'start' | 'end' | number;
  group?: string;
}

/**
 * Format definition for plugins
 */
export interface PluginFormatDefinition {
  name: string;
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
  apply: (editor: EditorInstance, value?: unknown) => void;
  remove: (editor: EditorInstance) => void;
  isActive: (editor: EditorInstance) => boolean;
}

/**
 * Command definition for plugins
 */
export interface PluginCommand {
  name: string;
  execute: (editor: EditorInstance, ...args: unknown[]) => void;
  canExecute?: (editor: EditorInstance) => boolean;
  shortcut?: string;
}

/**
 * Plugin event types
 */
export type PluginEventType = 
  | 'beforeChange'
  | 'afterChange'
  | 'selectionChange'
  | 'focus'
  | 'blur'
  | 'keydown'
  | 'keyup'
  | 'paste'
  | 'copy'
  | 'cut';

/**
 * Plugin event handler
 */
export interface PluginEventHandler {
  event: PluginEventType;
  handler: (editor: EditorInstance, data?: unknown) => void | boolean;
  priority?: number;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycle {
  /**
   * Called when plugin is initialized
   */
  onInit?: (editor: EditorInstance) => void | Promise<void>;
  
  /**
   * Called when plugin is destroyed
   */
  onDestroy?: () => void | Promise<void>;
  
  /**
   * Called before editor content changes
   */
  beforeChange?: (editor: EditorInstance, oldContent: string, newContent: string) => boolean | void;
  
  /**
   * Called after editor content changes
   */
  afterChange?: (editor: EditorInstance, content: string) => void;
  
  /**
   * Called when selection changes
   */
  onSelectionChange?: (editor: EditorInstance, selection: Selection | null) => void;
}

/**
 * Icon override definition for replacing existing toolbar icons
 */
export interface IconOverride {
  format: string; // The format name to override (e.g., 'bold', 'italic')
  icon: React.ReactNode; // The new icon to use
}

/**
 * Main Plugin interface
 */
export interface Plugin extends PluginMeta, PluginLifecycle {
  /**
   * Toolbar items to add
   */
  toolbarItems?: PluginToolbarItem[];
  
  /**
   * Icon overrides for existing toolbar items
   */
  iconOverrides?: IconOverride[];
  
  /**
   * Format definitions to register
   */
  formats?: PluginFormatDefinition[];
  
  /**
   * Commands to register
   */
  commands?: PluginCommand[];
  
  /**
   * Event handlers to register
   */
  events?: PluginEventHandler[];
  
  /**
   * Custom configuration
   */
  config?: Record<string, unknown>;
  
  /**
   * Enable/disable plugin
   */
  enabled?: boolean;
}

/**
 * Plugin constructor type
 */
export type PluginConstructor = new (config?: unknown) => Plugin;

/**
 * Plugin registry interface
 */
export interface PluginRegistry {
  /**
   * Register a plugin
   */
  register(plugin: Plugin): void;
  
  /**
   * Unregister a plugin
   */
  unregister(name: string): void;
  
  /**
   * Get a registered plugin
   */
  get(name: string): Plugin | undefined;
  
  /**
   * Get all registered plugins
   */
  getAll(): Plugin[];
  
  /**
   * Check if plugin is registered
   */
  has(name: string): boolean;
  
  /**
   * Enable a plugin
   */
  enable(name: string): void;
  
  /**
   * Disable a plugin
   */
  disable(name: string): void;
  
  /**
   * Check if plugin is enabled
   */
  isEnabled(name: string): boolean;
}