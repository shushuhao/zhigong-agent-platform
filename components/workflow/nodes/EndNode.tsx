/**
 * 结束节点组件
 *
 * 工作流的出口节点，只有输入连接点，没有输出连接点
 * 显示输出变量列表
 */
'use client';

import React, { useState } from 'react';
import { Position } from '@xyflow/react';
import { StopOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import type { EndNodeData } from '@/lib/workflow/types';
import { CustomHandle } from './CustomHandle';

interface EndNodeProps {
  id: string;
  data: EndNodeData;
  selected?: boolean;
}

/**
 * 结束节点组件
 */
export const EndNode: React.FC<EndNodeProps> = ({ id, data, selected }) => {
  const [showOutputs, setShowOutputs] = useState(true);

  // 获取输出变量列表
  const outputVariables = data.outputVariables || [];

  return (
    <div
      className={`
        min-w-[220px] rounded-xl shadow-sm bg-white border-2
        ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200'}
        transition-all duration-200
        group relative
      `}
    >
      {/* 输入连接点 - 左侧 + 图标 */}
      <CustomHandle type="target" position={Position.Left} />

      {/* 头部：图标 + 标题 */}
      <div className="flex items-center gap-3 p-3 pb-2">
        <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white">
          <StopOutlined className="text-base" />
        </div>
        <span className="font-medium text-gray-900">{data.label}</span>
      </div>

      {/* 输出变量区域 */}
      <div className="px-3 pb-3">
        {/* 可折叠标题 */}
        <div
          className="flex items-center gap-1 cursor-pointer text-gray-600 hover:text-gray-900 mb-2"
          onClick={() => setShowOutputs(!showOutputs)}
        >
          {showOutputs ? (
            <DownOutlined className="text-xs" />
          ) : (
            <RightOutlined className="text-xs" />
          )}
          <span className="text-sm font-medium">输出</span>
        </div>

        {/* 变量列表 */}
        {showOutputs && (
          <div className="space-y-1">
            {outputVariables.length === 0 ? (
              <div className="text-sm text-gray-400">未配置变量</div>
            ) : (
              outputVariables.map((variable) => (
                <div key={variable.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-900">{variable.name || '未命名'}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

