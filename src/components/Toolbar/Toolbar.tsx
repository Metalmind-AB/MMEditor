import React, { useState, useEffect, useRef } from 'react';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { Dropdown, DropdownOption } from '../Dropdown/Dropdown';
import { TablePicker } from '../TablePicker/TablePicker';
import { Format, ToolbarConfig, EditorInstance } from '../Editor/Editor.types';
import { pluginRegistry } from '../../plugins/PluginRegistry';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  config: ToolbarConfig;
  activeFormats: Set<Format>;
  onFormat: (format: Format, value?: unknown) => void;
  editorInstance: EditorInstance;
}

const formatIcons: Record<Format, string> = {
  bold: 'B',
  italic: 'I',
  underline: 'U',
  strike: 'S',
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  h4: 'H4',
  h5: 'H5',
  h6: 'H6',
  bullet: '•',
  number: '1.',
  code: '</>',
  'code-block': '[ ]', // Deprecated
  link: '🔗',
  table: '⊞',
  clear: '✕', // Deprecated
};

const formatTooltips: Record<Format, string> = {
  bold: 'Bold (Ctrl+B)',
  italic: 'Italic (Ctrl+I)',
  underline: 'Underline (Ctrl+U)',
  strike: 'Strikethrough',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  bullet: 'Bullet List',
  number: 'Numbered List',
  code: 'Code',
  'code-block': 'Code Block (Deprecated)', 
  link: 'Insert Link (Ctrl+K)',
  table: 'Insert Table',
  clear: 'Clear Formatting (Deprecated)',
};

const headingOptions: DropdownOption[] = [
  { value: 'p', label: 'Normal' },
  { value: 'h1', label: 'Heading 1', className: 'heading1' },
  { value: 'h2', label: 'Heading 2', className: 'heading2' },
  { value: 'h3', label: 'Heading 3', className: 'heading3' },
  { value: 'h4', label: 'Heading 4', className: 'heading4' },
  { value: 'h5', label: 'Heading 5', className: 'heading5' },
  { value: 'h6', label: 'Heading 6', className: 'heading6' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  config,
  activeFormats,
  onFormat,
  editorInstance,
}) => {
  const [currentBlockFormat, setCurrentBlockFormat] = useState<string>('p');
  const [showTablePicker, setShowTablePicker] = useState(false);
  const tableButtonRef = useRef<HTMLDivElement>(null);
  const [pluginToolbarItems, setPluginToolbarItems] = useState<unknown[]>([]);
  const [iconOverrides, setIconOverrides] = useState<Map<string, React.ReactNode>>(new Map());
  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    // Update current block format based on active formats
    const headingFormats = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as Format[];
    const activeHeading = headingFormats.find(h => activeFormats.has(h));
    setCurrentBlockFormat(activeHeading || 'p');
  }, [activeFormats]);

  useEffect(() => {
    // Function to update plugin items
    const updatePluginItems = () => {
      const items = pluginRegistry.getToolbarItems();
      const overrides = pluginRegistry.getIconOverrides();
      setPluginToolbarItems(items);
      setIconOverrides(overrides);
    };
    
    // Initial load
    updatePluginItems();
    
    // Listen for plugin changes
    pluginRegistry.addChangeListener(updatePluginItems);
    
    return () => {
      pluginRegistry.removeChangeListener(updatePluginItems);
    };
  }, []);

  const handleHeadingChange = (value: string) => {
    if (value === 'p') {
      editorInstance.execCommand('formatBlock', '<p>');
    } else {
      onFormat(value as Format);
    }
  };

  return (
    <div className={styles.toolbar}>
      {config.groups?.map((group) => {
        // Special handling for heading group
        if (group.name === 'heading') {
          return (
            <div key={group.name} className={styles.group}>
              <Dropdown
                options={headingOptions}
                value={currentBlockFormat}
                placeholder="Paragraph"
                onChange={handleHeadingChange}
              />
            </div>
          );
        }

        // Regular button groups
        return (
          <div key={group.name} className={styles.group}>
            {group.items.map((format) => {
              if (format === 'table') {
                return (
                  <div key={format} className={styles.tableButtonWrapper} ref={tableButtonRef}>
                    <ToolbarButton
                      format={format}
                      icon={iconOverrides.get(format) || formatIcons[format]}
                      tooltip={formatTooltips[format]}
                      isActive={false}
                      onClick={() => {
                        // Save the current selection before showing the picker
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
                        }
                        setShowTablePicker(!showTablePicker);
                      }}
                    />
                    {showTablePicker && (
                      <TablePicker
                        onSelect={(rows, cols) => {
                          // Restore the selection before inserting
                          if (savedSelectionRef.current) {
                            const selection = window.getSelection();
                            if (selection) {
                              selection.removeAllRanges();
                              selection.addRange(savedSelectionRef.current);
                            }
                          }
                          insertTable(rows, cols, editorInstance);
                          setShowTablePicker(false);
                          savedSelectionRef.current = null;
                        }}
                        onClose={() => {
                          setShowTablePicker(false);
                          savedSelectionRef.current = null;
                        }}
                      />
                    )}
                  </div>
                );
              }
              return (
                <ToolbarButton
                  key={format}
                  format={format}
                  icon={iconOverrides.get(format) || formatIcons[format]}
                  tooltip={formatTooltips[format]}
                  isActive={activeFormats.has(format)}
                  onClick={() => onFormat(format)}
                />
              );
            })}
          </div>
        );
      })}
      {config.customButtons?.map((button) => (
        <ToolbarButton
          key={button.name}
          format={button.name as Format}
          icon={button.icon}
          tooltip={button.name}
          isActive={button.isActive?.(editorInstance) || false}
          onClick={() => button.action(editorInstance)}
        />
      ))}
      {/* Plugin toolbar items */}
      {pluginToolbarItems.length > 0 && (
        <div className={styles.group}>
          {pluginToolbarItems.map((item, index) => (
            <ToolbarButton
              key={`plugin-${item.name}-${index}`}
              format={item.name as Format}
              icon={item.icon}
              tooltip={item.tooltip || item.name}
              isActive={item.isActive?.(editorInstance) || false}
              onClick={() => item.action(editorInstance)}
              dataAttributes={{
                'data-plugin': item.pluginName || 'unknown',
                'data-group': item.group || 'plugin'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function insertTable(rows: number, cols: number, editor: EditorInstance) {
  // Build the table HTML
  let html = '<table><tbody>';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      html += r === 0 ? '<th>&nbsp;</th>' : '<td>&nbsp;</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  
  // Add a paragraph after the table for continued editing
  html += '<p>&nbsp;</p>';
  
  // Insert the table at the current cursor position
  editor.execCommand('insertHTML', html);
}