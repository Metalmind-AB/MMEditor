import React from 'react';
import { Format } from '../Editor/Editor.types';
import styles from '../Toolbar/Toolbar.module.css';

interface ToolbarButtonProps {
  format: Format | string;
  icon: React.ReactNode;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  dataAttributes?: Record<string, string>;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  format,
  icon,
  tooltip,
  isActive,
  onClick,
  disabled = false,
  dataAttributes = {},
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={isActive}
      {...dataAttributes}
    >
      <span className={styles.icon}>{icon}</span>
    </button>
  );
};