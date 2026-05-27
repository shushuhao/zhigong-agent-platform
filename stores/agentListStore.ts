import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Agent, AgentStatus } from '@/lib/types/agent';
import { STORAGE_KEYS } from '@/lib/constants';
import { createSelectors } from '@/lib/stores/createSelectors';

interface AgentListState {
  agents: Agent[];
  isInitialized: boolean;
  
  // 查询方法
  getAgentById: (id: string) => Agent | undefined;
  getAgentsByStatus: (status: AgentStatus) => Agent[];
  
  // 操作方法
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  
  // 发布相关
  publishAgent: (id: string) => void;
  unpublishAgent: (id: string) => void;
  
  // 初始化
  initializeWithMockData: () => void;
}

/**
 * 初始 Mock 数据
 * 首次使用时填充，让用户有数据可看
 */
export const INITIAL_MOCK_AGENTS: Agent[] = [
  {
    id: 'agent_001',
    name: '设备故障排查助手',
    status: 'published',
    description: '面向工业互联网设备运维场景，支持电机过热、振动异常、变频器报警等故障诊断。',
    logo: '诊',
    modelId: 'deepseek-r1',
    rolePrompt: '你是设备故障排查助手，熟悉工业设备手册、故障代码表和点检规范。请根据用户描述的现象，按“现象判断、可能原因、排查步骤、安全提醒、后续建议”的结构输出。遇到电机过热、轴承振动、变频器报警等问题时，优先引用设备手册和故障代码表，避免编造不存在的参数。',
    abilities: {
      knowledgeBases: [
        { id: 'kb_001', name: '工业设备手册知识库' },
        { id: 'kb_002', name: '设备故障代码表' },
      ],
      workflows: [{ id: 'wf_001', name: '设备故障诊断流程' }],
    },
    conversation: {
      openingStatement: '你好，我是设备故障排查助手。请描述设备类型、故障现象、报警代码和现场数据，我会给出排查建议。',
      suggestedQuestions: ['电机运行 20 分钟后过热怎么办？', '变频器报 E101 如何处理？', '轴承振动异常要先检查什么？'],
    },
    createdAt: '2025-05-01T09:30:00.000Z',
    updatedAt: '2025-05-01T09:30:00.000Z',
  },
  {
    id: 'agent_002',
    name: '产线数据分析员',
    status: 'draft',
    description: '用于分析设备温度、振动、电流等时序数据，生成巡检与维护建议。',
    logo: '数',
    modelId: 'gpt-4o',
    rolePrompt: '你是产线数据分析员，擅长从温度、振动、电流、产量等数据中发现异常趋势，并给出维护建议。',
    abilities: {
      knowledgeBases: [{ id: 'kb_003', name: '产线点检与安全规程' }],
      workflows: [{ id: 'wf_002', name: '设备健康评分流程' }],
    },
    conversation: {
      openingStatement: '请上传或描述设备运行数据，我可以帮你分析异常趋势。',
      suggestedQuestions: ['分析本周电机温度趋势', '生成巡检报告', '判断振动是否超阈值'],
    },
    createdAt: '2025-04-28T14:12:00.000Z',
    updatedAt: '2025-04-28T14:12:00.000Z',
  },
  {
    id: 'agent_003',
    name: '工艺维护顾问',
    status: 'published',
    description: '结合设备手册与点检规范，辅助生成保养计划、停机检查清单和安全操作步骤。',
    logo: '维',
    modelId: 'claude-3.5',
    rolePrompt: '你是工艺维护顾问，负责把设备维护任务拆成清晰的保养计划、停机检查清单和安全注意事项。',
    abilities: {
      knowledgeBases: [{ id: 'kb_003', name: '产线点检与安全规程' }],
      workflows: [{ id: 'wf_003', name: '预防性维护流程' }],
    },
    conversation: {
      openingStatement: '你好，我可以帮你制定设备保养计划和安全检查清单。',
      suggestedQuestions: ['制定电机月度保养计划', '生成停机检查清单', '维护前有哪些安全步骤？'],
    },
    createdAt: '2025-04-26T18:08:00.000Z',
    updatedAt: '2025-04-26T18:08:00.000Z',
  },
];

const mergeAgentsById = (existing: Agent[], defaults: Agent[]): Agent[] => {
  const existingIds = new Set(existing.map((agent) => agent.id));
  return [...existing, ...defaults.filter((agent) => !existingIds.has(agent.id))];
};

const useAgentListStoreBase = create<AgentListState>()(
  persist(
    (set, get) => ({
      agents: [],
      isInitialized: false,

      getAgentById: (id) => {
        return get().agents.find((agent) => agent.id === id);
      },

      getAgentsByStatus: (status) => {
        return get().agents.filter((agent) => agent.status === status);
      },

      addAgent: (agent) => {
        set((state) => ({
          agents: [agent, ...state.agents],
        }));
      },

      updateAgent: (id, updates) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? { ...agent, ...updates, updatedAt: new Date().toISOString() }
              : agent
          ),
        }));
      },

      deleteAgent: (id) => {
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id),
        }));
      },

      publishAgent: (id) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? { ...agent, status: 'published' as AgentStatus, updatedAt: new Date().toISOString() }
              : agent
          ),
        }));
      },

      unpublishAgent: (id) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? { ...agent, status: 'offline' as AgentStatus, updatedAt: new Date().toISOString() }
              : agent
          ),
        }));
      },

      initializeWithMockData: () => {
        set((state) => ({
          agents: mergeAgentsById(state.agents, INITIAL_MOCK_AGENTS),
          isInitialized: true,
        }));
      },
    }),
    {
      name: STORAGE_KEYS.AGENT_LIST,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.agents.length === 0) {
          state.initializeWithMockData();
        }
      },
    }
  )
);

export const useAgentListStore = createSelectors(useAgentListStoreBase);