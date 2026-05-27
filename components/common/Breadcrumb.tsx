'use client';

import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // 路径映射配置
  const pathMap: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/agent': '智能体管理',
    '/agent/list': '智能体列表',
    '/users': '用户管理',
    '/users/list': '用户列表',
    '/users/roles': '角色管理',
    '/products': '商品管理',
    '/products/list': '商品列表',
    '/products/categories': '分类管理',
    '/orders': '订单管理',
    '/analytics': '数据分析',
    '/analytics/overview': '数据概览',
    '/analytics/reports': '报表管理',
    '/analytics/fullscreen': '全屏报表',
    '/content': '内容管理',
    '/content/articles': '文章管理',
    '/content/pages': '页面管理',
    '/team': '团队管理',
    '/plugins': '插件广场',
    '/plugins/market': '插件广场',
    '/settings': '系统设置',
    '/settings/general': '通用设置',
    '/settings/security': '安全设置',
    '/login': '登录',
    'detail': '详情',
    'edit': '编辑',
    'print': '打印',
    'invoice': '发票',
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        title: '首页',
        href: '/dashboard',
        icon: <HomeOutlined />,
      },
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // 跳过动态路由参数（数字ID）
      if (/^\d+$/.test(segment)) {
        return;
      }
      // 插件详情页（plugin_ 前缀）
      if (/^plugin_/.test(segment)) {
        breadcrumbs.push({
          title: '详情',
        });
        return;
      }

      const title = pathMap[currentPath] || pathMap[segment] || segment;
      const isLast = index === pathSegments.length - 1;

      breadcrumbs.push({
        title,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const items = breadcrumbs.map((item, index) => ({
    key: index,
    title: item.href ? (
      <Link href={item.href} className="text-blue-600 hover:text-blue-500">
        {item.icon && <span className="mr-1">{item.icon}</span>}
        {item.title}
      </Link>
    ) : (
      <span className="text-gray-600">
        {item.icon && <span className="mr-1">{item.icon}</span>}
        {item.title}
      </span>
    ),
  }));

  // 如果只有首页，不显示面包屑
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className="mb-4">
      <AntBreadcrumb items={items} />
    </div>
  );
};

export default Breadcrumb;
