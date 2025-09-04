/**
 * Example Icon Pack Configurations
 * 
 * These examples show how to configure the IconPackPlugin with different icon libraries.
 * To use these, the consuming application must have the corresponding icon library installed.
 */

import React from 'react';
import { createIconPackPlugin } from '../../src/plugins/icon-pack/IconPackPlugin';

/**
 * Example: Heroicons configuration
 * Requires: npm install @heroicons/react
 */
export const createHeroiconsPlugin = () => {
  // These imports would be in the actual app
  // import {
  //   BoldIcon,
  //   ItalicIcon,
  //   UnderlineIcon,
  //   StrikethroughIcon,
  //   CodeBracketIcon,
  //   CodeBracketSquareIcon,
  //   ListBulletIcon,
  //   NumberedListIcon,
  //   LinkIcon,
  //   TableCellsIcon,
  //   XMarkIcon,
  // } from '@heroicons/react/20/solid';
  
  // return createIconPackPlugin({
  //   type: 'heroicons',
  //   icons: {
  //     bold: <BoldIcon className="w-4 h-4" />,
  //     italic: <ItalicIcon className="w-4 h-4" />,
  //     underline: <UnderlineIcon className="w-4 h-4" />,
  //     strike: <StrikethroughIcon className="w-4 h-4" />,
  //     code: <CodeBracketIcon className="w-4 h-4" />,
  //     'code-block': <CodeBracketSquareIcon className="w-4 h-4" />,
  //     bullet: <ListBulletIcon className="w-4 h-4" />,
  //     number: <NumberedListIcon className="w-4 h-4" />,
  //     link: <LinkIcon className="w-4 h-4" />,
  //     table: <TableCellsIcon className="w-4 h-4" />,
  //     clear: <XMarkIcon className="w-4 h-4" />,
  //   }
  // });
};

/**
 * Example: Lucide React configuration
 * Requires: npm install lucide-react
 */
export const createLucidePlugin = () => {
  // These imports would be in the actual app
  // import {
  //   Bold,
  //   Italic,
  //   Underline,
  //   Strikethrough,
  //   Code,
  //   Code2,
  //   List,
  //   ListOrdered,
  //   Link,
  //   Table,
  //   X,
  // } from 'lucide-react';
  
  // return createIconPackPlugin({
  //   type: 'lucide',
  //   icons: {
  //     bold: <Bold size={16} />,
  //     italic: <Italic size={16} />,
  //     underline: <Underline size={16} />,
  //     strike: <Strikethrough size={16} />,
  //     code: <Code size={16} />,
  //     'code-block': <Code2 size={16} />,
  //     bullet: <List size={16} />,
  //     number: <ListOrdered size={16} />,
  //     link: <Link size={16} />,
  //     table: <Table size={16} />,
  //     clear: <X size={16} />,
  //   }
  // });
};

/**
 * Example: Feather Icons configuration
 * Requires: npm install react-feather
 */
export const createFeatherPlugin = () => {
  // These imports would be in the actual app
  // import {
  //   Bold,
  //   Italic,
  //   Underline,
  //   Code,
  //   List,
  //   Link,
  //   Grid,
  //   X,
  // } from 'react-feather';
  
  // return createIconPackPlugin({
  //   type: 'feather',
  //   icons: {
  //     bold: <Bold size={16} />,
  //     italic: <Italic size={16} />,
  //     underline: <Underline size={16} />,
  //     code: <Code size={16} />,
  //     'code-block': <Code size={16} />,
  //     bullet: <List size={16} />,
  //     number: <List size={16} />, // Feather doesn't have numbered list
  //     link: <Link size={16} />,
  //     table: <Grid size={16} />,
  //     clear: <X size={16} />,
  //   }
  // });
};

/**
 * Example: Tabler Icons configuration
 * Requires: npm install @tabler/icons-react
 */
export const createTablerPlugin = () => {
  // These imports would be in the actual app
  // import {
  //   IconBold,
  //   IconItalic,
  //   IconUnderline,
  //   IconStrikethrough,
  //   IconCode,
  //   IconCodeDots,
  //   IconList,
  //   IconListNumbers,
  //   IconLink,
  //   IconTable,
  //   IconX,
  // } from '@tabler/icons-react';
  
  // return createIconPackPlugin({
  //   type: 'tabler',
  //   icons: {
  //     bold: <IconBold size={16} />,
  //     italic: <IconItalic size={16} />,
  //     underline: <IconUnderline size={16} />,
  //     strike: <IconStrikethrough size={16} />,
  //     code: <IconCode size={16} />,
  //     'code-block': <IconCodeDots size={16} />,
  //     bullet: <IconList size={16} />,
  //     number: <IconListNumbers size={16} />,
  //     link: <IconLink size={16} />,
  //     table: <IconTable size={16} />,
  //     clear: <IconX size={16} />,
  //   }
  // });
};

/**
 * Example: Font Awesome configuration
 * Requires: npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
 */
export const createFontAwesomePlugin = () => {
  // These imports would be in the actual app
  // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  // import {
  //   faBold,
  //   faItalic,
  //   faUnderline,
  //   faStrikethrough,
  //   faCode,
  //   faListUl,
  //   faListOl,
  //   faLink,
  //   faTable,
  //   faTimes,
  // } from '@fortawesome/free-solid-svg-icons';
  
  // return createIconPackPlugin({
  //   type: 'custom', // Using 'custom' since it's Font Awesome
  //   icons: {
  //     bold: <FontAwesomeIcon icon={faBold} size="sm" />,
  //     italic: <FontAwesomeIcon icon={faItalic} size="sm" />,
  //     underline: <FontAwesomeIcon icon={faUnderline} size="sm" />,
  //     strike: <FontAwesomeIcon icon={faStrikethrough} size="sm" />,
  //     code: <FontAwesomeIcon icon={faCode} size="sm" />,
  //     'code-block': <FontAwesomeIcon icon={faCode} size="sm" />,
  //     bullet: <FontAwesomeIcon icon={faListUl} size="sm" />,
  //     number: <FontAwesomeIcon icon={faListOl} size="sm" />,
  //     link: <FontAwesomeIcon icon={faLink} size="sm" />,
  //     table: <FontAwesomeIcon icon={faTable} size="sm" />,
  //     clear: <FontAwesomeIcon icon={faTimes} size="sm" />,
  //   }
  // });
};

/**
 * Example: Custom SVG Icons
 * No dependencies required - use your own SVG components
 */
export const createCustomSvgPlugin = () => {
  const CustomBoldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
    </svg>
  );
  
  const CustomItalicIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
    </svg>
  );
  
  // ... more custom icons
  
  return createIconPackPlugin({
    type: 'custom',
    icons: {
      bold: <CustomBoldIcon />,
      italic: <CustomItalicIcon />,
      // ... map all other formats
    }
  });
};