/**
 * Plugin Template - Use this as a starting point for your custom plugins
 */

import { Plugin, PluginToolbarItem, PluginCommand } from '../types';
import { EditorInstance } from '../../components/Editor/Editor.types';

/**
 * Configuration interface for your plugin
 */
export interface PluginTemplateConfig extends Record<string, unknown> {
  // Add your configuration options here
  enabled?: boolean;
  apiEndpoint?: string;
  debugMode?: boolean;
}

/**
 * Your plugin class
 */
export class PluginTemplate implements Plugin {
  // Required metadata
  name = 'plugin-template'; // Unique identifier for your plugin
  version = '1.0.0'; // Semantic versioning
  
  // Optional metadata
  description = 'A template plugin for MMEditor';
  author = 'Your Name';
  dependencies = []; // List plugin names this depends on
  
  // Configuration
  config: PluginTemplateConfig;
  private editorInstance: EditorInstance | null = null;
  
  constructor(config: PluginTemplateConfig = {}) {
    // Merge with default configuration
    this.config = {
      enabled: true,
      debugMode: false,
      ...config
    };
  }
  
  /**
   * Toolbar items to add to the editor
   */
  toolbarItems: PluginToolbarItem[] = [
    {
      name: 'my-action',
      icon: '🔧', // Can be string, emoji, or React component
      tooltip: 'My Custom Action',
      action: (editor: EditorInstance) => {
        // Your custom action here
        this.performCustomAction(editor);
      },
      isActive: (_editor: EditorInstance) => {
        // Return true when this format/state is active
        return false;
      },
      position: 'end', // Where to place in toolbar
    }
  ];
  
  /**
   * Commands that can be executed via editor.executeCommand()
   */
  commands: PluginCommand[] = [
    {
      name: 'myCommand',
      execute: (editor: EditorInstance, ...args: unknown[]) => {
        // Command implementation
        this.log('Executing command with args:', args);
        editor.execCommand('insertText', 'Command executed!');
      },
      canExecute: (_editor: EditorInstance) => {
        // Return false to disable command
        return this.config.enabled !== false;
      },
      shortcut: 'Ctrl+Shift+M', // Optional keyboard shortcut
    }
  ];
  
  /**
   * Called when plugin is initialized
   */
  async onInit(editor: EditorInstance): Promise<void> {
    this.editorInstance = editor;
    this.log('Plugin initialized');
    
    // Setup your plugin here
    await this.setup();
    
    // Register global event listeners if needed
    this.registerEventListeners();
  }
  
  /**
   * Called when plugin is destroyed
   */
  async onDestroy(): Promise<void> {
    this.log('Plugin destroyed');
    
    // Cleanup your plugin here
    await this.cleanup();
    
    // Remove event listeners
    this.removeEventListeners();
    
    // Clear references
    this.editorInstance = null;
  }
  
  /**
   * Called before content changes
   * Return false to prevent the change
   */
  beforeChange(editor: EditorInstance, oldContent: string, newContent: string): boolean | void {
    this.log('Content will change from:', oldContent, 'to:', newContent);
    
    // Validate or modify content before change
    if (this.shouldPreventChange(newContent)) {
      this.log('Change prevented');
      return false;
    }
    
    // Allow change
    return true;
  }
  
  /**
   * Called after content changes
   */
  afterChange(editor: EditorInstance, content: string): void {
    this.log('Content changed to:', content);
    
    // React to content changes
    this.handleContentChange(content);
  }
  
  /**
   * Called when selection changes
   */
  onSelectionChange(editor: EditorInstance, selection: Selection | null): void {
    if (!selection) return;
    
    this.log('Selection changed:', selection.toString());
    
    // React to selection changes
    this.handleSelectionChange(selection);
  }
  
  // ==================
  // Private Methods
  // ==================
  
  /**
   * Initial setup
   */
  private async setup(): Promise<void> {
    // Load saved state
    await this.loadState();
    
    // Initialize UI components
    this.initializeUI();
    
    // Connect to external services
    if (this.config.apiEndpoint) {
      await this.connectToAPI();
    }
  }
  
  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    // Save current state
    await this.saveState();
    
    // Cleanup UI components
    this.cleanupUI();
    
    // Disconnect from services
    await this.disconnectFromAPI();
  }
  
  /**
   * Perform custom action
   */
  private performCustomAction(editor: EditorInstance): void {
    // Example: Insert current timestamp
    const timestamp = new Date().toLocaleString();
    editor.execCommand('insertHTML', `<span class="timestamp">[${timestamp}]</span>`);
    
    // Show notification
    this.showNotification('Action performed!');
  }
  
  /**
   * Check if change should be prevented
   */
  private shouldPreventChange(content: string): boolean {
    // Example: Prevent if content exceeds limit
    const maxLength = 10000;
    return content.length > maxLength;
  }
  
  /**
   * Handle content changes
   */
  private handleContentChange(content: string): void {
    // Example: Auto-save after change
    this.autoSave(content);
    
    // Update statistics
    this.updateStats(content);
  }
  
  /**
   * Handle selection changes
   */
  private handleSelectionChange(selection: Selection): void {
    // Example: Show context menu for selected text
    if (!selection.isCollapsed) {
      const selectedText = selection.toString();
      if (selectedText.length > 0) {
        this.showContextMenu(selection);
      }
    }
  }
  
  // ==================
  // Helper Methods
  // ==================
  
  private registerEventListeners(): void {
    // Add global event listeners if needed
    document.addEventListener('custom-event', this.handleCustomEvent);
  }
  
  private removeEventListeners(): void {
    document.removeEventListener('custom-event', this.handleCustomEvent);
  }
  
  private handleCustomEvent = (event: Event): void => {
    this.log('Custom event received:', event);
  };
  
  private async loadState(): Promise<void> {
    try {
      const saved = localStorage.getItem(`${this.name}-state`);
      if (saved) {
        const state = JSON.parse(saved);
        this.log('State loaded:', state);
      }
    } catch (error) {
      this.log('Failed to load state:', error);
    }
  }
  
  private async saveState(): Promise<void> {
    try {
      const state = {
        // Your plugin state here
        timestamp: Date.now(),
      };
      localStorage.setItem(`${this.name}-state`, JSON.stringify(state));
      this.log('State saved:', state);
    } catch (error) {
      this.log('Failed to save state:', error);
    }
  }
  
  private initializeUI(): void {
    // Create and append UI elements
    this.log('UI initialized');
  }
  
  private cleanupUI(): void {
    // Remove UI elements
    this.log('UI cleaned up');
  }
  
  private async connectToAPI(): Promise<void> {
    if (!this.config.apiEndpoint) return;
    
    try {
      // Connect to your API
      const response = await fetch(`${this.config.apiEndpoint}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plugin: this.name }),
      });
      
      if (response.ok) {
        this.log('Connected to API');
      }
    } catch (error) {
      this.log('Failed to connect to API:', error);
    }
  }
  
  private async disconnectFromAPI(): Promise<void> {
    if (!this.config.apiEndpoint) return;
    
    try {
      await fetch(`${this.config.apiEndpoint}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plugin: this.name }),
      });
      this.log('Disconnected from API');
    } catch (error) {
      this.log('Failed to disconnect from API:', error);
    }
  }
  
  private autoSave(_content: string): void {
    // Implement auto-save logic
    this.log('Auto-saving content...');
  }
  
  private updateStats(content: string): void {
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    const characters = content.length;
    this.log(`Stats - Words: ${words}, Characters: ${characters}`);
  }
  
  private showContextMenu(selection: Selection): void {
    // Show context menu for selection
    this.log('Showing context menu for:', selection.toString());
  }
  
  private showNotification(message: string): void {
    // Show user notification
    this.log('Notification:', message);
    
    // You could dispatch a custom event or use a notification library
    const event = new CustomEvent('mmeditor:notification', {
      detail: { message, plugin: this.name }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Debug logging helper
   */
  private log(...args: unknown[]): void {
    if (this.config.debugMode) {
      console.log(`[${this.name}]`, ...args);
    }
  }
}

/**
 * Factory function to create plugin instance
 */
export function createPluginTemplate(config?: PluginTemplateConfig): PluginTemplate {
  return new PluginTemplate(config);
}