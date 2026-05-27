/**
 * 工作流节点类型系统
 * 
 * 这个文件定义了工作流编辑器中所有节点相关的类型，包括：
 * 1. 节点类型枚举 (NodeType)
 * 2. 节点分类 (NodeCategory)
 * 3. 各种节点的数据类型
 * 4. 节点配置接口 (NodeConfig)
 */

import type { Node, Edge } from '@xyflow/react';
import type { ReactNode } from 'react';

// ==================== 节点类型枚举 ====================

/**
 * 节点类型枚举
 *
 * 添加新节点时，只需在这里添加新的枚举值
 * 例如：HTTP_REQUEST = 'httpRequest'
 */
export enum NodeType {
  /** 开始节点 - 工作流的入口 */
  START = 'start',
  /** 结束节点 - 工作流的出口 */
  END = 'end',
  /** 代码节点 - 执行自定义代码 */
  CODE = 'code',
  /** 大模型节点 - 调用 LLM 生成内容 */
  LLM = 'llm',
  /** API 节点 - 发送 HTTP 请求 */
  API = 'api',
  /** 分支器节点 - 条件分支 */
  BRANCH = 'branch',
  /** 知识检索节点 - 从知识库检索信息 */
  KNOWLEDGE = 'knowledge',
  /** MCP 节点 - 调用 MCP 协议工具 */
  MCP = 'mcp',
  // ========== 后续扩展 ==========
  // DELAY = 'delay',
}

// ==================== 节点分类 ====================

/**
 * 节点分类
 * 用于在左侧节点面板中对节点进行分组显示
 */
export type NodeCategory = 
  | 'trigger'    // 触发器：开始节点等
  | 'action'     // 动作：HTTP请求、发送邮件等
  | 'logic'      // 逻辑：条件判断、循环等
  | 'transform'  // 转换：数据处理、格式转换等
  | 'end';       // 结束：结束节点

/**
 * 分类中文名映射
 */
export const categoryLabels: Record<NodeCategory, string> = {
  trigger: '触发器',
  action: '动作',
  logic: '逻辑控制',
  transform: '数据转换',
  end: '结束',
};

// ==================== 节点数据类型 ====================

/**
 * 基础节点数据
 * 所有节点都会有的通用字段
 *
 * 注意：添加索引签名以兼容 ReactFlow 的 Record<string, unknown> 要求
 */
export interface BaseNodeData {
  /** 节点标签/名称 */
  label: string;
  /** 节点描述（可选） */
  description?: string;
  /** 索引签名，允许额外的属性 */
  [key: string]: unknown;
}

/**
 * 输入变量类型
 */
export type InputVariableType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * 输入变量定义（用于开始节点）
 */
export interface InputVariable {
  /** 变量唯一标识 */
  id: string;
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: InputVariableType;
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  defaultValue?: string;
  /** 变量描述 */
  description?: string;
}

/**
 * 开始节点数据
 */
export interface StartNodeData extends BaseNodeData {
  /** 输入变量列表 */
  inputs: InputVariable[];
}

/**
 * 输出变量定义（用于结束节点）
 */
export interface EndOutputVariable {
  /** 变量唯一标识 */
  id: string;
  /** 变量名 */
  name: string;
  /** 变量值（引用其他节点的输出或固定值） */
  value: string;
}

/**
 * 结束节点数据
 */
export interface EndNodeData extends BaseNodeData {
  /** 输出变量列表 */
  outputVariables: EndOutputVariable[];
}

/**
 * 代码节点输入变量定义
 */
export interface CodeInputVariable {
  /** 唯一标识 */
  id: string;
  /** 变量名 */
  name: string;
  /** 变量值（可以是变量引用，如 {{变量名}}） */
  value: string;
}

/**
 * 代码节点输出变量定义
 */
export interface CodeOutputVariable {
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

/**
 * 代码节点数据
 */
export interface CodeNodeData extends BaseNodeData {
  /** 编程语言 */
  language: 'javascript' | 'python3';
  /** 代码内容 */
  code: string;
  /** 输入变量 */
  inputs: CodeInputVariable[];
  /** 输出变量 */
  outputs: CodeOutputVariable[];
}

/**
 * LLM 输出变量定义
 */
export interface LLMOutputVariable {
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** 变量描述 */
  description?: string;
}

/**
 * 大模型节点数据
 */
export interface LLMNodeData extends BaseNodeData {
  /** 选择的模型 ID */
  model?: string;
  /** 是否启用温度参数 */
  temperatureEnabled?: boolean;
  /** 温度参数（0-1） */
  temperature?: number;
  /** 是否启用 Top P 参数 */
  topPEnabled?: boolean;
  /** Top P 参数（0-1） */
  topP?: number;
  /** 上下文变量（引用其他节点的输出） */
  context?: string;
  /** 提示词 */
  prompt?: string;
  /** 输出变量列表 */
  outputs: LLMOutputVariable[];
}

// ==================== API 节点相关类型 ====================

/**
 * HTTP 请求方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 请求体类型
 */
export type BodyType = 'none' | 'form-data' | 'json' | 'raw' | 'x-www-form-urlencoded';

/**
 * 键值对类型（用于请求参数、请求头、form-data 等）
 */
export interface KeyValuePair {
  /** 唯一标识 */
  id: string;
  /** 键名 */
  key: string;
  /** 值 */
  value: string;
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * API 节点输出变量
 */
export interface APIOutputVariable {
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: 'string' | 'number' | 'object';
  /** 变量描述 */
  description: string;
}

/**
 * API 节点数据
 */
export interface APINodeData extends BaseNodeData {
  /** HTTP 请求方法 */
  method: HttpMethod;
  /** 请求 URL */
  url: string;
  /** 请求参数（Query Parameters） */
  params: KeyValuePair[];
  /** 请求头 */
  headers: KeyValuePair[];
  /** 是否启用鉴权 */
  authEnabled: boolean;
  /** 鉴权类型 */
  authType?: 'basic' | 'bearer' | 'api-key';
  /** 鉴权值 */
  authValue?: string;
  /** 请求体类型 */
  bodyType: BodyType;
  /** 请求体内容（form-data 和 x-www-form-urlencoded 使用 KeyValuePair 数组） */
  bodyFormData: KeyValuePair[];
  /** 请求体 JSON 内容 */
  bodyJson: string;
  /** 请求体原始文本内容 */
  bodyRaw: string;
  /** 超时时间（秒） */
  timeout: number;
  /** 重试次数 */
  retryCount: number;
  /** 输出变量（固定的 body、status_code、headers） */
  outputs: APIOutputVariable[];
}

/**
 * 分支器节点 - 条件分支
 */
export interface BranchCondition {
  /** 唯一标识 */
  id: string;
  /** 分支标签，如 "如果"、"否则如果" */
  label: string;
  /** 条件表达式（可选，用于后续执行） */
  condition?: string;
}

/**
 * 分支器节点数据
 */
export interface BranchNodeData extends BaseNodeData {
  /** 条件分支列表（如果、否则如果） */
  branches: BranchCondition[];
  /** 是否显示默认分支（否则） */
  showElseBranch: boolean;
}

// ==================== 知识检索节点相关类型 ====================

/**
 * 检索策略类型
 */
export type RetrievalStrategy = 'hybrid' | 'fulltext' | 'semantic';

/**
 * 检索配置
 */
export interface RetrievalConfig {
  /** 检索策略 */
  strategy: RetrievalStrategy;
  /** 语义检索权重（0-1，仅混合检索时有效） */
  semanticWeight: number;
  /** 是否启用重排序 */
  rerankEnabled: boolean;
  /** 返回结果数量 Top K */
  topK: number;
  /** 相似度阈值（0-1） */
  scoreThreshold: number;
  /** 是否启用自动标签过滤 */
  autoTagFilter: boolean;
}

/**
 * 知识库引用（用于节点中存储已选择的知识库）
 */
export interface KnowledgeBaseRef {
  /** 知识库 ID */
  id: string;
  /** 知识库名称 */
  name: string;
  /** 知识库图标 */
  icon: string;
}

/**
 * 知识检索节点输出变量
 */
export interface KnowledgeOutputVariable {
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: 'string' | 'array' | 'object';
  /** 变量描述 */
  description: string;
}

/**
 * 知识检索节点数据
 */
export interface KnowledgeNodeData extends BaseNodeData {
  /** 已选择的知识库列表 */
  knowledgeBases: KnowledgeBaseRef[];
  /** 检索配置 */
  retrievalConfig: RetrievalConfig;
  /** 查询变量（引用上游节点的输出） */
  queryVariable: string;
  /** 输出变量 */
  outputs: KnowledgeOutputVariable[];
}

// ==================== MCP 节点相关类型 ====================

/**
 * MCP 工具输入参数
 */
export interface MCPInputParameter {
  /** 参数名 */
  name: string;
  /** 参数类型 */
  type: string;
  /** 是否必填 */
  required: boolean;
  /** 参数描述 */
  description?: string;
  /** 参数值（可以是变量引用） */
  value: string;
}

/**
 * MCP 工具输出变量
 */
export interface MCPOutputVariable {
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** 变量描述 */
  description?: string;
  /** 子字段（用于 object 和 array 类型） */
  children?: MCPOutputVariable[];
}

/**
 * 异常处理方式
 */
export type ErrorHandleType = 'interrupt' | 'continue' | 'retry';

/**
 * MCP 工具引用（存储选择的 MCP 工具信息）
 */
export interface MCPToolRef {
  /** MCP 服务 ID */
  serviceId: string;
  /** MCP 服务名称 */
  serviceName: string;
  /** MCP 服务图标 */
  serviceIcon: string;
  /** 工具 ID */
  toolId: string;
  /** 工具名称 */
  toolName: string;
  /** 工具描述 */
  toolDescription: string;
}

/**
 * MCP 节点数据
 */
export interface MCPNodeData extends BaseNodeData {
  /** 选择的 MCP 工具 */
  mcpTool: MCPToolRef;
  /** 输入参数列表 */
  inputs: MCPInputParameter[];
  /** 超时时间（秒） */
  timeout: number;
  /** 重试次数 */
  retryCount: number;
  /** 异常处理方式 */
  errorHandleType: ErrorHandleType;
  /** 输出变量 */
  outputs: MCPOutputVariable[];
}

// ========== 后续扩展的节点数据类型 ==========

/**
 * 所有节点数据的联合类型
 * 添加新节点时，需要在这里添加对应的数据类型
 */
export type WorkflowNodeData = StartNodeData | EndNodeData | CodeNodeData | LLMNodeData | APINodeData | BranchNodeData | KnowledgeNodeData | MCPNodeData;

// ==================== ReactFlow 节点类型 ====================

/**
 * 工作流节点类型
 * 继承自 ReactFlow 的 Node 类型，并指定我们的 data 类型
 */
export type WorkflowNode = Node<WorkflowNodeData, NodeType>;

/**
 * 工作流边类型
 * 暂时使用 ReactFlow 默认的 Edge 类型
 */
export type WorkflowEdge = Edge;

// ==================== 表单字段类型 ====================

/**
 * 表单字段类型
 * 用于动态表单渲染
 */
export type FormFieldType =
  | 'input'      // 单行文本
  | 'textarea'   // 多行文本
  | 'select'     // 下拉选择
  | 'switch'     // 开关
  | 'number'     // 数字输入
  | 'radio'      // 单选
  | 'checkbox';  // 多选

/**
 * 表单字段选项（用于 select、radio、checkbox）
 */
export interface FormFieldOption {
  label: string;
  value: string | number | boolean;
}

/**
 * 表单字段配置
 * 用于配置驱动的动态表单渲染
 */
export interface FormField {
  /** 字段名（对应节点数据中的 key） */
  name: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: FormFieldType;
  /** 是否必填 */
  required?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 选项（用于 select、radio、checkbox） */
  options?: FormFieldOption[];
  /** 默认值 */
  defaultValue?: unknown;
  /** 提示信息 */
  tooltip?: string;
  /** 字段描述（显示在输入框下方） */
  description?: string;
}

// ==================== 属性面板 Props ====================

/**
 * 属性面板组件的 Props
 */
export interface PropertyPanelProps<T extends WorkflowNodeData = WorkflowNodeData> {
  /** 节点 ID */
  nodeId: string;
  /** 节点数据 */
  data: T;
}

// ==================== 节点配置接口 ====================

/**
 * 节点配置接口
 *
 * 每种节点类型都需要提供一个配置对象，包含：
 * - 基本信息（类型、名称、图标、分类）
 * - 组件（节点组件、属性面板组件）
 * - 连接规则（最大输入/输出数量）
 * - 默认数据
 * - 表单配置（支持动态表单或自定义面板组件）
 */
/**
 * 图标颜色类型
 */
export type IconColor = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';

export interface NodeConfig<T extends WorkflowNodeData = WorkflowNodeData> {
  /** 节点类型 */
  type: NodeType;
  /** 节点名称（显示在节点面板中） */
  label: string;
  /** 节点描述 */
  description: string;
  /** 节点图标 */
  icon: ReactNode;
  /** 图标背景色 */
  iconColor?: IconColor;
  /** 节点分类 */
  category: NodeCategory;

  /** 节点组件 */
  component: React.ComponentType<{ data: T; id: string; selected?: boolean }>;

  /**
   * 属性面板配置（二选一）
   * - formSchema: 简单表单使用配置驱动
   * - propertyPanel: 复杂表单使用自定义组件
   *
   * 优先级：propertyPanel > formSchema
   */
  formSchema?: FormField[];
  /** 自定义属性面板组件 */
  propertyPanel?: React.ComponentType<PropertyPanelProps<T>>;

  /** 最大输入连接数，0 表示不限制 */
  maxInputs: number;
  /** 最大输出连接数，0 表示不限制 */
  maxOutputs: number;

  /** 默认数据 */
  defaultData: T;
}

