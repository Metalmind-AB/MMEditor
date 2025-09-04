import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MMEditor } from '../../src';
import type { EditorInstance, ToolbarConfig } from '../../src';

export function CustomToolbar() {
  const [content1, setContent1] = useState('<p>This editor has a <strong>minimal toolbar</strong> with only essential formatting.</p>');
  const [content2, setContent2] = useState('<p>This editor has a <strong>writer-focused toolbar</strong> optimized for content creation.</p>');
  const [content3, setContent3] = useState('<p>This editor has <strong>custom buttons</strong> and actions.</p>');
  
  const editorRef1 = useRef<EditorInstance>(null);
  const editorRef2 = useRef<EditorInstance>(null);
  const editorRef3 = useRef<EditorInstance>(null);

  // Minimal toolbar - only basic text formatting
  const minimalToolbar: ToolbarConfig = {
    groups: [
      { name: 'basic', items: ['bold', 'italic', 'underline'] },
      { name: 'structure', items: ['bullet', 'number'] },
    ],
  };

  // Writer-focused toolbar - optimized for content creation
  const writerToolbar: ToolbarConfig = {
    groups: [
      { name: 'text', items: ['bold', 'italic'] },
      { name: 'headings', items: ['h1', 'h2', 'h3'] },
      { name: 'lists', items: ['bullet', 'number'] },
      { name: 'content', items: ['link', 'code'] },
    ],
  };

  // Custom toolbar with custom buttons
  const customToolbar: ToolbarConfig = {
    groups: [
      { name: 'format', items: ['bold', 'italic', 'underline', 'strike'] },
      { name: 'structure', items: ['h2', 'bullet', 'link'] },
    ],
    customButtons: [
      {
        name: 'wordCount',
        icon: '🔢',
        action: (editor: EditorInstance) => {
          const text = editor.getText();
          const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
          alert(`Word count: ${wordCount} words`);
        },
        isActive: () => false,
      },
      {
        name: 'uppercaseSelection',
        icon: 'ABC',
        action: (editor: EditorInstance) => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const text = range.toString();
            if (text) {
              editor.execCommand('insertText', text.toUpperCase());
            }
          }
        },
        isActive: () => false,
      },
      {
        name: 'clearAll',
        icon: '🗑️',
        action: (editor: EditorInstance) => {
          if (confirm('Clear all content?')) {
            editor.setHTML('<p></p>');
            editor.focus();
          }
        },
        isActive: () => false,
      },
    ],
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to demos</Link>
        <h1>Custom Toolbar Configurations</h1>
        <p>Showcase different toolbar layouts and custom functionality.</p>
      </div>

      {/* Minimal Toolbar */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Minimal Toolbar</h2>
        <p>Only essential formatting options for clean, distraction-free editing.</p>
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}>
          <MMEditor
            ref={editorRef1}
            value={content1}
            onChange={setContent1}
            placeholder="Start typing..."
            toolbar={minimalToolbar}
          />
        </div>
        <details style={{ fontSize: '12px', color: '#666' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Configuration</summary>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '5px',
            overflow: 'auto'
          }}>
{`const minimalToolbar: ToolbarConfig = {
  groups: [
    { name: 'basic', items: ['bold', 'italic', 'underline'] },
    { name: 'structure', items: ['bullet', 'number'] },
  ],
};`}
          </pre>
        </details>
      </div>

      {/* Writer-Focused Toolbar */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Writer-Focused Toolbar</h2>
        <p>Optimized layout for content creators and bloggers.</p>
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}>
          <MMEditor
            ref={editorRef2}
            value={content2}
            onChange={setContent2}
            placeholder="Start writing your story..."
            toolbar={writerToolbar}
          />
        </div>
        <details style={{ fontSize: '12px', color: '#666' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Configuration</summary>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '5px',
            overflow: 'auto'
          }}>
{`const writerToolbar: ToolbarConfig = {
  groups: [
    { name: 'text', items: ['bold', 'italic'] },
    { name: 'headings', items: ['h1', 'h2', 'h3'] },
    { name: 'lists', items: ['bullet', 'number'] },
    { name: 'content', items: ['link', 'code'] },
  ],
};`}
          </pre>
        </details>
      </div>

      {/* Custom Buttons Toolbar */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Custom Actions Toolbar</h2>
        <p>Standard formatting plus custom buttons with unique functionality.</p>
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}>
          <MMEditor
            ref={editorRef3}
            value={content3}
            onChange={setContent3}
            placeholder="Try the custom buttons..."
            toolbar={customToolbar}
          />
        </div>
        <div style={{ 
          backgroundColor: '#e8f4f8', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '10px',
          fontSize: '14px'
        }}>
          <strong>Custom Button Features:</strong>
          <ul style={{ marginTop: '5px', marginBottom: '0' }}>
            <li><strong>🔢 Word Count</strong> - Shows current word count in a popup</li>
            <li><strong>ABC Uppercase</strong> - Converts selected text to uppercase</li>
            <li><strong>🗑️ Clear All</strong> - Clears all editor content (with confirmation)</li>
          </ul>
        </div>
        <details style={{ fontSize: '12px', color: '#666' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Configuration</summary>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '5px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
{`const customToolbar: ToolbarConfig = {
  groups: [
    { name: 'format', items: ['bold', 'italic', 'underline', 'strike'] },
    { name: 'structure', items: ['h2', 'bullet', 'link'] },
  ],
  customButtons: [
    {
      name: 'wordCount',
      icon: '🔢',
      action: (editor) => {
        const text = editor.getText();
        const wordCount = text.trim() ? text.trim().split(/\\s+/).length : 0;
        alert(\`Word count: \${wordCount} words\`);
      },
    },
    {
      name: 'uppercaseSelection',
      icon: 'ABC',
      action: (editor) => {
        const selection = window.getSelection();
        const text = selection?.toString();
        if (text) {
          editor.execCommand('insertText', text.toUpperCase());
        }
      },
    },
    {
      name: 'clearAll',
      icon: '🗑️',
      action: (editor) => {
        if (confirm('Clear all content?')) {
          editor.setHTML('<p></p>');
          editor.focus();
        }
      },
    },
  ],
};`}
          </pre>
        </details>
      </div>

      {/* Comparison Table */}
      <div style={{ marginTop: '40px' }}>
        <h2>Toolbar Configuration Comparison</h2>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px',
          border: '1px solid #ddd'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Configuration</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Use Case</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Button Count</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Features</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Minimal</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>Quick notes, comments</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>5 buttons</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>Basic text formatting, lists</td>
            </tr>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Writer-Focused</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>Blog posts, articles</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>9 buttons</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>Headings, content structure</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Custom Actions</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>Specialized workflows</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>10 buttons</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>Custom functionality, utilities</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}