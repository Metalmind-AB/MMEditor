/**
 * React Icons Configuration for Demo App
 * 
 * React Icons provides popular icons from multiple icon sets including:
 * Font Awesome, Material Design, Bootstrap, Feather, and more.
 * This is the most popular React icon library with 3.7M+ weekly downloads.
 */

import React from 'react';
import type { IconPackConfig } from '../../src/plugins/icon-pack/IconPackPlugin';

// React Icons - Using Font Awesome solid icons as they're commonly used
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaCode,
  FaFileCode,
  FaListUl,
  FaListOl,
  FaLink,
  FaUnlink,
  FaTable,
  FaEraser,
  FaHeading,
} from 'react-icons/fa';
import { FaHeading as FaH1 } from 'react-icons/fa6';

/**
 * React Icons configuration using Font Awesome icons
 */
export const reactIconsConfig: IconPackConfig = {
  type: 'react-icons',
  icons: {
    bold: <FaBold size={16} />,
    italic: <FaItalic size={16} />,
    underline: <FaUnderline size={16} />,
    strike: <FaStrikethrough size={16} />,
    code: <FaCode size={16} />,
    'code-block': <FaFileCode size={16} />,
    bullet: <FaListUl size={16} />,
    number: <FaListOl size={16} />,
    link: <FaLink size={16} />,
    unlink: <FaUnlink size={16} />,
    table: <FaTable size={16} />,
    clear: <FaEraser size={16} />,
    h1: <FaHeading size={16} />,
    h2: <FaHeading size={14} />,
    h3: <FaHeading size={12} />,
  }
};