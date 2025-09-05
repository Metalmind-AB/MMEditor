import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/basic');
    // Wait for editor to be ready
    await page.waitForSelector('[role="textbox"]');
  });

  test('editor initial state', async ({ page }) => {
    // Take screenshot of clean editor
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('editor-initial.png');
  });

  test('editor with content', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    await editor.click();
    await editor.type('This is sample content with formatting.');
    
    // Apply bold to selected text
    await page.keyboard.press('Control+a');
    await page.locator('[aria-label="Bold (Ctrl+B)"]').click();
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('editor-with-bold-content.png');
  });

  test('toolbar hover states', async ({ page }) => {
    // Hover over bold button
    await page.locator('[aria-label="Bold (Ctrl+B)"]').hover();
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('toolbar-bold-hover.png');
  });

  test('dropdown open state', async ({ page }) => {
    // Open heading dropdown
    await page.locator('text=Normal').click();
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('heading-dropdown-open.png');
  });

  test('list formatting', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    await editor.click();
    await editor.type('First item\nSecond item\nThird item');
    
    // Select all and apply bullet list
    await page.keyboard.press('Control+a');
    await page.locator('[aria-label="Bullet List"]').click();
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('bullet-list.png');
  });

  test('mixed formatting', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    await editor.click();
    await editor.type('This text has ');
    
    // Add bold text
    await page.locator('[aria-label="Bold (Ctrl+B)"]').click();
    await editor.type('bold');
    await page.locator('[aria-label="Bold (Ctrl+B)"]').click();
    
    await editor.type(' and ');
    
    // Add italic text
    await page.locator('[aria-label="Italic (Ctrl+I)"]').click();
    await editor.type('italic');
    await page.locator('[aria-label="Italic (Ctrl+I)"]').click();
    
    await editor.type(' formatting.');
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('mixed-formatting.png');
  });

  test('responsive layout - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('mobile-layout.png');
  });

  test('responsive layout - tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('tablet-layout.png');
  });

  test('focus states', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    // Focus the editor
    await editor.focus();
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('editor-focused.png');
  });

  test('error states', async ({ page }) => {
    // Test with invalid content (this would trigger error handling)
    await page.evaluate(() => {
      const editor = document.querySelector('[role="textbox"]') as HTMLElement;
      if (editor) {
        // Trigger an error state by setting invalid HTML
        editor.innerHTML = '<invalid-tag>Content</invalid-tag>';
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // Wait for any error state to be rendered
    await page.waitForTimeout(100);
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('error-state.png');
  });

  test('dark theme (if available)', async ({ page }) => {
    // Check if dark theme is available
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(200); // Wait for theme transition
      
      await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('dark-theme.png');
    }
  });
});

// Cross-browser visual consistency tests
test.describe('Cross-browser Visual Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/basic');
    await page.waitForSelector('[role="textbox"]');
  });

  test('consistent rendering across browsers', async ({ page, browserName }) => {
    const editor = page.locator('[role="textbox"]');
    
    // Add standard content
    await editor.click();
    await editor.type('Standard text with formatting test.');
    await page.keyboard.press('Control+a');
    await page.locator('[aria-label="Bold (Ctrl+B)"]').click();
    
    // Take screenshot with browser name
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot(`cross-browser-${browserName}.png`);
  });

  test('toolbar consistency', async ({ page, browserName }) => {
    // Focus on toolbar for consistent rendering
    await expect(page.locator('[class*="toolbar"]')).toHaveScreenshot(`toolbar-${browserName}.png`);
  });
});

// Performance visual tests
test.describe('Performance Visual Tests', () => {
  test('large content rendering', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    // Add large amount of content
    await editor.click();
    for (let i = 0; i < 10; i++) {
      await editor.type(`Paragraph ${i + 1}: This is a longer paragraph with more content to test rendering performance. `);
      await page.keyboard.press('Enter');
    }
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('large-content.png');
  });

  test('complex formatting rendering', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    await editor.click();
    
    // Create complex nested formatting
    await editor.type('Normal ');
    await page.locator('[aria-label="Bold (Ctrl+B)"]').click();
    await editor.type('bold ');
    await page.locator('[aria-label="Italic (Ctrl+I)"]').click();
    await editor.type('bold-italic ');
    await page.locator('[aria-label="Underline (Ctrl+U)"]').click();
    await editor.type('bold-italic-underline');
    
    await expect(page.locator('[role="textbox"] >> xpath=..')).toHaveScreenshot('complex-formatting.png');
  });
});