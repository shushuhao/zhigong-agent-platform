/**
 * 工作流执行引擎
 * 
 * 核心职责：
 * 1. 按拓扑顺序执行节点
 * 2. 处理分支逻辑
 * 3. 管理执行状态
 * 4. 支持暂停和停止
 */

import type { Edge } from '@xyflow/react';
import { NodeType } from '../types';
import type { WorkflowNode } from '../types';
import type { 
  WorkflowRunContext, 
  WorkflowRunResult, 
  NodeExecutionResult,
  WorkflowRunInput,
} from './types';
import { NodeExecutionStatus, WorkflowRunStatus } from './types';
import { getNodeExecutor } from './executors';

/**
 * 执行状态
 */
interface ExecutionState {
  isRunning: boolean;
  shouldStop: boolean;
}

/**
 * 生成运行 ID
 */
function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * 构建节点邻接表（出边）
 */
function buildAdjacencyList(edges: Edge[]): Map<string, string[]> {
  const adjacencyList = new Map<string, string[]>();
  
  edges.forEach(edge => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  return adjacencyList;
}

/**
 * 查找开始节点
 */
function findStartNode(nodes: WorkflowNode[]): WorkflowNode | undefined {
  return nodes.find(node => node.type === NodeType.START);
}

/**
 * 获取节点的所有输出边
 */
function getOutgoingEdges(nodeId: string, edges: Edge[]): Edge[] {
  return edges.filter(edge => edge.source === nodeId);
}

/**
 * 根据分支结果确定下一个节点
 */
function getNextNodesForBranch(
  nodeId: string,
  matchedBranchId: string | null,
  edges: Edge[],
  nodes: WorkflowNode[]
): string[] {
  const outgoingEdges = getOutgoingEdges(nodeId, edges);
  
  if (!matchedBranchId) {
    return [];
  }

  // 分支节点的边通常带有 sourceHandle 来标识是哪个分支
  // sourceHandle 格式: branch-{branchId} 或 else
  const matchingEdge = outgoingEdges.find(edge => {
    if (matchedBranchId === 'else') {
      return edge.sourceHandle?.includes('else');
    }
    return edge.sourceHandle?.includes(matchedBranchId);
  });

  if (matchingEdge) {
    return [matchingEdge.target];
  }

  // 如果没有找到匹配的边，返回第一个非分支边或空数组
  return outgoingEdges.length > 0 ? [outgoingEdges[0].target] : [];
}

/**
 * 工作流执行引擎类
 */
export class WorkflowEngine {
  private state: ExecutionState = {
    isRunning: false,
    shouldStop: false,
  };

  /**
   * 执行工作流
   */
  async execute(
    nodes: WorkflowNode[],
    edges: Edge[],
    input: WorkflowRunInput
  ): Promise<WorkflowRunResult> {
    const runId = generateRunId();
    const startTime = Date.now();
    const nodeResults: NodeExecutionResult[] = [];

    // 初始化运行状态
    this.state = { isRunning: true, shouldStop: false };

    // 初始化运行上下文
    const context: WorkflowRunContext = {
      runId,
      variables: { ...input.variables },
      onNodeStatusChange: input.callbacks?.onNodeStatusChange,
      onLog: input.callbacks?.onLog,
    };

    // 通知开始运行
    input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.RUNNING);
    input.callbacks?.onLog?.('system', `🚀 开始执行工作流 (ID: ${runId})`);

    try {
      // 查找开始节点
      const startNode = findStartNode(nodes);
      if (!startNode) {
        throw new Error('未找到开始节点');
      }

      // 构建邻接表
      const adjacencyList = buildAdjacencyList(edges);

      // BFS 执行节点
      const visited = new Set<string>();
      const queue: string[] = [startNode.id];

      while (queue.length > 0) {
        // 检查是否应该停止
        if (this.state.shouldStop) {
          input.callbacks?.onLog?.('system', '⏹️ 工作流执行被手动停止');
          input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.STOPPED);
          return {
            runId,
            status: WorkflowRunStatus.STOPPED,
            startTime,
            endTime: Date.now(),
            nodeResults,
          };
        }

        const currentNodeId = queue.shift()!;
        
        // 跳过已访问的节点
        if (visited.has(currentNodeId)) {
          continue;
        }
        visited.add(currentNodeId);

        // 获取当前节点
        const currentNode = nodes.find(n => n.id === currentNodeId);
        if (!currentNode) {
          input.callbacks?.onLog?.('system', `⚠️ 节点 ${currentNodeId} 不存在，跳过`);
          continue;
        }

        // 获取节点执行器
        const executor = getNodeExecutor(currentNode.type as NodeType);
        if (!executor) {
          input.callbacks?.onLog?.('system', `⚠️ 节点类型 ${currentNode.type} 没有执行器，跳过`);
          continue;
        }

        // 执行节点
        const result = await executor.execute(currentNode, context);
        nodeResults.push(result);

        // 如果节点执行失败，根据配置决定是否继续
        if (result.status === NodeExecutionStatus.FAILED) {
          input.callbacks?.onLog?.('system', `❌ 节点 ${currentNode.data.label} 执行失败: ${result.error}`);
          
          // 标记节点状态为失败
          input.callbacks?.onNodeStatusChange?.(currentNodeId, NodeExecutionStatus.FAILED);
          
          // 默认行为：失败时停止整个工作流
          input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.FAILED);
          return {
            runId,
            status: WorkflowRunStatus.FAILED,
            startTime,
            endTime: Date.now(),
            nodeResults,
            error: result.error,
          };
        }

        // 标记节点状态为成功
        input.callbacks?.onNodeStatusChange?.(currentNodeId, NodeExecutionStatus.SUCCESS);

        // 确定下一个要执行的节点
        let nextNodeIds: string[] = [];

        if (currentNode.type === NodeType.BRANCH) {
          // 分支节点：根据条件结果确定下一个节点
          const matchedBranch = result.outputs?.matchedBranch as string | null;
          nextNodeIds = getNextNodesForBranch(currentNodeId, matchedBranch, edges, nodes);
        } else if (currentNode.type === NodeType.END) {
          // 结束节点：不再继续
          input.callbacks?.onLog?.('system', `🏁 到达结束节点，工作流执行完成`);
        } else {
          // 普通节点：获取所有下游节点
          nextNodeIds = adjacencyList.get(currentNodeId) || [];
        }

        // 将下游节点加入队列
        nextNodeIds.forEach(nodeId => {
          if (!visited.has(nodeId)) {
            queue.push(nodeId);
          }
        });
      }

      // 获取最终输出
      const endNode = nodes.find(n => n.type === NodeType.END);
      const endNodeResult = nodeResults.find(r => r.nodeId === endNode?.id);

      // 计算总执行时间
      const endTime = Date.now();
      input.callbacks?.onLog?.('system', `✅ 工作流执行成功，总耗时: ${endTime - startTime}ms`);
      input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.SUCCESS);

      return {
        runId,
        status: WorkflowRunStatus.SUCCESS,
        startTime,
        endTime,
        nodeResults,
        finalOutput: endNodeResult?.outputs,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      input.callbacks?.onLog?.('system', `❌ 工作流执行出错: ${errorMessage}`);
      input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.FAILED);

      return {
        runId,
        status: WorkflowRunStatus.FAILED,
        startTime,
        endTime: Date.now(),
        nodeResults,
        error: errorMessage,
      };

    } finally {
      this.state.isRunning = false;
    }
  }

  /**
   * 停止执行
   */
  stop(): void {
    if (this.state.isRunning) {
      this.state.shouldStop = true;
    }
  }

  /**
   * 获取运行状态
   */
  isRunning(): boolean {
    return this.state.isRunning;
  }
}

// 创建单例实例
export const workflowEngine = new WorkflowEngine();

/**
 * 执行工作流的便捷函数
 */
export async function runWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[],
  input?: WorkflowRunInput
): Promise<WorkflowRunResult> {
  return workflowEngine.execute(nodes, edges, input || { variables: {} });
}

/**
 * 停止工作流执行
 */
export function stopWorkflow(): void {
  workflowEngine.stop();
}
