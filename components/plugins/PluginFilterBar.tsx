// components/plugins/PluginFilterBar.tsx

'use client';

import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export type PluginFilterType = 'all' | 'plugin' | 'mcp';

interface PluginFilterBarProps {
  activeType: PluginFilterType;
  onTypeChange: (type: PluginFilterType) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
}

const filterLabels: { key: PluginFilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'plugin', label: '插件' },
  { key: 'mcp', label: 'MCP工具' },
];

export const PluginFilterBar: React.FC<PluginFilterBarProps> = ({
  activeType,
  onTypeChange,
  keyword,
  onKeywordChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {filterLabels.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onTypeChange(item.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeType === item.key
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <Input
        allowClear
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="搜索应用"
        prefix={<SearchOutlined className="text-gray-400" />}
        className="max-w-xs"
      />
    </div>
  );
};