'use client';

import React from 'react';
import { Modal, Button, Alert, Space, Typography } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AgentPublishModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  errors: string[];
  isPublishing?: boolean;
}

export const AgentPublishModal: React.FC<AgentPublishModalProps> = ({
  open,
  onClose,
  onConfirm,
  errors,
  isPublishing = false,
}) => {
  const hasErrors = errors.length > 0;

  return (
    <Modal
      title={
        <Space>
          {hasErrors ? (
            <ExclamationCircleOutlined className="text-amber-500" />
          ) : (
            <CheckCircleOutlined className="text-green-500" />
          )}
          <span>{hasErrors ? '发布前请完善以下内容' : '确认发布智能体'}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            onClick={onConfirm}
            disabled={hasErrors}
            loading={isPublishing}
          >
            {hasErrors ? '请先完善内容' : '确认发布'}
          </Button>
        </Space>
      }
      width={480}
    >
      {hasErrors ? (
        <div className="space-y-3">
          <Text type="secondary">
            发布智能体需要完善以下必填信息：
          </Text>
          <Alert
            type="warning"
            showIcon
            message={
              <ul className="list-disc list-inside m-0 p-0">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          <Text>
            发布后，智能体将可以被其他用户使用。确定要发布吗？
          </Text>
          <Alert
            type="info"
            showIcon
            message="发布后仍可继续编辑和更新智能体配置"
          />
        </div>
      )}
    </Modal>
  );
};