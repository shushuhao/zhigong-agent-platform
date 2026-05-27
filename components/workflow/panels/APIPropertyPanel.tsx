/**
 * API 节点属性面板
 *
 * 提供 API 节点的配置表单，包括：
 * - 节点描述
 * - HTTP 方法和 URL
 * - 请求参数（Query Parameters）
 * - 请求头（Headers）
 * - 鉴权设置
 * - 请求体（支持多种格式）
 * - 超时设置
 * - 输出变量展示
 */
'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Input,
  Select,
  Switch,
  InputNumber,
  Divider,
  Modal,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
  ExpandOutlined,
  CompressOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import type {
  PropertyPanelProps,
  APINodeData,
  KeyValuePair,
  HttpMethod,
  BodyType,
} from '@/lib/workflow/types';
import { getAvailableVariables, type WorkflowVariable } from '@/lib/workflow/variableUtils';

const { TextArea } = Input;

// ==================== 常量定义 ====================

/** HTTP 方法选项 */
const HTTP_METHODS: { value: HttpMethod; label: string; color: string }[] = [
  { value: 'GET', label: 'GET', color: 'text-green-600' },
  { value: 'POST', label: 'POST', color: 'text-blue-600' },
  { value: 'PUT', label: 'PUT', color: 'text-orange-600' },
  { value: 'DELETE', label: 'DELETE', color: 'text-red-600' },
  { value: 'PATCH', label: 'PATCH', color: 'text-purple-600' },
];

/** 请求体类型选项 */
const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'none' },
  { value: 'form-data', label: 'form-data' },
  { value: 'json', label: 'JSON' },
  { value: 'raw', label: 'raw txt' },
  { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
];

// ==================== 子组件 ====================

/**
 * 变量插入图标
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
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

const VariableSelector: React.FC<VariableSelectorProps> = ({
  visible,
  onSelect,
  onClose,
  variables,
  anchorRef,
}) => {
  const [search, setSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // 当弹出时清空搜索框
  useEffect(() => {
    if (visible) {
      setSearch('');
    }
  }, [visible]);

  // 计算位置
  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [visible, anchorRef]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (visible) {
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

  const filteredVariables = useMemo(() => {
    if (!search) return variables;
    return variables.filter(
      (v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.sourceNodeLabel?.toLowerCase().includes(search.toLowerCase())
    );
  }, [variables, search]);

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-80 overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      {/* 搜索框 */}
      <div className="p-2 border-b border-gray-100">
        <Input
          size="small"
          placeholder="搜索变量..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* 变量列表 */}
      <div className="max-h-60 overflow-y-auto p-2">
        {filteredVariables.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">
            {variables.length === 0 ? '暂无可用变量' : '未找到匹配的变量'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredVariables.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => onSelect(variable.name)}
              >
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium text-sm">{variable.name}</span>
                  <span className="text-gray-400 text-xs">来自: {variable.sourceNodeLabel}</span>
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
 * 带变量选择功能的输入框
 */
interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables: WorkflowVariable[];
  className?: string;
}

const VariableInput: React.FC<VariableInputProps> = ({
  value,
  onChange,
  placeholder,
  variables,
  className,
}) => {
  const [showSelector, setShowSelector] = useState(false);
  // 使用包装 div 的 ref 来获取位置，因为 Ant Design Input 的 ref 不是 DOM 元素
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorPosRef = useRef<number>(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '/') {
      e.preventDefault(); // 阻止 '/' 字符输入到搜索框
      cursorPosRef.current = e.currentTarget.selectionStart || 0;
      setShowSelector(true);
    }
  };

  const handleSelectVariable = (varName: string) => {
    const before = value.slice(0, cursorPosRef.current);
    const after = value.slice(cursorPosRef.current);
    // 移除触发的 '/' 字符（如果有的话）
    const newBefore = before.endsWith('/') ? before.slice(0, -1) : before;
    onChange(`${newBefore}{{${varName}}}${after}`);
    setShowSelector(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "键入 '/' 键快速插入变量..."}
        className={className}
        size="small"
      />
      <VariableSelector
        visible={showSelector}
        onSelect={handleSelectVariable}
        onClose={() => setShowSelector(false)}
        variables={variables}
        anchorRef={wrapperRef}
      />
    </div>
  );
};

/**
 * 键值对编辑器组件
 */
interface KeyValueEditorProps {
  title: string;
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  variables: WorkflowVariable[];
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  title,
  items,
  onChange,
  variables,
  keyPlaceholder = "键入 '/' 键快速插入...",
  valuePlaceholder = "键入 '/' 键快速插入...",
}) => {
  const handleAdd = () => {
    const newItem: KeyValuePair = {
      id: `kv-${Date.now()}`,
      key: '',
      value: '',
      enabled: true,
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: 'key' | 'value', newValue: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: newValue } : item
      )
    );
  };

  return (
    <div className="space-y-2">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <button
          onClick={handleAdd}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        >
          <PlusOutlined className="text-xs" />
        </button>
      </div>

      {/* 列标题 */}
      {items.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_24px] gap-2 text-xs text-gray-500">
          <span>变量名</span>
          <span>变量值</span>
          <span></span>
        </div>
      )}

      {/* 键值对列表 */}
      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-[1fr_1fr_24px] gap-2 items-center">
          <VariableInput
            value={item.key}
            onChange={(v) => handleChange(item.id, 'key', v)}
            placeholder={keyPlaceholder}
            variables={variables}
          />
          <VariableInput
            value={item.value}
            onChange={(v) => handleChange(item.id, 'value', v)}
            placeholder={valuePlaceholder}
            variables={variables}
          />
          <button
            onClick={() => handleRemove(item.id)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500"
          >
            <MinusCircleOutlined className="text-sm" />
          </button>
        </div>
      ))}

      {/* 空状态时显示一个默认行 */}
      {items.length === 0 && (
        <div className="grid grid-cols-[1fr_1fr_24px] gap-2 text-xs text-gray-500">
          <span>变量名</span>
          <span>变量值</span>
          <span></span>
        </div>
      )}
    </div>
  );
};

/**
 * JSON 编辑器组件
 */
interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables: WorkflowVariable[];
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, variables }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosRef = useRef<number>(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/') {
      cursorPosRef.current = e.currentTarget.selectionStart || 0;
      setShowSelector(true);
    }
  };

  const handleSelectVariable = (varName: string) => {
    const before = value.slice(0, cursorPosRef.current);
    const after = value.slice(cursorPosRef.current);
    const newBefore = before.endsWith('/') ? before.slice(0, -1) : before;
    onChange(`${newBefore}{{${varName}}}${after}`);
    setShowSelector(false);
  };

  const editorContent = (
    <div className="relative">
      <TextArea
        ref={textareaRef as React.Ref<any>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='{\n  "key": "value"\n}'
        rows={isFullscreen ? 20 : 6}
        className="font-mono text-sm"
        style={{ resize: 'none' }}
      />
      <VariableSelector
        visible={showSelector}
        onSelect={handleSelectVariable}
        onClose={() => setShowSelector(false)}
        variables={variables}
        anchorRef={textareaRef as React.RefObject<HTMLElement | null>}
      />
    </div>
  );

  return (
    <>
      <div className="relative">
        {editorContent}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <ExpandOutlined />
        </button>
      </div>

      <Modal
        title="编辑 JSON"
        open={isFullscreen}
        onCancel={() => setIsFullscreen(false)}
        footer={null}
        width={800}
        centered
      >
        <div className="relative">
          <TextArea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='{\n  "key": "value"\n}'
            rows={20}
            className="font-mono text-sm"
            style={{ resize: 'none' }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-400">
          提示：输入 / 可快速插入变量
        </div>
      </Modal>
    </>
  );
};

/**
 * Raw Text 编辑器组件
 */
interface RawTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables: WorkflowVariable[];
}

const RawTextEditor: React.FC<RawTextEditorProps> = ({ value, onChange, variables }) => {
  const [showSelector, setShowSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosRef = useRef<number>(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/') {
      cursorPosRef.current = e.currentTarget.selectionStart || 0;
      setShowSelector(true);
    }
  };

  const handleSelectVariable = (varName: string) => {
    const before = value.slice(0, cursorPosRef.current);
    const after = value.slice(cursorPosRef.current);
    const newBefore = before.endsWith('/') ? before.slice(0, -1) : before;
    onChange(`${newBefore}{{${varName}}}${after}`);
    setShowSelector(false);
  };

  return (
    <div className="relative">
      <TextArea
        ref={textareaRef as React.Ref<any>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入文本内容，键入 '/' 可插入变量..."
        rows={4}
        style={{ resize: 'none' }}
      />
      <VariableSelector
        visible={showSelector}
        onSelect={handleSelectVariable}
        onClose={() => setShowSelector(false)}
        variables={variables}
        anchorRef={textareaRef as React.RefObject<HTMLElement | null>}
      />
    </div>
  );
};

// ==================== 主面板组件 ====================

/**
 * API 节点属性面板
 */
export const APIPropertyPanel: React.FC<PropertyPanelProps<APINodeData>> = ({
  nodeId,
  data,
}) => {
  // 获取 store 方法和状态
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  // 获取可用变量
  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  // 更新节点数据的通用方法
  const handleUpdate = useCallback(
    (field: keyof APINodeData, value: unknown) => {
      updateNodeData(nodeId, { [field]: value });
    },
    [nodeId, updateNodeData]
  );

  return (
    <div className="space-y-4">
      {/* 描述 */}
      <div>
        <Input
          placeholder="添加描述..."
          value={data.description || ''}
          onChange={(e) => handleUpdate('description', e.target.value)}
          variant="borderless"
          className="text-gray-500 px-0"
        />
      </div>

      <Divider className="my-3" />

      {/* API 配置：方法 + URL */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">API</div>
        <div className="flex gap-2">
          <Select
            value={data.method}
            onChange={(v) => handleUpdate('method', v)}
            className="w-24"
            size="small"
            options={HTTP_METHODS.map((m) => ({
              value: m.value,
              label: <span className={m.color}>{m.label}</span>,
            }))}
          />
          <div className="flex-1">
            <VariableInput
              value={data.url || ''}
              onChange={(v) => handleUpdate('url', v)}
              placeholder="输入 URL，输入变量时请键入 '/'"
              variables={availableVariables}
            />
          </div>
        </div>
      </div>

      <Divider className="my-3" />

      {/* 请求参数 */}
      <KeyValueEditor
        title="请求参数"
        items={data.params || []}
        onChange={(items) => handleUpdate('params', items)}
        variables={availableVariables}
      />

      <Divider className="my-3" />

      {/* 请求头 */}
      <KeyValueEditor
        title="请求头"
        items={data.headers || []}
        onChange={(items) => handleUpdate('headers', items)}
        variables={availableVariables}
      />

      <Divider className="my-3" />

      {/* 鉴权 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">鉴权</span>
        <Switch
          checked={data.authEnabled || false}
          onChange={(checked) => handleUpdate('authEnabled', checked)}
          size="small"
          checkedChildren="开"
          unCheckedChildren="关"
        />
      </div>

      <Divider className="my-3" />

      {/* 请求体 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">请求体</div>
        <Select
          value={data.bodyType || 'none'}
          onChange={(v) => handleUpdate('bodyType', v)}
          className="w-full"
          size="small"
          options={BODY_TYPES}
        />

        {/* 根据请求体类型显示不同的编辑器 */}
        {data.bodyType === 'form-data' && (
          <KeyValueEditor
            title=""
            items={data.bodyFormData || []}
            onChange={(items) => handleUpdate('bodyFormData', items)}
            variables={availableVariables}
          />
        )}

        {data.bodyType === 'x-www-form-urlencoded' && (
          <KeyValueEditor
            title=""
            items={data.bodyFormData || []}
            onChange={(items) => handleUpdate('bodyFormData', items)}
            variables={availableVariables}
          />
        )}

        {data.bodyType === 'json' && (
          <JsonEditor
            value={data.bodyJson || ''}
            onChange={(v) => handleUpdate('bodyJson', v)}
            variables={availableVariables}
          />
        )}

        {data.bodyType === 'raw' && (
          <RawTextEditor
            value={data.bodyRaw || ''}
            onChange={(v) => handleUpdate('bodyRaw', v)}
            variables={availableVariables}
          />
        )}
      </div>

      <Divider className="my-3" />

      {/* 超时设置 */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">超时设置</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">重试间隔（秒）</div>
            <InputNumber
              value={data.timeout || 120}
              onChange={(v) => handleUpdate('timeout', v)}
              min={1}
              max={600}
              className="w-full"
              size="small"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">重试次数</div>
            <InputNumber
              value={data.retryCount || 3}
              onChange={(v) => handleUpdate('retryCount', v)}
              min={0}
              max={10}
              className="w-full"
              size="small"
            />
          </div>
        </div>
      </div>

      <Divider className="my-3" />

      {/* 输出变量 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">输出</div>
        {data.outputs?.map((output) => (
          <div key={output.name} className="flex flex-col py-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-gray-800">
                {output.name}
              </span>
              <span className="text-xs text-gray-400 capitalize">{output.type}</span>
            </div>
            <span className="text-xs text-gray-500">{output.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

