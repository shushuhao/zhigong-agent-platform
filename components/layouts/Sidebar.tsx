'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Layout, Menu } from 'antd';
import { usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  UserOutlined,
  RobotOutlined,
  ApartmentOutlined,
  BookOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import SimpleMenu from './SimpleMenu';
import { useOptimizedMenu } from '@/lib/hooks/useOptimizedMenu';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const { handleMenuClick: optimizedMenuClick, handleMenuHover } = useOptimizedMenu();
  const [openKeys, setOpenKeys] = useState<string[]>(['users-group']);
  const selectedKeys = useMemo(() => (pathname ? [pathname] : []), [pathname]);

  const renderMenuLabel = useCallback((label: string, key: string) => (
    <span className="block w-full" onMouseEnter={() => handleMenuHover(key)}>
      {label}
    </span>
  ), [handleMenuHover]);

  const menuItems: MenuItem[] = useMemo(() => [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: renderMenuLabel('仪表盘', '/dashboard'),
    },
    {
      key: '/agent/list',
      icon: <RobotOutlined />,
      label: renderMenuLabel('智能体', '/agent/list'),
    },
    {
      key: '/workflow/list',
      icon: <ApartmentOutlined />,
      label: renderMenuLabel('工作流', '/workflow/list'),
    },
    {
      key: '/knowledge/list',
      icon: <BookOutlined />,
      label: renderMenuLabel('知识库', '/knowledge/list'),
    },
    {
      key: '/plugins/market',
      icon: <AppstoreOutlined />,
      label: renderMenuLabel('插件广场', '/plugins/market'),
    },
    {
      key: '/labeleditor/list',
      icon: <ApartmentOutlined />,
      label: renderMenuLabel('数据标注', '/labeleditor/list'),
    },
    {
      key: 'users-group',
      icon: <UserOutlined />,
      label: '用户管理',
      children: [
        {
          key: '/users/list',
          label: renderMenuLabel('用户列表', '/users/list'),
        },
        {
          key: '/users/roles',
          label: renderMenuLabel('角色管理', '/users/roles'),
        },
      ],
    },
  ], [renderMenuLabel]);

  // 包装优化的菜单点击处理
  const handleMenuClick: MenuProps['onClick'] = useCallback((e) => {
    const { key } = e;
    optimizedMenuClick(key);
  }, [optimizedMenuClick]);

  // 使用 useCallback 优化菜单展开处理
  const handleOpenChange = useCallback((keys: string[]) => {
    setOpenKeys(keys);
  }, []);



  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="fixed left-0 top-0 bottom-0 z-20"
      width={256}
      collapsedWidth={80}
    >
      {/* Logo 区域 */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 via-emerald-500 to-orange-400 rounded-lg flex items-center justify-center shadow-sm shadow-teal-500/20">
            <span className="text-white font-bold text-sm">工</span>
          </div>
          {!collapsed && (
            <div className="text-gray-800 font-semibold text-lg tracking-wide">
              智工平台
            </div>
          )}
        </div>
      </div>

      {/* 菜单区域 */}
      <div className="py-2">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0"
          inlineIndent={20}
          // 性能优化：禁用菜单动画以提高响应速度
          disabledOverflow
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
