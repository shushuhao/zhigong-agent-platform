/**
 * MCP 工具 Mock 数据
 *
 * 提供工作流中可用的 MCP 工具列表
 */

import type { MCPInputParameter, MCPOutputVariable, MCPToolRef } from '@/lib/workflow/types';

/**
 * MCP 服务定义
 */
export interface MCPService {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  updatedAt: string;
  tools: MCPToolDefinition[];
}

/**
 * MCP 工具定义
 */
export interface MCPToolDefinition {
  id: string;
  name: string;
  description: string;
  inputs: Omit<MCPInputParameter, 'value'>[];
  outputs: MCPOutputVariable[];
}

/**
 * MCP 服务列表 Mock 数据
 */
export const MOCK_MCP_SERVICES: MCPService[] = [
  {
    id: 'mcp_user_agent',
    name: '随机生成User-Agent',
    description: '专门用于随机生成或自动轮换用户标识字符串，为每一次请求动态赋予全新的用户代理。用户代理模拟器本质上是浏览器或爬虫...',
    icon: '🔄',
    iconBg: '#EEF2FF',
    updatedAt: '2025-11-10 10:35:30',
    tools: [
      {
        id: 'user_agent_generator',
        name: 'user_agent_generator',
        description: '随机生成用户代理',
        inputs: [
          { name: 'browser', type: 'string', required: true, description: '浏览器类型，如 chrome、firefox、safari' },
          { name: 'device', type: 'string', required: true, description: '设备类型，如 desktop、mobile、tablet' },
          { name: 'system', type: 'string', required: true, description: '操作系统，如 windows、macos、linux、ios、android' },
        ],
        outputs: [
          {
            name: 'content',
            type: 'array',
            description: '生成的内容列表',
            children: [
              { name: 'text', type: 'string', description: '生成的 User-Agent 字符串' },
              { name: 'type', type: 'string', description: '内容类型' },
            ],
          },
          {
            name: 'errorBody',
            type: 'object',
            description: '错误信息',
            children: [
              { name: 'errorMessage', type: 'string', description: '错误消息' },
            ],
          },
          { name: 'isSuccess', type: 'boolean', description: '是否成功' },
        ],
      },
    ],
  },
  {
    id: 'mcp_language_detect',
    name: '语言检测',
    description: '语言检测是一项智能文本识别能力，能够自动判断输入内容所属的语言类型及其国家或地区。例如，系统可精准识别中文、英文...',
    icon: '🌐',
    iconBg: '#E0F2FE',
    updatedAt: '2025-11-10 10:35:30',
    tools: [
      {
        id: 'detect_language',
        name: 'detect_language',
        description: '检测文本语言',
        inputs: [
          { name: 'text', type: 'string', required: true, description: '待检测的文本内容' },
        ],
        outputs: [
          { name: 'language', type: 'string', description: '检测到的语言代码，如 zh-CN、en-US' },
          { name: 'confidence', type: 'number', description: '置信度（0-1）' },
          { name: 'isSuccess', type: 'boolean', description: '是否成功' },
        ],
      },
    ],
  },
  {
    id: 'mcp_timezone',
    name: '时区转换',
    description: '时区转换是一项实用的时间管理工具，能够根据用户输入的时间和原始时区，自动换算为目标时区的对应时间。该功能支持全球...',
    icon: '🕐',
    iconBg: '#FEF3C7',
    updatedAt: '2025-11-10 10:35:30',
    tools: [
      {
        id: 'convert_timezone',
        name: 'convert_timezone',
        description: '转换时区',
        inputs: [
          { name: 'datetime', type: 'string', required: true, description: '原始时间，ISO 8601 格式' },
          { name: 'from_timezone', type: 'string', required: true, description: '原始时区，如 Asia/Shanghai' },
          { name: 'to_timezone', type: 'string', required: true, description: '目标时区，如 America/New_York' },
        ],
        outputs: [
          { name: 'converted_time', type: 'string', description: '转换后的时间' },
          { name: 'offset_hours', type: 'number', description: '时差（小时）' },
          { name: 'isSuccess', type: 'boolean', description: '是否成功' },
        ],
      },
    ],
  },
  {
    id: 'mcp_doc_parser',
    name: '文档解析',
    description: '文档解析工具，将文档内容转换为长文本输出。支持DOC/DOCX/PDF/TXT/WPS/OFD/XLS/XLSX/CSV类别。',
    icon: '📄',
    iconBg: '#DBEAFE',
    updatedAt: '2025-11-10 10:35:30',
    tools: [
      {
        id: 'parse_document',
        name: 'parse_document',
        description: '解析文档内容',
        inputs: [
          { name: 'file_url', type: 'string', required: true, description: '文档 URL 地址' },
          { name: 'file_type', type: 'string', required: false, description: '文件类型，如 pdf、docx，不填则自动识别' },
          { name: 'extract_images', type: 'boolean', required: false, description: '是否提取图片' },
        ],
        outputs: [
          { name: 'text', type: 'string', description: '提取的文本内容' },
          { name: 'page_count', type: 'number', description: '页数' },
          { name: 'images', type: 'array', description: '提取的图片列表' },
          { name: 'isSuccess', type: 'boolean', description: '是否成功' },
        ],
      },
    ],
  },
  {
    id: 'mcp_weather',
    name: '天气查询',
    description: '实时天气查询服务，支持全球城市天气信息获取，包括温度、湿度、风速、天气状况等详细数据。',
    icon: '🌤️',
    iconBg: '#FEE2E2',
    updatedAt: '2025-11-10 10:35:30',
    tools: [
      {
        id: 'get_weather',
        name: 'get_weather',
        description: '获取天气信息',
        inputs: [
          { name: 'city', type: 'string', required: true, description: '城市名称' },
          { name: 'country', type: 'string', required: false, description: '国家代码，如 CN、US' },
          { name: 'units', type: 'string', required: false, description: '温度单位，metric（摄氏度）或 imperial（华氏度）' },
        ],
        outputs: [
          { name: 'temperature', type: 'number', description: '当前温度' },
          { name: 'humidity', type: 'number', description: '湿度百分比' },
          { name: 'weather', type: 'string', description: '天气状况描述' },
          { name: 'wind_speed', type: 'number', description: '风速' },
          { name: 'isSuccess', type: 'boolean', description: '是否成功' },
        ],
      },
    ],
  },
  {
    id: 'mcp_translate',
    name: '文本翻译',
    description: '多语言翻译服务，支持数十种语言之间的互译，提供高质量的翻译结果。',
    icon: '🔤',
    iconBg: '#D1FAE5',
    updatedAt: '2025-11-10 10:35:30',
    tools: [
      {
        id: 'translate_text',
        name: 'translate_text',
        description: '翻译文本',
        inputs: [
          { name: 'text', type: 'string', required: true, description: '待翻译的文本' },
          { name: 'source_lang', type: 'string', required: false, description: '源语言，不填则自动检测' },
          { name: 'target_lang', type: 'string', required: true, description: '目标语言' },
        ],
        outputs: [
          { name: 'translated_text', type: 'string', description: '翻译后的文本' },
          { name: 'detected_lang', type: 'string', description: '检测到的源语言' },
          { name: 'isSuccess', type: 'boolean', description: '是否成功' },
        ],
      },
    ],
  },
];

/**
 * 获取所有 MCP 服务
 */
export function getMCPServices(): MCPService[] {
  return MOCK_MCP_SERVICES;
}

/**
 * 根据 ID 获取 MCP 服务
 */
export function getMCPServiceById(id: string): MCPService | null {
  return MOCK_MCP_SERVICES.find((s) => s.id === id) || null;
}

/**
 * 根据服务 ID 和工具 ID 获取工具定义
 */
export function getMCPTool(serviceId: string, toolId: string): MCPToolDefinition | null {
  const service = getMCPServiceById(serviceId);
  if (!service) return null;
  return service.tools.find((t) => t.id === toolId) || null;
}

/**
 * 搜索 MCP 服务
 */
export function searchMCPServices(keyword: string): MCPService[] {
  if (!keyword.trim()) return MOCK_MCP_SERVICES;
  const lowerKeyword = keyword.toLowerCase();
  return MOCK_MCP_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerKeyword) ||
      s.description.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 根据工具定义创建 MCPToolRef
 */
export function createMCPToolRef(service: MCPService, tool: MCPToolDefinition): MCPToolRef {
  return {
    serviceId: service.id,
    serviceName: service.name,
    serviceIcon: service.icon,
    toolId: tool.id,
    toolName: tool.name,
    toolDescription: tool.description,
  };
}

/**
 * 根据工具定义创建默认输入参数
 */
export function createDefaultInputs(tool: MCPToolDefinition): MCPInputParameter[] {
  return tool.inputs.map((input) => ({
    ...input,
    value: '',
  }));
}
