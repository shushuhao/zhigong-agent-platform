'use client';

import React, { useState, useEffect } from 'react';
import { Button, Tag, Space, Modal, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { PortfolioHint } from '@/components/common/PortfolioHint';
import { DataTable } from '@/components/common/DataTable';
import { useOptimizedRouter } from '@/lib/hooks/useOptimizedRouter';
import { workflowService } from '@/lib/services/workflow.service';
import { Workflow, runModeMap, statusMap } from '@/lib/types/workflow';
import { INITIAL_WORKFLOWS } from '@/lib/services/workflowStorage.service';

const WorkflowList = () => {
  const router = useOptimizedRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const breadcrumbs = [
    { title: '工作流管理' },
    { title: '工作流列表' },
  ];

  // 获取工作流列表
  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await workflowService.getWorkflows();
      setWorkflows(data.length > 0 ? data : INITIAL_WORKFLOWS);
    } catch (error) {
      message.error('获取工作流列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // 新建工作流
  const handleCreate = async () => {
    try {
      setCreating(true);
      // 调用接口获取新的 workflowId
      const { workflowId } = await workflowService.createWorkflow();
      // 跳转到编辑页面
      router.push(`/workflow/editor?workflowId=${workflowId}`);
    } catch (error) {
      message.error('创建工作流失败');
    } finally {
      setCreating(false);
    }
  };

  // 查看详情 - 跳转到编辑页面
  const handleViewDetail = (record: Workflow) => {
    router.push(`/workflow/editor?workflowId=${record.id}`);
  };

  // 删除工作流
  const handleDelete = (record: Workflow) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除工作流 "${record.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const success = await workflowService.deleteWorkflow(record.id);
        if (success) {
          message.success('删除成功');
          // 刷新列表
          fetchWorkflows();
        } else {
          message.error('删除失败');
        }
      },
    });
  };

  const columns: ColumnsType<Workflow> = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '运行方式',
      dataIndex: 'runMode',
      key: 'runMode',
      width: 120,
      render: (runMode: Workflow['runMode']) => (
        <Tag color={runMode === 'periodic' ? 'blue' : 'green'}>
          {runModeMap[runMode]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Workflow['status']) => (
        <Tag color={status === 'online' ? 'success' : 'default'}>
          {statusMap[status]}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
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

  return (
    <MainLayout>
      <PageHeader
        title="工作流列表"
        subtitle="管理工作流配置与运行入口，是展示可视化编排能力的核心页面。"
        breadcrumbs={breadcrumbs}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={creating}
            onClick={handleCreate}
          >
            新建工作流
          </Button>
        }
      />
      <PortfolioHint
        storageKey="workflow-list"
        title="面试展示提示：优先从这里切入"
        summary="工作流模块是这个项目里最有技术含量的部分，适合重点讲节点系统、运行状态和可视化编排。"
        tags={["ReactFlow", "工作流", "状态管理"]}
        bullets={[
          '先讲为什么 AI 平台需要可视化编排，而不是先讲具体字段。',
          '再讲节点类型、节点注册机制和运行反馈链路。',
          '最后顺势引到编辑器、日志面板和执行状态同步。',
        ]}
      />
      <DataTable
        columns={columns}
        dataSource={workflows}
        rowKey="id"
        loading={loading}
        pagination={{
          total: workflows.length,
          pageSize: 10,
          current: 1,
        }}
      />
    </MainLayout>
  );
};

export default WorkflowList;
