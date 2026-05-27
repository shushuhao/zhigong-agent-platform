'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AgentPreviewCopyButton } from './AgentPreviewCopyButton';

interface FormFieldOption {
  label: string;
  value: string | number;
}

interface FormFieldConfig {
  label: string;
  type?: 'input' | 'textarea' | 'select' | 'number' | 'date' | 'switch';
  placeholder?: string;
  value?: string | number | boolean;
  required?: boolean;
  options?: Array<FormFieldOption | string | number>;
}

interface FormBlockConfig {
  title?: string;
  description?: string;
  fields?: FormFieldConfig[];
}

interface ComponentItemConfig {
  label: string;
  value?: string | number;
  desc?: string;
  status?: 'success' | 'warning' | 'error' | 'default';
}

interface ComponentBlockConfig {
  title?: string;
  description?: string;
  type?: 'stat' | 'list' | 'badge';
  items?: ComponentItemConfig[];
}

const parseJson = <T,>(raw: string): T | null => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const renderStreamingPlaceholder = (text: string, className?: string) => (
  <div className={cn('rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500', className)}>
    {text}
  </div>
);

const normalizeOptions = (options?: Array<FormFieldOption | string | number>) => {
  if (!options) return [] as FormFieldOption[];
  return options.map((item) =>
    typeof item === 'string' || typeof item === 'number'
      ? { label: String(item), value: item }
      : item
  );
};

const FieldValuePreview: React.FC<{ field: FormFieldConfig }> = ({ field }) => {
  const type = field.type ?? 'input';
  const placeholder = field.placeholder ?? '';
  const value = field.value;
  const sharedClass = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600';

  if (type === 'textarea') {
    return (
      <textarea
        className={cn(sharedClass, 'min-h-[70px]')}
        placeholder={placeholder}
        value={value ? String(value) : ''}
        readOnly
      />
    );
  }

  if (type === 'select') {
    const options = normalizeOptions(field.options);
    return (
      <select className={sharedClass} value={value ? String(value) : ''} disabled>
        <option value="">{placeholder || '请选择'}</option>
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (type === 'switch') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <input type="checkbox" checked={Boolean(value)} disabled />
        <span>{Boolean(value) ? '开启' : '关闭'}</span>
      </div>
    );
  }

  const inputType = type === 'number' ? 'number' : type === 'date' ? 'date' : 'text';

  return (
    <input
      type={inputType}
      className={sharedClass}
      placeholder={placeholder}
      value={value ? String(value) : ''}
      readOnly
    />
  );
};

export const AgentPreviewFormBlock: React.FC<{
  raw: string;
  className?: string;
  isStreaming?: boolean; // 流式阶段用于占位，避免解析中途闪烁报错
}> = ({ raw, className, isStreaming = false }) => {
  const config = parseJson<FormBlockConfig>(raw);
  const fields = config?.fields ?? [];

  if (!config || fields.length === 0) {
    if (isStreaming) {
      return renderStreamingPlaceholder('表单生成中...', className);
    }
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600', className)}>
        自定义表单解析失败，请检查 JSON 是否包含 fields
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-3', className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-800">{config.title || '自定义表单'}</div>
          {config.description ? (
            <div className="mt-1 text-xs text-gray-500">{config.description}</div>
          ) : null}
        </div>
        <AgentPreviewCopyButton text={raw} label="复制 JSON" copiedLabel="已复制" className="border-gray-200 text-gray-500" />
      </div>
      <div className="mt-3 space-y-3">
        {fields.map((field, index) => (
          <div key={`form-field-${index}`}>
            <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
              <span>{field.label}</span>
              {field.required ? <span className="text-red-500">*</span> : null}
            </div>
            <FieldValuePreview field={field} />
          </div>
        ))}
      </div>
    </div>
  );
};

const getStatusColor = (status?: ComponentItemConfig['status']) => {
  switch (status) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700';
    case 'warning':
      return 'bg-amber-50 text-amber-700';
    case 'error':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export const AgentPreviewComponentBlock: React.FC<{
  raw: string;
  className?: string;
  isStreaming?: boolean; // 流式阶段用于占位，避免解析中途闪烁报错
}> = ({ raw, className, isStreaming = false }) => {
  const config = parseJson<ComponentBlockConfig>(raw);
  const items = config?.items ?? [];
  const type = config?.type ?? 'stat';

  if (!config || items.length === 0) {
    if (isStreaming) {
      return renderStreamingPlaceholder('组件生成中...', className);
    }
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600', className)}>
        自定义组件解析失败，请检查 JSON 是否包含 items
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-3', className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-800">{config.title || '自定义组件'}</div>
          {config.description ? (
            <div className="mt-1 text-xs text-gray-500">{config.description}</div>
          ) : null}
        </div>
        <AgentPreviewCopyButton text={raw} label="复制 JSON" copiedLabel="已复制" className="border-gray-200 text-gray-500" />
      </div>

      {type === 'badge' ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`badge-${index}`}
              className={cn('rounded-full px-3 py-1 text-xs', getStatusColor(item.status))}
            >
              {item.label}
            </span>
          ))}
        </div>
      ) : type === 'list' ? (
        <div className="mt-3 space-y-2">
          {items.map((item, index) => (
            <div key={`list-${index}`} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <div className="text-xs font-semibold text-gray-700">{item.label}</div>
              {item.desc ? <div className="mt-1 text-xs text-gray-500">{item.desc}</div> : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => (
            <div key={`stat-${index}`} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="mt-1 text-base font-semibold text-gray-800">{item.value ?? '-'}</div>
              {item.desc ? <div className="mt-1 text-xs text-gray-500">{item.desc}</div> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};