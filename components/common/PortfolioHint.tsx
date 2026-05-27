'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Tag } from 'antd';
import { BulbOutlined, CloseOutlined } from '@ant-design/icons';

interface PortfolioHintProps {
  storageKey: string;
  title: string;
  summary: string;
  bullets: string[];
  tags?: string[];
}

export const PortfolioHint: React.FC<PortfolioHintProps> = ({
  storageKey,
  title,
  summary,
  bullets,
  tags = [],
}) => {
  const persistKey = useMemo(() => `portfolio_hint_${storageKey}`, [storageKey]);
  const [enabled, setEnabled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const forceShow = params.get('showHints') === '1';
    const shouldShow =
      forceShow || window.localStorage.getItem('portfolio_hints_enabled') === '1';

    setEnabled(shouldShow);

    const stored = window.localStorage.getItem(persistKey);
    setHidden(!forceShow && stored === 'hidden');
  }, [persistKey]);

  const handleHide = () => {
    setHidden(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(persistKey, 'hidden');
    }
  };

  if (!enabled || hidden) return null;

  return (
    <Card
      className="overflow-hidden border-sky-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 shadow-sm"
      styles={{ body: { padding: 18 } }}
      extra={
        <Button type="text" icon={<CloseOutlined />} onClick={handleHide} aria-label="关闭提示" />
      }
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-sm">
          <BulbOutlined />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-semibold text-slate-900">{title}</div>
            {tags.map((tag) => (
              <Tag key={tag} color="blue" className="m-0 rounded-full">
                {tag}
              </Tag>
            ))}
          </div>
          <p className="mt-2 mb-0 text-sm leading-7 text-slate-600">{summary}</p>
          <ul className="mt-3 mb-0 space-y-1 pl-4 text-sm leading-7 text-slate-600">
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
