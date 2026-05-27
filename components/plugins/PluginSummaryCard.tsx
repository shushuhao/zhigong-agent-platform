// components/plugins/PluginSummaryCard.tsx

'use client';

import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { PluginDetail } from '@/lib/types/plugin';

const typeLabelMap: Record<PluginDetail['type'], string> = {
  plugin: '插件',
  mcp: 'MCP工具',
};

const typeBadgeClassMap: Record<PluginDetail['type'], string> = {
  plugin: 'bg-indigo-100 text-indigo-600',
  mcp: 'bg-sky-100 text-sky-600',
};

interface PluginSummaryCardProps {
  detail: PluginDetail;
}

export const PluginSummaryCard: React.FC<PluginSummaryCardProps> = ({ detail }) => {
  const router = useRouter();
  const metaItems = detail.meta.filter((item) => item.label !== '类型');

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="mb-6 px-0 text-gray-600"
        onClick={() => router.push('/plugins/market')}
      >
        返回
      </Button>

      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl"
          style={{ backgroundColor: detail.iconBg }}
        >
          {detail.icon}
        </div>
        <div className="mt-4 text-3xl font-semibold text-gray-900">{detail.name}</div>
        <div className="mt-2 text-sm text-gray-500">{detail.description}</div>
      </div>

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <span>类型</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              typeBadgeClassMap[detail.type]
            }`}
          >
            {typeLabelMap[detail.type]}
          </span>
        </div>
        {metaItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-gray-600">
            <span>{item.label}</span>
            <span className="text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};