export type AgentStatus = 'draft' | 'published' | 'offline';

export type AgentEditorTabKey = 'config' | 'tuning';

export type AgentModelId = 'deepseek-r1' | 'gpt-4o' | 'claude-3.5';

export type AgentPreviewRole = 'user' | 'assistant' | 'system';

export type AgentPreviewMessageStatus = 'streaming' | 'done' | 'stopped' | 'error';

export interface AgentAbilityRef {
  id: string;
  name: string;
}

export interface AgentAbilities {
  knowledgeBases: AgentAbilityRef[];
  workflows: AgentAbilityRef[];
}

export interface AgentConversationConfig {
  openingStatement: string;
  suggestedQuestions: string[];
}

export interface AgentDraft {
  id: string | null;
  name: string;
  description: string;
  logo: string;
  status: AgentStatus;
  modelId: AgentModelId;
  rolePrompt: string;
  abilities: AgentAbilities;
  conversation: AgentConversationConfig;
  updatedAt: string | null;
}

export interface AgentPreviewMessage {
  id: string;
  role: AgentPreviewRole;
  content: string;
  createdAt: string;
  thoughts?: string;
  status?: AgentPreviewMessageStatus;
}

export type AgentPreviewDebugEventType =
  | 'request'
  | 'chunk'
  | 'thought'
  | 'done'
  | 'error'
  | 'abort'
  | 'retry';

export interface AgentPreviewDebugEvent {
  id: string;
  type: AgentPreviewDebugEventType;
  message: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}


/**
 * 智能体完整数据（保存到列表中）
 * 与 AgentDraft 的区别：
 * 1. id 必须存在
 * 2. 多了 createdAt 字段
 */
export interface Agent {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: AgentStatus;
  modelId: AgentModelId;
  rolePrompt: string;
  abilities: AgentAbilities;
  conversation: AgentConversationConfig;
  createdAt: string;
  updatedAt: string;
}

/**
 * 将 AgentDraft 转换为 Agent
 * 用于发布或保存时
 */
export const draftToAgent = (draft: AgentDraft, existingAgent?: Agent): Agent => {
  const now = new Date().toISOString();
  return {
    id: draft.id || `agent_${Date.now()}`,
    name: draft.name,
    description: draft.description,
    logo: draft.logo,
    status: draft.status,
    modelId: draft.modelId,
    rolePrompt: draft.rolePrompt,
    abilities: draft.abilities,
    conversation: draft.conversation,
    createdAt: existingAgent?.createdAt || now,
    updatedAt: now,
  };
};

/**
 * 将 Agent 转换为 AgentDraft
 * 用于编辑时加载数据
 */
export const agentToDraft = (agent: Agent): AgentDraft => ({
  id: agent.id,
  name: agent.name,
  description: agent.description,
  logo: agent.logo,
  status: agent.status,
  modelId: agent.modelId,
  rolePrompt: agent.rolePrompt,
  abilities: agent.abilities,
  conversation: agent.conversation,
  updatedAt: agent.updatedAt,
});