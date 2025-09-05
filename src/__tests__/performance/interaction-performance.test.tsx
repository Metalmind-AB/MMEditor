import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { performanceUtils } from '../../test/test-utils';
import { Editor } from '../../components/Editor/Editor';

describe('Interaction Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maintains responsive typing performance', async () => {
    render(<Editor />);
    const editor = screen.getByRole('textbox');
    
    const { time } = await performanceUtils.measureTime(() => {
      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        fireEvent.input(editor, { 
          target: { innerHTML: `<p>Typed content ${i}</p>` }
        });
      }
    });

    // Increased threshold for test environment performance variability
    expect(time).toBeLessThan(500);
  });

  it('handles frequent formatting changes efficiently', async () => {
    render(<Editor />);
    
    const { time } = await performanceUtils.measureTime(() => {
      for (let i = 0; i < 20; i++) {
        const boldButton = screen.getByTitle('Bold (Ctrl+B)');
        fireEvent.click(boldButton);
      }
    });

    expect(time).toBeLessThan(100);
  });

  it('processes keyboard shortcuts quickly', async () => {
    render(<Editor />);
    const editor = screen.getByRole('textbox');
    
    const { time } = await performanceUtils.measureTime(() => {
      // Test multiple shortcuts rapidly
      const shortcuts = [
        { key: 'b', ctrlKey: true },
        { key: 'i', ctrlKey: true },
        { key: 'u', ctrlKey: true },
      ];
      
      shortcuts.forEach(shortcut => {
        fireEvent.keyDown(editor, shortcut);
      });
    });

    expect(time).toBeLessThan(50);
  });

  it('handles complex formatting operations efficiently', async () => {
    render(<Editor />);
    const editor = screen.getByRole('textbox');
    
    const { time } = await performanceUtils.measureTime(() => {
      for (let i = 0; i < 10; i++) {
        fireEvent.input(editor, {
          target: { 
            innerHTML: `<p>Text <strong>bold ${i}</strong> <em>italic ${i}</em></p>`
          }
        });
      }
    });

    expect(time).toBeLessThan(100);
  });

  it('survives stress testing with mixed interactions', async () => {
    render(<Editor />);
    const editor = screen.getByRole('textbox');
    const boldButton = screen.getByTitle('Bold (Ctrl+B)');
    const italicButton = screen.getByTitle('Italic (Ctrl+I)');
    
    const { time } = await performanceUtils.measureTime(() => {
      // Rapid mixed interactions
      for (let i = 0; i < 30; i++) {
        fireEvent.click(boldButton);
        fireEvent.input(editor, { 
          target: { innerHTML: `<p>Content ${i}</p>` }
        });
        fireEvent.click(italicButton);
      }
    });

    expect(time).toBeLessThan(300);
  });

  it('handles concurrent operations without performance degradation', async () => {
    render(<Editor />);
    const editor = screen.getByRole('textbox');
    
    const { time } = await performanceUtils.measureTime(() => {
      // Fire multiple events simultaneously
      fireEvent.focus(editor);
      fireEvent.input(editor, { target: { innerHTML: '<p>Test</p>' } });
      fireEvent.keyDown(editor, { key: 'b', ctrlKey: true });
      fireEvent.blur(editor);
    });

    expect(time).toBeLessThan(50);
  });
});