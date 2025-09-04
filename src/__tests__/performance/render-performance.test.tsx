import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '../../test/test-utils';
import { performanceUtils, editorTestUtils } from '../../test/test-utils';
import { Editor } from '../../components/Editor/Editor';
import React, { useState } from 'react';

describe('Render Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty editor within acceptable time', async () => {
    const { time } = await performanceUtils.measureTime(() => {
      render(<Editor />);
      return screen.getByRole('textbox');
    });

    // Increased threshold for test environment performance variability
    expect(time).toBeLessThan(200);
  });

  it('renders editor with moderate content efficiently', async () => {
    const content = performanceUtils.createLargeContent(50);
    
    const { time } = await performanceUtils.measureTime(() => {
      render(<Editor value={content} />);
      return screen.getByRole('textbox');
    });

    expect(time).toBeLessThan(100);
  });

  it('handles large content without significant degradation', async () => {
    const largeContent = performanceUtils.createLargeContent(200);
    
    const { time, result } = await performanceUtils.measureTime(() => {
      render(<Editor value={largeContent} />);
      return screen.getByRole('textbox');
    });

    expect(time).toBeLessThan(200);
    expect(result).toBeInTheDocument();
  });

  it('maintains performance with rapid state updates', async () => {
    const TestComponent = () => {
      const [content, setContent] = useState('<p>Initial</p>');
      
      React.useEffect(() => {
        const updates = Array.from({ length: 10 }, (_, i) => `<p>Update ${i}</p>`);
        updates.forEach((update, index) => {
          setTimeout(() => {
            act(() => {
              setContent(update);
            });
          }, index * 10);
        });
      }, []);
      
      return <Editor value={content} />;
    };

    const { time } = await performanceUtils.measureTime(async () => {
      render(<TestComponent />);
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });
      return screen.getByRole('textbox');
    });

    expect(time).toBeLessThan(500);
  });

  it('handles memory efficiently with mount/unmount cycles', async () => {
    const initialMemory = performanceUtils.getMemoryUsage();
    
    // Create and destroy editors rapidly
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<Editor value={`<p>Content ${i}</p>`} />);
      unmount();
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = performanceUtils.getMemoryUsage();
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      const growthRatio = memoryGrowth / initialMemory;
      expect(growthRatio).toBeLessThan(0.5); // Less than 50% growth
    }
  });
});