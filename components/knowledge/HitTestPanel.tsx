'use client';

import React, { useMemo, useState } from 'react';
import { Button, Card, Empty, Input, Modal, Typography } from 'antd';
import type { HitTestHistory } from '@/lib/types/knowledge';

const { Text } = Typography;
const { TextArea } = Input;

export interface HitTestStrategy {
  topK: number;
  scoreThreshold: number;
}

interface HitTestPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  onRunTest: () => void;
  history: HitTestHistory[];
  onSelectHistory: (history: HitTestHistory) => void;
  onClearHistory?: () => void;
  strategy: HitTestStrategy;
  onStrategyChange: (strategy: HitTestStrategy) => void;
  isTesting?: boolean;
}

export const HitTestPanel: React.FC<HitTestPanelProps> = ({
  query,
  onQueryChange,
  onRunTest,
  history,
  onSelectHistory,
  onClearHistory,
  strategy,
  onStrategyChange,
  isTesting = false,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [draftStrategy, setDraftStrategy] = useState(strategy);

  const canRun = useMemo(() => query.trim().length > 0, [query]);

  const handleOpenConfig = () => {
    setDraftStrategy(strategy);
    setIsConfigOpen(true);
  };

  const handleConfirmConfig = () => {
    onStrategyChange(draftStrategy);
    setIsConfigOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card title="命中测试">
        <div className="space-y-3">
          <Text type="secondary">根据给定的查询文本测试知识库的召回效果。</Text>
          <TextArea
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="请输入内容..."
            rows={8}
            allowClear
          />
          <div className="flex items-center justify-end gap-2">
            <Button onClick={handleOpenConfig}>策略配置</Button>
            <Button type="primary" onClick={onRunTest} disabled={!canRun} loading={isTesting}>
              测试
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title="历史记录"
        extra={
          onClearHistory ? (
            <Button type="link" onClick={onClearHistory} className="px-0">
              清空
            </Button>
          ) : null
        }
      >
        {history.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                className="w-full rounded-lg border border-gray-100 bg-white p-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                onClick={() => onSelectHistory(item)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.query}
                  </span>
                  <span className="text-xs text-gray-400">{item.results.length} 条</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(item.testedAt).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title="命中策略配置"
        open={isConfigOpen}
        onCancel={() => setIsConfigOpen(false)}
        onOk={handleConfirmConfig}
        okText="保存"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <Text className="text-sm text-gray-700">TopK（返回条数）</Text>
            <Input
              type="number"
              min={1}
              max={20}
              value={draftStrategy.topK}
              onChange={(event) =>
                setDraftStrategy((prev) => ({
                  ...prev,
                  topK: Number(event.target.value) || 1,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Text className="text-sm text-gray-700">最低相似度阈值</Text>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={draftStrategy.scoreThreshold}
              onChange={(event) =>
                setDraftStrategy((prev) => ({
                  ...prev,
                  scoreThreshold: Number(event.target.value) || 0,
                }))
              }
            />
            <Text type="secondary" className="text-xs">
              0-1 之间，数值越大过滤越严格。
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};
