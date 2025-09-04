import React, { useState, useCallback } from 'react';
import styles from './TablePicker.module.css';

export interface TablePickerProps {
  onSelect: (rows: number, cols: number) => void;
  onClose: () => void;
}

export const TablePicker: React.FC<TablePickerProps> = ({ onSelect, onClose }) => {
  const [hoveredRow, setHoveredRow] = useState(0);
  const [hoveredCol, setHoveredCol] = useState(0);
  
  const maxRows = 8;
  const maxCols = 10;
  
  const handleMouseOver = useCallback((row: number, col: number) => {
    setHoveredRow(row);
    setHoveredCol(col);
  }, []);
  
  const handleClick = useCallback((row: number, col: number) => {
    onSelect(row, col);
    onClose();
  }, [onSelect, onClose]);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredRow(0);
    setHoveredCol(0);
  }, []);
  
  return (
    <div className={styles.picker} onMouseLeave={handleMouseLeave}>
      <div className={styles.grid}>
        {Array.from({ length: maxRows }).map((_, row) => (
          <div key={row} className={styles.row}>
            {Array.from({ length: maxCols }).map((_, col) => (
              <div
                key={col}
                className={`${styles.cell} ${
                  row + 1 <= hoveredRow && col + 1 <= hoveredCol ? styles.active : ''
                }`}
                onMouseOver={() => handleMouseOver(row + 1, col + 1)}
                onClick={() => handleClick(row + 1, col + 1)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className={styles.label}>
        {hoveredRow > 0 && hoveredCol > 0
          ? `${hoveredRow} × ${hoveredCol}`
          : 'Select table size'}
      </div>
    </div>
  );
};