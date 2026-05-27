'use client';

import React from 'react';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  tip = '加载中...',
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <Spin size={size} tip={tip}>
        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"></div>
      </Spin>
    </div>
  );
};

export const PageLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-8 h-8 bg-white rounded-lg"></div>
        </div>
        <div className="text-lg font-semibold text-slate-700 mb-2">Admin Pro</div>
        <div className="text-sm text-slate-500">正在加载...</div>
        <div className="mt-4">
          <div className="w-32 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
