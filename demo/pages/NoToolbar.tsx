import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MMEditor } from '../../src';
import type { EditorInstance } from '../../src';

export function NoToolbar() {
  const [content, setContent] = useState('<p>This editor has <strong>no toolbar</strong> - use keyboard shortcuts for formatting!</p>');
  const editorRef = useRef<EditorInstance>(null);
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to demos</Link>
        <h1>No Toolbar Configuration</h1>
        <p>Power user mode - keyboard shortcuts only, no visual toolbar.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Editor (Keyboard Shortcuts Only)</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
            <MMEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              placeholder="Start typing and use keyboard shortcuts..."
              toolbar={false}
            />
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4f8', borderRadius: '4px' }}>
            <h4 style={{ marginTop: 0 }}>Keyboard Shortcuts Reference</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
              <div>
                <strong>Text Formatting</strong>
                <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                  <li><kbd>Cmd/Ctrl + B</kbd> - Bold</li>
                  <li><kbd>Cmd/Ctrl + I</kbd> - Italic</li>
                  <li><kbd>Cmd/Ctrl + U</kbd> - Underline</li>
                  <li><kbd>Cmd/Ctrl + Shift + S</kbd> - Strike</li>
                </ul>
              </div>
              <div>
                <strong>Structure</strong>
                <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                  <li><kbd>Cmd/Ctrl + K</kbd> - Insert Link</li>
                  <li><kbd>Cmd/Ctrl + Shift + 7</kbd> - Numbered List</li>
                  <li><kbd>Cmd/Ctrl + Shift + 8</kbd> - Bullet List</li>
                  <li><kbd>Cmd/Ctrl + ]</kbd> - Indent</li>
                  <li><kbd>Cmd/Ctrl + [</kbd> - Outdent</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3>Why No Toolbar?</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <ul>
              <li>Maximizes content area</li>
              <li>Cleaner, distraction-free interface</li>
              <li>Faster for power users</li>
              <li>Ideal for experienced writers</li>
              <li>Perfect for minimal UI designs</li>
            </ul>
          </div>
          
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
  toolbar={false}
/>

// All features still available via:
// ✓ Keyboard shortcuts
// ✓ Context menus (if enabled)
// ✓ Programmatic API calls
// ✓ Clean, distraction-free interface`}
          </pre>
        </div>
      </div>
    </div>
  );
}