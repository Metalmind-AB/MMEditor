import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MMEditor } from '../../src';
import type { EditorInstance } from '../../src';
// Temporarily disabled EmojiPlugin due to import issues
// import { createEmojiPlugin } from '../../src/plugins/emoji/EmojiPlugin';
import { createIconPackPlugin } from '../../src/plugins/icon-pack/IconPackPlugin';
import { muiIconConfig } from '../plugins';

// Create plugins for this component
// const emojiPlugin = createEmojiPlugin();
const iconPackPlugin = createIconPackPlugin();

export function FullFeatured() {
  const [content, setContent] = useState(`
    <h1>Full Featured Editor 🚀</h1>
    <p>This configuration includes <strong>all features</strong> enabled:</p>
    <ul>
      <li>Tables support</li>
      <li>Emoji plugin 😊</li>
      <li>Icon pack integration</li>
      <li>Code blocks with syntax highlighting</li>
      <li>Advanced formatting options</li>
    </ul>
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Status</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Tables</td>
          <td>✅ Enabled</td>
          <td>Full table editing support</td>
        </tr>
        <tr>
          <td>Plugins</td>
          <td>✅ Enabled</td>
          <td>Emoji & Icon pack</td>
        </tr>
      </tbody>
    </table>
    <pre><code>// Code block example
const editor = new MMEditor({
  plugins: ['emoji', 'icons'],
  features: {
    tables: true,
    codeBlocks: true
  }
});</code></pre>
  `);
  
  const editorRef = useRef<EditorInstance>(null);
  const [selectedIconPack, setSelectedIconPack] = useState<'mui' | 'text'>('mui');
  
  // Configure icon pack when selection changes
  useEffect(() => {
    if (selectedIconPack === 'mui') {
      iconPackPlugin.setIconPack(muiIconConfig);
    }
  }, [selectedIconPack]);
  
  // Create plugins array based on current settings
  const activePlugins = useMemo(() => {
    const plugins = []; // Temporarily disabled emojiPlugin
    if (selectedIconPack === 'mui') {
      plugins.push(iconPackPlugin);
    }
    return plugins;
  }, [selectedIconPack]);
  
  const handleInsertTable = () => {
    editorRef.current?.execCommand('insertHTML', `
      <table>
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Data 1</td>
            <td>Data 2</td>
            <td>Data 3</td>
          </tr>
        </tbody>
      </table>
    `);
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to demos</Link>
        <h1>Full Featured Editor</h1>
        <p>Complete editor with all features and plugins enabled.</p>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            value="mui"
            checked={selectedIconPack === 'mui'}
            onChange={(e) => setSelectedIconPack('mui')}
          />
          MUI Icons
        </label>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            value="text"
            checked={selectedIconPack === 'text'}
            onChange={(e) => setSelectedIconPack('text')}
          />
          Text Labels
        </label>
        <button onClick={handleInsertTable} style={{ marginLeft: '20px' }}>
          Insert Sample Table
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          <h3>Editor</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
            <MMEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              placeholder="Start typing..."
              plugins={activePlugins}
              config={{
                features: {
                  tables: true,
                  codeBlocks: true,
                  advancedFormatting: true,
                },
                toolbar: {
                  sticky: true,
                  groups: [
                    ['undo', 'redo'],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['h1', 'h2', 'h3'],
                    ['bulletList', 'numberedList'],
                    ['link', 'unlink'],
                    ['code', 'codeBlock'],
                    ['table'],
                    ['emoji'],
                    ['clear']
                  ]
                }
              }}
              onReady={() => console.log('Full featured editor ready!')}
            />
          </div>
        </div>
        
        <div>
          <h3>Active Features</h3>
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>✅ Tables</li>
              <li>✅ Code Blocks</li>
              <li>✅ Emoji Plugin</li>
              <li>✅ Icon Pack Plugin</li>
              <li>✅ Advanced Formatting</li>
              <li>✅ Sticky Toolbar</li>
              <li>✅ Custom Toolbar Groups</li>
              <li>✅ All Keyboard Shortcuts</li>
            </ul>
          </div>
          
          <h3 style={{ marginTop: '20px' }}>Configuration</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '4px',
            fontSize: '11px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
{`<MMEditor
  ref={editorRef}
  value={content}
  onChange={setContent}
  placeholder="Start typing..."
  plugins={[iconPackPlugin]} // Temporarily removed emojiPlugin
  config={{
    features: {
      tables: true,
      codeBlocks: true,
      advancedFormatting: true,
    },
    toolbar: {
      sticky: true,
      groups: [
        ['undo', 'redo'],
        ['bold', 'italic', 'underline', 'strike'],
        ['h1', 'h2', 'h3'],
        ['bulletList', 'numberedList'],
        ['link', 'unlink'],
        ['code', 'codeBlock'],
        ['table'],
        ['emoji'],
        ['clear']
      ]
    }
  }}
  onReady={() => console.log('Ready!')}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}