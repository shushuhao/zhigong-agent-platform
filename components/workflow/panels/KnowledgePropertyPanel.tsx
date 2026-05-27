/**
 * 知识检索节点属性面板
 *
 * 提供知识检索节点的配置表单
 */
'use client';

import React, { useState, useMemo } from 'react';
import { Input, Divider, Tooltip, Empty } from 'antd';
import {
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { PropertyPanelProps, KnowledgeNodeData, KnowledgeBaseRef, RetrievalConfig } from '@/lib/workflow/types';
import { getAvailableVariables, type WorkflowVariable } from '@/lib/workflow/variableUtils';
import { RetrievalConfigModal } from './RetrievalConfigModal';
import { KnowledgeSelectModal } from './KnowledgeSelectModal';

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
 * 知识检索节点属性面板组件
 */
export const KnowledgePropertyPanel: React.FC<PropertyPanelProps<KnowledgeNodeData>> = ({
  nodeId,
  data,
}) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  // 弹窗状态
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showVariableSelector, setShowVariableSelector] = useState(false);

  // 获取所有上游节点的可用变量
  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  /**
   * 更新节点数据
   */
  const handleChange = (field: keyof KnowledgeNodeData, value: unknown) => {
    updateNodeData(nodeId, { [field]: value });
  };

  /**
   * 更新检索配置
   */
  const handleConfigChange = (config: RetrievalConfig) => {
    handleChange('retrievalConfig', config);
    setShowConfigModal(false);
  };

  /**
   * 更新知识库列表
   */
  const handleKnowledgeBasesChange = (knowledgeBases: KnowledgeBaseRef[]) => {
    handleChange('knowledgeBases', knowledgeBases);
    setShowSelectModal(false);
  };

  /**
   * 删除知识库
   */
  const handleRemoveKnowledgeBase = (id: string) => {
    const newList = data.knowledgeBases.filter((kb) => kb.id !== id);
    handleChange('knowledgeBases', newList);
  };

  /**
   * 选择查询变量
   */
  const handleSelectVariable = (variableName: string) => {
    handleChange('queryVariable', `{{${variableName}}}`);
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

      {/* 知识库区域 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-700">知识库</span>
            <Tooltip title="选择要检索的知识库">
              <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip title="检索配置">
              <button
                className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                onClick={() => setShowConfigModal(true)}
              >
                <SettingOutlined className="text-sm" />
              </button>
            </Tooltip>
            <Tooltip title="添加知识库">
              <button
                className="p-1.5 hover:bg-gray-100 rounded text-blue-500"
                onClick={() => setShowSelectModal(true)}
              >
                <PlusOutlined className="text-sm" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* 已选择的知识库列表 */}
        {data.knowledgeBases && data.knowledgeBases.length > 0 ? (
          <div className="space-y-2">
            {data.knowledgeBases.map((kb) => (
              <div
                key={kb.id}
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <CheckCircleFilled className="text-green-500 text-sm" />
                  <span className="text-xl">{kb.icon}</span>
                  <span className="text-sm text-gray-800">{kb.name}</span>
                </div>
                <button
                  className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
                  onClick={() => handleRemoveKnowledgeBase(kb.id)}
                >
                  <DeleteOutlined className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂未添加知识库"
            className="py-4"
          >
            <button
              className="text-blue-500 hover:text-blue-600 text-sm"
              onClick={() => setShowSelectModal(true)}
            >
              + 添加知识库
            </button>
          </Empty>
        )}
      </div>

      <Divider className="my-3" />

      {/* 输入变量 */}
      <div className="space-y-3">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700">输入</span>
          <Tooltip title="设置检索的查询内容">
            <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
          </Tooltip>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">query</span>
            <span className="text-xs text-gray-400">string</span>
          </div>
          <Input
            placeholder="设置变量值"
            value={data.queryVariable || ''}
            onChange={(e) => handleChange('queryVariable', e.target.value)}
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

      <Divider className="my-3" />

      {/* 输出变量 */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-gray-700">输出</span>
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

      {/* 检索配置弹窗 */}
      <RetrievalConfigModal
        open={showConfigModal}
        config={data.retrievalConfig}
        onOk={handleConfigChange}
        onCancel={() => setShowConfigModal(false)}
      />

      {/* 知识库选择弹窗 */}
      <KnowledgeSelectModal
        open={showSelectModal}
        selectedIds={data.knowledgeBases?.map((kb) => kb.id) || []}
        onOk={handleKnowledgeBasesChange}
        onCancel={() => setShowSelectModal(false)}
      />
    </div>
  );
};