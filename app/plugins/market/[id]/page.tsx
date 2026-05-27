// app/plugins/market/[id]/page.tsx

/**
 * 插件详情页
 */
'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Empty, Tabs } from 'antd';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PluginSummaryCard } from '@/components/plugins/PluginSummaryCard';
import { PluginIntroPanel } from '@/components/plugins/PluginIntroPanel';
import { McpToolPanel } from '@/components/plugins/McpToolPanel';
import { getMockPluginDetail } from '@/lib/services/plugin.mock';

export default function PluginDetailPage() {
  const params = useParams();
  const pluginId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const detail = useMemo(() => {
    if (!pluginId) return null;
    return getMockPluginDetail(pluginId);
  }, [pluginId]);

  const [activeTab, setActiveTab] = useState<'intro' | 'tools'>('intro');

  if (!detail) {
    return (
      <MainLayout>
        <Empty description="插件不存在或已下架" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <PluginSummaryCard detail={detail} />
        <div className="min-w-0">
          {detail.type === 'mcp' ? (
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as 'intro' | 'tools')}
              items={[
                {
                  key: 'intro',
                  label: '插件介绍',
                  children: <PluginIntroPanel detail={detail} />,
                },
                {
                  key: 'tools',
                  label: '工具列表',
                  children: <McpToolPanel tools={detail.tools || []} />,
                },
              ]}
            />
          ) : (
            <PluginIntroPanel detail={detail} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}