import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HistoryManager } from './history';
import { RefObject } from 'react';

// Mock window.getSelection
const mockSelection = {
  getRangeAt: vi.fn(),
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
  rangeCount: 1,
};

const mockRange = {
  startContainer: null as Node | null,
  endContainer: null as Node | null,
  startOffset: 0,
  endOffset: 0,
  setStart: vi.fn(),
  setEnd: vi.fn(),
};

describe('HistoryManager', () => {
  let historyManager: HistoryManager;
  let mockEditorRef: RefObject<HTMLDivElement | null>;
  let mockOnStateChange: ReturnType<typeof vi.fn>;
  let mockEditorElement: HTMLDivElement;

  beforeEach(() => {
    // Create mock editor element
    mockEditorElement = document.createElement('div');
    mockEditorElement.innerHTML = '<p>Initial content</p>';

    mockEditorRef = {
      current: mockEditorElement,
    };

    mockOnStateChange = vi.fn();

    // Mock window.getSelection
    vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as unknown as Selection);
    mockSelection.getRangeAt.mockReturnValue(mockRange);

    historyManager = new HistoryManager(mockEditorRef, mockOnStateChange);
  });

  afterEach(() => {
    historyManager.destroy();
    vi.restoreAllMocks();
  });

  describe('pushImmediate', () => {
    it('should push entry to history immediately', () => {
      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushImmediate('<p>Second</p>');

      expect(historyManager.canUndo()).toBe(true);
      expect(mockOnStateChange).toHaveBeenCalled();
    });

    it('should not push duplicate content', () => {
      historyManager.pushImmediate('<p>Same</p>');
      historyManager.pushImmediate('<p>Same</p>');

      // Can't undo because only one unique entry
      expect(historyManager.canUndo()).toBe(false);
    });

    it('should clear redo stack on new push after undo', () => {
      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushImmediate('<p>Second</p>');

      historyManager.undo();
      expect(historyManager.canRedo()).toBe(true);

      historyManager.pushImmediate('<p>Third</p>');
      expect(historyManager.canRedo()).toBe(false);
    });
  });

  describe('pushTyping (Word-style)', () => {
    it('should accumulate typing without committing immediately', () => {
      historyManager.pushImmediate('<p>Initial</p>'); // Set initial state

      historyManager.pushTyping('<p>A</p>');
      historyManager.pushTyping('<p>AB</p>');
      historyManager.pushTyping('<p>ABC</p>');

      // Before commit, undo stack should not have the typing
      // But canUndo should be true because there's pending typing
      expect(historyManager.canUndo()).toBe(true);
      expect(historyManager.isInTypingSequence()).toBe(true);
    });

    it('should commit typing when commitTyping is called', () => {
      historyManager.pushImmediate('<p>Initial</p>');

      historyManager.pushTyping('<p>ABC</p>');
      historyManager.commitTyping();

      expect(historyManager.isInTypingSequence()).toBe(false);

      const entry = historyManager.undo();
      expect(entry?.html).toBe('<p>Initial</p>');
    });

    it('should commit pending typing before pushImmediate', () => {
      historyManager.pushImmediate('<p>Initial</p>');
      historyManager.pushTyping('<p>Typed</p>');
      historyManager.pushImmediate('<p>Format Applied</p>');

      // Should be able to undo twice: format -> typed -> initial
      const entry1 = historyManager.undo();
      expect(entry1?.html).toBe('<p>Typed</p>');

      const entry2 = historyManager.undo();
      expect(entry2?.html).toBe('<p>Initial</p>');
    });
  });

  describe('undo', () => {
    it('should return previous state', () => {
      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushImmediate('<p>Second</p>');

      const entry = historyManager.undo();
      expect(entry?.html).toBe('<p>First</p>');
    });

    it('should return null when nothing to undo', () => {
      historyManager.pushImmediate('<p>Only</p>');

      const entry = historyManager.undo();
      expect(entry).toBeNull();
    });

    it('should commit pending typing before undo', () => {
      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushTyping('<p>Second</p>');

      // Undo should commit pending typing first, then undo
      const entry = historyManager.undo();
      expect(entry?.html).toBe('<p>First</p>');
    });
  });

  describe('redo', () => {
    it('should return next state after undo', () => {
      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushImmediate('<p>Second</p>');

      historyManager.undo();
      const entry = historyManager.redo();
      expect(entry?.html).toBe('<p>Second</p>');
    });

    it('should return null when nothing to redo', () => {
      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushImmediate('<p>Second</p>');

      const entry = historyManager.redo();
      expect(entry).toBeNull();
    });

    it('should allow multiple undo/redo cycles', () => {
      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushImmediate('<p>Second</p>');
      historyManager.pushImmediate('<p>Third</p>');

      // Undo twice
      historyManager.undo();
      const entry1 = historyManager.undo();
      expect(entry1?.html).toBe('<p>First</p>');

      // Redo twice
      historyManager.redo();
      const entry2 = historyManager.redo();
      expect(entry2?.html).toBe('<p>Third</p>');
    });
  });

  describe('canUndo/canRedo', () => {
    it('should return correct states', () => {
      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(false);

      historyManager.pushImmediate('<p>First</p>');
      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(false);

      historyManager.pushImmediate('<p>Second</p>');
      expect(historyManager.canUndo()).toBe(true);
      expect(historyManager.canRedo()).toBe(false);

      historyManager.undo();
      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(true);
    });

    it('should return true for canUndo when there is pending typing', () => {
      historyManager.pushImmediate('<p>Initial</p>');
      historyManager.pushTyping('<p>Changed</p>');

      expect(historyManager.canUndo()).toBe(true);
    });
  });

  describe('maxSize', () => {
    it('should evict oldest entries when max size exceeded', () => {
      const smallHistoryManager = new HistoryManager(mockEditorRef, mockOnStateChange, {
        maxSize: 3,
      });

      smallHistoryManager.pushImmediate('<p>1</p>');
      smallHistoryManager.pushImmediate('<p>2</p>');
      smallHistoryManager.pushImmediate('<p>3</p>');
      smallHistoryManager.pushImmediate('<p>4</p>');
      smallHistoryManager.pushImmediate('<p>5</p>');

      // Should only be able to undo 3 times (maxSize)
      const entry1 = smallHistoryManager.undo();
      expect(entry1?.html).toBe('<p>4</p>');

      const entry2 = smallHistoryManager.undo();
      expect(entry2?.html).toBe('<p>3</p>');

      const entry3 = smallHistoryManager.undo();
      expect(entry3?.html).toBe('<p>2</p>');

      // Can't undo anymore - <p>1</p> was evicted
      const entry4 = smallHistoryManager.undo();
      expect(entry4).toBeNull();

      smallHistoryManager.destroy();
    });
  });

  describe('clear', () => {
    it('should clear all history', () => {
      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushImmediate('<p>Second</p>');

      historyManager.clear();

      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(false);
    });

    it('should commit pending typing before clearing', () => {
      historyManager.pushTyping('<p>Pending</p>');
      historyManager.clear();

      // Nothing should be in history after clear
      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.isInTypingSequence()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should clean up state', () => {
      historyManager.pushImmediate('<p>Initial</p>');
      historyManager.pushTyping('<p>Pending</p>');

      historyManager.destroy();

      expect(historyManager.isInTypingSequence()).toBe(false);
    });
  });

  describe('onStateChange callback', () => {
    it('should be called after push', () => {
      mockOnStateChange.mockClear();

      historyManager.pushImmediate('<p>First</p>');
      expect(mockOnStateChange).toHaveBeenCalledTimes(1);

      historyManager.pushImmediate('<p>Second</p>');
      expect(mockOnStateChange).toHaveBeenCalledTimes(2);
    });

    it('should be called after undo/redo', () => {
      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushImmediate('<p>Second</p>');

      mockOnStateChange.mockClear();

      historyManager.undo();
      expect(mockOnStateChange).toHaveBeenCalledTimes(1);

      historyManager.redo();
      expect(mockOnStateChange).toHaveBeenCalledTimes(2);
    });

    it('should be called after clear', () => {
      historyManager.pushImmediate('<p>First</p>');

      mockOnStateChange.mockClear();

      historyManager.clear();
      expect(mockOnStateChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('timestamp', () => {
    it('should record timestamp on entries', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      historyManager.pushImmediate('<p>First</p>');
      historyManager.pushImmediate('<p>Second</p>');

      const entry = historyManager.undo();
      expect(entry?.timestamp).toBe(now);
    });
  });

  describe('isInTypingSequence', () => {
    it('should return true during typing', () => {
      expect(historyManager.isInTypingSequence()).toBe(false);

      historyManager.pushTyping('<p>A</p>');
      expect(historyManager.isInTypingSequence()).toBe(true);

      historyManager.commitTyping();
      expect(historyManager.isInTypingSequence()).toBe(false);
    });
  });

  describe('backwards compatibility', () => {
    it('pushDebounced should work as alias for pushTyping', () => {
      historyManager.pushImmediate('<p>Initial</p>');
      historyManager.pushDebounced('<p>Typed</p>');

      expect(historyManager.isInTypingSequence()).toBe(true);

      historyManager.commitTyping();
      const entry = historyManager.undo();
      expect(entry?.html).toBe('<p>Initial</p>');
    });
  });
});
