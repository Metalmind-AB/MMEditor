import React, { useEffect, useRef } from 'react';
import { TableManager } from '../../modules/table/table';
import styles from './TableContextMenu.module.css';

export interface TableContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon?: string;
  action: () => void;
  divider?: boolean;
}

export const TableContextMenu: React.FC<TableContextMenuProps> = ({
  isOpen,
  position,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    {
      label: 'Add Row Above',
      icon: '⬆',
      action: () => {
        TableManager.addRowAbove();
        onClose();
      },
    },
    {
      label: 'Add Row Below',
      icon: '⬇',
      action: () => {
        TableManager.addRowBelow();
        onClose();
      },
    },
    {
      divider: true,
      label: '',
      action: () => {},
    },
    {
      label: 'Add Column Left',
      icon: '⬅',
      action: () => {
        TableManager.addColumnLeft();
        onClose();
      },
    },
    {
      label: 'Add Column Right',
      icon: '➡',
      action: () => {
        TableManager.addColumnRight();
        onClose();
      },
    },
    {
      divider: true,
      label: '',
      action: () => {},
    },
    {
      label: 'Delete Row',
      icon: '✕',
      action: () => {
        TableManager.deleteRow();
        onClose();
      },
    },
    {
      label: 'Delete Column',
      icon: '✕',
      action: () => {
        TableManager.deleteColumn();
        onClose();
      },
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      role="menu"
      aria-label="Table operations"
    >
      {menuItems.map((item, index) => {
        if (item.divider) {
          return <div key={index} className={styles.divider} />;
        }
        return (
          <button
            key={index}
            className={styles.menuItem}
            onClick={item.action}
            role="menuitem"
          >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};