import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock document.execCommand for testing
document.execCommand = vi.fn((command: string, _showUI?: boolean, value?: string) => {
  // Simple mock implementation
  console.log(`execCommand called: ${command}, value: ${value}`);
  return true;
});

// Mock document.queryCommandState for testing
document.queryCommandState = vi.fn((_command: string) => {
  return false;
});

// Mock document.queryCommandValue for testing
document.queryCommandValue = vi.fn((_command: string) => {
  return '';
});

// Mock Selection API
window.getSelection = vi.fn(() => ({
  rangeCount: 0,
  getRangeAt: vi.fn(),
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
  anchorNode: null,
  anchorOffset: 0,
  direction: 'none' as const,
  focusNode: null,
  focusOffset: 0,
  isCollapsed: true,
  type: 'None' as const,
  collapse: vi.fn(),
  collapseToEnd: vi.fn(),
  collapseToStart: vi.fn(),
  containsNode: vi.fn(() => false),
  deleteFromDocument: vi.fn(),
  empty: vi.fn(),
  extend: vi.fn(),
  modify: vi.fn(),
  selectAllChildren: vi.fn(),
  setBaseAndExtent: vi.fn(),
  setPosition: vi.fn(),
  toString: vi.fn(() => ''),
} as unknown as Selection));

// Note: Commenting out the createElement override as it might be interfering with React rendering
// This was causing text content to not be properly rendered in spans
/*
// Enhance document.createElement mock
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName: string) => {
  const element = originalCreateElement.call(document, tagName);
  
  // Add proper innerHTML and textContent implementation
  let _innerHTML = '';
  let _textContent = '';
  
  Object.defineProperty(element, 'innerHTML', {
    get() { return _innerHTML; },
    set(value) { _innerHTML = value; }
  });
  
  Object.defineProperty(element, 'textContent', {
    get() { return _textContent; },
    set(value) { 
      _textContent = value;
      // Update innerHTML with escaped content
      _innerHTML = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  });
  
  return element;
});
*/

// Mock document.createRange
document.createRange = vi.fn(() => ({
  collapsed: true,
  commonAncestorContainer: document.body,
  endContainer: document.body,
  endOffset: 0,
  startContainer: document.body,
  startOffset: 0,
  setStart: vi.fn(),
  setEnd: vi.fn(),
  setStartBefore: vi.fn(),
  setStartAfter: vi.fn(),
  setEndBefore: vi.fn(),
  setEndAfter: vi.fn(),
  collapse: vi.fn(),
  selectNode: vi.fn(),
  selectNodeContents: vi.fn(),
  compareBoundaryPoints: vi.fn(() => 0),
  deleteContents: vi.fn(),
  extractContents: vi.fn(() => document.createDocumentFragment()),
  cloneContents: vi.fn(() => document.createDocumentFragment()),
  insertNode: vi.fn(),
  surroundContents: vi.fn(),
  cloneRange: vi.fn(() => ({
    collapsed: true,
    commonAncestorContainer: document.body,
    endContainer: document.body,
    endOffset: 0,
    startContainer: document.body,
    startOffset: 0,
    setStart: vi.fn(),
    setEnd: vi.fn(),
    setStartBefore: vi.fn(),
    setStartAfter: vi.fn(),
    setEndBefore: vi.fn(),
    setEndAfter: vi.fn(),
    collapse: vi.fn(),
    selectNode: vi.fn(),
    selectNodeContents: vi.fn(),
    compareBoundaryPoints: vi.fn(() => 0),
    deleteContents: vi.fn(),
    extractContents: vi.fn(() => document.createDocumentFragment()),
    cloneContents: vi.fn(() => document.createDocumentFragment()),
    insertNode: vi.fn(),
    surroundContents: vi.fn(),
    cloneRange: vi.fn(),
    detach: vi.fn(),
    toString: vi.fn(() => ''),
    getBoundingClientRect: vi.fn(() => ({ x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: vi.fn() })),
    getClientRects: vi.fn(() => ({ length: 0, item: vi.fn(() => null), [Symbol.iterator]: vi.fn() })),
  } as unknown as Range)),
  detach: vi.fn(),
  toString: vi.fn(() => ''),
  getBoundingClientRect: vi.fn(() => ({ x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: vi.fn() })),
  getClientRects: vi.fn(() => ({ length: 0, item: vi.fn(() => null), [Symbol.iterator]: vi.fn() })),
} as unknown as Range));