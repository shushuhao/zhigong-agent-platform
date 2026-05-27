// components/agent/editor/AgentEditorWorkspace.tsx
'use client';

import React from 'react';
import { AgentComposerPanel } from './AgentComposerPanel';
import { AgentPreviewPanel } from './AgentPreviewPanel';

export const AgentEditorWorkspace: React.FC = () => {
  return (
    <div className="grid gap-4 h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_360px]">
      <AgentComposerPanel />
      <AgentPreviewPanel />
    </div>
  );
};