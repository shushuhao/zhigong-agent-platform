'use client';

import React, { useState, useCallback } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import { Header } from './Header';
import { useSidebarVisibility, useHeaderVisibility, useContainerClassName, useBreadcrumbVisibility } from '@/lib/hooks/useLayout';
import Breadcrumb from '../common/Breadcrumb';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  // 获取布局配置
  const showSidebar = useSidebarVisibility();
  const showHeader = useHeaderVisibility();
  const showBreadcrumb = useBreadcrumbVisibility();
  const containerClassName = useContainerClassName();

  const toggleSidebar = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  // 如果不显示侧边栏和头部，直接渲染内容
  if (!showSidebar && !showHeader) {
    return (
      <div className={containerClassName}>
        {children}
      </div>
    );
  }

  // 如果只显示头部，不显示侧边栏
  if (!showSidebar && showHeader) {
    return (
      <Layout className="min-h-screen">
        <Header showMenuButton={false} onMenuClick={() => {}} />
        <Content className="bg-white min-h-[calc(100vh-64px)] overflow-auto">
          <div className={containerClassName}>
            {showBreadcrumb && <Breadcrumb />}
            {children}
          </div>
        </Content>
      </Layout>
    );
  }

  // 默认布局：显示侧边栏和头部
  return (
    <Layout className="min-h-screen" hasSider>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <Header showMenuButton={true} onMenuClick={toggleSidebar} collapsed={collapsed} />
        <Content className="bg-white min-h-[calc(100vh-64px)] overflow-auto">
          <div className={containerClassName}>
            {showBreadcrumb && <Breadcrumb />}
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
