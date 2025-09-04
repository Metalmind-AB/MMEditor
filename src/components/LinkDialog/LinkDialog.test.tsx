import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinkDialog } from './LinkDialog';

describe('LinkDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dialog when isOpen is true', () => {
      render(<LinkDialog {...defaultProps} />);
      expect(screen.getByText('Insert Link')).toBeInTheDocument();
      expect(screen.getByLabelText('URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Text (optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Open in new tab')).toBeInTheDocument();
    });

    it('does not render dialog when isOpen is false', () => {
      render(<LinkDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Insert Link')).not.toBeInTheDocument();
    });

    it('shows Edit Link title when initialData is provided', () => {
      const initialData = {
        url: 'https://example.com',
        text: 'Example',
        target: '_blank' as const,
      };
      render(<LinkDialog {...defaultProps} initialData={initialData} />);
      expect(screen.getByText('Edit Link')).toBeInTheDocument();
    });

    it('shows Remove Link button when editing and onRemove is provided', () => {
      const initialData = {
        url: 'https://example.com',
        text: 'Example',
      };
      const onRemove = vi.fn();
      render(
        <LinkDialog
          {...defaultProps}
          initialData={initialData}
          onRemove={onRemove}
        />
      );
      expect(screen.getByText('Remove Link')).toBeInTheDocument();
    });

    it('does not show Remove Link button when inserting new link', () => {
      const onRemove = vi.fn();
      render(<LinkDialog {...defaultProps} onRemove={onRemove} />);
      expect(screen.queryByText('Remove Link')).not.toBeInTheDocument();
    });

    it('shows Update button when editing', () => {
      const initialData = { url: 'https://example.com' };
      render(<LinkDialog {...defaultProps} initialData={initialData} />);
      expect(screen.getByText('Update')).toBeInTheDocument();
    });

    it('shows Insert button when creating new link', () => {
      render(<LinkDialog {...defaultProps} />);
      expect(screen.getByText('Insert')).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('populates fields with initial data when provided', () => {
      const initialData = {
        url: 'https://example.com',
        text: 'Example Link',
        target: '_blank' as const,
      };
      render(<LinkDialog {...defaultProps} initialData={initialData} />);
      
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Example Link')).toBeInTheDocument();
      expect(screen.getByLabelText('Open in new tab')).toBeChecked();
    });

    it('starts with empty fields when no initial data', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL') as HTMLInputElement;
      const textInput = screen.getByLabelText('Text (optional)') as HTMLInputElement;
      const checkbox = screen.getByLabelText('Open in new tab') as HTMLInputElement;
      
      expect(urlInput.value).toBe('');
      expect(textInput.value).toBe('');
      expect(checkbox.checked).toBe(false);
    });

    it('focuses and selects URL input when dialog opens', async () => {
      vi.useFakeTimers();
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL') as HTMLInputElement;
      
      // Fast-forward timers to trigger the focus
      vi.advanceTimersByTime(100);
      
      expect(urlInput).toHaveFocus();
      vi.useRealTimers();
    });
  });

  describe('Form Validation', () => {
    it('shows error when URL is empty', async () => {
      render(<LinkDialog {...defaultProps} />);
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('URL is required')).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when URL is invalid', async () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      fireEvent.change(urlInput, { target: { value: 'not a valid url' } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('clears error when user types in URL field', async () => {
      render(<LinkDialog {...defaultProps} />);
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('URL is required')).toBeInTheDocument();
      });
      
      const urlInput = screen.getByLabelText('URL');
      fireEvent.change(urlInput, { target: { value: 'h' } });
      
      expect(screen.queryByText('URL is required')).not.toBeInTheDocument();
    });

    it('accepts valid URLs with http protocol', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      fireEvent.change(urlInput, { target: { value: 'http://example.com' } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: 'http://example.com',
        text: 'http://example.com',
        target: '_self',
      });
    });

    it('accepts valid URLs with https protocol', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: 'https://example.com',
        text: 'https://example.com',
        target: '_self',
      });
    });

    it('automatically adds https:// to URLs without protocol', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      fireEvent.change(urlInput, { target: { value: 'example.com' } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: 'https://example.com',
        text: 'https://example.com',
        target: '_self',
      });
    });
  });

  describe('Form Submission', () => {
    it('submits with URL and custom text', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      const textInput = screen.getByLabelText('Text (optional)');
      
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
      fireEvent.change(textInput, { target: { value: 'Custom Text' } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: 'https://example.com',
        text: 'Custom Text',
        target: '_self',
      });
    });

    it('submits with URL as text when text field is empty', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: 'https://example.com',
        text: 'https://example.com',
        target: '_self',
      });
    });

    it('submits with target _blank when checkbox is checked', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      const checkbox = screen.getByLabelText('Open in new tab');
      
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
      fireEvent.click(checkbox);
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: 'https://example.com',
        text: 'https://example.com',
        target: '_blank',
      });
    });

    it('prevents default form submission', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
      
      const form = urlInput.closest('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');
      
      form?.dispatchEvent(submitEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Event Handlers', () => {
    it('closes dialog when Cancel button is clicked', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('closes dialog when Escape key is pressed', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const dialog = screen.getByText('Insert Link').closest('div');
      if (dialog) {
        fireEvent.keyDown(dialog, { key: 'Escape' });
      }
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('closes dialog when clicking overlay', () => {
      const { container } = render(<LinkDialog {...defaultProps} />);
      
      // CSS modules generate unique class names, find the overlay by its position
      const overlay = container.firstElementChild;
      if (overlay) {
        // Simulate click on the overlay itself, not its children
        const clickEvent = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(clickEvent, 'target', { value: overlay, enumerable: true });
        Object.defineProperty(clickEvent, 'currentTarget', { value: overlay, enumerable: true });
        overlay.dispatchEvent(clickEvent);
      }
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close dialog when clicking inside dialog', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const dialogContent = screen.getByText('Insert Link').closest('div');
      if (dialogContent) {
        fireEvent.click(dialogContent);
      }
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('calls onRemove when Remove Link button is clicked', () => {
      const onRemove = vi.fn();
      const initialData = {
        url: 'https://example.com',
        text: 'Example',
      };
      
      render(
        <LinkDialog
          {...defaultProps}
          initialData={initialData}
          onRemove={onRemove}
        />
      );
      
      const removeButton = screen.getByText('Remove Link');
      fireEvent.click(removeButton);
      
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Updates', () => {
    it('updates URL state when input changes', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL') as HTMLInputElement;
      fireEvent.change(urlInput, { target: { value: 'https://test.com' } });
      
      expect(urlInput.value).toBe('https://test.com');
    });

    it('updates text state when input changes', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const textInput = screen.getByLabelText('Text (optional)') as HTMLInputElement;
      fireEvent.change(textInput, { target: { value: 'Test Link' } });
      
      expect(textInput.value).toBe('Test Link');
    });

    it('updates checkbox state when clicked', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const checkbox = screen.getByLabelText('Open in new tab') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
      
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('Dynamic Props Updates', () => {
    it('resets form when dialog reopens with different initial data', () => {
      const { rerender } = render(
        <LinkDialog
          {...defaultProps}
          initialData={{
            url: 'https://example.com',
            text: 'Example',
            target: '_blank',
          }}
        />
      );
      
      let urlInput = screen.getByLabelText('URL') as HTMLInputElement;
      expect(urlInput.value).toBe('https://example.com');
      
      // Close and reopen with different data
      rerender(
        <LinkDialog
          {...defaultProps}
          isOpen={false}
          initialData={{
            url: 'https://example.com',
            text: 'Example',
            target: '_blank',
          }}
        />
      );
      
      rerender(
        <LinkDialog
          {...defaultProps}
          isOpen={true}
          initialData={{
            url: 'https://different.com',
            text: 'Different',
            target: '_self',
          }}
        />
      );
      
      urlInput = screen.getByLabelText('URL') as HTMLInputElement;
      const textInput = screen.getByLabelText('Text (optional)') as HTMLInputElement;
      const checkbox = screen.getByLabelText('Open in new tab') as HTMLInputElement;
      
      expect(urlInput.value).toBe('https://different.com');
      expect(textInput.value).toBe('Different');
      expect(checkbox.checked).toBe(false);
    });

    it('resets form when dialog reopens without initial data', () => {
      const { rerender } = render(
        <LinkDialog
          {...defaultProps}
          initialData={{
            url: 'https://example.com',
            text: 'Example',
            target: '_blank',
          }}
        />
      );
      
      // Close and reopen without data
      rerender(
        <LinkDialog
          {...defaultProps}
          isOpen={false}
        />
      );
      
      rerender(
        <LinkDialog
          {...defaultProps}
          isOpen={true}
        />
      );
      
      const urlInput = screen.getByLabelText('URL') as HTMLInputElement;
      const textInput = screen.getByLabelText('Text (optional)') as HTMLInputElement;
      const checkbox = screen.getByLabelText('Open in new tab') as HTMLInputElement;
      
      expect(urlInput.value).toBe('');
      expect(textInput.value).toBe('');
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      render(<LinkDialog {...defaultProps} />);
      
      expect(screen.getByLabelText('URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Text (optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Open in new tab')).toBeInTheDocument();
    });

    it('has proper input types', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      const textInput = screen.getByLabelText('Text (optional)');
      const checkbox = screen.getByLabelText('Open in new tab');
      
      expect(urlInput).toHaveAttribute('type', 'text');
      expect(textInput).toHaveAttribute('type', 'text');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('has proper IDs for label associations', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      const textInput = screen.getByLabelText('Text (optional)');
      const checkbox = screen.getByLabelText('Open in new tab');
      
      expect(urlInput).toHaveAttribute('id', 'link-url');
      expect(textInput).toHaveAttribute('id', 'link-text');
      expect(checkbox).toHaveAttribute('id', 'link-target');
    });

    it('shows error messages for screen readers', async () => {
      render(<LinkDialog {...defaultProps} />);
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText('URL is required');
        expect(errorMessage).toBeInTheDocument();
        // CSS modules generate unique class names, check for the element instead
        expect(errorMessage.className).toContain('errorMessage');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles complex URLs with query parameters', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      const complexUrl = 'https://example.com/path?param1=value1&param2=value2#anchor';
      
      fireEvent.change(urlInput, { target: { value: complexUrl } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: complexUrl,
        text: complexUrl,
        target: '_self',
      });
    });

    it('handles URLs with special characters', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      const specialUrl = 'https://example.com/path-with-ñ-and-中文';
      
      fireEvent.change(urlInput, { target: { value: specialUrl } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: specialUrl,
        text: specialUrl,
        target: '_self',
      });
    });

    it('handles very long URLs', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      const longUrl = 'https://example.com/' + 'a'.repeat(500);
      
      fireEvent.change(urlInput, { target: { value: longUrl } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: longUrl,
        text: longUrl,
        target: '_self',
      });
    });

    it('handles empty text field with whitespace', () => {
      render(<LinkDialog {...defaultProps} />);
      
      const urlInput = screen.getByLabelText('URL');
      const textInput = screen.getByLabelText('Text (optional)');
      
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
      fireEvent.change(textInput, { target: { value: '   ' } });
      
      const submitButton = screen.getByText('Insert');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        url: 'https://example.com',
        text: '   ',
        target: '_self',
      });
    });
  });
});