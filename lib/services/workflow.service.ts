/**
 * 工作流服务层
 * 负责所有工作流相关的 API 调用
 * 
 * 更新说明：
 * - 原先使用内存 Mock 数据
 * - 现在使用 localStorage 持久化存储
 */

import type {
  Workflow,
  UpdateWorkflowRequest,
  GetWorkflowsParams,
} from '@/lib/types/workflow';
import { workflowStorageService, INITIAL_WORKFLOWS, type StoredWorkflowData } from './workflowStorage.service';
import type { WorkflowNode, WorkflowEdge } from '@/lib/workflow/types';

/**
 * 工作流服务类
 */
export class WorkflowService {
  /**
   * 创建工作流（获取新的 workflowId）
   * 本地存储操作，无需延迟
   */
  async createWorkflow(): Promise<{ workflowId: string }> {
    return workflowStorageService.createWorkflow();
  }

  /**
   * 获取工作流详情
   */
  async getWorkflowById(id: string): Promise<Workflow | null> {
    return workflowStorageService.getWorkflowById(id);
  }

  /**
   * 获取工作流列表
   */
  async getWorkflows(params?: GetWorkflowsParams): Promise<Workflow[]> {
    const workflows = workflowStorageService.getWorkflowList();
    return workflows.length > 0 ? workflows : INITIAL_WORKFLOWS;
  }

  /**
   * 更新工作流基础信息
   */
  async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow | null> {
    return workflowStorageService.updateWorkflow(id, data);
  }

  /**
   * 删除工作流
   */
  async deleteWorkflow(id: string): Promise<boolean> {
    return workflowStorageService.deleteWorkflow(id);
  }

  /**
   * 获取工作流画布数据（节点和边）
   */
  async getWorkflowData(id: string): Promise<StoredWorkflowData | null> {
    return workflowStorageService.getWorkflowData(id);
  }

  /**
   * 保存工作流画布数据
   */
  async saveWorkflowData(data: StoredWorkflowData): Promise<void> {
    workflowStorageService.saveWorkflowData(data);
  }

  /**
   * 保存工作流（完整保存，包含节点和边）
   * @param workflowId 工作流 ID
   * @param name 工作流名称
   * @param nodes 画布节点
   * @param edges 画布边
   */
  async saveWorkflow(
    workflowId: string,
    name: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): Promise<void> {
    // 获取现有数据
    const existingData = workflowStorageService.getWorkflowData(workflowId);
    
    // 合并并保存
    const dataToSave: StoredWorkflowData = {
      id: workflowId,
      name,
      description: existingData?.description || '',
      runMode: existingData?.runMode || 'once',
      status: existingData?.status || 'offline',
      nodes,
      edges,
      createdAt: existingData?.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    
    workflowStorageService.saveWorkflowData(dataToSave);
  }
}

// 导出单例实例
export const workflowService = new WorkflowService();

