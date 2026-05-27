/**
 * 工作流变量工具函数
 *
 * 提供统一的变量获取和管理功能，支持：
 * 1. 获取上游节点的所有可用变量
 * 2. 基于工作流拓扑结构计算变量来源
 * 3. 变量引用格式处理
 */

import type { WorkflowNode, WorkflowEdge, WorkflowNodeData } from './types';
import { NodeType, type StartNodeData, type LLMNodeData, type CodeNodeData, type APINodeData, type KnowledgeNodeData, type MCPNodeData } from './types';

// ==================== 类型定义 ====================

/**
 * 工作流变量
 * 统一的变量类型，包含来源信息
 */
export interface WorkflowVariable {
  /** 变量唯一标识 */
  id: string;
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: string;
  /** 变量描述 */
  description?: string;
  /** 来源节点 ID */
  sourceNodeId: string;
  /** 来源节点名称 */
  sourceNodeLabel: string;
  /** 来源节点类型 */
  sourceNodeType: NodeType;
}

// ==================== 核心函数 ====================

/**
 * 获取所有上游节点的 ID
 *
 * 通过工作流的边（edges）反向遍历，找到所有可以到达当前节点的上游节点
 * 使用广度优先搜索（BFS）确保不会遗漏任何上游节点
 *
 * @param nodeId - 当前节点 ID
 * @param edges - 工作流的所有边
 * @returns 所有上游节点的 ID 列表
 */
export function getUpstreamNodeIds(nodeId: string, edges: WorkflowEdge[]): string[] {
  const result: string[] = [];
  const visited = new Set<string>();
  const queue: string[] = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    // 找到所有指向当前节点的边（source -> target）
    const incomingEdges = edges.filter((edge) => edge.target === currentId);

    for (const edge of incomingEdges) {
      if (!visited.has(edge.source)) {
        visited.add(edge.source);
        result.push(edge.source);
        queue.push(edge.source); // 继续向上游查找
      }
    }
  }

  return result;
}

/**
 * 从节点中提取输出变量
 *
 * 根据节点类型，提取该节点产生的输出变量
 * - 开始节点：提取 inputs（输入变量作为后续节点的可用变量）
 * - 大模型节点：提取 outputs
 * - 代码节点：暂时没有明确的输出变量
 *
 * @param node - 工作流节点
 * @returns 该节点的输出变量列表
 */
export function extractNodeOutputs(node: WorkflowNode): Omit<WorkflowVariable, 'sourceNodeId' | 'sourceNodeLabel' | 'sourceNodeType'>[] {
  const nodeType = node.type as NodeType;
  const data = node.data as WorkflowNodeData;

  switch (nodeType) {
    case NodeType.START: {
      // 开始节点的输入变量 = 后续节点的可用变量
      const startData = data as StartNodeData;
      return (startData.inputs || []).map((input) => ({
        id: input.id,
        name: input.name,
        type: input.type,
        description: input.description,
      }));
    }

    case NodeType.LLM: {
      // 大模型节点的输出变量
      const llmData = data as LLMNodeData;
      return (llmData.outputs || []).map((output, index) => ({
        id: `${node.id}-output-${index}`,
        name: output.name,
        type: output.type,
        description: output.description,
      }));
    }

    case NodeType.CODE: {
      // 代码节点的输出变量
      const codeData = data as CodeNodeData;
      return (codeData.outputs || []).map((output, index) => ({
        id: `${node.id}-output-${index}`,
        name: output.name,
        type: output.type,
        description: `代码节点输出: ${output.name}`,
      }));
    }

    case NodeType.API: {
      // API 节点的输出变量（body, status_code, headers）
      const apiData = data as APINodeData;
      return (apiData.outputs || []).map((output, index) => ({
        id: `${node.id}-output-${index}`,
        name: output.name,
        type: output.type,
        description: output.description,
      }));
    }

    case NodeType.BRANCH: {
      // 分支器节点不产生输出变量，只是根据条件引导流程
      return [];
    }

    case NodeType.KNOWLEDGE: {
      // 知识检索节点的输出变量
      const knowledgeData = data as KnowledgeNodeData;
      return (knowledgeData.outputs || []).map((output, index) => ({
        id: `${node.id}-output-${index}`,
        name: output.name,
        type: output.type,
        description: output.description,
      }));
    }

    case NodeType.MCP: {
      // MCP 节点的输出变量
      const mcpData = data as MCPNodeData;
      return (mcpData.outputs || []).map((output, index) => ({
        id: `${node.id}-output-${index}`,
        name: output.name,
        type: output.type,
        description: output.description,
      }));
    }

    default:
      return [];
  }
}

/**
 * 获取指定节点的所有可用变量
 *
 * 这是主要的对外 API，组合使用 getUpstreamNodeIds 和 extractNodeOutputs
 * 返回当前节点可以引用的所有上游变量
 *
 * @param nodeId - 当前节点 ID
 * @param nodes - 工作流的所有节点
 * @param edges - 工作流的所有边
 * @returns 所有可用变量列表，包含来源信息
 */
export function getAvailableVariables(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowVariable[] {
  const variables: WorkflowVariable[] = [];

  // 1. 获取所有上游节点 ID
  const upstreamNodeIds = getUpstreamNodeIds(nodeId, edges);

  // 2. 遍历上游节点，收集变量
  for (const upstreamId of upstreamNodeIds) {
    const node = nodes.find((n) => n.id === upstreamId);
    if (!node) continue;

    // 提取该节点的输出变量
    const outputs = extractNodeOutputs(node);

    // 添加来源信息
    variables.push(
      ...outputs.map((output) => ({
        ...output,
        sourceNodeId: node.id,
        sourceNodeLabel: (node.data as WorkflowNodeData).label || '未命名节点',
        sourceNodeType: node.type as NodeType,
      }))
    );
  }

  return variables;
}

