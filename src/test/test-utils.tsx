import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Custom render function that includes providers if needed in the future
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, options);
};

// Test utilities for common editor operations
export const editorTestUtils = {
  /**
   * Apply formatting to selected text
   */
  applyFormat: async (formatButton: HTMLElement) => {
    const user = userEvent.setup();
    await user.click(formatButton);
  },

  /**
   * Type text in editor
   */
  typeText: async (editor: HTMLElement, text: string) => {
    const user = userEvent.setup();
    await user.click(editor);
    await user.type(editor, text);
  },

  /**
   * Select all text in editor
   */
  selectAll: async (editor: HTMLElement) => {
    const user = userEvent.setup();
    await user.click(editor);
    await user.keyboard('{Control>}a{/Control}');
  },

  /**
   * Apply keyboard shortcut
   */
  applyShortcut: async (editor: HTMLElement, keys: string) => {
    const user = userEvent.setup();
    await user.click(editor);
    await user.keyboard(keys);
  },

  /**
   * Wait for debounced operations
   */
  waitForDebounce: () => new Promise(resolve => setTimeout(resolve, 300)),

  /**
   * Create mock clipboard data
   */
  createMockClipboardData: (data: string) => ({
    getData: vi.fn(() => data),
    setData: vi.fn(),
  }),
};

// Performance testing utilities
export const performanceUtils = {
  /**
   * Measure operation time
   */
  measureTime: async (operation: () => any) => {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    return { result, time: endTime - startTime };
  },

  /**
   * Check memory usage (if available)
   */
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  },

  /**
   * Create large content for testing
   */
  createLargeContent: (size: number) => {
    return '<p>' + 'Large content block. '.repeat(size) + '</p>';
  },
};

// Security testing utilities
export const securityUtils = {
  /**
   * Common XSS payloads for testing
   */
  xssPayloads: [
    '<script>alert("xss")</script>',
    '<img src=x onerror="alert(\'xss\')">',
    '<a href="javascript:alert(\'xss\')">Link</a>',
    '<div onclick="alert(\'xss\')">Click me</div>',
    '<style>body{background:url("javascript:alert(\'xss\')")}</style>',
  ],

  /**
   * Check if content is sanitized
   */
  isSanitized: (html: string, payload: string) => {
    const dangerousPatterns = [
      'javascript:',
      'onclick=',
      'onerror=',
      'onload=',
      '<script',
      'expression(',
      'eval(',
    ];
    
    return !dangerousPatterns.some(pattern => 
      html.toLowerCase().includes(pattern.toLowerCase())
    );
  },
};

// Component testing utilities
export const componentUtils = {
  /**
   * Find editor element
   */
  findEditor: () => document.querySelector('[role="textbox"]') as HTMLElement,

  /**
   * Find toolbar button by title
   */
  findToolbarButton: (title: string) => 
    document.querySelector(`[title="${title}"]`) as HTMLButtonElement,

  /**
   * Check if element has specific formatting
   */
  hasFormatting: (element: HTMLElement, tag: string) => {
    return element.querySelector(tag) !== null;
  },

  /**
   * Get computed styles
   */
  getStyles: (element: HTMLElement) => window.getComputedStyle(element),
};

// Mock utilities
export const mockUtils = {
  /**
   * Mock document.execCommand with tracking
   */
  mockExecCommand: () => {
    const mock = vi.fn((command: string, _showUI?: boolean, value?: string) => {
      console.log(`execCommand: ${command}, value: ${value}`);
      return true;
    });
    document.execCommand = mock;
    return mock;
  },

  /**
   * Mock clipboard API
   */
  mockClipboard: () => {
    const mock = {
      writeText: vi.fn(),
      readText: vi.fn(),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mock,
      writable: true,
    });
    return mock;
  },

  /**
   * Mock Selection API
   */
  mockSelection: () => {
    const mock = {
      rangeCount: 0,
      getRangeAt: vi.fn(),
      removeAllRanges: vi.fn(),
      addRange: vi.fn(),
      toString: vi.fn(() => ''),
    };
    window.getSelection = vi.fn(() => mock);
    return mock;
  },
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override render with custom version
export { customRender as render };