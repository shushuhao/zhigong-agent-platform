'use client';

import React, { useMemo } from 'react';
import { Line, Column, Bar, Pie, Area } from '@ant-design/plots';
import { cn } from '@/lib/utils';

const CHART_COMPONENTS = {
  line: Line,
  column: Column,
  bar: Bar,
  pie: Pie,
  area: Area,
};

interface AgentPreviewChartBlockProps {
  raw: string;
  className?: string;
  isStreaming?: boolean; // 流式阶段用于占位，避免解析中途闪烁报错
}

export const AgentPreviewChartBlock: React.FC<AgentPreviewChartBlockProps> = ({
  raw,
  className,
  isStreaming = false,
}) => {
  const renderStreamingPlaceholder = () => (
    <div className={cn('rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500', className)}>
      图表生成中...
    </div>
  );

  const config = useMemo(() => {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [raw]);

  if (!config) {
    if (isStreaming) {
      return renderStreamingPlaceholder();
    }
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600', className)}>
        图表配置解析失败，请检查 chart JSON 格式
      </div>
    );
  }

  const chartType = String(config.type ?? 'line').toLowerCase();
  const ChartComponent = CHART_COMPONENTS[chartType as keyof typeof CHART_COMPONENTS];

  if (!ChartComponent) {
    if (isStreaming) {
      return renderStreamingPlaceholder();
    }
    return (
      <div className={cn('rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700', className)}>
        暂不支持的图表类型：{chartType}，可选 line/column/bar/pie/area
      </div>
    );
  }

  if (!Array.isArray(config.data)) {
    if (isStreaming) {
      return renderStreamingPlaceholder();
    }
    return (
      <div className={cn('rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500', className)}>
        图表数据为空，请检查 data 字段
      </div>
    );
  }

  const height = Number(config.height) || 220;
  const { type, height: _height, ...restConfig } = config;

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-3', className)}>
      <ChartComponent autoFit height={height} {...(restConfig as Record<string, unknown>)} />
    </div>
  );
};