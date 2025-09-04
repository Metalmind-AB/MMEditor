/**
 * Heroicons Configuration for Demo App
 * 
 * Heroicons is a beautiful set of hand-crafted SVG icons by the makers of Tailwind CSS.
 * It offers both outline and solid styles for each icon.
 */

import React from 'react';
import type { IconPackConfig } from '../../src/plugins/icon-pack/IconPackPlugin';

// Heroicons - Import from the main export
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeBracketIcon,
  CodeBracketSquareIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  TableCellsIcon,
  XMarkIcon,
  H1Icon,
  H2Icon,
  H3Icon,
} from '@heroicons/react/20/solid';

/**
 * Heroicons configuration
 */
export const heroiconsConfig: IconPackConfig = {
  type: 'heroicons',
  icons: {
    bold: <BoldIcon style={{ width: '18px', height: '18px' }} />,
    italic: <ItalicIcon style={{ width: '18px', height: '18px' }} />,
    underline: <UnderlineIcon style={{ width: '18px', height: '18px' }} />,
    strike: <StrikethroughIcon style={{ width: '18px', height: '18px' }} />,
    code: <CodeBracketIcon style={{ width: '18px', height: '18px' }} />,
    'code-block': <CodeBracketSquareIcon style={{ width: '18px', height: '18px' }} />,
    bullet: <ListBulletIcon style={{ width: '18px', height: '18px' }} />,
    number: <NumberedListIcon style={{ width: '18px', height: '18px' }} />,
    link: <LinkIcon style={{ width: '18px', height: '18px' }} />,
    table: <TableCellsIcon style={{ width: '18px', height: '18px' }} />,
    clear: <XMarkIcon style={{ width: '18px', height: '18px' }} />,
    h1: <H1Icon style={{ width: '18px', height: '18px' }} />,
    h2: <H2Icon style={{ width: '18px', height: '18px' }} />,
    h3: <H3Icon style={{ width: '18px', height: '18px' }} />,
  }
};