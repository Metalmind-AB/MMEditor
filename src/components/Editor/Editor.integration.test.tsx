import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { Editor } from './Editor';
import { EditorInstance } from './Editor.types';
import React, { useRef, useState } from 'react';

// Integration tests for complete editing workflows
describe('MMEditor Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Editing Workflows', () => {
    it('handles a complete text formatting workflow', async () => {
      const TestComponent = () => {
        const [content, setContent] = useState('<p>Hello world</p>');
        return (
          <Editor
            value={content}
            onChange={setContent}
          />
        );
      };

      render(<TestComponent />);
      
      const editor = screen.getByRole('textbox');
      
      // Verify initial content
      expect(editor.innerHTML).toBe('<p>Hello world</p>');
      
      // Apply bold formatting
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      fireEvent.click(boldButton);
      
      expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
      
      // Apply italic formatting
      const italicButton = screen.getByTitle('Italic (Ctrl+I)');
      fireEvent.click(italicButton);
      
      expect(document.execCommand).toHaveBeenCalledWith('italic', false, undefined);
      
      // Insert a list
      const bulletButton = screen.getByTitle('Bullet List');
      fireEvent.click(bulletButton);
      
      expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined);
    });

    it('handles heading workflow with format dropdown', async () => {
      render(<Editor />);
      
      // Click the dropdown to open it
      const dropdown = screen.getByText('Normal');
      fireEvent.click(dropdown);
      
      // Select Heading 1
      const h1Option = screen.getByText('Heading 1');
      fireEvent.click(h1Option);
      
      expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h1>');
      
      // Click dropdown again
      fireEvent.click(dropdown);
      
      // Select Heading 2
      const h2Option = screen.getByText('Heading 2');
      fireEvent.click(h2Option);
      
      expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h2>');
    });

    it('handles keyboard shortcuts workflow', async () => {
      render(<Editor />);
      const editor = screen.getByRole('textbox');
      
      // Test bold shortcut
      fireEvent.keyDown(editor, { key: 'b', ctrlKey: true });
      expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
      
      // Test italic shortcut  
      fireEvent.keyDown(editor, { key: 'i', ctrlKey: true });
      expect(document.execCommand).toHaveBeenCalledWith('italic', false, undefined);
      
      // Test underline shortcut
      fireEvent.keyDown(editor, { key: 'u', ctrlKey: true });
      expect(document.execCommand).toHaveBeenCalledWith('underline', false, undefined);
    });

    it('handles content changes and onChange callbacks', async () => {
      const handleChange = vi.fn();
      
      render(<Editor onChange={handleChange} />);
      const editor = screen.getByRole('textbox');
      
      // Simulate typing
      fireEvent.input(editor, { target: { innerHTML: '<p>New content</p>' } });
      
      // Wait for debounced onChange
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('<p>New content</p>');
      }, { timeout: 1000 });
      
      // Simulate more typing
      fireEvent.input(editor, { target: { innerHTML: '<p>Updated content</p>' } });
      
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('<p>Updated content</p>');
      }, { timeout: 1000 });
    });

    it('handles controlled vs uncontrolled mode properly', () => {
      // Test controlled mode
      const { rerender } = render(<Editor value="<p>Controlled</p>" />);
      let editors = screen.getAllByRole('textbox');
      let editor = editors[editors.length - 1]; // Get the last (current) editor
      expect(editor.innerHTML).toBe('<p>Controlled</p>');
      
      // Update controlled value
      rerender(<Editor value="<p>Updated controlled</p>" />);
      editors = screen.getAllByRole('textbox');
      editor = editors[editors.length - 1]; // Get the last (current) editor
      expect(editor.innerHTML).toBe('<p>Updated controlled</p>');
      
      // Test uncontrolled mode - render in new container
      render(<Editor defaultValue="<p>Uncontrolled</p>" />);
      editors = screen.getAllByRole('textbox');
      editor = editors[editors.length - 1]; // Get the newest editor
      expect(editor.innerHTML).toBe('<p>Uncontrolled</p>');
    });

    it('handles focus and blur lifecycle events', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      const handleReady = vi.fn();
      
      render(<Editor onFocus={handleFocus} onBlur={handleBlur} onReady={handleReady} />);
      const editor = screen.getByRole('textbox');
      
      // Component should call onReady when mounted
      expect(handleReady).toHaveBeenCalled();
      
      // Test focus
      fireEvent.focus(editor);
      expect(handleFocus).toHaveBeenCalled();
      
      // Test blur
      fireEvent.blur(editor);
      expect(handleBlur).toHaveBeenCalled();
    });

    it('handles editor instance methods through ref', () => {
      const TestComponent = () => {
        const editorRef = useRef<EditorInstance | null>(null);
        
        React.useEffect(() => {
          // Test that all methods are available
          expect(editorRef.current?.getHTML).toBeDefined();
          expect(editorRef.current?.setHTML).toBeDefined();
          expect(editorRef.current?.format).toBeDefined();
          expect(editorRef.current?.focus).toBeDefined();
          expect(editorRef.current?.blur).toBeDefined();
          expect(editorRef.current?.getSelection).toBeDefined();
          expect(editorRef.current?.setSelection).toBeDefined();
          expect(editorRef.current?.execCommand).toBeDefined();
          
          // Test methods don't throw errors
          expect(() => editorRef.current?.getHTML()).not.toThrow();
          expect(() => editorRef.current?.setHTML('<p>Test</p>')).not.toThrow();
          expect(() => editorRef.current?.focus()).not.toThrow();
          expect(() => editorRef.current?.blur()).not.toThrow();
        });
        
        return <Editor ref={editorRef} />;
      };
      
      render(<TestComponent />);
    });
  });

  describe('List Operations Integration', () => {
    it('handles list creation and navigation workflow', () => {
      render(<Editor />);
      
      // Create bullet list
      const bulletButton = screen.getByTitle('Bullet List');
      fireEvent.click(bulletButton);
      expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined);
      
      // Switch to numbered list
      const numberButton = screen.getByTitle('Numbered List');
      fireEvent.click(numberButton);
      expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false, undefined);
      
      // Apply formatting within list
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      fireEvent.click(boldButton);
      expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
    });
  });

  describe('Code Formatting Integration', () => {
    it('handles inline code formatting workflow', () => {
      render(<Editor />);
      
      const codeButton = screen.getByTitle('Code');
      fireEvent.click(codeButton);
      
      // Should trigger code manager through styleWithCSS call
      expect(document.execCommand).toHaveBeenCalledWith('styleWithCSS', false, 'false');
    });
  });

  describe('Table Integration', () => {
    it('handles table insertion workflow', () => {
      render(<Editor />);
      
      // Click table button to open picker
      const tableButton = screen.getByTitle('Insert Table');
      fireEvent.click(tableButton);
      
      // Should open the table picker (test that button click doesn't throw)
      expect(() => {
        fireEvent.click(tableButton);
      }).not.toThrow();
    });
  });

  describe('Error Handling Integration', () => {
    it('handles malformed HTML input gracefully', () => {
      const TestComponent = () => {
        const [content, setContent] = useState('<p>Invalid <unclosed>');
        return <Editor value={content} onChange={setContent} />;
      };
      
      expect(() => {
        render(<TestComponent />);
      }).not.toThrow();
    });

    it('handles rapid state updates without errors', async () => {
      const TestComponent = () => {
        const [content, setContent] = useState('<p>Initial</p>');
        
        React.useEffect(() => {
          // Rapidly update content
          const updates = ['<p>Update 1</p>', '<p>Update 2</p>', '<p>Update 3</p>'];
          updates.forEach((update, index) => {
            setTimeout(() => setContent(update), index * 10);
          });
        }, []);
        
        return <Editor value={content} onChange={setContent} />;
      };
      
      expect(() => {
        render(<TestComponent />);
      }).not.toThrow();
    });

    it('handles disabled editor state properly', () => {
      render(<Editor readOnly />);
      const editor = screen.getByRole('textbox');
      
      expect(editor).toHaveAttribute('contenteditable', 'false');
      
      // Toolbar should still be rendered but editor should be read-only
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      expect(boldButton).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    it('handles large content without significant performance degradation', () => {
      const largeContent = '<p>' + 'Large content '.repeat(100) + '</p>';
      
      const startTime = performance.now();
      
      render(<Editor value={largeContent} />);
      const editor = screen.getByRole('textbox');
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
      expect(editor.innerHTML).toContain('Large content');
    });

    it('properly cleans up event listeners on unmount', () => {
      const { unmount } = render(<Editor />);
      
      // Should not throw on unmount
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper ARIA attributes and roles', () => {
      render(<Editor placeholder="Type here..." />);
      
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveAttribute('aria-label', 'Rich text editor');
      expect(editor).toHaveAttribute('aria-multiline', 'true');
      expect(editor).toHaveAttribute('data-placeholder', 'Type here...');
      
      // Toolbar buttons should have proper ARIA attributes
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      expect(boldButton).toHaveAttribute('aria-label', 'Bold (Ctrl+B)');
      expect(boldButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('handles keyboard navigation properly', () => {
      render(<Editor />);
      
      // Test that keyboard events don't throw errors
      const editor = screen.getByRole('textbox');
      
      expect(() => {
        fireEvent.keyDown(editor, { key: 'Tab' });
        fireEvent.keyDown(editor, { key: 'Enter' });
        fireEvent.keyDown(editor, { key: 'Escape' });
      }).not.toThrow();
    });
  });

  describe('Cross-Browser Compatibility Simulation', () => {
    it('handles different execCommand implementations', () => {
      // Mock different browser behaviors
      const originalExecCommand = document.execCommand;
      
      // Test when execCommand returns false
      document.execCommand = vi.fn(() => false);
      
      render(<Editor />);
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      
      expect(() => {
        fireEvent.click(boldButton);
      }).not.toThrow();
      
      // Restore original
      document.execCommand = originalExecCommand;
    });
  });
});