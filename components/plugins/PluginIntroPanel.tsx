// components/plugins/PluginIntroPanel.tsx

'use client';

import React from 'react';
import { Button, Table, Typography, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import type { PluginDetail, PluginApiParameter } from '@/lib/types/plugin';

const { Title, Text } = Typography;

interface PluginIntroPanelProps {
  detail: PluginDetail;
}

export const PluginIntroPanel: React.FC<PluginIntroPanelProps> = ({ detail }) => {
  const handleCopy = async () => {
    if (!navigator?.clipboard) {
      message.warning('当前浏览器不支持复制');
      return;
    }
    await navigator.clipboard.writeText(detail.apiUrl);
    message.success('接口地址已复制');
  };

  const columns = [
    {
      title: '参数名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (value: boolean) => (value ? '是' : '否'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '参数说明',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <Title level={4} className="!mb-4">插件介绍</Title>
        <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Text className="text-sm text-gray-500">接口URL</Text>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-800">
                <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                  {detail.apiMethod}
                </span>
                <span className="break-all">{detail.apiUrl}</span>
              </div>
            </div>
            <Button icon={<CopyOutlined />} onClick={handleCopy} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <Title level={5} className="!mb-4">接口定义</Title>
        <Table<PluginApiParameter>
          columns={columns}
          dataSource={detail.parameters}
          rowKey={(record) => record.name}
          pagination={false}
        />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        {detail.introSections.map((section) => (
          <div key={section.title}>
            <div className="text-base font-semibold text-gray-900">{section.title}</div>
            <div className="mt-2 text-sm text-gray-600 leading-relaxed">{section.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};