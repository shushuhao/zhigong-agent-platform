/**
 * 节点执行器集合
 * 
 * 为每种节点类型提供模拟执行逻辑
 * 在真实场景中，这些执行器会调用真实的 API、LLM 等服务
 */

import { NodeType } from '../types';
import type { WorkflowNode, StartNodeData, EndNodeData, LLMNodeData, APINodeData, CodeNodeData, BranchNodeData } from '../types';
import type { NodeExecutor, NodeExecutionResult, WorkflowRunContext, NodeExecutionStatus } from './types';
import { NodeExecutionStatus as Status } from './types';

// ==================== 工具函数 ====================

/**
 * 解析变量引用
 * 将 {{节点名.变量名}} 格式的引用替换为实际值
 */
export function resolveVariables(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, varPath) => {
    const value = variables[varPath.trim()];
    if (value === undefined) {
      return match; // 保持原样
    }
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  });
}

/**
 * 模拟延迟（模拟网络请求或处理时间）
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机延迟时间（模拟真实执行时间）
 */
function randomDelay(min: number = 500, max: number = 1500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 创建基础执行结果
 */
function createBaseResult(node: WorkflowNode, status: NodeExecutionStatus, startTime: number): NodeExecutionResult {
  return {
    nodeId: node.id,
    nodeType: node.type as NodeType,
    nodeName: node.data.label,
    status,
    startTime,
    logs: [],
  };
}

// ==================== 开始节点执行器 ====================

export const startNodeExecutor: NodeExecutor = {
  async execute(node: WorkflowNode, context: WorkflowRunContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as StartNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onLog?.(node.id, '🚀 开始执行工作流');
    context.onNodeStatusChange?.(node.id, Status.RUNNING);

    await delay(randomDelay(300, 600));

    // 将输入变量写入运行时变量
    const outputs: Record<string, unknown> = {};
    if (data.inputs && data.inputs.length > 0) {
      data.inputs.forEach(input => {
        const varKey = `${data.label}.${input.name}`;
        // 使用默认值或从 context 中获取输入
        const value = context.variables[input.name] ?? input.defaultValue ?? '';
        context.variables[varKey] = value;
        outputs[input.name] = value;
        context.onLog?.(node.id, `📥 输入变量 ${input.name} = ${JSON.stringify(value)}`);
      });
    }

    const endTime = Date.now();
    return {
      ...result,
      status: Status.SUCCESS,
      endTime,
      duration: endTime - startTime,
      outputs,
      logs: result.logs,
    };
  },
};

// ==================== 结束节点执行器 ====================

export const endNodeExecutor: NodeExecutor = {
  async execute(node: WorkflowNode, context: WorkflowRunContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as EndNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onLog?.(node.id, '🏁 工作流执行完成');
    context.onNodeStatusChange?.(node.id, Status.RUNNING);

    await delay(randomDelay(200, 400));

    // 收集输出变量
    const outputs: Record<string, unknown> = {};
    if (data.outputVariables && data.outputVariables.length > 0) {
      data.outputVariables.forEach(output => {
        // 解析变量引用
        const resolvedValue = resolveVariables(output.value, context.variables);
        outputs[output.name] = resolvedValue;
        context.onLog?.(node.id, `📤 输出变量 ${output.name} = ${resolvedValue}`);
      });
    }

    const endTime = Date.now();
    return {
      ...result,
      status: Status.SUCCESS,
      endTime,
      duration: endTime - startTime,
      outputs,
      logs: result.logs,
    };
  },
};

// ==================== 大模型节点执行器 ====================

/**
 * 模拟 LLM 响应
 */
function mockLLMResponse(prompt: string, model: string): string {
  const responses = [
    `基于您的提示词，我为您生成以下内容：\n\n${prompt.slice(0, 50)}...\n\n这是由 ${model} 模型生成的模拟响应。在实际应用中，这里会是真实的 AI 生成内容。`,
    `感谢您的提问！根据分析，以下是我的回答：\n\n针对"${prompt.slice(0, 30)}"，我认为这是一个很好的问题。\n\n[模拟响应 - ${model}]`,
    `我已经理解了您的需求。以下是基于 ${model} 的智能分析结果：\n\n1. 关键点分析\n2. 建议方案\n3. 实施步骤\n\n[这是模拟数据]`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export const llmNodeExecutor: NodeExecutor = {
  async execute(node: WorkflowNode, context: WorkflowRunContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as LLMNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onNodeStatusChange?.(node.id, Status.RUNNING);
    context.onLog?.(node.id, `🤖 开始调用大模型: ${data.model || '默认模型'}`);

    // 解析 prompt 中的变量引用
    const resolvedPrompt = resolveVariables(data.prompt || '', context.variables);
    const resolvedContext = resolveVariables(data.context || '', context.variables);
    
    context.onLog?.(node.id, `📝 Prompt: ${resolvedPrompt.slice(0, 100)}...`);
    if (resolvedContext) {
      context.onLog?.(node.id, `📋 Context: ${resolvedContext.slice(0, 100)}...`);
    }

    // 模拟 LLM 调用延迟（LLM 通常需要更长时间）
    await delay(randomDelay(1500, 3000));

    // 生成模拟响应
    const llmResponse = mockLLMResponse(resolvedPrompt, data.model || 'GPT-4');
    
    // 将输出写入变量
    const outputs: Record<string, unknown> = {};
    if (data.outputs && data.outputs.length > 0) {
      data.outputs.forEach(output => {
        const varKey = `${data.label}.${output.name}`;
        let value: unknown = llmResponse;
        
        // 根据类型转换
        if (output.type === 'object') {
          value = { text: llmResponse, model: data.model };
        } else if (output.type === 'array') {
          value = [llmResponse];
        }
        
        context.variables[varKey] = value;
        outputs[output.name] = value;
      });
    } else {
      // 默认输出
      const varKey = `${data.label}.text`;
      context.variables[varKey] = llmResponse;
      outputs['text'] = llmResponse;
    }

    context.onLog?.(node.id, `✅ 模型响应: ${llmResponse.slice(0, 100)}...`);

    const endTime = Date.now();
    return {
      ...result,
      status: Status.SUCCESS,
      endTime,
      duration: endTime - startTime,
      inputs: { prompt: resolvedPrompt, context: resolvedContext, model: data.model },
      outputs,
      logs: result.logs,
    };
  },
};

// ==================== API 节点执行器 ====================

/**
 * 模拟 API 响应
 */
function mockAPIResponse(url: string, method: string): { status: number; body: unknown; headers: Record<string, string> } {
  // 模拟不同的 API 响应
  const mockResponses: Record<string, unknown> = {
    default: {
      success: true,
      message: '请求成功',
      data: {
        id: Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString(),
        result: '这是模拟的 API 响应数据',
      },
    },
    user: {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
    },
    list: {
      total: 100,
      page: 1,
      items: [
        { id: 1, title: '项目 A' },
        { id: 2, title: '项目 B' },
        { id: 3, title: '项目 C' },
      ],
    },
  };

  // 根据 URL 关键词返回不同的模拟数据
  let responseBody = mockResponses.default;
  if (url.includes('user')) {
    responseBody = mockResponses.user;
  } else if (url.includes('list') || url.includes('items')) {
    responseBody = mockResponses.list;
  }

  return {
    status: 200,
    body: responseBody,
    headers: {
      'content-type': 'application/json',
      'x-request-id': `req_${Date.now()}`,
    },
  };
}

export const apiNodeExecutor: NodeExecutor = {
  async execute(node: WorkflowNode, context: WorkflowRunContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as APINodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onNodeStatusChange?.(node.id, Status.RUNNING);
    
    // 解析 URL 中的变量
    const resolvedUrl = resolveVariables(data.url, context.variables);
    context.onLog?.(node.id, `🌐 发起 ${data.method} 请求: ${resolvedUrl}`);

    // 模拟网络请求延迟
    await delay(randomDelay(800, 1500));

    // 模拟可能的失败情况（10% 概率）
    const shouldFail = Math.random() < 0.1;
    if (shouldFail && data.retryCount === 0) {
      const endTime = Date.now();
      context.onLog?.(node.id, `❌ 请求失败: 网络超时`);
      return {
        ...result,
        status: Status.FAILED,
        endTime,
        duration: endTime - startTime,
        error: '网络请求超时',
        logs: result.logs,
      };
    }

    // 生成模拟响应
    const response = mockAPIResponse(resolvedUrl, data.method);
    
    // 将输出写入变量
    const outputs: Record<string, unknown> = {
      body: response.body,
      status_code: response.status,
      headers: response.headers,
    };

    // 写入运行时变量
    Object.entries(outputs).forEach(([key, value]) => {
      const varKey = `${data.label}.${key}`;
      context.variables[varKey] = value;
    });

    context.onLog?.(node.id, `✅ 响应状态: ${response.status}`);
    context.onLog?.(node.id, `📦 响应数据: ${JSON.stringify(response.body).slice(0, 100)}...`);

    const endTime = Date.now();
    return {
      ...result,
      status: Status.SUCCESS,
      endTime,
      duration: endTime - startTime,
      inputs: { url: resolvedUrl, method: data.method },
      outputs,
      logs: result.logs,
    };
  },
};

// ==================== 代码节点执行器 ====================

/**
 * 模拟代码执行
 */
function mockCodeExecution(code: string, inputs: Record<string, unknown>, outputs: { name: string; type: string }[]): Record<string, unknown> {
  // 模拟代码执行结果
  const result: Record<string, unknown> = {};
  
  outputs.forEach(output => {
    switch (output.type) {
      case 'string':
        result[output.name] = `处理结果: ${JSON.stringify(inputs)}`;
        break;
      case 'number':
        result[output.name] = Math.floor(Math.random() * 100);
        break;
      case 'boolean':
        result[output.name] = Math.random() > 0.5;
        break;
      case 'object':
        result[output.name] = { processed: true, input: inputs, timestamp: Date.now() };
        break;
      case 'array':
        result[output.name] = Object.values(inputs);
        break;
      default:
        result[output.name] = null;
    }
  });

  return result;
}

export const codeNodeExecutor: NodeExecutor = {
  async execute(node: WorkflowNode, context: WorkflowRunContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as CodeNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onNodeStatusChange?.(node.id, Status.RUNNING);
    context.onLog?.(node.id, `💻 执行 ${data.language} 代码`);

    // 解析输入变量
    const resolvedInputs: Record<string, unknown> = {};
    if (data.inputs && data.inputs.length > 0) {
      data.inputs.forEach(input => {
        const resolvedValue = resolveVariables(input.value, context.variables);
        resolvedInputs[input.name] = resolvedValue;
        context.onLog?.(node.id, `📥 输入: ${input.name} = ${resolvedValue}`);
      });
    }

    // 模拟代码执行延迟
    await delay(randomDelay(500, 1000));

    // 执行代码（模拟）
    const codeOutputs = mockCodeExecution(data.code, resolvedInputs, data.outputs || []);

    // 将输出写入变量
    Object.entries(codeOutputs).forEach(([key, value]) => {
      const varKey = `${data.label}.${key}`;
      context.variables[varKey] = value;
      context.onLog?.(node.id, `📤 输出: ${key} = ${JSON.stringify(value).slice(0, 50)}`);
    });

    context.onLog?.(node.id, `✅ 代码执行完成`);

    const endTime = Date.now();
    return {
      ...result,
      status: Status.SUCCESS,
      endTime,
      duration: endTime - startTime,
      inputs: resolvedInputs,
      outputs: codeOutputs,
      logs: result.logs,
    };
  },
};

// ==================== 分支器节点执行器 ====================

/**
 * 评估条件表达式（简化版）
 */
function evaluateCondition(condition: string, variables: Record<string, unknown>): boolean {
  if (!condition || condition.trim() === '') {
    return false;
  }

  // 解析变量引用
  const resolvedCondition = resolveVariables(condition, variables);
  
  // 简单的条件评估（实际应用中需要更复杂的表达式解析器）
  try {
    // 支持简单的比较：>, <, >=, <=, ==, !=, contains
    const patterns = [
      /(.+)\s*>\s*(\d+)/,      // > 数字
      /(.+)\s*<\s*(\d+)/,      // < 数字
      /(.+)\s*>=\s*(\d+)/,     // >= 数字
      /(.+)\s*<=\s*(\d+)/,     // <= 数字
      /(.+)\s*==\s*["']?(.+?)["']?$/,  // == 值
      /(.+)\s*!=\s*["']?(.+?)["']?$/,  // != 值
    ];

    for (const pattern of patterns) {
      const match = resolvedCondition.match(pattern);
      if (match) {
        const left = match[1].trim();
        const right = match[2].trim();
        const leftNum = parseFloat(left);
        const rightNum = parseFloat(right);

        if (resolvedCondition.includes('>=')) return leftNum >= rightNum;
        if (resolvedCondition.includes('<=')) return leftNum <= rightNum;
        if (resolvedCondition.includes('!=')) return left !== right;
        if (resolvedCondition.includes('==')) return left === right;
        if (resolvedCondition.includes('>')) return leftNum > rightNum;
        if (resolvedCondition.includes('<')) return leftNum < rightNum;
      }
    }

    // 如果都不匹配，检查是否为 truthy
    return !!resolvedCondition && resolvedCondition !== 'false' && resolvedCondition !== '0';
  } catch {
    return false;
  }
}

export const branchNodeExecutor: NodeExecutor = {
  async execute(node: WorkflowNode, context: WorkflowRunContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as BranchNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onNodeStatusChange?.(node.id, Status.RUNNING);
    context.onLog?.(node.id, `🔀 评估分支条件`);

    await delay(randomDelay(300, 500));

    // 评估每个条件分支
    let matchedBranchId: string | null = null;
    
    if (data.branches && data.branches.length > 0) {
      for (const branch of data.branches) {
        const conditionMet = evaluateCondition(branch.condition || '', context.variables);
        context.onLog?.(node.id, `  条件 "${branch.label}": ${branch.condition || '(空)'} => ${conditionMet}`);
        
        if (conditionMet) {
          matchedBranchId = branch.id;
          context.onLog?.(node.id, `✅ 命中分支: ${branch.label}`);
          break;
        }
      }
    }

    // 如果没有命中任何条件，使用 else 分支
    if (!matchedBranchId && data.showElseBranch) {
      matchedBranchId = 'else';
      context.onLog?.(node.id, `✅ 进入默认分支 (否则)`);
    }

    const outputs = {
      matchedBranch: matchedBranchId,
    };

    // 写入变量
    context.variables[`${data.label}.matchedBranch`] = matchedBranchId;

    const endTime = Date.now();
    return {
      ...result,
      status: Status.SUCCESS,
      endTime,
      duration: endTime - startTime,
      outputs,
      logs: result.logs,
    };
  },
};

// ==================== 执行器注册表 ====================

/**
 * 节点执行器映射
 */
export const nodeExecutors: Record<NodeType, NodeExecutor> = {
  [NodeType.START]: startNodeExecutor,
  [NodeType.END]: endNodeExecutor,
  [NodeType.LLM]: llmNodeExecutor,
  [NodeType.API]: apiNodeExecutor,
  [NodeType.CODE]: codeNodeExecutor,
  [NodeType.BRANCH]: branchNodeExecutor,
};

/**
 * 获取节点执行器
 */
export function getNodeExecutor(nodeType: NodeType): NodeExecutor | undefined {
  return nodeExecutors[nodeType];
}
