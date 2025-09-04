/**
 * Font Awesome Configuration for Demo App
 * 
 * Font Awesome is one of the oldest and most widely used icon libraries.
 * This configuration uses the free solid icons from Font Awesome 6.
 */

import React from 'react';
import type { IconPackConfig } from '../../src/plugins/icon-pack/IconPackPlugin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faCode,
  faFileCode,
  faListUl,
  faListOl,
  faLink,
  faUnlink,
  faTable,
  faEraser,
  faHeading,
  fa1,
  fa2,
  fa3,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Font Awesome configuration
 */
export const fontAwesomeConfig: IconPackConfig = {
  type: 'font-awesome',
  icons: {
    bold: <FontAwesomeIcon icon={faBold} size="sm" />,
    italic: <FontAwesomeIcon icon={faItalic} size="sm" />,
    underline: <FontAwesomeIcon icon={faUnderline} size="sm" />,
    strike: <FontAwesomeIcon icon={faStrikethrough} size="sm" />,
    code: <FontAwesomeIcon icon={faCode} size="sm" />,
    'code-block': <FontAwesomeIcon icon={faFileCode} size="sm" />,
    bullet: <FontAwesomeIcon icon={faListUl} size="sm" />,
    number: <FontAwesomeIcon icon={faListOl} size="sm" />,
    link: <FontAwesomeIcon icon={faLink} size="sm" />,
    unlink: <FontAwesomeIcon icon={faUnlink} size="sm" />,
    table: <FontAwesomeIcon icon={faTable} size="sm" />,
    clear: <FontAwesomeIcon icon={faEraser} size="sm" />,
    h1: <FontAwesomeIcon icon={faHeading} size="lg" />,
    h2: <FontAwesomeIcon icon={faHeading} size="sm" />,
    h3: <FontAwesomeIcon icon={faHeading} size="xs" />,
  }
};