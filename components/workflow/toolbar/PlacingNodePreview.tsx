/**
 * 节点放置预览组件
 *
 * 在放置模式下，显示一个跟随鼠标移动的节点预览
 * 使用实际的节点组件渲染，提供真实的视觉反馈
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { nodeRegistry, type WorkflowNodeData } from '@/lib/workflow';

export const PlacingNodePreview: React.FC = () => {
  const placingNodeType = useWorkflowStore((state) => state.placingNodeType);

  // 鼠标在屏幕上的位置（使用屏幕坐标，因为预览使用 fixed 定位）
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // 获取当前放置的节点配置
  const nodeConfig = placingNodeType ? nodeRegistry.get(placingNodeType) : null;

  // 监听鼠标移动
  useEffect(() => {
    if (!placingNodeType) {
      setPosition(null);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      // 直接使用屏幕坐标（因为预览使用 fixed 定位）
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    // 添加鼠标移动监听
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [placingNodeType]);

  // 如果不在放置模式或没有位置信息，不渲染
  if (!placingNodeType || !position || !nodeConfig) {
    return null;
  }

  // 获取节点组件
  const NodeComponent = nodeConfig.component;

  // 使用默认数据创建预览节点的 props
  const previewData = nodeConfig.defaultData as WorkflowNodeData;

  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'fixed',
        // 居中显示在鼠标位置
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        opacity: 0.85,
      }}
    >
      {/* 渲染实际的节点组件 */}
      <div className="relative">
        {/* 添加虚线边框容器 */}
        <div className="absolute inset-[-4px] border-2 border-dashed border-blue-400 rounded-2xl" />
        <NodeComponent
          id="preview"
          data={previewData}
          selected={false}
        />
      </div>
    </div>
  );
};

