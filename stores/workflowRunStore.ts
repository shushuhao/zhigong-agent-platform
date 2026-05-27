/**
 * 工作流运行状态管理 Store
 * 
 * 用于管理工作流执行过程中的状态，包括：
 * - 运行状态（空闲、运行中、成功、失败、已停止）
 * - 各节点执行状态
 * - 执行日志
 * - 运行结果
 */

import { create } from 'zustand';
import type { Edge } from '@xyflow/react';
import type { WorkflowNode } from '@/lib/workflow/types';
import {
  NodeExecutionStatus,
  WorkflowRunStatus,
  type NodeExecutionResult,
  type WorkflowRunResult,
} from '@/lib/workflow/engine/types';
import { workflowEngine } from '@/lib/workflow/engine/workflowEngine';
import { validateWorkflowForRun, type ValidationResult } from '@/lib/workflow/validation';

/**
 * 日志条目
 */
export interface LogEntry {
  id: string;
  nodeId: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'error' | 'warning';
}

/**
 * 运行面板状态
 */
export interface WorkflowRunState {
  // 运行状态
  status: WorkflowRunStatus;
  
  // 当前运行 ID
  runId: string | null;
  
  // 节点执行状态映射
  nodeStatuses: Record<string, NodeExecutionStatus>;
  
  // 节点执行结果
  nodeResults: NodeExecutionResult[];
  
  // 执行日志
  logs: LogEntry[];
  
  // 最终输出
  finalOutput: Record<string, unknown> | null;
  
  // 运行时间
  startTime: number | null;
  endTime: number | null;
  
  // 运行面板是否显示
  isPanelOpen: boolean;
  
  // 输入变量（用于开始节点的参数）
  inputVariables: Record<string, unknown>;
  
  // 验证结果（用于显示验证错误）
  validationResult: ValidationResult | null;
  
  // 当前正在执行的边（用于边动画）
  runningEdges: string[];
}

/**
 * 运行面板操作
 */
export interface WorkflowRunActions {
  // 开始运行工作流（返回验证结果或执行结果）
  startRun: (nodes: WorkflowNode[], edges: Edge[]) => Promise<WorkflowRunResult | null>;
  
  // 停止运行
  stopRun: () => void;
  
  // 重置运行状态
  resetRun: () => void;
  
  // 设置输入变量
  setInputVariables: (variables: Record<string, unknown>) => void;
  
  // 更新单个输入变量
  updateInputVariable: (key: string, value: unknown) => void;
  
  // 打开/关闭运行面板
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  
  // 内部使用：更新状态
  setWorkflowStatus: (status: WorkflowRunStatus) => void;
  setNodeStatus: (nodeId: string, status: NodeExecutionStatus) => void;
  addLog: (nodeId: string, message: string) => void;
  clearLogs: () => void;
  
  // 设置正在运行的边
  setRunningEdges: (edgeIds: string[]) => void;
  addRunningEdge: (edgeId: string) => void;
  clearRunningEdges: () => void;
}

export type WorkflowRunStore = WorkflowRunState & WorkflowRunActions;

/**
 * 初始状态
 */
const initialState: WorkflowRunState = {
  status: WorkflowRunStatus.IDLE,
  runId: null,
  nodeStatuses: {},
  nodeResults: [],
  logs: [],
  finalOutput: null,
  startTime: null,
  endTime: null,
  isPanelOpen: false,
  inputVariables: {},
  validationResult: null,
  runningEdges: [],
};

/**
 * 生成日志 ID
 */
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * 创建工作流运行 Store
 */
export const useWorkflowRunStore = create<WorkflowRunStore>((set, get) => ({
  ...initialState,

  // 开始运行工作流
  startRun: async (nodes: WorkflowNode[], edges: Edge[]) => {
    const { inputVariables, addLog } = get();

    // 先进行运行前验证
    const validationResult = validateWorkflowForRun(nodes, edges);
    set({ validationResult });

    if (!validationResult.isValid) {
      // 验证失败，记录错误日志并返回
      set({
        status: WorkflowRunStatus.FAILED,
        isPanelOpen: true,
        startTime: Date.now(),
        endTime: Date.now(),
      });
      
      // 添加验证错误日志
      addLog('system', '❌ 工作流验证失败：');
      validationResult.issues.forEach(issue => {
        const nodeInfo = issue.nodeLabel ? `[${issue.nodeLabel}] ` : '';
        addLog('system', `  • ${nodeInfo}${issue.message}`);
      });
      
      return null;
    }

    // 重置状态
    set({
      status: WorkflowRunStatus.RUNNING,
      runId: null,
      nodeStatuses: {},
      nodeResults: [],
      logs: [],
      finalOutput: null,
      startTime: Date.now(),
      endTime: null,
      isPanelOpen: true,
      validationResult: null,
      runningEdges: [],
    });

    // 初始化所有节点为待执行状态
    const initialNodeStatuses: Record<string, NodeExecutionStatus> = {};
    nodes.forEach(node => {
      initialNodeStatuses[node.id] = NodeExecutionStatus.PENDING;
    });
    set({ nodeStatuses: initialNodeStatuses });

    // 执行工作流
    const result = await workflowEngine.execute(nodes, edges, {
      variables: inputVariables,
      callbacks: {
        onWorkflowStatusChange: (status: WorkflowRunStatus) => {
          set({ status });
          // 运行结束时清除所有运行中的边
          if (status !== WorkflowRunStatus.RUNNING) {
            set({ runningEdges: [] });
          }
        },
        onNodeStatusChange: (nodeId: string, status: NodeExecutionStatus) => {
          set(state => ({
            nodeStatuses: {
              ...state.nodeStatuses,
              [nodeId]: status,
            },
          }));
          
          // 当节点开始执行时，更新运行中的边
          if (status === NodeExecutionStatus.RUNNING) {
            // 找到所有指向该节点的边，标记为运行中
            const incomingEdges = edges.filter(e => e.target === nodeId);
            set(state => ({
              runningEdges: [...new Set([...state.runningEdges, ...incomingEdges.map(e => e.id)])],
            }));
          }
          
          // 当节点完成时，找到从该节点出发的边，标记为运行中
          if (status === NodeExecutionStatus.SUCCESS) {
            const outgoingEdges = edges.filter(e => e.source === nodeId);
            set(state => ({
              runningEdges: [...new Set([...state.runningEdges, ...outgoingEdges.map(e => e.id)])],
            }));
          }
        },
        onLog: (nodeId: string, message: string) => {
          get().addLog(nodeId, message);
        },
      },
    });

    // 更新最终状态
    set({
      runId: result.runId,
      nodeResults: result.nodeResults,
      finalOutput: result.finalOutput || null,
      endTime: result.endTime,
      status: result.status,
      runningEdges: [], // 清除运行中的边
    });

    return result;
  },

  // 停止运行
  stopRun: () => {
    workflowEngine.stop();
    set({
      status: WorkflowRunStatus.STOPPED,
      endTime: Date.now(),
    });
  },

  // 重置运行状态
  resetRun: () => {
    set({
      status: WorkflowRunStatus.IDLE,
      runId: null,
      nodeStatuses: {},
      nodeResults: [],
      logs: [],
      finalOutput: null,
      startTime: null,
      endTime: null,
    });
  },

  // 设置输入变量
  setInputVariables: (variables) => {
    set({ inputVariables: variables });
  },

  // 更新单个输入变量
  updateInputVariable: (key, value) => {
    set(state => ({
      inputVariables: {
        ...state.inputVariables,
        [key]: value,
      },
    }));
  },

  // 打开/关闭运行面板
  togglePanel: () => {
    set(state => ({ isPanelOpen: !state.isPanelOpen }));
  },

  openPanel: () => {
    set({ isPanelOpen: true });
  },

  closePanel: () => {
    set({ isPanelOpen: false });
  },

  // 设置工作流状态
  setWorkflowStatus: (status) => {
    set({ status });
  },

  // 设置节点状态
  setNodeStatus: (nodeId, status) => {
    set(state => ({
      nodeStatuses: {
        ...state.nodeStatuses,
        [nodeId]: status,
      },
    }));
  },

  // 添加日志
  addLog: (nodeId, message) => {
    const logEntry: LogEntry = {
      id: generateLogId(),
      nodeId,
      message,
      timestamp: Date.now(),
      type: message.includes('❌') || message.includes('错误') 
        ? 'error'
        : message.includes('✅') || message.includes('完成')
        ? 'success'
        : message.includes('⚠️')
        ? 'warning'
        : 'info',
    };

    set(state => ({
      logs: [...state.logs, logEntry],
    }));
  },

  // 清空日志
  clearLogs: () => {
    set({ logs: [] });
  },
  
  // 设置运行中的边
  setRunningEdges: (edgeIds) => {
    set({ runningEdges: edgeIds });
  },
  
  // 添加运行中的边
  addRunningEdge: (edgeId) => {
    set(state => ({
      runningEdges: [...new Set([...state.runningEdges, edgeId])],
    }));
  },
  
  // 清除运行中的边
  clearRunningEdges: () => {
    set({ runningEdges: [] });
  },
}));

// ==================== 选择器 ====================

/**
 * 选择运行状态
 */
export const selectRunStatus = (state: WorkflowRunStore) => state.status;

/**
 * 选择是否正在运行
 */
export const selectIsRunning = (state: WorkflowRunStore) => 
  state.status === WorkflowRunStatus.RUNNING;

/**
 * 选择节点状态
 */
export const selectNodeStatus = (nodeId: string) => (state: WorkflowRunStore) => 
  state.nodeStatuses[nodeId] || NodeExecutionStatus.PENDING;

/**
 * 选择所有日志
 */
export const selectLogs = (state: WorkflowRunStore) => state.logs;

/**
 * 选择运行面板是否打开
 */
export const selectIsPanelOpen = (state: WorkflowRunStore) => state.isPanelOpen;

/**
 * 选择运行中的边
 */
export const selectRunningEdges = (state: WorkflowRunStore) => state.runningEdges;

/**
 * 选择验证结果
 */
export const selectValidationResult = (state: WorkflowRunStore) => state.validationResult;

/**
 * 计算运行时长（注意：此选择器不应直接用于渲染，会导致无限循环）
 * 应使用 useState + useEffect 在组件中计算
 */
export const selectRunDuration = (state: WorkflowRunStore) => {
  if (!state.startTime) return 0;
  const endTime = state.endTime || Date.now();
  return endTime - state.startTime;
};
