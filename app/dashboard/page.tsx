'use client';

import React from 'react';
import { Row, Col, Card, Progress, Tag } from 'antd';
import {
  RobotOutlined,
  ApartmentOutlined,
  BookOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';

export default function Dashboard() {
  const statsData = [
    {
      title: '智能体数量',
      value: 18,
      prefix: <RobotOutlined />,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: '工作流数量',
      value: 36,
      prefix: <ApartmentOutlined />,
      trend: { value: 8.2, isPositive: true },
    },
    {
      title: '知识库数量',
      value: 12,
      prefix: <BookOutlined />,
      trend: { value: 6.8, isPositive: true },
    },
    {
      title: '本周运行次数',
      value: 3245,
      prefix: <ThunderboltOutlined />,
      trend: { value: 3.1, isPositive: true },
    },
  ];

  const recentActivities = [
    { id: 1, action: '新增智能体', user: '运营团队', time: '8分钟前' },
    { id: 2, action: '更新工作流', user: '产品经理', time: '14分钟前' },
    { id: 3, action: '上传知识库文档', user: '知识运营', time: '21分钟前' },
    { id: 4, action: '完成命中测试', user: '算法协作', time: '37分钟前' },
  ];

  const systemMetrics = [
    { label: '工作流成功率', percent: 92, colors: { '0%': '#3b82f6', '100%': '#1d4ed8' } },
    { label: 'Agent 预览可用率', percent: 97, colors: { '0%': '#10b981', '100%': '#059669' } },
    { label: '知识库处理完成率', percent: 84, colors: { '0%': '#8b5cf6', '100%': '#7c3aed' } },
  ];

  const quickActions = [
    { title: '创建智能体', tone: 'from-sky-50 to-blue-100', iconTone: 'from-sky-500 to-blue-600' },
    { title: '新建工作流', tone: 'from-violet-50 to-fuchsia-100', iconTone: 'from-violet-500 to-fuchsia-600' },
    { title: '导入知识库', tone: 'from-emerald-50 to-lime-100', iconTone: 'from-emerald-500 to-green-600' },
    { title: '进入插件市场', tone: 'from-amber-50 to-orange-100', iconTone: 'from-amber-500 to-orange-600' },
  ];

  return (
    <MainLayout>
      <PageHeader title="平台总览" subtitle="查看 AI Agent Studio 的关键模块状态与近期活动" />

      <Row gutter={[24, 24]} className="mb-8">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatsCard {...stat} />
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-semibold">平台运行概览</span>
              </div>
            }
            className="h-96"
            extra={<Tag color="blue">最近 7 天</Tag>}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Workflow</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">128</div>
                  <div className="mt-2 text-sm text-slate-500">本周新增节点运行记录</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Preview</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">2.4s</div>
                  <div className="mt-2 text-sm text-slate-500">平均预览首段响应时间</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Knowledge</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">426</div>
                  <div className="mt-2 text-sm text-slate-500">已完成文档切片数量</div>
                </div>
              </div>

              
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-semibold">最近活动</span>
              </div>
            }
            className="h-96"
            extra={<span className="text-xs text-slate-400">实时更新</span>}
          >
            <div className="max-h-80 space-y-4 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-slate-50">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="h-2 w-2 rounded-full bg-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800">{activity.action}</div>
                    <div className="text-sm text-slate-500">{activity.user}</div>
                    <div className="mt-1 text-xs text-slate-400">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mt-8">
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-semibold">系统指标</span>
              </div>
            }
            extra={<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
          >
            <div className="space-y-6">
              {systemMetrics.map((metric) => (
                <div key={metric.label}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{metric.percent}%</span>
                  </div>
                  <Progress
                    percent={metric.percent}
                    status="active"
                    strokeColor={metric.colors}
                    trailColor="#f1f5f9"
                    size={8}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="font-semibold">快速入口</span>
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  className={`group cursor-pointer rounded-xl bg-gradient-to-br ${action.tone} p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                >
                  <div className="text-center">
                    <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.iconTone} transition-transform group-hover:scale-110`}>
                      <ThunderboltOutlined className="text-xl text-white" />
                    </div>
                    <div className="text-sm font-medium text-slate-700">{action.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
