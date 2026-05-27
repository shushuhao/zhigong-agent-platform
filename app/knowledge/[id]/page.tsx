'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Empty, Segmented, Space, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layouts/MainLayout';
import { DocumentPreview } from '@/components/knowledge/DocumentPreview';
import { ChapterTree } from '@/components/knowledge/ChapterTree';
import { ChunkList } from '@/components/knowledge/ChunkList';
import { HitResultList } from '@/components/knowledge/HitResultList';
import { HitTestPanel, type HitTestStrategy } from '@/components/knowledge/HitTestPanel';
import { knowledgeService } from '@/lib/services/knowledge.service';
import { initMockData, MOCK_DOCUMENTS, MOCK_KNOWLEDGE_BASES, getMockDocumentDetail } from '@/lib/services/knowledge.mock';
import type {
  DocumentDetail,
  KnowledgeBase,
  KnowledgeDocument,
  HitTestHistory,
  HitTestResult,
} from '@/lib/types/knowledge';

const { Text } = Typography;

const statusColorMap: Record<string, string> = {
  uploading: 'blue',
  parsing: 'gold',
  chunking: 'purple',
  completed: 'green',
  error: 'red',
};

const buildMockHitResults = (detail: DocumentDetail | null): HitTestResult[] => {
  if (!detail?.chunks?.length) return [];
  const scores = [0.92, 0.86, 0.78, 0.62, 0.45];
  const keywords = ['电机过热', '故障代码', '点检', '振动'];
  return detail.chunks.slice(0, scores.length).map((chunk, index) => ({
    chunk,
    score: scores[index] ?? 0.4,
    matchedKeywords: keywords.slice(0, (index % 2) + 1),
  }));
};

export default function KnowledgeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const knowledgeBaseId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(() =>
    MOCK_KNOWLEDGE_BASES.find((base) => base.id === knowledgeBaseId) || null
  );
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(() =>
    knowledgeBaseId ? MOCK_DOCUMENTS.filter((doc) => doc.knowledgeBaseId === knowledgeBaseId) : []
  );
  const [selectedDocId, setSelectedDocId] = useState<string>(() =>
    knowledgeBaseId ? MOCK_DOCUMENTS.find((doc) => doc.knowledgeBaseId === knowledgeBaseId)?.id || '' : ''
  );
  const [detail, setDetail] = useState<DocumentDetail | null>(() =>
    selectedDocId ? getMockDocumentDetail(selectedDocId) : null
  );
  const [chunkKeyword, setChunkKeyword] = useState('');
  const [isContentHidden, setIsContentHidden] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedChunkId, setSelectedChunkId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'segments' | 'hitTest'>('segments');
  const [hitQuery, setHitQuery] = useState('');
  const [hitResults, setHitResults] = useState<HitTestResult[]>([]);
  const [hitHistory, setHitHistory] = useState<HitTestHistory[]>([]);
  const [hitResultKeyword, setHitResultKeyword] = useState('');
  const [hitStrategy, setHitStrategy] = useState<HitTestStrategy>({
    topK: 5,
    scoreThreshold: 0.2,
  });
  const [selectedHitChunkId, setSelectedHitChunkId] = useState('');
  const [isHitTesting, setIsHitTesting] = useState(false);

  useEffect(() => {
    if (!knowledgeBaseId) return;
    initMockData();

    const base = knowledgeService.getKnowledgeBaseById(knowledgeBaseId)
      || MOCK_KNOWLEDGE_BASES.find((item) => item.id === knowledgeBaseId)
      || null;
    const docs = knowledgeService.getDocumentsByKnowledgeBaseId(knowledgeBaseId);
    const fallbackDocs = MOCK_DOCUMENTS.filter((doc) => doc.knowledgeBaseId === knowledgeBaseId);
    const nextDocs = docs.length > 0 ? docs : fallbackDocs;
    setKnowledgeBase(base);
    setDocuments(nextDocs);
    setSelectedDocId((prev) => prev || nextDocs[0]?.id || '');
  }, [knowledgeBaseId]);

  useEffect(() => {
    if (!selectedDocId) {
      setDetail(null);
      return;
    }
    const nextDetail = knowledgeService.getDocumentDetail(selectedDocId) || getMockDocumentDetail(selectedDocId);
    setDetail(nextDetail);
    setSelectedChapterId('');
    setSelectedChunkId('');
  }, [selectedDocId]);

  useEffect(() => {
    if (!knowledgeBaseId) return;
    const history = knowledgeService.getHitTestHistory(knowledgeBaseId);
    setHitHistory(history);
  }, [knowledgeBaseId]);

  useEffect(() => {
    if (activeTab !== 'hitTest') return;
    if (hitResults.length > 0) return;
    const mockResults = buildMockHitResults(detail);
    if (mockResults.length === 0) return;
    setHitResults(mockResults);
    setSelectedHitChunkId(mockResults[0]?.chunk.id || '');
  }, [activeTab, detail, hitResults.length]);

  const selectedDocument = documents.find((doc) => doc.id === selectedDocId);
  const selectedChunk = detail?.chunks.find((chunk) => chunk.id === selectedChunkId);

  const handleRunHitTest = () => {
    if (!knowledgeBaseId) return;
    const trimmed = hitQuery.trim();
    if (!trimmed) {
      message.warning('请输入测试内容');
      return;
    }
    setIsHitTesting(true);
    const rawResults = knowledgeService.hitTest(knowledgeBaseId, trimmed);
    const filteredResults = rawResults
      .filter((item) => item.score >= hitStrategy.scoreThreshold)
      .slice(0, hitStrategy.topK);

    setHitResults(filteredResults);
    setSelectedHitChunkId(filteredResults[0]?.chunk.id || '');

    const historyItem: HitTestHistory = {
      id: `hit_${Date.now()}`,
      query: trimmed,
      results: filteredResults,
      testedAt: new Date().toISOString(),
    };
    const nextHistory = knowledgeService.appendHitTestHistory(knowledgeBaseId, historyItem);
    setHitHistory(nextHistory);
    setIsHitTesting(false);
  };

  const handleSelectHistory = (item: HitTestHistory) => {
    setHitQuery(item.query);
    setHitResults(item.results);
    setSelectedHitChunkId(item.results[0]?.chunk.id || '');
  };

  const handleClearHistory = () => {
    if (!knowledgeBaseId) return;
    knowledgeService.saveHitTestHistory(knowledgeBaseId, []);
    setHitHistory([]);
  };

  if (!knowledgeBaseId || !knowledgeBase) {
    return (
      <MainLayout>
        <Empty description="知识库不存在或已被删除" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-3 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/knowledge/list')} />
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900 truncate">{knowledgeBase.name}</div>
              <div className="text-gray-500 text-sm">文件分段与目录树</div>
            </div>
          </div>
          <div className="flex flex-1 justify-center">
            <Segmented
              size="middle"
              value={activeTab}
              onChange={(value) => setActiveTab(value as 'segments' | 'hitTest')}
              options={[
                { label: '文件分段', value: 'segments' },
                { label: '命中测试', value: 'hitTest' },
              ]}
            />
          </div>
        </div>
      </div>

      {activeTab === 'segments' && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-white px-3 py-2 shadow-sm">
          <Space size="small" className="min-w-0">
            {/* <div className="flex items-center gap-2">
              <FileTextOutlined className="text-gray-500" />
              <Text type="secondary">文件</Text>
            </div> */}
            <Text className="text-gray-800 max-w-[360px]" ellipsis>
              {selectedDocument?.name || '暂无文件'}
            </Text>
            <Text type="secondary" className="text-xs">
              文件数: {knowledgeBase.fileCount} · 字符数: {knowledgeBase.charCount} · 切片数: {knowledgeBase.chunkCount}
            </Text>
            {/* {selectedDocument && (
              <Tag color={statusColorMap[selectedDocument.status] || 'default'}>
                {selectedDocument.status}
              </Tag>
            )} */}
          </Space>
          <Space size="small" className="flex-shrink-0">
            <Button onClick={() => setIsContentHidden((prev) => !prev)}>
              {isContentHidden ? '显示原文文件' : '隐藏原文文件'}
            </Button>
        
          </Space>
        </div>
      )}

      {documents.length === 0 ? (
        <Empty description="暂无文档，请先上传文件" />
      ) : activeTab === 'segments' ? (
        <div
          className="gap-4"
          style={{
            display: 'grid',
            gridTemplateColumns: isContentHidden ? '4fr 8fr' : '6fr 3fr 3fr',
          }}
        >
          {!isContentHidden && (
            <div className="min-h-[540px] min-w-0">
              <DocumentPreview
                title={selectedDocument?.name || '原文'}
                content={detail?.content}
                highlightText={selectedChunk?.content}
                highlightRange={
                  selectedChunk
                    ? { startIndex: selectedChunk.startIndex, endIndex: selectedChunk.endIndex }
                    : undefined
                }
                enableScroll={!chunkKeyword.trim()}
              />
            </div>
          )}
          <div className="min-h-[540px] min-w-0">
            <ChapterTree
              chapters={detail?.chapters || []}
              selectedChapterId={selectedChapterId}
              onSelectChapter={(chapterId) => {
                setSelectedChapterId(chapterId);
                const firstChunk = detail?.chunks.find(
                  (chunk) => chunk.chapterId === chapterId
                );
                if (firstChunk) {
                  setSelectedChunkId(firstChunk.id);
                }
              }}
            />
          </div>
          <div className="min-h-[540px] min-w-0">
            <ChunkList
              chunks={detail?.chunks || []}
              keyword={chunkKeyword}
              onKeywordChange={setChunkKeyword}
              selectedChunkId={selectedChunkId}
              selectedChapterId={selectedChapterId}
              onSelectChunk={(chunk) => {
                setSelectedChunkId(chunk.id);
                if (chunk.chapterId) {
                  setSelectedChapterId(chunk.chapterId);
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className="gap-4"
          style={{
            display: 'grid',
            gridTemplateColumns: '7fr 5fr',
          }}
        >
          <HitTestPanel
            query={hitQuery}
            onQueryChange={setHitQuery}
            onRunTest={handleRunHitTest}
            history={hitHistory}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
            strategy={hitStrategy}
            onStrategyChange={setHitStrategy}
            isTesting={isHitTesting}
          />
          <HitResultList
            results={hitResults}
            keyword={hitResultKeyword}
            onKeywordChange={setHitResultKeyword}
            selectedChunkId={selectedHitChunkId}
            onSelectResult={(item) => setSelectedHitChunkId(item.chunk.id)}
          />
        </div>
      )}
    </MainLayout>
  );
}
