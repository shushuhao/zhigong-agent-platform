// components/plugins/PluginCard.tsx

'use client';

import React from 'react';
import type { PluginMarketItem } from '@/lib/types/plugin';

interface PluginCardProps {
  item: PluginMarketItem;
}

const typeLabelMap: Record<PluginMarketItem['type'], string> = {
  plugin: '插件',
  mcp: 'MCP工具',
};

const typeBadgeClassMap: Record<PluginMarketItem['type'], string> = {
  plugin: 'bg-indigo-100 text-indigo-600',
  mcp: 'bg-sky-100 text-sky-600',
};

export const PluginCard: React.FC<PluginCardProps> = ({ item }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium ${
          typeBadgeClassMap[item.type]
        }`}
      >
        {typeLabelMap[item.type]}
      </span>

      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
          style={{ backgroundColor: item.iconBg }}
        >
          {item.icon}
        </div>
        <div className="min-w-0">
          <div className="text-base font-semibold text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">{item.owner}</div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-gray-600">{item.description}</p>

      {item.tags && item.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};