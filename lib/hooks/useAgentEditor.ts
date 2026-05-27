'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { message } from 'antd';
import { useAgentDraftStore } from '@/stores/agentDraftStore';
import { useAgentListStore, INITIAL_MOCK_AGENTS } from '@/stores/agentListStore';
import { draftToAgent } from '@/lib/types/agent';
import type { AgentDraft, Agent } from '@/lib/types/agent';

const getDemoAgentFallback = (agentId: string): Agent | undefined =>
  INITIAL_MOCK_AGENTS.find((item) => item.id === agentId);

const withDemoAbilitiesFallback = (agent: Agent): Agent => {
  const fallback = getDemoAgentFallback(agent.id);
  if (!fallback) return agent;

  const hasKnowledgeBases = agent.abilities.knowledgeBases.length > 0;
  const hasWorkflows = agent.abilities.workflows.length > 0;
  if (hasKnowledgeBases && hasWorkflows) return agent;

  return {
    ...agent,
    abilities: {
      knowledgeBases: hasKnowledgeBases ? agent.abilities.knowledgeBases : fallback.abilities.knowledgeBases,
      workflows: hasWorkflows ? agent.abilities.workflows : fallback.abilities.workflows,
    },
  };
};

/**
 * 校验草稿是否可以发布
 */
const validateDraftForPublish = (draft: AgentDraft): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push('请填写智能体名称');
  }

  if (!draft.description.trim()) {
    errors.push('请填写智能体描述');
  }

  if (!draft.rolePrompt.trim()) {
    errors.push('请填写角色指令');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 校验草稿是否可以保存（比发布宽松）
 */
const validateDraftForSave = (draft: AgentDraft): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push('请填写智能体名称');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const useAgentEditor = () => {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('id');
  
  const draft = useAgentDraftStore.use.draft();
  const isDirty = useAgentDraftStore.use.isDirty();
  const loadFromAgent = useAgentDraftStore.use.loadFromAgent();
  const createNewDraft = useAgentDraftStore.use.createNewDraft();
  const updateDraft = useAgentDraftStore.use.updateDraft();
  const markSaved = useAgentDraftStore.use.markSaved();
  
  const getAgentById = useAgentListStore.use.getAgentById();
  const addAgent = useAgentListStore.use.addAgent();
  const updateAgent = useAgentListStore.use.updateAgent();
  
  const initializedRef = useRef(false);

  // 初始化：根据 URL 参数加载数据
  useEffect(() => {
    // 防止重复初始化
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (agentId) {
      // 编辑模式：加载已有智能体
      const agent = getAgentById(agentId) || getDemoAgentFallback(agentId);
      if (agent) {
        loadFromAgent(withDemoAbilitiesFallback(agent));
      } else {
        message.error('智能体不存在');
        createNewDraft();
      }
    } else {
      // 新建模式：创建空白草稿
      createNewDraft();
    }
  }, [agentId, getAgentById, loadFromAgent, createNewDraft]);

  // 保存草稿
  const saveDraft = useCallback(() => {
    const validation = validateDraftForSave(draft);
    if (!validation.valid) {
      validation.errors.forEach((error) => message.error(error));
      return false;
    }

    const isNew = draft.id === null;
    const agent = draftToAgent(draft, isNew ? undefined : getAgentById(draft.id!));

    if (isNew) {
      // 新建：添加到列表
      addAgent(agent);
      // 更新草稿的 ID
      updateDraft({ id: agent.id });
    } else {
      // 编辑：更新列表中的数据
      updateAgent(agent.id, agent);
    }

    markSaved();
    message.success('保存成功');
    return true;
  }, [draft, getAgentById, addAgent, updateAgent, updateDraft, markSaved]);

  // 发布智能体
  const publishAgent = useCallback(() => {
    const validation = validateDraftForPublish(draft);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const isNew = draft.id === null;
    const existingAgent = isNew ? undefined : getAgentById(draft.id!);
    const agent = draftToAgent(
      { ...draft, status: 'published' },
      existingAgent
    );

    if (isNew) {
      addAgent(agent);
      updateDraft({ id: agent.id, status: 'published' });
    } else {
      updateAgent(agent.id, agent);
      updateDraft({ status: 'published' });
    }

    markSaved();
    return { success: true, errors: [] };
  }, [draft, getAgentById, addAgent, updateAgent, updateDraft, markSaved]);

  // 校验发布
  const validateForPublish = useCallback(() => {
    return validateDraftForPublish(draft);
  }, [draft]);

  return {
    draft,
    isDirty,
    isNewAgent: draft.id === null,
    agentId: draft.id,
    saveDraft,
    publishAgent,
    validateForPublish,
  };
};