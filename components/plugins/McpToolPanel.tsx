// components/plugins/McpToolPanel.tsx

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ToolDetailPanel } from './ToolDetailPanel';
import type { PluginTool } from '@/lib/types/plugin';

interface McpToolPanelProps {
  tools: PluginTool[];
}

export const McpToolPanel: React.FC<McpToolPanelProps> = ({ tools }) => {
  const [selectedToolId, setSelectedToolId] = useState<string>('');

  useEffect(() => {
    if (!selectedToolId && tools.length > 0) {
      setSelectedToolId(tools[0].id);
    }
  }, [selectedToolId, tools]);

  const selectedTool = useMemo(() => {
    return tools.find((tool) => tool.id === selectedToolId) || tools[0] || null;
  }, [tools, selectedToolId]);

  if (tools.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-gray-500">
        暂无工具数据
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-4">
        <div className="text-sm text-gray-500">共包含{tools.length}个工具</div>
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setSelectedToolId(tool.id)}
            className={`w-full rounded-xl border p-3 text-left text-sm transition ${
              tool.id === selectedToolId
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-100 bg-white hover:border-blue-200'
            }`}
          >
            <div className="font-medium text-gray-900">{tool.name}</div>
            <div className="mt-1 text-xs text-gray-500 line-clamp-2">{tool.description}</div>
          </button>
        ))}
      </div>
      <ToolDetailPanel tool={selectedTool} />
    </div>
  );
};