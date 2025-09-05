import { CSSProperties, ReactNode } from 'react';
import { Plugin } from '../../plugins/types';

export interface MMEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: CSSProperties;
  theme?: 'light' | 'dark' | 'auto';
  toolbar?: ToolbarConfig | false;
  formats?: Format[];
  plugins?: Plugin[];
  onFocus?: () => void;
  onBlur?: () => void;
  onReady?: () => void;
}

export type Format = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strike'
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6'
  | 'bullet' 
  | 'number'
  | 'code'
  | 'code-block' // Deprecated: use 'code' instead
  | 'link' 
  | 'table'
  | 'clear'; // Deprecated: each format should toggle on/off

export interface ToolbarConfig {
  groups?: ToolbarGroup[];
  customButtons?: CustomButton[];
}

export interface ToolbarGroup {
  name: string;
  items: Format[];
}

export interface CustomButton {
  name: string;
  icon: ReactNode;
  action: (editor: EditorInstance) => void;
  isActive?: (editor: EditorInstance) => boolean;
}

// Plugin type is imported from '../../plugins/types'

export interface FormatDefinition {
  name: string;
  tag?: string;
  className?: string;
  style?: CSSProperties;
}

export interface CommandDefinition {
  name: string;
  execute: (editor: EditorInstance, ...args: unknown[]) => void;
}

export interface EditorInstance {
  getHTML(): string;
  setHTML(html: string): void;
  getText(): string;
  getLength(): number;
  getSelection(): SelectionRange | null;
  setSelection(range: SelectionRange): void;
  format(name: string, value?: unknown): void;
  removeFormat(range?: SelectionRange): void;
  execCommand(name: string, ...args: unknown[]): void;
  focus(): void;
  blur(): void;
  isFormatActive(format: Format): boolean;
  registerPlugin(plugin: Plugin): void;
  unregisterPlugin(pluginName: string): void;
  getPlugin(pluginName: string): Plugin | undefined;
  executeCommand(commandName: string, ...args: unknown[]): void;
}

export interface SelectionRange {
  index: number;
  length: number;
}