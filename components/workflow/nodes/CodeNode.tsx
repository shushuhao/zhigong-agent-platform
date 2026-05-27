/**
 * 代码节点组件
 *
 * 用于执行自定义代码（JavaScript 或 Python3）
 * 显示输入变量和输出变量列表
 */
'use client';

import React, { useState } from 'react';
import { CodeOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Position } from '@xyflow/react';
import type { CodeNodeData } from '@/lib/workflow/types';
import { CustomHandle } from './CustomHandle';

interface CodeNodeProps {
  id: string;
  data: CodeNodeData;
  selected?: boolean;
}

/**
 * 代码节点组件
 */
export const CodeNode: React.FC<CodeNodeProps> = ({ id, data, selected }) => {
  const [showInputs, setShowInputs] = useState(true);
  const [showOutputs, setShowOutputs] = useState(true);

  return (
    <div
      className={`
        min-w-[220px] rounded-xl shadow-sm
        bg-white
        border-2
        ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200'}
        transition-all duration-200
        group relative
      `}
    >
      {/* 输入连接点 - 左侧 + 图标 */}
      <CustomHandle type="target" position={Position.Left} />

      {/* 输出连接点 - 右侧 + 图标 */}
      <CustomHandle type="source" position={Position.Right} />

      {/* 节点头部 */}
      <div className="flex items-center gap-3 p-3 pb-2">
        {/* 图标 */}
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm">
          <CodeOutlined />
        </div>

        {/* 标题 */}
        <div className="font-medium text-sm text-gray-800">
          {data.label}
        </div>
      </div>

      {/* 输入变量区域 */}
      {data.inputs && data.inputs.length > 0 && (
        <div className="mx-3 mb-2">
          {/* 输入标题（可折叠） */}
          <div
            className="flex items-center gap-1 cursor-pointer select-none py-1"
            onClick={() => setShowInputs(!showInputs)}
          >
            <span className="text-xs text-gray-600 font-medium">输入</span>
            {showInputs ? (
              <DownOutlined className="text-[10px] text-gray-400" />
            ) : (
              <RightOutlined className="text-[10px] text-gray-400" />
            )}
          </div>

          {/* 输入变量列表 */}
          {showInputs && (
            <div className="mt-1 space-y-1">
              {data.inputs.map((input) => (
                <div
                  key={input.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="text-gray-800 font-medium">{input.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 输出变量区域 */}
      {data.outputs && data.outputs.length > 0 && (
        <div className="mx-3 mb-3">
          {/* 输出标题（可折叠） */}
          <div
            className="flex items-center gap-1 cursor-pointer select-none py-1"
            onClick={() => setShowOutputs(!showOutputs)}
          >
            <span className="text-xs text-gray-600 font-medium">输出</span>
            {showOutputs ? (
              <DownOutlined className="text-[10px] text-gray-400" />
            ) : (
              <RightOutlined className="text-[10px] text-gray-400" />
            )}
          </div>

          {/* 输出变量列表 */}
          {showOutputs && (
            <div className="mt-1 space-y-1">
              {data.outputs.map((output) => (
                <div
                  key={output.name}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="text-gray-800 font-medium">{output.name}</span>
                  <span className="text-gray-400">{output.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
