import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { securityUtils } from '../../test/test-utils';
import { Editor } from '../../components/Editor/Editor';

describe('XSS Prevention Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Script Injection Prevention', () => {
    it('prevents script injection via value prop', () => {
      const maliciousContent = '<script>alert("xss")</script><p>Safe content</p>';
      
      render(<Editor value={maliciousContent} />);
      const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
      
      expect(securityUtils.isSanitized(editor.innerHTML, maliciousContent)).toBe(true);
      expect(editor.innerHTML).not.toContain('<script>');
      expect(editor.innerHTML).toContain('Safe content');
    });

    it('prevents encoded script injection', () => {
      const maliciousContent = '<p>&#60;script&#62;alert(&#34;xss&#34;)&#60;/script&#62;</p>';
      
      render(<Editor value={maliciousContent} />);
      const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
      
      expect(editor.innerHTML).not.toContain('<script>');
    });

    it('blocks all common XSS payloads', () => {
      securityUtils.xssPayloads.forEach((payload, index) => {
        const safeContent = `<p>Safe content ${index}</p>`;
        const combinedContent = payload + safeContent;
        
        render(<Editor value={combinedContent} />);
        const editors = screen.getAllByRole('textbox');
        const editor = editors[editors.length - 1]; // Get the most recent editor
        
        expect(securityUtils.isSanitized(editor.innerHTML, payload)).toBe(true);
        expect(editor.innerHTML).toContain(`Safe content ${index}`);
      });
    });
  });

  describe('Event Handler Prevention', () => {
    it('removes onclick handlers', () => {
      const maliciousContent = '<p onclick="alert(\'xss\')">Click me</p>';
      
      render(<Editor value={maliciousContent} />);
      const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
      
      expect(editor.innerHTML).not.toContain('onclick');
      expect(editor.innerHTML).toContain('Click me');
    });

    it('removes all event handler attributes', () => {
      const eventHandlers = [
        'onclick', 'onload', 'onerror', 'onmouseover', 
        'onfocus', 'onblur', 'onsubmit', 'onchange'
      ];
      
      eventHandlers.forEach(handler => {
        const maliciousContent = `<div ${handler}="alert('xss')">Content</div>`;
        
        render(<Editor value={maliciousContent} />);
        const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
        
        expect(editor.innerHTML).not.toContain(handler);
        expect(editor.innerHTML).toContain('Content');
      });
    });
  });

  describe('URL Injection Prevention', () => {
    it('removes javascript: URLs', () => {
      const maliciousContent = '<a href="javascript:alert(\'xss\')">Link</a>';
      
      render(<Editor value={maliciousContent} />);
      const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
      
      expect(editor.innerHTML).not.toContain('javascript:');
      expect(editor.innerHTML).toContain('Link');
    });

    it('removes data: URLs', () => {
      const maliciousContent = '<a href="data:text/html,<script>alert(\'xss\')</script>">Link</a>';
      
      render(<Editor value={maliciousContent} />);
      const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
      
      expect(editor.innerHTML).not.toContain('data:');
      expect(editor.innerHTML).not.toContain('<script>');
    });

    it('blocks all dangerous protocols', () => {
      const dangerousProtocols = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'file:///etc/passwd'
      ];
      
      dangerousProtocols.forEach(url => {
        const maliciousContent = `<a href="${url}">Link</a>`;
        
        render(<Editor value={maliciousContent} />);
        const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
        
        expect(editor.innerHTML).not.toContain(url);
        expect(editor.innerHTML).toContain('Link');
      });
    });
  });

  describe('CSS Injection Prevention', () => {
    it('prevents CSS expression injection', () => {
      const maliciousContent = '<p style="background: expression(alert(\'xss\'))">Text</p>';
      
      render(<Editor value={maliciousContent} />);
      const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
      
      expect(editor.innerHTML).not.toContain('expression');
      expect(editor.innerHTML).toContain('Text');
    });

    it('removes dangerous CSS properties', () => {
      const dangerousCss = [
        'background: url(javascript:alert(1))',
        'background: expression(alert(1))',
        'width: expression(alert(1))'
      ];
      
      dangerousCss.forEach(style => {
        const maliciousContent = `<p style="${style}">Content</p>`;
        
        render(<Editor value={maliciousContent} />);
        const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
        
        expect(editor.innerHTML).not.toContain('javascript:');
        expect(editor.innerHTML).not.toContain('expression');
        expect(editor.innerHTML).toContain('Content');
      });
    });
  });

  describe('Input Sanitization', () => {
    it('sanitizes malicious input events', async () => {
      // Test sanitizer directly first
      import('../../modules/sanitizer/sanitizer').then(({ sanitizer }) => {
        const testHtml = '<img src=x onerror="alert(\'xss\')">';
        const sanitized = sanitizer.sanitize(testHtml);
        console.log('Direct sanitizer test:', { input: testHtml, output: sanitized });
      });
      
      render(<Editor />);
      const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
      
      // Simulate actual contenteditable input by setting innerHTML and triggering input event
      editor.innerHTML = '<img src=x onerror="alert(\'xss\')">';
      fireEvent.input(editor);
      
      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('After input event, innerHTML:', editor.innerHTML);
      
      // The sanitizer should have cleaned the dangerous attributes
      expect(editor.innerHTML).not.toContain('onerror');
      expect(editor.innerHTML).toContain('<img'); // Image tag should remain but be safe
    });

    it('handles malicious paste data', () => {
      render(<Editor />);
      const editors = screen.getAllByRole('textbox');
      const editor = editors[editors.length - 1];
      
      const clipboardData = {
        getData: vi.fn(() => '<script>alert("paste-xss")</script><p>Pasted</p>')
      };
      
      const pasteEvent = new Event('paste') as any;
      pasteEvent.clipboardData = clipboardData;
      
      fireEvent(editor, pasteEvent);
      
      expect(editor.innerHTML).not.toContain('<script>');
    });
  });
});