'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spin, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layouts/MainLayout';
import { EditorHeader, EditorCanvas } from '@/components/workflow/editor';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useOptimizedRouter } from '@/lib/hooks/useOptimizedRouter';
import { workflowService } from '@/lib/services/workflow.service';

/**
 * 工作流编辑器页面
 * 负责获取数据并初始化 Store，然后渲染编辑器组件
 */
const WorkflowEditorContent = () => {
  const router = useOptimizedRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflowId');

  // 从 Store 获取状态
  const { workflow, isLoading, setWorkflow, setLoading, reset, loadWorkflowData } = useWorkflowStore();

  // 获取工作流详情和画布数据
  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflowId) {
        message.error('缺少工作流 ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 1. 获取工作流基础信息
        const data = await workflowService.getWorkflowById(workflowId);

        if (data) {
          setWorkflow(data);
          
          // 2. 加载画布数据（节点和边）
          await loadWorkflowData(workflowId);
        } else {
          message.error('工作流不存在');
          setWorkflow(null);
        }
      } catch (error) {
        message.error('获取工作流详情失败');
        console.error('获取工作流详情失败:', error);
        setWorkflow(null);
      }
    };

    fetchWorkflow();

    // 组件卸载时重置状态
    return () => {
      reset();
    };
  }, [workflowId, setWorkflow, setLoading, reset, loadWorkflowData]);

  // 返回列表页
  const handleBack = () => {
    router.push('/workflow/list');
  };

  // 加载状态
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" tip="加载中...">
            {/* 嵌套模式：tip 需要有子元素才能显示 */}
            <div className="p-12" />
          </Spin>
        </div>
      </MainLayout>
    );
  }

  // 工作流不存在
  if (!workflow) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="text-gray-500 text-lg mb-4">
            工作流不存在或已被删除
          </div>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回列表
          </Button>
        </div>
      </MainLayout>
    );
  }

  // 正常渲染编辑器
  return (
    <MainLayout>
      <div className="h-screen flex flex-col">
        {/* 顶部工具栏 */}
        <EditorHeader />

        {/* 画布区域（PropertyPanel 已内置在 ReactFlow 的 Panel 中） */}
        <EditorCanvas />
      </div>
    </MainLayout>
  );
};

const WorkflowEditorPage = () => (
  <Suspense
    fallback={
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" tip="加载中...">
            <div className="p-12" />
          </Spin>
        </div>
      </MainLayout>
    }
  >
    <WorkflowEditorContent />
  </Suspense>
);

export default WorkflowEditorPage;
