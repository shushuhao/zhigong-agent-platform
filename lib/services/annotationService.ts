/**
 * 标注服务 - 统一管理所有标注相关的 API 调用
 *
 * 这个服务层集中管理了所有标注相关的 API 调用，包括：
 * 1. getLabels - 获取标签配置
 * 2. getTask - 获取标注任务
 * 3. getTaskResult - 获取标注结果
 * 4. saveTask - 保存标注结果
 *
 * 优势：
 * - 集中管理 API 端点
 * - 避免重复写 URL
 * - 易于维护和修改
 * - 提供类型安全的接口
 */

import { http, ApiResponse } from '@/lib/services/http';
import {
  LabelsData,
  TaskData,
  TaskResult,
  SaveTaskRequest,
  SaveTaskResponseData,
  EntityLabel,
  RelationLabel,
  EntityAnnotation,
  RelationConnection,
} from '@/lib/types/labeleditor';



/**
 * 标注服务类
 */
class AnnotationService {
  /**
   * API 端点常量 - 集中管理所有 API 地址
   *
   * 优势：
   * - 如果需要修改 API 地址，只需改这一个地方
   * - 所有使用该服务的组件都会自动使用新地址
   * - 易于维护和管理
   */
  private static readonly ENDPOINTS = {
    GET_LABELS: '/labeleditor/getLabels',
    GET_TASK: '/labeleditor/getTask',
    GET_TASK_RESULT: '/labeleditor/getTaskResult',
    SAVE_TASK: '/labeleditor/saveTask',
  };

  /**
   * ========================================================================
   * 新的标注系统接口方法
   * ========================================================================
   */

  /**
   * 获取标签配置
   *
   * 用途：获取该任务可用的所有标签（实体标签和关系标签）
   *
   * @param taskId - 任务 ID
   * @param annotationType - 标注类型（可选）
   * @returns 包含实体标签和关系标签的标签配置
   *
   * 示例：
   * const result = await annotationService.getLabels('task_001', 'entity-relation');
   * if (result.code === 0) {
   *   console.log('实体标签:', result.data.entityLabels);
   *   console.log('关系标签:', result.data.relationLabels);
   * }
   */
  async getLabels(taskId: string, annotationType?: string): Promise<ApiResponse<any>> {
    const url = annotationType
      ? `${AnnotationService.ENDPOINTS.GET_LABELS}/${taskId}?type=${annotationType}`
      : `${AnnotationService.ENDPOINTS.GET_LABELS}/${taskId}`;
    return http.get(url);
  }

  /**
   * 获取标注任务
   *
   * 用途：获取需要标注的任务信息，包括任务 ID、名称和文本内容
   *
   * @param taskId - 任务 ID
   * @returns 任务数据（包含需要标注的文本内容）
   *
   * 示例：
   * const result = await annotationService.getTask('task_001');
   * if (result.code === 0) {
   *   console.log('任务名称:', result.data.name);
   *   console.log('文本内容:', result.data.content);
   * }
   */
  async getTask(taskId: string): Promise<ApiResponse<TaskData>> {
    return http.get(
      `${AnnotationService.ENDPOINTS.GET_TASK}/${taskId}`
    );
  }

  /**
   * 获取标注结果
   *
   * 用途：获取该任务已保存的标注结果，用于页面刷新时回显数据
   *
   * @param taskId - 任务 ID
   * @returns 标注结果（包含实体和关系）
   *
   * 示例：
   * const result = await annotationService.getTaskResult('task_001');
   * if (result.code === 0) {
   *   console.log('实体数量:', result.data.result.entities.length);
   *   console.log('关系数量:', result.data.result.relations.length);
   * }
   */
  async getTaskResult(taskId: string): Promise<ApiResponse<TaskResult>> {
    return http.get(
      `${AnnotationService.ENDPOINTS.GET_TASK_RESULT}/${taskId}`
    );
  }

  /**
   * 保存标注结果
   *
   * 用途：保存用户标注的实体和关系
   *
   * @param params - 保存参数，包含任务 ID 和标注结果
   * @returns 保存结果（包含保存时间和数据统计）
   *
   * 示例：
   * const result = await annotationService.saveTask({
   *   taskId: 'task_001',
   *   result: {
   *     entities: [...],
   *     relations: [...]
   *   }
   * });
   * if (result.code === 0) {
   *   console.log('保存成功，实体数:', result.data.entityCount);
   *   console.log('保存成功，关系数:', result.data.relationCount);
   * }
   */
  async saveTask(params: SaveTaskRequest): Promise<ApiResponse<SaveTaskResponseData>> {
    return http.post(
      AnnotationService.ENDPOINTS.SAVE_TASK,
      params
    );
  }
}

/**
 * 创建全局标注服务实例
 */
export const annotationService = new AnnotationService();

export default annotationService;

