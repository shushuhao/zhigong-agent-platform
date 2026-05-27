/**
 * 文本标注系统 - 完整的 TypeScript 类型定义
 * 
 * 这个文件包含了所有标注相关的类型定义，包括：
 * - 标签类型（实体标签、关系标签）
 * - 标注数据类型（实体、关系）
 * - 任务类型（任务数据、标注结果）
 * - API 请求/响应类型
 */

/**
 * ============================================================================
 * 第一部分：标签类型定义
 * ============================================================================
 */

/**
 * 实体标签 - 用于标注文本中的实体
 * 
 * 示例：
 * {
 *   id: 'weapon',
 *   name: '武器名称',
 *   color: '#FF0000',
 *   order: 1
 * }
 */
export interface EntityLabel {
  id: string;           // 标签唯一标识
  name: string;         // 标签显示名称
  color: string;        // 标签颜色（十六进制）
  order: number;        // 显示顺序
}

/**
 * 关系标签 - 用于标注实体之间的关系
 *
 * 示例：
 * {
 *   id: 'weapon_parts',
 *   name: '武器上的零部件',
 *   color: '#FF6B35',
 *   startEntityLabels: ['weapon'],
 *   targetEntityLabels: ['parts_name'],
 *   order: 1
 * }
 */
export interface RelationLabel {
  id: string;                      // 标签唯一标识
  name: string;                    // 标签显示名称
  color: string;                   // 标签颜色（十六进制）
  startEntityLabels: string[];     // 起始实体标签 ID 列表
  targetEntityLabels: string[];    // 目标实体标签 ID 列表
  order: number;                   // 显示顺序
}

/**
 * 标签配置数据 - 包含所有可用的标签
 */
export interface LabelsData {
  entityLabels: EntityLabel[];      // 实体标签列表
  relationLabels: RelationLabel[];  // 关系标签列表
}

/**
 * ============================================================================
 * 第二部分：标注数据类型定义
 * ============================================================================
 */

/**
 * 实体标注 - 文本中被标注的实体
 * 
 * 示例：
 * {
 *   id: 'entity_1',
 *   start: 5,
 *   end: 7,
 *   text: '步枪',
 *   labelId: 'weapon',
 *   labelName: '武器名称',
 *   color: '#FF0000',
 *   visible: true,
 *   highlighted: false,
 *   selected: false,
 *   canConnect: true
 * }
 */
export interface EntityAnnotation {
  id: string;           // 实体唯一标识
  start: number;        // 在文本中的起始位置
  end: number;          // 在文本中的结束位置
  text: string;         // 实体文本内容
  labelId: string;      // 所属标签 ID
  labelName: string;    // 所属标签名称
  color: string;        // 标签颜色
  visible: boolean;     // 是否可见
  highlighted: boolean; // 是否高亮
  selected: boolean;    // 是否选中
  canConnect: boolean;  // 是否可以连线
}

/**
 * 关系连接 - 实体之间的关系
 * 
 * 示例：
 * {
 *   id: 'relation_1',
 *   fromEntityId: 'entity_1',
 *   toEntityId: 'entity_2',
 *   relationId: 'weapon_parts',
 *   relationName: '武器上的零部件',
 *   color: '#FF6B35',
 *   visible: true,
 *   canDelete: true
 * }
 */
export interface RelationConnection {
  id: string;           // 关系唯一标识
  fromEntityId: string; // 起始实体 ID
  toEntityId: string;   // 目标实体 ID
  relationId: string;   // 关系标签 ID
  relationName: string; // 关系标签名称
  color: string;        // 关系颜色
  visible: boolean;     // 是否可见
  canDelete: boolean;   // 是否可以删除
}

/**
 * ============================================================================
 * 第三部分：任务类型定义
 * ============================================================================
 */

/**
 * 任务数据 - 需要标注的任务信息
 * 
 * 示例：
 * {
 *   id: 'task_001',
 *   name: '武器故障标注任务',
 *   content: '某型号步枪在使用过程中出现了击发机构故障...',
 *   createdAt: '2024-01-15T10:00:00Z',
 *   updatedAt: '2024-01-15T14:30:00Z'
 * }
 */
export interface TaskData {
  id: string;       // 任务唯一标识
  name: string;     // 任务名称
  content: string;  // 需要标注的文本内容
  createdAt: string;  // 创建时间（ISO 8601 格式）
  updatedAt: string;  // 更新时间（ISO 8601 格式）
}

/**
 * 标注结果 - 任务的标注结果
 * 
 * 示例：
 * {
 *   taskId: 'task_001',
 *   result: {
 *     entities: [...],
 *     relations: [...]
 *   },
 *   lastSaved: '2024-01-15T14:30:00Z'
 * }
 */
export interface TaskResult {
  taskId: string;  // 任务 ID
  result: {
    entities: EntityAnnotation[];      // 标注的实体列表
    relations: RelationConnection[];   // 标注的关系列表
  };
  lastSaved: string;  // 最后保存时间（ISO 8601 格式）
}

/**
 * ============================================================================
 * 第四部分：API 请求/响应类型定义
 * ============================================================================
 */

/**
 * 通用 API 响应格式
 * 
 * 示例：
 * {
 *   code: 0,
 *   message: 'success',
 *   data: { ... }
 * }
 */
export interface ApiResponse<T = any> {
  code: number;      // 状态码：0 表示成功，非 0 表示失败
  message?: string;  // 响应消息
  data?: T;          // 响应数据
}


/**
 * 保存任务的请求参数
 * 
 * 示例：
 * {
 *   taskId: 'task_001',
 *   result: {
 *     entities: [...],
 *     relations: [...]
 *   }
 * }
 */
export interface SaveTaskRequest {
  taskId: string;  // 任务 ID
  result: {
    entities: EntityAnnotation[];      // 标注的实体列表
    relations: RelationConnection[];   // 标注的关系列表
  };
}

/**
 * 保存任务的响应数据
 * 
 * 示例：
 * {
 *   taskId: 'task_001',
 *   savedAt: '2024-01-15T14:30:00Z',
 *   entityCount: 8,
 *   relationCount: 7
 * }
 */
export interface SaveTaskResponseData {
  taskId: string;      // 任务 ID
  savedAt: string;     // 保存时间
  entityCount: number; // 实体数量
  relationCount: number; // 关系数量
}

/**
 * 保存任务的 API 响应
 */
export interface SaveTaskResponse extends ApiResponse<SaveTaskResponseData> {}

/**
 * ============================================================================
 * 第五部分：服务层类型定义
 * ============================================================================
 */

/**
 * 标注服务的所有方法返回类型
 */
export interface LabelEditorServiceMethods {
  // 获取标签
  getLabels(taskId: string): Promise<ApiResponse<LabelsData>>;

  // 获取任务
  getTask(taskId: string): Promise<ApiResponse<TaskData>>;

  // 获取标注结果
  getTaskResult(taskId: string): Promise<ApiResponse<TaskResult>>;

  // 保存标注结果
  saveTask(params: SaveTaskRequest): Promise<ApiResponse<SaveTaskResponseData>>;
}

