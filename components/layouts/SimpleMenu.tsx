'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardOutlined,
  UserOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

interface SimpleMenuProps {
  collapsed: boolean;
}

const SimpleMenu: React.FC<SimpleMenuProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['users']);

  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
      children: [
        {
          key: '/users/list',
          label: '用户列表',
        },
        {
          key: '/users/roles',
          label: '角色管理',
        },
      ],
    },
  ];

  const handleItemClick = (key: string) => {
    // 如果是路径，则跳转
    if (key.startsWith('/')) {
      router.push(key);
    }
  };

  const toggleExpanded = (key: string) => {
    setExpandedKeys(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const isSelected = (key: string) => {
    return pathname === key;
  };

  const isExpanded = (key: string) => {
    return expandedKeys.includes(key);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const selected = isSelected(item.key);
    const expanded = isExpanded(item.key);

    return (
      <div key={item.key} className="menu-item-wrapper">
        <div
          className={`
            flex items-center px-4 py-3 cursor-pointer transition-colors duration-200
            ${level > 0 ? 'pl-12' : ''}
            ${selected 
              ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
              : 'text-gray-700 hover:bg-gray-50'
            }
          `}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.key);
            } else {
              handleItemClick(item.key);
            }
          }}
        >
          {/* 图标 */}
          {item.icon && (
            <span className={`mr-3 text-lg ${selected ? 'text-blue-600' : 'text-gray-500'}`}>
              {item.icon}
            </span>
          )}
          
          {/* 标签 */}
          {!collapsed && (
            <>
              <span className="flex-1 text-sm font-medium">
                {item.label}
              </span>
              
              {/* 展开/收起图标 */}
              {hasChildren && (
                <span className={`text-xs transition-transform duration-200 ${expanded ? 'rotate-0' : ''}`}>
                  {expanded ? <DownOutlined /> : <RightOutlined />}
                </span>
              )}
            </>
          )}
        </div>

        {/* 子菜单 */}
        {hasChildren && expanded && !collapsed && (
          <div className="submenu">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="simple-menu">
      {menuItems.map(item => renderMenuItem(item))}
    </div>
  );
};

export default SimpleMenu;
