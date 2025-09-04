/**
 * Table module - Handles table operations and navigation
 */

export class TableManager {
  /**
   * Check if current selection is inside a table
   */
  static isInTable(): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node: Node | null = selection.anchorNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.tagName === 'TABLE' || element.tagName === 'TD' || element.tagName === 'TH') {
          return true;
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  /**
   * Get current table cell
   */
  static getCurrentCell(): HTMLTableCellElement | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    let node: Node | null = selection.anchorNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.tagName === 'TD' || element.tagName === 'TH') {
          return element as HTMLTableCellElement;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  /**
   * Get parent table element
   */
  static getParentTable(node: Node | null): HTMLTableElement | null {
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.tagName === 'TABLE') {
          return element as HTMLTableElement;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  /**
   * Navigate to next cell with Tab
   */
  static handleTabInTable(event: KeyboardEvent): boolean {
    if (!this.isInTable()) return false;

    const currentCell = this.getCurrentCell();
    if (!currentCell) return false;

    event.preventDefault();

    const table = this.getParentTable(currentCell);
    if (!table) return false;

    const cells = Array.from(table.querySelectorAll('td, th'));
    const currentIndex = cells.indexOf(currentCell);

    if (event.shiftKey) {
      // Navigate to previous cell
      if (currentIndex > 0) {
        this.focusCell(cells[currentIndex - 1] as HTMLTableCellElement);
      }
    } else {
      // Navigate to next cell
      if (currentIndex < cells.length - 1) {
        this.focusCell(cells[currentIndex + 1] as HTMLTableCellElement);
      } else {
        // At the last cell - create new row
        this.addRowBelow();
      }
    }

    return true;
  }

  /**
   * Focus a specific table cell
   */
  static focusCell(cell: HTMLTableCellElement): void {
    const range = document.createRange();
    const selection = window.getSelection();
    
    if (cell.textContent) {
      range.selectNodeContents(cell);
      range.collapse(false);
    } else {
      // Empty cell - add a space to make it focusable
      cell.innerHTML = '&nbsp;';
      range.setStart(cell, 0);
      range.setEnd(cell, 0);
    }
    
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    // Focus the cell
    if (cell.contentEditable !== 'true') {
      cell.contentEditable = 'true';
    }
    
    try {
      cell.focus();
    } catch (e) {
      // Some elements may not be focusable, silently ignore
    }
  }

  /**
   * Add row above current cell
   */
  static addRowAbove(): void {
    const currentCell = this.getCurrentCell();
    if (!currentCell) return;

    const currentRow = currentCell.parentElement as HTMLTableRowElement;
    if (!currentRow) return;

    const newRow = currentRow.cloneNode(false) as HTMLTableRowElement;
    const cellCount = currentRow.cells.length;

    for (let i = 0; i < cellCount; i++) {
      const newCell = document.createElement(currentRow.cells[i].tagName.toLowerCase() as 'td' | 'th');
      newCell.innerHTML = '&nbsp;';
      newRow.appendChild(newCell);
    }

    currentRow.parentElement?.insertBefore(newRow, currentRow);
  }

  /**
   * Add row below current cell
   */
  static addRowBelow(): void {
    const currentCell = this.getCurrentCell();
    if (!currentCell) return;

    const currentRow = currentCell.parentElement as HTMLTableRowElement;
    if (!currentRow) return;

    const newRow = currentRow.cloneNode(false) as HTMLTableRowElement;
    const cellCount = currentRow.cells.length;

    for (let i = 0; i < cellCount; i++) {
      const newCell = document.createElement('td');
      newCell.innerHTML = '&nbsp;';
      newRow.appendChild(newCell);
    }

    if (currentRow.nextSibling) {
      currentRow.parentElement?.insertBefore(newRow, currentRow.nextSibling);
    } else {
      currentRow.parentElement?.appendChild(newRow);
    }

    // Focus first cell of new row
    this.focusCell(newRow.cells[0]);
  }

  /**
   * Add column to the left
   */
  static addColumnLeft(): void {
    const currentCell = this.getCurrentCell();
    if (!currentCell) return;

    const table = this.getParentTable(currentCell);
    if (!table) return;

    const cellIndex = currentCell.cellIndex;
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
      const newCell = document.createElement(row.cells[cellIndex]?.tagName.toLowerCase() as 'td' | 'th' || 'td');
      newCell.innerHTML = '&nbsp;';
      row.insertBefore(newCell, row.cells[cellIndex]);
    });
  }

  /**
   * Add column to the right
   */
  static addColumnRight(): void {
    const currentCell = this.getCurrentCell();
    if (!currentCell) return;

    const table = this.getParentTable(currentCell);
    if (!table) return;

    const cellIndex = currentCell.cellIndex;
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
      const newCell = document.createElement(row.cells[cellIndex]?.tagName.toLowerCase() as 'td' | 'th' || 'td');
      newCell.innerHTML = '&nbsp;';
      
      if (cellIndex < row.cells.length - 1) {
        row.insertBefore(newCell, row.cells[cellIndex + 1]);
      } else {
        row.appendChild(newCell);
      }
    });
  }

  /**
   * Delete current row
   */
  static deleteRow(): void {
    const currentCell = this.getCurrentCell();
    if (!currentCell) return;

    const currentRow = currentCell.parentElement as HTMLTableRowElement;
    const table = this.getParentTable(currentCell);
    
    if (!currentRow || !table) return;
    
    // Don't delete if it's the only row
    if (table.rows.length <= 1) return;
    
    // Focus a cell in the previous or next row before deleting
    const rowIndex = currentRow.rowIndex;
    if (rowIndex > 0) {
      this.focusCell(table.rows[rowIndex - 1].cells[currentCell.cellIndex]);
    } else if (table.rows.length > 1) {
      this.focusCell(table.rows[1].cells[currentCell.cellIndex]);
    }
    
    currentRow.remove();
  }

  /**
   * Delete current column
   */
  static deleteColumn(): void {
    const currentCell = this.getCurrentCell();
    if (!currentCell) return;

    const table = this.getParentTable(currentCell);
    if (!table) return;

    const cellIndex = currentCell.cellIndex;
    const rows = table.querySelectorAll('tr');
    
    // Don't delete if it's the only column
    const firstRow = rows[0] as HTMLTableRowElement;
    if (!firstRow || firstRow.cells.length <= 1) return;
    
    // Focus a cell in the previous or next column before deleting
    const parentRow = currentCell.parentElement as HTMLTableRowElement;
    if (cellIndex > 0 && parentRow?.cells) {
      this.focusCell(parentRow.cells[cellIndex - 1] as HTMLTableCellElement);
    } else if (firstRow.cells.length > 1 && parentRow?.cells) {
      this.focusCell(parentRow.cells[1] as HTMLTableCellElement);
    }
    
    rows.forEach(row => {
      if (row.cells[cellIndex]) {
        row.cells[cellIndex].remove();
      }
    });
  }

  /**
   * Handle arrow key navigation in tables
   */
  static handleArrowKeyInTable(event: KeyboardEvent): boolean {
    if (!this.isInTable()) return false;
    
    const currentCell = this.getCurrentCell();
    if (!currentCell) return false;
    
    const table = this.getParentTable(currentCell);
    if (!table) return false;
    
    const row = currentCell.parentElement as HTMLTableRowElement;
    // Get tbody if it exists, otherwise use table
    const tbody = table.querySelector('tbody') || table;
    const rows = tbody.querySelectorAll('tr');
    
    // Find the current row index within tbody
    let currentRowIndex = -1;
    rows.forEach((r, index) => {
      if (r === row) currentRowIndex = index;
    });
    
    const cellIndex = currentCell.cellIndex;
    
    let targetCell: HTMLTableCellElement | null = null;
    let shouldExitTable = false;
    
    switch (event.key) {
      case 'ArrowUp':
        if (currentRowIndex > 0) {
          const targetRow = rows[currentRowIndex - 1] as HTMLTableRowElement;
          targetCell = targetRow.cells[Math.min(cellIndex, targetRow.cells.length - 1)];
        } else if (currentRowIndex === 0) {
          // Exit table and move cursor before table
          shouldExitTable = true;
          const range = document.createRange();
          const selection = window.getSelection();
          
          // Try to find or create an element before the table
          if (table.previousSibling) {
            // Move to the end of the previous element
            range.selectNodeContents(table.previousSibling);
            range.collapse(false);
          } else if (table.parentNode) {
            // Create a new paragraph before the table
            const p = document.createElement('p');
            p.innerHTML = '&nbsp;';
            table.parentNode.insertBefore(p, table);
            range.selectNodeContents(p);
            range.collapse(false);
          }
          
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        break;
      case 'ArrowDown':
        if (currentRowIndex < rows.length - 1) {
          const targetRow = rows[currentRowIndex + 1] as HTMLTableRowElement;
          targetCell = targetRow.cells[Math.min(cellIndex, targetRow.cells.length - 1)];
        } else if (currentRowIndex === rows.length - 1) {
          // Exit table and move cursor after table
          shouldExitTable = true;
          const range = document.createRange();
          const selection = window.getSelection();
          
          // Try to find or create an element after the table
          if (table.nextSibling) {
            // Move to the beginning of the next element
            range.selectNodeContents(table.nextSibling);
            range.collapse(true);
          } else if (table.parentNode) {
            // Create a new paragraph after the table
            const p = document.createElement('p');
            p.innerHTML = '&nbsp;';
            table.parentNode.insertBefore(p, table.nextSibling);
            range.selectNodeContents(p);
            range.collapse(true);
          }
          
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        break;
      case 'ArrowLeft':
        if (cellIndex > 0) {
          targetCell = row.cells[cellIndex - 1];
        }
        break;
      case 'ArrowRight':
        if (cellIndex < row.cells.length - 1) {
          targetCell = row.cells[cellIndex + 1];
        }
        break;
    }
    
    if (targetCell) {
      event.preventDefault();
      this.focusCell(targetCell);
      return true;
    } else if (shouldExitTable) {
      event.preventDefault();
      return true;
    }
    
    return false;
  }

  /**
   * Handle arrow keys to enter a table from outside
   */
  static handleArrowKeyToEnterTable(event: KeyboardEvent): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE ? 
      container.parentElement : container as Element;
    
    if (!element) return false;
    
    let table: HTMLTableElement | null = null;
    
    if (event.key === 'ArrowDown') {
      // Check if next sibling is a table
      const next = element.nextElementSibling;
      if (next && next.tagName === 'TABLE') {
        table = next as HTMLTableElement;
        // Enter from top - go to first cell of first row
        const tbody = table.querySelector('tbody') || table;
        const firstRow = tbody.querySelector('tr');
        if (firstRow) {
          const firstCell = firstRow.cells[0];
          if (firstCell) {
            event.preventDefault();
            this.focusCell(firstCell);
            return true;
          }
        }
      }
    } else if (event.key === 'ArrowUp') {
      // Check if previous sibling is a table
      const prev = element.previousElementSibling;
      if (prev && prev.tagName === 'TABLE') {
        table = prev as HTMLTableElement;
        // Enter from bottom - go to FIRST cell of last row
        const tbody = table.querySelector('tbody') || table;
        const rows = tbody.querySelectorAll('tr');
        const lastRow = rows[rows.length - 1] as HTMLTableRowElement;
        if (lastRow) {
          const firstCell = lastRow.cells[0]; // Go to first cell, not last
          if (firstCell) {
            event.preventDefault();
            this.focusCell(firstCell);
            return true;
          }
        }
      }
    }
    
    return false;
  }
}