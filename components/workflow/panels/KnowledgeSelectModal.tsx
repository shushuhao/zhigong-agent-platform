/**
 * 知识库选择弹窗组件
 *
 * 用于选择要添加到知识检索节点的知识库
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Input, Tabs, Button, Empty, Spin } from 'antd';
import { SearchOutlined, CheckOutlined, EyeOutlined } from '@ant-design/icons';
import { knowledgeService } from '@/lib/services/knowledge.service';
import type { KnowledgeBase } from '@/lib/types/knowledge';
import type { KnowledgeBaseRef } from '@/lib/workflow/types';

interface KnowledgeSelectModalProps {
  open: boolean;
  selectedIds: string[];
  onOk: (knowledgeBases: KnowledgeBaseRef[]) => void;
  onCancel: () => void;
}

export const KnowledgeSelectModal: React.FC<KnowledgeSelectModalProps> = ({
  open,
  selectedIds,
  onOk,
  onCancel,
}) => {
  // 状态
  const [loading, setLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'selected'>('all');
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);

  // 加载知识库列表
  useEffect(() => {
    if (open) {
      setLoading(true);
      setTimeout(() => {
        const data = knowledgeService.getKnowledgeBases();
        setKnowledgeBases(data);
        setLocalSelectedIds(selectedIds);
        setLoading(false);
      }, 300);
    }
  }, [open, selectedIds]);

  // 过滤知识库
  const filteredKnowledgeBases = useMemo(() => {
    let result = knowledgeBases;

    // 搜索过滤
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (kb) =>
          kb.name.toLowerCase().includes(lowerSearch) ||
          kb.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Tab 过滤
    if (activeTab === 'selected') {
      result = result.filter((kb) => localSelectedIds.includes(kb.id));
    }

    return result;
  }, [knowledgeBases, searchText, activeTab, localSelectedIds]);

  /**
   * 切换选择状态
   */
  const handleToggleSelect = (kb: KnowledgeBase) => {
    setLocalSelectedIds((prev) => {
      if (prev.includes(kb.id)) {
        return prev.filter((id) => id !== kb.id);
      }
      return [...prev, kb.id];
    });
  };

  /**
   * 确认选择
   */
  const handleOk = () => {
    const selected = knowledgeBases
      .filter((kb) => localSelectedIds.includes(kb.id))
      .map((kb) => ({
        id: kb.id,
        name: kb.name,
        icon: kb.icon,
      }));
    onOk(selected);
  };

  return (
    <Modal
      title="添加知识库"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
      width={600}
      destroyOnClose
    >
      {/* 搜索框 */}
      <div className="mb-4">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="搜索知识库..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      {/* Tab 切换 */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'all' | 'selected')}
        items={[
          { key: 'all', label: `全部 (${knowledgeBases.length})` },
          { key: 'selected', label: `已选择 (${localSelectedIds.length})` },
        ]}
      />

      {/* 知识库列表 */}
      <div className="min-h-[300px] max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Spin tip="加载中..." />
          </div>
        ) : filteredKnowledgeBases.length === 0 ? (
          <Empty description="暂无知识库" className="py-12" />
        ) : (
          <div className="space-y-2">
            {filteredKnowledgeBases.map((kb) => {
              const isSelected = localSelectedIds.includes(kb.id);
              return (
                <div
                  key={kb.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-colors
                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                  `}
                >
                  {/* 知识库信息 */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                      {kb.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{kb.name}</div>
                      <div className="text-xs text-gray-500 truncate">{kb.description}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {kb.fileCount} 个文件 · {kb.chunkCount} 个分段
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 ml-3">
                    <Button type="text" size="small" icon={<EyeOutlined />}>
                      查看
                    </Button>
                    <Button
                      type={isSelected ? 'primary' : 'default'}
                      size="small"
                      icon={isSelected ? <CheckOutlined /> : null}
                      onClick={() => handleToggleSelect(kb)}
                    >
                      {isSelected ? '已添加' : '添加'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};