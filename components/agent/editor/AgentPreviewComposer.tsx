'use client';

import React from 'react';
import { Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface AgentPreviewComposerProps {
  value: string;
  disabled?: boolean;
  isStreaming?: boolean;
  canRetry?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onRetry?: () => void;
}

export const AgentPreviewComposer: React.FC<AgentPreviewComposerProps> = ({
  value,
  disabled,
  isStreaming,
  canRetry,
  onChange,
  onSend,
  onStop,
  onRetry,
}) => {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2">
      <Input
        variant="borderless"
        placeholder="发送消息进行调试"
        className="flex-1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPressEnter={onSend}
      />
      {canRetry ? (
        <Button size="small" type="text" onClick={onRetry}>
          重试
        </Button>
      ) : null}
      {isStreaming ? (
        <Button size="small" type="text" onClick={onStop}>
          终止
        </Button>
      ) : null}
      <Button
        type="primary"
        size="small"
        shape="circle"
        icon={<SendOutlined />}
        onClick={onSend}
        disabled={disabled}
        loading={isStreaming}
      />
    </div>
  );
};
