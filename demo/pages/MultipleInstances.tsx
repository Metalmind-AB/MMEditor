import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MMEditor } from '../../src';
import type { EditorInstance, ToolbarConfig } from '../../src';

export function MultipleInstances() {
  // Individual editor states
  const [commentContent, setCommentContent] = useState('<p>Add your comment here...</p>');
  const [noteContent, setNoteContent] = useState('<p>Quick notes and reminders</p>');
  const [articleContent, setArticleContent] = useState('<h2>Article Title</h2><p>Main article content goes here...</p>');
  
  // Synchronized editor states
  const [syncedContent, setSyncedContent] = useState('<p>This content is <strong>synchronized</strong> between all instances below.</p>');
  const [wordCount, setWordCount] = useState(0);
  
  const commentRef = useRef<EditorInstance>(null);
  const noteRef = useRef<EditorInstance>(null);
  const articleRef = useRef<EditorInstance>(null);

  // Update word count whenever synced content changes
  useEffect(() => {
    const text = syncedContent.replace(/<[^>]*>/g, ''); // Strip HTML tags
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [syncedContent]);

  // Specialized toolbar configurations
  const commentToolbar: ToolbarConfig = {
    groups: [
      { name: 'basic', items: ['bold', 'italic'] },
      { name: 'structure', items: ['bullet'] },
    ],
  };

  const noteToolbar: ToolbarConfig = {
    groups: [
      { name: 'format', items: ['bold', 'italic', 'underline', 'code'] },
      { name: 'structure', items: ['bullet', 'number'] },
    ],
  };

  const articleToolbar: ToolbarConfig = {
    groups: [
      { name: 'text', items: ['bold', 'italic', 'underline'] },
      { name: 'headings', items: ['h1', 'h2', 'h3'] },
      { name: 'structure', items: ['bullet', 'number'] },
      { name: 'content', items: ['link', 'code'] },
      { name: 'table', items: ['table'] },
    ],
  };

  const syncedToolbar: ToolbarConfig = {
    groups: [
      { name: 'format', items: ['bold', 'italic', 'underline', 'strike'] },
      { name: 'structure', items: ['bullet', 'number'] },
    ],
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to demos</Link>
        <h1>Multiple Editor Instances</h1>
        <p>Demonstrate independent editors and synchronized editing scenarios.</p>
      </div>

      {/* Independent Instances Section */}
      <section style={{ marginBottom: '50px' }}>
        <h2>Independent Editor Instances</h2>
        <p>Each editor operates independently with its own configuration and content.</p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Comment Editor */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <h3 style={{ marginTop: 0, color: '#2563eb' }}>💬 Comment Editor</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 10px 0' }}>
              Minimal toolbar for user comments and feedback
            </p>
            <MMEditor
              ref={commentRef}
              value={commentContent}
              onChange={setCommentContent}
              placeholder="Leave a comment..."
              toolbar={commentToolbar}
            />
            <div style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#888',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Features: Bold, Italic, Lists</span>
              <span>{commentContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).length} words</span>
            </div>
          </div>

          {/* Note Editor */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <h3 style={{ marginTop: 0, color: '#16a34a' }}>📝 Quick Notes</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 10px 0' }}>
              Note-taking with formatting and inline code
            </p>
            <MMEditor
              ref={noteRef}
              value={noteContent}
              onChange={setNoteContent}
              placeholder="Jot down your notes..."
              toolbar={noteToolbar}
            />
            <div style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#888',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Features: Code, Lists, Formatting</span>
              <span>{noteContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).length} words</span>
            </div>
          </div>

          {/* Article Editor */}
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '15px',
            gridColumn: 'span 2',
            minWidth: '100%'
          }}>
            <h3 style={{ marginTop: 0, color: '#dc2626' }}>📰 Article Editor</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 10px 0' }}>
              Full-featured editor for long-form content
            </p>
            <MMEditor
              ref={articleRef}
              value={articleContent}
              onChange={setArticleContent}
              placeholder="Write your article..."
              toolbar={articleToolbar}
            />
            <div style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#888',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Features: Headings, Tables, Links, Full Formatting</span>
              <span>{articleContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).length} words</span>
            </div>
          </div>
        </div>
      </section>

      {/* Synchronized Instances Section */}
      <section style={{ marginBottom: '50px' }}>
        <h2>Synchronized Editor Instances</h2>
        <p>Multiple editors sharing the same content state - changes in one appear in all others.</p>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>Shared Word Count: {wordCount} words</strong>
          <br />
          <small style={{ color: '#666' }}>
            Edit in any editor below to see real-time synchronization
          </small>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '20px'
        }}>
          {/* Synced Editor 1 */}
          <div style={{ border: '2px solid #3b82f6', borderRadius: '8px', padding: '15px' }}>
            <h4 style={{ marginTop: 0, color: '#3b82f6' }}>Editor Instance A</h4>
            <MMEditor
              value={syncedContent}
              onChange={setSyncedContent}
              placeholder="Type here..."
              toolbar={syncedToolbar}
            />
          </div>

          {/* Synced Editor 2 */}
          <div style={{ border: '2px solid #10b981', borderRadius: '8px', padding: '15px' }}>
            <h4 style={{ marginTop: 0, color: '#10b981' }}>Editor Instance B</h4>
            <MMEditor
              value={syncedContent}
              onChange={setSyncedContent}
              placeholder="Or type here..."
              toolbar={syncedToolbar}
            />
          </div>

          {/* Synced Editor 3 - Read-only */}
          <div style={{ border: '2px solid #8b5cf6', borderRadius: '8px', padding: '15px' }}>
            <h4 style={{ marginTop: 0, color: '#8b5cf6' }}>Read-Only Preview</h4>
            <MMEditor
              value={syncedContent}
              onChange={() => {}} // No-op for read-only
              readOnly={true}
              toolbar={false}
            />
            <div style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#8b5cf6',
              fontStyle: 'italic'
            }}>
              This instance shows the content but cannot be edited
            </div>
          </div>
        </div>
      </section>

      {/* Configuration Examples */}
      <section>
        <h2>Implementation Examples</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
          gap: '20px'
        }}>
          {/* Independent Instances */}
          <div>
            <h3>Independent Instances</h3>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
{`// Each editor has its own state
const [commentContent, setCommentContent] = useState('');
const [noteContent, setNoteContent] = useState('');
const [articleContent, setArticleContent] = useState('');

// Different toolbar configurations
const commentToolbar = {
  groups: [
    { name: 'basic', items: ['bold', 'italic'] },
    { name: 'structure', items: ['bullet'] },
  ],
};

// Independent editors
<MMEditor
  value={commentContent}
  onChange={setCommentContent}
  toolbar={commentToolbar}
/>
<MMEditor
  value={noteContent}
  onChange={setNoteContent}
  toolbar={noteToolbar}
/>`}
            </pre>
          </div>

          {/* Synchronized Instances */}
          <div>
            <h3>Synchronized Instances</h3>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
{`// Shared state across multiple editors
const [syncedContent, setSyncedContent] = useState('');

// All editors use the same state
<MMEditor
  value={syncedContent}
  onChange={setSyncedContent}
  toolbar={toolbarA}
/>
<MMEditor
  value={syncedContent}
  onChange={setSyncedContent}
  toolbar={toolbarB}
/>
<MMEditor
  value={syncedContent}
  onChange={() => {}} // Read-only
  readOnly={true}
  toolbar={false}
/>`}
            </pre>
          </div>
        </div>

        {/* Use Cases Table */}
        <div style={{ marginTop: '30px' }}>
          <h3>Common Use Cases</h3>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px',
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Scenario</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Implementation</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Benefits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Comment System</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Independent editors with minimal toolbars</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Isolated content, user-specific formatting</td>
              </tr>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Collaborative Editing</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Synchronized state with different views</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Real-time collaboration, multiple perspectives</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Form Fields</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Multiple independent editors in form</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Rich text in forms, separate validation</td>
              </tr>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>Preview Modes</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Edit + read-only preview instances</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>Side-by-side editing and preview</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}