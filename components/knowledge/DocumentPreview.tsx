'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Empty, Typography } from 'antd';

const { Text } = Typography;

interface DocumentPreviewProps {
  title: string;
  content?: string;
  highlightText?: string;
  highlightRange?: { startIndex: number; endIndex: number };
  enableScroll?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  title,
  content,
  highlightText,
  highlightRange,
  enableScroll = true,
}) => {
  const highlightRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const contentNode = useMemo(() => {
    if (!content) return null;
    if (highlightRange) {
      const safeStart = Math.max(0, Math.min(content.length, highlightRange.startIndex));
      const safeEnd = Math.max(safeStart, Math.min(content.length, highlightRange.endIndex));
      return (
        <>
          {content.slice(0, safeStart)}
          <span ref={highlightRef} className="text-gray-900">
            {content.slice(safeStart, safeEnd)}
          </span>
          {content.slice(safeEnd)}
        </>
      );
    }
    if (!highlightText) return content;
    const startIndex = content.indexOf(highlightText);
    if (startIndex === -1) return content;
    const endIndex = startIndex + highlightText.length;
    return (
      <>
        {content.slice(0, startIndex)}
        <span ref={highlightRef} className="text-gray-900">
          {highlightText}
        </span>
        {content.slice(endIndex)}
      </>
    );
  }, [content, highlightText, highlightRange]);

  useEffect(() => {
    if (!highlightText && !highlightRange) return;
    if (!enableScroll) return;
    highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightText, highlightRange, enableScroll]);

  useEffect(() => {
    if (!canvasRef.current || !contentRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const content = contentRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = content.scrollWidth;
    canvas.height = content.scrollHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if ((!highlightText && !highlightRange) || !highlightRef.current) {
      return;
    }

    const draw = () => {
      const highlight = highlightRef.current;
      if (!highlight) return;
      const contentRect = content.getBoundingClientRect();
      const highlightRect = highlight.getBoundingClientRect();
      const leftTopX = highlightRect.left - contentRect.left;
      const leftTopY = highlightRect.top - contentRect.top;
      const width = highlightRect.width;
      const height = highlightRect.height;

      context.fillStyle = 'rgba(253, 224, 71, 0.5)';
      context.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      context.lineWidth = 1;
      context.fillRect(leftTopX, leftTopY, width, height);
      context.strokeRect(leftTopX, leftTopY, width, height);
    };

    const frame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame);
  }, [highlightText, highlightRange, contentNode]);

  return (
    <div className="h-full flex flex-col">
      {/* <div className="flex items-center justify-between mb-3">
        <div className="font-medium text-gray-900">{title}</div>
      </div> */}
      <div className="flex-1 rounded-lg border border-gray-100 bg-white p-4">
        {content ? (
          <div className="relative h-full overflow-auto">
            <canvas ref={canvasRef} className="absolute left-0 top-0 pointer-events-none" />
            <div
              ref={contentRef}
              className="relative whitespace-pre-wrap text-gray-800 leading-relaxed"
            >
              {contentNode}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Text type="secondary">暂无原文内容</Text>
          </div>
        )}
      </div>
    </div>
  );
};
