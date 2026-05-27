/**
 * 工作流运行引擎类型定义
 * 
 * 定义了工作流运行过程中涉及的所有类型
 */

import type { WorkflowNode, NodeType } from '../types';

// ==================== 运行状态枚举 ====================

/**
 * 节点执行状态
 */
export enum NodeExecutionStatus {
  /** 等待执行 */
  PENDING = 'pending',
  /** 正在执行 */
  RUNNING = 'running',
  /** 执行成功 */
  SUCCESS = 'success',
  /** 执行失败 */
  FAILED = 'failed',
  /** 已跳过（分支未命中） */
  SKIPPED = 'skipped',
}

/**
 * 工作流运行状态
 */
export enum WorkflowRunStatus {
  /** 空闲（未运行） */
  IDLE = 'idle',
  /** 运行中 */
  RUNNING = 'running',
  /** 运行成功 */
  SUCCESS = 'success',
  /** 运行失败 */
  FAILED = 'failed',
  /** 已停止 */
  STOPPED = 'stopped',
}

// ==================== 执行结果类型 ====================

/**
 * 节点执行结果
 */
export interface NodeExecutionResult {
  /** 节点 ID */
  nodeId: string;
  /** 节点类型 */
  nodeType: NodeType;
  /** 节点名称 */
  nodeName: string;
  /** 执行状态 */
  status: NodeExecutionStatus;
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime?: number;
  /** 执行耗时（毫秒） */
  duration?: number;
  /** 输入数据 */
  inputs?: Record<string, unknown>;
  /** 输出数据 */
  outputs?: Record<string, unknown>;
  /** 错误信息（失败时） */
  error?: string;
  /** 日志信息 */
  logs?: string[];
}

/**
 * 工作流运行结果
 */
export interface WorkflowRunResult {
  /** 运行 ID */
  runId: string;
  /** 运行状态 */
  status: WorkflowRunStatus;
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime?: number;
  /** 各节点执行结果（数组形式，按执行顺序排列） */
  nodeResults: NodeExecutionResult[];
  /** 最终输出 */
  finalOutput?: Record<string, unknown>;
  /** 错误信息 */
  error?: string;
}

// ==================== 运行上下文 ====================

/**
 * 运行时变量
 * 存储节点产生的输出变量，供后续节点使用
 */
export interface RuntimeVariables {
  /** 变量存储，key 格式为 "节点名.变量名" */
  [key: string]: unknown;
}

/**
 * 工作流运行回调函数
 */
export interface WorkflowRunCallbacks {
  /** 工作流状态变化回调 */
  onWorkflowStatusChange?: (status: WorkflowRunStatus) => void;
  /** 节点状态变化回调 */
  onNodeStatusChange?: (nodeId: string, status: NodeExecutionStatus) => void;
  /** 日志回调 */
  onLog?: (nodeId: string, message: string) => void;
}

/**
 * 工作流运行上下文
 * 在整个工作流执行过程中传递
 */
export interface WorkflowRunContext {
  /** 运行 ID */
  runId: string;
  /** 运行时变量 */
  variables: Record<string, unknown>;
  /** 节点状态变化回调 */
  onNodeStatusChange?: (nodeId: string, status: NodeExecutionStatus) => void;
  /** 日志回调 */
  onLog?: (nodeId: string, message: string) => void;
}

// ==================== 节点执行器接口 ====================

/**
 * 节点执行器接口
 * 每种节点类型需要实现这个接口
 */
export interface NodeExecutor {
  /**
   * 执行节点
   * @param node 要执行的节点
   * @param context 运行上下文
   * @returns 执行结果
   */
  execute(node: WorkflowNode, context: WorkflowRunContext): Promise<NodeExecutionResult>;
}

// ==================== 输入参数 ====================

/**
 * 工作流运行输入参数
 */
export interface WorkflowRunInput {
  /** 输入变量（开始节点的输入） */
  variables: Record<string, unknown>;
  /** 回调函数 */
  callbacks?: WorkflowRunCallbacks;
}
