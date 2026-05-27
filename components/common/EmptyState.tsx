'use client';

import React from 'react';
import { Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  image?: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '当前没有任何数据，您可以创建一个新的项目',
  image,
  action,
  className = ''
}) => {
  const defaultImage = (
    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );

  return (
    <div className={`text-center py-12 ${className}`}>
      {image || defaultImage}
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">{description}</p>
        {action && (
          <Button
            type="primary"
            icon={action.icon || <PlusOutlined />}
            onClick={action.onClick}
            className="shadow-lg"
          >
            {action.text}
          </Button>
        )}
      </div>
    </div>
  );
};

export const TableEmptyState: React.FC<Omit<EmptyStateProps, 'image'>> = (props) => {
  const tableImage = (
    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
      <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
      </svg>
    </div>
  );

  return <EmptyState {...props} image={tableImage} />;
};
