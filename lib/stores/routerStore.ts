'use client';

import { create } from 'zustand';

interface RouterStore {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

/**
 * 全局路由加载状态管理
 * 用于在路由切换时显示加载指示器
 */
export const useRouterStore = create<RouterStore>((set) => ({
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));

