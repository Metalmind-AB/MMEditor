export { Editor as MMEditor } from './components/Editor/Editor';
export type {
  MMEditorProps,
  EditorInstance,
  Format,
  ToolbarConfig,
  SelectionRange,
} from './components/Editor/Editor.types';

// Export Plugin from plugins/types
export type { Plugin } from './plugins/types';

// Plugin exports
export { createIconPackPlugin, IconPackPresets } from './plugins/icon-pack/IconPackPlugin';
export type { IconPackConfig, IconMapping } from './plugins/icon-pack/IconPackPlugin';