# MMEditor Integration Guide

Complete guide for integrating MMEditor into internal projects with best practices and common patterns.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Framework Integration](#framework-integration)
3. [Common Patterns](#common-patterns)
4. [State Management](#state-management)
5. [Form Integration](#form-integration)
6. [Custom Styling](#custom-styling)
7. [Performance Optimization](#performance-optimization)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Installation & Setup

### Basic Installation

```bash
# Install from internal repository
npm install @mmeditor/core

# For TypeScript projects (recommended)
npm install @mmeditor/core @types/react @types/react-dom
```

### Initial Setup

```tsx
// App.tsx
import '@mmeditor/core/style.css'; // Required CSS import
import { Editor } from '@mmeditor/core';

function App() {
  return (
    <div className="app">
      <Editor placeholder="Start writing..." />
    </div>
  );
}

export default App;
```

### Development Setup

```bash
# Clone for development
git clone [internal-repository-url]
cd mmeditor
npm install

# Development commands
npm run dev         # Development server
npm run test        # Run tests
npm run typecheck   # TypeScript validation
npm run lint        # Code linting
```

## Framework Integration

### React with TypeScript

```tsx
import React, { useRef, useCallback } from 'react';
import { Editor, EditorInstance, MMEditorProps } from '@mmeditor/core';
import '@mmeditor/core/style.css';

interface ArticleEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  readOnly?: boolean;
}

function ArticleEditor({ initialContent, onSave, readOnly }: ArticleEditorProps) {
  const editorRef = useRef<EditorInstance>(null);

  const handleSave = useCallback(() => {
    const html = editorRef.current?.getHTML();
    if (html && onSave) {
      onSave(html);
    }
  }, [onSave]);

  const editorConfig: MMEditorProps = {
    ref: editorRef,
    defaultValue: initialContent,
    readOnly,
    placeholder: "Start writing your article...",
    onChange: (html) => {
      // Auto-save or validation logic
    },
    onReady: () => {
      console.log('Editor initialized');
    }
  };

  return (
    <div className="article-editor">
      <Editor {...editorConfig} />
      {!readOnly && (
        <button onClick={handleSave}>Save Article</button>
      )}
    </div>
  );
}
```

### Next.js Integration

```tsx
// components/Editor.tsx
import dynamic from 'next/dynamic';
import { MMEditorProps } from '@mmeditor/core';

// Dynamic import to avoid SSR issues
const MMEditor = dynamic(
  () => import('@mmeditor/core').then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>
  }
);

interface EditorWrapperProps extends MMEditorProps {
  // Add any additional props
}

export function EditorWrapper(props: EditorWrapperProps) {
  return <MMEditor {...props} />;
}
```

```tsx
// pages/article/[id].tsx
import { EditorWrapper } from '../../components/Editor';

export default function ArticlePage() {
  return (
    <div>
      <h1>Edit Article</h1>
      <EditorWrapper
        placeholder="Write your article..."
        onChange={(html) => console.log(html)}
      />
    </div>
  );
}
```

### Vite Integration

```tsx
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mmeditor/core']
  }
});
```

### Create React App Integration

```tsx
// src/components/EditorComponent.tsx
import { Editor } from '@mmeditor/core';
import '@mmeditor/core/style.css';

// Standard React component - works out of the box
export function EditorComponent() {
  return (
    <Editor
      placeholder="Start typing..."
      onChange={(html) => console.log('Content:', html)}
    />
  );
}
```

## Common Patterns

### Document Management

```tsx
import React, { useState, useEffect } from 'react';
import { Editor, EditorInstance } from '@mmeditor/core';

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

function DocumentEditor() {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<EditorInstance>(null);

  // Load document
  useEffect(() => {
    async function loadDocument() {
      setIsLoading(true);
      try {
        const doc = await fetchDocument(documentId);
        setDocument(doc);
      } finally {
        setIsLoading(false);
      }
    }
    loadDocument();
  }, []);

  // Auto-save functionality
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  const handleChange = useCallback((html: string) => {
    if (document) {
      setDocument({ ...document, content: html });
      
      // Clear previous timer
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      
      // Set new auto-save timer
      const timer = setTimeout(async () => {
        setIsSaving(true);
        await saveDocument({ ...document, content: html });
        setIsSaving(false);
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      setSaveTimer(timer);
    }
  }, [document, saveTimer]);

  if (isLoading) return <div>Loading document...</div>;
  if (!document) return <div>Document not found</div>;

  return (
    <div className="document-editor">
      <header>
        <h1>{document.title}</h1>
        {isSaving && <span>Saving...</span>}
      </header>
      
      <Editor
        ref={editorRef}
        value={document.content}
        onChange={handleChange}
        placeholder="Start writing..."
      />
    </div>
  );
}
```

### Multi-Editor Management

```tsx
interface EditorTab {
  id: string;
  title: string;
  content: string;
}

function MultiEditor() {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const editorRefs = useRef<Map<string, EditorInstance>>(new Map());

  const addTab = () => {
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      title: `Document ${tabs.length + 1}`,
      content: ''
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const updateTab = (id: string, content: string) => {
    setTabs(tabs.map(tab => 
      tab.id === id ? { ...tab, content } : tab
    ));
  };

  return (
    <div className="multi-editor">
      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </button>
        ))}
        <button onClick={addTab}>+ New</button>
      </div>

      <div className="editor-container">
        {tabs.map(tab => (
          <div
            key={tab.id}
            style={{ display: activeTab === tab.id ? 'block' : 'none' }}
          >
            <Editor
              ref={(ref) => {
                if (ref) {
                  editorRefs.current.set(tab.id, ref);
                }
              }}
              value={tab.content}
              onChange={(content) => updateTab(tab.id, content)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Collaborative Comments

```tsx
interface Comment {
  id: string;
  text: string;
  author: string;
  range: { start: number; end: number };
}

function CommentableEditor() {
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const editorRef = useRef<EditorInstance>(null);

  const addComment = () => {
    const selection = editorRef.current?.getSelection();
    if (selection && selection.length > 0) {
      const commentText = prompt('Enter your comment:');
      if (commentText) {
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          text: commentText,
          author: 'Current User',
          range: { start: selection.index, end: selection.index + selection.length }
        };
        setComments([...comments, newComment]);
      }
    }
  };

  return (
    <div className="commentable-editor">
      <div className="toolbar">
        <button onClick={addComment}>Add Comment</button>
      </div>
      
      <Editor
        ref={editorRef}
        value={content}
        onChange={setContent}
        placeholder="Write content and select text to comment..."
      />
      
      <div className="comments-panel">
        <h3>Comments</h3>
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <strong>{comment.author}:</strong> {comment.text}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## State Management

### Redux Integration

```tsx
// store/editorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EditorState {
  content: string;
  isSaving: boolean;
  lastSaved: Date | null;
}

const initialState: EditorState = {
  content: '',
  isSaving: false,
  lastSaved: null
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    updateContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },
    setSaved: (state) => {
      state.isSaving = false;
      state.lastSaved = new Date();
    }
  }
});

export const { updateContent, setSaving, setSaved } = editorSlice.actions;
export default editorSlice.reducer;
```

```tsx
// components/ReduxEditor.tsx
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@mmeditor/core';
import { updateContent } from '../store/editorSlice';

function ReduxEditor() {
  const dispatch = useDispatch();
  const { content, isSaving } = useSelector((state: RootState) => state.editor);

  return (
    <div>
      {isSaving && <div>Saving...</div>}
      <Editor
        value={content}
        onChange={(html) => dispatch(updateContent(html))}
      />
    </div>
  );
}
```

### Zustand Integration

```tsx
// store/editorStore.ts
import { create } from 'zustand';

interface EditorStore {
  content: string;
  setContent: (content: string) => void;
  save: () => Promise<void>;
  isSaving: boolean;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  content: '',
  isSaving: false,
  setContent: (content) => set({ content }),
  save: async () => {
    set({ isSaving: true });
    try {
      await saveToServer(get().content);
    } finally {
      set({ isSaving: false });
    }
  }
}));
```

```tsx
// components/ZustandEditor.tsx
import { Editor } from '@mmeditor/core';
import { useEditorStore } from '../store/editorStore';

function ZustandEditor() {
  const { content, setContent, save, isSaving } = useEditorStore();

  return (
    <div>
      <Editor
        value={content}
        onChange={setContent}
      />
      <button onClick={save} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
```

## Form Integration

### React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';
import { Editor } from '@mmeditor/core';

interface ArticleForm {
  title: string;
  content: string;
  tags: string[];
}

function ArticleForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<ArticleForm>();

  const onSubmit = async (data: ArticleForm) => {
    console.log('Submitting:', data);
    await submitArticle(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Title</label>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Title is required' }}
          render={({ field }) => (
            <input {...field} />
          )}
        />
        {errors.title && <span>{errors.title.message}</span>}
      </div>

      <div>
        <label>Content</label>
        <Controller
          name="content"
          control={control}
          rules={{ 
            required: 'Content is required',
            minLength: { value: 10, message: 'Content too short' }
          }}
          render={({ field }) => (
            <Editor
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="Write your article content..."
            />
          )}
        />
        {errors.content && <span>{errors.content.message}</span>}
      </div>

      <button type="submit">Save Article</button>
    </form>
  );
}
```

### Formik Integration

```tsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Editor } from '@mmeditor/core';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  content: Yup.string()
    .required('Content is required')
    .min(10, 'Content must be at least 10 characters')
});

function FormikEditor() {
  return (
    <Formik
      initialValues={{ title: '', content: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await submitData(values);
      }}
    >
      {({ setFieldValue, values }) => (
        <Form>
          <div>
            <Field name="title" placeholder="Article title" />
            <ErrorMessage name="title" component="div" />
          </div>

          <div>
            <Editor
              value={values.content}
              onChange={(content) => setFieldValue('content', content)}
              placeholder="Write content..."
            />
            <ErrorMessage name="content" component="div" />
          </div>

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}
```

## Custom Styling

### CSS Variables Customization

```css
/* Custom theme variables */
:root {
  /* Editor colors */
  --mmeditor-bg: #ffffff;
  --mmeditor-text: #333333;
  --mmeditor-border: #e1e5e9;
  --mmeditor-placeholder: #6c757d;
  
  /* Toolbar colors */
  --mmeditor-toolbar-bg: #f8f9fa;
  --mmeditor-toolbar-border: #dee2e6;
  --mmeditor-button-hover: #e9ecef;
  --mmeditor-button-active: #007bff;
  --mmeditor-button-text: #495057;
  
  /* Dropdown colors */
  --mmeditor-dropdown-bg: #ffffff;
  --mmeditor-dropdown-shadow: rgba(0, 0, 0, 0.175);
  --mmeditor-dropdown-hover: #f8f9fa;
  
  /* Dialog colors */
  --mmeditor-dialog-bg: #ffffff;
  --mmeditor-dialog-overlay: rgba(0, 0, 0, 0.5);
  
  /* Spacing */
  --mmeditor-padding: 12px;
  --mmeditor-margin: 8px;
  --mmeditor-border-radius: 4px;
  
  /* Typography */
  --mmeditor-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  --mmeditor-font-size: 14px;
  --mmeditor-line-height: 1.5;
}

/* Dark theme */
[data-theme="dark"] {
  --mmeditor-bg: #1a1a1a;
  --mmeditor-text: #ffffff;
  --mmeditor-border: #3a3a3a;
  --mmeditor-toolbar-bg: #2d2d2d;
  --mmeditor-button-hover: #404040;
  --mmeditor-dropdown-bg: #2d2d2d;
}
```

### Custom Component Styles

```css
/* Custom editor styling */
.custom-editor {
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
}

.custom-editor .mmeditor-toolbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.custom-editor .mmeditor-toolbar button {
  color: white;
  border-radius: 4px;
  margin: 2px;
}

.custom-editor .mmeditor-toolbar button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.custom-editor .mmeditor-content {
  min-height: 200px;
  padding: 16px;
  font-family: 'Georgia', serif;
  line-height: 1.6;
}
```

### Styled Components

```tsx
import styled from 'styled-components';
import { Editor } from '@mmeditor/core';

const StyledEditorContainer = styled.div`
  .mmeditor-root {
    border: 1px solid ${props => props.theme.borderColor};
    border-radius: 8px;
    overflow: hidden;
    
    .mmeditor-toolbar {
      background: ${props => props.theme.toolbarBg};
      padding: 8px;
    }
    
    .mmeditor-content {
      padding: 16px;
      min-height: 300px;
      font-family: ${props => props.theme.fontFamily};
    }
  }
`;

function StyledEditor() {
  return (
    <StyledEditorContainer>
      <Editor placeholder="Styled editor example" />
    </StyledEditorContainer>
  );
}
```

## Performance Optimization

### Debounced Updates

```tsx
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import { Editor } from '@mmeditor/core';

function OptimizedEditor() {
  // Debounce onChange to reduce API calls
  const debouncedSave = useMemo(
    () => debounce(async (content: string) => {
      await saveToServer(content);
    }, 1000),
    []
  );

  const handleChange = useCallback((content: string) => {
    // Update local state immediately
    setLocalContent(content);
    
    // Debounced server save
    debouncedSave(content);
  }, [debouncedSave]);

  return (
    <Editor
      onChange={handleChange}
      placeholder="Optimized editor"
    />
  );
}
```

### Lazy Loading

```tsx
import { Suspense, lazy } from 'react';

const Editor = lazy(() => import('@mmeditor/core').then(mod => ({ default: mod.Editor })));

function LazyEditor() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <Editor placeholder="Lazy loaded editor" />
    </Suspense>
  );
}
```

### Memoization

```tsx
import React, { memo, useMemo } from 'react';
import { Editor, ToolbarConfig } from '@mmeditor/core';

interface MemoizedEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

const MemoizedEditor = memo(({ content, onChange, readOnly }: MemoizedEditorProps) => {
  const toolbarConfig = useMemo<ToolbarConfig>(() => ({
    groups: [
      { name: 'text', items: ['bold', 'italic'] },
      { name: 'headings', items: ['h1', 'h2'] }
    ]
  }), []); // Static config, memoized once

  return (
    <Editor
      value={content}
      onChange={onChange}
      readOnly={readOnly}
      toolbar={toolbarConfig}
    />
  );
});
```

## Security Considerations

### Input Sanitization

```tsx
import { sanitizer } from '@mmeditor/core';

function SecureEditor() {
  const [content, setContent] = useState('');

  const handlePaste = useCallback((event: ClipboardEvent) => {
    event.preventDefault();
    
    const pastedData = event.clipboardData?.getData('text/html') || '';
    const sanitized = sanitizer.sanitize(pastedData);
    
    // Insert sanitized content
    document.execCommand('insertHTML', false, sanitized);
  }, []);

  return (
    <Editor
      value={content}
      onChange={(html) => {
        // Additional sanitization on change
        const sanitized = sanitizer.sanitize(html);
        setContent(sanitized);
      }}
      onReady={() => {
        // Add paste event listener for extra security
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
      }}
    />
  );
}
```

### Content Validation

```tsx
function ValidatedEditor() {
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const validateContent = (html: string): string[] => {
    const errors: string[] = [];
    
    // Check for potentially dangerous content
    if (html.includes('<script')) {
      errors.push('Script tags are not allowed');
    }
    
    if (html.includes('javascript:')) {
      errors.push('JavaScript URLs are not allowed');
    }
    
    // Check content length
    const textLength = html.replace(/<[^>]*>/g, '').length;
    if (textLength > 10000) {
      errors.push('Content too long (max 10,000 characters)');
    }
    
    return errors;
  };

  const handleChange = (html: string) => {
    const validationErrors = validateContent(html);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setContent(html);
    }
  };

  return (
    <div>
      <Editor
        value={content}
        onChange={handleChange}
      />
      {errors.length > 0 && (
        <div className="error-list">
          {errors.map((error, index) => (
            <div key={index} className="error">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

#### SSR Issues (Next.js)
```tsx
// Use dynamic imports to avoid SSR issues
const Editor = dynamic(
  () => import('@mmeditor/core'),
  { ssr: false }
);
```

#### CSS Not Loading
```tsx
// Make sure to import CSS in your root component
import '@mmeditor/core/style.css';
```

#### TypeScript Errors
```tsx
// Use proper type imports
import type { EditorInstance, MMEditorProps } from '@mmeditor/core';
```

#### Performance Issues
```tsx
// Use debouncing for frequent updates
const debouncedChange = useMemo(
  () => debounce(handleChange, 300),
  [handleChange]
);
```

### Debug Mode

```tsx
function DebugEditor() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  return (
    <div>
      <Editor
        onChange={(html) => {
          setDebugInfo({
            timestamp: new Date(),
            length: html.length,
            html: html.substring(0, 100) + '...'
          });
        }}
      />
      
      {process.env.NODE_ENV === 'development' && (
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      )}
    </div>
  );
}
```

---

**MMEditor Integration Guide** - Complete integration patterns for internal projects with 88.1% test coverage and comprehensive security validation.