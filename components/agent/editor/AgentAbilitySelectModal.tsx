'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, Modal, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { AgentAbilityRef } from '@/lib/types/agent';
import { cn } from '@/lib/utils';

export interface AgentAbilityOption {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

interface AgentAbilitySelectModalProps {
  open: boolean;
  title: string;
  description: string;
  options: AgentAbilityOption[];
  selected: AgentAbilityRef[];
  onApply: (nextSelected: AgentAbilityRef[]) => void;
  onClose: () => void;
}

export const AgentAbilitySelectModal: React.FC<AgentAbilitySelectModalProps> = ({
  open,
  title,
  description,
  options,
  selected,
  onApply,
  onClose,
}) => {
  // Local state inside the modal (search query + temporary selection).
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sync selected ids from parent when the modal opens.
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIds(selected.map((item) => item.id));
    }
  }, [open, selected]);

  // Quick lookup for selection state in the list.
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Filter by name/description/tags for the search box.
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => {
      const haystack = [option.name, option.description ?? '', ...(option.tags ?? [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [options, query]);

  // Toggle selection without mutating global store.
  const handleToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Clear all selections in the modal.
  const handleClear = () => {
    setSelectedIds([]);
  };

  // Map selected ids back to {id, name} for the parent store.
  const handleApply = () => {
    const optionMap = new Map(options.map((option) => [option.id, option]));
    const nextSelected = selectedIds
      .map((id) => optionMap.get(id))
      .filter((option): option is AgentAbilityOption => Boolean(option))
      .map((option) => ({ id: option.id, name: option.name }));
    onApply(nextSelected);
    onClose();
  };

  // Modal layout: search, selectable list, and selection summary.
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleApply}
      okText="确认"
      cancelText="取消"
      title={title}
      width={720}
      destroyOnClose
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">{description}</p>

        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索名称、描述或标签"
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
          />
          <Button onClick={handleClear} disabled={selectedIds.length === 0}>
            清空
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
          {filteredOptions.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配结果" />
          ) : (
            <div className="space-y-2">
              {filteredOptions.map((option) => {
                const checked = selectedIdSet.has(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleToggle(option.id)}
                    className={cn(
                      'w-full rounded-xl border bg-white px-3 py-2 text-left transition',
                      checked
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{option.name}</span>
                          {(option.tags ?? []).map((tag) => (
                            <Tag key={`${option.id}-${tag}`} color="blue" className="m-0">
                              {tag}
                            </Tag>
                          ))}
                        </div>
                        {option.description ? (
                          <p className="mt-1 text-xs text-gray-500">{option.description}</p>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-semibold',
                          checked ? 'text-blue-600' : 'text-gray-400'
                        )}
                      >
                        {checked ? '已选择' : '选择'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>已选择 {selectedIds.length} 项</span>
          <span>支持多选，点击卡片即可切换</span>
        </div>
      </div>
    </Modal>
  );
};