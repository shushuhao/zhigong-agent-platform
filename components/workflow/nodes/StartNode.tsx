/**
 * 开始节点组件
 *
 * 工作流的入口节点，只有输出连接点，没有输入连接点
 * 显示输入变量列表
 */
'use client';

import React, { useState } from 'react';
import { Position } from '@xyflow/react';
import { PlayCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import type { StartNodeData } from '@/lib/workflow/types';
import { CustomHandle } from './CustomHandle';

/**
 * 变量类型显示映射
 */
const typeLabels: Record<string, string> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'array',
};

interface StartNodeProps {
  id: string;
  data: StartNodeData;
  selected?: boolean;
}

/**
 * 开始节点组件
 */
export const StartNode: React.FC<StartNodeProps> = ({ id, data, selected }) => {
  const [showInputs, setShowInputs] = useState(true);

  // 获取输入变量列表
  const inputs = data.inputs || [];

  return (
    <div
      className={`
        min-w-[220px] rounded-xl shadow-sm bg-white border-2
        ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200'}
        transition-all duration-200
        group relative
      `}
    >
      {/* 输出连接点 - 右侧 + 图标 */}
      <CustomHandle type="source" position={Position.Right} />

      {/* 头部：图标 + 标题 */}
      <div className="flex items-center gap-3 p-3 pb-2">
        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
          <PlayCircleOutlined className="text-base" />
        </div>
        <span className="font-medium text-gray-900">{data.label}</span>
      </div>

      {/* 输入变量区域 */}
      <div className="px-3 pb-3">
        {/* 可折叠标题 */}
        <div
          className="flex items-center gap-1 cursor-pointer text-gray-600 hover:text-gray-900 mb-2"
          onClick={() => setShowInputs(!showInputs)}
        >
          {showInputs ? (
            <DownOutlined className="text-xs" />
          ) : (
            <RightOutlined className="text-xs" />
          )}
          <span className="text-sm font-medium">输入</span>
        </div>

        {/* 变量列表 */}
        {showInputs && (
          <div className="space-y-1">
            {inputs.length === 0 ? (
              <div className="text-sm text-gray-400">未配置变量</div>
            ) : (
              inputs.map((variable) => (
                <div key={variable.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-900">{variable.name || '未命名'}</span>
                  <span className="text-gray-400">{typeLabels[variable.type]}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

