import { RefObject } from 'react';

/**
 * Serialized selection using node paths for restoration after HTML changes.
 * Paths are arrays of child indices from the editor root.
 * e.g., [0, 2, 0] means root.children[0].children[2].children[0]
 */
export interface SerializedSelection {
  anchorPath: number[];
  anchorOffset: number;
  focusPath: number[];
  focusOffset: number;
}

/**
 * A single history entry containing HTML content and cursor position.
 */
export interface HistoryEntry {
  html: string;
  selection: SerializedSelection | null;
  timestamp: number;
}

/**
 * Configuration options for the HistoryManager.
 */
export interface HistoryConfig {
  /** Maximum number of history entries to keep. Default: 100 */
  maxSize: number;
}

const DEFAULT_CONFIG: HistoryConfig = {
  maxSize: 100,
};

/**
 * Manages undo/redo history for the editor using Word-style action-based boundaries.
 *
 * Typing is accumulated until a "break point" occurs:
 * - Cursor/selection change
 * - Enter key
 * - Backspace/Delete
 * - Format operation
 * - Paste
 *
 * This matches Microsoft Word's behavior where continuous typing is one undo step.
 */
export class HistoryManager {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private currentEntry: HistoryEntry | null = null;
  private config: HistoryConfig;
  private editorRef: RefObject<HTMLDivElement | null>;
  private onStateChange: () => void;

  // Track pending typing that hasn't been committed yet
  private pendingTypingHtml: string | null = null;
  private isTyping: boolean = false;

  constructor(
    editorRef: RefObject<HTMLDivElement | null>,
    onStateChange: () => void,
    config?: Partial<HistoryConfig>
  ) {
    this.editorRef = editorRef;
    this.onStateChange = onStateChange;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Record typing input. This accumulates changes until a break point.
   * Call this on regular character input (not enter, delete, etc.)
   */
  pushTyping(html: string): void {
    // If this is the start of a typing sequence, save the "before" state
    if (!this.isTyping && this.currentEntry) {
      // Current entry becomes the "before typing" state
      // We'll update pendingTypingHtml as user types
    }

    this.isTyping = true;
    this.pendingTypingHtml = html;
  }

  /**
   * Commit any pending typing to history.
   * Call this at break points: cursor move, enter, delete, format, paste.
   */
  commitTyping(): void {
    if (this.isTyping && this.pendingTypingHtml !== null) {
      // Only commit if content actually changed
      if (!this.currentEntry || this.pendingTypingHtml !== this.currentEntry.html) {
        this.pushEntry(this.pendingTypingHtml);
      }
    }
    this.isTyping = false;
    this.pendingTypingHtml = null;
  }

  /**
   * Push a new state to history immediately (for format operations, paste, etc.).
   * This commits any pending typing first.
   */
  pushImmediate(html: string): void {
    // First commit any pending typing
    this.commitTyping();

    // Then push the new state
    this.pushEntry(html);
  }

  /**
   * For backwards compatibility - same as pushTyping
   * @deprecated Use pushTyping instead
   */
  pushDebounced(html: string): void {
    this.pushTyping(html);
  }

  /**
   * Internal method to push an entry to the undo stack.
   */
  private pushEntry(html: string): void {
    // Don't push duplicate content
    if (this.currentEntry && this.currentEntry.html === html) {
      return;
    }

    // If we have a current entry, push it to the undo stack
    if (this.currentEntry !== null) {
      this.undoStack.push(this.currentEntry);

      // Enforce max size by removing oldest entries
      while (this.undoStack.length > this.config.maxSize) {
        this.undoStack.shift();
      }
    }

    // Create new current entry
    this.currentEntry = {
      html,
      selection: this.serializeSelection(),
      timestamp: Date.now(),
    };

    // Clear redo stack on new change
    this.redoStack = [];

    this.onStateChange();
  }

  /**
   * Undo the last change.
   * Returns the entry to restore, or null if nothing to undo.
   */
  undo(): HistoryEntry | null {
    // Commit any pending typing first
    this.commitTyping();

    if (this.undoStack.length === 0) {
      return null;
    }

    // Push current to redo stack
    if (this.currentEntry !== null) {
      // Update selection before pushing to redo
      this.currentEntry.selection = this.serializeSelection();
      this.redoStack.push(this.currentEntry);
    }

    // Pop from undo stack
    this.currentEntry = this.undoStack.pop()!;

    // Restore selection after returning
    setTimeout(() => {
      if (this.currentEntry) {
        this.restoreSelection(this.currentEntry.selection);
      }
    }, 0);

    this.onStateChange();
    return this.currentEntry;
  }

  /**
   * Redo the last undone change.
   * Returns the entry to restore, or null if nothing to redo.
   */
  redo(): HistoryEntry | null {
    // Commit any pending typing first
    this.commitTyping();

    if (this.redoStack.length === 0) {
      return null;
    }

    // Push current to undo stack
    if (this.currentEntry !== null) {
      // Update selection before pushing to undo
      this.currentEntry.selection = this.serializeSelection();
      this.undoStack.push(this.currentEntry);
    }

    // Pop from redo stack
    this.currentEntry = this.redoStack.pop()!;

    // Restore selection after returning
    setTimeout(() => {
      if (this.currentEntry) {
        this.restoreSelection(this.currentEntry.selection);
      }
    }, 0);

    this.onStateChange();
    return this.currentEntry;
  }

  /**
   * Returns true if there are changes that can be undone.
   */
  canUndo(): boolean {
    // Can undo if we have history OR if there's pending typing that differs from current
    return this.undoStack.length > 0 ||
           (this.isTyping && this.pendingTypingHtml !== null &&
            this.currentEntry !== null && this.pendingTypingHtml !== this.currentEntry.html);
  }

  /**
   * Returns true if there are changes that can be redone.
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Check if currently in a typing sequence.
   */
  isInTypingSequence(): boolean {
    return this.isTyping;
  }

  /**
   * Clear all history.
   */
  clear(): void {
    this.commitTyping();
    this.undoStack = [];
    this.redoStack = [];
    this.currentEntry = null;
    this.onStateChange();
  }

  /**
   * Clean up. Call this when the editor unmounts.
   */
  destroy(): void {
    this.pendingTypingHtml = null;
    this.isTyping = false;
  }

  /**
   * Serialize the current selection as node paths.
   */
  private serializeSelection(): SerializedSelection | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const editor = this.editorRef.current;
    if (!editor) {
      return null;
    }

    const anchorPath = this.getNodePath(range.startContainer, editor);
    const focusPath = this.getNodePath(range.endContainer, editor);

    if (!anchorPath || !focusPath) {
      return null;
    }

    return {
      anchorPath,
      anchorOffset: range.startOffset,
      focusPath,
      focusOffset: range.endOffset,
    };
  }

  /**
   * Restore a serialized selection.
   */
  private restoreSelection(selection: SerializedSelection | null): void {
    if (!selection) {
      return;
    }

    const editor = this.editorRef.current;
    if (!editor) {
      return;
    }

    const anchorNode = this.getNodeFromPath(selection.anchorPath, editor);
    const focusNode = this.getNodeFromPath(selection.focusPath, editor);

    if (!anchorNode || !focusNode) {
      // Fall back to placing cursor at end of editor
      this.placeCursorAtEnd(editor);
      return;
    }

    try {
      const windowSelection = window.getSelection();
      if (!windowSelection) {
        return;
      }

      const range = document.createRange();

      // Ensure offsets are within bounds
      const anchorOffset = Math.min(
        selection.anchorOffset,
        anchorNode.nodeType === Node.TEXT_NODE
          ? (anchorNode as Text).length
          : anchorNode.childNodes.length
      );
      const focusOffset = Math.min(
        selection.focusOffset,
        focusNode.nodeType === Node.TEXT_NODE
          ? (focusNode as Text).length
          : focusNode.childNodes.length
      );

      range.setStart(anchorNode, anchorOffset);
      range.setEnd(focusNode, focusOffset);

      windowSelection.removeAllRanges();
      windowSelection.addRange(range);
    } catch {
      // If restoration fails, place cursor at end
      this.placeCursorAtEnd(editor);
    }
  }

  /**
   * Get the path from editor root to a node as an array of child indices.
   */
  private getNodePath(node: Node, root: HTMLElement): number[] | null {
    const path: number[] = [];
    let current: Node | null = node;

    while (current && current !== root) {
      const parent: ParentNode | null = current.parentNode;
      if (!parent) {
        return null;
      }

      const index = Array.from(parent.childNodes).indexOf(current as ChildNode);
      if (index === -1) {
        return null;
      }

      path.unshift(index);
      current = parent as Node;
    }

    if (current !== root) {
      return null;
    }

    return path;
  }

  /**
   * Get a node from a path of child indices.
   */
  private getNodeFromPath(path: number[], root: HTMLElement): Node | null {
    let current: Node = root;

    for (const index of path) {
      if (index < 0 || index >= current.childNodes.length) {
        return null;
      }
      current = current.childNodes[index];
    }

    return current;
  }

  /**
   * Place cursor at the end of the editor content.
   */
  private placeCursorAtEnd(editor: HTMLElement): void {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();

    // Find the last text node or use the editor itself
    let lastNode: Node = editor;
    while (lastNode.lastChild) {
      lastNode = lastNode.lastChild;
    }

    if (lastNode.nodeType === Node.TEXT_NODE) {
      range.setStart(lastNode, (lastNode as Text).length);
      range.setEnd(lastNode, (lastNode as Text).length);
    } else {
      range.selectNodeContents(lastNode);
      range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }
}
