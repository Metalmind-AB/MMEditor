/**
 * Emoji Picker Plugin - Example plugin for MMEditor
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Plugin, PluginToolbarItem } from '../types';
import { EditorInstance } from '../../components/Editor/Editor.types';
import { EmojiPicker } from './EmojiPicker';

/**
 * Example emoji picker plugin
 */
export class EmojiPlugin implements Plugin {
  name = 'emoji-picker';
  version = '1.0.0';
  
  private editorInstance: EditorInstance | null = null;
  private pickerContainer: HTMLElement | null = null;
  private pickerRoot: ReactDOM.Root | null = null;

  toolbarItems: PluginToolbarItem[] = [
    {
      name: 'emoji',
      tooltip: 'Insert Emoji',
      icon: '😀',
      action: (editor: EditorInstance) => {
        this.showEmojiPicker(editor);
      },
      isActive: () => false,
    },
  ];

  commands = [
    {
      name: 'insertEmoji',
      execute: (editor: EditorInstance, ...args: unknown[]) => {
        const emoji = args[0] as string;
        this.insertEmoji(editor, emoji);
      },
      canExecute: () => true,
    },
  ];

  async onInit(editor: EditorInstance): Promise<void> {
    this.editorInstance = editor;
    console.log('Emoji plugin initialized');
  }

  async onDestroy(): Promise<void> {
    this.closePicker();
    this.editorInstance = null;
    console.log('Emoji plugin destroyed');
  }

  private showEmojiPicker(editor: EditorInstance): void {
    // Get button position for picker placement
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const rect = range?.getBoundingClientRect() || { left: 100, top: 100 };
    
    // Close existing picker if open
    this.closePicker();
    
    // Create container for React portal
    this.pickerContainer = document.createElement('div');
    document.body.appendChild(this.pickerContainer);
    
    // Create React root and render picker
    this.pickerRoot = ReactDOM.createRoot(this.pickerContainer);
    this.pickerRoot.render(
      <EmojiPicker
        position={{ x: rect.left, y: rect.top + 30 }}
        onSelect={(emoji) => this.insertEmoji(editor, emoji)}
        onClose={() => this.closePicker()}
      />
    );
  }

  private closePicker(): void {
    if (this.pickerRoot && this.pickerContainer) {
      this.pickerRoot.unmount();
      this.pickerRoot = null;
      
      if (this.pickerContainer.parentNode) {
        this.pickerContainer.parentNode.removeChild(this.pickerContainer);
      }
      this.pickerContainer = null;
    }
  }

  private insertEmoji(editor: EditorInstance, emoji: string): void {
    editor.execCommand('insertText', emoji);
    this.closePicker();
    editor.focus();
  }
}

/**
 * Factory function to create emoji plugin instance
 */
export const createEmojiPlugin = () => new EmojiPlugin();