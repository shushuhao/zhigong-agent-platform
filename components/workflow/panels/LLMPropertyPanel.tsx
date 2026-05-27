/**
 * 大模型节点属性面板
 *
 * 提供大模型节点的配置表单，包括：
 * - 节点描述
 * - 模型选择（带参数设置面板）
 * - 上下文变量（带变量选择器）
 * - 提示词编辑（支持全屏）
 * - 输出变量展示
 */
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Input, Select, Tooltip, Divider, Switch, Slider, Modal, InputNumber } from 'antd';
import {
  QuestionCircleOutlined,
  StarOutlined,
  ExpandOutlined,
  SearchOutlined,
  CompressOutlined,
} from '@ant-design/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import { MODEL_OPTIONS } from '@/components/workflow/nodes/LLMNode';
import type {
  PropertyPanelProps,
  LLMNodeData,
} from '@/lib/workflow/types';
import { getAvailableVariables, type WorkflowVariable } from '@/lib/workflow/variableUtils';

const { TextArea } = Input;

/**
 * 变量插入按钮图标组件
 */
const VariableIcon: React.FC = () => (
  <span className="text-blue-500 font-mono text-sm">{'{x}'}</span>
);

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
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 过滤变量
  const filteredVariables = useMemo(() => {
    if (!searchText) return variables;
    return variables.filter((v) =>
      v.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [variables, searchText]);

  // 点击外部关闭
  useEffect(() => {
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
      {/* 搜索框 */}
      <div className="p-2 border-b border-gray-100">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="搜索变量..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          autoFocus
        />
      </div>

      {/* 变量列表 */}
      <div className="max-h-48 overflow-y-auto p-2">
        {filteredVariables.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">
            {variables.length === 0 ? '暂无可用变量，请先连接上游节点' : '未找到匹配的变量'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredVariables.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center justify-between p-2 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => {
                  onSelect(variable.name);
                  onClose();
                  setSearchText('');
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
 * 模型参数设置浮动面板
 * 显示在属性面板左侧，点击外部自动关闭
 */
interface ModelParamsPanelProps {
  visible: boolean;
  model?: string;
  temperatureEnabled?: boolean;
  temperature?: number;
  topPEnabled?: boolean;
  topP?: number;
  onModelChange: (model: string) => void;
  onParamChange: (field: string, value: unknown) => void;
  onClose: () => void;
}

const ModelParamsPanel: React.FC<ModelParamsPanelProps> = ({
  visible,
  model,
  temperatureEnabled = true,
  temperature = 0.6,
  topPEnabled = false,
  topP = 0.8,
  onModelChange,
  onParamChange,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭面板（排除 Ant Design 下拉菜单等弹出层）
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 检查是否点击了面板内部
      if (panelRef.current && panelRef.current.contains(target)) {
        return;
      }

      // 检查是否点击了 Ant Design 的弹出层（Select 下拉菜单、Tooltip 等）
      // 这些组件通过 Portal 渲染到 body 上，不在面板内部
      const isAntdPopup = target.closest('.ant-select-dropdown') ||
                          target.closest('.ant-tooltip') ||
                          target.closest('.ant-popover') ||
                          target.closest('.ant-modal');

      if (isAntdPopup) {
        return;
      }

      // 检查是否点击了属性面板区域（不关闭，只有点击画布才关闭）
      const isPropertyPanel = target.closest('[data-panel="property"]');
      if (isPropertyPanel) {
        return;
      }

      onClose();
    };

    if (visible) {
      // 延迟添加监听器，避免立即触发关闭
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80"
      style={{
        // 定位在属性面板左侧
        right: 'calc(320px + 16px)', // 属性面板宽度 + 间距
        top: '120px',
      }}
    >
      {/* 面板标题 */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900">模型设置</span>
        <button
          className="text-gray-400 hover:text-gray-600 text-lg"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* 模型选择 */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-2">模型</label>
        <Select
          className="w-full"
          placeholder="选择模型"
          value={model}
          onChange={onModelChange}
          options={MODEL_OPTIONS.map((m) => ({
            label: (
              <div className="flex items-center gap-2">
                <span className="text-blue-500">✨</span>
                <span>{m.name}</span>
              </div>
            ),
            value: m.id,
          }))}
        />
      </div>

      {/* 参数设置 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">参数</label>

        {/* 温度 */}
        <div className="flex items-center gap-2 mb-4">
          <Switch
            size="small"
            checked={temperatureEnabled}
            onChange={(checked) => onParamChange('temperatureEnabled', checked)}
          />
          <div className="flex items-center gap-1 min-w-[50px]">
            <span className="text-sm text-gray-700">温度</span>
            <Tooltip title="控制输出的随机性。较高的值会使输出更随机，较低的值会使输出更确定。">
              <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
          <Slider
            className="flex-1"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(value) => onParamChange('temperature', value)}
            disabled={!temperatureEnabled}
          />
          <InputNumber
            size="small"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(value) => onParamChange('temperature', value ?? 0.6)}
            disabled={!temperatureEnabled}
            className="w-14"
          />
        </div>

        {/* Top P */}
        <div className="flex items-center gap-2">
          <Switch
            size="small"
            checked={topPEnabled}
            onChange={(checked) => onParamChange('topPEnabled', checked)}
          />
          <div className="flex items-center gap-1 min-w-[50px]">
            <span className="text-sm text-gray-700">Top P</span>
            <Tooltip title="核采样参数。模型会从累积概率超过 P 的 token 中采样。">
              <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
          <Slider
            className="flex-1"
            min={0}
            max={1}
            step={0.1}
            value={topP}
            onChange={(value) => onParamChange('topP', value)}
            disabled={!topPEnabled}
          />
          <InputNumber
            size="small"
            min={0}
            max={1}
            step={0.1}
            value={topP}
            onChange={(value) => onParamChange('topP', value ?? 0.8)}
            disabled={!topPEnabled}
            className="w-14"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 大模型节点属性面板组件
 */
export const LLMPropertyPanel: React.FC<PropertyPanelProps<LLMNodeData>> = ({
  nodeId,
  data,
}) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  // 状态
  const [showModelPanel, setShowModelPanel] = useState(false);
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 获取所有上游节点的可用变量
  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  // 获取当前选择的模型名称
  const selectedModel = useMemo(() => {
    return MODEL_OPTIONS.find((m) => m.id === data.model);
  }, [data.model]);

  /**
   * 更新节点数据
   */
  const handleChange = (field: keyof LLMNodeData, value: unknown) => {
    updateNodeData(nodeId, { [field]: value });
  };

  /**
   * 选择变量
   */
  const handleSelectVariable = (variableName: string) => {
    const variableRef = `{{${variableName}}}`;
    handleChange('context', variableRef);
  };

  /**
   * 在提示词中插入变量
   */
  const handleInsertVariable = (variableName: string) => {
    const variableRef = `{{${variableName}}}`;
    const currentPrompt = data.prompt || '';
    handleChange('prompt', currentPrompt + variableRef);
  };

  return (
    <div className="space-y-5">
      {/* 节点描述 */}
      <div>
        <Input
          placeholder="添加描述..."
          variant="borderless"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="text-gray-500 px-0 hover:bg-gray-50 rounded"
        />
      </div>

      <Divider className="my-3" />

      {/* 模型选择 - 点击展开左侧浮动设置面板 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">模型</label>
        <div
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => setShowModelPanel(!showModelPanel)}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✨</span>
            <span className={data.model ? 'text-gray-800' : 'text-gray-400'}>
              {selectedModel?.name || '选择模型'}
            </span>
          </div>
          <span className={`text-gray-400 transition-transform ${showModelPanel ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>

      {/* 模型参数设置浮动面板 - 显示在属性面板左侧 */}
      <ModelParamsPanel
        visible={showModelPanel}
        model={data.model}
        temperatureEnabled={data.temperatureEnabled}
        temperature={data.temperature}
        topPEnabled={data.topPEnabled}
        topP={data.topP}
        onModelChange={(model) => handleChange('model', model)}
        onParamChange={(field, value) => handleChange(field as keyof LLMNodeData, value)}
        onClose={() => setShowModelPanel(false)}
      />

      <Divider className="my-3" />

      {/* 上下文 - 带变量选择器 */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <label className="text-sm font-medium text-gray-700">上下文</label>
          <Tooltip title="设置传入模型的上下文变量，可以引用开始节点的输入变量">
            <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
          </Tooltip>
        </div>
        <div className="relative">
          <Input
            placeholder="设置变量值"
            value={data.context || ''}
            onChange={(e) => handleChange('context', e.target.value)}
            onFocus={() => setShowVariableSelector(true)}
          />
          <VariableSelector
            visible={showVariableSelector}
            onSelect={handleSelectVariable}
            onClose={() => setShowVariableSelector(false)}
            variables={availableVariables}
          />
        </div>
      </div>

      {/* 提示词 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">提示词</label>
          <div className="flex items-center gap-2">
            <Tooltip title="AI 优化提示词">
              <button className="p-1 hover:bg-gray-100 rounded text-blue-500">
                <StarOutlined className="text-sm" />
              </button>
            </Tooltip>
            <Tooltip title="插入变量">
              <button className="p-1 hover:bg-gray-100 rounded">
                <VariableIcon />
              </button>
            </Tooltip>
            <Tooltip title="全屏编辑">
              <button
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                onClick={() => setIsFullscreen(true)}
              >
                <ExpandOutlined className="text-sm" />
              </button>
            </Tooltip>
          </div>
        </div>
        <TextArea
          rows={5}
          placeholder="在这里写你的提示词，输入'{'插入变量、输入'/'插入提示..."
          value={data.prompt || ''}
          onChange={(e) => handleChange('prompt', e.target.value)}
          className="resize-none"
        />
      </div>

      <Divider className="my-3" />

      {/* 输出 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">输出</label>
        {data.outputs && data.outputs.length > 0 ? (
          <div className="space-y-2">
            {data.outputs.map((output) => (
              <div key={output.name} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{output.name}</span>
                  <span className="text-gray-400 text-sm">{output.type}</span>
                </div>
                {output.description && (
                  <span className="text-gray-500 text-xs">{output.description}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">暂无输出</div>
        )}
      </div>

      {/* 全屏编辑 Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span>提示词编辑</span>
          </div>
        }
        open={isFullscreen}
        onCancel={() => setIsFullscreen(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
        styles={{ body: { padding: '16px' } }}
      >
        <div className="space-y-3">
          {/* 工具栏 */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Tooltip title="AI 优化提示词">
                <button className="p-1.5 hover:bg-gray-100 rounded text-blue-500">
                  <StarOutlined className="text-base" />
                </button>
              </Tooltip>
              <Tooltip title="插入变量">
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <VariableIcon />
                </button>
              </Tooltip>
            </div>
            <Tooltip title="退出全屏">
              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                onClick={() => setIsFullscreen(false)}
              >
                <CompressOutlined className="text-base" />
              </button>
            </Tooltip>
          </div>

          {/* 变量快速选择 */}
          {availableVariables.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              <span className="text-xs text-gray-500">可用变量：</span>
              {availableVariables.map((variable) => (
                <button
                  key={variable.id}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  onClick={() => handleInsertVariable(variable.name)}
                >
                  {`{{${variable.name}}}`}
                </button>
              ))}
            </div>
          )}

          {/* 编辑区 */}
          <TextArea
            rows={20}
            placeholder="在这里写你的提示词..."
            value={data.prompt || ''}
            onChange={(e) => handleChange('prompt', e.target.value)}
            className="resize-none text-base"
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
};

