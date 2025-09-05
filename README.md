# MMEditor - Internal Release

A lightweight React-based rich text editor with comprehensive testing coverage (88.1%) and robust security validation. Built for internal use with production-ready features.

## 🚀 Quick Start

```bash
# Install from internal repository
npm install @mmeditor/core

# Basic usage
import { Editor } from '@mmeditor/core';
import '@mmeditor/core/style.css';

function MyApp() {
  return <Editor placeholder="Start typing..." />;
}
```

## 📊 Project Status

- ✅ **88.1% Test Coverage** - Comprehensive test suite with 522 passing tests
- ✅ **Security Validated** - XSS prevention with 95.65% sanitizer coverage  
- ✅ **Performance Tested** - Large document handling and concurrent operations validated
- ✅ **Production Ready** - Built for internal deployment with optimized bundles

## 🛠 Installation & Setup

### Prerequisites
- React 18+
- TypeScript 5+ (recommended)
- Node.js 18+
- Git (required for GitHub installation)

### Installation

#### From NPM (when published)
```bash
npm install @mmeditor/core
```

#### From GitHub Repository
```bash
# Requires git to be installed
npm install github:Metalmind-AB/MMEditor
```

#### From GitHub Release (no git required)
```bash
# Direct tarball download - works without git
npm install https://github.com/Metalmind-AB/MMEditor/releases/download/v0.1.3/mmeditor-core-0.1.0.tgz
```

#### Docker Installation
When installing in Docker containers, ensure git is available:

```dockerfile
# For Alpine-based images
RUN apk add --no-cache git
RUN npm install

# For Debian/Ubuntu-based images
RUN apt-get update && apt-get install -y git
RUN npm install

# Alternative: Use release tarball (no git needed)
# In package.json:
"@mmeditor/core": "https://github.com/Metalmind-AB/MMEditor/releases/download/v0.1.3/mmeditor-core-0.1.0.tgz"
```

### Basic Integration
```tsx
import React, { useRef } from 'react';
import { Editor, EditorInstance } from '@mmeditor/core';
import '@mmeditor/core/style.css';

function App() {
  const editorRef = useRef<EditorInstance>(null);
  
  const handleSave = () => {
    const html = editorRef.current?.getHTML();
    console.log('Content:', html);
  };

  return (
    <div>
      <Editor
        ref={editorRef}
        placeholder="Start writing..."
        onChange={(html) => console.log('Changed:', html)}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

## 🎯 Core Features

### Text Formatting
- **Bold, Italic, Underline, Strike** - Standard text formatting
- **Inline Code** - Monospace formatting for code snippets
- **Code Blocks** - Multi-line code with preserved whitespace

### Document Structure  
- **Headings** - H1-H6 with semantic HTML output
- **Lists** - Bullet and numbered lists with 3-level nesting
- **Tables** - Full table support with row/column manipulation

### Advanced Features
- **Links** - URL insertion with target attribute support
- **Keyboard Shortcuts** - Standard shortcuts (Cmd/Ctrl+B, I, U, K)
- **Plugin System** - Extensible architecture for custom features
- **Theming** - CSS variables for complete visual customization

## 📡 API Reference

### Editor Props
```tsx
interface MMEditorProps {
  // Content control
  value?: string;              // Controlled mode
  defaultValue?: string;       // Uncontrolled mode
  onChange?: (html: string) => void;
  
  // Configuration
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  
  // Toolbar configuration
  toolbar?: ToolbarConfig;
  plugins?: Plugin[];
  
  // Event handlers
  onFocus?: () => void;
  onBlur?: () => void;
  onReady?: () => void;
}
```

### Editor Instance Methods
```tsx
interface EditorInstance {
  // Content management
  getHTML(): string;
  setHTML(html: string): void;
  clear(): void;
  
  // Formatting
  format(format: Format, value?: string): void;
  isFormatActive(format: Format): boolean;
  
  // Selection
  getSelection(): SelectionRange | null;
  setSelection(range: SelectionRange): void;
  
  // Focus management
  focus(): void;
  blur(): void;
}
```

## 🔧 Configuration

### Custom Toolbar
```tsx
const customToolbar = {
  groups: [
    { name: 'text', items: ['bold', 'italic'] },
    { name: 'structure', items: ['h1', 'h2'] },
    { name: 'list', items: ['bullet', 'number'] },
  ]
};

<Editor toolbar={customToolbar} />
```

### Theming
```css
/* Override CSS variables */
:root {
  --mmeditor-bg: #ffffff;
  --mmeditor-border: #e0e0e0;
  --mmeditor-toolbar-bg: #f8f9fa;
  --mmeditor-button-hover: #e9ecef;
  --mmeditor-button-active: #007bff;
}
```

## 🔌 Plugin Development

### Basic Plugin Structure
```tsx
import { Plugin } from '@mmeditor/core';

export const MyPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  onInit(editor) {
    // Plugin initialization
  },
  
  onDestroy() {
    // Cleanup
  },
  
  commands: {
    'my-command': (editor, value) => {
      // Custom command implementation
    }
  },
  
  toolbarItems: [
    {
      name: 'my-button',
      type: 'button',
      icon: '🎨',
      tooltip: 'My Custom Action',
      action: (editor) => editor.executeCommand('my-command')
    }
  ]
};

// Usage
<Editor plugins={[MyPlugin]} />
```

## 🧪 Testing

The project includes comprehensive testing with industry-leading coverage:

### Test Coverage Breakdown
- **Overall Coverage**: 88.1% (exceeds 80% target)
- **Sanitizer Module**: 95.65% (security-critical)
- **Document Module**: 96.35% (core functionality) 
- **Lists Module**: 82.79% (complex operations)
- **Table Module**: 86.94% (advanced features)

### Running Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run security tests
npm run test:security

# Run performance tests  
npm run test:performance

# Quality check (lint + typecheck + coverage)
npm run quality-check
```

## 🔒 Security

MMEditor implements comprehensive XSS prevention:

- **HTML Sanitization** - Removes dangerous elements and attributes
- **Content Security** - Validates all user input
- **Event Handler Stripping** - Prevents script injection
- **95.65% Sanitizer Coverage** - Extensively tested security measures

### Security Features
```tsx
// All content is automatically sanitized
const safeHTML = editor.getHTML(); // XSS-safe output

// Manual sanitization available
import { sanitizer } from '@mmeditor/core';
const clean = sanitizer.sanitize(userInput);
```

## 🚀 Performance

Optimized for production use:

- **Large Document Handling** - Tested with 10,000+ word documents
- **Concurrent Operations** - Validated multi-user scenarios
- **Bundle Size** - Optimized for internal deployment
- **Memory Management** - No memory leaks in extended usage

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)

## 🛠 Development

### Local Development
```bash
git clone [internal-repo-url]
cd mmeditor
npm install
npm run dev     # Start development server
```

### Build Commands
```bash
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint checking
npm run test         # Run test suite
```

## 📝 Migration Guide

### From Other Editors

#### From Quill
```tsx
// Before (Quill)
import ReactQuill from 'react-quill';

// After (MMEditor)
import { Editor } from '@mmeditor/core';
```

#### From TinyMCE/CKEditor
```tsx
// MMEditor provides simpler API
<Editor 
  defaultValue={content}
  onChange={handleChange}
  placeholder="Start typing..."
/>
```

## 🐛 Troubleshooting

### Common Issues

#### Styling Not Applied
```tsx
// Ensure CSS is imported
import '@mmeditor/core/style.css';
```

#### TypeScript Errors
```tsx
// Use proper types
import { EditorInstance, MMEditorProps } from '@mmeditor/core';
```

#### Performance Issues
```tsx
// Use debounced onChange for large content
const debouncedChange = useMemo(
  () => debounce(handleChange, 300),
  [handleChange]
);

<Editor onChange={debouncedChange} />
```

## 📊 Benchmarks

Performance metrics from testing:
- **Typing Latency**: <16ms (60fps target met)
- **Large Document Load**: <200ms for 10k words
- **Memory Usage**: <10MB for typical documents
- **Bundle Size**: Optimized for internal distribution

## 🤝 Internal Support

For internal development support:
- Check test coverage reports in `coverage/` directory
- Review security test results for compliance
- Performance benchmarks available in test results
- Plugin development examples in `src/plugins/`

## 📄 License

MIT - Internal Use

---

**MMEditor v1.0.0-internal** - Production-ready rich text editor with exceptional test coverage and security validation.