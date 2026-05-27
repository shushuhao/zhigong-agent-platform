'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Modal, message } from 'antd';
import type { FormProps } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useAgentDraftStore } from '@/stores/agentDraftStore';
import { cn } from '@/lib/utils';
import { AgentLogo, isImageLogo } from './AgentLogo';

const { TextArea } = Input;

interface AgentBaseInfoCardProps {
  className?: string;
}

const LOGO_GRADIENTS: Array<[string, string]> = [
  ['#4f46e5', '#6366f1'],
  ['#0ea5e9', '#22c55e'],
  ['#f97316', '#f43f5e'],
  ['#8b5cf6', '#ec4899'],
  ['#14b8a6', '#10b981'],
  ['#f59e0b', '#ef4444'],
];

const getFallbackLogoText = (name?: string) => {
  const trimmed = name?.trim() ?? '';
  return trimmed ? trimmed[0].toUpperCase() : 'A';
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const generateLogoDataUrl = (name: string) => {
  if (typeof document === 'undefined') {
    return getFallbackLogoText(name);
  }

  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return getFallbackLogoText(name);
  }

  const [startColor, endColor] = LOGO_GRADIENTS[hashString(name) % LOGO_GRADIENTS.length];
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.font = 'bold 72px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getFallbackLogoText(name), size / 2, size / 2 + 2);

  return canvas.toDataURL('image/png');
};

export const AgentBaseInfoCard: React.FC<AgentBaseInfoCardProps> = ({ className }) => {
  const draft = useAgentDraftStore.use.draft();
  const updateDraft = useAgentDraftStore.use.updateDraft();
  const [form] = Form.useForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    form.setFieldsValue({
      name: draft.name,
      description: draft.description,
    });
  }, [draft.description, draft.name, form]);

  useEffect(() => {
    return () => {
      if (generateTimerRef.current) {
        clearTimeout(generateTimerRef.current);
      }
    };
  }, []);

  const handleValuesChange: FormProps['onValuesChange'] = (_, values) => {
    updateDraft({
      name: values.name ?? '',
      description: values.description ?? '',
    });
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    const trimmedName = draft.name.trim();
    if (!trimmedName) {
      message.warning('请先填写智能体名称');
      return;
    }
    const hasCustomLogo = isImageLogo(draft.logo);

    const runGenerate = () => {
      const messageKey = 'agent-ai-generate';
      setIsGenerating(true);
      message.loading({ content: 'AI 正在生成 Logo...', key: messageKey });
      generateTimerRef.current = setTimeout(() => {
        const nextLogo = generateLogoDataUrl(trimmedName);
        updateDraft({ logo: nextLogo });
        setIsGenerating(false);
        message.success({ content: '已生成 Logo', key: messageKey });
      }, 800);
    };

    if (hasCustomLogo) {
      Modal.confirm({
        title: '覆盖当前 Logo？',
        content: 'AI 生成会覆盖当前的 Logo，请确认是否继续。',
        okText: '继续生成',
        cancelText: '取消',
        onOk: runGenerate,
      });
    } else {
      runGenerate();
    }
  };

  return (
    <section className={cn('rounded-2xl border border-gray-200 bg-white p-4 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">基础信息</h3>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-3 md:w-32">
          <AgentLogo
            logo={draft.logo}
            name={draft.name}
            className="h-20 w-20 rounded-2xl bg-gray-100 text-gray-700 overflow-hidden"
            textClassName="text-xl font-semibold text-gray-700"
          />
          <Button
            size="small"
            type="default"
            icon={<ThunderboltOutlined />}
            loading={isGenerating}
            onClick={handleGenerate}
          >
            AI 生成 Logo
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          className="flex-1"
          validateTrigger="onBlur"
          onValuesChange={handleValuesChange}
          initialValues={{ name: draft.name, description: draft.description }}
          requiredMark={false}
        >
          <div className="space-y-3">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: '请输入智能体名称' },
                { max: 50, message: '智能体名称不能超过 50 个字符' },
                {
                  pattern: /^[a-zA-Z0-9\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5\s_-]*$/,
                  message: '仅支持中英文、数字、空格、下划线与中划线，且需以中英文或数字开头',
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="请输入智能体名称" maxLength={50} showCount />
            </Form.Item>

            <Form.Item
              name="description"
              rules={[{ max: 100, message: '描述不能超过 100 个字符' }]}
              style={{ marginBottom: 0 }}
            >
              <TextArea
                placeholder="描述智能体的定位与能力"
                autoSize={{ minRows: 3, maxRows: 5 }}
                maxLength={100}
                showCount
              />
            </Form.Item>
          </div>
        </Form>
      </div>
    </section>
  );
};
