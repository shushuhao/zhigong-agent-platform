'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAgentPreviewStore } from '@/stores/agentPreviewStore';

const SSE_ENDPOINT = '/api/agent/preview/stream';

const parseEventData = (event: MessageEvent<string>) => {
  if (!event?.data) return {} as Record<string, unknown>;
  try {
    return JSON.parse(event.data) as Record<string, unknown>;
  } catch {
    return { message: event.data } as Record<string, unknown>;
  }
};

export const useAgentPreviewSession = () => {
  const input = useAgentPreviewStore.use.input();
  const isStreaming = useAgentPreviewStore.use.isStreaming();
  const lastUserMessage = useAgentPreviewStore.use.lastUserMessage();
  const lastError = useAgentPreviewStore.use.lastError();
  const setInput = useAgentPreviewStore.use.setInput();
  const setStreaming = useAgentPreviewStore.use.setStreaming();
  const addUserMessage = useAgentPreviewStore.use.addUserMessage();
  const startStreaming = useAgentPreviewStore.use.startStreaming();
  const appendStreamContent = useAgentPreviewStore.use.appendStreamContent();
  const appendStreamThought = useAgentPreviewStore.use.appendStreamThought();
  const finishStreaming = useAgentPreviewStore.use.finishStreaming();
  const stopStreaming = useAgentPreviewStore.use.stopStreaming();
  const setLastUserMessage = useAgentPreviewStore.use.setLastUserMessage();
  const setError = useAgentPreviewStore.use.setError();
  const clearError = useAgentPreviewStore.use.clearError();
  const addDebugEvent = useAgentPreviewStore.use.addDebugEvent();
  const clearMessages = useAgentPreviewStore.use.clearMessages();
  const eventSourceRef = useRef<EventSource | null>(null);
  const errorHandledRef = useRef(false);

  const closeEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => () => closeEventSource(), [closeEventSource]);

  const handleStreamingError = useCallback(
    (message?: string) => {
      if (errorHandledRef.current) return;
      errorHandledRef.current = true;
      setError(message || 'SSE 连接异常，请稍后重试');
      addDebugEvent({
        id: `debug_${Date.now()}`,
        type: 'error',
        message: message || 'SSE 连接异常',
        createdAt: new Date().toISOString(),
      });
      closeEventSource();
    },
    [addDebugEvent, closeEventSource, setError]
  );

  const stopStreamingInternal = useCallback(() => {
    if (!isStreaming) return;
    closeEventSource();
    errorHandledRef.current = true;
    stopStreaming();
    addDebugEvent({
      id: `debug_${Date.now()}`,
      type: 'abort',
      message: '用户终止了回复',
      createdAt: new Date().toISOString(),
    });
  }, [addDebugEvent, closeEventSource, isStreaming, stopStreaming]);

  // 发送用户消息并通过 SSE 获取流式回复。
  const sendMessage = useCallback(
    (content?: string) => {
      const nextContent = (content ?? input).trim();
      if (!nextContent || isStreaming) return;

      errorHandledRef.current = false;
      clearError();
      setLastUserMessage(nextContent);
      addDebugEvent({
        id: `debug_${Date.now()}`,
        type: 'request',
        message: '发送用户消息',
        createdAt: new Date().toISOString(),
        payload: { content: nextContent },
      });
      addUserMessage(nextContent);
      setInput('');
      startStreaming();
      closeEventSource();

      const url = `${SSE_ENDPOINT}?message=${encodeURIComponent(nextContent)}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('open', () => {
        addDebugEvent({
          id: `debug_${Date.now()}`,
          type: 'request',
          message: 'SSE 连接已建立',
          createdAt: new Date().toISOString(),
        });
      });

      eventSource.addEventListener('thought', (event) => {
        const data = parseEventData(event as MessageEvent<string>);
        const chunk = (data.chunk as string) ?? '';
        if (!chunk) return;
        appendStreamThought(chunk);
        addDebugEvent({
          id: `debug_${Date.now()}`,
          type: 'thought',
          message: '思考过程片段',
          createdAt: new Date().toISOString(),
          payload: { chunk },
        });
      });

      eventSource.addEventListener('chunk', (event) => {
        const data = parseEventData(event as MessageEvent<string>);
        const chunk = (data.chunk as string) ?? '';
        if (!chunk) return;
        appendStreamContent(chunk);
        addDebugEvent({
          id: `debug_${Date.now()}`,
          type: 'chunk',
          message: '回复内容片段',
          createdAt: new Date().toISOString(),
          payload: { chunk },
        });
      });

      eventSource.addEventListener('done', () => {
        errorHandledRef.current = true;
        finishStreaming();
        addDebugEvent({
          id: `debug_${Date.now()}`,
          type: 'done',
          message: '回复完成',
          createdAt: new Date().toISOString(),
        });
        closeEventSource();
      });

      eventSource.addEventListener('error', (event) => {
        if (event instanceof MessageEvent && event.data) {
          const data = parseEventData(event);
          handleStreamingError((data.message as string) || '服务返回错误');
          return;
        }
        if (eventSource.readyState === EventSource.CLOSED) {
          handleStreamingError('SSE 连接已关闭');
          return;
        }
        handleStreamingError('SSE 连接中断');
      });
    },
    [
      addDebugEvent,
      addUserMessage,
      appendStreamContent,
      appendStreamThought,
      clearError,
      closeEventSource,
      finishStreaming,
      handleStreamingError,
      input,
      isStreaming,
      setInput,
      setLastUserMessage,
      startStreaming,
    ]
  );

  // 快速将推荐问填入输入框。
  const quickAsk = useCallback(
    (question: string) => {
      setInput(question);
    },
    [setInput]
  );

  const retryLast = useCallback(() => {
    if (!lastUserMessage || isStreaming) return;
    addDebugEvent({
      id: `debug_${Date.now()}`,
      type: 'retry',
      message: '重试上一条消息',
      createdAt: new Date().toISOString(),
    });
    sendMessage(lastUserMessage);
  }, [addDebugEvent, isStreaming, lastUserMessage, sendMessage]);

  // 清空会话并关闭 SSE。
  const resetSession = useCallback(() => {
    closeEventSource();
    errorHandledRef.current = true;
    clearMessages();
    setInput('');
    setStreaming(false);
    clearError();
    addDebugEvent({
      id: `debug_${Date.now()}`,
      type: 'abort',
      message: '清空会话',
      createdAt: new Date().toISOString(),
    });
  }, [addDebugEvent, clearError, clearMessages, closeEventSource, setInput, setStreaming]);

  return {
    input,
    isStreaming,
    lastError,
    sendMessage,
    setInput,
    quickAsk,
    resetSession,
    stopStreaming: stopStreamingInternal,
    retryLast,
  };
};