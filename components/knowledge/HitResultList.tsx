'use client';

import React, { useMemo } from 'react';
import { Card, Empty, Input, Tag, Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { HitTestResult } from '@/lib/types/knowledge';

const { Text } = Typography;

interface HitResultListProps {
  results: HitTestResult[];
  keyword: string;
  onKeywordChange: (value: string) => void;
  selectedChunkId?: string;
  onSelectResult?: (result: HitTestResult) => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'green';
  if (score >= 0.5) return 'blue';
  if (score >= 0.3) return 'gold';
  return 'default';
};

export const HitResultList: React.FC<HitResultListProps> = ({
  results,
  keyword,
  onKeywordChange,
  selectedChunkId,
  onSelectResult,
}) => {
  const filteredResults = useMemo(() => {
    if (!keyword.trim()) return results;
    const lower = keyword.toLowerCase();
    return results.filter((item) => item.chunk.content.toLowerCase().includes(lower));
  }, [results, keyword]);

  return (
    <Card
      title={`命中切片 (${filteredResults.length})`}
      className="h-full"
      styles={{ body: { height: '100%', padding: 0 } }}
      extra={
        <Input.Search
          allowClear
          placeholder="搜索切片"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          style={{ width: 180 }}
        />
      }
    >
      <div className="h-full overflow-auto p-4 space-y-3">
        {filteredResults.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
        ) : (
          filteredResults.map((item, index) => {
            const { chunk, score, matchedKeywords } = item;
            const isSelected = chunk.id === selectedChunkId;
            return (
              <div
                key={chunk.id}
                className={`rounded-lg border p-3 shadow-sm cursor-pointer transition ${
                  isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-100'
                }`}
                onClick={() => onSelectResult?.(item)}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Text type="secondary">分段数: {chunk.index}</Text>
                  <div className="flex items-center gap-2">
                    <Tag color={getScoreColor(score)}>
                      相似度: {(score * 100).toFixed(0)}%
                    </Tag>
                    {matchedKeywords?.map((word) => (
                      <Tag key={word}>{word}</Tag>
                    ))}
                  </div>
                </div>
                <div className="text-gray-800 text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      table: (props) => (
                        <table className="w-full border-collapse text-sm" {...props} />
                      ),
                      th: (props) => (
                        <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left" {...props} />
                      ),
                      td: (props) => (
                        <td className="border border-gray-200 px-2 py-1" {...props} />
                      ),
                      img: (props) => (
                        <img className="max-w-full rounded-lg border border-gray-100" {...props} />
                      ),
                      p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                    }}
                  >
                    {chunk.content}
                  </ReactMarkdown>
                </div>
                {index < filteredResults.length - 1 && (
                  <div className="mt-3 border-b border-dashed border-gray-200" />
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
