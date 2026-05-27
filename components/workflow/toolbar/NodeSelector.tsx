/**
 * 节点选择器组件
 * 
 * 显示所有可添加的节点类型，点击后进入放置模式
 * MCP 节点特殊处理：点击后弹出 MCP 选择弹窗
 */
'use client';

import React, { useState, useCallback } from 'react';
import { ApiOutlined } from '@ant-design/icons';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';
import { NodeType } from '@/lib/workflow/types';
import type { MCPNodeData } from '@/lib/workflow/types';
import { useWorkflowStore } from '@/stores/workflowStore';
import { MCPSelectModal } from '@/components/workflow/panels/MCPSelectModal';
import { createMCPToolRef, createDefaultInputs, type MCPService, type MCPToolDefinition } from '@/lib/services/mcp.mock';

interface NodeSelectorProps {
  /** 选择节点后的回调 */
  onSelect?: () => void;
}

/**
 * 节点选择器
 * 显示所有可添加的节点列表
 */
export const NodeSelector: React.FC<NodeSelectorProps> = ({ onSelect }) => {
  const startPlacingNode = useWorkflowStore((state) => state.startPlacingNode);
  const setPendingMCPData = useWorkflowStore((state) => state.setPendingMCPData);

  // MCP 选择弹窗状态
  const [mcpModalOpen, setMcpModalOpen] = useState(false);

  // 获取所有可添加的节点（排除开始节点和 MCP 节点）
  const availableNodes = React.useMemo(() => {
    const allConfigs = nodeRegistry.getAll();
    // 过滤掉开始节点（开始节点一般只有一个）和 MCP 节点（MCP 需要特殊处理）
    return allConfigs.filter((config) => config.type !== NodeType.START && config.type !== NodeType.MCP);
  }, []);

  // 处理普通节点点击
  const handleNodeClick = (type: NodeType) => {
    startPlacingNode(type);
    onSelect?.();
  };

  // 处理 MCP 节点点击 - 打开选择弹窗
  const handleMCPClick = () => {
    setMcpModalOpen(true);
  };

  // 处理 MCP 工具选择
  const handleMCPSelect = useCallback((service: MCPService, tool: MCPToolDefinition) => {
    // 创建 MCP 节点数据
    const mcpData: Partial<MCPNodeData> = {
      label: tool.name,
      mcpTool: createMCPToolRef(service, tool),
      inputs: createDefaultInputs(tool),
      outputs: tool.outputs,
    };
    
    // 设置待放置的 MCP 数据
    setPendingMCPData(mcpData);
    // 进入放置模式
    startPlacingNode(NodeType.MCP);
    // 关闭弹窗
    setMcpModalOpen(false);
    // 关闭节点选择器
    onSelect?.();
  }, [setPendingMCPData, startPlacingNode, onSelect]);

  return (
    <>
      <div className="w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* 标题 */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700">选择节点</h3>
        </div>

        {/* 节点列表 */}
        <div className="p-2 max-h-80 overflow-y-auto">
          {/* 普通节点 */}
          {availableNodes.map((config) => (
            <div
              key={config.type}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNodeClick(config.type)}
            >
              {/* 节点图标 */}
              <span className="text-lg text-gray-600">{config.icon}</span>
              
              {/* 节点信息 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">
                  {config.label}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {config.description}
                </div>
              </div>
            </div>
          ))}

          {/* MCP 节点 - 特殊处理，点击后弹出选择弹窗 */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={handleMCPClick}
          >
            <span className="text-lg text-gray-600">
              <ApiOutlined className="text-purple-500" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800">MCP</div>
              <div className="text-xs text-gray-500 truncate">
                调用 MCP 协议工具
              </div>
            </div>
          </div>

          {availableNodes.length === 0 && (
            <div className="text-center text-gray-400 py-4 text-sm">
              暂无可添加的节点
            </div>
          )}
        </div>
      </div>

      {/* MCP 选择弹窗 */}
      <MCPSelectModal
        open={mcpModalOpen}
        onSelect={handleMCPSelect}
        onCancel={() => setMcpModalOpen(false)}
      />
    </>
  );
};

