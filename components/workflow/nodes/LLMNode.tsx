/**
 * 大模型节点组件
 * 
 * 用于调用大语言模型（LLM）生成内容
 * 显示模型信息和输出变量列表
 */
'use client';

import React, { useState } from 'react';
import { RobotOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Position } from '@xyflow/react';
import type { LLMNodeData } from '@/lib/workflow/types';
import { CustomHandle } from './CustomHandle';

/**
 * Mock 模型数据
 * 模拟真实 Agent 平台的模型列表
 */
export const MODEL_OPTIONS = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { id: 'qwen-max', name: '通义千问 Max', provider: 'Alibaba' },
  { id: 'glm-4', name: 'GLM-4', provider: 'Zhipu' },
];

interface LLMNodeProps {
  id: string;
  data: LLMNodeData;
  selected?: boolean;
}

/**
 * 大模型节点组件
 */
export const LLMNode: React.FC<LLMNodeProps> = ({ id, data, selected }) => {
  const [showOutputs, setShowOutputs] = useState(true);

  // 获取选择的模型名称
  const selectedModel = MODEL_OPTIONS.find((m) => m.id === data.model);
  const modelDisplayName = selectedModel?.name || '未配置模型';

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
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm">
          <RobotOutlined />
        </div>

        {/* 标题 */}
        <div className="font-medium text-sm text-gray-800">
          {data.label}
        </div>
      </div>

      {/* 模型信息区域 */}
      <div className="mx-3 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-xs text-gray-500 mb-1">模型</div>
        <div className={`text-sm ${data.model ? 'text-gray-800' : 'text-gray-400'}`}>
          {modelDisplayName}
        </div>
      </div>

      {/* 输出区域 */}
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

