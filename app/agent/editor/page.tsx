'use client';

import React, { Suspense, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import {
  AgentEditorHeader,
  AgentEditorWorkspace,
} from '@/components/agent/editor';
import { useAgentAutoSave } from '@/lib/hooks/useAgentAutoSave';
import { useAgentUIStore } from '@/stores/agentUIStore';
import { useAgentEditor } from '@/lib/hooks/useAgentEditor';

const AgentEditorContent = () => {
    // 调用 Hook 触发初始化逻辑（加载数据或创建新草稿）
  useAgentEditor();
  useAgentAutoSave();
  const activeTab = useAgentUIStore.use.activeTab();

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyHeight = document.body.style.height;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.height = prevBodyHeight;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.documentElement.style.height = prevHtmlHeight;
    };
  }, []);

  return (
    <MainLayout>
      <div className="h-full flex flex-col overflow-hidden">
        <AgentEditorHeader />
        <div className="flex-1 min-h-0 px-6 py-4 overflow-hidden">
          {activeTab === 'config' ? (
            <AgentEditorWorkspace />
          ) : (
            <div className="h-full rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 flex items-center justify-center">
              调优策略、评测样例与人工干预配置暂未启用。
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

const AgentEditorPage = () => (
  <Suspense
    fallback={
      <MainLayout>
        <div className="h-full flex items-center justify-center text-gray-500">
          加载中...
        </div>
      </MainLayout>
    }
  >
    <AgentEditorContent />
  </Suspense>
);

export default AgentEditorPage;