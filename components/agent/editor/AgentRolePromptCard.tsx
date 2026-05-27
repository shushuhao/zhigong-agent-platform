'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, message } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useAgentDraftStore } from '@/stores/agentDraftStore';
import type { AgentDraft } from '@/lib/types/agent';
import { cn } from '@/lib/utils';
import { AgentPromptOptimizeModal } from './AgentPromptOptimizeModal';
import { AgentPromptTemplateDrawer } from './AgentPromptTemplateDrawer';
import { AGENT_PROMPT_TEMPLATES } from './agentPromptTemplates';

const { TextArea } = Input;

interface AgentRolePromptCardProps {
  className?: string;
}

const buildOptimizedPrompt = (draft: AgentDraft) => {
  const name = draft.name.trim() || '智能体';
  const description = draft.description.trim();
  const basePrompt = draft.rolePrompt.trim();
  const intro = description ? `你是${name}，${description}` : `你是${name}。`;

  const sections = [
    '# 角色定位',
    intro,
    '# 核心目标',
    '- 明确用户需求并给出可执行建议',
    '- 结论先行，确保答案结构清晰',
    '# 输出规范',
    '- 使用要点列表或步骤清单',
    '- 关键信息加粗强调',
    '# 边界约束',
    '- 避免臆测未知信息，必要时先提问',
    '- 涉及高风险领域时提示用户寻求专业意见',
  ];

  if (basePrompt) {
    sections.push('# 原始指令补充', basePrompt);
  }

  return sections.join('\n\n');
};

export const AgentRolePromptCard: React.FC<AgentRolePromptCardProps> = ({ className }) => {
  const draft = useAgentDraftStore.use.draft();
  const updateDraft = useAgentDraftStore.use.updateDraft();
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState(
    AGENT_PROMPT_TEMPLATES[0]?.id ?? ''
  );
  const optimizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDraft({ rolePrompt: event.target.value });
  };

  useEffect(() => {
    return () => {
      if (optimizeTimerRef.current) {
        clearTimeout(optimizeTimerRef.current);
      }
    };
  }, []);

  const handleOpenOptimize = () => {
    if (isOptimizing) return;
    const nextPrompt = buildOptimizedPrompt(draft);
    const messageKey = 'agent-role-optimize';
    setIsOptimizing(true);
    message.loading({ content: '正在优化角色指令...', key: messageKey });
    optimizeTimerRef.current = setTimeout(() => {
      setOptimizedPrompt(nextPrompt);
      setIsOptimizeOpen(true);
      setIsOptimizing(false);
      message.success({ content: '已生成优化版本', key: messageKey });
    }, 700);
  };

  const handleApplyOptimized = (prompt: string) => {
    updateDraft({ rolePrompt: prompt });
    setIsOptimizeOpen(false);
  };

  const handleApplyTemplate = (templateId: string) => {
    const selected = AGENT_PROMPT_TEMPLATES.find((item) => item.id === templateId);
    if (!selected) return;
    updateDraft({ rolePrompt: selected.content });
    setIsTemplateOpen(false);
    message.success('已应用模板');
  };

  return (
    <section className={cn('rounded-2xl border border-gray-200 bg-white p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">角色指令</h3>
        <div className="flex items-center gap-2">
          <Button type="link" icon={<AppstoreOutlined />} loading={isOptimizing} onClick={handleOpenOptimize}>
            优化
          </Button>
          <Button type="link" icon={<AppstoreOutlined />} onClick={() => setIsTemplateOpen(true)}>
            模板
          </Button>
        </div>
      </div>
      <TextArea
        value={draft.rolePrompt}
        onChange={handlePromptChange}
        placeholder="描述智能体的角色、能力边界、输出规范等"
        autoSize={{ minRows: 8, maxRows: 14 }}
      />

      <AgentPromptOptimizeModal
        open={isOptimizeOpen}
        prompt={optimizedPrompt}
        onCancel={() => setIsOptimizeOpen(false)}
        onApply={handleApplyOptimized}
      />

      <AgentPromptTemplateDrawer
        open={isTemplateOpen}
        templates={AGENT_PROMPT_TEMPLATES}
        activeTemplateId={activeTemplateId}
        onClose={() => setIsTemplateOpen(false)}
        onSelect={setActiveTemplateId}
        onApply={(template) => handleApplyTemplate(template.id)}
      />
    </section>
  );
};