'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import { AgentPreviewChartBlock } from './AgentPreviewChartBlock';
import { AgentPreviewCopyButton } from './AgentPreviewCopyButton';
import { AgentPreviewComponentBlock, AgentPreviewFormBlock } from './AgentPreviewCustomBlocks';

interface AgentPreviewMessageContentProps {
  content: string;
  className?: string;
  isStreaming?: boolean; // 流式中透传给扩展块，避免解析中途闪烁报错
}

const splitCsvRow = (row: string) => {
  const delimiter = row.includes('\t') && !row.includes(',') ? '\t' : ',';
  return row.split(delimiter).map((cell) => cell.trim());
};

const parseCsv = (raw: string) => {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  const rows = lines.map(splitCsvRow);
  return {
    header: rows[0],
    body: rows.slice(1),
  };
};

const CsvTable: React.FC<{ raw: string }> = ({ raw }) => {
  const parsed = parseCsv(raw);
  if (!parsed) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
        暂无可解析的 CSV 数据
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-xs">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {parsed.header.map((cell, index) => (
              <th key={`csv-header-${index}`} className="border border-gray-200 px-2 py-1 text-left">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsed.body.map((row, rowIndex) => (
            <tr key={`csv-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`csv-cell-${rowIndex}-${cellIndex}`} className="border border-gray-200 px-2 py-1">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CodeBlock: React.FC<{ raw: string; language?: string }> = ({ raw, language }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-900/60 bg-gray-900">
      <div className="flex items-center justify-between bg-gray-800 px-3 py-1 text-[11px] text-gray-300">
        <span>{language || '代码块'}</span>
        <AgentPreviewCopyButton text={raw} />
      </div>
      <pre className="overflow-auto px-3 py-2 text-xs text-gray-100">
        <code className="font-mono">{raw}</code>
      </pre>
    </div>
  );
};

export const AgentPreviewMessageContent: React.FC<AgentPreviewMessageContentProps> = ({
  content,
  className,
  isStreaming = false,
}) => {
  const trimmed = content.trim();

  if (!trimmed) {
    return <span className="text-xs text-gray-400">AI 正在回复中...</span>;
  }

  return (
    <div className={cn('space-y-2 text-sm text-gray-700', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: (props) => <p className="leading-relaxed" {...props} />,
          ul: (props) => <ul className="list-disc pl-5 space-y-1" {...props} />,
          ol: (props) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
          li: (props) => <li className="leading-relaxed" {...props} />,
          table: (props) => (
            <table className="w-full border-collapse text-xs" {...props} />
          ),
          th: (props) => (
            <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left" {...props} />
          ),
          td: (props) => <td className="border border-gray-200 px-2 py-1" {...props} />,
          img: (props) => (
            <img
              className="max-w-full rounded-lg border border-gray-100"
              loading="lazy"
              {...props}
            />
          ),
          a: (props) => (
            <a className="text-blue-600 underline" target="_blank" rel="noreferrer" {...props} />
          ),
          code: ({ inline, className: codeClassName, children, ...props }) => {
            const language = codeClassName?.replace('language-', '') ?? '';
            const raw = String(children).replace(/\n$/, '');

            // 透传流式状态，让扩展块在 JSON 未拼完整时先显示占位
            if (!inline && language === 'chart') {
              return <AgentPreviewChartBlock raw={raw} isStreaming={isStreaming} />;
            }

            if (!inline && language === 'form') {
              return <AgentPreviewFormBlock raw={raw} isStreaming={isStreaming} />;
            }

            if (!inline && language === 'component') {
              return <AgentPreviewComponentBlock raw={raw} isStreaming={isStreaming} />;
            }

            if (!inline && (language === 'csv' || language === 'excel')) {
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>CSV / Excel 预览</span>
                    <AgentPreviewCopyButton text={raw} label="复制 CSV" copiedLabel="已复制" className="border-gray-200 text-gray-500" />
                  </div>
                  <CsvTable raw={raw} />
                </div>
              );
            }

            if (inline) {
              return (
                <code
                  className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-700"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock raw={raw} language={language} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};