'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 路由加载状态管理 Hook
 * 提供路由切换时的加载状态
 */
export function useRouterLoading() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    // 如果路径发生变化，说明正在进行路由切换
    if (pathname !== previousPath) {
      setIsLoading(true);
      
      // 短暂延迟后结束加载状态
      const timer = setTimeout(() => {
        setIsLoading(false);
        setPreviousPath(pathname);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [pathname, previousPath]);

  return {
    isLoading,
    currentPath: pathname,
  };
}
