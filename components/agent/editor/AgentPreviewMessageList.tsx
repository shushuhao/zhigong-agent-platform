'use client';

import React from 'react';
import { Button } from 'antd';
import type { AgentPreviewMessage } from '@/lib/types/agent';
import { cn } from '@/lib/utils';
import { AgentPreviewMessageContent } from './AgentPreviewMessageContent';

interface AgentPreviewMessageListProps {
  messages: AgentPreviewMessage[];
  isStreaming: boolean; // 全局流式状态，用于展示回复中占位
  error?: string | null;
  onRetry?: () => void;
}

const getBubbleClasses = (role: AgentPreviewMessage['role']) =>
  role === 'user'
    ? 'bg-blue-50 text-blue-700'
    : 'bg-gray-100 text-gray-700';

const getAlignClasses = () => 'justify-start';

const getBubbleSizeClasses = (role: AgentPreviewMessage['role']) =>
  role === 'assistant' ? 'w-full max-w-full' : 'max-w-[70%]';

const getThoughtStatusLabel = (status?: AgentPreviewMessage['status']) => {
  switch (status) {
    case 'streaming':
      return '思考中';
    case 'stopped':
      return '思考已终止';
    case 'error':
      return '思考异常';
    default:
      return '思考完成';
  }
};

const getThoughtStatusDotClass = (status?: AgentPreviewMessage['status']) => {
  switch (status) {
    case 'streaming':
      return 'bg-blue-500';
    case 'stopped':
      return 'bg-orange-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-emerald-500';
  }
};

export const AgentPreviewMessageList: React.FC<AgentPreviewMessageListProps> = ({
  messages,
  isStreaming,
  error,
  onRetry,
}) => {
  const hasStreamingMessage = messages.some((message) => message.status === 'streaming');

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-6 text-center text-xs text-gray-400">
        暂无对话记录，先从推荐问开始吧
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => {
        const shouldShowThought =
          message.role === 'assistant' &&
          (Boolean(message.thoughts) || Boolean(message.status));
        const thoughtContent =
          message.thoughts?.trim() ||
          (message.status === 'streaming' ? '思考中...' : '暂无思考内容');

        return (
          <div key={message.id} className={cn('flex', getAlignClasses())}>
            <div
              className={cn(
                'space-y-2 rounded-xl px-3 py-2 text-sm',
                getBubbleClasses(message.role),
                getBubbleSizeClasses(message.role)
              )}
            >
              {shouldShowThought ? (
                <div className="rounded-lg border border-gray-200 bg-white/70 px-2 py-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span
                      className={cn(
                        'inline-flex h-2 w-2 rounded-full',
                        getThoughtStatusDotClass(message.status)
                      )}
                    />
                    <span>{getThoughtStatusLabel(message.status)}</span>
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">{thoughtContent}</div>
                </div>
              ) : null}

              {message.role === 'assistant' ? (
                <AgentPreviewMessageContent
                  content={message.content}
                  isStreaming={message.status === 'streaming'}
                />
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}

              {message.status === 'stopped' ? (
                <div className="text-[11px] text-gray-500">已终止回复</div>
              ) : null}
              {message.status === 'error' ? (
                <div className="text-[11px] text-red-500">回复异常</div>
              ) : null}
            </div>
          </div>
        );
      })}

      {isStreaming && !hasStreamingMessage ? (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-500">
            AI 正在回复中...
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          <div className="flex items-center justify-between gap-2">
            <span>发生错误：{error}</span>
            {onRetry ? (
              <Button type="text" size="small" onClick={onRetry}>
                重试
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};