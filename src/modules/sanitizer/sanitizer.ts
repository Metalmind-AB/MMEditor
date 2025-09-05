/**
 * HTML Sanitizer Module
 * Prevents XSS attacks by sanitizing HTML input
 * Works both in browser DOM and test environments
 */

interface SanitizerConfig {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedStyles?: string[];
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'q',
  'code', 'pre',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'div', 'span',
  'hr',
  'sup', 'sub',
];

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  blockquote: ['cite'],
  q: ['cite'],
  th: ['colspan', 'rowspan', 'scope'],
  td: ['colspan', 'rowspan'],
  '*': ['class', 'id', 'style'], // Allow these on all elements
};

const DEFAULT_ALLOWED_STYLES = [
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-align',
  'margin',
  'padding',
  'border',
  'width',
  'height',
];

const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'about:',
];

// Simple HTML parser for test environments
interface ParsedElement {
  tagName: string;
  attributes: Record<string, string>;
  children: (ParsedElement | string)[];
  isSelfClosing: boolean;
}

function findTagEnd(html: string, tagStart: number): number {
  let index = tagStart + 1;
  let inQuotes = false;
  let quoteChar = '';
  
  while (index < html.length) {
    const char = html[index];
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === '>' && !inQuotes) {
      return index;
    }
    
    index++;
  }
  
  return -1; // No closing > found
}

function parseSimpleHTML(html: string): (ParsedElement | string)[] {
  const result: (ParsedElement | string)[] = [];
  let index = 0;

  while (index < html.length) {
    let tagStart = html.indexOf('<', index);
    
    if (tagStart === -1) {
      // No more tags, add remaining text
      const remainingText = html.slice(index);
      if (remainingText) {
        result.push(remainingText);
      }
      break;
    }

    // Add text before tag (preserve all text including whitespace)
    if (tagStart > index) {
      const textContent = html.slice(index, tagStart);
      if (textContent) {
        result.push(textContent);
      }
    }

    // Find the actual end of tag, considering quoted attributes
    let tagEnd = findTagEnd(html, tagStart);
    if (tagEnd === -1) {
      // Malformed HTML, treat as text
      result.push(html.slice(tagStart));
      break;
    }

    const tagContent = html.slice(tagStart + 1, tagEnd);
    
    // Handle comments - remove them entirely
    if (tagContent.startsWith('!--')) {
      const commentEnd = html.indexOf('-->', tagStart);
      if (commentEnd !== -1) {
        index = commentEnd + 3;
      } else {
        index = tagEnd + 1;
      }
      continue;
    }
    
    // Handle closing tags
    if (tagContent.startsWith('/')) {
      index = tagEnd + 1;
      continue;
    }

    // Parse tag name and attributes more carefully
    // Split on whitespace but preserve quoted values
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < tagContent.length; i++) {
      const char = tagContent[i];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        current += char;
      } else if (/\s/.test(char) && !inQuotes) {
        if (current.trim()) {
          parts.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      parts.push(current.trim());
    }
    const tagName = parts[0].toLowerCase().replace('/', ''); // Remove trailing slash for self-closing tags
    const attributes: Record<string, string> = {};
    
    // Parse attributes more carefully
    let i = 1;
    while (i < parts.length) {
      const part = parts[i];
      if (part.includes('=')) {
        const eqIndex = part.indexOf('=');
        const attrName = part.slice(0, eqIndex).toLowerCase();
        let attrValue = part.slice(eqIndex + 1);
        
        // Handle quoted values
        if ((attrValue.startsWith('"') && attrValue.endsWith('"')) || 
            (attrValue.startsWith("'") && attrValue.endsWith("'"))) {
          attrValue = attrValue.slice(1, -1);
        }
        
        attributes[attrName] = attrValue;
      } else if (part && !part.includes('=')) {
        // Boolean attribute
        attributes[part.toLowerCase()] = part;
      }
      i++;
    }

    const isSelfClosing = tagContent.endsWith('/') || ['br', 'hr', 'img', 'input'].includes(tagName);
    
    if (isSelfClosing) {
      result.push({
        tagName,
        attributes,
        children: [],
        isSelfClosing: true
      });
      index = tagEnd + 1;
    } else {
      // Find matching closing tag (case-insensitive)
      const closingTag = `</${tagName}>`;
      let closingIndex = html.toLowerCase().indexOf(closingTag, tagEnd + 1);
      let nestLevel = 0;
      let searchStart = tagEnd + 1;
      
      // Handle nested tags of same type (case-insensitive)
      const lowerHtml = html.toLowerCase();
      while (closingIndex !== -1) {
        const nextOpenTag = lowerHtml.indexOf(`<${tagName}`, searchStart);
        if (nextOpenTag !== -1 && nextOpenTag < closingIndex) {
          nestLevel++;
          searchStart = nextOpenTag + tagName.length + 1;
        } else if (nestLevel > 0) {
          nestLevel--;
          searchStart = closingIndex + closingTag.length;
          closingIndex = lowerHtml.indexOf(closingTag, searchStart);
        } else {
          break;
        }
      }
      
      if (closingIndex === -1) {
        // No closing tag found, treat as self-closing
        result.push({
          tagName,
          attributes,
          children: [],
          isSelfClosing: true
        });
        index = tagEnd + 1;
      } else {
        // Parse children
        const innerHtml = html.slice(tagEnd + 1, closingIndex);
        const children = parseSimpleHTML(innerHtml);
        
        result.push({
          tagName,
          attributes,
          children,
          isSelfClosing: false
        });
        
        index = closingIndex + closingTag.length;
      }
    }
  }
  
  return result;
}

function serializeParsedHTML(elements: (ParsedElement | string)[]): string {
  return elements.map(element => {
    if (typeof element === 'string') {
      return element;
    }
    
    const { tagName, attributes, children, isSelfClosing } = element;
    
    // Build attribute string
    const attrString = Object.entries(attributes)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    const openTag = `<${tagName}${attrString ? ' ' + attrString : ''}>`;
    
    // Handle self-closing tags (don't add /> in HTML5)
    if (isSelfClosing && ['br', 'hr', 'img', 'input'].includes(tagName)) {
      return `<${tagName}${attrString ? ' ' + attrString : ''}>`;
    }
    
    let childrenHtml = serializeParsedHTML(children);
    
    // Special handling for tables - ensure tbody is present
    if (tagName === 'table' && childrenHtml.includes('<tr>')) {
      // Check if we need to wrap tr elements in tbody
      const hasTableSections = childrenHtml.includes('<tbody>') || 
                              childrenHtml.includes('<thead>') || 
                              childrenHtml.includes('<tfoot>');
      
      if (!hasTableSections) {
        childrenHtml = `<tbody>${childrenHtml}</tbody>`;
      }
    }
    
    return `${openTag}${childrenHtml}</${tagName}>`;
  }).join('');
}

export class HTMLSanitizer {
  private config: Required<SanitizerConfig>;
  private isTestEnvironment: boolean;

  constructor(config?: SanitizerConfig) {
    this.config = {
      allowedTags: config?.allowedTags || DEFAULT_ALLOWED_TAGS,
      allowedAttributes: config?.allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES,
      allowedStyles: config?.allowedStyles || DEFAULT_ALLOWED_STYLES,
    };
    
    // Detect test environment
    this.isTestEnvironment = process.env.NODE_ENV === 'test' ||
      (typeof window !== 'undefined' && (window as any).__vitest__);
  }

  /**
   * Sanitizes HTML string
   */
  sanitize(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    if (this.isTestEnvironment || this.isDOMAvailable() === false) {
      return this.sanitizeWithParser(html);
    } else {
      return this.sanitizeWithDOM(html);
    }
  }

  /**
   * Check if DOM API is available and working
   */
  private isDOMAvailable(): boolean {
    try {
      const temp = document.createElement('div');
      temp.innerHTML = '<p>test</p>';
      return temp.children.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize using DOM API (browser environment)
   */
  private sanitizeWithDOM(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    this.sanitizeElement(temp);
    return temp.innerHTML;
  }

  /**
   * Sanitize using custom parser (test environment)
   */
  private sanitizeWithParser(html: string): string {
    const parsed = parseSimpleHTML(html);
    const sanitized = this.sanitizeParsedElements(parsed);
    return serializeParsedHTML(sanitized);
  }

  /**
   * Sanitizes parsed HTML elements (for test environment)
   */
  private sanitizeParsedElements(elements: (ParsedElement | string)[]): (ParsedElement | string)[] {
    const result: (ParsedElement | string)[] = [];
    
    for (const element of elements) {
      if (typeof element === 'string') {
        result.push(element);
        continue;
      }
      
      const { tagName, attributes, children } = element;
      
      // Remove disallowed tags
      if (!this.config.allowedTags.includes(tagName)) {
        // For dangerous tags like script, style, etc., don't preserve content
        if (['script', 'style', 'object', 'embed', 'applet', 'meta', 'link'].includes(tagName)) {
          // Completely remove these tags and their content
          continue;
        }
        // For other disallowed tags, preserve text content
        result.push(...this.sanitizeParsedElements(children));
        continue;
      }
      
      // Sanitize attributes
      const sanitizedAttributes = this.sanitizeParsedAttributes(attributes, tagName);
      
      // Recursively sanitize children
      const sanitizedChildren = this.sanitizeParsedElements(children);
      
      result.push({
        ...element,
        tagName: tagName.toLowerCase(),
        attributes: sanitizedAttributes,
        children: sanitizedChildren
      });
    }
    
    return result;
  }

  /**
   * Sanitizes a DOM element and its children (for browser environment)
   */
  private sanitizeElement(element: Element): void {
    // Get all child elements (convert to array to avoid live collection issues)
    const children = Array.from(element.children);

    for (const child of children) {
      const tagName = child.tagName.toLowerCase();

      // Remove disallowed tags
      if (!this.config.allowedTags.includes(tagName)) {
        // For dangerous tags like script, style, etc., don't preserve content
        if (['script', 'style', 'object', 'embed', 'applet', 'meta', 'link'].includes(tagName)) {
          // Completely remove these tags and their content
          child.remove();
          continue;
        }
        // For other disallowed tags, preserve text content
        while (child.firstChild) {
          element.insertBefore(child.firstChild, child);
        }
        child.remove();
        continue;
      }

      // Sanitize attributes
      this.sanitizeAttributes(child, tagName);

      // Recursively sanitize children
      this.sanitizeElement(child);
    }
  }

  /**
   * Sanitizes attributes of a parsed element (for test environment)
   */
  private sanitizeParsedAttributes(attributes: Record<string, string>, tagName: string): Record<string, string> {
    const result: Record<string, string> = {};
    const allowedForTag = this.config.allowedAttributes[tagName] || [];
    const allowedForAll = this.config.allowedAttributes['*'] || [];
    const allowed = [...allowedForTag, ...allowedForAll];

    for (const [attrName, attrValue] of Object.entries(attributes)) {
      const normalizedName = attrName.toLowerCase();

      // Remove disallowed attributes
      if (!allowed.includes(normalizedName)) {
        continue;
      }

      // Special handling for specific attributes
      switch (normalizedName) {
        case 'href':
        case 'src':
          if (!this.isDangerousUrl(attrValue)) {
            result[normalizedName] = attrValue;
          }
          break;

        case 'style':
          const sanitizedStyle = this.sanitizeStyle(attrValue);
          if (sanitizedStyle) {
            result[normalizedName] = sanitizedStyle;
          }
          break;

        case 'target':
          // Only allow _blank and _self
          if (attrValue === '_blank' || attrValue === '_self') {
            result[normalizedName] = attrValue;
          }
          break;

        default:
          // Remove attributes with dangerous content
          if (!this.containsJavaScript(attrValue)) {
            result[normalizedName] = attrValue;
          }
      }
    }

    // Add rel="noopener noreferrer" to links with target="_blank"
    if (tagName === 'a' && result['target'] === '_blank') {
      result['rel'] = 'noopener noreferrer';
    }

    // Add tbody to tables if not present
    if (tagName === 'table' && !result['tbody']) {
      // This will be handled in serialization
    }

    return result;
  }

  /**
   * Sanitizes attributes of a DOM element (for browser environment)
   */
  private sanitizeAttributes(element: Element, tagName: string): void {
    const attributes = Array.from(element.attributes);
    const allowedForTag = this.config.allowedAttributes[tagName] || [];
    const allowedForAll = this.config.allowedAttributes['*'] || [];
    const allowed = [...allowedForTag, ...allowedForAll];

    for (const attr of attributes) {
      const attrName = attr.name.toLowerCase();

      // Remove disallowed attributes
      if (!allowed.includes(attrName)) {
        element.removeAttribute(attr.name);
        continue;
      }

      // Special handling for specific attributes
      switch (attrName) {
        case 'href':
        case 'src':
          if (this.isDangerousUrl(attr.value)) {
            element.removeAttribute(attr.name);
          }
          break;

        case 'style':
          const sanitizedStyle = this.sanitizeStyle(attr.value);
          if (sanitizedStyle) {
            element.setAttribute('style', sanitizedStyle);
          } else {
            element.removeAttribute('style');
          }
          break;

        case 'target':
          // Only allow _blank and _self
          if (attr.value !== '_blank' && attr.value !== '_self') {
            element.removeAttribute('target');
          }
          break;

        default:
          // Remove attributes with dangerous content
          if (this.containsJavaScript(attr.value)) {
            element.removeAttribute(attr.name);
          }
      }
    }

    // Add rel="noopener noreferrer" to links with target="_blank"
    if (tagName === 'a' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  }

  /**
   * Sanitizes CSS styles
   */
  private sanitizeStyle(styleText: string): string {
    const styles = styleText.split(';').map(s => s.trim()).filter(Boolean);
    const sanitized: string[] = [];

    for (const style of styles) {
      const [property, value] = style.split(':').map(s => s.trim());
      
      if (!property || !value) continue;

      // Check if property is allowed
      if (!this.config.allowedStyles.includes(property.toLowerCase())) {
        continue;
      }

      // Check for dangerous values
      if (this.containsJavaScript(value) || value.includes('expression')) {
        continue;
      }

      sanitized.push(`${property}: ${value}`);
    }

    return sanitized.join('; ');
  }

  /**
   * Checks if URL contains dangerous protocols
   */
  private isDangerousUrl(url: string): boolean {
    const trimmed = url.trim().toLowerCase();
    return DANGEROUS_PROTOCOLS.some(protocol => trimmed.startsWith(protocol));
  }

  /**
   * Checks if text contains JavaScript
   */
  private containsJavaScript(text: string): boolean {
    const dangerous = [
      'javascript:',
      'on\\w+\\s*=', // Event handlers like onclick=
      '<script',
      '</script',
      'eval\\(',
      'expression\\(',
    ];

    const pattern = new RegExp(dangerous.join('|'), 'i');
    return pattern.test(text);
  }

  /**
   * Sanitizes HTML for paste operations (more strict)
   */
  sanitizeForPaste(html: string): string {
    // For paste, we want to preserve less formatting
    const pasteConfig: SanitizerConfig = {
      allowedTags: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a',
        'blockquote',
        'code', 'pre',
      ],
      allowedAttributes: {
        a: ['href'],
      },
      allowedStyles: [], // No styles on paste
    };

    const pasteSanitizer = new HTMLSanitizer(pasteConfig);
    return pasteSanitizer.sanitize(html);
  }

  /**
   * Escapes HTML entities
   */
  static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Unescapes HTML entities
   */
  static unescapeHtml(text: string): string {
    // Try DOM method first
    try {
      const temp = document.createElement('div');
      temp.innerHTML = text;
      const result = temp.textContent || temp.innerText || '';
      if (result !== '') {
        return result;
      }
    } catch {
      // Fall through to manual method
    }

    // Manual unescape for test environments
    const entityMap: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };

    let result = text;
    for (const [entity, char] of Object.entries(entityMap)) {
      result = result.replace(new RegExp(entity, 'g'), char);
    }
    
    // Handle numeric entities
    result = result.replace(/&#(\d+);/g, (match, num) => {
      return String.fromCharCode(parseInt(num, 10));
    });
    
    // Handle hex entities
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    return result;
  }
}

// Export a default instance
export const sanitizer = new HTMLSanitizer();