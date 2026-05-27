'use client';

import React, { useEffect, useState } from 'react';

/**
 * 简化的全局加载组件
 * 只处理初始加载，避免过度动画
 */
export const GlobalLoading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 只处理初始加载
  useEffect(() => {
    // 很短的延迟，只是为了避免闪烁
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // 初始加载状态 - 简单的白屏
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">A</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * 简化的页面加载指示器
 * 用于页面级别的加载状态
 */
export const PageLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Spin size="large" />
        <p className="text-gray-600 mt-4">页面加载中...</p>
      </div>
    </div>
  );
};

/**
 * 内容加载骨架屏
 * 用于内容区域的加载状态
 */
export const ContentSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
};
