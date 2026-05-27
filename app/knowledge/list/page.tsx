/**
 * 知识库列表页面
 */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
  DeleteOutlined,
  FileTextOutlined,
  TableOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { PortfolioHint } from '@/components/common/PortfolioHint';
import { knowledgeService } from '@/lib/services/knowledge.service';
import { initMockData, MOCK_KNOWLEDGE_BASES } from '@/lib/services/knowledge.mock';
import type { KnowledgeBase } from '@/lib/types/knowledge';

const { Text } = Typography;

/**
 * 格式化文件大小
 */
const formatCharCount = (count: number): string => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * 格式化日期
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function KnowledgeListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(MOCK_KNOWLEDGE_BASES);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 初始化加载数据
  useEffect(() => {
    // 初始化 Mock 数据
    initMockData();
    loadData();
  }, []);

  // 加载数据
  const loadData = () => {
    setLoading(true);
    try {
      const data = knowledgeService.getKnowledgeBases();
      setKnowledgeBases(data.length > 0 ? data : MOCK_KNOWLEDGE_BASES);
    } finally {
      setLoading(false);
    }
  };

  // 搜索过滤
  const filteredData = useMemo(() => {
    if (!searchKeyword.trim()) return knowledgeBases;

    const keyword = searchKeyword.trim().toLowerCase();
    return knowledgeBases.filter(
      (kb) =>
        kb.name.toLowerCase().includes(keyword) ||
        kb.description.toLowerCase().includes(keyword) ||
        kb.tags.some((tag) => tag.toLowerCase().includes(keyword))
    );
  }, [knowledgeBases, searchKeyword]);

  // 删除知识库
  const handleDelete = (id: string) => {
    const success = knowledgeService.deleteKnowledgeBase(id);
    if (success) {
      message.success('删除成功');
      loadData();
    } else {
      message.error('删除失败');
    }
  };

  // 表格列配置
  const columns: ColumnsType<KnowledgeBase> = [
    {
      title: '知识库名称',
      dataIndex: 'name',
      key: 'name',
      width: 320,
      render: (name: string, record: KnowledgeBase) => (
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex flex-shrink-0 items-center justify-center text-xl"
            style={{ backgroundColor: record.fileType === 'text' ? '#e6f4ff' : '#f6ffed' }}
          >
            {record.icon || (record.fileType === 'text' ? <FileTextOutlined className="text-blue-500" /> : <TableOutlined className="text-green-500" />)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{name}</div>
          </div>
        </div>
      ),
    },
    {
      title: '文件总数',
      dataIndex: 'fileCount',
      key: 'fileCount',
      width: 100,
      align: 'center',
      render: (count: number) => <span className="text-gray-600">{count}</span>,
    },
    {
      title: '字符总数',
      dataIndex: 'charCount',
      key: 'charCount',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <Tooltip title={`${count.toLocaleString()} 字符`}>
          <span className="text-gray-600">{formatCharCount(count)}</span>
        </Tooltip>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (desc: string) => (
        <Text type="secondary" ellipsis={{ tooltip: desc }}>
          {desc || '-'}
        </Text>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags?.slice(0, 2).map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
          {tags?.length > 2 && (
            <Tooltip title={tags.slice(2).join(', ')}>
              <Tag>+{tags.length - 2}</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => (
        <span className="text-gray-500 text-sm">{formatDate(date)}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record: KnowledgeBase) => (
        <Space size="middle">
          <Tooltip title="配置">
            <Button
              type="link"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => router.push(`/knowledge/${record.id}`)}
            >
              配置
            </Button>
          </Tooltip>
          <Popconfirm
            title="确定删除此知识库？"
            description="删除后无法恢复，关联的所有文档也将被删除"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="工业知识库"
        description="管理工业设备手册、故障代码表与点检规范，为故障排查助手和工作流提供知识能力。"
      />
      <PortfolioHint
        storageKey="knowledge-list"
        title="面试展示提示：把这块讲成“工业知识能力配置层”"
        summary="这里可以说明你将通用知识库改造成了工业互联网场景：设备手册、故障代码表、点检规范都以统一前端入口管理。"
        tags={["工业知识库", "设备手册", "故障代码"]}
        bullets={[
          '强调文档上传、切片策略和命中测试可以承载工业设备手册与故障代码表。',
          '说明它的价值是为故障排查 Agent 和诊断工作流提供知识输入。',
          '如果被追问实现边界，说明当前是 mock 数据演示，接口形态可对接真实 RAG 服务。',
        ]}
      />

      {/* 工具栏 */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Input
            placeholder="搜索知识库名称"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            刷新
          </Button>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/knowledge/create')}
        >
          创建知识库
        </Button>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1200 }}
        tableLayout="fixed"
      />
    </MainLayout>
  );
}
