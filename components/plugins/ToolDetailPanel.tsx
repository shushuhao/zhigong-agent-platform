// components/plugins/ToolDetailPanel.tsx

'use client';

import React, { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { CopyOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { PluginTool } from '@/lib/types/plugin';

const { Title, Text } = Typography;

interface ToolDetailPanelProps {
  tool: PluginTool | null;
}

export const ToolDetailPanel: React.FC<ToolDetailPanelProps> = ({ tool }) => {
  const [form] = Form.useForm();
  const [runResult, setRunResult] = useState<Record<string, unknown> | null>(null);

  if (!tool) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-gray-500">
        请选择左侧工具查看详情
      </div>
    );
  }

  const handleCopy = async () => {
    if (!navigator?.clipboard) {
      message.warning('当前浏览器不支持复制');
      return;
    }
    await navigator.clipboard.writeText(tool.apiUrl);
    message.success('接口地址已复制');
  };

  const buildMockResponse = (values: Record<string, unknown>) => {
    if (tool.name === 'recognition_text') {
      return {
        text: '识别结果：AppForge 插件广场',
        language: values.language || 'auto',
        confidence: 0.94,
        blocks: [
          { text: 'AppForge', confidence: 0.98 },
          { text: '插件广场', confidence: 0.9 },
        ],
      };
    }
    if (tool.name === 'extract_entities') {
      return {
        entities: [
          { type: '品牌', value: 'AppForge' },
          { type: '产品', value: '插件广场' },
        ],
      };
    }
    if (tool.name === 'summarize_text') {
      return {
        summary: '该内容介绍了插件广场的核心能力与接入方式。',
        style: values.style || 'brief',
      };
    }
    if (tool.name === 'fetch_webpage') {
      return {
        title: '示例网页标题',
        url: values.url || 'https://example.com',
        summary: '页面包含插件广场的核心介绍与能力列表。',
      };
    }
    return {
      status: 'success',
      message: '已生成模拟返回结果',
    };
  };

  const handleRun = (values: Record<string, unknown>) => {
    const response = buildMockResponse(values);
    setRunResult({
      tool: tool.name,
      request: values,
      response,
      ranAt: new Date().toISOString(),
    });
    message.success('已提交测试（模拟）');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <Title level={4} className="!mb-4">{tool.name}</Title>
        <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Text className="text-sm text-gray-500">接口URL</Text>
              <div className="mt-2 text-sm text-gray-800 break-all">{tool.apiUrl}</div>
            </div>
            <Button icon={<CopyOutlined />} onClick={handleCopy} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <Title level={5} className="!mb-4">工具测试</Title>
        <Form form={form} layout="vertical" onFinish={handleRun}>
          {tool.parameters.map((param) => (
            <Form.Item
              key={param.name}
              label={
                <span>
                  {param.required && <span className="text-red-500 mr-1">*</span>}
                  {param.name}：
                </span>
              }
              required={param.required}
              rules={param.required ? [{ required: true, message: `请输入${param.name}` }] : []}
            >
              <Input placeholder={param.placeholder || `请输入${param.name}`} />
              <div className="mt-1 text-xs text-gray-400">{param.description}</div>
            </Form.Item>
          ))}
          <Button type="primary" icon={<PlayCircleOutlined />} htmlType="submit">
            运行
          </Button>
        </Form>
      </div>

      {runResult && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <Title level={5} className="!mb-4">运行结果</Title>
          <pre className="rounded-xl bg-gray-50 p-4 text-xs text-gray-600 overflow-auto">
            {JSON.stringify(runResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};