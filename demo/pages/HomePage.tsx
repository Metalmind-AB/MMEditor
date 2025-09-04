import React from 'react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>MMEditor Demo Configurations</h1>
      <p>Choose a configuration to see different ways to integrate MMEditor:</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '40px'
      }}>
        <DemoCard
          title="Basic Editor"
          description="Simple editor with default toolbar and basic formatting options"
          link="/basic"
          features={['Default toolbar', 'Basic formatting', 'HTML input/output']}
        />
        
        <DemoCard
          title="Full Featured"
          description="Complete editor with all features enabled including tables, plugins, and advanced formatting"
          link="/full"
          features={['Tables', 'Plugins', 'Code blocks', 'Custom icons']}
        />
        
        <DemoCard
          title="Minimal Editor"
          description="Stripped down editor with only essential formatting tools"
          link="/minimal"
          features={['Bold/Italic only', 'No toolbar icons', 'Compact size']}
        />
        
        <DemoCard
          title="Custom Toolbar"
          description="Multiple toolbar configurations with custom buttons and specialized layouts"
          link="/custom-toolbar"
          features={['Custom actions', 'Word count', 'Text transforms', 'Multiple configs']}
        />
        
        <DemoCard
          title="Read-Only Mode"
          description="Editor configured as a read-only viewer with no editing capabilities"
          link="/readonly"
          features={['View only', 'No toolbar', 'Content display']}
        />
        
        <DemoCard
          title="No Toolbar"
          description="Editor without toolbar, relying on keyboard shortcuts only"
          link="/no-toolbar"
          features={['Keyboard only', 'No visual toolbar', 'Power user mode']}
        />
        
        <DemoCard
          title="Dark Theme"
          description="Editor pre-configured with dark theme and custom styling"
          link="/dark"
          features={['Dark mode', 'Custom CSS', 'Theme variables']}
        />
        
        <DemoCard
          title="Multiple Instances"
          description="Independent and synchronized editor instances demonstrating various multi-editor scenarios"
          link="/multiple"
          features={['Independent states', 'Synchronized editing', 'Specialized configs', 'Real-time sync']}
        />
      </div>
    </div>
  );
}

interface DemoCardProps {
  title: string;
  description: string;
  link: string;
  features: string[];
}

function DemoCard({ title, description, link, features }: DemoCardProps) {
  return (
    <Link 
      to={link}
      style={{ 
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: 'white',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>{description}</p>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          margin: '16px 0 0 0'
        }}>
          {features.map((feature, idx) => (
            <li key={idx} style={{ 
              fontSize: '13px',
              color: '#444',
              padding: '4px 0'
            }}>
              ✓ {feature}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}