'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ children }) => {
  const pathname = usePathname();

  useEffect(() => {
    // 监控页面加载性能
    const measurePageLoad = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          const firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0;
          const firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;

          // 在开发环境下输出性能信息
          if (process.env.NODE_ENV === 'development') {
            console.group(`🚀 页面性能监控 - ${pathname}`);
            console.log(`📊 页面加载时间: ${loadTime.toFixed(2)}ms`);
            console.log(`📊 DOM 内容加载时间: ${domContentLoaded.toFixed(2)}ms`);
            console.log(`🎨 首次绘制时间: ${firstPaint.toFixed(2)}ms`);
            console.log(`🎨 首次内容绘制时间: ${firstContentfulPaint.toFixed(2)}ms`);
            console.groupEnd();
          }

          // 如果加载时间过长，给出警告
          if (loadTime > 1000) {
            console.warn(`⚠️ 页面加载时间较长: ${loadTime.toFixed(2)}ms，建议优化`);
          }
        }
      }
    };

    // 延迟测量，确保页面完全加载
    const timer = setTimeout(measurePageLoad, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    // 监控路由切换性能
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const routeChangeTime = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 路由切换时间: ${routeChangeTime.toFixed(2)}ms - ${pathname}`);
      }

      // 如果路由切换时间过长，给出警告
      if (routeChangeTime > 300) {
        console.warn(`⚠️ 路由切换时间较长: ${routeChangeTime.toFixed(2)}ms，建议优化`);
      }
    };
  }, [pathname]);

  return <>{children}</>;
};

export default PerformanceMonitor;
