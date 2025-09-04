import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MMEditor } from '../../src';
import type { EditorInstance } from '../../src';

export function MinimalEditor() {
  const [content, setContent] = useState('<p>This is a <strong>minimal</strong> editor with only <em>essential</em> formatting.</p>');
  const editorRef = useRef<EditorInstance>(null);
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to demos</Link>
        <h1>Minimal Editor Configuration</h1>
        <p>Stripped down editor with only the most essential formatting tools.</p>
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
              config={{
                features: {
                  tables: false,
                  codeBlocks: false,
                  advancedFormatting: false,
                  links: false,
                },
                toolbar: {
                  sticky: false,
                  groups: [
                    ['bold', 'italic'],
                    ['undo', 'redo']
                  ]
                }
              }}
            />
          </div>
          
          <div style={{ marginTop: '20px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
            <strong>Try keyboard shortcuts:</strong>
            <ul style={{ marginTop: '10px', fontSize: '14px' }}>
              <li><kbd>Cmd/Ctrl + B</kbd> - Bold</li>
              <li><kbd>Cmd/Ctrl + I</kbd> - Italic</li>
              <li><kbd>Cmd/Ctrl + Z</kbd> - Undo</li>
              <li><kbd>Cmd/Ctrl + Shift + Z</kbd> - Redo</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3>Why Minimal?</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p>Perfect for:</p>
            <ul>
              <li>Comment systems</li>
              <li>Simple note-taking</li>
              <li>Mobile-first applications</li>
              <li>Limited screen space</li>
              <li>Reducing cognitive load</li>
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
  config={{
    features: {
      tables: false,
      codeBlocks: false,
      advancedFormatting: false,
      links: false,
    },
    toolbar: {
      sticky: false,
      groups: [
        ['bold', 'italic'],
        ['undo', 'redo']
      ]
    }
  }}
/>`}
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