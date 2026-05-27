/**
 * 基础节点组件
 *
 * 提供所有节点的通用样式和结构
 * 其他节点组件可以基于这个组件进行扩展
 *
 * 统一样式：
 * - 白色背景
 * - 选中时蓝色边框高亮
 * - 图标背景色可自定义
 * - 执行状态指示器
 */
'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { NodeHoverMenu } from './NodeHoverMenu';
import { useWorkflowRunStore } from '@/stores/workflowRunStore';
import { NodeExecutionStatus, WorkflowRunStatus } from '@/lib/workflow/engine/types';

export interface BaseNodeProps {
  /** 节点 ID */
  id: string;
  /** 是否被选中 */
  selected?: boolean;
  /** 节点图标 */
  icon: React.ReactNode;
  /** 节点标题 */
  title: string;
  /** 节点副标题/描述 */
  subtitle?: string;
  /** 图标背景色（仅影响图标，节点始终为白色背景） */
  iconColor?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
  /** 是否显示输入连接点 */
  showInput?: boolean;
  /** 是否显示输出连接点 */
  showOutput?: boolean;
  /** 子内容 */
  children?: React.ReactNode;
}

/**
 * 图标背景色映射
 */
const iconColorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
};

/**
 * 获取执行状态对应的边框样式
 */
const getExecutionBorderClass = (status?: NodeExecutionStatus) => {
  switch (status) {
    case NodeExecutionStatus.RUNNING:
      return 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
    case NodeExecutionStatus.SUCCESS:
      return 'border-green-500';
    case NodeExecutionStatus.FAILED:
      return 'border-red-500';
    case NodeExecutionStatus.SKIPPED:
      return 'border-gray-400';
    default:
      return '';
  }
};

/**
 * 执行状态指示器组件
 */
const ExecutionIndicator: React.FC<{ status?: NodeExecutionStatus }> = ({ status }) => {
  if (!status || status === NodeExecutionStatus.PENDING) {
    return null;
  }

  return (
    <div className="absolute -top-2 -right-2 z-10">
      {status === NodeExecutionStatus.RUNNING && (
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <LoadingOutlined className="text-white text-xs" spin />
        </div>
      )}
      {status === NodeExecutionStatus.SUCCESS && (
        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircleOutlined className="text-white text-xs" />
        </div>
      )}
      {status === NodeExecutionStatus.FAILED && (
        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <CloseCircleOutlined className="text-white text-xs" />
        </div>
      )}
      {status === NodeExecutionStatus.SKIPPED && (
        <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
          <MinusCircleOutlined className="text-white text-xs" />
        </div>
      )}
    </div>
  );
};

/**
 * 基础节点组件
 * 统一样式：白色背景，选中时蓝色边框，执行状态指示
 */
export const BaseNode: React.FC<BaseNodeProps> = ({
  selected = false,
  icon,
  title,
  subtitle,
  iconColor = 'blue',
  showInput = true,
  showOutput = true,
  children,
  id,
}) => {
  // 获取节点执行状态
  const workflowStatus = useWorkflowRunStore((state) => state.status);
  const nodeStatus = useWorkflowRunStore((state) => state.nodeStatuses[id]);
  
  // 只有在工作流运行中或运行结束后才显示执行状态
  const showExecutionStatus = workflowStatus !== WorkflowRunStatus.IDLE;
  const executionBorderClass = showExecutionStatus ? getExecutionBorderClass(nodeStatus) : '';

  return (
    <div
      className={`
        min-w-[200px] rounded-xl shadow-sm
        bg-white
        border-2
        ${executionBorderClass || (selected ? 'border-blue-500 shadow-md' : 'border-gray-200')}
        transition-all duration-200
        group relative
      `}
    >
      {/* 执行状态指示器 */}
      {showExecutionStatus && <ExecutionIndicator status={nodeStatus} />}
      
      <NodeHoverMenu nodeId={id} />
      {/* 输入连接点 */}
      {showInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}

      {/* 节点头部 */}
      <div className="flex items-center gap-3 p-3">
        {/* 图标 */}
        <div
          className={`
            w-8 h-8 rounded-lg ${iconColorClasses[iconColor]}
            flex items-center justify-center
            text-white text-sm
          `}
        >
          {icon}
        </div>

        {/* 标题区域 */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800 truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* 子内容区域 */}
      {children && (
        <div className="px-3 pb-3 pt-0">
          {children}
        </div>
      )}

      {/* 输出连接点 */}
      {showOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}
    </div>
  );
};

