/**
 * Icon Pack Configurations Directory
 * 
 * This file exports all available icon pack configurations.
 * To add a new icon pack:
 * 1. Create a new config file (e.g., myIconsConfig.tsx)
 * 2. Export the configuration from that file
 * 3. Import and re-export it here
 */

export { muiIconConfig } from './muiIconsConfig';
export { lucideIconConfig } from './lucideIconsConfig';
export { reactIconsConfig } from './reactIconsConfig';
export { heroiconsConfig } from './heroiconsConfig';
export { fontAwesomeConfig } from './fontAwesomeConfig';
export { joyUIConfig } from './joyUIConfig';

// Export type for convenience
export type { IconPackConfig } from '../../src/plugins/icon-pack/IconPackPlugin';