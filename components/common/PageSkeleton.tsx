'use client';

import React from 'react';
import { Skeleton } from 'antd';

/**
 * 页面加载骨架屏
 * 用于在页面加载时显示占位符
 */
export const PageSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="p-6 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton.Button active block style={{ height: '20px' }} />
          <Skeleton.Button active block style={{ height: '16px' }} />
        </div>
      ))}
    </div>
  );
};

/**
 * 表格骨架屏
 */
export const TableSkeleton: React.FC = () => {
  return (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  );
};

/**
 * 卡片骨架屏
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg">
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  );
};

export default PageSkeleton;

