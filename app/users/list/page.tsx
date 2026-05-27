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
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function UserList() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 模拟数据
  const [users] = useState<User[]>([
    {
      id: '1',
      name: '运维主管',
      email: 'ops-lead@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: '设备工程师',
      email: 'engineer@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2024-01-16'
    },
    {
      id: '3',
      name: '知识运营',
      email: 'knowledge@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: '2024-01-17'
    },
    {
      id: '4',
      name: '产线班长',
      email: 'line-leader@example.com',
      role: 'editor',
      status: 'active',
      createdAt: '2024-01-18'
    },
  ]);

  const handleView = (record: User) => {
    router.push(`/users/${record.id}/detail`);
  };

  const handleEdit = (record: User) => {
    router.push(`/users/${record.id}/edit`);
  };

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除用户 "${record.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        message.success('删除成功');
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleColors = {
          admin: 'red',
          editor: 'blue',
          user: 'green',
        };
        const roleNames = {
          admin: '管理员',
          editor: '编辑者',
          user: '普通用户',
        };
        return (
          <Tag color={roleColors[role as keyof typeof roleColors]}>
            {roleNames[role as keyof typeof roleNames]}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '禁用'}
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
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const breadcrumbs = [
    { title: '用户管理' },
    { title: '用户列表' },
  ];

  return (
    <MainLayout>
      <PageHeader 
        title="用户列表" 
        subtitle="管理工业智能平台的运维、知识运营和业务团队账号"
        breadcrumbs={breadcrumbs}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            添加用户
          </Button>
        }
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
