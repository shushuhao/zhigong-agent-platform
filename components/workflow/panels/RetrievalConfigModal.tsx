/**
 * 检索配置弹窗组件
 *
 * 用于配置知识检索节点的检索策略和参数
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Radio, Switch, Slider, InputNumber, Tooltip, Divider } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { RetrievalConfig, RetrievalStrategy } from '@/lib/workflow/types';

interface RetrievalConfigModalProps {
  open: boolean;
  config: RetrievalConfig;
  onOk: (config: RetrievalConfig) => void;
  onCancel: () => void;
}

/**
 * 检索策略选项
 */
const STRATEGY_OPTIONS: { value: RetrievalStrategy; label: string; description: string }[] = [
  {
    value: 'hybrid',
    label: '混合检索',
    description: '结合语义检索和全文检索，综合效果最佳',
  },
  {
    value: 'fulltext',
    label: '全文检索',
    description: '基于关键词匹配，适合精确查询',
  },
  {
    value: 'semantic',
    label: '语义检索',
    description: '基于语义相似度，适合模糊查询',
  },
];

export const RetrievalConfigModal: React.FC<RetrievalConfigModalProps> = ({
  open,
  config,
  onOk,
  onCancel,
}) => {
  // 本地状态，用于编辑
  const [localConfig, setLocalConfig] = useState<RetrievalConfig>(config);

  // 当弹窗打开时，同步外部配置
  useEffect(() => {
    if (open) {
      setLocalConfig(config);
    }
  }, [open, config]);

  /**
   * 更新本地配置
   */
  const handleChange = <K extends keyof RetrievalConfig>(
    field: K,
    value: RetrievalConfig[K]
  ) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * 确认保存
   */
  const handleOk = () => {
    onOk(localConfig);
  };

  return (
    <Modal
      title="检索配置"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
      width={480}
      destroyOnClose
    >
      <div className="space-y-5 py-2">
        {/* 检索策略 */}
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-700">检索策略</span>
            <Tooltip title="选择知识库的检索方式">
              <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
          <Radio.Group
            value={localConfig.strategy}
            onChange={(e) => handleChange('strategy', e.target.value)}
            className="w-full"
          >
            <div className="space-y-2">
              {STRATEGY_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`
                    p-3 border rounded-lg cursor-pointer transition-colors
                    ${localConfig.strategy === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                  onClick={() => handleChange('strategy', option.value)}
                >
                  <Radio value={option.value}>
                    <span className="font-medium text-gray-800">{option.label}</span>
                  </Radio>
                  <div className="text-xs text-gray-500 mt-1 ml-6">
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          </Radio.Group>
        </div>

        {/* 权重分配（仅混合检索时显示） */}
        {localConfig.strategy === 'hybrid' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-700">按比例分配</span>
              <Tooltip title="调整语义检索和全文检索的权重比例">
                <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-16">语义检索</span>
              <Slider
                className="flex-1"
                min={0}
                max={1}
                step={0.1}
                value={localConfig.semanticWeight}
                onChange={(value) => handleChange('semanticWeight', value)}
              />
              <span className="text-xs text-gray-500 w-16 text-right">全文检索</span>
            </div>
          </div>
        )}

        <Divider className="my-4" />

        {/* 重排序、Top K、Score 阈值、自动标签过滤 */}
        {/* ... 其他配置项 ... */}
      </div>
    </Modal>
  );
};