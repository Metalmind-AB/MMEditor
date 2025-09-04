/**
 * Joy UI Icons Configuration for Demo App
 * 
 * Joy UI is MUI's design system that implements MUI's own take on design principles.
 * It uses the same Material Icons but with Joy UI's styling approach.
 * Joy UI offers a more modern, playful design compared to Material Design.
 */

import React from 'react';
import type { IconPackConfig } from '../../src/plugins/icon-pack/IconPackPlugin';

// Using Material Icons with Joy UI styling approach
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import FormatClearRoundedIcon from '@mui/icons-material/FormatClearRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import LooksOneRoundedIcon from '@mui/icons-material/LooksOneRounded';
import LooksTwoRoundedIcon from '@mui/icons-material/LooksTwoRounded';
import Looks3RoundedIcon from '@mui/icons-material/Looks3Rounded';

/**
 * Joy UI configuration using rounded Material Icons
 * These icons have a softer, more playful appearance
 */
export const joyUIConfig: IconPackConfig = {
  type: 'joy-ui',
  icons: {
    bold: <FormatBoldRoundedIcon sx={{ fontSize: 18 }} />,
    italic: <FormatItalicRoundedIcon sx={{ fontSize: 18 }} />,
    underline: <FormatUnderlinedRoundedIcon sx={{ fontSize: 18 }} />,
    strike: <StrikethroughSRoundedIcon sx={{ fontSize: 18 }} />,
    code: <CodeRoundedIcon sx={{ fontSize: 18 }} />,
    'code-block': <DataObjectRoundedIcon sx={{ fontSize: 18 }} />,
    bullet: <FormatListBulletedRoundedIcon sx={{ fontSize: 18 }} />,
    number: <FormatListNumberedRoundedIcon sx={{ fontSize: 18 }} />,
    link: <LinkRoundedIcon sx={{ fontSize: 18 }} />,
    unlink: <LinkOffRoundedIcon sx={{ fontSize: 18 }} />,
    table: <TableChartRoundedIcon sx={{ fontSize: 18 }} />,
    clear: <FormatClearRoundedIcon sx={{ fontSize: 18 }} />,
    h1: <LooksOneRoundedIcon sx={{ fontSize: 20 }} />,
    h2: <LooksTwoRoundedIcon sx={{ fontSize: 18 }} />,
    h3: <Looks3RoundedIcon sx={{ fontSize: 16 }} />,
  }
};