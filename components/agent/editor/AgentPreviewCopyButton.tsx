'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AgentPreviewCopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export const AgentPreviewCopyButton: React.FC<AgentPreviewCopyButtonProps> = ({
  text,
  label = '复制',
  copiedLabel = '已复制',
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-gray-200 hover:text-white hover:border-white/30 transition',
        className
      )}
    >
      {copied ? copiedLabel : label}
    </button>
  );
};