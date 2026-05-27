import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AgentEditorTabKey } from '@/lib/types/agent';
import { STORAGE_KEYS } from '@/lib/constants';
import { createSelectors } from '@/lib/stores/createSelectors';

interface AgentUIState {
  activeTab: AgentEditorTabKey;
  setActiveTab: (tab: AgentEditorTabKey) => void;
  resetUI: () => void;
}

const initialState: Pick<AgentUIState, 'activeTab'> = {
  activeTab: 'config',
};

const useAgentUIStoreBase = create<AgentUIState>()(
  persist(
    (set) => ({
      ...initialState,
      setActiveTab: (activeTab) => set({ activeTab }),
      resetUI: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.AGENT_UI,
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useAgentUIStore = createSelectors(useAgentUIStoreBase);