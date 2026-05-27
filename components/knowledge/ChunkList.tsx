'use client';

import React, { useMemo, useState } from 'react';
import { Button, Card, Empty, Input, Tag, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { DocumentChunk } from '@/lib/types/knowledge';

const { Text } = Typography;

interface ChunkListProps {
  chunks: DocumentChunk[];
  keyword: string;
  onKeywordChange: (value: string) => void;
  selectedChunkId?: string;
  selectedChapterId?: string;
  onSelectChunk?: (chunk: DocumentChunk) => void;
}

export const ChunkList: React.FC<ChunkListProps> = ({
  chunks,
  keyword,
  onKeywordChange,
  selectedChunkId,
  selectedChapterId,
  onSelectChunk,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [editedMap, setEditedMap] = useState<Record<string, string>>({});

  const filteredChunks = useMemo(() => {
    if (!keyword.trim()) return chunks;
    const lower = keyword.toLowerCase();
    return chunks.filter((chunk) => {
      const content = editedMap[chunk.id] ?? chunk.content;
      return content.toLowerCase().includes(lower);
    });
  }, [chunks, keyword, editedMap]);

  React.useEffect(() => {
    if (!selectedChunkId) return;
    const element = document.getElementById(`chunk-item-${selectedChunkId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedChunkId]);

  return (
    <Card
      title={`分段 (${filteredChunks.length})`}
      className="h-full"
      styles={{ body: { height: '100%', padding: 0 } }}
      extra={
        <Input.Search
          allowClear
          placeholder="搜索分段"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          style={{ width: 180 }}
        />
      }
    >
      <div className="h-full overflow-auto p-4 space-y-3">
        {filteredChunks.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无分段" />
        ) : (
          filteredChunks.map((chunk, index) => {
            const content = editedMap[chunk.id] ?? chunk.content;
            const isEditing = editingId === chunk.id;
            return (
            <div
              key={chunk.id}
              id={`chunk-item-${chunk.id}`}
              className={`group rounded-lg border p-3 shadow-sm cursor-pointer transition ${
                chunk.id === selectedChunkId
                  ? 'border-blue-400 bg-blue-50'
                  : chunk.chapterId && chunk.chapterId === selectedChapterId
                  ? 'border-blue-200 bg-blue-50/50'
                  : 'border-gray-100'
              }`}
              onClick={() => onSelectChunk?.(chunk)}
            >
              <div className="flex items-center justify-between mb-2">
                <Text type="secondary">分段数: {chunk.index}</Text>
                <div className="flex items-center gap-2">
                  <Tag color="blue">字符数: {chunk.charCount}</Tag>
                  <Button
                    size="small"
                    type="text"
                    icon={<EditOutlined />}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingId(chunk.id);
                      setDraftValue(content);
                    }}
                  />
                </div>
              </div>
              {isEditing ? (
                <Input.TextArea
                  value={draftValue}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  onChange={(event) => setDraftValue(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  autoFocus
                  onPressEnter={(event) => {
                    event.preventDefault();
                    setEditedMap((prev) => ({ ...prev, [chunk.id]: draftValue }));
                    setEditingId(null);
                  }}
                  onBlur={() => {
                    setEditedMap((prev) => ({ ...prev, [chunk.id]: draftValue }));
                    setEditingId(null);
                  }}
                />
              ) : (
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
                    {content}
                  </ReactMarkdown>
                </div>
              )}
              {index < filteredChunks.length - 1 && (
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
