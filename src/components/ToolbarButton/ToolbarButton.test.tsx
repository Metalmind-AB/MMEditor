import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { ToolbarButton } from './ToolbarButton';
import { Format } from '../Editor/Editor.types';

describe('ToolbarButton Component', () => {
  const defaultProps = {
    format: 'bold' as Format,
    icon: 'B',
    tooltip: 'Bold (Ctrl+B)',
    isActive: false,
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders button with icon', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('B');
    });

    it('renders with tooltip', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Bold (Ctrl+B)');
      expect(button).toHaveAttribute('aria-label', 'Bold (Ctrl+B)');
    });

    it('handles React node icons', () => {
      const iconNode = <span data-testid="custom-icon">🔧</span>;
      
      render(<ToolbarButton {...defaultProps} icon={iconNode} />);
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Active States', () => {
    it('shows inactive state by default', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).not.toHaveClass(/active/);
    });

    it('shows active state when isActive is true', () => {
      render(<ToolbarButton {...defaultProps} isActive={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button.className).toMatch(/active/i);
    });

    it('toggles visual state correctly', () => {
      const { rerender } = render(<ToolbarButton {...defaultProps} isActive={false} />);
      
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      
      rerender(<ToolbarButton {...defaultProps} isActive={true} />);
      
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when clicked', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick multiple times for multiple clicks', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(defaultProps.onClick).toHaveBeenCalledTimes(3);
    });

    it('prevents default browser behavior', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Button should prevent default behavior
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveProperty('tagName', 'BUTTON');
    });

    it('has aria-pressed for toggle buttons', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed');
    });

    it('has proper aria-label', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Bold (Ctrl+B)');
    });

    it('is keyboard accessible', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      // Should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Should respond to Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('responds to Space key', () => {
      render(<ToolbarButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(defaultProps.onClick).toHaveBeenCalled();
    });
  });

  describe('Data Attributes', () => {
    it('applies custom data attributes', () => {
      const dataAttributes = {
        'data-testid': 'custom-button',
        'data-format': 'bold',
      };
      
      render(<ToolbarButton {...defaultProps} dataAttributes={dataAttributes} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('data-format', 'bold');
    });

    it('handles empty data attributes', () => {
      expect(() => {
        render(<ToolbarButton {...defaultProps} dataAttributes={{}} />);
      }).not.toThrow();
    });
  });

  describe('Different Format Types', () => {
    const formats: Format[] = ['bold', 'italic', 'underline', 'strike', 'code', 'h1', 'bullet', 'link'];
    
    formats.forEach(format => {
      it(`handles ${format} format correctly`, () => {
        const props = {
          ...defaultProps,
          format,
          tooltip: `${format} button`,
        };
        
        render(<ToolbarButton {...props} />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', `${format} button`);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing tooltip gracefully', () => {
      const propsWithoutTooltip = {
        ...defaultProps,
        tooltip: undefined as unknown,
      };
      
      expect(() => {
        render(<ToolbarButton {...propsWithoutTooltip} />);
      }).not.toThrow();
    });

    it('handles empty icon', () => {
      const propsWithEmptyIcon = {
        ...defaultProps,
        icon: '',
      };
      
      expect(() => {
        render(<ToolbarButton {...propsWithEmptyIcon} />);
      }).not.toThrow();
    });

    it('maintains consistent styling across renders', () => {
      const { rerender } = render(<ToolbarButton {...defaultProps} />);
      
      const initialClasses = screen.getByRole('button').className;
      
      rerender(<ToolbarButton {...defaultProps} />);
      
      const finalClasses = screen.getByRole('button').className;
      expect(initialClasses).toBe(finalClasses);
    });
  });
});