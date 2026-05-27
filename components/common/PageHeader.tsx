'use client';

import React from 'react';
import { Breadcrumb, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useBreadcrumbVisibility } from '@/lib/hooks/useLayout';

const { Title } = Typography;

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  extra
}) => {
  // 检查全局面包屑是否启用
  const showGlobalBreadcrumb = useBreadcrumbVisibility();

  const breadcrumbItems = [
    {
      title: (
        <Link href="/dashboard" className="flex items-center">
          <HomeOutlined className="mr-1" />
          首页
        </Link>
      ),
    },
    ...breadcrumbs.map((item) => ({
      title: item.href ? (
        <Link href={item.href}>{item.title}</Link>
      ) : (
        item.title
      ),
    })),
  ];

  return (
    <div className="mb-6">
      {/* 面包屑导航 - 只有在全局面包屑未启用且有面包屑数据时才显示 */}
      {!showGlobalBreadcrumb && breadcrumbs.length > 0 && (
        <div className="mb-4">
          <Breadcrumb
            items={breadcrumbItems}
            className="text-sm"
          />
        </div>
      )}

      {/* 页面标题区域 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
            <Title level={2} className="!mb-0 !text-2xl font-bold text-gray-800">
              {title}
            </Title>
          </div>
          {subtitle && (
            <p className="text-gray-600 text-base leading-relaxed ml-4 mb-0">
              {subtitle}
            </p>
          )}
        </div>

        {extra && (
          <div className="flex items-center space-x-3 flex-shrink-0">
            {extra}
          </div>
        )}
      </div>
    </div>
  );
};
