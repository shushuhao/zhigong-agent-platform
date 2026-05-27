/**
 * 工作流相关类型定义
 */

// 运行方式
export type WorkflowRunMode = 'once' | 'periodic';

// 工作流状态
export type WorkflowStatus = 'offline' | 'online';

// 工作流基础信息
export interface Workflow {
  id: string;
  name: string;
  runMode: WorkflowRunMode;
  status: WorkflowStatus;
  startPoint: string;
  endPoint: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 创建工作流请求
export interface CreateWorkflowRequest {
  name: string;
  runMode: WorkflowRunMode;
  startPoint: string;
  endPoint: string;
  description?: string;
}

// 更新工作流请求
export interface UpdateWorkflowRequest {
  name?: string;
  runMode?: WorkflowRunMode;
  status?: WorkflowStatus;
  startPoint?: string;
  endPoint?: string;
  description?: string;
}

// 工作流查询参数
export interface GetWorkflowsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: WorkflowStatus;
  runMode?: WorkflowRunMode;
}

// 运行方式映射
export const runModeMap: Record<WorkflowRunMode, string> = {
  once: '单次运行',
  periodic: '周期运行',
};

// 状态映射
export const statusMap: Record<WorkflowStatus, string> = {
  offline: '未上线',
  online: '已上线',
};

