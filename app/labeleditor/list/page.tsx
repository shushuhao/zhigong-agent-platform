'use client';

import React, { useState } from 'react';
import { Button, Tag, Space, Modal, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useOptimizedRouter } from '@/lib/hooks/useOptimizedRouter';
import type { ColumnsType } from 'antd/es/table';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';

interface TextAnnotationTask {
  id: string;
  name: string;
  type: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function UserList() {
  const router = useOptimizedRouter();
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const [users] = useState<TextAnnotationTask[]>([
    {
      id: '1',
      name: '设备故障实体关系标注',
      type: 'entity-relation',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: '故障排查步骤排序',
      type: 'ranking',
      role: 'user',
      status: 'active',
      createdAt: '2024-01-16'
    },
    {
      id: '3',
      name: '设备手册问答标注',
      type: 'qa',
      role: 'user',
      status: 'inactive',
      createdAt: '2024-01-17'
    },
    {
      id: '4',
      name: '告警类型分类标注',
      type: 'classification',
      role: 'editor',
      status: 'active',
      createdAt: '2024-01-18'
    },
  ]);


  const handleEdit = (record: TextAnnotationTask) => {
    router.push(`/labeleditor/detail?rId=191&tId=1407&type=${record.type}&name=${encodeURIComponent(record.name)}`);
  };


  const columns: ColumnsType<TextAnnotationTask> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '已发布' : '未发布'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            标注
          </Button>
        </Space>
      ),
    },
  ];

  const breadcrumbs = [
    { title: '数据标注管理' },
    { title: '任务列表' },
  ];

  return (
    <MainLayout>
      <PageHeader 
        title="工业数据标注任务" 
        subtitle="管理故障实体、排查步骤、设备手册问答等标注任务"
        breadcrumbs={breadcrumbs}
      />
      
      <DataTable
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          total: users.length,
          pageSize: 10,
          current: 1,
        }}
      />
    </MainLayout>
  );
}
