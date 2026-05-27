/**
 * MCP 节点属性面板
 *
 * 提供 MCP 节点的配置表单，包括：
 * - 工具信息展示
 * - 输入参数配置（支持变量选择）
 * - 超时设置
 * - 输出变量展示
 */
'use client';

import React, { useState, useMemo } from 'react';
import { Input, Divider, InputNumber, Select, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { PropertyPanelProps, MCPNodeData, MCPInputParameter, ErrorHandleType } from '@/lib/workflow/types';
import { getAvailableVariables, type WorkflowVariable } from '@/lib/workflow/variableUtils';

/**
 * 变量选择器组件
 */
interface VariableSelectorProps {
  visible: boolean;
  onSelect: (variableName: string) => void;
  onClose: () => void;
  variables: WorkflowVariable[];
}

const VariableSelector: React.FC<VariableSelectorProps> = ({
  visible,
  onSelect,
  onClose,
  variables,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
    >
      <div className="max-h-48 overflow-y-auto p-2">
        {variables.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">
            暂无可用变量，请先连接上游节点
          </div>
        ) : (
          <div className="space-y-1">
            {variables.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center justify-between p-2 rounded hover:bg-blue-50 cursor-pointer"
                onClick={() => {
                  onSelect(variable.name);
                  onClose();
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-500 font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded">
                    {'{x}'}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-medium">{variable.name}</span>
                    <span className="text-gray-400 text-xs">来自: {variable.sourceNodeLabel}</span>
                  </div>
                </div>
                <span className="text-gray-400 text-xs">{variable.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 异常处理方式选项
 */
const ERROR_HANDLE_OPTIONS: { value: ErrorHandleType; label: string }[] = [
  { value: 'interrupt', label: '中断流程' },
  { value: 'continue', label: '继续执行' },
  { value: 'retry', label: '重试' },
];

/**
 * MCP 节点属性面板组件
 */
export const MCPPropertyPanel: React.FC<PropertyPanelProps<MCPNodeData>> = ({
  nodeId,
  data,
}) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  // 当前聚焦的输入参数索引
  const [focusedInputIndex, setFocusedInputIndex] = useState<number | null>(null);

  // 获取所有上游节点的可用变量
  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  /**
   * 更新节点数据
   */
  const handleChange = (field: keyof MCPNodeData, value: unknown) => {
    updateNodeData(nodeId, { [field]: value });
  };

  /**
   * 更新输入参数值
   */
  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...data.inputs];
    newInputs[index] = { ...newInputs[index], value };
    handleChange('inputs', newInputs);
  };

  /**
   * 选择变量
   */
  const handleSelectVariable = (index: number, variableName: string) => {
    handleInputChange(index, `{{${variableName}}}`);
    setFocusedInputIndex(null);
  };

  /**
   * 渲染输出变量（支持嵌套）
   */
  const renderOutputVariable = (output: MCPNodeData['outputs'][0], depth = 0) => {
    const indent = depth * 16;
    return (
      <div key={output.name}>
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: indent }}
        >
          <span className="font-medium text-gray-800">{output.name}</span>
          <span className="text-gray-400 text-sm">
            {output.type === 'array' ? `Array[Object]` : output.type}
          </span>
        </div>
        {output.children && output.children.length > 0 && (
          <div className="mt-1">
            {output.children.map((child) => renderOutputVariable(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* 工具名称 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-xl">
          {data.mcpTool?.serviceIcon || '🔧'}
        </div>
        <div>
          <div className="font-medium text-gray-800">{data.mcpTool?.toolName || data.label}</div>
        </div>
      </div>

      {/* 工具描述 */}
      <div className="text-sm text-gray-500">
        {data.mcpTool?.toolDescription || ''}
      </div>

      <Divider className="my-3" />

      {/* 输入参数 */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-700">输入</div>
        
        {/* 表头 */}
        <div className="grid grid-cols-[120px_1fr] gap-3 text-xs text-gray-500">
          <div>变量名</div>
          <div>变量值</div>
        </div>

        {/* 参数列表 */}
        {data.inputs && data.inputs.length > 0 ? (
          <div className="space-y-3">
            {data.inputs.map((input, index) => (
              <div key={input.name} className="grid grid-cols-[120px_1fr] gap-3 items-start">
                <div className="flex items-center gap-1 pt-1">
                  {input.required && <span className="text-red-500">*</span>}
                  <span className="text-sm text-gray-800">{input.name}</span>
                  <span className="text-xs text-gray-400">{input.type}</span>
                </div>
                <div className="relative">
                  <Input
                    placeholder="设置变量值"
                    value={input.value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onFocus={() => setFocusedInputIndex(index)}
                  />
                  <VariableSelector
                    visible={focusedInputIndex === index}
                    onSelect={(varName) => handleSelectVariable(index, varName)}
                    onClose={() => setFocusedInputIndex(null)}
                    variables={availableVariables}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">该工具无需输入参数</div>
        )}
      </div>

      <Divider className="my-3" />

      {/* 超时设置 */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">超时设置</div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">重试间隔（秒）</div>
            <InputNumber
              value={data.timeout}
              onChange={(v) => handleChange('timeout', v || 120)}
              min={1}
              max={600}
              className="w-full"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">重试次数</div>
            <InputNumber
              value={data.retryCount}
              onChange={(v) => handleChange('retryCount', v || 3)}
              min={0}
              max={10}
              className="w-full"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">异常处理方式</div>
            <Select
              value={data.errorHandleType}
              onChange={(v) => handleChange('errorHandleType', v)}
              options={ERROR_HANDLE_OPTIONS}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Divider className="my-3" />

      {/* 输出变量 */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">输出</div>
        {data.outputs && data.outputs.length > 0 ? (
          <div className="space-y-2">
            {data.outputs.map((output) => renderOutputVariable(output))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">暂无输出</div>
        )}
      </div>
    </div>
  );
};
