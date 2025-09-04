import React from 'react';
import { Link } from 'react-router-dom';
import { MMEditor } from '../../src';

export function ReadOnlyEditor() {
  
  const content = `
    <h1>Read-Only Content Viewer</h1>
    <p>This editor is configured in <strong>read-only mode</strong>. Users can view but not edit the content.</p>
    <h2>Use Cases</h2>
    <ul>
      <li>Displaying blog posts or articles</li>
      <li>Showing documentation</li>
      <li>Preview mode for content</li>
      <li>Displaying user-generated content safely</li>
    </ul>
    <blockquote>
      <p>The content is fully styled and formatted, but cannot be modified by the user.</p>
    </blockquote>
    <p>Try clicking or typing - the content remains unchanged!</p>
  `;
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to demos</Link>
        <h1>Read-Only Editor</h1>
        <p>Editor configured as a content viewer with no editing capabilities.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Content Viewer</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
            <MMEditor
              value={content}
              onChange={() => {}}
              readOnly={true}
              toolbar={false}
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
  value={content}
  onChange={() => {}}
  readOnly={true}
  toolbar={false}
/>

// Features:
// ✓ Content display only
// ✓ No toolbar (toolbar={false})
// ✓ No editing capabilities (readOnly={true})
// ✓ Preserves formatting
// ✓ Safe for user content`}
          </pre>
        </div>
      </div>
    </div>
  );
}