/**
 * 知识检索节点组件
 *
 * 用于从知识库中检索相关信息
 * 显示已配置的知识库列表、输入变量和输出变量
 */
'use client';

import React, { useState } from 'react';
import { BookOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Position } from '@xyflow/react';
import type { KnowledgeNodeData } from '@/lib/workflow/types';
import { CustomHandle } from './CustomHandle';

interface KnowledgeNodeProps {
  id: string;
  data: KnowledgeNodeData;
  selected?: boolean;
}

/**
 * 知识检索节点组件
 */
export const KnowledgeNode: React.FC<KnowledgeNodeProps> = ({ id, data, selected }) => {
  const [showOutputs, setShowOutputs] = useState(true);

  // 判断是否已配置知识库
  const hasKnowledgeBases = data.knowledgeBases && data.knowledgeBases.length > 0;

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
      {/* 输入连接点 - 左侧 */}
      <CustomHandle type="target" position={Position.Left} />

      {/* 输出连接点 - 右侧 */}
      <CustomHandle type="source" position={Position.Right} />

      {/* 节点头部 */}
      <div className="flex items-center gap-3 p-3 pb-2">
        {/* 图标 - 紫色背景 */}
        <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white text-sm">
          <BookOutlined />
        </div>

        {/* 标题 */}
        <div className="font-medium text-sm text-gray-800">
          {data.label}
        </div>
      </div>

      {/* 知识库信息区域 */}
      <div className="mx-3 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-xs text-gray-500 mb-1">知识库</div>
        {hasKnowledgeBases ? (
          <div className="space-y-1">
            {data.knowledgeBases.map((kb) => (
              <div key={kb.id} className="flex items-center gap-1.5 text-sm text-gray-800">
                <span>{kb.icon}</span>
                <span className="truncate max-w-[160px]">{kb.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400">未配置知识库</div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="mx-3 mb-2">
        <div className="text-xs text-gray-500 mb-1">输入</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-800 font-medium">query</span>
          <span className="text-gray-400">string</span>
        </div>
      </div>

      {/* 输出区域（可折叠） */}
      <div className="mx-3 mb-3">
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

        {showOutputs && data.outputs && data.outputs.length > 0 && (
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
    </div>
  );
};