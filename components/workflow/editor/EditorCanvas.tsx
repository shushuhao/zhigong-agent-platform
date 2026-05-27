'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Panel,
  BackgroundVariant,
  useReactFlow,
  type NodeTypes,
  type NodeMouseHandler,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '@/stores/workflowStore';
import { useWorkflowRunStore, selectRunningEdges } from '@/stores/workflowRunStore';
import { initializeNodeRegistry, NodeType } from '@/lib/workflow';
import { validateWorkflow } from '@/lib/workflow/validation';
import { getValidPosition } from '@/lib/workflow/collisionAlgorithm'; // Updated Import
import type { WorkflowNode } from '@/lib/workflow';
import { StartNode } from '@/components/workflow/nodes/StartNode';
import { EndNode } from '@/components/workflow/nodes/EndNode';
import { CodeNode } from '@/components/workflow/nodes/CodeNode';
import { LLMNode } from '@/components/workflow/nodes/LLMNode';
import { APINode } from '@/components/workflow/nodes/APINode';
import { BranchNode } from '@/components/workflow/nodes/BranchNode';
import { KnowledgeNode } from '@/components/workflow/nodes/KnowledgeNode';
import { MCPNode } from '@/components/workflow/nodes/MCPNode';
import { PropertyPanel, RunPanel } from '@/components/workflow/panels';
import { CanvasToolbar, PlacingNodePreview } from '@/components/workflow/toolbar';

// 确保节点已注册
initializeNodeRegistry();

// 节点类型映射（放在组件外部，避免重复创建）
const nodeTypes: NodeTypes = {
  [NodeType.START]: StartNode,
  [NodeType.END]: EndNode,
  [NodeType.CODE]: CodeNode,
  [NodeType.LLM]: LLMNode,
  [NodeType.API]: APINode,
  [NodeType.BRANCH]: BranchNode,
  [NodeType.KNOWLEDGE]: KnowledgeNode,
  [NodeType.MCP]: MCPNode,
};

/**
 * 画布内部组件
 * 需要在 ReactFlowProvider 内部才能使用 useReactFlow
 */
const CanvasContent: React.FC = () => {
  const {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    placingNodeType,
    addNode,
    addNodeWithData,
    pendingMCPData,
    cancelPlacingNode,
    enableCollision, // [新增]
  } = useWorkflowStore();

  // 获取运行中的边
  const runningEdges = useWorkflowRunStore(selectRunningEdges);

  // 获取 ReactFlow 实例，用于坐标转换
  const reactFlowInstance = useReactFlow();
  
  // 为运行中的边添加动画样式
  const styledEdges = useMemo(() => {
    return edges.map(edge => {
      const isRunning = runningEdges.includes(edge.id);
      return {
        ...edge,
        className: isRunning ? 'running' : '',
        animated: isRunning, // ReactFlow 内置动画
      };
    });
  }, [edges, runningEdges]);

  // 初始化默认节点（开始节点和结束节点）
  useEffect(() => {
    // 如果已有节点，不重复初始化
    if (nodes.length > 0) {
      return;
    }

    // 创建默认的开始节点和结束节点
    const initialNodes: WorkflowNode[] = [
      {
        id: 'start_1',
        type: NodeType.START,
        position: { x: 100, y: 200 },
        data: {
          label: '开始',
          triggerType: 'manual',
        } as any,
      },
      {
        id: 'end_1',
        type: NodeType.END,
        position: { x: 500, y: 200 },
        data: {
          label: '结束',
          endStatus: 'success',
        } as any,
      },
    ];

    setNodes(initialNodes);
  }, [nodes.length, setNodes]);

  // 处理节点点击事件
  const handleNodeClick: NodeMouseHandler<WorkflowNode> = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  // 处理画布点击事件
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      // 如果在放置模式，创建新节点
      if (placingNodeType) {
        // 将屏幕坐标转换为画布坐标
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // 节点预览是以鼠标为中心显示的，所以放置时也要居中
        // 节点大约宽 180px，高 70px，需要偏移一半
        const nodeWidth = 180;
        const nodeHeight = 70;
        const centeredPosition = {
          x: position.x - nodeWidth / 2,
          y: position.y - nodeHeight / 2,
        };

        // 如果是 MCP 节点且有预设数据，使用 addNodeWithData
        if (placingNodeType === NodeType.MCP && pendingMCPData) {
          addNodeWithData(placingNodeType, centeredPosition, pendingMCPData);
        } else {
          // 添加普通节点
          addNode(placingNodeType, centeredPosition);
        }
        // 退出放置模式
        cancelPlacingNode();
      } else {
        // 正常点击，取消选中
        setSelectedNodeId(null);
      }
    },
    [placingNodeType, pendingMCPData, reactFlowInstance, addNode, addNodeWithData, cancelPlacingNode, setSelectedNodeId]
  );

  // 用于记录拖拽过程中的上一个有效位置，解决 store 更新延迟导致的碰撞计算失效问题
  const dragRef = React.useRef<{ id: string; lastValidPosition: { x: number; y: number } } | null>(null);

  const handleNodeDragStart: NodeMouseHandler = useCallback(
    (_event, node) => {
      dragRef.current = {
        id: node.id,
        lastValidPosition: { ...node.position },
      };
    },
    []
  );

  // 拦截 onNodesChange，防止 ReactFlow 的默认行为覆盖我们的防撞逻辑
  const onNodesChangeIntercepted = useCallback(
    (changes: any) => {
      // [新增] 如果没开启防撞，直接全部通过（不拦截）
      if (!enableCollision) {
        onNodesChange(changes);
        return;
      }

      // 过滤掉当前正在拖拽节点的"位置变更"，交由 onNodeDrag 独占控制
      const filteredChanges = changes.filter((change: any) => {
        if (change.type === 'position' && dragRef.current && change.id === dragRef.current.id) {
          return false;
        }
        return true;
      });
      onNodesChange(filteredChanges);
    },
    [onNodesChange, enableCollision]
  );

  // 处理节点拖拽事件（实现刚体防碰撞：限制自身移动）
  const handleNodeDrag: NodeMouseHandler = useCallback(
    (_event, draggedNode) => {
      // [新增] 如果没开启防撞，什么都不做，完全交给 ReactFlow 默认行为（onNodesChange 会处理）
      if (!enableCollision) {
        return;
      }

      // 1. 获取其他障碍物节点
      const otherNodes = nodes.filter((n) => n.id !== draggedNode.id);

      // 2. 获取基准位置（优先使用 Ref 中的上一个有效位置，确保算法有正确的"来源"方向）
      const baseNode =
        dragRef.current && dragRef.current.id === draggedNode.id
          ? { ...draggedNode, position: dragRef.current.lastValidPosition }
          : draggedNode;

      // 确保使用最新的尺寸数据（防止 ReactFlow 传入的 draggedNode 丢失 measured）
      const storeNode = nodes.find((n) => n.id === draggedNode.id);
      const nodeWithDimensions = {
        ...draggedNode,
        measured: storeNode?.measured || draggedNode.measured
      };
      const baseNodeWithDimensions = {
        ...baseNode,
        measured: storeNode?.measured || baseNode.measured
      };

      // 3. 计算无碰撞的有效位置
      const validPosition = getValidPosition(nodeWithDimensions, baseNodeWithDimensions, otherNodes);

      // 4. 更新 lastValidPosition (如果计算出的位置有效)
      if (dragRef.current && dragRef.current.id === draggedNode.id) {
        dragRef.current.lastValidPosition = validPosition;
      }

      // 5. 更新 ReactFlow 状态 (强制同步，因为我们拦截了默认的 onNodesChange)
      // 只要计算出的位置与当前 Store 中的位置不同，就更新
      const currentNode = nodes.find(n => n.id === draggedNode.id);
      if (currentNode && (validPosition.x !== currentNode.position.x || validPosition.y !== currentNode.position.y)) {
        const newNodes = nodes.map((n) => {
          if (n.id === draggedNode.id) {
            return { ...n, position: validPosition };
          }
          return n;
        });
        setNodes(newNodes);
      }
    },
    [nodes, setNodes, enableCollision]
  );

  const handleNodeDragStop: NodeMouseHandler = useCallback(() => {
    // 拖拽结束，清理 Ref
    dragRef.current = null;
  }, []);

  // 处理键盘事件（ESC 取消放置）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && placingNodeType) {
        cancelPlacingNode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placingNodeType, cancelPlacingNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={styledEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChangeIntercepted}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onNodeDragStart={handleNodeDragStart}
      onNodeDrag={handleNodeDrag}
      onNodeDragStop={handleNodeDragStop}
      onPaneClick={handlePaneClick}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      defaultEdgeOptions={{
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      }}
      className={placingNodeType ? 'cursor-crosshair' : ''}
    >
      {/* 背景网格 */}
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="#e5e7eb"
      />

      {/* 控制栏：缩放、居中等（暂时隐藏，用工具栏替代） */}
      <Controls
        showZoom={false}
        showFitView={false}
        showInteractive={false}
        className="hidden"
      />

      {/* 右侧属性面板（浮动在画布上方） */}
      <Panel position="top-right" className="m-0 p-0">
        <div className="flex flex-col gap-4">
          <PropertyPanel />
          <RunPanel />
        </div>
      </Panel>

      {/* 底部工具栏 */}
      <Panel position="bottom-center" className="mb-4">
        <CanvasToolbar />
      </Panel>

      {/* 放置模式提示 */}
      {placingNodeType && (
        <Panel position="top-center" className="mt-4">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm">
            点击画布放置节点，按 ESC 取消
          </div>
        </Panel>
      )}

      {/* 节点放置预览（跟随鼠标） */}
      <PlacingNodePreview />
    </ReactFlow>
  );
};

/**
 * 工作流编辑器画布区域
 * 使用 ReactFlow 实现节点拖拽和连线功能
 */
export const EditorCanvas: React.FC = () => {
  return (
    <div className="flex-1">
      <ReactFlowProvider>
        <CanvasContent />
      </ReactFlowProvider>
    </div>
  );
};

