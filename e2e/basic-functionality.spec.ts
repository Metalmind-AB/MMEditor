import { test, expect } from '@playwright/test';

test.describe('MMEditor Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the editor correctly', async ({ page }) => {
    // Check that the editor is present
    await expect(page.locator('[role="textbox"]')).toBeVisible();
    
    // Check that the toolbar is present
    await expect(page.locator('[aria-label="Bold (Ctrl+B)"]')).toBeVisible();
    await expect(page.locator('[aria-label="Italic (Ctrl+I)"]')).toBeVisible();
    await expect(page.locator('[aria-label="Underline (Ctrl+U)"]')).toBeVisible();
  });

  test('allows typing text', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    await editor.click();
    await editor.type('Hello, this is test content!');
    
    await expect(editor).toContainText('Hello, this is test content!');
  });

  test('applies bold formatting', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    const boldButton = page.locator('[aria-label="Bold (Ctrl+B)"]');
    
    await editor.click();
    await editor.type('Test text');
    
    // Select all text
    await page.keyboard.press('Control+a');
    
    // Apply bold
    await boldButton.click();
    
    // Check for bold formatting
    await expect(editor.locator('strong, b')).toBeVisible();
  });

  test('applies italic formatting', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    const italicButton = page.locator('[aria-label="Italic (Ctrl+I)"]');
    
    await editor.click();
    await editor.type('Test text');
    
    // Select all text
    await page.keyboard.press('Control+a');
    
    // Apply italic
    await italicButton.click();
    
    // Check for italic formatting
    await expect(editor.locator('em, i')).toBeVisible();
  });

  test('creates bullet lists', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    const bulletButton = page.locator('[aria-label="Bullet List"]');
    
    await editor.click();
    await editor.type('First item');
    
    // Apply bullet list
    await page.keyboard.press('Control+a');
    await bulletButton.click();
    
    // Check for list formatting
    await expect(editor.locator('ul li')).toBeVisible();
  });

  test('creates numbered lists', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    const numberButton = page.locator('[aria-label="Numbered List"]');
    
    await editor.click();
    await editor.type('First item');
    
    // Apply numbered list
    await page.keyboard.press('Control+a');
    await numberButton.click();
    
    // Check for list formatting
    await expect(editor.locator('ol li')).toBeVisible();
  });

  test('uses heading formats', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    await editor.click();
    await editor.type('Heading text');
    
    // Select all text
    await page.keyboard.press('Control+a');
    
    // Click on the format dropdown
    await page.locator('text=Normal').click();
    
    // Select Heading 1
    await page.locator('text=Heading 1').click();
    
    // Check for heading formatting
    await expect(editor.locator('h1')).toBeVisible();
  });

  test('handles keyboard shortcuts', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    await editor.click();
    await editor.type('Shortcut test');
    
    // Select all text
    await page.keyboard.press('Control+a');
    
    // Test bold shortcut
    await page.keyboard.press('Control+b');
    await expect(editor.locator('strong, b')).toBeVisible();
    
    // Test italic shortcut
    await page.keyboard.press('Control+i');
    await expect(editor.locator('em, i')).toBeVisible();
  });

  test('maintains focus properly', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    
    await editor.click();
    
    // Editor should be focused
    await expect(editor).toBeFocused();
    
    // Type some text
    await page.keyboard.type('Focus test');
    await expect(editor).toContainText('Focus test');
  });
});

test.describe('MMEditor Cross-Browser Compatibility', () => {
  test('works consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    
    const editor = page.locator('[role="textbox"]');
    
    // Basic functionality should work in all browsers
    await editor.click();
    await editor.type('Cross-browser test');
    
    await expect(editor).toContainText('Cross-browser test');
    
    // Test formatting
    await page.keyboard.press('Control+a');
    await page.locator('[aria-label="Bold (Ctrl+B)"]').click();
    
    // Should have bold formatting (may vary by browser)
    const boldElement = editor.locator('strong, b');
    await expect(boldElement).toBeVisible();
    
    console.log(`Browser: ${browserName} - Test passed`);
  });
});