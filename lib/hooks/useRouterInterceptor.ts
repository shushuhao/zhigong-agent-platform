'use client';

import { useEffect } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useRouterStore } from '@/lib/stores/routerStore';

/**
 * 路由拦截器 Hook
 * 在路由切换时自动显示/隐藏加载状态
 */
export function useRouterInterceptor() {
  const router = useNextRouter();
  const setIsLoading = useRouterStore((state) => state.setIsLoading);

  useEffect(() => {
    // 保存原始的 push 方法
    const originalPush = router.push;

    // 创建新的 push 方法，添加加载状态
    router.push = function (href: string | number, options?: any) {
      // 显示加载状态
      setIsLoading(true);

      // 调用原始的 push 方法
      const result = originalPush.call(this, href, options);

      // 在路由切换完成后隐藏加载状态
      // 使用 setTimeout 确保页面已经切换
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return result;
    } as any;

    return () => {
      // 清理定时器
      clearTimeout(timer);
    };
  }, [router, setIsLoading]);
}

