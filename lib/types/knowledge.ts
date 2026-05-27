/**
 * 知识库模块类型定义
 */

/**
 * 知识库状态
 */
export type KnowledgeStatus = 'active' | 'processing' | 'error';

/**
 * 文件类型
 */
export type FileDataType = 'text' | 'table';

/**
 * 解析策略
 */
export type ParseStrategy = 
  | 'text'      // 文字识别
  | 'ocr'       // 图片文字识别(OCR)
  | 'table'     // 表格解析
  | 'image';    // 图片提取

/**
 * 切片策略
 */
export type ChunkStrategy = 
  | 'auto'           // 自动切片
  | 'delimiter'      // 按常见标识符切分
  | 'page'           // 按页切分
  | 'regex'          // 自定义正则切分
  | 'hierarchy';     // 按层级切分

/**
 * 文档状态
 */
export type DocumentStatus = 'uploading' | 'parsing' | 'chunking' | 'completed' | 'error';

/**
 * 知识库基本信息
 */
export interface KnowledgeBase {
  /** 知识库ID */
  id: string;
  /** 知识库名称 */
  name: string;
  /** 知识库描述 */
  description: string;
  /** 图标（emoji 或图片URL） */
  icon: string;
  /** 文件类型 */
  fileType: FileDataType;
  /** 文件总数 */
  fileCount: number;
  /** 字符总数 */
  charCount: number;
  /** 切片总数 */
  chunkCount: number;
  /** 状态 */
  status: KnowledgeStatus;
  /** 标签 */
  tags: string[];
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 知识库配置
 */
export interface KnowledgeConfig {
  /** 解析策略 */
  parseStrategy: ParseStrategy;
  /** 切片策略 */
  chunkStrategy: ChunkStrategy;
  /** 切片大小（字符数） */
  chunkSize: number;
  /** 切片重叠（字符数） */
  chunkOverlap: number;
  /** 自定义分隔符（delimiter 策略使用） */
  delimiter?: string;
  /** 自定义正则（regex 策略使用） */
  regexPattern?: string;
}

/**
 * 文档信息
 */
export interface KnowledgeDocument {
  /** 文档ID */
  id: string;
  /** 知识库ID */
  knowledgeBaseId: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 文件类型 */
  type: string;
  /** 字符总数 */
  charCount: number;
  /** 切片数量 */
  chunkCount: number;
  /** 状态 */
  status: DocumentStatus;
  /** 错误信息 */
  errorMessage?: string;
  /** 上传时间 */
  uploadedAt: string;
  /** 解析完成时间 */
  parsedAt?: string;
}

/**
 * 文档章节（目录树节点）
 */
export interface DocumentChapter {
  /** 章节ID */
  id: string;
  /** 标题 */
  title: string;
  /** 层级（1-6） */
  level: number;
  /** 在原文中的起始位置 */
  startIndex: number;
  /** 在原文中的结束位置 */
  endIndex: number;
  /** 子章节 */
  children?: DocumentChapter[];
}

/**
 * 文档切片
 */
export interface DocumentChunk {
  /** 切片ID */
  id: string;
  /** 文档ID */
  documentId: string;
  /** 切片内容 */
  content: string;
  /** 字符数 */
  charCount: number;
  /** 切片序号 */
  index: number;
  /** 所属章节ID */
  chapterId?: string;
  /** 在原文中的起始位置 */
  startIndex: number;
  /** 在原文中的结束位置 */
  endIndex: number;
  /** 标签 */
  tags?: string[];
}

/**
 * 文档详情（包含原文、目录、切片）
 */
export interface DocumentDetail {
  /** 文档基本信息 */
  document: KnowledgeDocument;
  /** 原文内容 */
  content: string;
  /** 目录树 */
  chapters: DocumentChapter[];
  /** 切片列表 */
  chunks: DocumentChunk[];
}

/**
 * 命中测试结果
 */
export interface HitTestResult {
  /** 切片 */
  chunk: DocumentChunk;
  /** 相似度分数 */
  score: number;
  /** 匹配的关键词 */
  matchedKeywords?: string[];
}

/**
 * 命中测试历史记录
 */
export interface HitTestHistory {
  /** 记录ID */
  id: string;
  /** 查询文本 */
  query: string;
  /** 命中结果 */
  results: HitTestResult[];
  /** 测试时间 */
  testedAt: string;
}

/**
 * 创建知识库请求
 */
export interface CreateKnowledgeBaseRequest {
  name: string;
  description: string;
  icon: string;
  fileType: FileDataType;
  config: KnowledgeConfig;
  tags?: string[];
}

/**
 * 更新知识库请求
 */
export interface UpdateKnowledgeBaseRequest {
  name?: string;
  description?: string;
  icon?: string;
  config?: Partial<KnowledgeConfig>;
  tags?: string[];
}

/**
 * 标签
 */
export interface KnowledgeTag {
  /** 标签ID */
  id: string;
  /** 标签名称 */
  name: string;
  /** 标签颜色 */
  color: string;
  /** 使用次数 */
  count: number;
}
