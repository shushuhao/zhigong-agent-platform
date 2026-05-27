/**
 * API 节点组件
 *
 * 用于发送 HTTP 请求，支持 GET/POST/PUT/DELETE/PATCH 方法
 * 显示 API 配置状态和输入/输出变量
 */
'use client';

import React, { useState, useMemo } from 'react';
import { ApiOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Position } from '@xyflow/react';
import type { APINodeData } from '@/lib/workflow/types';
import { CustomHandle } from './CustomHandle';

interface APINodeProps {
  id: string;
  data: APINodeData;
  selected?: boolean;
}

/**
 * API 节点组件
 */
export const APINode: React.FC<APINodeProps> = ({ id, data, selected }) => {
  const [showInputs, setShowInputs] = useState(true);
  const [showOutputs, setShowOutputs] = useState(true);

  // 计算输入变量（从 URL、params、headers、body 中提取变量引用）
  const inputVariables = useMemo(() => {
    const variables: { name: string; type: string }[] = [];
    const varRegex = /\{\{([^}]+)\}\}/g;

    // 从 URL 提取变量
    let match;
    while ((match = varRegex.exec(data.url || '')) !== null) {
      variables.push({ name: match[1], type: 'string' });
    }

    // 从 params 提取变量
    data.params?.forEach((param) => {
      while ((match = varRegex.exec(param.value || '')) !== null) {
        variables.push({ name: match[1], type: 'string' });
      }
    });

    // 从 headers 提取变量
    data.headers?.forEach((header) => {
      while ((match = varRegex.exec(header.value || '')) !== null) {
        variables.push({ name: match[1], type: 'string' });
      }
    });

    // 从 body 提取变量
    const bodyContent = data.bodyType === 'json' ? data.bodyJson : data.bodyRaw;
    while ((match = varRegex.exec(bodyContent || '')) !== null) {
      variables.push({ name: match[1], type: 'string' });
    }

    // 去重
    const uniqueVars = Array.from(
      new Map(variables.map((v) => [v.name, v])).values()
    );
    return uniqueVars;
  }, [data]);

  // 判断是否已配置 URL
  const isConfigured = data.url && data.url.trim() !== '';

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
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white text-sm">
          <ApiOutlined />
        </div>

        {/* 标题 */}
        <div className="font-medium text-sm text-gray-800">{data.label}</div>
      </div>

      {/* API 配置状态 */}
      <div className="mx-3 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-xs text-gray-500 mb-1">API</div>
        <div className={`text-sm ${isConfigured ? 'text-gray-800' : 'text-gray-400'}`}>
          {isConfigured ? (
            <span className="font-mono text-xs">
              <span className="text-teal-600 font-medium mr-1">{data.method}</span>
              <span className="truncate block max-w-[180px]">{data.url}</span>
            </span>
          ) : (
            '未配置变量'
          )}
        </div>
      </div>

      {/* 输入区域 */}
      <div className="mx-3 mb-2">
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

        {showInputs && (
          <div className="mt-1 space-y-1">
            {inputVariables.length > 0 ? (
              inputVariables.map((variable, index) => (
                <div key={`${variable.name}-${index}`} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-800 font-medium">{variable.name}</span>
                  <span className="text-gray-400">{variable.type}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400">未配置变量</div>
            )}
          </div>
        )}
      </div>

      {/* 输出区域 */}
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
              <div key={output.name} className="flex items-center gap-2 text-xs">
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

