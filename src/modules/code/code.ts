/**
 * Code module - Handles code and code block formatting
 */

export class CodeManager {
  /**
   * Check if current selection is inside a code block
   */
  static isInCodeBlock(): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node: Node | null = selection.anchorNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // Check for code block (CODE inside PRE)
        if (element.tagName === 'PRE' || 
            (element.tagName === 'CODE' && element.parentElement?.tagName === 'PRE')) {
          return true;
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  /**
   * Check if current selection is inside inline code
   */
  static isInInlineCode(): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node: Node | null = selection.anchorNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // Only inline code, not code blocks
        if (element.tagName === 'CODE' && element.parentElement?.tagName !== 'PRE') {
          return true;
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  /**
   * Toggle code block (fallback to inline code)
   */
  static toggleCodeBlock(): void {
    // For now, fallback to inline code since full code blocks aren't implemented
    this.toggleInlineCode();
  }

  /**
   * Toggle inline code
   */
  static toggleInlineCode(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    if (this.isInInlineCode()) {
      // Remove code formatting by unwrapping the code element
      const codeElement = this.findParentElement(selection.anchorNode, 'CODE');
      if (codeElement && codeElement.parentNode) {
        // Save selection position
        const range = selection.getRangeAt(0);
        const startOffset = range.startOffset;
        const endOffset = range.endOffset;
        
        // Get the text content
        const text = codeElement.textContent || '';
        
        // Replace code element with text node
        const textNode = document.createTextNode(text);
        codeElement.parentNode.replaceChild(textNode, codeElement);
        
        // Restore selection
        const newRange = document.createRange();
        newRange.setStart(textNode, Math.min(startOffset, text.length));
        newRange.setEnd(textNode, Math.min(endOffset, text.length));
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // Apply code formatting
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      
      if (selectedText) {
        // Wrap selected text in code element
        const codeElement = document.createElement('code');
        codeElement.textContent = selectedText;
        
        range.deleteContents();
        range.insertNode(codeElement);
        
        // Select the newly created code element
        range.selectNodeContents(codeElement);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  /**
   * Handle special behavior in code blocks
   */
  static handleKeyInCodeBlock(event: KeyboardEvent): boolean {
    if (!this.isInCodeBlock()) return false;

    // Prevent auto-formatting shortcuts in code blocks
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b': // Bold
        case 'i': // Italic
        case 'u': // Underline
          event.preventDefault();
          return true;
      }
    }

    // Handle Tab key - insert actual tab character
    if (event.key === 'Tab') {
      event.preventDefault();
      document.execCommand('insertText', false, '\t');
      return true;
    }

    // Handle Enter key - preserve line breaks
    if (event.key === 'Enter') {
      event.preventDefault();
      document.execCommand('insertHTML', false, '\n');
      return true;
    }

    return false;
  }

  /**
   * Handle paste in code blocks
   */
  static handlePasteInCodeBlock(event: ClipboardEvent): boolean {
    if (!this.isInCodeBlock()) return false;

    event.preventDefault();
    
    // Get plain text only for code blocks
    const text = event.clipboardData?.getData('text/plain') || '';
    
    // Preserve formatting but escape HTML entities
    const escapedText = this.escapeHtml(text);
    
    // Insert the text preserving whitespace
    document.execCommand('insertHTML', false, escapedText);
    
    return true;
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(text: string): string {
    if (typeof text !== 'string') return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Find parent element by tag name
   */
  private static findParentElement(node: Node | null, tagName: string): HTMLElement | null {
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === tagName) {
          return element;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  /**
   * Format code block content (for display)
   */
  static formatCodeBlockContent(content: string): string {
    // Preserve original content but convert tabs to spaces
    return content
      .replace(/\t/g, '    ') // Convert tabs to 4 spaces for display
      .replace(/ /g, '\u00A0'); // Convert spaces to non-breaking spaces
  }

  /**
   * Handle copy from code block
   */
  static handleCopyFromCodeBlock(event: ClipboardEvent): boolean {
    if (!this.isInCodeBlock()) return false;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const selectedText = selection.toString();
    
    // Set both plain text and HTML formats
    event.clipboardData?.setData('text/plain', selectedText);
    event.clipboardData?.setData('text/html', `<pre><code>${this.escapeHtml(selectedText)}</code></pre>`);
    
    event.preventDefault();
    return true;
  }
}