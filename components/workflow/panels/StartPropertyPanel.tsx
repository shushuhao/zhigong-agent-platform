/**
 * 开始节点属性面板
 *
 * 配置开始节点的输入变量
 */
'use client';

import React from 'react';
import { Input, Select, Checkbox, Button, Divider, Tooltip } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { PropertyPanelProps, StartNodeData, InputVariable, InputVariableType } from '@/lib/workflow/types';

const { TextArea } = Input;

/**
 * 变量类型选项
 */
const TYPE_OPTIONS: { value: InputVariableType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' },
];

/**
 * 生成唯一 ID
 */
const generateId = () => `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * 变量卡片组件 Props
 */
interface VariableCardProps {
  variable: InputVariable;
  onUpdate: (id: string, field: keyof InputVariable, value: unknown) => void;
  onRemove: (id: string) => void;
}

/**
 * 变量卡片组件
 */
const VariableCard: React.FC<VariableCardProps> = ({ variable, onUpdate, onRemove }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      {/* 第一行：变量名、类型、必填、删除 */}
      <div className="flex items-center gap-2">
        {/* 变量名 */}
        <div className="flex-1">
          <Input
            placeholder="请输入"
            value={variable.name}
            onChange={(e) => onUpdate(variable.id, 'name', e.target.value)}
            maxLength={20}
            showCount
            className="w-full"
          />
        </div>

        {/* 类型选择 */}
        <Select
          placeholder="选择数据类型"
          value={variable.type}
          onChange={(value) => onUpdate(variable.id, 'type', value)}
          options={TYPE_OPTIONS}
          className="w-32"
        />

        {/* 必填 */}
        <Tooltip title="必填">
          <Checkbox
            checked={variable.required}
            onChange={(e) => onUpdate(variable.id, 'required', e.target.checked)}
          />
        </Tooltip>

        {/* 删除按钮 */}
        <Tooltip title="删除">
          <Button
            type="text"
            icon={<MinusCircleOutlined />}
            onClick={() => onRemove(variable.id)}
            className="text-gray-400 hover:text-red-500"
          />
        </Tooltip>
      </div>

      {/* 默认值 */}
      <div>
        <div className="text-sm text-gray-500 mb-1">默认值</div>
        <Input
          placeholder="没有传入该变量时使用默认值"
          value={variable.defaultValue || ''}
          onChange={(e) => onUpdate(variable.id, 'defaultValue', e.target.value)}
        />
      </div>

      {/* 描述 */}
      <div>
        <div className="text-sm text-gray-500 mb-1">描述</div>
        <Input
          placeholder="帮助大模型了解变量作用"
          value={variable.description || ''}
          onChange={(e) => onUpdate(variable.id, 'description', e.target.value)}
        />
      </div>
    </div>
  );
};

/**
 * 开始节点属性面板组件
 */
export const StartPropertyPanel: React.FC<PropertyPanelProps<StartNodeData>> = ({
  nodeId,
  data,
}) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  // 获取输入变量列表
  const inputs = data.inputs || [];

  /**
   * 更新节点数据
   */
  const handleChange = (field: keyof StartNodeData, value: unknown) => {
    updateNodeData(nodeId, { [field]: value });
  };

  /**
   * 添加新变量
   */
  const handleAddVariable = () => {
    const newVariable: InputVariable = {
      id: generateId(),
      name: '',
      type: 'string',
      required: false,
      defaultValue: '',
      description: '',
    };
    handleChange('inputs', [...inputs, newVariable]);
  };

  /**
   * 删除变量
   */
  const handleRemoveVariable = (id: string) => {
    handleChange('inputs', inputs.filter((v) => v.id !== id));
  };

  /**
   * 更新变量
   */
  const handleUpdateVariable = (id: string, field: keyof InputVariable, value: unknown) => {
    handleChange(
      'inputs',
      inputs.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  return (
    <div className="space-y-4">
      {/* 描述 */}
      <div>
        <Input
          placeholder="添加描述..."
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          variant="borderless"
          className="text-gray-500 px-0"
        />
      </div>

      <Divider className="my-3" />

      {/* 输入变量 */}
      <div>
        <div className="font-medium text-gray-900 mb-3">输入变量</div>

        {/* 变量列表 */}
        <div className="space-y-4">
          {inputs.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400">
              未配置变量
            </div>
          ) : (
            inputs.map((variable) => (
              <VariableCard
                key={variable.id}
                variable={variable}
                onUpdate={handleUpdateVariable}
                onRemove={handleRemoveVariable}
              />
            ))
          )}
        </div>

        {/* 添加按钮 */}
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={handleAddVariable}
          className="mt-4"
        >
          添加
        </Button>
      </div>
    </div>
  );
};

