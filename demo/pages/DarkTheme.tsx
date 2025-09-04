import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MMEditor } from '../../src';
import type { EditorInstance } from '../../src';

export function DarkTheme() {
  const [content, setContent] = useState('<h2>Dark Theme Editor</h2><p>This editor is styled with a <strong>dark theme</strong> using CSS variables.</p>');
  const editorRef = useRef<EditorInstance>(null);
  
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#e0e0e0'
    }}>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ color: '#66b3ff' }}>← Back to demos</Link>
          <h1 style={{ color: '#fff' }}>Dark Theme Configuration</h1>
          <p>Editor with custom dark theme styling using CSS variables.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ color: '#fff' }}>Dark Editor</h3>
            <div 
              className="dark-theme-editor"
              style={{
                '--mme-background': '#2a2a2a',
                '--mme-text-color': '#e0e0e0',
                '--mme-border-color': '#444',
                '--mme-toolbar-bg': '#333',
                '--mme-toolbar-border': '#555',
                '--mme-toolbar-separator': '#555',
                '--mme-button-bg': 'transparent',
                '--mme-button-hover-bg': '#444',
                '--mme-button-active-bg': '#0066cc',
                '--mme-button-color': '#e0e0e0',
                '--mme-selection-bg': '#004488',
                '--mme-placeholder-color': '#888',
                '--mme-border-radius': '4px'
              } as React.CSSProperties}
            >
              <style>{`
                .dark-theme-editor h1,
                .dark-theme-editor h2,
                .dark-theme-editor h3,
                .dark-theme-editor h4,
                .dark-theme-editor h5,
                .dark-theme-editor h6 {
                  color: #fff;
                }
                .dark-theme-editor strong {
                  color: #fff;
                  font-weight: bold;
                }
                .dark-theme-editor em {
                  color: #f0f0f0;
                }
                .dark-theme-editor a {
                  color: #66b3ff;
                }
                .dark-theme-editor code {
                  background: #1a1a1a;
                  color: #66ff66;
                  padding: 2px 4px;
                  border-radius: 3px;
                  border: 1px solid #444;
                }
                .dark-theme-editor pre {
                  background: #1a1a1a;
                  border: 1px solid #444;
                  padding: 12px;
                  border-radius: 4px;
                }
                .dark-theme-editor pre code {
                  background: transparent;
                  border: none;
                  padding: 0;
                }
                .dark-theme-editor blockquote {
                  border-left: 4px solid #666;
                  color: #aaa;
                  padding-left: 16px;
                  margin-left: 0;
                }
                .dark-theme-editor table {
                  border-collapse: collapse;
                  width: 100%;
                }
                .dark-theme-editor table td,
                .dark-theme-editor table th {
                  border: 1px solid #555;
                  padding: 8px;
                }
                .dark-theme-editor table th {
                  background: #333;
                  color: #fff;
                }
                .dark-theme-editor table tr:hover {
                  background: #333;
                }
              `}</style>
              <MMEditor
                ref={editorRef}
                value={content}
                onChange={setContent}
                placeholder="Start typing in dark mode..."
              />
            </div>
          </div>
          
          <div>
            <h3 style={{ color: '#fff' }}>Theme Variables</h3>
            <pre style={{ 
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              color: '#a0d0ff',
              padding: '16px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
{`/* CSS Variables for Dark Theme */
--mme-background: #2a2a2a;
--mme-text-color: #e0e0e0;
--mme-border-color: #444;
--mme-toolbar-bg: #333;
--mme-toolbar-border: #555;
--mme-button-hover-bg: #444;
--mme-button-active-bg: #0066cc;
--mme-selection-bg: #004488;

/* Usage with CSS Variables */
<div 
  className="dark-theme-editor"
  style={{
    '--mme-background': '#2a2a2a',
    '--mme-text-color': '#e0e0e0',
    '--mme-border-color': '#444',
    // ... other variables
  }}
>
  <MMEditor {...props} />
</div>`}
            </pre>
            
            <h3 style={{ color: '#fff', marginTop: '20px' }}>Features</h3>
            <ul style={{ fontSize: '14px' }}>
              <li>Custom color scheme</li>
              <li>CSS variable overrides</li>
              <li>Maintains all functionality</li>
              <li>Accessible contrast ratios</li>
              <li>Smooth hover states</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}