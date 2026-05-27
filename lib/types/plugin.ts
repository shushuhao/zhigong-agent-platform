/**
 * 插件广场相关类型
 */

export type PluginType = 'plugin' | 'mcp';

export interface PluginMarketItem {
  id: string;
  name: string;
  owner: string;
  description: string;
  type: PluginType;
  icon: string;
  iconBg: string;
  tags?: string[];
}

export interface PluginMetaField {
  label: string;
  value: string;
}

export interface PluginIntroSection {
  title: string;
  content: string;
}

export interface PluginApiParameter {
  name: string;
  required: boolean;
  type: string;
  location: string;
  description: string;
  placeholder?: string;
}

export interface PluginTool {
  id: string;
  name: string;
  description: string;
  apiUrl: string;
  parameters: PluginApiParameter[];
}

export interface PluginDetail extends PluginMarketItem {
  meta: PluginMetaField[];
  introSections: PluginIntroSection[];
  apiUrl: string;
  apiMethod: string;
  parameters: PluginApiParameter[];
  tools?: PluginTool[];
}