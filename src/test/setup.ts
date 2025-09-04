import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock document.execCommand for testing
document.execCommand = vi.fn((command: string, _showUI?: boolean, value?: string) => {
  // Simple mock implementation
  console.log(`execCommand called: ${command}, value: ${value}`);
  return true;
});

// Mock document.queryCommandState for testing
document.queryCommandState = vi.fn((command: string) => {
  return false;
});

// Mock document.queryCommandValue for testing
document.queryCommandValue = vi.fn((command: string) => {
  return '';
});

// Mock Selection API
window.getSelection = vi.fn(() => ({
  rangeCount: 0,
  getRangeAt: vi.fn(),
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
} as any));

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
  setStart: vi.fn(),
  setEnd: vi.fn(),
  collapse: vi.fn(),
  deleteContents: vi.fn(),
  insertNode: vi.fn(),
  selectNodeContents: vi.fn(),
  cloneRange: vi.fn(() => ({
    setStart: vi.fn(),
    setEnd: vi.fn(),
    collapse: vi.fn()
  }))
} as any));