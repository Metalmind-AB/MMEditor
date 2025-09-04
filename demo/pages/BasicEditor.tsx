import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MMEditor } from '../../src';
import type { EditorInstance } from '../../src';

export function BasicEditor() {
  const [content, setContent] = useState('<p>This is a <strong>basic editor</strong> configuration with default settings.</p>');
  const editorRef = useRef<EditorInstance>(null);
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to demos</Link>
        <h1>Basic Editor Configuration</h1>
        <p>Standard editor with default toolbar and basic formatting options.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Editor</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
            <MMEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              placeholder="Start typing..."
            />
          </div>
        </div>
        
        <div>
          <h3>Configuration</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto'
          }}>
{`<MMEditor
  ref={editorRef}
  value={content}
  onChange={setContent}
  placeholder="Start typing..."
/>

// Default features:
// ✓ Bold, Italic, Underline, Strike
// ✓ Headings (H1-H6)
// ✓ Lists (bullet & numbered)
// ✓ Links
// ✓ Tables
// ✓ Code & Code blocks
// ✓ Undo/Redo`}
          </pre>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>HTML Output</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
          {content}
        </pre>
      </div>
    </div>
  );
}