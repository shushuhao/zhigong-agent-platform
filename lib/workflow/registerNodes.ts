/**
 * 节点注册配置
 *
 * 这个文件负责将所有节点注册到注册中心
 * 添加新节点时，只需在这里添加新的注册调用
 */

import React from 'react';
import { PlayCircleOutlined, StopOutlined, CodeOutlined, RobotOutlined, ApiOutlined, BranchesOutlined, BookOutlined } from '@ant-design/icons';
import { nodeRegistry } from './nodeRegistry';
import { NodeType } from './types';
import type { StartNodeData, EndNodeData, CodeNodeData, LLMNodeData, APINodeData, BranchNodeData, KnowledgeNodeData, MCPNodeData } from './types';
import { StartNode } from '@/components/workflow/nodes/StartNode';
import { EndNode } from '@/components/workflow/nodes/EndNode';
import { CodeNode } from '@/components/workflow/nodes/CodeNode';
import { LLMNode } from '@/components/workflow/nodes/LLMNode';
import { APINode } from '@/components/workflow/nodes/APINode';
import { BranchNode } from '@/components/workflow/nodes/BranchNode';
import { KnowledgeNode } from '@/components/workflow/nodes/KnowledgeNode';
import { MCPNode } from '@/components/workflow/nodes/MCPNode';
import { LLMPropertyPanel } from '@/components/workflow/panels/LLMPropertyPanel';
import { StartPropertyPanel } from '@/components/workflow/panels/StartPropertyPanel';
import { EndPropertyPanel } from '@/components/workflow/panels/EndPropertyPanel';
import { APIPropertyPanel } from '@/components/workflow/panels/APIPropertyPanel';
import { CodePropertyPanel } from '@/components/workflow/panels/CodePropertyPanel';
import { BranchPropertyPanel } from '@/components/workflow/panels/BranchPropertyPanel';
import { KnowledgePropertyPanel } from '@/components/workflow/panels/KnowledgePropertyPanel';
import { MCPPropertyPanel } from '@/components/workflow/panels/MCPPropertyPanel';

/**
 * 注册所有节点
 *
 * 在应用启动时调用此函数，确保所有节点都被注册
 */
export function registerAllNodes(): void {
  // ==================== 注册开始节点 ====================
  nodeRegistry.register<StartNodeData>({
    type: NodeType.START,
    label: '开始',
    description: '工作流的起点，定义输入变量',
    icon: React.createElement(PlayCircleOutlined),
    iconColor: 'green',
    category: 'trigger',
    component: StartNode,
    // 使用自定义属性面板（支持动态添加变量）
    propertyPanel: StartPropertyPanel,
    maxInputs: 0,   // 开始节点没有输入
    maxOutputs: 1,  // 只能有一个输出
    defaultData: {
      label: '开始',
      inputs: [],   // 默认没有输入变量
    },
  });

  // ==================== 注册结束节点 ====================
  nodeRegistry.register<EndNodeData>({
    type: NodeType.END,
    label: '结束',
    description: '工作流的终点，定义输出变量',
    icon: React.createElement(StopOutlined),
    iconColor: 'red',
    category: 'end',
    component: EndNode,
    // 使用自定义属性面板（支持动态添加变量）
    propertyPanel: EndPropertyPanel,
    maxInputs: 1,   // 只能有一个输入
    maxOutputs: 0,  // 结束节点没有输出
    defaultData: {
      label: '结束',
      outputVariables: [],   // 默认没有输出变量
    },
  });

  // ==================== 注册代码节点 ====================
  nodeRegistry.register<CodeNodeData>({
    type: NodeType.CODE,
    label: '代码',
    description: '执行自定义 JavaScript 或 Python3 代码',
    icon: React.createElement(CodeOutlined),
    iconColor: 'orange',
    category: 'action',
    component: CodeNode,
    propertyPanel: CodePropertyPanel,
    formSchema: [
      {
        name: 'label',
        label: '节点名称',
        type: 'input',
        required: true,
        placeholder: '请输入节点名称',
      },
      {
        name: 'language',
        label: '编程语言',
        type: 'select',
        required: true,
        options: [
          { label: 'Python3', value: 'python3' },
          { label: 'JavaScript', value: 'javascript' },
        ],
        tooltip: '选择代码执行的编程语言',
      },
      {
        name: 'code',
        label: '代码',
        type: 'textarea',
        placeholder: '请输入代码',
        description: '在这里编写要执行的代码',
      },
    ],
    maxInputs: 1,
    maxOutputs: 1,
    defaultData: {
      label: '代码',
      language: 'python3',
      code: `# 在这里，您可以通过 'args' 获取节点中的输入变量，并通过 'ret' 输出结果
# 'args' 和 'ret' 已经被正确地注入到环境中
# 下面是一个示例，首先获取节点的全部输入参数 params, 其次获取其中参数名为'input'的值:
# params = args.params;
# input = params.input;
# 下面是一个示例，输出一个包含多种数据类型的 'ret' 对象:
# ret: Output = { "name": '小明', "hobbies": ["看书", "旅游"] };
def main(arg1: str, arg2: str) -> dict:
    return {
        "result": arg1 + arg2,
    }`,
      inputs: [
        { id: 'input-1', name: 'arg1', value: '' },
        { id: 'input-2', name: 'arg2', value: '' },
      ],
      outputs: [
        { name: 'result', type: 'object' },
      ],
    },
  });

  // ==================== 注册大模型节点 ====================
  nodeRegistry.register<LLMNodeData>({
    type: NodeType.LLM,
    label: '大模型',
    description: '调用大语言模型（LLM）生成内容',
    icon: React.createElement(RobotOutlined),
    iconColor: 'blue',
    category: 'action',
    component: LLMNode,
    // 使用自定义属性面板（复杂表单）
    propertyPanel: LLMPropertyPanel,
    maxInputs: 1,
    maxOutputs: 1,
    defaultData: {
      label: '大模型',
      model: undefined,           // 默认未选择模型
      temperatureEnabled: true,   // 默认启用温度参数
      temperature: 0.6,           // 默认温度
      topPEnabled: false,         // 默认不启用 Top P
      topP: 0.8,                  // 默认 Top P 值
      context: '',                // 上下文变量
      prompt: '',                 // 提示词
      outputs: [                  // 默认输出变量
        {
          name: 'text',
          type: 'string',
          description: '生成内容',
        },
      ],
    },
  });

  // ==================== 注册 API 节点 ====================
  nodeRegistry.register<APINodeData>({
    type: NodeType.API,
    label: 'API',
    description: '发送 HTTP 请求，支持 GET/POST/PUT/DELETE/PATCH',
    icon: React.createElement(ApiOutlined),
    iconColor: 'green',
    category: 'action',
    component: APINode,
    // 使用自定义属性面板（复杂表单）
    propertyPanel: APIPropertyPanel,
    maxInputs: 1,
    maxOutputs: 1,
    defaultData: {
      label: 'API',
      method: 'GET',
      url: '',
      params: [],
      headers: [],
      authEnabled: false,
      bodyType: 'none',
      bodyFormData: [],
      bodyJson: '',
      bodyRaw: '',
      timeout: 120,
      retryCount: 3,
      outputs: [
        { name: 'body', type: 'string', description: '响应内容' },
        { name: 'status_code', type: 'number', description: '响应状态码' },
        { name: 'headers', type: 'object', description: '响应头列表 JSON' },
      ],
    },
  });

  // ==================== 注册分支器节点 ====================
  nodeRegistry.register<BranchNodeData>({
    type: NodeType.BRANCH,
    label: '分支器',
    description: '根据条件将工作流引导到不同的分支路径',
    icon: React.createElement(BranchesOutlined),
    iconColor: 'orange',
    category: 'logic',
    component: BranchNode,
    propertyPanel: BranchPropertyPanel,
    maxInputs: 1,
    maxOutputs: 0,  // 动态输出，不限制
    defaultData: {
      label: '分支器',
      branches: [
        {
          id: 'branch-1',
          label: '如果',
          condition: '',
        },
      ],
      showElseBranch: true,
    },
  });

  // ==================== 注册知识检索节点 ====================
  nodeRegistry.register<KnowledgeNodeData>({
    type: NodeType.KNOWLEDGE,
    label: '知识检索',
    description: '从知识库中检索相关信息',
    icon: React.createElement(BookOutlined),
    iconColor: 'purple',
    category: 'action',
    component: KnowledgeNode,
    propertyPanel: KnowledgePropertyPanel,
    maxInputs: 1,
    maxOutputs: 1,
    defaultData: {
      label: '知识检索',
      knowledgeBases: [],
      retrievalConfig: {
        strategy: 'hybrid',
        semanticWeight: 0.7,
        rerankEnabled: true,
        topK: 5,
        scoreThreshold: 0.5,
        autoTagFilter: false,
      },
      queryVariable: '',
      outputs: [
        {
          name: 'result',
          type: 'array',
          description: '检索结果列表，包含匹配的文档片段',
        },
      ],
    },
  });

  // ==================== 注册 MCP 节点 ====================
  // 注意：MCP 节点的 defaultData 是一个占位符，实际数据由选择的 MCP 工具决定
  nodeRegistry.register<MCPNodeData>({
    type: NodeType.MCP,
    label: 'MCP',
    description: '调用 MCP 协议工具',
    icon: React.createElement(ApiOutlined),
    iconColor: 'purple',
    category: 'action',
    component: MCPNode,
    propertyPanel: MCPPropertyPanel,
    maxInputs: 1,
    maxOutputs: 1,
    defaultData: {
      label: 'MCP',
      mcpTool: {
        serviceId: '',
        serviceName: '',
        serviceIcon: '🔧',
        toolId: '',
        toolName: '',
        toolDescription: '',
      },
      inputs: [],
      timeout: 120,
      retryCount: 3,
      errorHandleType: 'interrupt',
      outputs: [],
    },
  });

  // ==================== 后续扩展 ====================
  // 添加新节点时，在这里添加新的注册调用
}

/**
 * 确保只注册一次的标记
 */
let isRegistered = false;

/**
 * 初始化节点注册
 * 使用单例模式确保只注册一次
 */
export function initializeNodeRegistry(): void {
  if (isRegistered) {
    return;
  }
  registerAllNodes();
  isRegistered = true;
  console.log(`[NodeRegistry] 已注册 ${nodeRegistry.size} 个节点类型`);
}

