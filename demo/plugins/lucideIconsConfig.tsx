/**
 * Lucide Icons Configuration for Demo App
 * 
 * This file demonstrates how to use Lucide icons with the IconPackPlugin.
 * Lucide is a popular, lightweight icon library with clean, consistent icons.
 */

import React from 'react';
import type { IconPackConfig } from '../../src/plugins/icon-pack/IconPackPlugin';

// Lucide Icons - installed in demo app
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Code2,
  List,
  ListOrdered,
  Link,
  Unlink,
  Table,
  Eraser,
  Type,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';

/**
 * Lucide icons configuration
 */
export const lucideIconConfig: IconPackConfig = {
  type: 'lucide',
  icons: {
    bold: <Bold size={18} />,
    italic: <Italic size={18} />,
    underline: <Underline size={18} />,
    strike: <Strikethrough size={18} />,
    code: <Code size={18} />,
    'code-block': <Code2 size={18} />,
    bullet: <List size={18} />,
    number: <ListOrdered size={18} />,
    link: <Link size={18} />,
    unlink: <Unlink size={18} />,
    table: <Table size={18} />,
    clear: <Eraser size={18} />,
    h1: <Heading1 size={18} />,
    h2: <Heading2 size={18} />,
    h3: <Heading3 size={18} />,
  }
};