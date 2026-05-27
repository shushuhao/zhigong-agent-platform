'use client';

import React from 'react';
import { Button, Tag } from 'antd';
import type { AgentPreviewDebugEvent } from '@/lib/types/agent';

const TYPE_COLOR_MAP: Record<AgentPreviewDebugEvent['type'], string> = {
  request: 'blue',
  chunk: 'cyan',
  thought: 'purple',
  done: 'green',
  error: 'red',
  abort: 'orange',
  retry: 'gold',
};

interface AgentPreviewDebugPanelProps {
  open: boolean;
  events: AgentPreviewDebugEvent[];
  onToggle: () => void;
  onClear: () => void;
}

export const AgentPreviewDebugPanel: React.FC<AgentPreviewDebugPanelProps> = ({
  open,
  events,
  onToggle,
  onClear,
}) => {
  return (
    <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">调试数据面板</span>
          <span className="text-[11px] text-gray-400">记录最近 {events.length} 条</span>
        </div>
        <div className="flex items-center gap-2">
          <Button type="text" size="small" onClick={onClear}>
            清空
          </Button>
          <Button type="text" size="small" onClick={onToggle}>
            {open ? '收起' : '展开'}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="mt-2 max-h-40 overflow-auto space-y-2">
          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-center text-gray-400">
              暂无调试数据
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Tag color={TYPE_COLOR_MAP[event.type]} className="m-0 text-[10px]">
                    {event.type}
                  </Tag>
                  <span className="text-[11px] text-gray-400">{event.createdAt}</span>
                </div>
                <div className="mt-1 text-[12px] text-gray-700">{event.message}</div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};
