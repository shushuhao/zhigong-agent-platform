'use client';

import React from 'react';
import { Button, Table, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  status: 'active' | 'inactive';
}

export default function RoleManagement() {
  const roles: Role[] = [
    {
      id: '1',
      name: '超级管理员',
      description: '拥有系统所有权限',
      permissions: ['智能体管理', '工作流编排', '知识库管理', '系统设置'],
      userCount: 2,
      status: 'active'
    },
    {
      id: '2',
      name: '普通管理员',
      description: '拥有基础管理权限',
      permissions: ['智能体管理', '知识库管理'],
      userCount: 5,
      status: 'active'
    },
    {
      id: '3',
      name: '知识运营',
      description: '维护设备手册、故障代码和点检规范',
      permissions: ['知识库管理'],
      userCount: 8,
      status: 'active'
    }
  ];

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <div>
          {permissions.map((permission) => (
            <Tag key={permission} color="blue" className="mb-1">
              {permission}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => (
        <span className="font-semibold">{count}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const breadcrumbs = [
    { title: '用户管理' },
    { title: '角色管理' },
  ];

  return (
    <MainLayout>
      <PageHeader 
        title="角色管理" 
        subtitle="管理工业智能平台的团队角色和权限"
        breadcrumbs={breadcrumbs}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            添加角色
          </Button>
        }
      />
      
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        pagination={false}
      />
    </MainLayout>
  );
}
