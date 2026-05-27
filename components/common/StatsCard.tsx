'use client';

import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  loading = false,
  className = ''
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card
      loading={loading}
      className={`hover:shadow-md transition-all duration-200 ${className}`}
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {prefix && (
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-lg">
              {prefix}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-gray-900">
                {formatValue(value)}
              </span>
              {suffix && (
                <span className="text-sm text-gray-500 font-medium">{suffix}</span>
              )}
            </div>
          </div>
        </div>

        {/* 趋势指示器 */}
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend.isPositive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {trend.isPositive ? (
              <ArrowUpOutlined className="text-xs" />
            ) : (
              <ArrowDownOutlined className="text-xs" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
};
