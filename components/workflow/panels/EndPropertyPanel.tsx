/**
 * 结束节点属性面板
 *
 * 配置结束节点的输出变量
 */
'use client';

import React from 'react';
import { Input, Button, Divider, Tooltip } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { PropertyPanelProps, EndNodeData, EndOutputVariable } from '@/lib/workflow/types';

/**
 * 生成唯一 ID
 */
const generateId = () => `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * 变量行组件 Props
 */
interface VariableRowProps {
  variable: EndOutputVariable;
  onUpdate: (id: string, field: keyof EndOutputVariable, value: string) => void;
  onRemove: (id: string) => void;
}

/**
 * 变量行组件
 */
const VariableRow: React.FC<VariableRowProps> = ({ variable, onUpdate, onRemove }) => {
  return (
    <div className="flex items-center gap-2 mb-3">
      {/* 变量名 */}
      <Input
        placeholder="变量名"
        value={variable.name}
        onChange={(e) => onUpdate(variable.id, 'name', e.target.value)}
        className="flex-1"
      />

      {/* 变量值 */}
      <Input
        placeholder="设置变量值"
        value={variable.value}
        onChange={(e) => onUpdate(variable.id, 'value', e.target.value)}
        className="flex-1"
      />

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
  );
};

/**
 * 结束节点属性面板组件
 */
export const EndPropertyPanel: React.FC<PropertyPanelProps<EndNodeData>> = ({
  nodeId,
  data,
}) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  // 获取输出变量列表
  const outputVariables = data.outputVariables || [];

  /**
   * 更新节点数据
   */
  const handleChange = (field: keyof EndNodeData, value: unknown) => {
    updateNodeData(nodeId, { [field]: value });
  };

  /**
   * 添加新变量
   */
  const handleAddVariable = () => {
    const newVariable: EndOutputVariable = {
      id: generateId(),
      name: '',
      value: '',
    };
    handleChange('outputVariables', [...outputVariables, newVariable]);
  };

  /**
   * 删除变量
   */
  const handleRemoveVariable = (id: string) => {
    handleChange('outputVariables', outputVariables.filter((v) => v.id !== id));
  };

  /**
   * 更新变量
   */
  const handleUpdateVariable = (id: string, field: keyof EndOutputVariable, value: string) => {
    handleChange(
      'outputVariables',
      outputVariables.map((v) => (v.id === id ? { ...v, [field]: value } : v))
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

      {/* 输出变量 */}
      <div>
        <div className="font-medium text-gray-900 mb-3">输出变量</div>

        {/* 变量列表 */}
        <div>
          {outputVariables.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400 mb-3">
              未配置变量
            </div>
          ) : (
            outputVariables.map((variable) => (
              <VariableRow
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
        >
          添加
        </Button>
      </div>
    </div>
  );
};

