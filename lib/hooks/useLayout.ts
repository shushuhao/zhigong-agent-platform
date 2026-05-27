'use client';

import { usePathname } from 'next/navigation';
import React, { useMemo, useContext, createContext } from 'react';
import {
  getLayoutConfig,
  getPageTitle,
  LayoutType,
  type LayoutConfig
} from '@/lib/config/layout';

/**
 * 页面级布局配置接口
 */
export interface PageLayoutConfig {
  layout?: LayoutType;
  title?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  showBreadcrumb?: boolean;
  showFooter?: boolean;
  containerClassName?: string;
}

/**
 * 页面布局配置上下文
 */
const PageLayoutContext = createContext<PageLayoutConfig | undefined>(undefined);

/**
 * 页面布局配置提供者
 * 用于页面级别的布局覆盖
 */
interface PageLayoutProviderProps {
  children: React.ReactNode;
  config?: PageLayoutConfig;
}

export function PageLayoutProvider({ children, config }: PageLayoutProviderProps) {
  return React.createElement(
    PageLayoutContext.Provider,
    { value: config },
    children
  );
}

/**
 * 合并页面级配置
 */
function mergePageLayoutConfig(
  baseConfig: LayoutConfig,
  pageConfig?: PageLayoutConfig
): LayoutConfig {
  if (!pageConfig) {
    return baseConfig;
  }

  // 应用页面级覆盖配置
  return {
    ...baseConfig,
    ...(pageConfig.title && { title: pageConfig.title }),
    ...(pageConfig.showSidebar !== undefined && { showSidebar: pageConfig.showSidebar }),
    ...(pageConfig.showHeader !== undefined && { showHeader: pageConfig.showHeader }),
    ...(pageConfig.showBreadcrumb !== undefined && { showBreadcrumb: pageConfig.showBreadcrumb }),
    ...(pageConfig.showFooter !== undefined && { showFooter: pageConfig.showFooter }),
    ...(pageConfig.containerClassName && { containerClassName: pageConfig.containerClassName }),
  };
}

/**
 * 主要的布局配置 Hook
 * 支持智能约定和页面级覆盖
 */
export function useLayout(): LayoutConfig {
  const pathname = usePathname();
  const pageConfig = useContext(PageLayoutContext);

  const layoutConfig = useMemo(() => {
    const baseConfig = getLayoutConfig(pathname);
    return mergePageLayoutConfig(baseConfig, pageConfig);
  }, [pathname, pageConfig]);

  return layoutConfig;
}

/**
 * 侧边栏显示控制 Hook
 */
export function useSidebarVisibility(): boolean {
  const pathname = usePathname();
  return useMemo(() => {
    const config = getLayoutConfig(pathname);
    return config.showSidebar;
  }, [pathname]);
}

/**
 * 头部显示控制 Hook
 */
export function useHeaderVisibility(): boolean {
  const pathname = usePathname();
  return useMemo(() => {
    const config = getLayoutConfig(pathname);
    return config.showHeader;
  }, [pathname]);
}

/**
 * 面包屑显示控制 Hook
 */
export function useBreadcrumbVisibility(): boolean {
  const pathname = usePathname();
  return useMemo(() => {
    const config = getLayoutConfig(pathname);
    return config.showBreadcrumb;
  }, [pathname]);
}

/**
 * 容器样式 Hook
 */
export function useContainerClassName(): string {
  const pathname = usePathname();
  return useMemo(() => {
    const config = getLayoutConfig(pathname);
    return config.containerClassName || 'p-6';
  }, [pathname]);
}

/**
 * 页脚显示状态 Hook
 */
export function useFooterVisibility(): boolean {
  const { showFooter } = useLayout();
  return showFooter || false;
}

/**
 * 页面标题 Hook
 */
export function usePageTitle(): string {
  const pathname = usePathname();
  const { title } = useLayout();

  return useMemo(() => {
    return title || getPageTitle(pathname);
  }, [pathname, title]);
}

/**
 * 响应式布局 Hook
 */
export function useResponsiveLayout() {
  const { showSidebar } = useLayout();

  // 在移动端强制隐藏侧边栏
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const actualShowSidebar = showSidebar && !isMobile;

  return {
    showSidebar: actualShowSidebar,
    isMobile,
  };
}

// 导出布局类型，方便页面使用
export { LayoutType };
