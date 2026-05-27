'use client';

import React from 'react';
import { Button, Drawer, Tag, Typography } from 'antd';
import { cn } from '@/lib/utils';
import type { AgentPromptTemplate } from './agentPromptTemplates';

const { Text } = Typography;

interface AgentPromptTemplateDrawerProps {
  open: boolean;
  templates: AgentPromptTemplate[];
  activeTemplateId: string;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  onApply: (template: AgentPromptTemplate) => void;
}

export const AgentPromptTemplateDrawer: React.FC<AgentPromptTemplateDrawerProps> = ({
  open,
  templates,
  activeTemplateId,
  onClose,
  onSelect,
  onApply,
}) => {
  const activeTemplate = templates.find((item) => item.id === activeTemplateId);

  return (
    <Drawer
      title="选择角色指令模板"
      open={open}
      onClose={onClose}
      width={420}
      destroyOnHidden
      styles={{ body: { padding: 16 } }}
    >
      <div className="flex h-full flex-col">
        <div className="space-y-2">
          {templates.map((template) => {
            const isActive = template.id === activeTemplateId;
            return (
              <button
                type="button"
                key={template.id}
                onClick={() => onSelect(template.id)}
                className={cn(
                  'w-full rounded-xl border px-3 py-2 text-left transition',
                  isActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{template.title}</span>
                  <div className="flex flex-wrap gap-1">
                    {(template.tags ?? []).map((tag) => (
                      <Tag key={`${template.id}-${tag}`} color="blue" className="m-0">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">{template.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex-1 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
          <Text className="text-xs text-gray-500">模板预览</Text>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700">
            {activeTemplate?.content ?? '请选择一个模板'}
          </pre>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            disabled={!activeTemplate}
            onClick={() => activeTemplate && onApply(activeTemplate)}
          >
            使用模板
          </Button>
        </div>
      </div>
    </Drawer>
  );
};