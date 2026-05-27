/**
 * 代码节点属性面板
 */
'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Input, Select, Divider, Modal, Tooltip, message } from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  ExpandOutlined,
  CompressOutlined,
  CopyOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import type {
  PropertyPanelProps,
  CodeNodeData,
  CodeInputVariable,
} from '@/lib/workflow/types';
import { getAvailableVariables, type WorkflowVariable } from '@/lib/workflow/variableUtils';

const { TextArea } = Input;

/** 编程语言选项 */
const LANGUAGE_OPTIONS: { value: CodeNodeData['language']; label: string }[] = [
  { value: 'python3', label: 'Python3' },
  { value: 'javascript', label: 'JavaScript' },
];

/** Python3 默认代码模板 */
const PYTHON3_DEFAULT_CODE = `# 在这里，您可以通过 'args' 获取节点中的输入变量，并通过 'ret' 输出结果
# 'args' 和 'ret' 已经被正确地注入到环境中
# 下面是一个示例，首先获取节点的全部输入参数 params, 其次获取其中参数名为'input'的值:
# params = args.params;
# input = params.input;
# 下面是一个示例，输出一个包含多种数据类型的 'ret' 对象:
# ret: Output = { "name": '小明', "hobbies": ["看书", "旅游"] };
def main(arg1: str, arg2: str) -> dict:
    return {
        "result": arg1 + arg2,
    }`;

/** JavaScript 默认代码模板 */
const JAVASCRIPT_DEFAULT_CODE = `// 在这里，您可以通过 'args' 获取节点中的输入变量，并通过 'ret' 输出结果
// 'args' 和 'ret' 已经被正确地注入到环境中
// 下面是一个示例，首先获取节点的全部输入参数 params, 其次获取其中参数名为'input'的值:
// const params = args.params;
// const input = params.input;
// 下面是一个示例，输出一个包含多种数据类型的 'ret' 对象:
// ret = { "name": '小明', "hobbies": ["看书", "旅游"] };
function main(arg1, arg2) {
    return {
        "result": arg1 + arg2,
    };
}`;

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
  visible, onSelect, onClose, variables, anchorRef,
}) => {
  const [search, setSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => { if (visible) setSearch(''); }, [visible]);

  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [visible, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    if (visible) {
      const timer = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0);
      return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClickOutside); };
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible, onClose]);

  const filteredVariables = useMemo(() => {
    if (!search) return variables;
    return variables.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));
  }, [variables, search]);

  if (!visible) return null;

  return (
    <div ref={panelRef} className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-80 overflow-hidden" style={{ top: position.top, left: position.left }}>
      <div className="p-2 border-b border-gray-100">
        <Input size="small" placeholder="搜索变量..." prefix={<SearchOutlined className="text-gray-400" />} value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
      </div>
      <div className="max-h-60 overflow-y-auto p-2">
        {filteredVariables.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">{variables.length === 0 ? '暂无可用变量' : '未找到匹配的变量'}</div>
        ) : (
          <div className="space-y-1">
            {filteredVariables.map((variable) => (
              <div key={variable.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => onSelect(variable.name)}>
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
}

const VariableInput: React.FC<VariableInputProps> = ({ value, onChange, placeholder, variables }) => {
  const [showSelector, setShowSelector] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorPosRef = useRef<number>(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '/') {
      e.preventDefault();
      cursorPosRef.current = e.currentTarget.selectionStart || 0;
      setShowSelector(true);
    }
  };

  const handleSelectVariable = (varName: string) => {
    const before = value.slice(0, cursorPosRef.current);
    const after = value.slice(cursorPosRef.current);
    onChange(`${before}{{${varName}}}${after}`);
    setShowSelector(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder || "设置变量值"} size="small" />
      <VariableSelector visible={showSelector} onSelect={handleSelectVariable} onClose={() => setShowSelector(false)} variables={variables} anchorRef={wrapperRef} />
    </div>
  );
};

/**
 * 输入变量编辑器组件
 */
interface InputVariableEditorProps {
  items: CodeInputVariable[];
  onChange: (items: CodeInputVariable[]) => void;
  variables: WorkflowVariable[];
}

const InputVariableEditor: React.FC<InputVariableEditorProps> = ({ items, onChange, variables }) => {
  const handleAdd = () => {
    const newItem: CodeInputVariable = {
      id: `input-${Date.now()}`,
      name: `arg${items.length + 1}`,
      value: '',
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: 'name' | 'value', newValue: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: newValue } : item)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">输入</span>
        <button onClick={handleAdd} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
          <PlusOutlined className="text-xs" />
        </button>
      </div>
      <div className="grid grid-cols-[1fr_1fr_24px] gap-2 text-xs text-gray-500">
        <span>变量名</span>
        <span>变量值</span>
        <span></span>
      </div>
      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-[1fr_1fr_24px] gap-2 items-center">
          <Input value={item.name} onChange={(e) => handleChange(item.id, 'name', e.target.value)} placeholder="变量名" size="small" />
          <VariableInput value={item.value} onChange={(v) => handleChange(item.id, 'value', v)} placeholder="设置变量值" variables={variables} />
          <button onClick={() => handleRemove(item.id)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500">
            <MinusCircleOutlined className="text-sm" />
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * 代码编辑器组件
 */
interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: CodeNodeData['language'];
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenCode, setFullscreenCode] = useState(code);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    message.success('代码已复制到剪贴板');
  }, [code]);

  const handleOpenFullscreen = () => {
    setFullscreenCode(code);
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    onChange(fullscreenCode);
    setIsFullscreen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">代码</span>
        <div className="flex items-center gap-1">
          <Tooltip title="复制代码">
            <button onClick={handleCopy} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <CopyOutlined className="text-xs" />
            </button>
          </Tooltip>
          <Tooltip title="全屏编辑">
            <button onClick={handleOpenFullscreen} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <ExpandOutlined className="text-xs" />
            </button>
          </Tooltip>
        </div>
      </div>
      <TextArea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        placeholder={language === 'python3' ? '# 输入 Python3 代码...' : '// 输入 JavaScript 代码...'}
        autoSize={{ minRows: 8, maxRows: 15 }}
        className="font-mono text-sm"
        style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4' }}
      />
      <Modal
        title={<div className="flex items-center gap-2"><span>代码编辑器</span><span className="text-xs text-gray-400">({language === 'python3' ? 'Python3' : 'JavaScript'})</span></div>}
        open={isFullscreen}
        onCancel={handleCloseFullscreen}
        onOk={handleCloseFullscreen}
        width="90vw"
        style={{ top: 20 }}
        styles={{ body: { height: 'calc(90vh - 110px)', padding: 0 } }}
        okText="确定"
        cancelText="取消"
      >
        <TextArea
          value={fullscreenCode}
          onChange={(e) => setFullscreenCode(e.target.value)}
          placeholder={language === 'python3' ? '# 输入 Python3 代码...' : '// 输入 JavaScript 代码...'}
          className="font-mono text-sm h-full"
          style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', height: '100%', resize: 'none' }}
        />
      </Modal>
    </div>
  );
};

/**
 * 代码节点属性面板主组件
 */
export const CodePropertyPanel: React.FC<PropertyPanelProps> = ({ nodeId }) => {
  const { nodes, edges, updateNodeData } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);

  // 获取上游节点的可用变量
  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  if (!node || node.type !== 'code') {
    return <div className="p-4 text-gray-500">请选择一个代码节点</div>;
  }

  const data = node.data as CodeNodeData;

  const handleDescriptionChange = (description: string) => {
    updateNodeData(nodeId, { description });
  };

  const handleLanguageChange = (language: CodeNodeData['language']) => {
    const newCode = language === 'python3' ? PYTHON3_DEFAULT_CODE : JAVASCRIPT_DEFAULT_CODE;
    updateNodeData(nodeId, { language, code: newCode });
  };

  const handleCodeChange = (code: string) => {
    updateNodeData(nodeId, { code });
  };

  const handleInputsChange = (inputs: CodeInputVariable[]) => {
    updateNodeData(nodeId, { inputs });
  };

  return (
    <div className="p-4 space-y-4">
      {/* 节点标题 */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm">
          <span className="font-bold">&lt;/&gt;</span>
        </div>
        <span className="font-medium text-gray-800">{data.label}</span>
      </div>

      <Divider className="my-3" />

      {/* 描述 */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">描述</span>
        <Input
          value={data.description || ''}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="添加描述..."
        />
      </div>

      <Divider className="my-3" />

      {/* 输入变量 */}
      <InputVariableEditor
        items={data.inputs || []}
        onChange={handleInputsChange}
        variables={availableVariables}
      />

      <Divider className="my-3" />

      {/* 语言选择 */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">编程语言</span>
        <Select
          value={data.language}
          onChange={handleLanguageChange}
          options={LANGUAGE_OPTIONS}
          className="w-full"
        />
      </div>

      {/* 代码编辑器 */}
      <CodeEditor
        code={data.code || ''}
        onChange={handleCodeChange}
        language={data.language}
      />

      <Divider className="my-3" />

      {/* 输出变量 */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">输出</span>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          {(data.outputs || []).map((output) => (
            <div key={output.name} className="flex items-center justify-between text-sm">
              <span className="text-gray-800 font-medium">{output.name}</span>
              <span className="text-gray-400">{output.type}</span>
            </div>
          ))}
          {(!data.outputs || data.outputs.length === 0) && (
            <div className="text-gray-400 text-sm">暂无输出变量</div>
          )}
        </div>
      </div>
    </div>
  );
};

