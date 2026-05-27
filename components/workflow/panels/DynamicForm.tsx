'use client';

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Radio,
  Checkbox,
  Tooltip,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { FormField, WorkflowNodeData } from '@/lib/workflow/types';
import { useWorkflowStore } from '@/stores/workflowStore';

const { TextArea } = Input;

/**
 * DynamicForm 组件 Props
 */
interface DynamicFormProps {
  /** 节点 ID */
  nodeId: string;
  /** 节点当前数据 */
  data: WorkflowNodeData;
  /** 表单字段配置 */
  schema: FormField[];
}

/**
 * 动态表单渲染器
 * 
 * 根据 schema 配置自动生成表单，支持：
 * - input: 单行文本输入
 * - textarea: 多行文本输入
 * - select: 下拉选择
 * - switch: 开关
 * - number: 数字输入
 * - radio: 单选
 * - checkbox: 多选
 */
export const DynamicForm: React.FC<DynamicFormProps> = ({
  nodeId,
  data,
  schema,
}) => {
  const [form] = Form.useForm();
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  // 当节点数据变化时，同步到表单
  useEffect(() => {
    form.setFieldsValue(data);
  }, [form, data]);

  /**
   * 处理表单值变化
   * 实时更新到 Store
   */
  const handleValuesChange = (
    changedValues: Record<string, unknown>,
  ) => {
    updateNodeData(nodeId, changedValues);
  };

  /**
   * 渲染表单标签
   * 如果有 tooltip，则显示问号图标
   */
  const renderLabel = (field: FormField) => {
    if (field.tooltip) {
      return (
        <span>
          {field.label}
          <Tooltip title={field.tooltip}>
            <QuestionCircleOutlined className="ml-1 text-gray-400 cursor-help" />
          </Tooltip>
        </span>
      );
    }
    return field.label;
  };

  /**
   * 根据字段类型渲染对应的表单控件
   */
  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'input':
        return <Input placeholder={field.placeholder} />;

      case 'textarea':
        return (
          <TextArea
            placeholder={field.placeholder}
            rows={4}
            showCount
          />
        );

      case 'select':
        return (
          <Select
            placeholder={field.placeholder}
            options={field.options?.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
          />
        );

      case 'switch':
        return <Switch />;

      case 'number':
        return (
          <InputNumber
            placeholder={field.placeholder}
            className="w-full"
          />
        );

      case 'radio':
        return (
          <Radio.Group>
            {field.options?.map((opt) => (
              <Radio key={String(opt.value)} value={opt.value}>
                {opt.label}
              </Radio>
            ))}
          </Radio.Group>
        );

      case 'checkbox':
        return (
          <Checkbox.Group
            options={field.options?.map((opt) => ({
              label: opt.label,
              value: opt.value as string | number,
            }))}
          />
        );

      default:
        return <Input placeholder={field.placeholder} />;
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={data}
      onValuesChange={handleValuesChange}
      className="px-4 py-2"
    >
      {schema.map((field) => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={renderLabel(field)}
          rules={
            field.required
              ? [{ required: true, message: `请填写${field.label}` }]
              : undefined
          }
          extra={field.description}
          valuePropName={field.type === 'switch' ? 'checked' : 'value'}
        >
          {renderField(field)}
        </Form.Item>
      ))}
    </Form>
  );
};

