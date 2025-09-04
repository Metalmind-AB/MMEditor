# MMEditor Plugin Development Guide

## Overview

MMEditor provides a powerful plugin system that allows developers to extend the editor's functionality without modifying the core code. Plugins can add new toolbar buttons, formats, commands, and respond to editor events.

## Quick Start

### Creating Your First Plugin

```typescript
import { Plugin, EditorInstance } from '@mmeditor/core';

export class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  description = 'My awesome plugin';
  
  // Add a toolbar button
  toolbarItems = [{
    name: 'my-button',
    icon: '✨',
    tooltip: 'My Custom Action',
    action: (editor: EditorInstance) => {
      editor.execCommand('insertText', 'Hello from plugin!');
    }
  }];
  
  // Initialize plugin
  async onInit(editor: EditorInstance) {
    console.log('Plugin initialized!');
  }
  
  // Cleanup
  async onDestroy() {
    console.log('Plugin destroyed!');
  }
}
```

### Using the Plugin

```jsx
import { MMEditor } from '@mmeditor/core';
import { MyPlugin } from './MyPlugin';

function App() {
  const myPlugin = new MyPlugin();
  
  return (
    <MMEditor
      plugins={[myPlugin]}
      onChange={handleChange}
    />
  );
}
```

## Plugin Architecture

### Plugin Interface

Every plugin must implement the `Plugin` interface:

```typescript
interface Plugin {
  // Required metadata
  name: string;
  version: string;
  
  // Optional metadata
  description?: string;
  author?: string;
  dependencies?: string[];
  
  // Lifecycle hooks
  onInit?: (editor: EditorInstance) => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
  beforeChange?: (editor: EditorInstance, oldContent: string, newContent: string) => boolean | void;
  afterChange?: (editor: EditorInstance, content: string) => void;
  onSelectionChange?: (editor: EditorInstance, selection: Selection | null) => void;
  
  // Extensions
  toolbarItems?: PluginToolbarItem[];
  formats?: PluginFormatDefinition[];
  commands?: PluginCommand[];
  events?: PluginEventHandler[];
}
```

### Lifecycle Hooks

#### `onInit(editor: EditorInstance)`
Called when the plugin is initialized. Use this to set up your plugin's state, register event listeners, or perform initial configuration.

```typescript
async onInit(editor: EditorInstance) {
  // Store editor reference
  this.editor = editor;
  
  // Set up initial state
  await this.loadConfiguration();
  
  // Register global listeners
  document.addEventListener('keydown', this.handleGlobalKeydown);
}
```

#### `onDestroy()`
Called when the plugin is being destroyed. Clean up resources, remove event listeners, and perform any necessary teardown.

```typescript
async onDestroy() {
  // Clean up listeners
  document.removeEventListener('keydown', this.handleGlobalKeydown);
  
  // Save state if needed
  await this.saveState();
  
  // Clear references
  this.editor = null;
}
```

#### `beforeChange(editor, oldContent, newContent)`
Called before content changes. Return `false` to prevent the change.

```typescript
beforeChange(editor: EditorInstance, oldContent: string, newContent: string) {
  // Validate content
  if (this.containsForbiddenContent(newContent)) {
    alert('This content is not allowed!');
    return false; // Prevent change
  }
  
  // Log changes
  console.log('Content changing from', oldContent, 'to', newContent);
}
```

#### `afterChange(editor, content)`
Called after content changes. Use for tracking, auto-save, or updating UI.

```typescript
afterChange(editor: EditorInstance, content: string) {
  // Auto-save
  this.autoSave(content);
  
  // Update word count
  this.updateWordCount(content);
  
  // Track changes
  this.trackChange(content);
}
```

#### `onSelectionChange(editor, selection)`
Called when text selection changes.

```typescript
onSelectionChange(editor: EditorInstance, selection: Selection | null) {
  if (selection && !selection.isCollapsed) {
    // Show formatting toolbar
    this.showFormattingPopup(selection);
  } else {
    // Hide formatting toolbar
    this.hideFormattingPopup();
  }
}
```

## Extending the Toolbar

### Adding Toolbar Buttons

```typescript
toolbarItems = [
  {
    name: 'highlight',
    icon: '🖍️', // Can be string or React component
    tooltip: 'Highlight Text',
    action: (editor: EditorInstance) => {
      editor.execCommand('hiliteColor', 'yellow');
    },
    isActive: (editor: EditorInstance) => {
      // Return true when format is active
      return document.queryCommandState('hiliteColor');
    },
    position: 'end', // 'start', 'end', or specific index
    group: 'formatting' // Optional grouping
  }
];
```

### Custom Icons

```typescript
import { ReactComponent as CustomIcon } from './icon.svg';

toolbarItems = [
  {
    name: 'custom',
    icon: <CustomIcon />,
    tooltip: 'Custom Action',
    action: (editor) => {
      // Custom action
    }
  }
];
```

## Adding Custom Commands

### Registering Commands

```typescript
commands = [
  {
    name: 'insertTimestamp',
    execute: (editor: EditorInstance) => {
      const timestamp = new Date().toLocaleString();
      editor.execCommand('insertText', timestamp);
    },
    canExecute: (editor: EditorInstance) => {
      // Check if command can be executed
      return !editor.readOnly;
    },
    shortcut: 'Ctrl+Shift+D' // Optional keyboard shortcut
  }
];
```

### Using Commands

```typescript
// From within plugin
editor.executeCommand('insertTimestamp');

// From outside
editorRef.current?.executeCommand('insertTimestamp');
```

## Custom Formats

### Defining Custom Formats

```typescript
formats = [
  {
    name: 'highlight',
    className: 'text-highlight',
    style: { backgroundColor: 'yellow' },
    apply: (editor: EditorInstance, color?: string) => {
      editor.execCommand('hiliteColor', color || 'yellow');
    },
    remove: (editor: EditorInstance) => {
      editor.execCommand('hiliteColor', 'transparent');
    },
    isActive: (editor: EditorInstance) => {
      return document.queryCommandState('hiliteColor');
    }
  }
];
```

## Event Handling

### Registering Event Handlers

```typescript
events = [
  {
    event: 'keydown',
    handler: (editor: EditorInstance, event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.shiftKey) {
        // Custom behavior for Shift+Enter
        event.preventDefault();
        editor.execCommand('insertHTML', '<br>');
        return false; // Prevent default
      }
    },
    priority: 10 // Higher priority runs first
  },
  {
    event: 'paste',
    handler: (editor: EditorInstance, event: ClipboardEvent) => {
      // Custom paste handling
      const text = event.clipboardData?.getData('text/plain');
      if (text?.includes('secret')) {
        event.preventDefault();
        alert('Cannot paste sensitive content!');
        return false;
      }
    }
  }
];
```

## Advanced Examples

### Word Count Plugin

```typescript
export class WordCountPlugin implements Plugin {
  name = 'word-count';
  version = '1.0.0';
  private countElement: HTMLElement | null = null;
  
  async onInit(editor: EditorInstance) {
    // Create word count display
    this.countElement = document.createElement('div');
    this.countElement.className = 'word-count';
    document.querySelector('.editor-footer')?.appendChild(this.countElement);
    
    // Initial count
    this.updateCount(editor.getText());
  }
  
  afterChange(editor: EditorInstance) {
    this.updateCount(editor.getText());
  }
  
  private updateCount(text: string) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    if (this.countElement) {
      this.countElement.textContent = `Words: ${words.length}`;
    }
  }
  
  async onDestroy() {
    this.countElement?.remove();
    this.countElement = null;
  }
}
```

### Auto-Save Plugin

```typescript
export class AutoSavePlugin implements Plugin {
  name = 'auto-save';
  version = '1.0.0';
  private saveTimer: NodeJS.Timeout | null = null;
  private saveInterval = 5000; // 5 seconds
  
  afterChange(editor: EditorInstance, content: string) {
    // Clear existing timer
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    // Set new timer
    this.saveTimer = setTimeout(() => {
      this.save(content);
    }, this.saveInterval);
  }
  
  private async save(content: string) {
    try {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Auto-saved at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }
  
  async onDestroy() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
  }
}
```

### Mention Plugin

```typescript
export class MentionPlugin implements Plugin {
  name = 'mentions';
  version = '1.0.0';
  private suggestionBox: HTMLElement | null = null;
  
  onSelectionChange(editor: EditorInstance, selection: Selection | null) {
    if (!selection) return;
    
    const text = selection.anchorNode?.textContent || '';
    const cursorPos = selection.anchorOffset;
    
    // Check for @ symbol
    const beforeCursor = text.slice(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const searchTerm = mentionMatch[1];
      this.showSuggestions(searchTerm, selection);
    } else {
      this.hideSuggestions();
    }
  }
  
  private showSuggestions(searchTerm: string, selection: Selection) {
    // Get users matching search term
    const users = this.searchUsers(searchTerm);
    
    // Show suggestion box
    if (!this.suggestionBox) {
      this.suggestionBox = document.createElement('div');
      this.suggestionBox.className = 'mention-suggestions';
      document.body.appendChild(this.suggestionBox);
    }
    
    // Position near cursor
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    this.suggestionBox.style.left = `${rect.left}px`;
    this.suggestionBox.style.top = `${rect.bottom + 5}px`;
    
    // Populate suggestions
    this.suggestionBox.innerHTML = users
      .map(user => `<div class="mention-item" data-user="${user.id}">${user.name}</div>`)
      .join('');
  }
  
  private hideSuggestions() {
    if (this.suggestionBox) {
      this.suggestionBox.remove();
      this.suggestionBox = null;
    }
  }
  
  private searchUsers(term: string) {
    // Mock user search
    const users = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' },
      { id: '3', name: 'Bob Johnson' }
    ];
    
    return users.filter(user => 
      user.name.toLowerCase().includes(term.toLowerCase())
    );
  }
}
```

## Best Practices

### 1. Clean Up Resources
Always clean up event listeners, timers, and DOM elements in `onDestroy()`.

### 2. Handle Errors Gracefully
Wrap operations in try-catch blocks to prevent plugin errors from breaking the editor.

```typescript
async onInit(editor: EditorInstance) {
  try {
    await this.loadConfiguration();
  } catch (error) {
    console.error(`${this.name} plugin initialization failed:`, error);
    // Graceful degradation
  }
}
```

### 3. Check Dependencies
If your plugin depends on other plugins, check they're loaded:

```typescript
dependencies = ['emoji', 'mentions'];

async onInit(editor: EditorInstance) {
  // Check dependencies
  for (const dep of this.dependencies || []) {
    if (!editor.getPlugin(dep)) {
      throw new Error(`Required plugin "${dep}" is not loaded`);
    }
  }
}
```

### 4. Use Semantic Versioning
Follow semantic versioning for your plugin versions:
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

### 5. Provide Configuration Options
Make plugins configurable:

```typescript
interface MyPluginConfig {
  autoSave?: boolean;
  saveInterval?: number;
  endpoint?: string;
}

export class MyPlugin implements Plugin {
  constructor(private config: MyPluginConfig = {}) {
    // Apply defaults
    this.config = {
      autoSave: true,
      saveInterval: 5000,
      endpoint: '/api/save',
      ...config
    };
  }
}
```

## Testing Plugins

### Unit Testing

```typescript
import { MyPlugin } from './MyPlugin';
import { createMockEditor } from '@mmeditor/test-utils';

describe('MyPlugin', () => {
  let plugin: MyPlugin;
  let editor: EditorInstance;
  
  beforeEach(() => {
    plugin = new MyPlugin();
    editor = createMockEditor();
  });
  
  afterEach(() => {
    plugin.onDestroy();
  });
  
  it('should initialize correctly', async () => {
    await plugin.onInit(editor);
    expect(plugin.name).toBe('my-plugin');
  });
  
  it('should add toolbar button', () => {
    expect(plugin.toolbarItems).toHaveLength(1);
    expect(plugin.toolbarItems[0].name).toBe('my-button');
  });
  
  it('should handle content changes', () => {
    const spy = jest.spyOn(console, 'log');
    plugin.afterChange(editor, 'new content');
    expect(spy).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
import { render, screen } from '@testing-library/react';
import { MMEditor } from '@mmeditor/core';
import { MyPlugin } from './MyPlugin';

describe('MyPlugin Integration', () => {
  it('should work with editor', async () => {
    const plugin = new MyPlugin();
    
    render(
      <MMEditor
        plugins={[plugin]}
        onChange={() => {}}
      />
    );
    
    // Check toolbar button appears
    const button = await screen.findByTitle('My Custom Action');
    expect(button).toBeInTheDocument();
    
    // Test button action
    fireEvent.click(button);
    // Assert expected behavior
  });
});
```

## Publishing Plugins

### Package Structure

```
my-mmeditor-plugin/
├── src/
│   ├── index.ts
│   ├── MyPlugin.ts
│   └── MyPlugin.test.ts
├── dist/
│   ├── index.js
│   ├── index.d.ts
│   └── index.min.js
├── package.json
├── README.md
└── LICENSE
```

### package.json

```json
{
  "name": "@myorg/mmeditor-plugin-example",
  "version": "1.0.0",
  "description": "Example plugin for MMEditor",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@mmeditor/core": "^1.0.0",
    "react": "^18.0.0"
  },
  "keywords": [
    "mmeditor",
    "plugin",
    "rich-text-editor"
  ]
}
```

### Export Pattern

```typescript
// src/index.ts
export { MyPlugin } from './MyPlugin';
export { createMyPlugin } from './factory';
export type { MyPluginConfig } from './types';
```

## Resources

- [Plugin API Reference](/docs/api/plugins)
- [Example Plugins Repository](https://github.com/mmeditor/plugins)
- [Plugin Template](https://github.com/mmeditor/plugin-template)
- [Community Plugins](https://mmeditor.dev/plugins)

## Support

- GitHub Issues: https://github.com/mmeditor/core/issues
- Discord: https://discord.gg/mmeditor
- Stack Overflow: Tag with `mmeditor`