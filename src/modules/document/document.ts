/**
 * Document model - Delta-like operations for efficient document management
 */

export type OpType = 'insert' | 'delete' | 'retain' | 'format';

export interface Op {
  type: OpType;
  value?: string | number;
  attributes?: Record<string, unknown>;
}

export interface Delta {
  ops: Op[];
}

export class DocumentModel {
  private delta: Delta = { ops: [] };
  private html: string = '';
  private text: string = '';
  private isDirty: boolean = true;

  constructor(html?: string) {
    if (html) {
      this.setHTML(html);
    }
  }

  /**
   * Set document HTML and convert to delta
   */
  setHTML(html: string): void {
    this.html = html;
    this.delta = this.htmlToDelta(html);
    this.isDirty = false;
  }

  /**
   * Get document as HTML
   */
  getHTML(): string {
    if (this.isDirty) {
      this.html = this.deltaToHTML(this.delta);
      this.isDirty = false;
    }
    return this.html;
  }

  /**
   * Get plain text
   */
  getText(): string {
    if (this.isDirty) {
      this.text = this.deltaToText(this.delta);
    }
    return this.text;
  }

  /**
   * Get document length
   */
  getLength(): number {
    return this.getText().length;
  }

  /**
   * Apply an operation to the document
   */
  applyOp(op: Op): void {
    this.delta.ops.push(op);
    this.isDirty = true;
  }

  /**
   * Apply multiple operations (delta)
   */
  applyDelta(delta: Delta): void {
    this.delta.ops.push(...delta.ops);
    this.isDirty = true;
  }

  /**
   * Convert HTML to Delta operations
   */
  private htmlToDelta(html: string): Delta {
    const ops: Op[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          ops.push({ type: 'insert', value: text });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Track formatting attributes
        const attributes: Record<string, unknown> = {};
        
        switch (tagName) {
          case 'b':
          case 'strong':
            attributes.bold = true;
            break;
          case 'i':
          case 'em':
            attributes.italic = true;
            break;
          case 'u':
            attributes.underline = true;
            break;
          case 'strike':
          case 's':
            attributes.strike = true;
            break;
          case 'code':
            attributes.code = true;
            break;
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            attributes.header = parseInt(tagName[1]);
            break;
          case 'ul':
            attributes.list = 'bullet';
            break;
          case 'ol':
            attributes.list = 'ordered';
            break;
          case 'a':
            attributes.link = (element as HTMLAnchorElement).href;
            break;
          case 'pre':
            attributes.codeBlock = true;
            break;
        }
        
        // Process children with current attributes
        const savedOpsLength = ops.length;
        Array.from(node.childNodes).forEach(processNode);
        
        // Apply attributes to inserted ops
        if (Object.keys(attributes).length > 0) {
          for (let i = savedOpsLength; i < ops.length; i++) {
            if (ops[i].type === 'insert') {
              ops[i].attributes = { ...ops[i].attributes, ...attributes };
            }
          }
        }
        
        // Add block break for block elements
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'pre'].includes(tagName)) {
          ops.push({ type: 'insert', value: '\n' });
        }
      }
    };
    
    Array.from(doc.body.childNodes).forEach(processNode);
    
    return { ops };
  }

  /**
   * Convert Delta to HTML
   */
  private deltaToHTML(delta: Delta): string {
    let html = '';
    let currentBlock = '';
    let currentFormats: string[] = [];
    
    delta.ops.forEach(op => {
      if (op.type === 'insert' && typeof op.value === 'string') {
        let text = op.value;
        const attrs = op.attributes || {};
        
        // Apply inline formats
        if (attrs.bold) text = `<strong>${text}</strong>`;
        if (attrs.italic) text = `<em>${text}</em>`;
        if (attrs.underline) text = `<u>${text}</u>`;
        if (attrs.strike) text = `<strike>${text}</strike>`;
        if (attrs.code) text = `<code>${text}</code>`;
        if (attrs.link) text = `<a href="${attrs.link}">${text}</a>`;
        
        // Handle block formats
        if (attrs.header) {
          currentBlock = `h${attrs.header}`;
        } else if (attrs.codeBlock) {
          currentBlock = 'pre';
        } else if (!currentBlock) {
          currentBlock = 'p';
        }
        
        // Handle line breaks
        if (text === '\n') {
          if (currentBlock) {
            html += `<${currentBlock}>${currentFormats.join('')}</${currentBlock}>`;
            currentBlock = '';
            currentFormats = [];
          }
        } else {
          currentFormats.push(text);
        }
      }
    });
    
    // Close any remaining block
    if (currentFormats.length > 0) {
      if (!currentBlock) currentBlock = 'p';
      html += `<${currentBlock}>${currentFormats.join('')}</${currentBlock}>`;
    }
    
    return html;
  }

  /**
   * Convert Delta to plain text
   */
  private deltaToText(delta: Delta): string {
    return delta.ops
      .filter(op => op.type === 'insert' && typeof op.value === 'string')
      .map(op => op.value)
      .join('');
  }

  /**
   * Compose two deltas
   */
  static compose(delta1: Delta, delta2: Delta): Delta {
    const composed: Op[] = [...delta1.ops];
    
    delta2.ops.forEach(op => {
      if (op.type === 'retain' && typeof op.value === 'number') {
        // Skip retained content
      } else {
        composed.push(op);
      }
    });
    
    return { ops: composed };
  }

  /**
   * Get delta diff between two document states
   */
  static diff(oldDelta: Delta, newDelta: Delta): Delta {
    // Simplified diff - in production, use a proper diff algorithm
    return newDelta;
  }

  /**
   * Optimize delta operations
   */
  optimize(): void {
    const optimized: Op[] = [];
    let current: Op | null = null;
    
    this.delta.ops.forEach(op => {
      if (current && current.type === op.type && 
          JSON.stringify(current.attributes) === JSON.stringify(op.attributes)) {
        // Merge consecutive similar operations
        if (current.type === 'insert' && typeof current.value === 'string' && 
            typeof op.value === 'string') {
          current.value += op.value;
        } else if (current.type === 'delete' && typeof current.value === 'number' && 
                   typeof op.value === 'number') {
          current.value += op.value;
        } else {
          optimized.push(op);
          current = op;
        }
      } else {
        if (current) optimized.push(current);
        current = op;
      }
    });
    
    if (current) optimized.push(current);
    this.delta.ops = optimized;
  }
}