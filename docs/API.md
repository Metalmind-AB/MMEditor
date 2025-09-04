# MMEditor API Documentation

Comprehensive API reference for MMEditor internal integration.

## Table of Contents

1. [Core Components](#core-components)
2. [Editor Props](#editor-props)
3. [Editor Instance Methods](#editor-instance-methods)
4. [Plugin System](#plugin-system)
5. [Types & Interfaces](#types--interfaces)
6. [Utility Functions](#utility-functions)
7. [Examples](#examples)

## Core Components

### Editor

The main editor component that provides rich text editing functionality.

```tsx
import { Editor, EditorInstance } from '@mmeditor/core';
import '@mmeditor/core/style.css';

function MyApp() {
  const editorRef = useRef<EditorInstance>(null);
  
  return (
    <Editor
      ref={editorRef}
      placeholder="Start typing..."
      onChange={(html) => console.log(html)}
    />
  );
}
```

## Editor Props

### Basic Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Controlled mode - current HTML content |
| `defaultValue` | `string` | `""` | Uncontrolled mode - initial HTML content |
| `onChange` | `(html: string) => void` | `undefined` | Content change callback |
| `placeholder` | `string` | `"Start typing..."` | Placeholder text when empty |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `className` | `string` | `""` | Additional CSS class |
| `style` | `CSSProperties` | `{}` | Inline styles |

### Advanced Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Editor theme |
| `toolbar` | `ToolbarConfig \| false` | `defaultToolbarConfig` | Toolbar configuration |
| `formats` | `Format[]` | `undefined` | Allowed formats (whitelist) |
| `plugins` | `Plugin[]` | `[]` | Registered plugins |

### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onFocus` | `() => void` | Called when editor gains focus |
| `onBlur` | `() => void` | Called when editor loses focus |
| `onReady` | `() => void` | Called when editor is initialized |

### Complete Props Interface

```tsx
interface MMEditorProps {
  // Content control
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  
  // Basic configuration
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: CSSProperties;
  
  // Advanced configuration
  theme?: 'light' | 'dark' | 'auto';
  toolbar?: ToolbarConfig | false;
  formats?: Format[];
  plugins?: Plugin[];
  
  // Event handlers
  onFocus?: () => void;
  onBlur?: () => void;
  onReady?: () => void;
}
```

## Editor Instance Methods

Access editor methods via ref:

```tsx
const editorRef = useRef<EditorInstance>(null);

// Get methods
const html = editorRef.current?.getHTML();
const text = editorRef.current?.getText();
```

### Content Methods

#### `getHTML(): string`
Returns the current editor content as HTML.

```tsx
const content = editor.getHTML();
console.log(content); // "<p><strong>Bold text</strong></p>"
```

#### `setHTML(html: string): void`
Sets the editor content from HTML string.

```tsx
editor.setHTML("<p>Hello <em>world</em></p>");
```

#### `getText(): string`
Returns plain text content (HTML stripped).

```tsx
const plainText = editor.getText(); // "Bold text"
```

#### `getLength(): number`
Returns character count of text content.

```tsx
const length = editor.getLength(); // 9
```

### Selection Methods

#### `getSelection(): SelectionRange | null`
Returns current selection range.

```tsx
const selection = editor.getSelection();
if (selection) {
  console.log(`Selected ${selection.length} chars at ${selection.index}`);
}
```

#### `setSelection(range: SelectionRange): void`
Sets the selection to specified range.

```tsx
editor.setSelection({ index: 0, length: 5 }); // Select first 5 chars
```

### Formatting Methods

#### `format(name: string, value?: any): void`
Applies formatting to current selection.

```tsx
editor.format('bold');           // Toggle bold
editor.format('h1');             // Convert to heading 1
editor.format('link', 'https://example.com'); // Add link
```

#### `removeFormat(range?: SelectionRange): void`
Removes formatting from selection or specified range.

```tsx
editor.removeFormat();                    // Remove from selection
editor.removeFormat({ index: 0, length: 10 }); // Remove from range
```

#### `isFormatActive(format: Format): boolean`
Checks if format is active in current selection.

```tsx
const isBold = editor.isFormatActive('bold');
const isHeading = editor.isFormatActive('h1');
```

### Command Methods

#### `execCommand(name: string, ...args: any[]): void`
Executes built-in editor command.

```tsx
editor.execCommand('undo');
editor.execCommand('redo');
editor.execCommand('selectAll');
```

#### `executeCommand(commandName: string, ...args: any[]): void`
Executes plugin-registered command.

```tsx
editor.executeCommand('insertEmoji', '😊');
editor.executeCommand('insertTable', 3, 3);
```

### Focus Methods

#### `focus(): void`
Gives focus to the editor.

```tsx
editor.focus();
```

#### `blur(): void`
Removes focus from the editor.

```tsx
editor.blur();
```

### Plugin Methods

#### `registerPlugin(plugin: Plugin): void`
Registers a plugin with the editor.

```tsx
editor.registerPlugin(myCustomPlugin);
```

#### `unregisterPlugin(pluginName: string): void`
Unregisters a plugin by name.

```tsx
editor.unregisterPlugin('emoji-plugin');
```

#### `getPlugin(pluginName: string): Plugin | undefined`
Gets registered plugin by name.

```tsx
const plugin = editor.getPlugin('emoji-plugin');
```

## Plugin System

### Plugin Interface

```tsx
interface Plugin {
  // Metadata
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  
  // Lifecycle
  onInit?: (editor: EditorInstance) => void;
  onDestroy?: () => void;
  beforeChange?: (editor: EditorInstance, oldContent: string, newContent: string) => boolean | void;
  afterChange?: (editor: EditorInstance, content: string) => void;
  onSelectionChange?: (editor: EditorInstance, selection: Selection | null) => void;
  
  // Extensions
  toolbarItems?: PluginToolbarItem[];
  iconOverrides?: IconOverride[];
  formats?: PluginFormatDefinition[];
  commands?: PluginCommand[];
  events?: PluginEventHandler[];
  
  // Configuration
  config?: Record<string, any>;
  enabled?: boolean;
}
```

### Creating a Plugin

```tsx
import { Plugin, EditorInstance } from '@mmeditor/core';

export const MyPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',
  
  onInit(editor: EditorInstance) {
    console.log('Plugin initialized');
  },
  
  onDestroy() {
    console.log('Plugin destroyed');
  },
  
  commands: [
    {
      name: 'myCommand',
      execute: (editor, ...args) => {
        // Command implementation
        console.log('Executing custom command');
      },
      shortcut: 'Ctrl+Shift+M'
    }
  ],
  
  toolbarItems: [
    {
      name: 'my-button',
      icon: '🎨',
      tooltip: 'My Custom Tool',
      action: (editor) => {
        editor.executeCommand('myCommand');
      },
      isActive: (editor) => {
        return editor.isFormatActive('someFormat');
      }
    }
  ],
  
  formats: [
    {
      name: 'highlight',
      tag: 'mark',
      className: 'highlight',
      apply: (editor, value) => {
        // Apply highlight format
      },
      remove: (editor) => {
        // Remove highlight format
      },
      isActive: (editor) => {
        // Check if highlight is active
        return false;
      }
    }
  ]
};
```

### Using Plugins

```tsx
import { Editor } from '@mmeditor/core';
import { MyPlugin } from './plugins/MyPlugin';

function App() {
  return (
    <Editor 
      plugins={[MyPlugin]}
      onReady={() => console.log('Editor ready with plugins')}
    />
  );
}
```

## Types & Interfaces

### Format Types

```tsx
type Format = 
  | 'bold' | 'italic' | 'underline' | 'strike'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'bullet' | 'number'
  | 'code' | 'code-block'
  | 'link' | 'table'
  | 'clear';
```

### Selection Range

```tsx
interface SelectionRange {
  index: number;    // Start position
  length: number;   // Selection length
}
```

### Toolbar Configuration

```tsx
interface ToolbarConfig {
  groups?: ToolbarGroup[];
  customButtons?: CustomButton[];
}

interface ToolbarGroup {
  name: string;
  items: Format[];
}

interface CustomButton {
  name: string;
  icon: ReactNode;
  action: (editor: EditorInstance) => void;
  isActive?: (editor: EditorInstance) => boolean;
}
```

### Plugin Types

#### PluginToolbarItem
```tsx
interface PluginToolbarItem {
  name: string;
  icon: string | React.ReactNode;
  tooltip?: string;
  action: (editor: EditorInstance) => void;
  isActive?: (editor: EditorInstance) => boolean;
  position?: 'start' | 'end' | number;
  group?: string;
}
```

#### PluginCommand
```tsx
interface PluginCommand {
  name: string;
  execute: (editor: EditorInstance, ...args: any[]) => void;
  canExecute?: (editor: EditorInstance) => boolean;
  shortcut?: string;
}
```

#### PluginFormatDefinition
```tsx
interface PluginFormatDefinition {
  name: string;
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
  apply: (editor: EditorInstance, value?: any) => void;
  remove: (editor: EditorInstance) => void;
  isActive: (editor: EditorInstance) => boolean;
}
```

## Utility Functions

### Sanitizer

```tsx
import { sanitizer } from '@mmeditor/core';

// Sanitize HTML content
const cleanHTML = sanitizer.sanitize(userInput);

// Configure allowed tags
sanitizer.configure({
  allowedTags: ['p', 'strong', 'em'],
  allowedAttributes: {
    'a': ['href'],
    'img': ['src', 'alt']
  }
});
```

### Selection Utils

```tsx
import { selectionUtils } from '@mmeditor/core';

// Get current browser selection
const selection = selectionUtils.getSelection();

// Create range from indices
const range = selectionUtils.createRange(0, 10);

// Normalize selection across elements
const normalized = selectionUtils.normalize(selection);
```

## Examples

### Basic Usage

```tsx
import React, { useRef, useState } from 'react';
import { Editor, EditorInstance } from '@mmeditor/core';
import '@mmeditor/core/style.css';

function SimpleEditor() {
  const editorRef = useRef<EditorInstance>(null);
  const [content, setContent] = useState('');

  const handleSave = () => {
    const html = editorRef.current?.getHTML();
    if (html) {
      console.log('Saved:', html);
      // Send to server
    }
  };

  return (
    <div>
      <Editor
        ref={editorRef}
        placeholder="Write something amazing..."
        onChange={setContent}
        onReady={() => console.log('Editor ready!')}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### Controlled Mode

```tsx
import React, { useState } from 'react';
import { Editor } from '@mmeditor/core';

function ControlledEditor() {
  const [content, setContent] = useState('<p>Initial content</p>');

  return (
    <div>
      <Editor
        value={content}
        onChange={setContent}
      />
      <div>
        <button onClick={() => setContent('<p>Reset content</p>')}>
          Reset
        </button>
        <button onClick={() => setContent('')}>
          Clear
        </button>
      </div>
    </div>
  );
}
```

### Custom Toolbar

```tsx
import React from 'react';
import { Editor, ToolbarConfig } from '@mmeditor/core';

const customToolbar: ToolbarConfig = {
  groups: [
    { name: 'basic', items: ['bold', 'italic'] },
    { name: 'headings', items: ['h1', 'h2'] },
    { name: 'lists', items: ['bullet', 'number'] }
  ],
  customButtons: [
    {
      name: 'save',
      icon: '💾',
      action: (editor) => {
        const content = editor.getHTML();
        localStorage.setItem('content', content);
      }
    }
  ]
};

function CustomToolbarEditor() {
  return (
    <Editor 
      toolbar={customToolbar}
      placeholder="Custom toolbar example"
    />
  );
}
```

### With Plugins

```tsx
import React from 'react';
import { Editor, Plugin } from '@mmeditor/core';

// Custom emoji plugin
const EmojiPlugin: Plugin = {
  name: 'emoji',
  version: '1.0.0',
  
  commands: [
    {
      name: 'insertEmoji',
      execute: (editor, emoji) => {
        const selection = editor.getSelection();
        if (selection) {
          // Insert emoji at cursor
          editor.format('insertText', emoji);
        }
      }
    }
  ],
  
  toolbarItems: [
    {
      name: 'emoji',
      icon: '😊',
      tooltip: 'Insert Emoji',
      action: (editor) => {
        editor.executeCommand('insertEmoji', '😊');
      }
    }
  ]
};

function PluginEditor() {
  return (
    <Editor 
      plugins={[EmojiPlugin]}
      placeholder="Editor with emoji plugin"
    />
  );
}
```

### Integration with Forms

```tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Editor } from '@mmeditor/core';

interface FormData {
  title: string;
  content: string;
}

function FormEditor() {
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    // Submit to server
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Title</label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input {...field} />
          )}
        />
      </div>
      
      <div>
        <label>Content</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Editor
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter content..."
            />
          )}
        />
      </div>
      
      <button type="submit">Save Article</button>
    </form>
  );
}
```

---

**MMEditor API Documentation** - Complete reference for internal development integration.