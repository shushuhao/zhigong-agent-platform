/**
 * MCP 节点组件
 *
 * 用于调用 MCP 协议工具
 * 显示工具名称、输入参数和输出变量
 */
'use client';

import React, { useState } from 'react';
import { ApiOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Position } from '@xyflow/react';
import type { MCPNodeData } from '@/lib/workflow/types';
import { CustomHandle } from './CustomHandle';

interface MCPNodeProps {
  id: string;
  data: MCPNodeData;
  selected?: boolean;
}

/**
 * MCP 节点组件
 */
export const MCPNode: React.FC<MCPNodeProps> = ({ id, data, selected }) => {
  const [showInputs, setShowInputs] = useState(true);
  const [showOutputs, setShowOutputs] = useState(true);

  return (
    <div
      className={`
        min-w-[240px] rounded-xl shadow-sm
        bg-white
        border-2
        ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200'}
        transition-all duration-200
        group relative
      `}
    >
      {/* 输入连接点 - 左侧 */}
      <CustomHandle type="target" position={Position.Left} />

      {/* 输出连接点 - 右侧 */}
      <CustomHandle type="source" position={Position.Right} />

      {/* 节点头部 */}
      <div className="flex items-center gap-3 p-3 pb-2">
        {/* 图标 */}
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-lg">
          {data.mcpTool?.serviceIcon || <ApiOutlined className="text-indigo-500" />}
        </div>

        {/* 标题 */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800 uppercase truncate">
            {data.mcpTool?.toolName || data.label}
          </div>
        </div>
      </div>

      {/* 描述 */}
      {data.mcpTool?.toolDescription && (
        <div className="mx-3 mb-2 text-xs text-gray-500 line-clamp-2">
          {data.mcpTool.toolDescription}
        </div>
      )}

      {/* 输入区域 */}
      <div className="mx-3 mb-2 p-2 bg-gray-50 rounded-lg">
        <div
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => setShowInputs(!showInputs)}
        >
          <span className="text-xs text-gray-600 font-medium">输入</span>
          {showInputs ? (
            <DownOutlined className="text-[10px] text-gray-400" />
          ) : (
            <RightOutlined className="text-[10px] text-gray-400" />
          )}
        </div>

        {showInputs && data.inputs && data.inputs.length > 0 && (
          <div className="mt-2 space-y-1">
            {data.inputs.map((input) => (
              <div
                key={input.name}
                className="flex items-center gap-2 text-xs"
              >
                <span className="text-gray-800 font-medium">{input.name}</span>
                <span className="text-gray-400">{input.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 输出区域 */}
      <div className="mx-3 mb-3 p-2 bg-gray-50 rounded-lg">
        <div
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => setShowOutputs(!showOutputs)}
        >
          <span className="text-xs text-gray-600 font-medium">输出</span>
          {showOutputs ? (
            <DownOutlined className="text-[10px] text-gray-400" />
          ) : (
            <RightOutlined className="text-[10px] text-gray-400" />
          )}
        </div>

        {showOutputs && data.outputs && data.outputs.length > 0 && (
          <div className="mt-2 space-y-1">
            {data.outputs.map((output) => (
              <div key={output.name} className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-medium">{output.name}</span>
                  <span className="text-gray-400">{output.type}</span>
                </div>
                {/* 显示子字段 */}
                {output.children && output.children.length > 0 && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {output.children.map((child) => (
                      <div key={child.name} className="flex items-center gap-2 text-gray-500">
                        <span className="font-medium">{child.name}</span>
                        <span className="text-gray-400">{child.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
