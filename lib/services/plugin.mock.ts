/**
 * 插件广场 Mock 数据
 */

import type {
  PluginApiParameter,
  PluginDetail,
  PluginMarketItem,
  PluginTool,
} from '@/lib/types/plugin';

const BASE_API_URL = 'https://sec-agent.mcp.volcbiz.com/sse';

const DEFAULT_INTRO_SECTIONS = [
  {
    title: '多模态信息处理能力',
    content:
      '具备解析各类文档（PDF/Excel/Word 等）、图片/照片内容的能力，可执行总结、分析、翻译及润色任务；支持读取网页链接信息，精准提取核心内容。',
  },
  {
    title: '智能创作与生成能力',
    content:
      '可根据文本描述生成或改绘图片，满足可视化创作需求；擅长文案撰写、内容润色，并能依据场景定制风格化文字。',
  },
  {
    title: '实时信息检索与计算能力',
    content:
      '支持实时信息获取与检索，适用于热点追踪、知识验证等场景；可配合计算工具进行数值与符号计算。',
  },
];

const DEFAULT_PARAMETERS: PluginApiParameter[] = [
  {
    name: 'query',
    required: true,
    type: 'String',
    location: '请求头',
    description: '必须搜索的关键词，用于指定搜索内容。',
  },
  {
    name: 'count',
    required: true,
    type: 'Number',
    location: '请求头',
    description: '返回搜索结果数量，默认值为 5，可根据需求调整。',
  },
  {
    name: 'result_id',
    required: true,
    type: 'String',
    location: '请求头',
    description: '从搜索结果中选取的结果 ID，用于进一步抓取详情。',
  },
  {
    name: 'tool_name',
    required: false,
    type: 'String',
    location: '请求体',
    description: '工具名称，用于指定执行的功能模块。',
  },
  {
    name: 'language',
    required: false,
    type: 'String',
    location: '请求体',
    description: '返回内容语言偏好，例如 zh-CN / en-US。',
  },
  {
    name: 'timeout',
    required: false,
    type: 'Number',
    location: '路径',
    description: '请求超时时间，单位秒，默认值为 30。',
  },
];

const OCR_PARAMETERS: PluginApiParameter[] = [
  {
    name: 'image_url',
    required: true,
    type: 'String',
    location: '请求体',
    description: '待识别的图片 URL，支持 HTTP/HTTPS 或 Base64。',
    placeholder: '请输入 image_url',
  },
  {
    name: 'language',
    required: true,
    type: 'String',
    location: '请求体',
    description: '识别语言，默认 auto，可选 zh/en/ja 等。',
    placeholder: '请输入 language',
  },
  {
    name: 'confidence_threshold',
    required: false,
    type: 'Number',
    location: '请求体',
    description: '置信度阈值（0-1），低于该值的结果将被过滤。',
    placeholder: '请输入 confidence_threshold',
  },
];

const SUMMARY_PARAMETERS: PluginApiParameter[] = [
  {
    name: 'content',
    required: true,
    type: 'String',
    location: '请求体',
    description: '需要总结的原始内容。',
    placeholder: '请输入 content',
  },
  {
    name: 'style',
    required: false,
    type: 'String',
    location: '请求体',
    description: '摘要风格，例如 executive / bullet / brief。',
    placeholder: '请输入 style',
  },
  {
    name: 'max_tokens',
    required: false,
    type: 'Number',
    location: '请求体',
    description: '摘要长度上限。',
    placeholder: '请输入 max_tokens',
  },
];

const ENTITY_PARAMETERS: PluginApiParameter[] = [
  {
    name: 'text',
    required: true,
    type: 'String',
    location: '请求体',
    description: '待抽取的文本内容。',
    placeholder: '请输入 text',
  },
  {
    name: 'schema',
    required: false,
    type: 'String',
    location: '请求体',
    description: '实体 schema 定义，JSON 格式。',
    placeholder: '请输入 schema',
  },
];

const DEFAULT_TOOLS: PluginTool[] = [
  {
    id: 'tool_001',
    name: 'recognition_text',
    description: '识别图片中的文本内容，支持多语言 OCR。',
    apiUrl: `${BASE_API_URL}?tool=recognition_text`,
    parameters: OCR_PARAMETERS,
  },
  {
    id: 'tool_002',
    name: 'extract_entities',
    description: '抽取文本中的关键实体与结构化字段。',
    apiUrl: `${BASE_API_URL}?tool=extract_entities`,
    parameters: ENTITY_PARAMETERS,
  },
  {
    id: 'tool_003',
    name: 'summarize_text',
    description: '对长文本进行摘要，支持多种风格。',
    apiUrl: `${BASE_API_URL}?tool=summarize_text`,
    parameters: SUMMARY_PARAMETERS,
  },
  {
    id: 'tool_004',
    name: 'fetch_webpage',
    description: '抓取网页内容并返回结构化结果。',
    apiUrl: `${BASE_API_URL}?tool=fetch_webpage`,
    parameters: [
      {
        name: 'url',
        required: true,
        type: 'String',
        location: '请求体',
        description: '目标网页地址。',
        placeholder: '请输入 url',
      },
      {
        name: 'depth',
        required: false,
        type: 'Number',
        location: '请求体',
        description: '抓取深度，默认 1。',
        placeholder: '请输入 depth',
      },
    ],
  },
];

const BASE_ITEMS: PluginMarketItem[] = [
  {
    id: 'plugin_001',
    name: '设备数据采集器',
    owner: '@智工平台官方',
    description: '接入温度、振动、电流等设备指标，为诊断 Agent 提供实时上下文。',
    type: 'plugin',
    icon: '⚙️',
    iconBg: '#EEF2FF',
    tags: ['设备接入', '传感器'],
  },
  {
    id: 'plugin_002',
    name: '故障代码解析器',
    owner: '@智工平台官方',
    description: '解析变频器、电机和产线控制器告警代码，返回处理建议与安全提醒。',
    type: 'plugin',
    icon: '🌐',
    iconBg: '#E0F2FE',
    tags: ['故障代码', '诊断'],
  },
  {
    id: 'plugin_003',
    name: '产线数据洞察',
    owner: '@智工平台官方',
    description: '自动生成设备健康趋势、异常指标和维护优先级分析视图。',
    type: 'plugin',
    icon: '📊',
    iconBg: '#E7FBE9',
    tags: ['设备健康', '报表'],
  },
  {
    id: 'plugin_004',
    name: '设备手册助手',
    owner: '@智工平台官方',
    description: '从设备手册和点检规范中抽取关键步骤，生成摘要与问答建议。',
    type: 'plugin',
    icon: '📝',
    iconBg: '#FFF7ED',
    tags: ['设备手册', '摘要'],
  },
  {
    id: 'plugin_005',
    name: '工业知识检索',
    owner: '@智工平台官方',
    description: '检索设备手册、故障案例和维护规程，支持实时结果解析。',
    type: 'mcp',
    icon: '🔍',
    iconBg: '#ECFEFF',
    tags: ['检索', '设备知识'],
  },
  {
    id: 'plugin_006',
    name: '设备位置服务',
    owner: '@智工平台官方',
    description: '管理园区、产线和设备位置数据，辅助定位告警设备与维护路线。',
    type: 'mcp',
    icon: '📍',
    iconBg: '#FFF1F2',
    tags: ['设备位置', '园区'],
  },
  {
    id: 'plugin_007',
    name: '维修工单生成器',
    owner: '@智工平台官方',
    description: '根据诊断结论生成维修工单、处理步骤和复检要求。',
    type: 'plugin',
    icon: '✨',
    iconBg: '#F5F3FF',
    tags: ['工单', '维修'],
  },
  {
    id: 'plugin_008',
    name: '诊断链路图谱',
    owner: '@智工平台官方',
    description: '将告警、设备、部件和处理步骤拆解为可追踪的诊断关系图。',
    type: 'plugin',
    icon: '🧠',
    iconBg: '#F0FDFA',
    tags: ['诊断图谱', '关系'],
  },
  {
    id: 'plugin_009',
    name: '模型接入 MCP',
    owner: '@智工平台官方',
    description: '封装模型调用、提示词路由和响应解析能力，便于工作流统一接入。',
    type: 'mcp',
    icon: '🧩',
    iconBg: '#EFF6FF',
    tags: ['MCP', '模型'],
  },
  {
    id: 'plugin_010',
    name: '数据净化器',
    owner: '@智工平台官方',
    description: '清洗设备日志、告警文本和传感器记录，适合批量数据预处理。',
    type: 'mcp',
    icon: '🧹',
    iconBg: '#FEFCE8',
    tags: ['清洗', '预处理'],
  },
  {
    id: 'plugin_011',
    name: '设备数据抓取箱',
    owner: '@智工平台官方',
    description: '统一管理外部设备台账、告警日志和维护记录抓取与缓存策略。',
    type: 'mcp',
    icon: '🧰',
    iconBg: '#ECFDF3',
    tags: ['抓取', '缓存'],
  },
  {
    id: 'plugin_012',
    name: '运维体验优化器',
    owner: '@智工平台官方',
    description: '追踪运维人员处理路径，识别流程阻塞点并给出协同优化建议。',
    type: 'plugin',
    icon: '🎯',
    iconBg: '#F5F5FF',
    tags: ['运维体验', '优化'],
  },
];

const buildMeta = (typeLabel: string, owner: string): PluginDetail['meta'] => [
  { label: '类型', value: typeLabel },
  { label: '发布时间', value: '2025-05-05 15:15:15' },
  { label: '发布者', value: owner },
  { label: '扩展位置', value: '智能体 / 工作流' },
  { label: '扩展位置', value: '知识库 / 插件' },
];

const buildDetail = (item: PluginMarketItem): PluginDetail => {
  const typeLabel = item.type === 'plugin' ? '插件' : 'MCP工具';
  return {
    ...item,
    meta: buildMeta(typeLabel, item.owner),
    introSections: DEFAULT_INTRO_SECTIONS,
    apiUrl: `${BASE_API_URL}?plugin=${item.id}`,
    apiMethod: 'POST',
    parameters: DEFAULT_PARAMETERS,
    tools: item.type === 'mcp' ? DEFAULT_TOOLS : undefined,
  };
};

export const MOCK_PLUGIN_DETAILS: PluginDetail[] = BASE_ITEMS.map(buildDetail);

export const MOCK_PLUGINS: PluginMarketItem[] = MOCK_PLUGIN_DETAILS;

export const getMockPluginDetail = (id: string): PluginDetail | null => {
  return MOCK_PLUGIN_DETAILS.find((item) => item.id === id) || null;
};