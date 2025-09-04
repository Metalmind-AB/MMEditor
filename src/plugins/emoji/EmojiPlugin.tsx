/**
 * Emoji Picker Plugin - Example plugin for MMEditor
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Plugin, PluginToolbarItem } from '../types';
import { EditorInstance } from '../../components/Editor/Editor.types';
import styles from './EmojiPlugin.module.css';

// Common emojis organized by category
const EMOJI_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦵', '🦶'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤'],
  food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥒', '🌶️', '🌽'],
  objects: ['⭐', '🌟', '✨', '⚡', '🔥', '💥', '☀️', '🌈', '☁️', '🌧️', '❄️', '💧', '💦', '🎈', '🎉', '🎊', '🎁', '🏆'],
};

/**
 * Emoji Picker Component
 */
const EmojiPicker: React.FC<{
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}> = ({ onSelect, onClose, position }) => {
  const [activeCategory, setActiveCategory] = useState<string>('smileys');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className={styles.picker}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className={styles.categories}>
        {Object.keys(EMOJI_CATEGORIES).map(category => (
          <button
            key={category}
            className={`${styles.categoryBtn} ${activeCategory === category ? styles.active : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className={styles.emojiGrid}>
        {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
          <button
            key={index}
            className={styles.emojiBtn}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Emoji Plugin Class
 */
export class EmojiPlugin implements Plugin {
  name = 'emoji';
  version = '1.0.0';
  description = 'Emoji picker plugin for MMEditor';
  author = 'MMEditor Team';
  
  private editorInstance: EditorInstance | null = null;
  private pickerRoot: ReactDOM.Root | null = null;
  private pickerContainer: HTMLDivElement | null = null;
  
  toolbarItems: PluginToolbarItem[] = [
    {
      name: 'emoji',
      icon: '😊',
      tooltip: 'Insert Emoji',
      action: (editor: EditorInstance) => {
        this.showEmojiPicker(editor);
      },
      isActive: () => false,
    },
  ];

  commands = [
    {
      name: 'insertEmoji',
      execute: (editor: EditorInstance, emoji: string) => {
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
    if (this.pickerRoot) {
      this.pickerRoot.unmount();
      this.pickerRoot = null;
    }
    if (this.pickerContainer) {
      document.body.removeChild(this.pickerContainer);
      this.pickerContainer = null;
    }
  }

  private insertEmoji(editor: EditorInstance, emoji: string): void {
    // Insert emoji at current cursor position
    editor.execCommand('insertText', emoji);
    editor.focus();
  }

  beforeChange(editor: EditorInstance, oldContent: string, newContent: string): void {
    // Could be used to process emoji shortcuts like :) -> 😊
  }

  afterChange(editor: EditorInstance, content: string): void {
    // Could be used to track emoji usage
  }

  onSelectionChange(editor: EditorInstance, selection: Selection | null): void {
    // Could be used to show emoji suggestions
  }
}

/**
 * Factory function to create emoji plugin instance
 */
export function createEmojiPlugin(config?: any): EmojiPlugin {
  return new EmojiPlugin();
}