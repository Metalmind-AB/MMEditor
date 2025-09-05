import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { Toolbar } from './Toolbar';
import { Format, EditorInstance } from '../Editor/Editor.types';
import { pluginRegistry } from '../../plugins/PluginRegistry';

describe('Toolbar Component', () => {
  const mockEditorInstance: EditorInstance = {
    getHTML: vi.fn(() => '<p>Test</p>'),
    setHTML: vi.fn(),
    getText: vi.fn(() => 'Test'),
    getLength: vi.fn(() => 4),
    format: vi.fn(),
    removeFormat: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    getSelection: vi.fn(),
    setSelection: vi.fn(),
    execCommand: vi.fn(),
    isFormatActive: vi.fn(() => false),
    registerPlugin: vi.fn(),
    unregisterPlugin: vi.fn(),
    getPlugin: vi.fn(),
    executeCommand: vi.fn(),
  };

  const defaultProps = {
    config: {
      groups: [
        { name: 'text', items: ['bold', 'italic', 'underline'] as Format[] },
        { name: 'heading', items: ['h1', 'h2'] as Format[] },
        { name: 'list', items: ['bullet', 'number'] as Format[] },
      ],
    },
    activeFormats: new Set<Format>(),
    onFormat: vi.fn(),
    editorInstance: mockEditorInstance,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all toolbar groups', () => {
      render(<Toolbar {...defaultProps} />);
      
      // Check for text formatting buttons
      expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument();
      expect(screen.getByTitle('Italic (Ctrl+I)')).toBeInTheDocument();
      expect(screen.getByTitle('Underline (Ctrl+U)')).toBeInTheDocument();
      
      // Check for list buttons
      expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
      expect(screen.getByTitle('Numbered List')).toBeInTheDocument();
    });

    it('renders heading dropdown for heading group', () => {
      render(<Toolbar {...defaultProps} />);
      
      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('renders custom buttons when provided', () => {
      const customConfig = {
        ...defaultProps.config,
        customButtons: [{
          name: 'custom',
          icon: '🔧',
          action: vi.fn(),
        }],
      };
      
      render(<Toolbar {...defaultProps} config={customConfig} />);
      
      expect(screen.getByText('🔧')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('calls onFormat when text formatting buttons are clicked', () => {
      render(<Toolbar {...defaultProps} />);
      
      fireEvent.click(screen.getByTitle('Bold (Ctrl+B)'));
      expect(defaultProps.onFormat).toHaveBeenCalledWith('bold');
      
      fireEvent.click(screen.getByTitle('Italic (Ctrl+I)'));
      expect(defaultProps.onFormat).toHaveBeenCalledWith('italic');
    });

    it('calls onFormat when list buttons are clicked', () => {
      render(<Toolbar {...defaultProps} />);
      
      fireEvent.click(screen.getByTitle('Bullet List'));
      expect(defaultProps.onFormat).toHaveBeenCalledWith('bullet');
      
      fireEvent.click(screen.getByTitle('Numbered List'));
      expect(defaultProps.onFormat).toHaveBeenCalledWith('number');
    });

    it('executes custom button actions', () => {
      const customAction = vi.fn();
      const customConfig = {
        ...defaultProps.config,
        customButtons: [{
          name: 'custom',
          icon: '🔧',
          action: customAction,
        }],
      };
      
      render(<Toolbar {...defaultProps} config={customConfig} />);
      
      fireEvent.click(screen.getByText('🔧'));
      expect(customAction).toHaveBeenCalledWith(mockEditorInstance);
    });
  });

  describe('Active States', () => {
    it('shows active state for bold button', () => {
      const activeFormats = new Set<Format>(['bold']);
      
      render(<Toolbar {...defaultProps} activeFormats={activeFormats} />);
      
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      expect(boldButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows active state for multiple formats', () => {
      const activeFormats = new Set<Format>(['bold', 'italic']);
      
      render(<Toolbar {...defaultProps} activeFormats={activeFormats} />);
      
      expect(screen.getByTitle('Bold (Ctrl+B)')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTitle('Italic (Ctrl+I)')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTitle('Underline (Ctrl+U)')).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Dropdown Functionality', () => {
    it('opens heading dropdown when clicked', () => {
      render(<Toolbar {...defaultProps} />);
      
      const dropdown = screen.getByText('Normal');
      fireEvent.click(dropdown);
      
      expect(screen.getByText('Heading 1')).toBeInTheDocument();
      expect(screen.getByText('Heading 2')).toBeInTheDocument();
    });

    it('applies heading format when option selected', () => {
      render(<Toolbar {...defaultProps} />);
      
      // Open dropdown
      fireEvent.click(screen.getByText('Normal'));
      
      // Select heading 1
      fireEvent.click(screen.getByText('Heading 1'));
      
      expect(defaultProps.onFormat).toHaveBeenCalledWith('h1');
    });

    it('updates dropdown display based on active heading', () => {
      const activeFormats = new Set<Format>(['h1']);
      
      render(<Toolbar {...defaultProps} activeFormats={activeFormats} />);
      
      // Should show H1 as current selection (this would be handled by useEffect)
      expect(screen.getByText('Heading 1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes on buttons', () => {
      render(<Toolbar {...defaultProps} />);
      
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      expect(boldButton).toHaveAttribute('aria-label', 'Bold (Ctrl+B)');
      expect(boldButton).toHaveAttribute('aria-pressed');
    });

    it('has proper keyboard navigation', () => {
      render(<Toolbar {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Configuration Flexibility', () => {
    it('renders only specified groups', () => {
      const limitedConfig = {
        groups: [
          { name: 'text', items: ['bold'] as Format[] },
        ],
      };
      
      render(<Toolbar {...defaultProps} config={limitedConfig} />);
      
      expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument();
      expect(screen.queryByTitle('Italic (Ctrl+I)')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Bullet List')).not.toBeInTheDocument();
    });

    it('handles empty groups gracefully', () => {
      const emptyConfig = {
        groups: [],
      };
      
      expect(() => {
        render(<Toolbar {...defaultProps} config={emptyConfig} />);
      }).not.toThrow();
    });
  });

  describe('Table Functionality', () => {
    it('renders table button when included in config', () => {
      const tableConfig = {
        groups: [
          { name: 'insert', items: ['table'] as Format[] },
        ],
      };
      
      render(<Toolbar {...defaultProps} config={tableConfig} />);
      
      expect(screen.getByTitle('Insert Table')).toBeInTheDocument();
    });

    it('handles table button click and saves selection', () => {
      const tableConfig = {
        groups: [
          { name: 'insert', items: ['table'] as Format[] },
        ],
      };
      
      // Mock window.getSelection
      const mockRange = {
        cloneRange: vi.fn().mockReturnThis(),
      };
      const mockSelection = {
        rangeCount: 1,
        getRangeAt: vi.fn(() => mockRange),
        removeAllRanges: vi.fn(),
        addRange: vi.fn(),
        anchorNode: null,
        anchorOffset: 0,
        direction: 'none',
        focusNode: null,
        focusOffset: 0,
        isCollapsed: true,
        type: 'None',
        toString: vi.fn(() => ''),
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
        setPosition: vi.fn()
      };
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as unknown as Selection | null);
      
      render(<Toolbar {...defaultProps} config={tableConfig} />);
      
      const tableButton = screen.getByTitle('Insert Table');
      fireEvent.click(tableButton);
      
      // Verify that selection was saved
      expect(mockSelection.getRangeAt).toHaveBeenCalled();
      expect(mockRange.cloneRange).toHaveBeenCalled();
    });


  });

  describe('Plugin Integration', () => {
    it('handles plugin registry integration', () => {
      // Mock the plugin registry methods
      const mockGetToolbarItems = vi.spyOn(pluginRegistry, 'getToolbarItems');
      const mockGetIconOverrides = vi.spyOn(pluginRegistry, 'getIconOverrides');
      const mockAddChangeListener = vi.spyOn(pluginRegistry, 'addChangeListener');
      const mockRemoveChangeListener = vi.spyOn(pluginRegistry, 'removeChangeListener');
      
      mockGetToolbarItems.mockReturnValue([]);
      mockGetIconOverrides.mockReturnValue(new Map());
      
      const { unmount } = render(<Toolbar {...defaultProps} />);
      
      // Verify plugin registry methods were called
      expect(mockGetToolbarItems).toHaveBeenCalled();
      expect(mockGetIconOverrides).toHaveBeenCalled();
      expect(mockAddChangeListener).toHaveBeenCalled();
      
      unmount();
      
      // Verify cleanup
      expect(mockRemoveChangeListener).toHaveBeenCalled();
    });

    it('renders plugin toolbar items when provided', () => {
      const mockGetToolbarItems = vi.spyOn(pluginRegistry, 'getToolbarItems');
      const mockGetIconOverrides = vi.spyOn(pluginRegistry, 'getIconOverrides');
      
      mockGetToolbarItems.mockReturnValue([
        {
          name: 'plugin-button',
          icon: '🔌',
          tooltip: 'Plugin Button',
          action: vi.fn(),
          pluginName: 'test-plugin',
          group: 'plugin',
        },
      ]);
      mockGetIconOverrides.mockReturnValue(new Map());
      
      render(<Toolbar {...defaultProps} />);
      
      expect(screen.getByTitle('Plugin Button')).toBeInTheDocument();
    });

    it('executes plugin button actions', () => {
      const pluginAction = vi.fn();
      const mockGetToolbarItems = vi.spyOn(pluginRegistry, 'getToolbarItems');
      const mockGetIconOverrides = vi.spyOn(pluginRegistry, 'getIconOverrides');
      
      mockGetToolbarItems.mockReturnValue([
        {
          name: 'plugin-button',
          icon: '🔌',
          tooltip: 'Plugin Button',
          action: pluginAction,
        },
      ]);
      mockGetIconOverrides.mockReturnValue(new Map());
      
      render(<Toolbar {...defaultProps} />);
      
      const pluginButton = screen.getByTitle('Plugin Button');
      fireEvent.click(pluginButton);
      
      expect(pluginAction).toHaveBeenCalledWith(mockEditorInstance);
    });

    it('applies plugin icon overrides', () => {
      const mockGetToolbarItems = vi.spyOn(pluginRegistry, 'getToolbarItems');
      const mockGetIconOverrides = vi.spyOn(pluginRegistry, 'getIconOverrides');
      
      mockGetToolbarItems.mockReturnValue([]);
      mockGetIconOverrides.mockReturnValue(new Map([['bold', '💪']]));
      
      render(<Toolbar {...defaultProps} />);
      
      // The bold button should now show the overridden icon
      expect(screen.getByText('💪')).toBeInTheDocument();
    });

    it('shows active state for plugin buttons', () => {
      const isActive = vi.fn(() => true);
      const mockGetToolbarItems = vi.spyOn(pluginRegistry, 'getToolbarItems');
      const mockGetIconOverrides = vi.spyOn(pluginRegistry, 'getIconOverrides');
      
      mockGetToolbarItems.mockReturnValue([
        {
          name: 'plugin-button',
          icon: '🔌',
          tooltip: 'Plugin Button',
          action: vi.fn(),
          isActive,
        },
      ]);
      mockGetIconOverrides.mockReturnValue(new Map());
      
      render(<Toolbar {...defaultProps} />);
      
      const pluginButton = screen.getByTitle('Plugin Button');
      expect(pluginButton).toHaveAttribute('aria-pressed', 'true');
      expect(isActive).toHaveBeenCalledWith(mockEditorInstance);
    });
  });

  describe('Link Functionality', () => {
    it('renders link button when included in config', () => {
      const linkConfig = {
        groups: [
          { name: 'insert', items: ['link'] as Format[] },
        ],
      };
      
      render(<Toolbar {...defaultProps} config={linkConfig} />);
      
      expect(screen.getByTitle('Insert Link (Ctrl+K)')).toBeInTheDocument();
    });

    it('calls onFormat when link button is clicked', () => {
      const linkConfig = {
        groups: [
          { name: 'insert', items: ['link'] as Format[] },
        ],
      };
      
      render(<Toolbar {...defaultProps} config={linkConfig} />);
      
      const linkButton = screen.getByTitle('Insert Link (Ctrl+K)');
      fireEvent.click(linkButton);
      
      expect(defaultProps.onFormat).toHaveBeenCalledWith('link');
    });
  });

  describe('Special Format Handling', () => {
    it('handles strikethrough format', () => {
      const strikeConfig = {
        groups: [
          { name: 'text', items: ['strike'] as Format[] },
        ],
      };
      
      render(<Toolbar {...defaultProps} config={strikeConfig} />);
      
      const strikeButton = screen.getByTitle('Strikethrough');
      fireEvent.click(strikeButton);
      
      expect(defaultProps.onFormat).toHaveBeenCalledWith('strike');
    });

    it('handles code format', () => {
      const codeConfig = {
        groups: [
          { name: 'text', items: ['code'] as Format[] },
        ],
      };
      
      render(<Toolbar {...defaultProps} config={codeConfig} />);
      
      const codeButton = screen.getByTitle('Code');
      fireEvent.click(codeButton);
      
      expect(defaultProps.onFormat).toHaveBeenCalledWith('code');
    });

    it('converts paragraph format to execCommand', () => {
      render(<Toolbar {...defaultProps} />);
      
      // Open dropdown and select Normal (paragraph)
      fireEvent.click(screen.getByText('Normal'));
      fireEvent.click(screen.getAllByText('Normal')[1]);
      
      expect(mockEditorInstance.execCommand).toHaveBeenCalledWith('formatBlock', '<p>');
      expect(defaultProps.onFormat).not.toHaveBeenCalledWith('p');
    });
  });
});