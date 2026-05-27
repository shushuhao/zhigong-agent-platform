import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import type { Workflow } from '@/lib/types/workflow';
import type { WorkflowNode, WorkflowEdge, WorkflowNodeData } from '@/lib/workflow/types';
import { NodeType } from '@/lib/workflow/types';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';
import { workflowService } from '@/lib/services/workflow.service';

/**
 * 工作流编辑器状态接口
 * 管理工作流的基本信息、画布节点和编辑状态
 */
interface WorkflowState {
  // ==================== 基础数据 ====================
  /** 当前工作流数据 */
  workflow: Workflow | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否有未保存的修改 */
  isDirty: boolean;

  // ==================== 画布数据 ====================
  /** 画布中的节点列表 */
  nodes: WorkflowNode[];
  /** 画布中的边（连线）列表 */
  edges: WorkflowEdge[];
  /** 当前选中的节点 ID */
  selectedNodeId: string | null;

  // ==================== 节点放置模式 ====================
  /** 当前正在放置的节点类型（null 表示不在放置模式） */
  placingNodeType: NodeType | null;

  // ==================== 画布设置 ====================
  /** 是否开启防撞功能 */
  enableCollision: boolean;
  /** 切换防撞功能开关 */
  toggleCollision: () => void;

  // ==================== 基础 Actions ====================
  /** 设置工作流数据 */
  setWorkflow: (workflow: Workflow | null) => void;
  /** 更新工作流部分字段 */
  updateWorkflow: (updates: Partial<Workflow>) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置是否有修改 */
  setDirty: (dirty: boolean) => void;
  /** 重置状态 */
  reset: () => void;

  // ==================== 画布 Actions ====================
  /** 设置节点列表 */
  setNodes: (nodes: WorkflowNode[]) => void;
  /** 设置边列表 */
  setEdges: (edges: WorkflowEdge[]) => void;
  /** 处理节点变化（移动、选中、删除等） */
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  /** 处理边变化（选中、删除等） */
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  /** 处理连接事件（创建新边） */
  onConnect: (connection: Connection) => void;
  /** 添加新节点 */
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  /** 更新节点数据 */
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  /** 删除节点 */
  deleteNode: (nodeId: string) => void;
  /** 设置选中的节点 */
  setSelectedNodeId: (nodeId: string | null) => void;

  // ==================== 节点放置 Actions ====================
  /** 开始放置节点（进入放置模式） */
  startPlacingNode: (type: NodeType) => void;
  /** 取消放置节点（退出放置模式） */
  cancelPlacingNode: () => void;
  /** 添加带自定义数据的节点（用于 MCP 等需要预设数据的节点） */
  addNodeWithData: (type: NodeType, position: { x: number; y: number }, customData: Partial<WorkflowNodeData>) => void;
  /** 设置待放置的 MCP 节点数据 */
  pendingMCPData: Partial<WorkflowNodeData> | null;
  /** 设置待放置的 MCP 节点数据 */
  setPendingMCPData: (data: Partial<WorkflowNodeData> | null) => void;

  // ==================== 持久化 Actions ====================
  /** 保存工作流到本地存储 */
  saveWorkflow: () => Promise<boolean>;
  /** 从本地存储加载工作流画布数据 */
  loadWorkflowData: (workflowId: string) => Promise<boolean>;
}

/**
 * 初始状态
 */
const initialState = {
  workflow: null,
  isLoading: true,
  isDirty: false,
  nodes: [] as WorkflowNode[],
  edges: [] as WorkflowEdge[],
  selectedNodeId: null,
  placingNodeType: null as NodeType | null,
  pendingMCPData: null as Partial<WorkflowNodeData> | null,
  enableCollision: true,
};

/**
 * 生成唯一的节点 ID
 */
const generateNodeId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * 工作流编辑器 Store
 * 使用 zustand 管理工作流编辑器的全局状态
 * 使用 zundo 的 temporal 中间件实现撤销/重做功能
 */
export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set) => ({
      // 初始状态
      ...initialState,

      // ==================== 画布设置 Actions ====================
      toggleCollision: () => set((state) => ({ enableCollision: !state.enableCollision })),

      // ==================== 基础 Actions ====================

      // 设置工作流数据
      setWorkflow: (workflow) => set({ workflow, isLoading: false }),

      // 更新工作流部分字段
      updateWorkflow: (updates) =>
        set((state) => ({
          workflow: state.workflow
            ? { ...state.workflow, ...updates }
            : null,
          isDirty: true,
        })),

      // 设置加载状态
      setLoading: (isLoading) => set({ isLoading }),

      // 设置是否有修改
      setDirty: (isDirty) => set({ isDirty }),

      // 重置状态
      reset: () => set(initialState),

      // ==================== 画布 Actions ====================

      // 设置节点列表
      setNodes: (nodes) => set({ nodes }),

      // 设置边列表
      setEdges: (edges) => set({ edges }),

      // 处理节点变化（由 ReactFlow 触发）
      onNodesChange: (changes) => {
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
          isDirty: true,
        }));
      },

      // 处理边变化（由 ReactFlow 触发）
      onEdgesChange: (changes) => {
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
          isDirty: true,
        }));
      },

      // 处理连接事件（创建新边）
      onConnect: (connection) => {
        set((state) => ({
          edges: addEdge(
            {
              ...connection,
              // 设置边的样式
              type: 'smoothstep',
              animated: false,
            },
            state.edges
          ),
          isDirty: true,
        }));
      },

      // 添加新节点
      addNode: (type, position) => {
        const defaultData = nodeRegistry.getDefaultData(type);
        if (!defaultData) {
          console.error(`节点类型 "${type}" 未注册`);
          return;
        }

        const newNode: WorkflowNode = {
          id: generateNodeId(),
          type,
          position,
          data: { ...defaultData },
        };

        set((state) => ({
          nodes: [...state.nodes, newNode],
          isDirty: true,
        }));
      },

      // 更新节点数据
      updateNodeData: (nodeId, data) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } as WorkflowNodeData }
              : node
          ),
          isDirty: true,
        }));
      },

      // 删除节点
      deleteNode: (nodeId) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          // 同时删除与该节点相关的边
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          isDirty: true,
        }));
      },

      // 设置选中的节点
      setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

      // ==================== 节点放置 Actions ====================

      // 开始放置节点
      startPlacingNode: (type) => set({ placingNodeType: type }),

      // 取消放置节点
      cancelPlacingNode: () => set({ placingNodeType: null, pendingMCPData: null }),

      // 设置待放置的 MCP 节点数据
      setPendingMCPData: (data) => set({ pendingMCPData: data }),

      // 添加带自定义数据的节点
      addNodeWithData: (type, position, customData) => {
        const defaultData = nodeRegistry.getDefaultData(type);
        if (!defaultData) {
          console.error(`节点类型 "${type}" 未注册`);
          return;
        }

        const newNode: WorkflowNode = {
          id: generateNodeId(),
          type,
          position,
          data: { ...defaultData, ...customData } as WorkflowNodeData,
        };

        set((state) => ({
          nodes: [...state.nodes, newNode],
          isDirty: true,
          pendingMCPData: null,
        }));
      },

      // ==================== 持久化 Actions ====================

      // 保存工作流到本地存储
      saveWorkflow: async () => {
        const state = useWorkflowStore.getState();
        const { workflow, nodes, edges } = state;
        
        if (!workflow?.id) {
          console.error('无法保存：工作流 ID 不存在');
          return false;
        }

        try {
          await workflowService.saveWorkflow(
            workflow.id,
            workflow.name,
            nodes,
            edges
          );
          
          // 保存成功后，清除 isDirty 标记
          set({ isDirty: false });
          return true;
        } catch (error) {
          console.error('保存工作流失败:', error);
          return false;
        }
      },

      // 从本地存储加载工作流画布数据
      loadWorkflowData: async (workflowId: string) => {
        try {
          const data = await workflowService.getWorkflowData(workflowId);
          
          if (data && data.nodes && data.nodes.length > 0) {
            set({
              nodes: data.nodes,
              edges: data.edges || [],
            });
            return true;
          }
          
          // 如果没有保存的数据，保持默认的空画布（由 EditorCanvas 初始化）
          return false;
        } catch (error) {
          console.error('加载工作流数据失败:', error);
          return false;
        }
      },
    }),
    {
      // 只追踪 nodes 和 edges 的变化（不追踪 UI 状态如 selectedNodeId）
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        enableCollision: state.enableCollision,
      }),
      // 限制历史记录数量，防止内存占用过大
      limit: 50,
    }
  )
);

