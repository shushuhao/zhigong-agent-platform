'use client';

import React from 'react';
import { Button, Tag } from 'antd';
import { useAgentDraftStore } from '@/stores/agentDraftStore';
import { AgentLogo } from './AgentLogo';
import { useAgentPreviewStore } from '@/stores/agentPreviewStore';
import {
  DEFAULT_OPENING_STATEMENT,
  normalizeSuggestedQuestions,
} from './agentConversationDefaults';
import { useAgentPreviewSession } from '@/lib/hooks/useAgentPreviewSession';
import { AgentPreviewComposer } from './AgentPreviewComposer';
import { AgentPreviewMessageList } from './AgentPreviewMessageList';

export const AgentPreviewPanel: React.FC = () => {
  const draft = useAgentDraftStore.use.draft();
  const messages = useAgentPreviewStore.use.messages();
  const { input, isStreaming, setInput, sendMessage, quickAsk, resetSession } =
    useAgentPreviewSession();
  const displayName = draft.name || '智能体名称';
  const displayDescription = draft.description || '在这里展示智能体定位与能力边界';
  // 预览区默认值与编辑区保持一致。
  const openingStatement = draft.conversation.openingStatement || DEFAULT_OPENING_STATEMENT;
  // 过滤空值并限制数量，保证预览稳定。
  const suggestedQuestions = normalizeSuggestedQuestions(draft.conversation.suggestedQuestions);
  // 有对话内容时，只展示消息列表与输入区。
  const hasConversation = messages.length > 0 || isStreaming;

  const handleSend = () => {
    sendMessage();
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">预览与调试</h2>
          <Tag color="blue" className="m-0">
            对话预览
          </Tag>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Button type="text" size="small" onClick={resetSession}>
            清空对话
          </Button>
          <span>调试模式</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto mt-4 space-y-3">
        {hasConversation ? (
          <AgentPreviewMessageList messages={messages} isStreaming={isStreaming} />
        ) : (
          <>
            <div className="rounded-2xl border border-gray-200 p-4 text-center">
              <AgentLogo
                logo={draft.logo}
                name={draft.name}
                className="w-16 h-16 rounded-2xl bg-blue-50 mx-auto overflow-hidden"
                textClassName="text-xl font-semibold text-blue-500"
              />
              <h3 className="mt-3 text-base font-semibold text-gray-900">{displayName}</h3>
              <p className="text-xs text-gray-500 mt-1">{displayDescription}</p>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-600 space-y-2">
                <p>{openingStatement}</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-gray-500">
                  {suggestedQuestions.slice(0, 4).map((question, index) => (
                    <li key={`preview-question-${index}`}>{question}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="space-y-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={`preview-chip-${index}`}
                  block
                  className="text-left justify-start"
                  type="default"
                  onClick={() => quickAsk(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      <AgentPreviewComposer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={!input.trim()}
        isStreaming={isStreaming}
      />
    </section>
  );
};