'use client';

import { useRouter as useNextRouter } from 'next/navigation';
import { useRouterStore } from '@/lib/stores/routerStore';
import { useCallback } from 'react';

/**
 * 优化的 useRouter Hook
 * 自动在路由切换时显示加载状态
 * 
 * 使用方式：
 * const router = useOptimizedRouter();
 * router.push('/path'); // 自动显示加载指示器
 */
export function useOptimizedRouter() {
  const router = useNextRouter();
  const setIsLoading = useRouterStore((state) => state.setIsLoading);

  const push = useCallback(
    (href: string | number, options?: any) => {
      // 显示加载状态
      setIsLoading(true);

      // 调用原始的 push 方法
      router.push(href as string, options);
    },
    [router, setIsLoading]
  );

  const replace = useCallback(
    (href: string | number, options?: any) => {
      setIsLoading(true);
      router.replace(href as string, options);
    },
    [router, setIsLoading]
  );

  const back = useCallback(() => {
    setIsLoading(true);
    router.back();
  }, [router, setIsLoading]);

  const forward = useCallback(() => {
    setIsLoading(true);
    router.forward();
  }, [router, setIsLoading]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    router.refresh();
  }, [router, setIsLoading]);

  return {
    push,
    replace,
    back,
    forward,
    refresh,
    prefetch: router.prefetch,
  };
}
