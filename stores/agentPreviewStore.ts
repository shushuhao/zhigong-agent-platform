import { create } from 'zustand';
import type {
  AgentPreviewDebugEvent,
  AgentPreviewMessage,
  AgentPreviewMessageStatus,
  AgentPreviewRole,
} from '@/lib/types/agent';
import { stringUtils } from '@/lib/utils';
import { createSelectors } from '@/lib/stores/createSelectors';

interface AgentPreviewState {
  messages: AgentPreviewMessage[];
  input: string;
  isStreaming: boolean;
  streamingMessageId: string | null;
  lastUserMessage: string | null;
  lastError: string | null;
  debugEvents: AgentPreviewDebugEvent[];
  setInput: (value: string) => void;
  setStreaming: (streaming: boolean) => void;
  appendMessage: (message: AgentPreviewMessage) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  startStreaming: (initialContent?: string) => string;
  appendStreamContent: (chunk: string) => void;
  appendStreamThought: (chunk: string) => void;
  finishStreaming: () => void;
  stopStreaming: () => void;
  setLastUserMessage: (content: string) => void;
  setError: (error: string) => void;
  clearError: () => void;
  addDebugEvent: (event: AgentPreviewDebugEvent) => void;
  clearDebugEvents: () => void;
  clearMessages: () => void;
  resetPreview: () => void;
}

const createMessage = (
  role: AgentPreviewRole,
  content: string,
  status: AgentPreviewMessageStatus = 'done',
  thoughts?: string
): AgentPreviewMessage => ({
  id: `msg_${Date.now()}_${stringUtils.random(6)}`,
  role,
  content,
  thoughts,
  status,
  createdAt: new Date().toISOString(),
});

const MAX_DEBUG_EVENTS = 50;

const initialState = {
  messages: [] as AgentPreviewMessage[],
  input: '',
  isStreaming: false,
  streamingMessageId: null as string | null,
  lastUserMessage: null as string | null,
  lastError: null as string | null,
  debugEvents: [] as AgentPreviewDebugEvent[],
};

const useAgentPreviewStoreBase = create<AgentPreviewState>((set) => ({
  ...initialState,
  setInput: (input) => set({ input }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  appendMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  addUserMessage: (content) =>
    set((state) => ({
      messages: [...state.messages, createMessage('user', content)],
    })),
  addAssistantMessage: (content) =>
    set((state) => ({
      messages: [...state.messages, createMessage('assistant', content)],
    })),
  startStreaming: (initialContent = '') => {
    const message = createMessage('assistant', initialContent, 'streaming');
    set((state) => ({
      messages: [...state.messages, message],
      isStreaming: true,
      streamingMessageId: message.id,
    }));
    return message.id;
  },
  appendStreamContent: (chunk) =>
    set((state) => {
      if (!state.streamingMessageId) return state;
      return {
        messages: state.messages.map((message) =>
          message.id === state.streamingMessageId
            ? {
                ...message,
                content: `${message.content}${chunk}`,
                status: 'streaming',
              }
            : message
        ),
      };
    }),
  appendStreamThought: (chunk) =>
    set((state) => {
      if (!state.streamingMessageId) return state;
      return {
        messages: state.messages.map((message) =>
          message.id === state.streamingMessageId
            ? {
                ...message,
                thoughts: `${message.thoughts ?? ''}${chunk}`,
                status: 'streaming',
              }
            : message
        ),
      };
    }),
  finishStreaming: () =>
    set((state) => ({
      isStreaming: false,
      streamingMessageId: null,
      messages: state.messages.map((message) =>
        message.status === 'streaming' ? { ...message, status: 'done' } : message
      ),
    })),
  stopStreaming: () =>
    set((state) => ({
      isStreaming: false,
      streamingMessageId: null,
      messages: state.messages.map((message) =>
        message.status === 'streaming' ? { ...message, status: 'stopped' } : message
      ),
    })),
  setLastUserMessage: (content) => set({ lastUserMessage: content }),
  setError: (error) =>
    set((state) => ({
      lastError: error,
      isStreaming: false,
      streamingMessageId: null,
      messages: state.messages.map((message) =>
        message.status === 'streaming' ? { ...message, status: 'error' } : message
      ),
    })),
  clearError: () => set({ lastError: null }),
  addDebugEvent: (event) =>
    set((state) => ({
      debugEvents: [event, ...state.debugEvents].slice(0, MAX_DEBUG_EVENTS),
    })),
  clearDebugEvents: () => set({ debugEvents: [] }),
  clearMessages: () => set({ messages: [], streamingMessageId: null, isStreaming: false }),
  resetPreview: () => set(initialState),
}));

export const useAgentPreviewStore = createSelectors(useAgentPreviewStoreBase);