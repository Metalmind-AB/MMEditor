/**
 * Emoji Picker Component
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from './EmojiPlugin.module.css';
import { EMOJI_CATEGORIES } from './emojiConstants';

export const EmojiPicker: React.FC<{
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}> = ({ onSelect, onClose, position }) => {
  const [activeCategory, setActiveCategory] = useState<string>('smileys');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close picker on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className={styles.emojiPicker}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }}
    >
      <div className={styles.emojiCategories}>
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <button
            key={category}
            className={`${styles.categoryButton} ${
              activeCategory === category ? styles.active : ''
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      
      <div className={styles.emojiGrid}>
        {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES]?.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            className={styles.emojiButton}
            onClick={() => onSelect(emoji)}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};