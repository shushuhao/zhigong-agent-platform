'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouterStore } from '@/lib/stores/routerStore';

/**
 * 全局路由加载指示器
 * 在路由切换时显示顶部加载条
 */
export const GlobalRouterLoading: React.FC = () => {
  const isLoading = useRouterStore((state) => state.isLoading);
  const setIsLoading = useRouterStore((state) => state.setIsLoading);
  const [showLoading, setShowLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchKey = searchParams.toString();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchKey, setIsLoading]);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
      fallbackTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 4000);
    } else {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      // 延迟隐藏，让动画完成
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, setIsLoading]);

  useEffect(() => () => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
  }, []);

  if (!showLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 animate-pulse" />
  );
};

export default GlobalRouterLoading;
