'use client';

import React from 'react';
import { Button, Input } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { useAgentDraftStore } from '@/stores/agentDraftStore';
import { cn } from '@/lib/utils';
import {
  DEFAULT_OPENING_STATEMENT,
  DEFAULT_SUGGESTED_QUESTIONS,
  getFallbackSuggestedQuestions,
  MAX_SUGGESTED_QUESTIONS,
} from './agentConversationDefaults';

const { TextArea } = Input;

interface AgentConversationPanelProps {
  className?: string;
}

export const AgentConversationPanel: React.FC<AgentConversationPanelProps> = ({ className }) => {
  const draft = useAgentDraftStore.use.draft();
  const updateDraft = useAgentDraftStore.use.updateDraft();

  // 未配置时使用默认值，并保证推荐问数量不超上限。
  const questions = draft.conversation.suggestedQuestions.length
    ? draft.conversation.suggestedQuestions.slice(0, MAX_SUGGESTED_QUESTIONS)
    : getFallbackSuggestedQuestions();

  // 基础数组用于增删改，保持可控并限制数量。
  const getBaseQuestions = () =>
    draft.conversation.suggestedQuestions.length
      ? [...draft.conversation.suggestedQuestions].slice(0, MAX_SUGGESTED_QUESTIONS)
      : getFallbackSuggestedQuestions();
  // 达到上限时禁用“添加”按钮。
  const isAddDisabled = questions.length >= MAX_SUGGESTED_QUESTIONS;

  const handleOpeningChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDraft({
      conversation: {
        ...draft.conversation,
        openingStatement: event.target.value,
      },
    });
  };

  const handleQuestionChange = (index: number, value: string) => {
    const base = getBaseQuestions();
    base[index] = value;
    // 写回时仍保持数量上限，避免超出设计。
    updateDraft({
      conversation: {
        ...draft.conversation,
        suggestedQuestions: base.slice(0, MAX_SUGGESTED_QUESTIONS),
      },
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const base = getBaseQuestions();
    base.splice(index, 1);
    // 删除后继续截断，保持一致性。
    updateDraft({
      conversation: {
        ...draft.conversation,
        suggestedQuestions: base.slice(0, MAX_SUGGESTED_QUESTIONS),
      },
    });
  };

  const handleAddQuestion = () => {
    const base = getBaseQuestions();
    // 超过上限时直接返回，防止无效更新。
    if (base.length >= MAX_SUGGESTED_QUESTIONS) {
      return;
    }
    base.push('');
    updateDraft({
      conversation: {
        ...draft.conversation,
        suggestedQuestions: base.slice(0, MAX_SUGGESTED_QUESTIONS),
      },
    });
  };

  return (
    <section className={cn('rounded-2xl border border-gray-200 bg-white p-4 space-y-4', className)}>
      <h3 className="text-sm font-semibold text-gray-900">对话</h3>

      <div className="space-y-2">
        <span className="text-xs text-gray-500">开场白</span>
        <TextArea
          value={draft.conversation.openingStatement}
          onChange={handleOpeningChange}
          placeholder={DEFAULT_OPENING_STATEMENT}
          autoSize={{ minRows: 4, maxRows: 6 }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">推荐问</span>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddQuestion}
            disabled={isAddDisabled}
          >
            添加
          </Button>
        </div>
        <div className="space-y-2">
          {questions.map((question, index) => (
            <div key={`question-${index}`} className="flex items-center gap-2">
              <Input
                value={question}
                onChange={(event) => handleQuestionChange(index, event.target.value)}
                placeholder={DEFAULT_SUGGESTED_QUESTIONS[index] || '新增推荐问题'}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleRemoveQuestion(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};