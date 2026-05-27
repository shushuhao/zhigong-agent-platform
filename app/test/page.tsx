'use client';

import React from 'react';
import { Button, Space, Typography, Card, Divider, Alert } from 'antd';
import styles from './page.module.css';

const { Title, Paragraph, Text } = Typography;

const TestPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title level={2}>标注服务健康检查</Title>
        <Paragraph>
          用于验证工业数据标注任务、标签配置和结果读取链路，辅助运维人员排查接口状态。
        </Paragraph>

        <Alert
          type="info"
          showIcon
          message="检查范围"
          description="可快速检查任务接口、标签接口和结果接口是否可用，并跳转到标注详情页验证页面链路。"
          className="mb-6"
        />

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card size="small" title="接口联调入口">
            <Space wrap>
              <Button
                type="primary"
                onClick={() => window.open('/api/labeleditor/getTask/task_001', '_blank')}
              >
                打开任务接口
              </Button>
              <Button onClick={() => window.open('/api/labeleditor/getLabels/task_001', '_blank')}>
                打开标签接口
              </Button>
              <Button onClick={() => window.open('/api/labeleditor/getTaskResult/task_001', '_blank')}>
                打开结果接口
              </Button>
            </Space>
          </Card>

          <Card size="small" title="推荐调试步骤">
            <Paragraph>
              <Text strong>建议顺序：</Text>
              <ol>
                <li>先确认任务与标签接口返回正常</li>
                <li>再进入标注详情页验证文本渲染与选区交互</li>
                <li>检查实体标注、删除、选中和高亮状态</li>
                <li>最后验证关系和结果保存链路</li>
              </ol>
            </Paragraph>
          </Card>

          <Card size="small" title="当前可快速验证的内容">
            <Paragraph>
              <ul>
                <li>文本渲染与文本选择</li>
                <li>实体标签面板弹出与选择</li>
                <li>实体高亮、选中、删除等状态变化</li>
                <li>接口返回结果与页面初始化流程</li>
              </ul>
            </Paragraph>
          </Card>

          <Card size="small" title="说明">
            <Paragraph>
              <ul>
                <li>该页面用于内部健康检查和接口状态确认</li>
                <li>标注任务覆盖故障实体、排查步骤和设备手册问答等工业数据</li>
                <li>如接口异常，可先检查任务 ID、标签配置和结果存储状态</li>
              </ul>
            </Paragraph>
            <Divider />
            <Paragraph type="secondary">
              健康检查结果仅用于辅助定位标注链路问题，不会修改业务数据。
            </Paragraph>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default TestPage;
