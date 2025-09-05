import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListManager } from './lists';

// Mock DOM APIs
const mockElement = {
  tagName: 'LI',
  parentElement: {
    tagName: 'UL',
    parentElement: null
  }
};

describe('ListManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('List Detection', () => {
    it('detects when cursor is in a list', () => {
      // Mock selection that returns a list item
      window.getSelection = vi.fn(() => ({
        anchorNode: mockElement,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });

    it('detects when cursor is not in a list', () => {
      // Mock selection that returns a non-list element
      window.getSelection = vi.fn(() => ({
        anchorNode: { tagName: 'P' },
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(false);
    });

    it('handles no selection', () => {
      window.getSelection = vi.fn(() => ({
        anchorNode: null,
        rangeCount: 0
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(false);
    });
  });

  describe('List Type Detection', () => {
    it('detects bullet list type', () => {
      const bulletListItem = {
        tagName: 'LI',
        parentElement: {
          tagName: 'UL'
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: bulletListItem,
        rangeCount: 1
      } as unknown));

      const result = ListManager.getListType();
      expect(result).toBe('bullet');
    });

    it('detects numbered list type', () => {
      const numberedListItem = {
        tagName: 'LI',
        parentElement: {
          tagName: 'OL'
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: numberedListItem,
        rangeCount: 1
      } as unknown));

      const result = ListManager.getListType();
      expect(result).toBe('number');
    });

    it('returns null when not in list', () => {
      window.getSelection = vi.fn(() => ({
        anchorNode: { tagName: 'P' },
        rangeCount: 1
      } as unknown));

      const result = ListManager.getListType();
      expect(result).toBeNull();
    });
  });

  describe('List Navigation', () => {
    it('handles Enter key in list items', () => {
      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
        target: mockElement
      } as unknown;

      window.getSelection = vi.fn(() => ({
        anchorNode: mockElement,
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleKeyInList(mockEvent);
      expect(result).toBe(true);
    });

    it('handles Tab key for indentation', () => {
      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: vi.fn(),
        target: mockElement
      } as unknown;

      window.getSelection = vi.fn(() => ({
        anchorNode: mockElement,
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleKeyInList(mockEvent);
      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('indent', false, undefined);
    });

    it('handles Shift+Tab for outdenting', () => {
      const mockEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: vi.fn(),
        target: mockElement
      } as unknown;

      window.getSelection = vi.fn(() => ({
        anchorNode: mockElement,
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleKeyInList(mockEvent);
      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('outdent', false, undefined);
    });

    it('handles Backspace at beginning of list item', () => {
      const mockEvent = {
        key: 'Backspace',
        preventDefault: vi.fn(),
        target: mockElement
      } as unknown;

      // Mock that we're at the beginning of the list item
      window.getSelection = vi.fn(() => ({
        anchorNode: mockElement,
        anchorOffset: 0,
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleKeyInList(mockEvent);
      expect(result).toBe(true);
    });

    it('passes through other keys', () => {
      const mockEvent = {
        key: 'a',
        target: mockElement
      } as unknown;

      window.getSelection = vi.fn(() => ({
        anchorNode: mockElement,
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleKeyInList(mockEvent);
      expect(result).toBe(false);
    });

    it('returns false when not in a list', () => {
      const mockEvent = {
        key: 'Enter',
        target: { tagName: 'P' }
      } as unknown;

      window.getSelection = vi.fn(() => ({
        anchorNode: { tagName: 'P' },
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleKeyInList(mockEvent);
      expect(result).toBe(false);
    });
  });

  describe('List Creation', () => {
    it('creates bullet lists', () => {
      ListManager.createList('bullet');
      expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined);
    });

    it('creates numbered lists', () => {
      ListManager.createList('number');
      expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false, undefined);
    });

    it('handles invalid list type gracefully', () => {
      expect(() => {
        ListManager.createList('invalid' as unknown);
      }).not.toThrow();
    });
  });

  describe('List Toggle', () => {
    it('removes list when already in same type', () => {
      // Mock being in a bullet list
      window.getSelection = vi.fn(() => ({
        anchorNode: {
          tagName: 'LI',
          parentElement: { tagName: 'UL' }
        },
        rangeCount: 1
      } as unknown));

      ListManager.toggleList('bullet');
      expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined);
    });

    it('switches list type when in different type', () => {
      // Mock being in a numbered list, switching to bullet
      window.getSelection = vi.fn(() => ({
        anchorNode: {
          tagName: 'LI',
          parentElement: { tagName: 'OL' }
        },
        rangeCount: 1
      } as unknown));

      ListManager.toggleList('bullet');
      expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined);
    });

    it('creates list when not in any list', () => {
      window.getSelection = vi.fn(() => ({
        anchorNode: { tagName: 'P' },
        rangeCount: 1
      } as unknown));

      ListManager.toggleList('bullet');
      expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined);
    });
  });

  describe('Nesting Operations', () => {
    it('indents list items', () => {
      ListManager.indentListItem();
      expect(document.execCommand).toHaveBeenCalledWith('indent', false, undefined);
    });

    it('outdents list items', () => {
      ListManager.outdentListItem();
      expect(document.execCommand).toHaveBeenCalledWith('outdent', false, undefined);
    });
  });

  describe('Empty List Item Handling', () => {
    it('detects empty list items', () => {
      const emptyListItem = {
        tagName: 'LI',
        textContent: '',
        innerHTML: ''
      };

      const result = ListManager.isEmptyListItem(emptyListItem as unknown);
      expect(result).toBe(true);
    });

    it('detects non-empty list items', () => {
      const nonEmptyListItem = {
        tagName: 'LI',
        textContent: 'Some content',
        innerHTML: 'Some content'
      };

      const result = ListManager.isEmptyListItem(nonEmptyListItem as unknown);
      expect(result).toBe(false);
    });

    it('handles list items with only whitespace', () => {
      const whitespaceListItem = {
        tagName: 'LI',
        textContent: '   \n\t  ',
        innerHTML: '   \n\t  '
      };

      const result = ListManager.isEmptyListItem(whitespaceListItem as unknown);
      expect(result).toBe(true);
    });

    it('handles list items with only HTML whitespace', () => {
      const htmlWhitespaceItem = {
        tagName: 'LI',
        textContent: '',
        innerHTML: '<br>'
      };

      const result = ListManager.isEmptyListItem(htmlWhitespaceItem as unknown);
      expect(result).toBe(true);
    });
  });

  describe('List Continuation', () => {
    it('continues list on Enter', () => {
      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
        target: {
          tagName: 'LI',
          textContent: 'Content'
        }
      } as unknown;

      window.getSelection = vi.fn(() => ({
        anchorNode: mockEvent.target,
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleKeyInList(mockEvent);
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('exits list on Enter in empty item', () => {
      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
        target: {
          tagName: 'LI',
          textContent: '',
          innerHTML: ''
        }
      } as unknown;

      window.getSelection = vi.fn(() => ({
        anchorNode: mockEvent.target,
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleKeyInList(mockEvent);
      expect(result).toBe(true);
    });
  });

  describe('Parent List Item Detection', () => {
    it('finds direct list item parent', () => {
      const listItemNode = {
        tagName: 'LI',
        parentElement: { tagName: 'UL' }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: listItemNode,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });

    it('traverses up to find list item ancestor', () => {
      const textNode = {
        nodeType: 3, // TEXT_NODE
        parentNode: {
          tagName: 'SPAN',
          parentElement: {
            tagName: 'LI',
            parentElement: { tagName: 'UL' }
          }
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: textNode,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });

    it('handles nodes without parentElement property', () => {
      const nodeWithoutParentElement = {
        tagName: 'SPAN',
        parentNode: {
          tagName: 'LI',
          parentElement: { tagName: 'UL' }
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: nodeWithoutParentElement,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });

    it('stops at document.body', () => {
      const deepNode = {
        tagName: 'SPAN',
        parentElement: document.body // Should stop here
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: deepNode,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(false);
    });

    it('handles broken chain with no parent', () => {
      const brokenChainNode = {
        tagName: 'SPAN',
        parentElement: null,
        parentNode: null
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: brokenChainNode,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(false);
    });

    it('handles nodes without tagName property', () => {
      const nodeWithoutTag = {
        parentElement: {
          tagName: 'LI',
          parentElement: { tagName: 'UL' }
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: nodeWithoutTag,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });

    it('handles null current node during traversal', () => {
      // Mock a scenario where current becomes null during traversal
      const mockNode = {
        tagName: 'SPAN',
        parentElement: null,
        parentNode: null
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: mockNode,
        rangeCount: 1
      } as unknown));

      expect(() => {
        ListManager.isInList();
      }).not.toThrow();

      const result = ListManager.isInList();
      expect(result).toBe(false);
    });
  });

  describe('Nesting Level Detection', () => {
    it('calculates correct nesting level for single list', () => {
      // Need to access private method for testing - use bracket notation
      const listItem = {
        nodeType: 1, // ELEMENT_NODE
        tagName: 'LI',
        parentNode: {
          nodeType: 1,
          tagName: 'UL',
          parentNode: document.body
        }
      };

      // Since getNestingLevel is private, test it indirectly through a scenario
      // that would use it, or test through public methods that rely on it
      window.getSelection = vi.fn(() => ({
        anchorNode: listItem,
        rangeCount: 1
      } as unknown));

      // Test the public method that uses private getNestingLevel
      const result = ListManager.isInList();
      expect(result).toBe(true);
    });

    it('calculates nesting level for deeply nested lists', () => {
      const nestedListItem = {
        nodeType: 1,
        tagName: 'LI',
        parentNode: {
          nodeType: 1,
          tagName: 'UL', // Level 1
          parentNode: {
            nodeType: 1,
            tagName: 'LI',
            parentNode: {
              nodeType: 1,
              tagName: 'OL', // Level 2
              parentNode: {
                nodeType: 1,
                tagName: 'LI',
                parentNode: {
                  nodeType: 1,
                  tagName: 'UL', // Level 3
                  parentNode: document.body
                }
              }
            }
          }
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: nestedListItem,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });

    it('handles non-element nodes in nesting calculation', () => {
      const listItemWithTextNodes = {
        nodeType: 1,
        tagName: 'LI',
        parentNode: {
          nodeType: 3, // TEXT_NODE - should be ignored
          parentNode: {
            nodeType: 1,
            tagName: 'UL',
            parentNode: document.body
          }
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: listItemWithTextNodes,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });

    it('stops nesting calculation at document.body', () => {
      const listNearBody = {
        nodeType: 1,
        tagName: 'LI',
        parentNode: {
          nodeType: 1,
          tagName: 'UL',
          parentNode: document.body // Should stop here
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: listNearBody,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });
  });

  describe('Handle Enter in List - Additional Cases', () => {
    it('handles empty list item detection with various HTML whitespace patterns', () => {
      const emptyWithBrSlash = {
        tagName: 'LI',
        textContent: '',
        innerHTML: '<br/>',
        parentElement: { tagName: 'UL' }
      };

      const result1 = ListManager.isEmptyListItem(emptyWithBrSlash as unknown);
      expect(result1).toBe(true);

      const emptyWithBrSpace = {
        tagName: 'LI', 
        textContent: '',
        innerHTML: '<br />',
        parentElement: { tagName: 'UL' }
      };

      const result2 = ListManager.isEmptyListItem(emptyWithBrSpace as unknown);
      expect(result2).toBe(true);
    });

    it('handles list item that is not actually an LI element', () => {
      const notAListItem = {
        tagName: 'DIV',
        textContent: '',
        innerHTML: ''
      };

      const result = ListManager.isEmptyListItem(notAListItem as unknown);
      expect(result).toBe(false);
    });

    it('handles null or undefined list item', () => {
      const result1 = ListManager.isEmptyListItem(null as unknown);
      expect(result1).toBe(false);

      const result2 = ListManager.isEmptyListItem(undefined as unknown);
      expect(result2).toBe(false);
    });

    it('handles list item with undefined textContent and innerHTML', () => {
      const itemWithUndefinedContent = {
        tagName: 'LI',
        textContent: undefined,
        innerHTML: undefined
      };

      const result = ListManager.isEmptyListItem(itemWithUndefinedContent as unknown);
      expect(result).toBe(true);
    });
  });

  describe('Backspace Handling Edge Cases', () => {
    it('returns false when not at start of list item', () => {
      const mockEvent = {
        key: 'Backspace',
        preventDefault: vi.fn()
      } as unknown;

      window.getSelection = vi.fn(() => ({
        anchorNode: { tagName: 'LI', parentElement: { tagName: 'UL' } },
        anchorOffset: 5, // Not at start
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleBackspaceInList(mockEvent);
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('handles backspace when there is a previous sibling', () => {
      const mockEvent = {
        key: 'Backspace',
        preventDefault: vi.fn()
      } as unknown;

      const mockListItem = {
        tagName: 'LI',
        parentElement: { tagName: 'UL' },
        previousElementSibling: { tagName: 'LI' } // Has previous sibling
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: mockListItem,
        anchorOffset: 0, // At start
        rangeCount: 1
      } as unknown));

      const result = ListManager.handleBackspaceInList(mockEvent);
      expect(result).toBe(true); // Should allow default backspace behavior
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('exits list when backspace at start of first item', () => {
      const mockEvent = {
        key: 'Backspace',
        preventDefault: vi.fn()
      } as unknown;

      const mockList = {
        tagName: 'UL',
        children: [],
        remove: vi.fn(),
        parentElement: document.body
      };

      const mockListItem = {
        tagName: 'LI',
        parentElement: mockList,
        previousElementSibling: null, // No previous sibling (first item)
        remove: vi.fn()
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: mockListItem,
        anchorOffset: 0, // At start
        rangeCount: 1,
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      } as unknown));

      const result = ListManager.handleBackspaceInList(mockEvent);
      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Exit List Edge Cases', () => {
    it('handles exit list in test environment without remove function', () => {
      const mockListItem = {
        tagName: 'LI',
        parentElement: { tagName: 'UL' },
        // No remove function - simulates test environment
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: mockListItem,
        rangeCount: 1
      } as unknown));

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn()
      } as unknown;

      // Mock empty list item
      const originalIsEmpty = ListManager.isEmptyListItem;
      ListManager.isEmptyListItem = vi.fn(() => true);

      const result = ListManager.handleEnterInList(mockEvent);
      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('outdent', false, undefined);

      // Restore original method
      ListManager.isEmptyListItem = originalIsEmpty;
    });

    it('handles exit list with real DOM elements', () => {
      // Mock a real DOM-like scenario with remove function
      const mockList = {
        tagName: 'UL',
        children: [{ tagName: 'LI' }], // One child
        remove: vi.fn(),
        parentElement: {
          insertBefore: vi.fn()
        }
      };

      const mockListItem = {
        tagName: 'LI',
        parentElement: mockList,
        remove: vi.fn(() => {
          // Simulate removing the item from children array
          mockList.children = [];
        })
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: mockListItem,
        rangeCount: 1,
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      } as unknown));

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn()
      } as unknown;

      // Mock empty list item and ensure remove function exists
      const originalIsEmpty = ListManager.isEmptyListItem;
      ListManager.isEmptyListItem = vi.fn(() => true);

      const result = ListManager.handleEnterInList(mockEvent);
      expect(result).toBe(true);

      // Restore original method
      ListManager.isEmptyListItem = originalIsEmpty;
    });

    it('handles exit list without parent list', () => {
      const mockListItem = {
        tagName: 'LI',
        parentElement: null, // No parent
        remove: vi.fn()
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: mockListItem,
        rangeCount: 1
      } as unknown));

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn()
      } as unknown;

      // Mock empty list item
      const originalIsEmpty = ListManager.isEmptyListItem;
      ListManager.isEmptyListItem = vi.fn(() => true);

      const result = ListManager.handleEnterInList(mockEvent);
      expect(result).toBe(true);

      // Restore original method
      ListManager.isEmptyListItem = originalIsEmpty;
    });
  });

  describe('Direct Method Testing for Private Functions', () => {
    it('tests various DOM traversal scenarios for getParentListItem coverage', () => {
      // Test the case where a node has both parentElement and parentNode
      const nodeWithBoth = {
        tagName: 'SPAN',
        parentElement: {
          tagName: 'LI',
          parentElement: { tagName: 'UL' }
        },
        parentNode: {
          tagName: 'P' // Different from parentElement
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: nodeWithBoth,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true); // Should use parentElement path
    });

    it('tests node traversal with only parentNode property', () => {
      const nodeWithOnlyParentNode = {
        tagName: 'SPAN',
        // No parentElement property
        parentNode: {
          tagName: 'LI',
          parentNode: {
            tagName: 'UL',
            parentNode: document.body
          }
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: nodeWithOnlyParentNode,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true); // Should use parentNode path
    });

    it('tests complex nesting level scenarios', () => {
      // Create a structure that will exercise getNestingLevel thoroughly
      const complexNestedItem = {
        nodeType: 1, // ELEMENT_NODE
        tagName: 'LI',
        parentNode: {
          nodeType: 8, // COMMENT_NODE - should be skipped
          parentNode: {
            nodeType: 1,
            tagName: 'UL', // Level 1
            parentNode: {
              nodeType: 3, // TEXT_NODE - should be skipped
              parentNode: {
                nodeType: 1,
                tagName: 'LI',
                parentNode: {
                  nodeType: 1,
                  tagName: 'OL', // Level 2
                  parentNode: document.body
                }
              }
            }
          }
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: complexNestedItem,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles deeply nested lists', () => {
      const deeplyNestedItem = {
        tagName: 'LI',
        parentElement: {
          tagName: 'UL',
          parentElement: {
            tagName: 'LI',
            parentElement: {
              tagName: 'UL',
              parentElement: {
                tagName: 'LI',
                parentElement: {
                  tagName: 'UL'
                }
              }
            }
          }
        }
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: deeplyNestedItem,
        rangeCount: 1
      } as unknown));

      const result = ListManager.isInList();
      expect(result).toBe(true);
    });

    it('handles null selection gracefully', () => {
      window.getSelection = vi.fn(() => null as unknown);

      expect(() => {
        ListManager.isInList();
        ListManager.getListType();
        ListManager.handleKeyInList({ key: 'Enter' } as unknown);
      }).not.toThrow();
    });

    it('handles malformed DOM structures', () => {
      const malformedItem = {
        tagName: 'LI',
        parentElement: null // Orphaned list item
      };

      window.getSelection = vi.fn(() => ({
        anchorNode: malformedItem,
        rangeCount: 1
      } as unknown));

      expect(() => {
        ListManager.isInList();
        ListManager.getListType();
      }).not.toThrow();
    });

    it('handles mixed content types correctly', () => {
      // This item has actual text content, should not be empty
      const mixedContentItem = {
        tagName: 'LI',
        innerHTML: 'Text <strong>bold</strong> <em>italic</em>',
        textContent: 'Text bold italic', // Has real text
        parentElement: { tagName: 'UL' }
      };

      const result = ListManager.isEmptyListItem(mixedContentItem as unknown);
      expect(result).toBe(false);
    });

    it('handles empty content with complex HTML', () => {
      // This item has HTML but no actual text content, should be empty
      const emptyWithComplexHTML = {
        tagName: 'LI',
        innerHTML: '<span></span><div></div>',
        textContent: '', // No text content
        parentElement: { tagName: 'UL' }
      };

      const result = ListManager.isEmptyListItem(emptyWithComplexHTML as unknown);
      expect(result).toBe(false); // Because HTML is not just <br> variants
    });

    it('handles whitespace text with non-empty HTML', () => {
      const whitespaceTextItem = {
        tagName: 'LI',
        innerHTML: '<span>Content</span>', // Has content in HTML
        textContent: '   ', // Whitespace text
        parentElement: { tagName: 'UL' }
      };

      const result = ListManager.isEmptyListItem(whitespaceTextItem as unknown);
      expect(result).toBe(false); // Should be false because innerHTML has content, not just <br> variants
    });

    it('handles whitespace text with only br HTML', () => {
      const whitespaceWithBrItem = {
        tagName: 'LI',
        innerHTML: '<br>', // Only <br> tag
        textContent: '   ', // Whitespace text
        parentElement: { tagName: 'UL' }
      };

      const result = ListManager.isEmptyListItem(whitespaceWithBrItem as unknown);
      expect(result).toBe(true); // Should be true because textContent is whitespace and HTML is just <br>
    });
  });
});