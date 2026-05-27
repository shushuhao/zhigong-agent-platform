/**
 * 画布工具栏组件
 *
 * 位于画布底部中间，包含添加节点、缩放等功能
 */
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useStore } from 'zustand';
import { Button, Popover, Tooltip, Divider, Badge } from 'antd';
import {
  PlusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  RedoOutlined,
  AimOutlined,
  CheckSquareOutlined,
  AppstoreOutlined,
  AppstoreFilled,
  PartitionOutlined,
} from '@ant-design/icons';
import { NodeSelector } from './NodeSelector';
import { ValidationChecklist } from './ValidationChecklist';
import { useWorkflowStore } from '@/stores/workflowStore';
import { validateWorkflow } from '@/lib/workflow/validation';
import { getLayoutedElements } from '@/lib/workflow/layoutAlgorithm';

/**
 * 画布工具栏
 * 提供添加节点、缩放、撤销重做等功能
 */
export const CanvasToolbar: React.FC = () => {
  // 节点选择器弹窗是否打开
  const [selectorOpen, setSelectorOpen] = useState(false);
  // 检查清单弹窗是否打开
  const [checklistOpen, setChecklistOpen] = useState(false);

  // 获取 ReactFlow 实例，用于缩放控制
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // 获取撤销/重做相关方法
  const { undo, redo } = useWorkflowStore.temporal.getState();

  // 获取节点和边数据
  const { nodes, edges, setNodes, setEdges, enableCollision, toggleCollision } = useWorkflowStore();

  // 自动布局处理
  const handleAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'LR' // 强制使用水平布局
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => fitView({ duration: 800 }), 10);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  // 订阅 temporal store 的状态变化，获取历史记录长度
  const canUndo = useStore(useWorkflowStore.temporal, (state) => state.pastStates.length > 0);
  const canRedo = useStore(useWorkflowStore.temporal, (state) => state.futureStates.length > 0);

  // 计算验证问题数量
  const issueCount = useMemo(() => {
    const result = validateWorkflow(nodes, edges);
    return result.issues.length;
  }, [nodes, edges]);

  // 处理节点选择后关闭弹窗
  const handleNodeSelect = () => {
    setSelectorOpen(false);
  };

  // 缩放处理函数
  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 200 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 200 });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  // 撤销/重做处理函数
  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  // 键盘快捷键支持 (Ctrl+Z / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否按下 Ctrl 键（Mac 上是 Cmd 键）
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (isCtrlOrCmd && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          // Ctrl+Shift+Z: 重做
          redo();
        } else {
          // Ctrl+Z: 撤销
          undo();
        }
      }

      // 也支持 Ctrl+Y 重做
      if (isCtrlOrCmd && event.key === 'y') {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <>
      <div className="bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1.5 flex items-center gap-1">
        {/* 添加节点按钮 */}
        <Popover
          content={<NodeSelector onSelect={handleNodeSelect} />}
          trigger="click"
          placement="top"
          open={selectorOpen}
          onOpenChange={setSelectorOpen}
          arrow={false}
          styles={{ body: { padding: 0 } }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="rounded-full"
          >
            节点
          </Button>
        </Popover>

        <Divider type="vertical" className="h-6 mx-1" />

        {/* 自动布局按钮 */}
        <Tooltip title="自动布局">
          <Button
            type="text"
            icon={<PartitionOutlined />}
            className="text-gray-500 hover:text-gray-700"
            onClick={handleAutoLayout}
          />
        </Tooltip>

        <Divider type="vertical" className="h-6 mx-1" />

        <Tooltip title={enableCollision ? '关闭自动避让' : '开启自动避让'}>
          <Button
            type="text"
            icon={enableCollision ? <AppstoreFilled style={{ color: '#1677ff' }} /> : <AppstoreOutlined />}
            className={enableCollision ? 'bg-blue-50' : 'text-gray-500'}
            onClick={toggleCollision}
          />
        </Tooltip>

        {/* 检查清单按钮 */}
        <Tooltip title="检查清单">
          <Badge count={issueCount} offset={[-5, 5]} size="small">
            <Button
              type="text"
              icon={<CheckSquareOutlined />}
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setChecklistOpen(true)}
            />
          </Badge>
        </Tooltip>

        <Divider type="vertical" className="h-6 mx-1" />

        {/* 缩放按钮组 */}
        <Tooltip title="缩小">
          <Button
            type="text"
            icon={<ZoomOutOutlined />}
            className="text-gray-500 hover:text-gray-700"
            onClick={handleZoomOut}
          />
        </Tooltip>

        <Tooltip title="放大">
          <Button
            type="text"
            icon={<ZoomInOutlined />}
            className="text-gray-500 hover:text-gray-700"
            onClick={handleZoomIn}
          />
        </Tooltip>

        <Tooltip title="适应画布">
          <Button
            type="text"
            icon={<AimOutlined />}
            className="text-gray-500 hover:text-gray-700"
            onClick={handleFitView}
          />
        </Tooltip>

        <Divider type="vertical" className="h-6 mx-1" />

        {/* 撤销重做按钮组 */}
        <Tooltip title="撤销 (Ctrl+Z)">
          <Button
            type="text"
            icon={<UndoOutlined />}
            className={canUndo ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300'}
            onClick={handleUndo}
            disabled={!canUndo}
          />
        </Tooltip>

        <Tooltip title="重做 (Ctrl+Shift+Z)">
          <Button
            type="text"
            icon={<RedoOutlined />}
            className={canRedo ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300'}
            onClick={handleRedo}
            disabled={!canRedo}
          />
        </Tooltip>
      </div>

      {/* 检查清单弹窗 */}
      <ValidationChecklist
        open={checklistOpen}
        onClose={() => setChecklistOpen(false)}
      />
    </>
  );
};

