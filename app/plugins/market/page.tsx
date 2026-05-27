// app/plugins/market/page.tsx

/**
 * 插件广场页面
 */
'use client';

import React, { useMemo, useState } from 'react';
import { Empty } from 'antd';
import Link from 'next/link'
import { MainLayout } from '@/components/layouts/MainLayout';
import { PluginFilterBar, type PluginFilterType } from '@/components/plugins/PluginFilterBar';
import { PluginCard } from '@/components/plugins/PluginCard';
import { MOCK_PLUGINS } from '@/lib/services/plugin.mock';

export default function PluginMarketPage() {
  const [activeType, setActiveType] = useState<PluginFilterType>('all');
  const [keyword, setKeyword] = useState('');

  const filteredPlugins = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    return MOCK_PLUGINS.filter((item) => {
      const matchType = activeType === 'all' || item.type === activeType;
      if (!matchType) return false;
      if (!lowerKeyword) return true;
      const haystack = [item.name, item.owner, item.description, ...(item.tags || [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(lowerKeyword);
    });
  }, [activeType, keyword]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-white px-8 py-10">
          <div className="relative z-10">
            <div className="text-3xl font-semibold text-gray-900">工业插件广场，扩展智能体能力</div>
            <div className="mt-2 text-sm text-gray-500">
              汇集设备数据接入、故障代码解析与工业知识检索工具，快速为智能体注入可复用能力。
            </div>
            <div className="mt-6">
              <PluginFilterBar
                activeType={activeType}
                onTypeChange={setActiveType}
                keyword={keyword}
                onKeywordChange={setKeyword}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute right-12 top-10 h-32 w-32 rounded-full border border-blue-100" />
          <div className="pointer-events-none absolute right-6 top-6 h-20 w-20 rounded-full border border-blue-100" />
        </div>

        {filteredPlugins.length === 0 ? (
          <Empty description="暂无匹配的插件" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPlugins.map((item) => (
                <Link key={item.id} href={`/plugins/market/${item.id}`} className="block">
                    <PluginCard item={item} />
                </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}