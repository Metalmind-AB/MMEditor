import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TableContextMenu } from './TableContextMenu';
import { TableManager } from '../../modules/table/table';

vi.mock('../../modules/table/table', () => ({
  TableManager: {
    addRowAbove: vi.fn(),
    addRowBelow: vi.fn(),
    addColumnLeft: vi.fn(),
    addColumnRight: vi.fn(),
    deleteRow: vi.fn(),
    deleteColumn: vi.fn(),
  },
}));

describe('TableContextMenu', () => {
  const defaultProps = {
    isOpen: true,
    position: { x: 100, y: 200 },
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders menu when isOpen is true', () => {
      render(<TableContextMenu {...defaultProps} />);
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menu')).toHaveAttribute('aria-label', 'Table operations');
    });

    it('does not render menu when isOpen is false', () => {
      render(<TableContextMenu {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('positions menu at specified coordinates', () => {
      render(<TableContextMenu {...defaultProps} />);
      const menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({
        left: '100px',
        top: '200px',
      });
    });

    it('renders all menu items', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      expect(screen.getByText('Add Row Above')).toBeInTheDocument();
      expect(screen.getByText('Add Row Below')).toBeInTheDocument();
      expect(screen.getByText('Add Column Left')).toBeInTheDocument();
      expect(screen.getByText('Add Column Right')).toBeInTheDocument();
      expect(screen.getByText('Delete Row')).toBeInTheDocument();
      expect(screen.getByText('Delete Column')).toBeInTheDocument();
    });

    it('renders menu item icons', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      expect(screen.getByText('⬆')).toBeInTheDocument();
      expect(screen.getByText('⬇')).toBeInTheDocument();
      expect(screen.getByText('⬅')).toBeInTheDocument();
      expect(screen.getByText('➡')).toBeInTheDocument();
      expect(screen.getAllByText('✕')).toHaveLength(2);
    });

    it('renders dividers between sections', () => {
      const { container } = render(<TableContextMenu {...defaultProps} />);
      // CSS modules generate unique class names, so we look for divs with specific styles
      const allDivs = container.querySelectorAll('div');
      const dividers = Array.from(allDivs).filter(div => 
        div.className && div.className.includes('divider')
      );
      expect(dividers).toHaveLength(2);
    });
  });

  describe('Menu Actions', () => {
    it('calls TableManager.addRowAbove and closes menu when Add Row Above is clicked', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      const button = screen.getByText('Add Row Above');
      fireEvent.click(button);
      
      expect(TableManager.addRowAbove).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls TableManager.addRowBelow and closes menu when Add Row Below is clicked', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      const button = screen.getByText('Add Row Below');
      fireEvent.click(button);
      
      expect(TableManager.addRowBelow).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls TableManager.addColumnLeft and closes menu when Add Column Left is clicked', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      const button = screen.getByText('Add Column Left');
      fireEvent.click(button);
      
      expect(TableManager.addColumnLeft).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls TableManager.addColumnRight and closes menu when Add Column Right is clicked', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      const button = screen.getByText('Add Column Right');
      fireEvent.click(button);
      
      expect(TableManager.addColumnRight).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls TableManager.deleteRow and closes menu when Delete Row is clicked', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      const button = screen.getByText('Delete Row');
      fireEvent.click(button);
      
      expect(TableManager.deleteRow).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls TableManager.deleteColumn and closes menu when Delete Column is clicked', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      const button = screen.getByText('Delete Column');
      fireEvent.click(button);
      
      expect(TableManager.deleteColumn).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Handlers', () => {
    it('closes menu when clicking outside', async () => {
      const { container } = render(
        <div>
          <TableContextMenu {...defaultProps} />
          <div data-testid="outside">Outside Element</div>
        </div>
      );

      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not close menu when clicking inside', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      const menu = screen.getByRole('menu');
      fireEvent.mouseDown(menu);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('closes menu when Escape key is pressed', async () => {
      render(<TableContextMenu {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not close menu when other keys are pressed', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'a' });
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('adds event listeners when menu opens', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      render(<TableContextMenu {...defaultProps} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('removes event listeners when menu closes', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<TableContextMenu {...defaultProps} />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('does not add event listeners when menu is closed', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      addEventListenerSpy.mockClear();
      
      render(<TableContextMenu {...defaultProps} isOpen={false} />);
      
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Table operations');
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(6); // 6 clickable items (not dividers)
    });

    it('menu items have button role', () => {
      render(<TableContextMenu {...defaultProps} />);
      
      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach((item) => {
        expect(item.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Dynamic Position Updates', () => {
    it('updates position when props change', () => {
      const { rerender } = render(<TableContextMenu {...defaultProps} />);
      
      let menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({
        left: '100px',
        top: '200px',
      });

      rerender(
        <TableContextMenu
          {...defaultProps}
          position={{ x: 300, y: 400 }}
        />
      );

      menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({
        left: '300px',
        top: '400px',
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('cleans up properly on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<TableContextMenu {...defaultProps} />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('handles rapid open/close cycles', () => {
      const { rerender } = render(<TableContextMenu {...defaultProps} />);
      
      // Rapidly toggle isOpen
      rerender(<TableContextMenu {...defaultProps} isOpen={false} />);
      rerender(<TableContextMenu {...defaultProps} isOpen={true} />);
      rerender(<TableContextMenu {...defaultProps} isOpen={false} />);
      rerender(<TableContextMenu {...defaultProps} isOpen={true} />);
      
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });
});