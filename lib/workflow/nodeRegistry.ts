/**
 * 节点注册中心
 * 
 * 采用注册表模式（Registry Pattern）管理所有节点类型
 * 
 * 核心功能：
 * 1. 注册节点配置
 * 2. 获取节点配置
 * 3. 获取 ReactFlow 需要的 nodeTypes 映射
 * 4. 按分类获取节点列表（用于节点面板）
 */

import { NodeType, NodeConfig, NodeCategory, WorkflowNodeData } from './types';

/**
 * 节点注册表类
 * 
 * 使用 Map 存储节点配置，key 是 NodeType，value 是 NodeConfig
 */
class NodeRegistry {
  /** 存储所有已注册的节点配置 */
  private registry: Map<NodeType, NodeConfig> = new Map();

  /**
   * 注册一个节点类型
   * 
   * @param config 节点配置
   * @throws 如果节点类型已注册，会在控制台警告
   * 
   * @example
   * nodeRegistry.register({
   *   type: NodeType.START,
   *   label: '开始',
   *   ...
   * });
   */
  register<T extends WorkflowNodeData>(config: NodeConfig<T>): void {
    if (this.registry.has(config.type)) {
      console.warn(`节点类型 "${config.type}" 已注册，将被覆盖`);
    }
    // 使用类型断言，因为 Map 的 value 类型是 NodeConfig（泛型的基类型）
    this.registry.set(config.type, config as unknown as NodeConfig);
  }

  /**
   * 获取指定类型的节点配置
   * 
   * @param type 节点类型
   * @returns 节点配置，如果未注册返回 undefined
   */
  get(type: NodeType): NodeConfig | undefined {
    return this.registry.get(type);
  }

  /**
   * 获取所有已注册的节点配置
   * 
   * @returns 所有节点配置的数组
   */
  getAll(): NodeConfig[] {
    return Array.from(this.registry.values());
  }

  /**
   * 按分类获取节点配置
   * 用于在左侧节点面板中分组显示
   * 
   * @param category 节点分类
   * @returns 该分类下的所有节点配置
   */
  getByCategory(category: NodeCategory): NodeConfig[] {
    return this.getAll().filter(config => config.category === category);
  }

  /**
   * 获取 ReactFlow 需要的 nodeTypes 映射
   *
   * ReactFlow 需要一个 { [key: string]: React.ComponentType } 格式的对象
   * 用于将节点类型映射到对应的组件
   *
   * @returns nodeTypes 对象
   */
  getNodeTypes(): Record<string, React.ComponentType<unknown>> {
    const nodeTypes: Record<string, React.ComponentType<unknown>> = {};

    this.registry.forEach((config, type) => {
      // 使用类型断言，因为 ReactFlow 的类型定义比较宽松
      nodeTypes[type] = config.component as React.ComponentType<unknown>;
    });

    return nodeTypes;
  }

  /**
   * 获取指定类型的默认数据
   * 用于创建新节点时生成初始数据
   * 
   * @param type 节点类型
   * @returns 默认数据，如果节点类型未注册返回 undefined
   */
  getDefaultData(type: NodeType): WorkflowNodeData | undefined {
    const config = this.get(type);
    return config?.defaultData;
  }

  /**
   * 检查节点类型是否已注册
   * 
   * @param type 节点类型
   * @returns 是否已注册
   */
  has(type: NodeType): boolean {
    return this.registry.has(type);
  }

  /**
   * 获取已注册的节点类型数量
   */
  get size(): number {
    return this.registry.size;
  }
}

/**
 * 导出单例实例
 * 整个应用使用同一个注册表实例
 */
export const nodeRegistry = new NodeRegistry();

