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
    name: '工业互联网设备运维知识库',
    description: '沉淀设备联网、边缘采集、告警诊断、健康评分和工单闭环等工业互联网运维知识',
    icon: '🏭',
    fileType: 'text',
    fileCount: 4,
    charCount: 32680,
    chunkCount: 58,
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
    name: '设备联网与边缘采集方案.pdf',
    size: 1280000,
    type: 'application/pdf',
    charCount: 12800,
    chunkCount: 24,
    status: 'completed',
    uploadedAt: '2025-12-20T10:30:00.000Z',
    parsedAt: '2025-12-20T10:35:00.000Z',
  },
  {
    id: 'doc_002',
    knowledgeBaseId: 'kb_001',
    name: '产线设备状态监测与预测性维护规范.docx',
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
const MOCK_DOCUMENT_CONTENT = `# 工业互联网设备联网与运维知识库

## 第一章 工业互联网接入架构

### 1.1 场景说明

本知识库面向离散制造、流程工业和园区设备运维场景，用于沉淀设备联网、边缘采集、实时告警、健康评估和工单闭环等知识。平台通过边缘网关接入 PLC、传感器、数采仪和 SCADA 系统，将温度、振动、电流、压力、流量、转速等指标统一映射为设备资产模型。

典型接入对象：
- PLC、变频器、数控机床、机器人控制柜
- 电机、泵站、空压机、输送线、风机等关键设备
- 温振一体传感器、电流互感器、压力/流量仪表
- SCADA、MES、CMMS、能源管理系统等工业系统

### 1.2 数据采集协议

边缘网关需要根据现场设备类型选择采集协议。PLC 和控制器优先使用 OPC UA、Modbus TCP、S7、EtherNet/IP 等协议；老旧设备可通过串口网关、IO 模块或边缘采集盒补齐数据。采集点位需配置点位编码、单位、采样周期、阈值、数据质量标记和所属设备资产。

常见采集规则：
1. 关键安全指标建议 1-5 秒采集一次，如温度、振动、电流、压力。
2. 产量、节拍、状态类数据可按 10-60 秒采集。
3. 采集失败、越界、突变、长时间不变的数据需要打上质量标签。
4. 所有点位应关联设备、产线、工位和维护责任人。

## 第二章 设备健康监测

### 2.1 健康评分模型

设备健康评分由实时指标、历史趋势、告警等级和维修记录共同计算。系统会对温度、振动、电流、压力、能耗、开机率、停机次数等指标进行归一化处理，并结合设备类型设置权重。评分低于 70 分时进入关注状态，低于 50 分时建议生成检修工单。

健康评分输入：
- 实时指标：温度、振动 RMS、电流负载率、压力波动
- 运行状态：开机、待机、报警、停机、离线
- 历史趋势：近 7 天均值、峰值、异常次数和劣化斜率
- 维护记录：最近保养时间、故障次数、平均修复时长

### 2.2 告警分级

工业互联网平台应将设备告警分为提示、一般、严重和紧急四级。告警规则不仅判断单点阈值，还要结合持续时间、变化速率、关联指标和设备工况。例如电机温度升高需要同时查看负载电流、环境温度、风扇转速和振动趋势。

| 告警等级 | 判定示例 | 处理策略 |
| --- | --- | --- |
| 提示 | 指标短时接近阈值 | 记录趋势，提醒点检 |
| 一般 | 指标连续 5 分钟超限 | 通知班组，安排现场确认 |
| 严重 | 多指标同时异常或健康分低于 50 | 生成工单，限制设备负载 |
| 紧急 | 存在安全风险或联锁停机 | 立即停机，执行安全处置流程 |

## 第三章 告警诊断与工单闭环

### 3.1 告警诊断流程

当平台收到设备异常告警后，应先确认数据质量，再判断是否存在设备离线、点位漂移或传感器故障。确认数据有效后，系统根据设备模型检索相关知识库，包括设备手册、历史故障案例、点检规范和备件信息，生成初步诊断建议。

诊断步骤：
1. 校验采集链路是否正常，确认网关在线、点位有值、时间戳连续。
2. 对比同类设备和历史基线，判断异常是否为单机问题。
3. 关联上下游工序状态，排除工艺参数变化导致的误报。
4. 检索故障案例和维护手册，生成原因分析与处理建议。
5. 将诊断结论推送到 CMMS 或工单系统，形成处理闭环。

### 3.2 工单联动

严重告警应自动生成维修工单，工单需包含设备编号、产线位置、告警时间、异常指标、趋势截图、推荐处理步骤和安全注意事项。维修完成后，系统需要回写处理结果，并将故障原因、备件更换和停机时长纳入知识库，用于后续相似告警推荐。

## 第四章 数据治理与平台运维

### 4.1 数据质量

工业数据在采集过程中常出现丢包、重复、异常跳变、单位不一致和点位命名不规范等问题。平台需要建立数据质量规则，对每个点位输出质量状态，避免低质量数据进入诊断模型和报表分析。

### 4.2 运行指标

工业互联网平台运行指标包括网关在线率、点位采集成功率、告警确认时长、工单闭环率、设备 OEE、平均故障间隔时间和平均修复时间。运维团队应每日查看异常设备清单，并按产线、设备类型和告警等级进行优先级排序。
`;

/**
 * Mock 章节目录
 */
const MOCK_CHAPTERS: DocumentChapter[] = [
  {
    id: 'ch_1',
    title: '工业互联网设备联网与运维知识库',
    level: 1,
    startIndex: 0,
    endIndex: 2850,
    children: [
      {
        id: 'ch_1_1',
        title: '第一章 工业互联网接入架构',
        level: 2,
        startIndex: 20,
        endIndex: 580,
        children: [
          { id: 'ch_1_1_1', title: '1.1 场景说明', level: 3, startIndex: 42, endIndex: 320 },
          { id: 'ch_1_1_2', title: '1.2 数据采集协议', level: 3, startIndex: 322, endIndex: 580 },
        ],
      },
      {
        id: 'ch_1_2',
        title: '第二章 设备健康监测',
        level: 2,
        startIndex: 582,
        endIndex: 1450,
        children: [
          { id: 'ch_1_2_1', title: '2.1 健康评分模型', level: 3, startIndex: 605, endIndex: 920 },
          { id: 'ch_1_2_2', title: '2.2 告警分级', level: 3, startIndex: 922, endIndex: 1250 },
          { id: 'ch_1_2_3', title: '2.3 告警规则表', level: 3, startIndex: 1252, endIndex: 1450 },
        ],
      },
      {
        id: 'ch_1_3',
        title: '第三章 告警诊断与工单闭环',
        level: 2,
        startIndex: 1452,
        endIndex: 2100,
        children: [
          { id: 'ch_1_3_1', title: '3.1 告警诊断流程', level: 3, startIndex: 1475, endIndex: 1650 },
          { id: 'ch_1_3_2', title: '3.2 工单联动', level: 3, startIndex: 1652, endIndex: 1880 },
        ],
      },
      {
        id: 'ch_1_4',
        title: '第四章 数据治理与平台运维',
        level: 2,
        startIndex: 2102,
        endIndex: 2850,
        children: [
          { id: 'ch_1_4_1', title: '4.1 数据质量', level: 3, startIndex: 2125, endIndex: 2380 },
          { id: 'ch_1_4_2', title: '4.2 运行指标', level: 3, startIndex: 2382, endIndex: 2600 },
        ],
      },
    ],
  },
];

/**
 * Mock 切片数据
 */
const DEMO_MARKDOWN = `工业互联网设备运行指标示例：

| 指标 | 当前值 | 阈值 | 数据来源 |
| --- | --- | --- | --- |
| 网关在线率 | 98.7% | 99% | 边缘网关 |
| 点位采集成功率 | 96.4% | 98% | OPC UA / Modbus |
| 设备健康评分 | 64 | 70 | 健康模型 |
| 告警确认时长 | 18 分钟 | 15 分钟 | 工单系统 |

判定示例：当设备健康评分低于 70 且振动趋势持续上升时，平台应生成预测性维护建议。
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
    content: '本知识库面向工业互联网设备运维场景，覆盖边缘网关接入、点位采集、设备资产建模、实时告警、健康评分和工单闭环等核心知识。',
    charCount: 70,
    index: 2,
    chapterId: 'ch_1_1_1',
    startIndex: 322,
    endIndex: 400,
  },
  {
    id: 'chunk_003',
    documentId: 'doc_001',
    content: '边缘网关根据现场设备类型选择 OPC UA、Modbus TCP、S7、EtherNet/IP 等协议，并为点位配置单位、采样周期、阈值和数据质量标记。',
    charCount: 82,
    index: 3,
    chapterId: 'ch_1_1_2',
    startIndex: 605,
    endIndex: 761,
  },
  {
    id: 'chunk_004',
    documentId: 'doc_001',
    content: '设备健康评分由实时指标、历史趋势、告警等级和维修记录共同计算。评分低于 70 分进入关注状态，低于 50 分建议生成检修工单。',
    charCount: 67,
    index: 4,
    chapterId: 'ch_1_2_1',
    startIndex: 922,
    endIndex: 1064,
  },
  {
    id: 'chunk_005',
    documentId: 'doc_001',
    content: '告警规则不仅判断单点阈值，还要结合持续时间、变化速率、关联指标和设备工况，避免因工艺切换或传感器漂移造成误报。',
    charCount: 61,
    index: 5,
    chapterId: 'ch_1_2_2',
    startIndex: 1252,
    endIndex: 1308,
  },
  {
    id: 'chunk_006',
    documentId: 'doc_001',
    content: '严重告警应自动生成维修工单，工单包含设备编号、产线位置、异常指标、趋势截图、推荐处理步骤和安全注意事项。',
    charCount: 75,
    index: 6,
    chapterId: 'ch_1_2_3',
    startIndex: 1475,
    endIndex: 1543,
  },
  {
    id: 'chunk_007',
    documentId: 'doc_001',
    content: '诊断流程需要先校验采集链路，确认网关在线、点位有值、时间戳连续，再关联历史基线、上下游工序和知识库案例。',
    charCount: 66,
    index: 7,
    chapterId: 'ch_1_3_1',
    startIndex: 1652,
    endIndex: 1738,
  },
  {
    id: 'chunk_008',
    documentId: 'doc_001',
    content: '维修完成后，系统需要回写处理结果，并将故障原因、备件更换和停机时长纳入知识库，用于后续相似告警推荐。',
    charCount: 58,
    index: 8,
    chapterId: 'ch_1_3_2',
    startIndex: 1882,
    endIndex: 1954,
  },
  {
    id: 'chunk_009',
    documentId: 'doc_001',
    content: '工业数据常出现丢包、重复、异常跳变、单位不一致和点位命名不规范等问题，平台应为每个点位输出数据质量状态。',
    charCount: 55,
    index: 9,
    chapterId: 'ch_1_4_1',
    startIndex: 2125,
    endIndex: 2207,
  },
  {
    id: 'chunk_010',
    documentId: 'doc_001',
    content: '平台运行指标包括网关在线率、点位采集成功率、告警确认时长、工单闭环率、设备 OEE、平均故障间隔时间和平均修复时间。',
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
  const defaultIds = new Set(defaults.map((item) => item.id));
  return [
    ...existing.filter((item) => !defaultIds.has(item.id)),
    ...defaults,
  ];
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
  if (detail) {
    localStorage.setItem('document_detail_doc_001', JSON.stringify(detail));
  }

  localStorage.setItem('knowledge_mock_initialized', 'true');
};
