'use client';

import React, { useEffect, useState } from 'react';
import { Input, Modal, Typography } from 'antd';

const { Text } = Typography;
const { TextArea } = Input;

interface AgentPromptOptimizeModalProps {
  open: boolean;
  prompt: string;
  onCancel: () => void;
  onApply: (prompt: string) => void;
}

export const AgentPromptOptimizeModal: React.FC<AgentPromptOptimizeModalProps> = ({
  open,
  prompt,
  onCancel,
  onApply,
}) => {
  const [draftPrompt, setDraftPrompt] = useState(prompt);

  useEffect(() => {
    if (open) {
      setDraftPrompt(prompt);
    }
  }, [open, prompt]);

  return (
    <Modal
      open={open}
      title="角色指令优化预览"
      onCancel={onCancel}
      onOk={() => onApply(draftPrompt)}
      okText="应用优化"
      cancelText="取消"
      width={760}
      destroyOnClose
    >
      <div className="space-y-3">
        <Text className="text-xs text-gray-500">
          你可以在下方直接编辑优化结果，确认后会替换当前角色指令。
        </Text>
        <TextArea
          value={draftPrompt}
          onChange={(event) => setDraftPrompt(event.target.value)}
          autoSize={{ minRows: 10, maxRows: 16 }}
        />
      </div>
    </Modal>
  );
};
