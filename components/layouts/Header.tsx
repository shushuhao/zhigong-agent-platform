'use client';

import React from 'react';
import { Layout, Button, Dropdown, Avatar, Badge, Space } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  BellOutlined, 
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  showMenuButton: boolean;
  onMenuClick: () => void;
  collapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showMenuButton, onMenuClick, collapsed = false }) => {
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        console.log('跳转到个人资料页面');
        break;
      case 'settings':
        console.log('跳转到设置页面');
        break;
      case 'logout':
        console.log('执行退出登录');
        break;
    }
  };

  return (
    <AntHeader className="bg-white px-6 flex items-center justify-between h-16 sticky top-0 z-10 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        {showMenuButton && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onMenuClick}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
            size="large"
          />
        )}
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-800 m-0">
            智工智能体平台
          </h1>
          <div className="hidden md:block w-px h-6 bg-gray-200"></div>
          <div className="hidden md:block text-sm text-gray-500">
            工业智能应用工作台
          </div>
        </div>
      </div>

      <Space size="large">
        {/* 搜索框 */}
        <div className="hidden lg:block">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索功能..."
              className="w-64 h-9 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 通知 */}
        <Badge count={5} size="small" offset={[-2, 2]}>
          <Button
            type="text"
            icon={<BellOutlined />}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            size="large"
          />
        </Badge>

        {/* 用户菜单 */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
          arrow
          trigger={['click']}
        >
          <div className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <Avatar
              size={32}
              icon={<UserOutlined />}
              className="mr-3 bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-800">管理员</div>
              <div className="text-xs text-gray-500">超级管理员</div>
            </div>
            <svg className="hidden md:block w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};
