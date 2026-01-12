import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { MMEditorProps, EditorInstance, Format, SelectionRange } from './Editor.types';
import { Plugin } from '../../plugins/types';
import { Toolbar } from '../Toolbar/Toolbar';
import { LinkDialog, LinkData } from '../LinkDialog/LinkDialog';
import { TableContextMenu } from '../TableContextMenu/TableContextMenu';
import { ListManager } from '../../modules/lists/lists';
import { CodeManager } from '../../modules/code/code';
import { TableManager } from '../../modules/table/table';
import { sanitizer, HTMLSanitizer } from '../../modules/sanitizer/sanitizer';
import { HistoryManager } from '../../modules/history/history';
import { useDebounce } from '../../hooks/useDebounce';
import { pluginRegistry } from '../../plugins/PluginRegistry';
import styles from './Editor.module.css';

const defaultToolbarConfig = {
  groups: [
    { name: 'history', items: ['undo', 'redo'] as Format[] },
    { name: 'text', items: ['bold', 'italic', 'underline', 'strike', 'code'] as Format[] },
    { name: 'heading', items: ['h1', 'h2', 'h3'] as Format[] },
    { name: 'list', items: ['bullet', 'number'] as Format[] },
    { name: 'link', items: ['link'] as Format[] },
    { name: 'table', items: ['table'] as Format[] },
  ],
};

export const Editor = forwardRef<EditorInstance, MMEditorProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = 'Start typing...',
      readOnly = false,
      className = '',
      style,
      toolbar = defaultToolbarConfig,
      plugins = [],
      onFocus,
      onBlur,
      onReady,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isControlled] = useState(value !== undefined);
    const [activeFormats, setActiveFormats] = useState<Set<Format>>(new Set());
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [selectedLinkData, setSelectedLinkData] = useState<LinkData | undefined>();
    const [contextMenuOpen, setContextMenuOpen] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const lastHtmlRef = useRef<string>('');
    const savedSelection = useRef<Range | null>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const historyRef = useRef<HistoryManager | null>(null);
    const isRestoringFromHistoryRef = useRef(false);

    const getHTML = useCallback((): string => {
      if (!editorRef.current) return '';
      return editorRef.current.innerHTML;
    }, []);

    const setHTML = useCallback((html: string): void => {
      if (!editorRef.current) return;
      const sanitizedHtml = sanitizer.sanitize(html);
      editorRef.current.innerHTML = sanitizedHtml;
      lastHtmlRef.current = sanitizedHtml;
    }, []);

    const getText = useCallback((): string => {
      if (!editorRef.current) return '';
      return editorRef.current.textContent || '';
    }, []);

    const getLength = useCallback((): number => {
      return getText().length;
    }, [getText]);

    const getSelection = useCallback((): SelectionRange | null => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      
      const range = selection.getRangeAt(0);
      if (!editorRef.current?.contains(range.commonAncestorContainer)) {
        return null;
      }

      return {
        index: 0,
        length: range.toString().length,
      };
    }, []);

    const setSelection = useCallback((_range: SelectionRange): void => {
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (!selection) return;

      selection.removeAllRanges();
    }, []);

    // Define execCommand without circular dependencies
    const execCommand = useCallback((command: string, value?: string): void => {
      // Ensure the editor has focus before executing commands
      if (editorRef.current && !editorRef.current.contains(document.activeElement)) {
        editorRef.current.focus();
      }
      
      // Execute the command
      const result = document.execCommand(command, false, value);
      
      // Log if command fails in development
      if (!result && (process.env.NODE_ENV === 'development')) {
        console.warn(`execCommand '${command}' failed with value:`, value);
      }
      
      // Update formats after a delay to avoid circular dependency
      setTimeout(() => {
        // Directly check format states without using callbacks
        const selection = window.getSelection();
        pluginRegistry.onSelectionChange(selection);
        
        const formats = new Set<Format>();
        
        // Check basic formatting - wrap in try-catch for test environments
        try {
          if (document.queryCommandState('bold')) formats.add('bold');
          if (document.queryCommandState('italic')) formats.add('italic');
          if (document.queryCommandState('underline')) formats.add('underline');
          if (document.queryCommandState('strikethrough')) formats.add('strike');
          if (document.queryCommandState('insertUnorderedList')) formats.add('bullet');
          if (document.queryCommandState('insertOrderedList')) formats.add('number');
        } catch {
          // Ignore errors in test environments where queryCommandState may not be fully supported
        }
        
        // Check code formatting
        if (CodeManager.isInInlineCode()) formats.add('code');
        
        // Check heading
        const block = document.queryCommandValue('formatBlock').toLowerCase();
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(heading => {
          if (block === heading) formats.add(heading as Format);
        });
        
        setActiveFormats(formats);
      }, 0);
    }, []);

    // We need to use a ref to avoid circular dependency issues
    const handleLinkFormatRef = useRef<(() => void) | undefined>(undefined);
    
    // Refs for undo/redo to avoid circular dependency
    const performUndoRef = useRef<(() => void) | null>(null);
    const performRedoRef = useRef<(() => void) | null>(null);

    const format = useCallback((formatName: string, _value?: unknown): void => {
      // Capture HTML before format operation for history
      const beforeHtml = getHTML();

      switch (formatName) {
        case 'undo':
          if (performUndoRef.current) {
            performUndoRef.current();
          }
          return; // Don't push to history for undo
        case 'redo':
          if (performRedoRef.current) {
            performRedoRef.current();
          }
          return; // Don't push to history for redo
        case 'bold':
          execCommand('bold');
          break;
        case 'italic':
          execCommand('italic');
          break;
        case 'underline':
          execCommand('underline');
          break;
        case 'strike':
          execCommand('strikethrough');
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          execCommand('formatBlock', `<${formatName}>`);
          break;
        case 'bullet':
          execCommand('insertUnorderedList');
          break;
        case 'number':
          execCommand('insertOrderedList');
          break;
        case 'code':
          CodeManager.toggleInlineCode();
          execCommand('styleWithCSS', 'false'); // Trigger update
          break;
        case 'code-block':
          // Code blocks are deprecated, use inline code instead
          CodeManager.toggleInlineCode();
          execCommand('styleWithCSS', 'false'); // Trigger update
          break;
        case 'link':
          // Use ref to avoid circular dependency
          if (handleLinkFormatRef.current) {
            handleLinkFormatRef.current();
          }
          return; // Link dialog handles its own history
        case 'clear':
          // Deprecated - but kept for backwards compatibility
          execCommand('removeFormat');
          execCommand('formatBlock', '<p>');
          break;
        default:
          break;
      }

      // Push to history immediately after format operations
      setTimeout(() => {
        const afterHtml = getHTML();
        if (afterHtml !== beforeHtml) {
          historyRef.current?.pushImmediate(afterHtml);
        }
      }, 0);
    }, [execCommand, getHTML]);

    const removeFormat = useCallback((): void => {
      execCommand('removeFormat');
    }, [execCommand]);

    const focus = useCallback((): void => {
      editorRef.current?.focus();
    }, []);

    const blur = useCallback((): void => {
      editorRef.current?.blur();
    }, []);

    const registerPlugin = useCallback((plugin: Plugin) => {
      pluginRegistry.register(plugin);
    }, []);

    const unregisterPlugin = useCallback((pluginName: string) => {
      pluginRegistry.unregister(pluginName);
    }, []);

    const getPlugin = useCallback((pluginName: string) => {
      return pluginRegistry.get(pluginName);
    }, []);

    // Use a ref to store the editor instance for executeCommand
    const editorInstanceRef = useRef<EditorInstance | null>(null);
    
    const executeCommand = useCallback((commandName: string, ...args: unknown[]) => {
      const commands = pluginRegistry.getCommands();
      const command = commands.get(commandName);
      if (command && command.execute && editorInstanceRef.current) {
        command.execute(editorInstanceRef.current, ...args);
      }
    }, []);

    const isFormatActive = useCallback((formatName: Format): boolean => {
      try {
        switch (formatName) {
          case 'bold':
            return document.queryCommandState('bold');
          case 'italic':
            return document.queryCommandState('italic');
          case 'underline':
            return document.queryCommandState('underline');
          case 'strike':
            return document.queryCommandState('strikethrough');
          case 'bullet':
            return document.queryCommandState('insertUnorderedList');
          case 'number':
            return document.queryCommandState('insertOrderedList');
          case 'code':
            return CodeManager.isInInlineCode();
          case 'code-block':
            return false; // Code blocks are deprecated
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6': {
            const block = document.queryCommandValue('formatBlock');
            return block.toLowerCase() === formatName;
          }
          default:
            return false;
        }
      } catch {
        return false;
      }
    }, []);

    const updateActiveFormats = useCallback(() => {
      // Get selection without modifying it
      const selection = window.getSelection();

      // Call plugin selection change hooks
      pluginRegistry.onSelectionChange(selection);

      const formats = new Set<Format>();
      const allFormats: Format[] = [
        'bold', 'italic', 'underline', 'strike',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'bullet', 'number', 'code'
      ];

      allFormats.forEach(format => {
        if (isFormatActive(format)) {
          formats.add(format);
        }
      });

      setActiveFormats(formats);
    }, [isFormatActive]);

    const performUndo = useCallback(() => {
      const entry = historyRef.current?.undo();
      if (entry && editorRef.current) {
        isRestoringFromHistoryRef.current = true;
        const sanitizedHtml = sanitizer.sanitize(entry.html);
        editorRef.current.innerHTML = sanitizedHtml;
        lastHtmlRef.current = sanitizedHtml;
        onChange?.(sanitizedHtml);
        updateActiveFormats();
        isRestoringFromHistoryRef.current = false;
      }
    }, [onChange, updateActiveFormats]);

    const performRedo = useCallback(() => {
      const entry = historyRef.current?.redo();
      if (entry && editorRef.current) {
        isRestoringFromHistoryRef.current = true;
        const sanitizedHtml = sanitizer.sanitize(entry.html);
        editorRef.current.innerHTML = sanitizedHtml;
        lastHtmlRef.current = sanitizedHtml;
        onChange?.(sanitizedHtml);
        updateActiveFormats();
        isRestoringFromHistoryRef.current = false;
      }
    }, [onChange, updateActiveFormats]);

    // Assign to refs for use in format function
    performUndoRef.current = performUndo;
    performRedoRef.current = performRedo;

    const editorInstance: EditorInstance = useMemo(() => ({
      getHTML,
      setHTML,
      getText,
      getLength,
      getSelection,
      setSelection,
      format,
      removeFormat,
      execCommand,
      focus,
      blur,
      isFormatActive,
      registerPlugin,
      unregisterPlugin,
      getPlugin,
      executeCommand,
      undo: performUndo,
      redo: performRedo,
      canUndo: () => historyRef.current?.canUndo() ?? false,
      canRedo: () => historyRef.current?.canRedo() ?? false,
    }), [
      getHTML,
      setHTML,
      getText,
      getLength,
      getSelection,
      setSelection,
      format,
      removeFormat,
      execCommand,
      focus,
      blur,
      isFormatActive,
      registerPlugin,
      unregisterPlugin,
      getPlugin,
      executeCommand,
      performUndo,
      performRedo,
    ]);
    
    // Store the instance in ref for executeCommand
    editorInstanceRef.current = editorInstance;

    useImperativeHandle(ref, () => editorInstance, [editorInstance]);


    // Debounce onChange to improve performance
    const debouncedOnChange = useDebounce(
      (...args: unknown[]) => {
        const html = args[0] as string;
        onChange?.(html);
      },
      300
    );

    const handleInput = useCallback(() => {
      // Don't track input changes when we're restoring from history
      if (isRestoringFromHistoryRef.current) {
        return;
      }

      const html = getHTML();
      if (html !== lastHtmlRef.current) {
        const oldContent = lastHtmlRef.current;
        const sanitizedHtml = sanitizer.sanitize(html);

        // Call plugin beforeChange hooks
        const allowChange = pluginRegistry.beforeChange(oldContent, sanitizedHtml);
        if (!allowChange) {
          // Restore previous content if change is prevented
          setHTML(oldContent);
          return;
        }

        // If content was sanitized (changed), update the DOM
        if (sanitizedHtml !== html) {
          setHTML(sanitizedHtml);
        }

        lastHtmlRef.current = sanitizedHtml;

        // Push to history (Word-style: accumulates until break point)
        historyRef.current?.pushTyping(sanitizedHtml);

        debouncedOnChange?.(sanitizedHtml);
        // Note: Don't call updateActiveFormats() here - it's expensive and
        // typing doesn't change formats. The selectionchange event handles it.

        // Call plugin afterChange hooks
        pluginRegistry.afterChange(sanitizedHtml);
      }
    }, [getHTML, setHTML, debouncedOnChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      // Word-style undo: commit typing on break point keys
      // Break points: Enter, Backspace, Delete, Arrow keys
      const breakPointKeys = ['Enter', 'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (breakPointKeys.includes(e.key)) {
        historyRef.current?.commitTyping();
      }

      // Handle code block-specific keys first
      if (CodeManager.handleKeyInCodeBlock(e.nativeEvent)) {
        return;
      }

      // Handle table-specific navigation
      if (TableManager.isInTable()) {
        if (e.key === 'Tab' && TableManager.handleTabInTable(e.nativeEvent)) {
          return;
        }
        // Handle arrow keys for table navigation
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          if (TableManager.handleArrowKeyInTable(e.nativeEvent)) {
            return;
          }
        }
      } else {
        // Check if we should enter a table from outside
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          if (TableManager.handleArrowKeyToEnterTable(e.nativeEvent)) {
            return;
          }
        }
      }

      // Handle list-specific keys
      if (ListManager.isInList()) {
        switch (e.key) {
          case 'Tab':
            if (ListManager.handleTabInList(e.nativeEvent)) {
              return;
            }
            break;
          case 'Enter':
            if (ListManager.handleEnterInList(e.nativeEvent)) {
              return;
            }
            break;
          case 'Backspace':
            if (ListManager.handleBackspaceInList(e.nativeEvent)) {
              // List operation modified the DOM programmatically, so input event won't fire.
              // We need to manually push the new state to history.
              setTimeout(() => {
                const newHtml = getHTML();
                if (newHtml !== lastHtmlRef.current) {
                  lastHtmlRef.current = newHtml;
                  historyRef.current?.pushImmediate(newHtml);
                  onChange?.(newHtml);
                }
              }, 0);
              return;
            }
            break;
        }
      }

      // Handle formatting shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            format('bold');
            break;
          case 'i':
            e.preventDefault();
            format('italic');
            break;
          case 'u':
            e.preventDefault();
            format('underline');
            break;
          case 'k':
            e.preventDefault();
            if (handleLinkFormatRef.current) {
              handleLinkFormatRef.current();
            }
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              performRedoRef.current?.();
            } else {
              performUndoRef.current?.();
            }
            break;
          case 'y':
            // Windows redo shortcut (Ctrl+Y)
            e.preventDefault();
            performRedoRef.current?.();
            break;
        }
      }
    }, [format, getHTML, onChange]);

    const saveSelection = useCallback(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelection.current = selection.getRangeAt(0).cloneRange();
      }
    }, []);

    const restoreSelection = useCallback(() => {
      if (savedSelection.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedSelection.current);
        }
      }
    }, []);

    const handleLinkFormat = useCallback(() => {
      saveSelection();
      
      // Check if we're editing an existing link
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const linkElement = getParentLink(range.commonAncestorContainer);
        
        if (linkElement) {
          setSelectedLinkData({
            url: linkElement.href,
            text: linkElement.textContent || '',
            target: linkElement.target as '_blank' | '_self',
          });
        } else {
          setSelectedLinkData({
            url: '',
            text: selection.toString(),
          });
        }
      }
      
      setLinkDialogOpen(true);
    }, [saveSelection]);

    // Assign to ref for use in format function
    handleLinkFormatRef.current = handleLinkFormat;

    const handleLinkSubmit = useCallback((data: LinkData) => {
      restoreSelection();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const linkElement = getParentLink(range.commonAncestorContainer);
        
        if (linkElement) {
          // Update existing link
          linkElement.href = data.url;
          if (data.target === '_blank') {
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
          } else {
            linkElement.removeAttribute('target');
            linkElement.removeAttribute('rel');
          }
          if (data.text && data.text !== linkElement.textContent) {
            linkElement.textContent = data.text;
          }
        } else {
          // Create new link
          const link = document.createElement('a');
          link.href = data.url;
          if (data.target === '_blank') {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
          }
          
          if (range.toString()) {
            link.appendChild(range.extractContents());
          } else {
            link.textContent = data.text || data.url;
          }
          
          range.insertNode(link);
        }
      }
      
      setLinkDialogOpen(false);
      editorRef.current?.focus();
      updateActiveFormats();
      const html = getHTML();
      if (html !== lastHtmlRef.current) {
        lastHtmlRef.current = html;
        onChange?.(html);
      }
    }, [restoreSelection, updateActiveFormats, getHTML, onChange]);


    const handleLinkRemove = useCallback(() => {
      restoreSelection();
      execCommand('unlink');
      setLinkDialogOpen(false);
      editorRef.current?.focus();
    }, [restoreSelection, execCommand]);

    const getParentLink = (node: Node): HTMLAnchorElement | null => {
      let current: Node | null = node;
      while (current && current !== editorRef.current) {
        if (current.nodeType === Node.ELEMENT_NODE && (current as HTMLElement).tagName === 'A') {
          return current as HTMLAnchorElement;
        }
        current = current.parentNode;
      }
      return null;
    };

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
      // Check if right-click is on a table cell
      const target = e.target as HTMLElement;
      let node: HTMLElement | null = target;
      
      while (node) {
        if (node.tagName === 'TD' || node.tagName === 'TH') {
          e.preventDefault();
          setContextMenuPosition({ x: e.clientX, y: e.clientY });
          setContextMenuOpen(true);
          return;
        }
        node = node.parentElement;
      }
    }, []);

    const handleCopy = useCallback((e: React.ClipboardEvent) => {
      // Handle copy from code blocks specially
      CodeManager.handleCopyFromCodeBlock(e.nativeEvent);
    }, []);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
      // Word-style undo: commit typing before paste (paste is a break point)
      historyRef.current?.commitTyping();

      // Handle paste in code blocks specially
      if (CodeManager.handlePasteInCodeBlock(e.nativeEvent)) {
        return;
      }

      e.preventDefault();

      // Try to get HTML content first
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      
      let content = '';
      if (html) {
        // Sanitize pasted HTML more strictly
        content = sanitizer.sanitizeForPaste(html);
      } else if (text) {
        // Convert plain text to HTML
        content = text
          .split('\n')
          .map(line => `<p>${HTMLSanitizer.escapeHtml(line)}</p>`)
          .join('');
      }
      
      if (content) {
        execCommand('insertHTML', content);
        updateActiveFormats();
      }
    }, [execCommand, updateActiveFormats]);

    const handleSelectionChange = useCallback(() => {
      if (editorRef.current?.contains(document.activeElement)) {
        updateActiveFormats();
      }
    }, [updateActiveFormats]);

    // Word-style undo: commit typing when user clicks (mouse selection change)
    const handleMouseDown = useCallback(() => {
      historyRef.current?.commitTyping();
    }, []);

    useEffect(() => {
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }, [handleSelectionChange]);

    // Initialize HistoryManager
    useEffect(() => {
      historyRef.current = new HistoryManager(
        editorRef,
        () => {
          setCanUndo(historyRef.current?.canUndo() ?? false);
          setCanRedo(historyRef.current?.canRedo() ?? false);
        }
      );

      // Push initial state to history
      const initialHtml = editorRef.current?.innerHTML || '';
      if (initialHtml) {
        historyRef.current.pushImmediate(initialHtml);
      }

      return () => {
        historyRef.current?.destroy();
      };
    }, []);

    useEffect(() => {
      if (isControlled && value !== undefined && value !== lastHtmlRef.current) {
        setHTML(value);
      }
    }, [value, isControlled, setHTML]);

    useEffect(() => {
      if (defaultValue && !isControlled) {
        setHTML(defaultValue);
      }
    }, [defaultValue, isControlled, setHTML]);

    // Track if plugins have been initialized to prevent double initialization
    const pluginsInitializedRef = useRef(false);
    
    // Handle plugins prop - register plugins but don't initialize yet
    useEffect(() => {
      if (plugins.length > 0) {
        plugins.forEach(plugin => {
          if (!pluginRegistry.isRegistered(plugin.name)) {
            pluginRegistry.register(plugin);
          }
          if (!pluginRegistry.isEnabled(plugin.name)) {
            pluginRegistry.enable(plugin.name);
          }
        });
      }
      
      return () => {
        // Only clean up if plugins were actually initialized by this instance
        if (pluginsInitializedRef.current && plugins.length > 0) {
          plugins.forEach(plugin => {
            pluginRegistry.disable(plugin.name);
          });
          pluginsInitializedRef.current = false;
        }
      };
    }, [plugins]);

    useEffect(() => {
      // Initialize plugins when editor is ready
      if (plugins.length > 0 && !pluginsInitializedRef.current) {
        pluginRegistry.initializeAll(editorInstance).then(() => {
          pluginsInitializedRef.current = true;
        }).catch(console.error);
      }
      
      onReady?.();
    }, [onReady, plugins, editorInstance]);

    return (
      <>
        <div className={`${styles.container} ${className}`} style={style}>
          {toolbar !== false && (
            <Toolbar
              config={toolbar}
              activeFormats={activeFormats}
              onFormat={format}
              editorInstance={editorInstance}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          )}
          <div
            ref={editorRef}
            className={`${styles.editor} ${readOnly ? styles.readOnly : ''}`}
            contentEditable={!readOnly}
            data-placeholder={placeholder}
            role="textbox"
            aria-label="Rich text editor"
            aria-multiline="true"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onContextMenu={handleContextMenu}
            onFocus={onFocus}
            onBlur={onBlur}
            suppressContentEditableWarning
          />
        </div>
        <LinkDialog
          isOpen={linkDialogOpen}
          initialData={selectedLinkData}
          onClose={() => setLinkDialogOpen(false)}
          onSubmit={handleLinkSubmit}
          onRemove={selectedLinkData?.url ? handleLinkRemove : undefined}
        />
        <TableContextMenu
          isOpen={contextMenuOpen}
          position={contextMenuPosition}
          onClose={() => setContextMenuOpen(false)}
        />
      </>
    );
  }
);

Editor.displayName = 'MMEditor';