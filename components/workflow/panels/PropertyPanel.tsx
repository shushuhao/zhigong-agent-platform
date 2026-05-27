'use client';

import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Empty } from 'antd';
import { useWorkflowStore } from '@/stores/workflowStore';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';
import { DynamicForm } from './DynamicForm';
import type { WorkflowNodeData } from '@/lib/workflow/types';

/**
 * 图标背景色映射
 * 与 BaseNode 保持一致
 */
const iconColorClasses: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
};

/**
 * 右侧属性面板
 * 
 * 功能：
 * 1. 显示选中节点的配置表单
 * 2. 支持动态表单（formSchema）和自定义面板（propertyPanel）
 * 3. 优先级：propertyPanel > formSchema
 */
export const PropertyPanel: React.FC = () => {
  // 获取选中的节点 ID
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  
  // 获取选中的节点
  const selectedNode = useWorkflowStore((state) =>
    state.nodes.find((node) => node.id === selectedNodeId)
  );
  
  // 关闭面板
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);

  // 如果没有选中节点，不渲染面板
  if (!selectedNodeId || !selectedNode) {
    return null;
  }

  // 获取节点配置
  const nodeConfig = nodeRegistry.get(selectedNode.type);

  if (!nodeConfig) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
        <div className="p-4">
          <Empty description="未知节点类型" />
        </div>
      </div>
    );
  }

  /**
   * 渲染面板内容
   * 优先使用自定义面板组件，否则使用动态表单
   */
  const renderContent = () => {
    // 优先使用自定义面板组件
    if (nodeConfig.propertyPanel) {
      const CustomPanel = nodeConfig.propertyPanel;
      return (
        <CustomPanel
          nodeId={selectedNode.id}
          data={selectedNode.data as WorkflowNodeData}
        />
      );
    }

    // 使用 formSchema 动态渲染
    if (nodeConfig.formSchema && nodeConfig.formSchema.length > 0) {
      return (
        <DynamicForm
          nodeId={selectedNode.id}
          data={selectedNode.data as WorkflowNodeData}
          schema={nodeConfig.formSchema}
        />
      );
    }

    // 没有配置表单
    return (
      <div className="p-4">
        <Empty description="暂无可配置项" />
      </div>
    );
  };

  // 获取图标颜色
  const iconBgClass = iconColorClasses[nodeConfig.iconColor || 'blue'];

  return (
    <div
      className="w-96 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[calc(100vh-120px)] overflow-hidden"
      data-panel="property"
    >
      {/* 面板头部 */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* 节点图标（蓝色背景） */}
          <div
            className={`w-8 h-8 rounded-lg ${iconBgClass} flex items-center justify-center text-white text-sm`}
          >
            {nodeConfig.icon}
          </div>
          {/* 节点类型名称 */}
          <span className="font-medium text-gray-800 text-base">{nodeConfig.label}</span>
        </div>
        {/* 关闭按钮 */}
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={() => setSelectedNodeId(null)}
          className="text-gray-400 hover:text-gray-600"
        />
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

