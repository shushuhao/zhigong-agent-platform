'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Space, Tooltip, message, Input } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SendOutlined, EditOutlined, CheckOutlined, CloseOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useWorkflowRunStore, selectIsRunning } from '@/stores/workflowRunStore';
import { useOptimizedRouter } from '@/lib/hooks/useOptimizedRouter';
import { workflowService } from '@/lib/services/workflow.service';

/**
 * 工作流编辑器顶部工具栏
 * 包含返回、保存、发布等操作按钮
 */
export const EditorHeader: React.FC = () => {
  const router = useOptimizedRouter();
  const { workflow, isDirty, saveWorkflow, updateWorkflow } = useWorkflowStore();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // 名称编辑状态
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<any>(null);

  // 当进入编辑模式时，聚焦输入框
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  // 开始编辑名称
  const handleStartEditName = () => {
    setEditingName(workflow?.name || '未命名工作流');
    setIsEditingName(true);
  };

  // 确认修改名称
  const handleConfirmName = () => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      message.warning('工作流名称不能为空');
      return;
    }
    
    // 更新 Store 中的工作流名称
    updateWorkflow({ name: trimmedName });
    setIsEditingName(false);
  };

  // 取消编辑名称
  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditingName('');
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirmName();
    } else if (e.key === 'Escape') {
      handleCancelEditName();
    }
  };

  // 返回列表页
  const handleBack = () => {
    // 如果有未保存的修改，提示用户
    if (isDirty) {
      const confirmed = window.confirm('有未保存的修改，确定要离开吗？');
      if (!confirmed) {
        return;
      }
    }
    router.push('/workflow/list');
  };

  // 保存工作流
  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveWorkflow();
      if (success) {
        message.success('保存成功');
      } else {
        message.error('保存失败');
      }
    } catch (error) {
      message.error('保存失败');
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 发布工作流
  const handlePublish = async () => {
    if (!workflow?.id) {
      message.error('工作流 ID 不存在');
      return;
    }

    // 如果有未保存的修改，先保存
    if (isDirty) {
      const confirmed = window.confirm('发布前需要先保存，是否继续？');
      if (!confirmed) {
        return;
      }
      
      setSaving(true);
      const saveSuccess = await saveWorkflow();
      setSaving(false);
      
      if (!saveSuccess) {
        message.error('保存失败，无法发布');
        return;
      }
    }

    setPublishing(true);
    try {
      // 更新工作流状态为上线
      const result = await workflowService.updateWorkflow(workflow.id, { status: 'online' });
      if (result) {
        message.success('发布成功');
        // 发布成功后跳转回列表页
        router.push('/workflow/list');
      } else {
        message.error('发布失败');
      }
    } catch (error) {
      message.error('发布失败');
      console.error('发布失败:', error);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      {/* 左侧：返回按钮和工作流信息 */}
      <div className="flex items-center space-x-4">
        <Tooltip title="返回列表">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            返回
          </Button>
        </Tooltip>

        <div className="h-4 w-px bg-gray-300" />

        {/* 工作流名称（可编辑） */}
        <div className="flex items-center space-x-2">
          {isEditingName ? (
            <div className="flex items-center space-x-1">
              <Input
                ref={inputRef}
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleConfirmName}
                size="small"
                style={{ width: 200 }}
                maxLength={50}
              />
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={handleConfirmName}
                className="text-green-500"
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancelEditName}
                className="text-gray-400"
              />
            </div>
          ) : (
            <div 
              className="flex items-center space-x-1 cursor-pointer group"
              onClick={handleStartEditName}
            >
              <span className="font-medium text-gray-800 group-hover:text-blue-500">
                {workflow?.name || '未命名工作流'}
              </span>
              <EditOutlined className="text-gray-400 group-hover:text-blue-500 text-xs" />
            </div>
          )}
          {isDirty && (
            <span className="text-xs text-orange-500">（未保存）</span>
          )}
        </div>

        <span className="text-gray-400 text-sm">
          ID: {workflow?.id || '-'}
        </span>

        {/* 状态标签 */}
        {workflow?.status === 'online' && (
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded">
            已上线
          </span>
        )}
      </div>

      {/* 右侧：操作按钮 */}
      <Space>
        <Button
          icon={<PlayCircleOutlined />}
          onClick={() => {
            const { openPanel } = useWorkflowRunStore.getState();
            openPanel();
          }}
          className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300"
        >
          运行
        </Button>
        <Button 
          icon={<SaveOutlined />} 
          onClick={handleSave}
          loading={saving}
          disabled={!isDirty}
        >
          保存
        </Button>
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handlePublish}
          loading={publishing}
          disabled={workflow?.status === 'online'}
        >
          {workflow?.status === 'online' ? '已发布' : '发布'}
        </Button>
      </Space>
    </header>
  );
};

