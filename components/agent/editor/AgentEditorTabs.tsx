// components/agent/editor/AgentEditorTabs.tsx
'use client';

import React from 'react';
import { Tabs } from 'antd';
import type { AgentEditorTabKey } from '@/lib/types/agent';

interface AgentEditorTabsProps {
  activeTab: AgentEditorTabKey;
  onChange: (key: AgentEditorTabKey) => void;
  className?: string;
}

export const AgentEditorTabs: React.FC<AgentEditorTabsProps> = ({
  activeTab,
  onChange,
  className,
}) => {
  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => onChange(key as AgentEditorTabKey)}
      items={[
        { key: 'config', label: '应用配置' },
        { key: 'tuning', label: '干预调优' },
      ]}
      centered
      className={className}
      tabBarStyle={{ margin: 0 }}
    />
  );
};