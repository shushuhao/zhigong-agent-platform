'use client';

import React, { useState } from 'react';
import { Button, Dropdown, Tag, Tooltip, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  ArrowLeftOutlined,
  DownOutlined,
  EditOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useOptimizedRouter } from '@/lib/hooks/useOptimizedRouter';
import { useAgentDraftStore } from '@/stores/agentDraftStore';
import { useAgentUIStore } from '@/stores/agentUIStore';
import { useAgentEditor } from '@/lib/hooks/useAgentEditor';
import { formatUtils } from '@/lib/utils';
import type { AgentStatus } from '@/lib/types/agent';
import { AgentEditorTabs } from './AgentEditorTabs';
import { AgentLogo } from './AgentLogo';
import { AgentPublishModal } from './AgentPublishModal';

const STATUS_LABEL_MAP: Record<AgentStatus, string> = {
  draft: '草稿',
  published: '已发布',
  offline: '已下线',
};

const STATUS_COLOR_MAP: Record<AgentStatus, string> = {
  draft: 'gold',
  published: 'green',
  offline: 'default',
};

export const AgentEditorHeader: React.FC = () => {
  const router = useOptimizedRouter();
  const draft = useAgentDraftStore.use.draft();
  const lastSavedAt = useAgentDraftStore.use.lastSavedAt();
  const isDirty = useAgentDraftStore.use.isDirty();
  const activeTab = useAgentUIStore.use.activeTab();
  const setActiveTab = useAgentUIStore.use.setActiveTab();

  const { saveDraft, publishAgent, validateForPublish } = useAgentEditor();

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const savedAtLabel = lastSavedAt ? formatUtils.date(lastSavedAt, 'HH:mm') : '--:--';
  const statusLabel = isDirty ? '正在自动保存...' : '自动保存已开启';
  const statusDotClassName = isDirty ? 'bg-amber-400 animate-pulse' : 'bg-green-500';

  const handleBack = () => {
    router.push('/agent/list');
  };

  // 打开发布弹窗
  const handleOpenPublishModal = () => {
    const validation = validateForPublish();
    setPublishErrors(validation.errors);
    setPublishModalOpen(true);
  };

  // 确认发布
  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    try {
      const result = publishAgent();
      if (result.success) {
        message.success('发布成功！');
        setPublishModalOpen(false);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // 保存草稿
  const handleSaveDraft = () => {
    saveDraft();
  };

  // 下拉菜单项
  const dropdownItems: MenuProps['items'] = [
    {
      key: 'save',
      icon: <SaveOutlined />,
      label: '保存草稿',
      onClick: handleSaveDraft,
    },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 h-16 px-6">
          <div className="flex items-center gap-4 min-w-0">
            <Tooltip title="返回智能体列表">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                className="flex items-center justify-center w-9 h-9"
              />
            </Tooltip>
            <AgentLogo
              logo={draft.logo}
              name={draft.name}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 overflow-hidden"
              textClassName="text-sm font-semibold text-white"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">{draft.name}</span>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  className="text-gray-500"
                />
                <Tag color={STATUS_COLOR_MAP[draft.status]} className="m-0">
                  {STATUS_LABEL_MAP[draft.status]}
                </Tag>
              </div>
              <span className="text-xs text-gray-500">自动保存于 {savedAtLabel}</span>
            </div>
          </div>
          <div className="flex items-center justify-center min-w-0">
            <AgentEditorTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              className="w-48 sm:w-64 md:w-72"
            />
          </div>
          <div className="flex items-center gap-4 justify-end">
            <Dropdown.Button
              type="primary"
              icon={<DownOutlined />}
              menu={{ items: dropdownItems }}
              onClick={handleOpenPublishModal}
            >
              <SendOutlined />
              发布
            </Dropdown.Button>
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
              <span className={`inline-flex h-2 w-2 rounded-full ${statusDotClassName}`} />
              {statusLabel}
            </div>
          </div>
        </div>
      </header>

      <AgentPublishModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        errors={publishErrors}
        isPublishing={isPublishing}
      />
    </>
  );
};