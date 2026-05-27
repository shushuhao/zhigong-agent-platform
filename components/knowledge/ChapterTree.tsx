'use client';

import React, { useMemo } from 'react';
import { Card, Empty, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { DocumentChapter } from '@/lib/types/knowledge';

interface ChapterTreeProps {
  chapters: DocumentChapter[];
  selectedChapterId?: string;
  onSelectChapter?: (chapterId: string) => void;
}

const mapChapterToNode = (chapter: DocumentChapter): DataNode => {
  return {
    key: chapter.id,
    title: chapter.title,
    children: chapter.children?.map(mapChapterToNode),
  };
};

export const ChapterTree: React.FC<ChapterTreeProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
}) => {
  const treeData = useMemo<DataNode[]>(() => {
    if (!chapters.length) return [];
    return [
      {
        key: 'root',
        title: 'root',
        children: chapters.map(mapChapterToNode),
      },
    ];
  }, [chapters]);

  return (
    <Card
      title="目录"
      className="h-full"
      styles={{ body: { height: '100%', padding: 0 } }}
    >
      <div className="h-full overflow-auto p-4">
        {treeData.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无目录" />
        ) : (
          <Tree
            defaultExpandAll
            treeData={treeData}
            className="bg-transparent"
            selectedKeys={selectedChapterId ? [selectedChapterId] : []}
            onSelect={(keys) => {
              const [key] = keys;
              if (typeof key === 'string' && key !== 'root') {
                onSelectChapter?.(key);
              }
            }}
          />
        )}
      </div>
    </Card>
  );
};
