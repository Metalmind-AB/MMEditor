/**
 * MUI Icons Configuration for Demo App
 * 
 * This file demonstrates how to use MUI icons with the IconPackPlugin.
 * The MUI dependencies are only in the demo app, not in the core editor.
 */

import React from 'react';
import type { IconPackConfig } from '../../src/plugins/icon-pack/IconPackPlugin';

// MUI Icons - these are installed in the demo app, not the editor package
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import TableChartIcon from '@mui/icons-material/TableChart';
import FormatClearIcon from '@mui/icons-material/FormatClear';

/**
 * MUI icons configuration
 */
export const muiIconConfig: IconPackConfig = {
  type: 'mui',
  icons: {
    bold: <FormatBoldIcon fontSize="small" />,
    italic: <FormatItalicIcon fontSize="small" />,
    underline: <FormatUnderlinedIcon fontSize="small" />,
    strike: <StrikethroughSIcon fontSize="small" />,
    code: <CodeIcon fontSize="small" />,
    'code-block': <DataObjectIcon fontSize="small" />,
    bullet: <FormatListBulletedIcon fontSize="small" />,
    number: <FormatListNumberedIcon fontSize="small" />,
    link: <LinkIcon fontSize="small" />,
    table: <TableChartIcon fontSize="small" />,
    clear: <FormatClearIcon fontSize="small" />,
  }
};