/**
 * 知识库 Mock 数据
 * 
 * 提供预置的示例数据，用于演示和测试
 */

import type {
  KnowledgeBase,
  KnowledgeDocument,
  DocumentDetail,
  DocumentChapter,
  DocumentChunk,
  KnowledgeTag,
} from '@/lib/types/knowledge';

/**
 * 预置标签
 */
export const MOCK_TAGS: KnowledgeTag[] = [
  { id: 'tag_1', name: '设备手册', color: '#0f766e', count: 2 },
  { id: 'tag_2', name: '故障代码', color: '#f97316', count: 1 },
  { id: 'tag_3', name: '点检规范', color: '#16a34a', count: 1 },
  { id: 'tag_4', name: '安全规程', color: '#dc2626', count: 1 },
];

/**
 * 预置知识库列表
 */
export const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: 'kb_001',
    name: '工业设备手册知识库',
    description: '收录电机、泵站、输送线等常见设备的维护手册、点检项和操作规程',
    icon: '🏭',
    fileType: 'text',
    fileCount: 3,
    charCount: 24680,
    chunkCount: 46,
    status: 'active',
    tags: ['设备手册', '点检规范'],
    createdAt: '2025-12-20T10:00:00.000Z',
    updatedAt: '2025-12-22T15:30:00.000Z',
  },
  {
    id: 'kb_002',
    name: '设备故障代码表',
    description: '包含电机过热、变频器报警、轴承振动、传感器异常等故障代码与处理建议',
    icon: '🧰',
    fileType: 'table',
    fileCount: 2,
    charCount: 18450,
    chunkCount: 38,
    status: 'active',
    tags: ['故障代码', '设备手册'],
    createdAt: '2025-12-18T09:00:00.000Z',
    updatedAt: '2025-12-21T11:20:00.000Z',
  },
  {
    id: 'kb_003',
    name: '产线点检与安全规程',
    description: '用于演示工业知识问答的巡检清单、保养周期和安全停机流程',
    icon: '📋',
    fileType: 'text',
    fileCount: 1,
    charCount: 9200,
    chunkCount: 16,
    status: 'active',
    tags: ['点检规范', '安全规程'],
    createdAt: '2025-12-22T14:00:00.000Z',
    updatedAt: '2025-12-22T14:00:00.000Z',
  },
];

/**
 * 预置文档列表
 */
export const MOCK_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'doc_001',
    knowledgeBaseId: 'kb_001',
    name: '三相异步电机维护手册.pdf',
    size: 1024000,
    type: 'application/pdf',
    charCount: 9800,
    chunkCount: 20,
    status: 'completed',
    uploadedAt: '2025-12-20T10:30:00.000Z',
    parsedAt: '2025-12-20T10:35:00.000Z',
  },
  {
    id: 'doc_002',
    knowledgeBaseId: 'kb_001',
    name: '离心泵巡检与保养规范.docx',
    size: 512000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    charCount: 7180,
    chunkCount: 14,
    status: 'completed',
    uploadedAt: '2025-12-21T09:00:00.000Z',
    parsedAt: '2025-12-21T09:05:00.000Z',
  },
  {
    id: 'doc_003',
    knowledgeBaseId: 'kb_002',
    name: '变频器与电机故障代码表.xlsx',
    size: 256000,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    charCount: 12000,
    chunkCount: 25,
    status: 'completed',
    uploadedAt: '2025-12-18T09:30:00.000Z',
    parsedAt: '2025-12-18T09:32:00.000Z',
  },
];

/**
 * Mock 文档原文内容
 */
const MOCK_DOCUMENT_CONTENT = `# 三相异步电机维护手册

## 第一章 设备概述

### 1.1 设备简介

本手册用于演示工业互联网场景下的知识库问答。设备对象为产线常见三相异步电机，适用于输送线、风机、水泵等连续运行场景。

关键部件：
- 电机本体与定子绕组
- 轴承、联轴器与负载端
- 散热风扇与通风道
- 温度、振动、电流传感器

### 1.2 常见告警

1. E101：电机温度超过 85℃
2. E203：轴承振动 RMS 超过 7.1mm/s
3. E307：变频器输出电流异常波动
4. E410：散热风扇转速低于阈值

## 第二章 故障诊断流程

### 2.1 电机过热

当出现电机过热时，建议按以下顺序排查：

1. 检查散热风扇是否运转，清理风罩与通风道积尘。
2. 查看负载端是否卡滞，确认轴承温度和润滑状态。
3. 读取三相电流是否平衡，判断是否存在缺相或过载。
4. 核对变频器频率与加减速参数，避免长期低频大负载运行。
5. 若温度持续升高，应降载或停机，并安排维护人员复检。

### 2.2 振动异常

振动异常通常与轴承磨损、联轴器不对中、底座松动或负载不平衡有关。

排查建议：
- 对比水平、垂直、轴向三个方向的振动数据。
- 检查地脚螺栓、联轴器键槽和轴承座。
- 若伴随尖锐噪声，优先检查轴承润滑和滚道损伤。

### 2.3 故障代码表

| 故障代码 | 现象 | 建议处理 |
| --- | --- | --- |
| E101 | 电机温度过高 | 检查风扇、负载、电流与通风环境 |
| E203 | 轴承振动偏高 | 检查轴承润滑、同轴度与地脚螺栓 |
| E307 | 变频器输出异常 | 检查参数、负载波动与电缆接线 |
| E410 | 风扇转速低 | 清理风道，检查风扇电源与叶轮 |

## 第三章 点检规范

### 3.1 日常点检

- 记录电机表面温度、环境温度与运行电流。
- 检查风扇声音和出风口气流。
- 观察是否存在异响、焦味、漏油和异常振动。

### 3.2 周期保养

- 每周清理风罩和通风道积尘。
- 每月检查轴承温度和润滑状态。
- 每季度复核联轴器同轴度和紧固件扭矩。

## 第四章 安全注意事项

维护前必须执行断电、挂牌、验电流程。涉及高温、旋转部件或变频器柜内操作时，应由具备资质的维护人员执行。
`;

/**
 * Mock 章节目录
 */
const MOCK_CHAPTERS: DocumentChapter[] = [
  {
    id: 'ch_1',
    title: '三相异步电机维护手册',
    level: 1,
    startIndex: 0,
    endIndex: 2850,
    children: [
      {
        id: 'ch_1_1',
        title: '第一章 设备概述',
        level: 2,
        startIndex: 20,
        endIndex: 580,
        children: [
          { id: 'ch_1_1_1', title: '1.1 设备简介', level: 3, startIndex: 42, endIndex: 320 },
          { id: 'ch_1_1_2', title: '1.2 常见告警', level: 3, startIndex: 322, endIndex: 580 },
        ],
      },
      {
        id: 'ch_1_2',
        title: '第二章 故障诊断流程',
        level: 2,
        startIndex: 582,
        endIndex: 1450,
        children: [
          { id: 'ch_1_2_1', title: '2.1 电机过热', level: 3, startIndex: 605, endIndex: 920 },
          { id: 'ch_1_2_2', title: '2.2 振动异常', level: 3, startIndex: 922, endIndex: 1250 },
          { id: 'ch_1_2_3', title: '2.3 故障代码表', level: 3, startIndex: 1252, endIndex: 1450 },
        ],
      },
      {
        id: 'ch_1_3',
        title: '第三章 点检规范',
        level: 2,
        startIndex: 1452,
        endIndex: 2100,
        children: [
          { id: 'ch_1_3_1', title: '3.1 日常点检', level: 3, startIndex: 1475, endIndex: 1650 },
          { id: 'ch_1_3_2', title: '3.2 周期保养', level: 3, startIndex: 1652, endIndex: 1880 },
        ],
      },
      {
        id: 'ch_1_4',
        title: '第四章 安全注意事项',
        level: 2,
        startIndex: 2102,
        endIndex: 2850,
        children: [
          { id: 'ch_1_4_1', title: '4.1 停机断电', level: 3, startIndex: 2125, endIndex: 2380 },
          { id: 'ch_1_4_2', title: '4.2 维护复检', level: 3, startIndex: 2382, endIndex: 2600 },
        ],
      },
    ],
  },
];

/**
 * Mock 切片数据
 */
const DEMO_MARKDOWN = `设备运行指标示例：

| 指标 | 当前值 | 阈值 |
| --- | --- | --- |
| 电机温度 | 88℃ | 85℃ |
| 轴承振动 RMS | 7.6mm/s | 7.1mm/s |
| 三相电流不平衡度 | 9% | 10% |

判定示例：当电机温度大于 85℃ 时触发过热告警。
`;

const MOCK_CHUNKS: DocumentChunk[] = [
  {
    id: 'chunk_001',
    documentId: 'doc_001',
    content: DEMO_MARKDOWN,
    charCount: DEMO_MARKDOWN.length,
    index: 1,
    chapterId: 'ch_1_1_1',
    startIndex: 42,
    endIndex: 228,
  },
  {
    id: 'chunk_002',
    documentId: 'doc_001',
    content: '本手册面向输送线、风机、水泵等连续运行场景中的三相异步电机，重点覆盖电机本体、定子绕组、轴承、联轴器、散热风扇和温振电传感器。',
    charCount: 70,
    index: 2,
    chapterId: 'ch_1_1_1',
    startIndex: 322,
    endIndex: 400,
  },
  {
    id: 'chunk_003',
    documentId: 'doc_001',
    content: '常见告警包括 E101 电机温度超过 85℃、E203 轴承振动 RMS 超过 7.1mm/s、E307 变频器输出电流异常波动、E410 散热风扇转速低于阈值。',
    charCount: 82,
    index: 3,
    chapterId: 'ch_1_1_2',
    startIndex: 605,
    endIndex: 761,
  },
  {
    id: 'chunk_004',
    documentId: 'doc_001',
    content: '电机过热时，应先检查散热风扇和通风道积尘，再查看负载端是否卡滞、轴承温度和润滑状态，并读取三相电流判断是否缺相或过载。',
    charCount: 67,
    index: 4,
    chapterId: 'ch_1_2_1',
    startIndex: 922,
    endIndex: 1064,
  },
  {
    id: 'chunk_005',
    documentId: 'doc_001',
    content: '振动异常通常与轴承磨损、联轴器不对中、底座松动或负载不平衡有关。建议对比水平、垂直、轴向三个方向的振动数据。',
    charCount: 61,
    index: 5,
    chapterId: 'ch_1_2_2',
    startIndex: 1252,
    endIndex: 1308,
  },
  {
    id: 'chunk_006',
    documentId: 'doc_001',
    content: '故障代码 E101 表示电机温度过高，建议检查风扇、负载、电流与通风环境；E203 表示轴承振动偏高，建议检查轴承润滑、同轴度与地脚螺栓。',
    charCount: 75,
    index: 6,
    chapterId: 'ch_1_2_3',
    startIndex: 1475,
    endIndex: 1543,
  },
  {
    id: 'chunk_007',
    documentId: 'doc_001',
    content: '日常点检需要记录电机表面温度、环境温度和运行电流，检查风扇声音与出风口气流，并观察是否存在异响、焦味、漏油和异常振动。',
    charCount: 66,
    index: 7,
    chapterId: 'ch_1_3_1',
    startIndex: 1652,
    endIndex: 1738,
  },
  {
    id: 'chunk_008',
    documentId: 'doc_001',
    content: '周期保养建议每周清理风罩和通风道积尘，每月检查轴承温度和润滑状态，每季度复核联轴器同轴度和紧固件扭矩。',
    charCount: 58,
    index: 8,
    chapterId: 'ch_1_3_2',
    startIndex: 1882,
    endIndex: 1954,
  },
  {
    id: 'chunk_009',
    documentId: 'doc_001',
    content: '维护前必须执行断电、挂牌、验电流程。涉及高温、旋转部件或变频器柜内操作时，应由具备资质的维护人员执行。',
    charCount: 55,
    index: 9,
    chapterId: 'ch_1_4_1',
    startIndex: 2125,
    endIndex: 2207,
  },
  {
    id: 'chunk_010',
    documentId: 'doc_001',
    content: '若温度或振动在处理后仍持续升高，应降载或停机，复核传感器读数，并安排维护人员对轴承、联轴器和变频器参数进行复检。',
    charCount: 63,
    index: 10,
    chapterId: 'ch_1_4_2',
    startIndex: 2382,
    endIndex: 2460,
  },
];

/**
 * 生成 Mock 文档详情（用于没有真实解析时的演示）
 */
export const createMockDocumentDetail = (
  document: KnowledgeDocument
): DocumentDetail => {
  const chunks = MOCK_CHUNKS.map((chunk, index) => ({
    ...chunk,
    id: `${document.id}_chunk_${index + 1}`,
    documentId: document.id,
    index: index + 1,
  }));

  return {
    document,
    content: MOCK_DOCUMENT_CONTENT,
    chapters: MOCK_CHAPTERS,
    chunks,
  };
};

/**
 * 获取 Mock 文档详情
 */
export const getMockDocumentDetail = (documentId: string): DocumentDetail | null => {
  if (documentId === 'doc_001') {
    return createMockDocumentDetail(MOCK_DOCUMENTS[0]);
  }
  return null;
};

const readStorageArray = <T,>(key: string): T[] => {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const mergeById = <T extends { id: string }>(existing: T[], defaults: T[]): T[] => {
  const existingIds = new Set(existing.map((item) => item.id));
  return [...existing, ...defaults.filter((item) => !existingIds.has(item.id))];
};

/**
 * 初始化 Mock 数据到 localStorage
 */
export const initMockData = (): void => {
  if (typeof window === 'undefined') return;

  const existingBases = readStorageArray<KnowledgeBase>('knowledge_bases');
  const existingDocuments = readStorageArray<KnowledgeDocument>('knowledge_documents');
  const existingTags = readStorageArray<KnowledgeTag>('knowledge_tags');

  const mergedBases = mergeById(existingBases, MOCK_KNOWLEDGE_BASES);
  const mergedDocuments = mergeById(existingDocuments, MOCK_DOCUMENTS);
  const mergedTags = mergeById(existingTags, MOCK_TAGS);

  localStorage.setItem('knowledge_bases', JSON.stringify(mergedBases));
  localStorage.setItem('knowledge_documents', JSON.stringify(mergedDocuments));
  localStorage.setItem('knowledge_tags', JSON.stringify(mergedTags));

  const detail = getMockDocumentDetail('doc_001');
  if (detail && !localStorage.getItem('document_detail_doc_001')) {
    localStorage.setItem('document_detail_doc_001', JSON.stringify(detail));
  }

  localStorage.setItem('knowledge_mock_initialized', 'true');
};
