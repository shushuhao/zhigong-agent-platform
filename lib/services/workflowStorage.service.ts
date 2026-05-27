/**
 * 工作流本地存储服务
 * 
 * 使用 localStorage 实现工作流数据的持久化存储
 * 设计为可替换的 Service 层，未来可以轻松切换为 API 调用
 */

import type { Workflow } from '@/lib/types/workflow';
import type { WorkflowNode, WorkflowEdge } from '@/lib/workflow/types';

// ==================== 类型定义 ====================

/**
 * 存储在 localStorage 中的工作流数据结构
 * 包含画布的节点和边信息
 */
export interface StoredWorkflowData {
  /** 工作流 ID */
  id: string;
  /** 工作流名称 */
  name: string;
  /** 描述信息 */
  description?: string;
  /** 运行方式 */
  runMode: 'once' | 'periodic';
  /** 状态 */
  status: 'offline' | 'online';
  /** 画布节点数据 */
  nodes: WorkflowNode[];
  /** 画布边（连线）数据 */
  edges: WorkflowEdge[];
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

// ==================== 常量定义 ====================

export const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_001',
    name: '设备故障诊断流程',
    description: '根据告警代码、设备传感器数据和知识库命中结果，生成故障排查建议。',
    runMode: 'once',
    status: 'online',
    startPoint: '告警输入',
    endPoint: '诊断建议',
    createdAt: '2025-05-01 09:00:00',
    updatedAt: '2025-05-01 09:30:00',
  },
  {
    id: 'wf_002',
    name: '设备健康评分流程',
    description: '汇总温度、振动、电流等指标，输出设备健康评分和维护优先级。',
    runMode: 'periodic',
    status: 'online',
    startPoint: '传感器指标',
    endPoint: '健康评分',
    createdAt: '2025-04-28 14:00:00',
    updatedAt: '2025-04-28 14:25:00',
  },
  {
    id: 'wf_003',
    name: '预防性维护流程',
    description: '结合点检规范与运行时长，自动生成保养计划和停机检查清单。',
    runMode: 'periodic',
    status: 'offline',
    startPoint: '点检计划',
    endPoint: '维护工单',
    createdAt: '2025-04-26 18:00:00',
    updatedAt: '2025-04-26 18:08:00',
  },
];

/** localStorage 中存储工作流列表的 key */
const WORKFLOW_LIST_KEY = 'workflow_list';

/** localStorage 中存储工作流详情的 key 前缀 */
const WORKFLOW_DATA_PREFIX = 'workflow_data_';

// ==================== 工具函数 ====================

/**
 * 获取当前时间字符串
 */
const getCurrentTime = (): string => {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
};

/**
 * 生成唯一 ID
 */
const generateId = (): string => {
  return `wf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

// ==================== 存储服务类 ====================

/**
 * 工作流本地存储服务
 */
class WorkflowStorageService {
  /**
   * 获取工作流列表
   * 用于列表页展示
   */
  getWorkflowList(): Workflow[] {
    try {
      const data = localStorage.getItem(WORKFLOW_LIST_KEY);
      if (!data) {
        this.saveWorkflowList(INITIAL_WORKFLOWS);
        return INITIAL_WORKFLOWS;
      }

      const workflows = JSON.parse(data) as Workflow[];
      if (workflows.length === 0) {
        this.saveWorkflowList(INITIAL_WORKFLOWS);
        return INITIAL_WORKFLOWS;
      }

      return workflows;
    } catch (error) {
      console.error('读取工作流列表失败:', error);
      return INITIAL_WORKFLOWS;
    }
  }

  /**
   * 保存工作流列表
   * @param list 工作流列表
   */
  private saveWorkflowList(list: Workflow[]): void {
    try {
      localStorage.setItem(WORKFLOW_LIST_KEY, JSON.stringify(list));
    } catch (error) {
      console.error('保存工作流列表失败:', error);
      throw new Error('保存失败：存储空间可能已满');
    }
  }

  /**
   * 创建新工作流
   * 返回新创建的工作流 ID
   */
  createWorkflow(): { workflowId: string } {
    const id = generateId();
    const now = getCurrentTime();
    
    // 创建基础工作流信息
    const newWorkflow: Workflow = {
      id,
      name: '未命名工作流',
      description: '',
      runMode: 'once',
      status: 'offline',
      startPoint: '',
      endPoint: '',
      createdAt: now,
      updatedAt: now,
    };

    // 添加到列表
    const list = this.getWorkflowList();
    list.unshift(newWorkflow); // 新建的排在最前面
    this.saveWorkflowList(list);

    // 创建空的详情数据
    const workflowData: StoredWorkflowData = {
      id,
      name: '未命名工作流',
      description: '',
      runMode: 'once',
      status: 'offline',
      nodes: [],
      edges: [],
      createdAt: now,
      updatedAt: now,
    };
    this.saveWorkflowData(workflowData);

    return { workflowId: id };
  }

  /**
   * 获取工作流详情（包含画布数据）
   * @param id 工作流 ID
   */
  getWorkflowData(id: string): StoredWorkflowData | null {
    try {
      const data = localStorage.getItem(`${WORKFLOW_DATA_PREFIX}${id}`);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as StoredWorkflowData;
    } catch (error) {
      console.error('读取工作流详情失败:', error);
      return null;
    }
  }

  /**
   * 保存工作流详情（包含画布数据）
   * @param data 工作流数据
   */
  saveWorkflowData(data: StoredWorkflowData): void {
    try {
      // 更新时间
      const updatedData = {
        ...data,
        updatedAt: getCurrentTime(),
      };

      // 保存详情数据
      localStorage.setItem(
        `${WORKFLOW_DATA_PREFIX}${data.id}`,
        JSON.stringify(updatedData)
      );

      // 同步更新列表中的基础信息
      const list = this.getWorkflowList();
      const index = list.findIndex(item => item.id === data.id);
      
      if (index !== -1) {
        list[index] = {
          ...list[index],
          name: updatedData.name,
          description: updatedData.description,
          status: updatedData.status,
          runMode: updatedData.runMode,
          updatedAt: updatedData.updatedAt,
        };
        this.saveWorkflowList(list);
      }
    } catch (error) {
      console.error('保存工作流详情失败:', error);
      throw new Error('保存失败：存储空间可能已满');
    }
  }

  /**
   * 获取工作流基础信息（用于编辑器初始化）
   * @param id 工作流 ID
   */
  getWorkflowById(id: string): Workflow | null {
    const list = this.getWorkflowList();
    return list.find(item => item.id === id) || null;
  }

  /**
   * 更新工作流基础信息
   * @param id 工作流 ID
   * @param updates 更新的字段
   */
  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
    const list = this.getWorkflowList();
    const index = list.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }

    // 更新列表中的数据
    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: getCurrentTime(),
    };
    this.saveWorkflowList(list);

    // 同步更新详情数据（如果存在）
    const detailData = this.getWorkflowData(id);
    if (detailData) {
      this.saveWorkflowData({
        ...detailData,
        name: list[index].name,
        description: list[index].description,
        status: list[index].status,
        runMode: list[index].runMode,
      });
    }

    return list[index];
  }

  /**
   * 删除工作流
   * @param id 工作流 ID
   */
  deleteWorkflow(id: string): boolean {
    try {
      // 从列表中删除
      const list = this.getWorkflowList();
      const filteredList = list.filter(item => item.id !== id);
      this.saveWorkflowList(filteredList);

      // 删除详情数据
      localStorage.removeItem(`${WORKFLOW_DATA_PREFIX}${id}`);

      return true;
    } catch (error) {
      console.error('删除工作流失败:', error);
      return false;
    }
  }

  /**
   * 清空所有工作流数据（用于调试）
   */
  clearAll(): void {
    // 获取所有工作流 ID
    const list = this.getWorkflowList();
    
    // 删除所有详情数据
    list.forEach(item => {
      localStorage.removeItem(`${WORKFLOW_DATA_PREFIX}${item.id}`);
    });

    // 清空列表
    localStorage.removeItem(WORKFLOW_LIST_KEY);
  }
}

// 导出单例实例
export const workflowStorageService = new WorkflowStorageService();
