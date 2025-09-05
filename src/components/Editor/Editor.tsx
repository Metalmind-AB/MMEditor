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
import { useDebounce } from '../../hooks/useDebounce';
import { pluginRegistry } from '../../plugins/PluginRegistry';
import styles from './Editor.module.css';

const defaultToolbarConfig = {
  groups: [
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
    
    const format = useCallback((formatName: string, _value?: unknown): void => {
      switch (formatName) {
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
          break;
        case 'clear':
          // Deprecated - but kept for backwards compatibility
          execCommand('removeFormat');
          execCommand('formatBlock', '<p>');
          break;
        default:
          break;
      }
    }, [execCommand]);

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
        debouncedOnChange?.(sanitizedHtml);
        updateActiveFormats();
        
        // Call plugin afterChange hooks
        pluginRegistry.afterChange(sanitizedHtml);
      }
    }, [getHTML, setHTML, debouncedOnChange, updateActiveFormats]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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
            if (e.shiftKey) {
              e.preventDefault();
              // TODO: Implement redo
            } else {
              e.preventDefault();
              // TODO: Implement undo
            }
            break;
        }
      }
    }, [format]);

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

    useEffect(() => {
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }, [handleSelectionChange]);

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