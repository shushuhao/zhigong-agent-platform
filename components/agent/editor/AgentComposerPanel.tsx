'use client';

import React from 'react';
import { Select } from 'antd';
import type { AgentModelId } from '@/lib/types/agent';
import { useAgentDraftStore } from '@/stores/agentDraftStore';
import { AgentAbilityPanel } from './AgentAbilityPanel';
import { AgentBaseInfoCard } from './AgentBaseInfoCard';
import { AgentConversationPanel } from './AgentConversationPanel';
import { AgentRolePromptCard } from './AgentRolePromptCard';

const MODEL_OPTIONS: Array<{ label: string; value: AgentModelId }> = [
  { label: 'DeepSeek-R1', value: 'deepseek-r1' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'Claude 3.5', value: 'claude-3.5' },
];

export const AgentComposerPanel: React.FC = () => {
  const draft = useAgentDraftStore.use.draft();
  const updateDraft = useAgentDraftStore.use.updateDraft();

  const handleModelChange = (value: AgentModelId) => {
    updateDraft({ modelId: value });
  };

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <h2 className="text-base font-semibold text-gray-900">编排</h2>
        <Select
          size="small"
          className="w-48"
          value={draft.modelId}
          options={MODEL_OPTIONS}
          onChange={handleModelChange}
        />
      </div>

      <div className="grid flex-1 min-h-0 gap-3  lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="min-h-0 overflow-auto">
          <div className=" bg-white divide-y divide-gray-100 overflow-hidden">
            <AgentBaseInfoCard className="border-0 rounded-none bg-transparent" />
            <AgentRolePromptCard className="border-0 rounded-none bg-transparent" />
          </div>
        </div>
        <div className="min-h-0 overflow-auto">
          <div className=" bg-white divide-y divide-gray-100 overflow-hidden">
            <AgentAbilityPanel className="border-0 rounded-none bg-transparent" />
            <AgentConversationPanel className="border-0 rounded-none bg-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};
