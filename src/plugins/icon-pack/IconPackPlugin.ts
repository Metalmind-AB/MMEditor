/**
 * Agnostic Icon Pack Plugin
 * 
 * This plugin allows you to replace the default toolbar icons with any icon pack.
 * The icon pack dependencies should be installed in the consuming application,
 * not in the editor package itself.
 */

import React from 'react';
import { Plugin, IconOverride } from '../types';
import { EditorInstance } from '../../components/Editor/Editor.types';

/**
 * Icon pack type definitions
 */
export type IconPackType = 'mui' | 'heroicons' | 'feather' | 'tabler' | 'lucide' | 'custom';

/**
 * Icon mapping for each format
 */
export interface IconMapping {
  bold?: React.ReactNode;
  italic?: React.ReactNode;
  underline?: React.ReactNode;
  strike?: React.ReactNode;
  code?: React.ReactNode;
  'code-block'?: React.ReactNode;
  bullet?: React.ReactNode;
  number?: React.ReactNode;
  link?: React.ReactNode;
  table?: React.ReactNode;
  clear?: React.ReactNode;
  h1?: React.ReactNode;
  h2?: React.ReactNode;
  h3?: React.ReactNode;
  h4?: React.ReactNode;
  h5?: React.ReactNode;
  h6?: React.ReactNode;
}

/**
 * Configuration for Icon Pack Plugin
 */
export interface IconPackConfig {
  /**
   * The icon pack type (for documentation/debugging)
   */
  type?: IconPackType;
  
  /**
   * Custom icon mappings
   */
  icons: IconMapping;
  
  /**
   * Optional size configuration
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Optional custom class for all icons
   */
  className?: string;
}

/**
 * Icon Pack Plugin - Replace toolbar icons with any icon library
 */
export class IconPackPlugin implements Plugin {
  name = 'icon-pack';
  version = '1.0.0';
  description = 'Replace toolbar icons with custom icon pack';
  author = 'MMEditor';
  
  private iconConfig: IconPackConfig | null = null;
  private changeListeners: Set<() => void> = new Set();
  
  constructor(config?: IconPackConfig) {
    if (config) {
      this.iconConfig = config;
    }
  }
  
  /**
   * Set or change the icon pack configuration
   */
  setIconPack(config: IconPackConfig | null): void {
    this.iconConfig = config;
    // Notify listeners that the icon pack has changed
    this.notifyChange();
  }
  
  /**
   * Add a listener for icon pack changes
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
    // Trigger a change event in the plugin registry
    // This will cause the toolbar to re-read icon overrides
    import('../../plugins/PluginRegistry').then(({ pluginRegistry }) => {
      // Access private method to notify changes
      (pluginRegistry as unknown).notifyChange?.();
    });
  }
  
  /**
   * Icon overrides for the toolbar
   */
  get iconOverrides(): IconOverride[] {
    if (!this.iconConfig) {
      return [];
    }
    
    const overrides: IconOverride[] = [];
    
    // Convert icon mapping to overrides
    Object.entries(this.iconConfig.icons).forEach(([format, icon]) => {
      if (icon) {
        overrides.push({ format, icon });
      }
    });
    
    return overrides;
  }
  
  /**
   * Optional: Log which icon pack is being used
   */
  async onInit(_editor: EditorInstance): Promise<void> {
    if (this.iconConfig?.type) {
      console.log(`Icon Pack Plugin initialized with ${this.iconConfig.type} icons`);
    } else {
      console.log('Icon Pack Plugin initialized without icons');
    }
  }
}

/**
 * Factory function to create an icon pack plugin
 */
export function createIconPackPlugin(config?: IconPackConfig): IconPackPlugin {
  return new IconPackPlugin(config);
}

/**
 * Helper to create icon pack configs for common libraries
 * These are just examples - the actual icons must be provided by the consuming app
 */
export const IconPackPresets = {
  /**
   * Example configuration for MUI icons
   * Requires: @mui/icons-material
   */
  mui: (icons: {
    FormatBold: React.ComponentType;
    FormatItalic: React.ComponentType;
    FormatUnderlined: React.ComponentType;
    StrikethroughS: React.ComponentType;
    Code: React.ComponentType;
    DataObject: React.ComponentType;
    FormatListBulleted: React.ComponentType;
    FormatListNumbered: React.ComponentType;
    Link: React.ComponentType;
    TableChart: React.ComponentType;
    FormatClear: React.ComponentType;
  }): IconMapping => ({
    bold: React.createElement(icons.FormatBold as unknown, {}),
    italic: React.createElement(icons.FormatItalic as unknown, {}),
    underline: React.createElement(icons.FormatUnderlined as unknown, {}),
    strike: React.createElement(icons.StrikethroughS as unknown, {}),
    code: React.createElement(icons.Code as unknown, {}),
    'code-block': React.createElement(icons.DataObject as unknown, {}),
    bullet: React.createElement(icons.FormatListBulleted as unknown, {}),
    number: React.createElement(icons.FormatListNumbered as unknown, {}),
    link: React.createElement(icons.Link as unknown, {}),
    table: React.createElement(icons.TableChart as unknown, {}),
    clear: React.createElement(icons.FormatClear as unknown, {}),
  }),
  
  /**
   * Example configuration for Heroicons
   * Requires: @heroicons/react
   */
  heroicons: (icons: {
    BoldIcon: React.ComponentType<{ className?: string }>;
    ItalicIcon: React.ComponentType<{ className?: string }>;
    UnderlineIcon: React.ComponentType<{ className?: string }>;
    StrikethroughIcon: React.ComponentType<{ className?: string }>;
    CodeBracketIcon: React.ComponentType<{ className?: string }>;
    CodeBracketSquareIcon: React.ComponentType<{ className?: string }>;
    ListBulletIcon: React.ComponentType<{ className?: string }>;
    NumberedListIcon: React.ComponentType<{ className?: string }>;
    LinkIcon: React.ComponentType<{ className?: string }>;
    TableCellsIcon: React.ComponentType<{ className?: string }>;
    XMarkIcon: React.ComponentType<{ className?: string }>;
  }): IconMapping => ({
    bold: React.createElement(icons.BoldIcon, { className: 'w-4 h-4' }),
    italic: React.createElement(icons.ItalicIcon, { className: 'w-4 h-4' }),
    underline: React.createElement(icons.UnderlineIcon, { className: 'w-4 h-4' }),
    strike: React.createElement(icons.StrikethroughIcon, { className: 'w-4 h-4' }),
    code: React.createElement(icons.CodeBracketIcon, { className: 'w-4 h-4' }),
    'code-block': React.createElement(icons.CodeBracketSquareIcon, { className: 'w-4 h-4' }),
    bullet: React.createElement(icons.ListBulletIcon, { className: 'w-4 h-4' }),
    number: React.createElement(icons.NumberedListIcon, { className: 'w-4 h-4' }),
    link: React.createElement(icons.LinkIcon, { className: 'w-4 h-4' }),
    table: React.createElement(icons.TableCellsIcon, { className: 'w-4 h-4' }),
    clear: React.createElement(icons.XMarkIcon, { className: 'w-4 h-4' }),
  }),
  
  /**
   * Example configuration for Lucide icons
   * Requires: lucide-react
   */
  lucide: (icons: {
    Bold: React.ComponentType<{ size?: number }>;
    Italic: React.ComponentType<{ size?: number }>;
    Underline: React.ComponentType<{ size?: number }>;
    Strikethrough: React.ComponentType<{ size?: number }>;
    Code: React.ComponentType<{ size?: number }>;
    Code2: React.ComponentType<{ size?: number }>;
    List: React.ComponentType<{ size?: number }>;
    ListOrdered: React.ComponentType<{ size?: number }>;
    Link: React.ComponentType<{ size?: number }>;
    Table: React.ComponentType<{ size?: number }>;
    X: React.ComponentType<{ size?: number }>;
  }): IconMapping => ({
    bold: React.createElement(icons.Bold, { size: 16 }),
    italic: React.createElement(icons.Italic, { size: 16 }),
    underline: React.createElement(icons.Underline, { size: 16 }),
    strike: React.createElement(icons.Strikethrough, { size: 16 }),
    code: React.createElement(icons.Code, { size: 16 }),
    'code-block': React.createElement(icons.Code2, { size: 16 }),
    bullet: React.createElement(icons.List, { size: 16 }),
    number: React.createElement(icons.ListOrdered, { size: 16 }),
    link: React.createElement(icons.Link, { size: 16 }),
    table: React.createElement(icons.Table, { size: 16 }),
    clear: React.createElement(icons.X, { size: 16 }),
  }),
};