/**
 * 工作流验证检查清单组件
 *
 * 显示工作流中所有节点的验证问题
 * 帮助用户在发布前检查所有必填项
 */
'use client';

import React, { useMemo } from 'react';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import { validateWorkflow, groupIssuesByNode } from '@/lib/workflow/validation';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';
import type { ValidationIssue } from '@/lib/workflow/validation';

interface ValidationChecklistProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 验证检查清单组件
 */
export const ValidationChecklist: React.FC<ValidationChecklistProps> = ({
  open,
  onClose,
}) => {
  const { nodes, edges, setSelectedNodeId } = useWorkflowStore();

  // 执行验证
  const validationResult = useMemo(() => {
    return validateWorkflow(nodes, edges);
  }, [nodes, edges]);

  // 按节点分组问题
  const groupedIssues = useMemo(() => {
    return groupIssuesByNode(validationResult.issues);
  }, [validationResult.issues]);

  // 处理点击问题项，定位到对应节点
  const handleIssueClick = (issue: ValidationIssue) => {
    setSelectedNodeId(issue.nodeId);
    onClose();
  };

  // 渲染问题列表
  const renderIssues = () => {
    if (validationResult.isValid) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
          <p className="text-lg text-gray-600">所有检查项均已通过！</p>
          <p className="text-sm text-gray-400 mt-2">工作流已准备就绪，可以发布</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Array.from(groupedIssues.entries()).map(([nodeId, issues]) => {
          const firstIssue = issues[0];
          const nodeConfig = nodeRegistry.get(firstIssue.nodeType);
          
          return (
            <div
              key={nodeId}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 节点头部 */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                {/* 节点图标 */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: nodeConfig?.iconColor || '#gray' }}
                >
                  {nodeConfig?.icon}
                </div>
                {/* 节点标签 */}
                <span className="font-medium text-gray-800">{firstIssue.nodeLabel}</span>
              </div>

              {/* 问题列表 */}
              <div className="px-4 py-2">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 py-2 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                    onClick={() => handleIssueClick(issue)}
                  >
                    <ExclamationCircleOutlined className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{issue.message}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 如果不显示，返回 null
  if (!open) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-[640px] max-h-[70vh] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <span className="text-lg font-medium text-gray-800">
          检查清单({validationResult.issues.length})
        </span>
        <CloseOutlined
          className="text-gray-400 hover:text-gray-600 cursor-pointer text-base"
          onClick={onClose}
        />
      </div>

      {/* 内容区域 */}
      <div className="overflow-y-auto max-h-[calc(70vh-64px)]">
        <div className="px-6 py-4">
          {/* 提示文字 */}
          <div className="mb-4 text-sm text-gray-500">
            发布前确保所有问题均已解决
          </div>

          {/* 问题列表 */}
          {renderIssues()}
        </div>
      </div>
    </div>
  );
};

