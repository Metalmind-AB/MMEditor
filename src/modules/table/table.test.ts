import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TableManager } from './table';

// Mock window.getSelection and document.createRange at the module level
vi.stubGlobal('getSelection', vi.fn());
vi.stubGlobal('document', {
  ...document,
  createRange: vi.fn(),
  createElement: document.createElement.bind(document),
  createTextNode: document.createTextNode.bind(document)
});

describe('TableManager', () => {
  // Mock DOM elements and methods
  let mockTable: HTMLTableElement;
  let mockTbody: HTMLTableSectionElement;
  let mockRow: HTMLTableRowElement;
  let mockCell: HTMLTableCellElement;
  let mockSelection: Selection;
  let mockRange: Range;

  // Helper to create mock table cells with proper properties
  function createMockCell(tagName: string = 'TD', cellIndex: number = 0): HTMLTableCellElement {
    const cell = document.createElement(tagName.toLowerCase() as 'td' | 'th');
    // Use a custom property to track cellIndex since the real one is read-only
    (cell as any).__mockCellIndex = cellIndex;
    Object.defineProperty(cell, 'cellIndex', {
      get() { return (this as any).__mockCellIndex; },
      set(value) { (this as any).__mockCellIndex = value; },
      configurable: true
    });
    return cell;
  }

  // Helper to create mock table rows
  function createMockRow(cells: HTMLTableCellElement[], rowIndex: number = 0): HTMLTableRowElement {
    const row = document.createElement('tr');
    cells.forEach(cell => row.appendChild(cell));
    
    // Use a custom property to track rowIndex since the real one is read-only
    (row as any).__mockRowIndex = rowIndex;
    Object.defineProperty(row, 'rowIndex', {
      get() { return (this as any).__mockRowIndex; },
      set(value) { (this as any).__mockRowIndex = value; },
      configurable: true
    });
    
    Object.defineProperty(row, 'cells', {
      get() { return Array.from(this.querySelectorAll('td, th')); },
      configurable: true
    });
    
    return row;
  }

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    vi.restoreAllMocks();

    // Create mock range
    mockRange = {
      setStart: vi.fn(),
      setEnd: vi.fn(),
      selectNodeContents: vi.fn(),
      collapse: vi.fn(),
    } as any as Range;

    // Create mock selection
    mockSelection = {
      getRangeAt: vi.fn(() => mockRange),
      removeAllRanges: vi.fn(),
      addRange: vi.fn(),
    } as any as Selection;
    
    // Set read-only properties using Object.defineProperty
    Object.defineProperty(mockSelection, 'rangeCount', { value: 1, writable: true, configurable: true });
    Object.defineProperty(mockSelection, 'anchorNode', { value: null, writable: true, configurable: true });

    // Mock window.getSelection with proper typing
    vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
    
    // Mock document.createRange with proper typing
    vi.spyOn(document, 'createRange').mockReturnValue(mockRange);

    // Create fresh DOM structure for each test
    resetTableStructure();
  });

  function resetTableStructure() {
    // Create mock table structure
    mockCell = createMockCell('TD', 1);
    mockCell.innerHTML = 'Cell content';
    mockCell.contentEditable = 'true';

    mockRow = createMockRow([mockCell], 1);
    
    mockTbody = document.createElement('tbody');
    mockTbody.appendChild(mockRow);

    mockTable = document.createElement('table');
    mockTable.appendChild(mockTbody);

    // Set up parent/child relationships
    Object.defineProperty(mockCell, 'parentElement', { value: mockRow, configurable: true });
    Object.defineProperty(mockRow, 'parentElement', { value: mockTbody, configurable: true });
    Object.defineProperty(mockTbody, 'parentElement', { value: mockTable, configurable: true });

    // Mock rows property on table
    Object.defineProperty(mockTable, 'rows', {
      get() { return Array.from(this.querySelectorAll('tr')); },
      configurable: true
    });

    // Set anchor node for selection
    Object.defineProperty(mockSelection, 'anchorNode', { value: mockCell, writable: true, configurable: true });

    // Mock querySelector methods
    mockTable.querySelectorAll = vi.fn((selector) => {
      if (selector === 'tr') {
        const nodeList: Element[] = [mockRow];
        (nodeList as any).item = (index: number) => nodeList[index] || null;
        return nodeList as unknown as NodeListOf<Element>;
      }
      if (selector === 'td, th') {
        const nodeList: Element[] = [mockCell];
        (nodeList as any).item = (index: number) => nodeList[index] || null;
        return nodeList as unknown as NodeListOf<Element>;
      }
      const nodeList: Element[] = [];
      (nodeList as any).item = (index: number) => nodeList[index] || null;
      return nodeList as unknown as NodeListOf<Element>;
    });

    mockTable.querySelector = vi.fn((selector) => {
      if (selector === 'tbody') return mockTbody;
      return null;
    });

    mockTbody.querySelectorAll = vi.fn((selector) => {
      if (selector === 'tr') {
        const nodeList: Element[] = [mockRow];
        (nodeList as any).item = (index: number) => nodeList[index] || null;
        return nodeList as unknown as NodeListOf<Element>;
      }
      const nodeList: Element[] = [];
      (nodeList as any).item = (index: number) => nodeList[index] || null;
      return nodeList as unknown as NodeListOf<Element>;
    });

    mockTbody.querySelector = vi.fn((selector) => {
      if (selector === 'tr') return mockRow;
      return null;
    });
  }

  describe('isInTable', () => {
    it('returns true when selection is inside a table cell', () => {
      expect(TableManager.isInTable()).toBe(true);
    });

    it('returns true when selection is inside a table header', () => {
      const mockTh = createMockCell('TH');
      Object.defineProperty(mockSelection, 'anchorNode', { value: mockTh, writable: true, configurable: true });
      
      expect(TableManager.isInTable()).toBe(true);
    });

    it('returns true when selection is inside a table element', () => {
      Object.defineProperty(mockSelection, 'anchorNode', { value: mockTable, writable: true, configurable: true });
      
      expect(TableManager.isInTable()).toBe(true);
    });

    it('returns false when no selection exists', () => {
      vi.mocked(window.getSelection).mockReturnValue(null);
      
      expect(TableManager.isInTable()).toBe(false);
    });

    it('returns false when selection has no ranges', () => {
      Object.defineProperty(mockSelection, 'rangeCount', { value: 0, writable: true, configurable: true });
      
      expect(TableManager.isInTable()).toBe(false);
    });

    it('returns false when selection is outside a table', () => {
      const mockDiv = document.createElement('div');
      Object.defineProperty(mockDiv, 'parentNode', { value: null, configurable: true });
      Object.defineProperty(mockSelection, 'anchorNode', { value: mockDiv, writable: true, configurable: true });
      
      expect(TableManager.isInTable()).toBe(false);
    });

    it('traverses DOM tree to find table elements', () => {
      const mockSpan = document.createElement('span');
      Object.defineProperty(mockSpan, 'parentNode', { value: mockCell, configurable: true });
      Object.defineProperty(mockSelection, 'anchorNode', { value: mockSpan, writable: true, configurable: true });
      
      expect(TableManager.isInTable()).toBe(true);
    });
  });

  describe('getCurrentCell', () => {
    it('returns current TD cell when selection is inside', () => {
      const result = TableManager.getCurrentCell();
      expect(result).toBe(mockCell);
    });

    it('returns current TH cell when selection is inside header', () => {
      const mockTh = createMockCell('TH');
      Object.defineProperty(mockSelection, 'anchorNode', { value: mockTh, writable: true, configurable: true });
      
      const result = TableManager.getCurrentCell();
      expect(result).toBe(mockTh);
    });

    it('returns null when no selection exists', () => {
      vi.mocked(window.getSelection).mockReturnValue(null);
      
      const result = TableManager.getCurrentCell();
      expect(result).toBeNull();
    });

    it('returns null when selection has no ranges', () => {
      Object.defineProperty(mockSelection, 'rangeCount', { value: 0, writable: true, configurable: true });
      
      const result = TableManager.getCurrentCell();
      expect(result).toBeNull();
    });

    it('returns null when selection is outside table cells', () => {
      const mockDiv = document.createElement('div');
      Object.defineProperty(mockDiv, 'parentNode', { value: null, configurable: true });
      Object.defineProperty(mockSelection, 'anchorNode', { value: mockDiv, writable: true, configurable: true });
      
      const result = TableManager.getCurrentCell();
      expect(result).toBeNull();
    });

    it('traverses DOM tree to find table cells', () => {
      const mockSpan = document.createElement('span');
      Object.defineProperty(mockSpan, 'parentNode', { value: mockCell, configurable: true });
      Object.defineProperty(mockSelection, 'anchorNode', { value: mockSpan, writable: true, configurable: true });
      
      const result = TableManager.getCurrentCell();
      expect(result).toBe(mockCell);
    });
  });

  describe('getParentTable', () => {
    it('returns parent table when given a cell', () => {
      const result = TableManager.getParentTable(mockCell);
      expect(result).toBe(mockTable);
    });

    it('returns table when given table element directly', () => {
      const result = TableManager.getParentTable(mockTable);
      expect(result).toBe(mockTable);
    });

    it('returns null when given null node', () => {
      const result = TableManager.getParentTable(null);
      expect(result).toBeNull();
    });

    it('returns null when no table parent exists', () => {
      const mockDiv = document.createElement('div');
      Object.defineProperty(mockDiv, 'parentNode', { value: null, configurable: true });
      
      const result = TableManager.getParentTable(mockDiv);
      expect(result).toBeNull();
    });

    it('traverses DOM tree to find table element', () => {
      const mockSpan = document.createElement('span');
      Object.defineProperty(mockSpan, 'parentNode', { value: mockCell, configurable: true });
      
      const result = TableManager.getParentTable(mockSpan);
      expect(result).toBe(mockTable);
    });
  });

  describe('focusCell', () => {
    it('focuses cell with existing content', () => {
      mockCell.textContent = 'Test content';
      mockCell.focus = vi.fn();
      
      TableManager.focusCell(mockCell);
      
      expect(mockRange.selectNodeContents).toHaveBeenCalledWith(mockCell);
      expect(mockRange.collapse).toHaveBeenCalledWith(false);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
      expect(mockCell.focus).toHaveBeenCalled();
    });

    it('focuses empty cell by adding non-breaking space', () => {
      mockCell.textContent = '';
      mockCell.focus = vi.fn();
      
      TableManager.focusCell(mockCell);
      
      expect(mockCell.innerHTML).toBe('&nbsp;');
      expect(mockRange.setStart).toHaveBeenCalledWith(mockCell, 0);
      expect(mockRange.setEnd).toHaveBeenCalledWith(mockCell, 0);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
      expect(mockCell.focus).toHaveBeenCalled();
    });

    it('makes cell contentEditable if not already', () => {
      mockCell.contentEditable = 'false';
      mockCell.focus = vi.fn();
      mockCell.textContent = 'Test';
      
      TableManager.focusCell(mockCell);
      
      expect(mockCell.contentEditable).toBe('true');
    });

    it('handles cells that are already contentEditable', () => {
      mockCell.contentEditable = 'true';
      mockCell.focus = vi.fn();
      mockCell.textContent = 'Test';
      
      TableManager.focusCell(mockCell);
      
      expect(mockCell.contentEditable).toBe('true');
    });
  });

  describe('handleTabInTable', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    let mockEvent: KeyboardEvent;
    
    beforeEach(() => {
      mockEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
      Object.defineProperty(mockEvent, 'preventDefault', { value: vi.fn(), writable: true });
      
      // Mock TableManager methods
      vi.spyOn(TableManager, 'isInTable').mockReturnValue(true);
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(mockCell);
      vi.spyOn(TableManager, 'getParentTable').mockReturnValue(mockTable);
      vi.spyOn(TableManager, 'focusCell').mockImplementation(vi.fn());
      vi.spyOn(TableManager, 'addRowBelow').mockImplementation(vi.fn());
    });

    it('returns false when not in table', () => {
      vi.spyOn(TableManager, 'isInTable').mockReturnValue(false);
      
      const result = TableManager.handleTabInTable(mockEvent);
      
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('returns false when no current cell found', () => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(null);
      
      const result = TableManager.handleTabInTable(mockEvent);
      
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('returns false when no parent table found', () => {
      vi.spyOn(TableManager, 'getParentTable').mockReturnValue(null);
      
      const result = TableManager.handleTabInTable(mockEvent);
      
      expect(result).toBe(false);
      // Note: preventDefault is called even when returning false in the actual implementation
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('navigates to next cell on Tab', () => {
      const nextCell = createMockCell('TD', 1);
      Object.defineProperty(mockCell, 'cellIndex', { value: 0, writable: true, configurable: true });
      const nodeList: Element[] = [mockCell, nextCell];
      (nodeList as any).item = (index: number) => nodeList[index] || null;
      mockTable.querySelectorAll = vi.fn(() => nodeList as unknown as NodeListOf<Element>);
      
      const result = TableManager.handleTabInTable(mockEvent);
      
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(TableManager.focusCell).toHaveBeenCalledWith(nextCell);
    });

    it('navigates to previous cell on Shift+Tab', () => {
      const prevCell = createMockCell('TD', 0);
      Object.defineProperty(mockEvent, 'shiftKey', { value: true, writable: true, configurable: true });
      Object.defineProperty(mockCell, 'cellIndex', { value: 1, writable: true, configurable: true });
      const nodeList2: Element[] = [prevCell, mockCell];
      (nodeList2 as any).item = (index: number) => nodeList2[index] || null;
      mockTable.querySelectorAll = vi.fn(() => nodeList2 as unknown as NodeListOf<Element>);
      
      const result = TableManager.handleTabInTable(mockEvent);
      
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(TableManager.focusCell).toHaveBeenCalledWith(prevCell);
    });

    it('adds new row when Tab pressed on last cell', () => {
      Object.defineProperty(mockCell, 'cellIndex', { value: 0, writable: true, configurable: true });
      const nodeList3: Element[] = [mockCell];
      (nodeList3 as any).item = (index: number) => nodeList3[index] || null;
      mockTable.querySelectorAll = vi.fn(() => nodeList3 as unknown as NodeListOf<Element>);
      
      const result = TableManager.handleTabInTable(mockEvent);
      
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(TableManager.addRowBelow).toHaveBeenCalled();
    });
  });

  describe('addRowAbove', () => {
    beforeEach(() => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(mockCell);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('adds row above current cell', () => {
      const insertBefore = vi.fn();
      mockTbody.insertBefore = insertBefore;
      
      TableManager.addRowAbove();
      
      expect(insertBefore).toHaveBeenCalled();
      const newRow = insertBefore.mock.calls[0][0];
      expect(newRow.tagName.toLowerCase()).toBe('tr');
    });

    it('does nothing when no current cell', () => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(null);
      const insertBefore = vi.fn();
      mockTbody.insertBefore = insertBefore;
      
      TableManager.addRowAbove();
      
      expect(insertBefore).not.toHaveBeenCalled();
    });

    it('does nothing when current cell has no parent row', () => {
      Object.defineProperty(mockCell, 'parentElement', { value: null, configurable: true });
      const insertBefore = vi.fn();
      mockTbody.insertBefore = insertBefore;
      
      TableManager.addRowAbove();
      
      expect(insertBefore).not.toHaveBeenCalled();
    });
  });

  describe('addRowBelow', () => {
    beforeEach(() => {
      // Set up selection to point to mockCell
      Object.defineProperty(mockSelection, 'anchorNode', { value: mockCell, writable: true, configurable: true });
      vi.spyOn(TableManager, 'focusCell').mockImplementation(vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('adds row below current cell', () => {
      const appendChild = vi.fn();
      const insertBefore = vi.fn();
      // The implementation calls currentRow.parentElement?.appendChild() when no nextSibling
      Object.defineProperty(mockRow, 'parentElement', { 
        value: { appendChild, insertBefore }, 
        configurable: true 
      });
      Object.defineProperty(mockRow, 'nextSibling', { value: null, configurable: true });
      
      TableManager.addRowBelow();
      
      expect(appendChild).toHaveBeenCalled();
      const newRow = appendChild.mock.calls[0][0];
      expect(newRow.tagName.toLowerCase()).toBe('tr');
    });

    it('focuses first cell of new row', () => {
      const appendChild = vi.fn();
      const insertBefore = vi.fn();
      vi.spyOn(TableManager, 'focusCell');
      
      // The implementation calls currentRow.parentElement?.appendChild() when no nextSibling
      Object.defineProperty(mockRow, 'parentElement', { 
        value: { appendChild, insertBefore }, 
        configurable: true 
      });
      Object.defineProperty(mockRow, 'nextSibling', { value: null, configurable: true });
      
      TableManager.addRowBelow();
      
      expect(appendChild).toHaveBeenCalled();
      const newRow = appendChild.mock.calls[0][0];
      expect(TableManager.focusCell).toHaveBeenCalledWith(newRow.cells[0]);
    });

    it('does nothing when no current cell', () => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(null);
      const appendChild = vi.fn();
      mockTbody.appendChild = appendChild;
      
      TableManager.addRowBelow();
      
      expect(appendChild).not.toHaveBeenCalled();
    });
  });

  describe('addColumnLeft', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    beforeEach(() => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(mockCell);
      vi.spyOn(TableManager, 'getParentTable').mockReturnValue(mockTable);
    });

    it('adds column to the left of current cell', () => {
      const insertBefore = vi.fn();
      mockRow.insertBefore = insertBefore;
      
      // Set up cellIndex correctly - the algorithm looks for cells[cellIndex]
      Object.defineProperty(mockCell, 'cellIndex', { value: 0, writable: true, configurable: true });
      
      // Make sure cells array is properly set up with the right index
      Object.defineProperty(mockRow, 'cells', {
        get() { return [mockCell]; },
        configurable: true
      });
      
      TableManager.addColumnLeft();
      
      expect(insertBefore).toHaveBeenCalledWith(expect.any(HTMLTableCellElement), mockCell);
    });

    it('does nothing when no current cell', () => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(null);
      
      TableManager.addColumnLeft();
      
      expect(mockTable.querySelectorAll).not.toHaveBeenCalled();
    });

    it('does nothing when no parent table', () => {
      vi.spyOn(TableManager, 'getParentTable').mockReturnValue(null);
      
      TableManager.addColumnLeft();
      
      expect(mockTable.querySelectorAll).not.toHaveBeenCalled();
    });
  });

  describe('addColumnRight', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    beforeEach(() => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(mockCell);
      vi.spyOn(TableManager, 'getParentTable').mockReturnValue(mockTable);
    });

    it('appends column when current cell is last', () => {
      const appendChild = vi.fn();
      mockRow.appendChild = appendChild;
      Object.defineProperty(mockCell, 'cellIndex', { value: 0, writable: true, configurable: true });
      
      TableManager.addColumnRight();
      
      expect(appendChild).toHaveBeenCalled();
    });

    it('does nothing when no current cell', () => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(null);
      
      TableManager.addColumnRight();
      
      expect(mockTable.querySelectorAll).not.toHaveBeenCalled();
    });
  });

  describe('deleteRow', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    beforeEach(() => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(mockCell);
      vi.spyOn(TableManager, 'getParentTable').mockReturnValue(mockTable);
      vi.spyOn(TableManager, 'focusCell').mockImplementation(vi.fn());
    });

    it('deletes current row when multiple rows exist', () => {
      const row2 = createMockRow([createMockCell('TD')], 1);
      // const cell2 = row2.cells[0];
      
      // Mock table with 2 rows
      Object.defineProperty(mockTable, 'rows', {
        get() { return [mockRow, row2]; },
        configurable: true
      });
      
      Object.defineProperty(mockRow, 'rowIndex', { value: 0, writable: true, configurable: true });
      const remove = vi.fn();
      mockRow.remove = remove;
      
      TableManager.deleteRow();
      
      expect(remove).toHaveBeenCalled();
    });

    it('does not delete if only one row exists', () => {
      Object.defineProperty(mockTable, 'rows', {
        get() { return [mockRow]; },
        configurable: true
      });
      
      const remove = vi.fn();
      mockRow.remove = remove;
      
      TableManager.deleteRow();
      
      expect(remove).not.toHaveBeenCalled();
    });

    it('does nothing when no current cell', () => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(null);
      
      TableManager.deleteRow();
      
      expect(TableManager.focusCell).not.toHaveBeenCalled();
    });
  });

  describe('deleteColumn', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    beforeEach(() => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(mockCell);
      vi.spyOn(TableManager, 'getParentTable').mockReturnValue(mockTable);
      vi.spyOn(TableManager, 'focusCell').mockImplementation(vi.fn());
    });

    it('deletes current column when multiple columns exist', () => {
      const cell2 = createMockCell('TD', 1);
      const newRow = createMockRow([mockCell, cell2]);
      
      Object.defineProperty(mockCell, 'cellIndex', { value: 0, writable: true, configurable: true });
      const remove = vi.fn();
      mockCell.remove = remove;
      
      mockTable.querySelectorAll = vi.fn(() => {
        const nodeList = [newRow];
        (nodeList as any).item = (index: number) => nodeList[index] || null;
        return nodeList as unknown as NodeListOf<Element>;
      });
      
      TableManager.deleteColumn();
      
      expect(remove).toHaveBeenCalled();
    });

    it('does not delete if only one column exists', () => {
      const newRow = createMockRow([mockCell]);
      
      const remove = vi.fn();
      mockCell.remove = remove;
      
      mockTable.querySelectorAll = vi.fn(() => {
        const nodeList = [newRow];
        (nodeList as any).item = (index: number) => nodeList[index] || null;
        return nodeList as unknown as NodeListOf<Element>;
      });
      
      TableManager.deleteColumn();
      
      expect(remove).not.toHaveBeenCalled();
    });

    it('does nothing when no current cell', () => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(null);
      
      TableManager.deleteColumn();
      
      expect(TableManager.focusCell).not.toHaveBeenCalled();
    });
  });

  describe('handleArrowKeyInTable', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    let mockEvent: KeyboardEvent;
    
    beforeEach(() => {
      mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      Object.defineProperty(mockEvent, 'preventDefault', { value: vi.fn(), writable: true });
      
      vi.spyOn(TableManager, 'isInTable').mockReturnValue(true);
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(mockCell);
      vi.spyOn(TableManager, 'getParentTable').mockReturnValue(mockTable);
      vi.spyOn(TableManager, 'focusCell').mockImplementation(vi.fn());
    });

    it('returns false when not in table', () => {
      vi.spyOn(TableManager, 'isInTable').mockReturnValue(false);
      
      const result = TableManager.handleArrowKeyInTable(mockEvent);
      
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('returns false when no current cell', () => {
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(null);
      
      const result = TableManager.handleArrowKeyInTable(mockEvent);
      
      expect(result).toBe(false);
    });

    it('navigates right to next cell', () => {
      const cell2 = createMockCell('TD', 1);
      
      // Set up the row to have both cells
      Object.defineProperty(mockRow, 'cells', {
        get() { return [mockCell, cell2]; },
        configurable: true
      });
      
      Object.defineProperty(mockCell, 'cellIndex', { value: 0, configurable: true });
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowRight', configurable: true });
      
      const result = TableManager.handleArrowKeyInTable(mockEvent);
      
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(TableManager.focusCell).toHaveBeenCalledWith(cell2);
    });

    it('returns false for right arrow at last cell', () => {
      createMockRow([mockCell]);
      Object.defineProperty(mockCell, 'cellIndex', { value: 0, writable: true, configurable: true });
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowRight', writable: true, configurable: true });
      
      const result = TableManager.handleArrowKeyInTable(mockEvent);
      
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('handleArrowKeyToEnterTable', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    let mockEvent: KeyboardEvent;
    let mockElement: HTMLElement;
    
    beforeEach(() => {
      mockEvent = {
        preventDefault: vi.fn()
      } as unknown as KeyboardEvent;
      
      // Set read-only properties using Object.defineProperty
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowDown', configurable: true });
      
      mockElement = document.createElement('p');
      
      const mockRange = {} as Range;
      Object.defineProperty(mockRange, 'commonAncestorContainer', { value: mockElement, configurable: true });
      
      mockSelection.getRangeAt = vi.fn(() => mockRange);
      vi.spyOn(TableManager, 'focusCell').mockImplementation(vi.fn());
    });

    it('returns false when no selection exists', () => {
      vi.mocked(window.getSelection).mockReturnValue(null);
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(false);
    });

    it('returns false when selection has no ranges', () => {
      Object.defineProperty(mockSelection, 'rangeCount', { value: 0, configurable: true });
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(false);
    });

    it('enters table from above on ArrowDown', () => {
      Object.defineProperty(mockElement, 'nextElementSibling', { value: mockTable, configurable: true });
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(TableManager.focusCell).toHaveBeenCalledWith(mockCell);
    });

    it('returns false when next sibling is not a table', () => {
      const mockDiv = document.createElement('div');
      Object.defineProperty(mockElement, 'nextElementSibling', { value: mockDiv, configurable: true });
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('returns false for non-arrow keys', () => {
      Object.defineProperty(mockEvent, 'key', { value: 'Enter', configurable: true });
      Object.defineProperty(mockElement, 'nextElementSibling', { value: mockTable, configurable: true });
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('handles null selection gracefully in all methods', () => {
      // Use vitest's mocking since getSelection is already a vi.fn() from setup
      vi.mocked(window.getSelection).mockReturnValue(null);
      
      // These should all handle null selection gracefully
      expect(TableManager.isInTable()).toBe(false);
      expect(TableManager.getCurrentCell()).toBeNull();
      expect(() => TableManager.addRowAbove()).not.toThrow();
      expect(() => TableManager.addRowBelow()).not.toThrow();
      expect(() => TableManager.deleteRow()).not.toThrow();
      expect(() => TableManager.deleteColumn()).not.toThrow();
      
      // Restore the normal mock for other tests
      vi.mocked(window.getSelection).mockReturnValue(mockSelection);
    });

    it('handles malformed table structures', () => {
      const malformedTable = document.createElement('table');
      vi.spyOn(TableManager, 'getParentTable').mockReturnValue(malformedTable);
      vi.spyOn(TableManager, 'getCurrentCell').mockReturnValue(mockCell);
      
      expect(() => TableManager.addRowAbove()).not.toThrow();
      expect(() => TableManager.addRowBelow()).not.toThrow();
    });

    it('handles focus operations when elements cannot be focused', () => {
      const unfocusableCell = createMockCell('TD');
      unfocusableCell.focus = vi.fn(() => {
        throw new Error('Cannot focus');
      });
      
      expect(() => TableManager.focusCell(unfocusableCell)).not.toThrow();
    });

    it('handles keyboard events with missing properties', () => {
      const incompleteEvent = {
        preventDefault: vi.fn()
      } as unknown as KeyboardEvent;
      
      // These should handle incomplete events gracefully
      expect(() => TableManager.handleTabInTable(incompleteEvent)).not.toThrow();
      expect(() => TableManager.handleArrowKeyInTable(incompleteEvent)).not.toThrow();
      
      // For handleArrowKeyToEnterTable, we need to provide a selection that won't cause errors
      const originalGetSelection = vi.spyOn(window, 'getSelection');
      vi.spyOn(window, 'getSelection').mockReturnValue(null);
      expect(() => TableManager.handleArrowKeyToEnterTable(incompleteEvent)).not.toThrow();
      
      // Restore the original mock
      originalGetSelection.mockRestore();
    });
  });

  describe('Arrow Key Navigation Edge Cases', () => {
    let mockEvent: KeyboardEvent;

    beforeEach(() => {
      mockEvent = {
        shiftKey: false,
        preventDefault: vi.fn()
      } as unknown as KeyboardEvent;
      
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowUp', configurable: true });
      
      Object.defineProperty(mockSelection, 'anchorNode', { value: mockCell, configurable: true });
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
    });

    it('handles shouldExitTable scenario in handleArrowKeyInTable', () => {
      // Set up a scenario where we're at the edge of the table and should exit
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowUp', configurable: true });
      Object.defineProperty(mockCell, 'parentElement', {
        value: mockRow,
        configurable: true
      });
      Object.defineProperty(mockRow, 'rowIndex', { value: 0, configurable: true }); // First row
      Object.defineProperty(mockCell, 'cellIndex', { value: 0, configurable: true });
      
      // Mock the table structure - single row, single cell
      mockTable.querySelector = vi.fn((selector) => {
        if (selector === 'tbody') return mockTbody;
        return null;
      });
      
      mockTbody.querySelectorAll = vi.fn(() => {
        const nodeList: Element[] = [mockRow];
        (nodeList as any).item = (index: number) => nodeList[index] || null;
        return nodeList as unknown as NodeListOf<Element>;
      });
      Object.defineProperty(mockRow, 'cells', {
        value: [mockCell],
        configurable: true
      });
      
      const result = TableManager.handleArrowKeyInTable(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('handleArrowKeyToEnterTable', () => {
    let mockEvent: KeyboardEvent;
    let mockElement: HTMLElement;
    let mockTable: HTMLTableElement;

    beforeEach(() => {
      mockEvent = {
        preventDefault: vi.fn()
      } as unknown as KeyboardEvent;
      
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowDown', configurable: true });
      
      mockElement = document.createElement('p');
      mockTable = document.createElement('table');
      
      // Mock selection
      Object.defineProperty(mockRange, 'commonAncestorContainer', { value: mockElement, configurable: true });
      mockSelection.getRangeAt = vi.fn(() => mockRange);
      Object.defineProperty(mockSelection, 'rangeCount', { value: 1, configurable: true });
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      
      vi.spyOn(TableManager, 'focusCell').mockImplementation(vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('enters table from top with ArrowDown', () => {
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowDown', configurable: true });
      
      // Set up next sibling as table
      Object.defineProperty(mockElement, 'nextElementSibling', {
        value: mockTable,
        configurable: true
      });
      
      // Create table structure
      const tbody = document.createElement('tbody');
      const row = document.createElement('tr');
      const cell = createMockCell('TD', 0);
      
      row.appendChild(cell);
      tbody.appendChild(row);
      mockTable.appendChild(tbody);
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(TableManager.focusCell).toHaveBeenCalledWith(cell);
    });

    it('enters table from bottom with ArrowUp', () => {
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowUp', configurable: true });
      
      // Set up previous sibling as table
      Object.defineProperty(mockElement, 'previousElementSibling', {
        value: mockTable,
        configurable: true
      });
      
      // Create table structure with multiple rows
      const tbody = document.createElement('tbody');
      const firstRow = document.createElement('tr');
      const firstCell = createMockCell('TD', 0);
      const lastRow = document.createElement('tr');
      const lastCell = createMockCell('TD', 0);
      
      firstRow.appendChild(firstCell);
      lastRow.appendChild(lastCell);
      tbody.appendChild(firstRow);
      tbody.appendChild(lastRow);
      mockTable.appendChild(tbody);
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      // Should focus first cell of LAST row when entering from bottom
      expect(TableManager.focusCell).toHaveBeenCalledWith(lastCell);
    });

    it('returns false when no adjacent table exists', () => {
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowDown', configurable: true });
      
      // No next sibling
      Object.defineProperty(mockElement, 'nextElementSibling', {
        value: null,
        configurable: true
      });
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('returns false when adjacent element is not a table', () => {
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowDown', configurable: true });
      
      // Next sibling is a div, not a table
      const div = document.createElement('div');
      Object.defineProperty(mockElement, 'nextElementSibling', {
        value: div,
        configurable: true
      });
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('returns false when table has no rows', () => {
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowDown', configurable: true });
      
      // Empty table
      Object.defineProperty(mockElement, 'nextElementSibling', {
        value: mockTable,
        configurable: true
      });
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('handles table without tbody', () => {
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowDown', configurable: true });
      
      Object.defineProperty(mockElement, 'nextElementSibling', {
        value: mockTable,
        configurable: true
      });
      
      // Create table structure without tbody
      const row = document.createElement('tr');
      const cell = createMockCell('TD', 0);
      
      row.appendChild(cell);
      mockTable.appendChild(row); // Direct child, no tbody
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(TableManager.focusCell).toHaveBeenCalledWith(cell);
    });

    it('returns false when selection is unavailable', () => {
      vi.mocked(window.getSelection).mockReturnValue(null);
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(false);
    });

    it('returns false when range is unavailable', () => {
      Object.defineProperty(mockSelection, 'rangeCount', { value: 0, configurable: true });
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(false);
    });

    it('handles text node as commonAncestorContainer', () => {
      Object.defineProperty(mockEvent, 'key', { value: 'ArrowDown', configurable: true });
      
      // Create text node with parent element
      const textNode = document.createTextNode('text');
      const parentElement = document.createElement('p');
      parentElement.appendChild(textNode);
      
      Object.defineProperty(mockRange, 'commonAncestorContainer', { value: textNode, configurable: true });
      
      Object.defineProperty(parentElement, 'nextElementSibling', {
        value: mockTable,
        configurable: true
      });
      
      // Create table structure
      const tbody = document.createElement('tbody');
      const row = document.createElement('tr');
      const cell = createMockCell('TD', 0);
      
      row.appendChild(cell);
      tbody.appendChild(row);
      mockTable.appendChild(tbody);
      
      const result = TableManager.handleArrowKeyToEnterTable(mockEvent);
      
      expect(result).toBe(true);
      expect(TableManager.focusCell).toHaveBeenCalledWith(cell);
    });
  });
});