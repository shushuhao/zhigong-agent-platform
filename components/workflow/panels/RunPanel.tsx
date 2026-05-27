'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CloseOutlined, PlayCircleOutlined, StopOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, ClockCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Button, Empty, Tag, Collapse, Input, Form, Tooltip } from 'antd';
import type { CollapseProps } from 'antd';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useWorkflowRunStore, selectIsRunning, selectLogs } from '@/stores/workflowRunStore';
import { NodeExecutionStatus, WorkflowRunStatus } from '@/lib/workflow/engine/types';
import { NodeType, type StartNodeData } from '@/lib/workflow/types';

/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * 格式化持续时间
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * 获取状态对应的图标
 */
function getStatusIcon(status: NodeExecutionStatus) {
  switch (status) {
    case NodeExecutionStatus.SUCCESS:
      return <CheckCircleOutlined className="text-green-500" />;
    case NodeExecutionStatus.FAILED:
      return <CloseCircleOutlined className="text-red-500" />;
    case NodeExecutionStatus.RUNNING:
      return <LoadingOutlined className="text-blue-500" spin />;
    case NodeExecutionStatus.SKIPPED:
      return <MinusCircleOutlined className="text-gray-400" />;
    case NodeExecutionStatus.PENDING:
    default:
      return <ClockCircleOutlined className="text-gray-400" />;
  }
}

/**
 * 获取工作流状态对应的标签
 */
function getWorkflowStatusTag(status: WorkflowRunStatus) {
  switch (status) {
    case WorkflowRunStatus.SUCCESS:
      return <Tag color="success">执行成功</Tag>;
    case WorkflowRunStatus.FAILED:
      return <Tag color="error">执行失败</Tag>;
    case WorkflowRunStatus.RUNNING:
      return <Tag color="processing">执行中...</Tag>;
    case WorkflowRunStatus.STOPPED:
      return <Tag color="warning">已停止</Tag>;
    case WorkflowRunStatus.IDLE:
    default:
      return <Tag color="default">待运行</Tag>;
  }
}

/**
 * 运行面板组件
 * 
 * 功能：
 * 1. 显示工作流执行状态
 * 2. 显示各节点执行状态和结果
 * 3. 显示实时执行日志
 * 4. 提供运行/停止/重置按钮
 */
export const RunPanel: React.FC = () => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  
  // 工作流数据
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  
  // 运行状态
  const status = useWorkflowRunStore((state) => state.status);
  const isRunning = useWorkflowRunStore(selectIsRunning);
  const nodeStatuses = useWorkflowRunStore((state) => state.nodeStatuses);
  const nodeResults = useWorkflowRunStore((state) => state.nodeResults);
  const logs = useWorkflowRunStore(selectLogs);
  const startTime = useWorkflowRunStore((state) => state.startTime);
  const endTime = useWorkflowRunStore((state) => state.endTime);
  const finalOutput = useWorkflowRunStore((state) => state.finalOutput);
  const isPanelOpen = useWorkflowRunStore((state) => state.isPanelOpen);
  const inputVariables = useWorkflowRunStore((state) => state.inputVariables);
  
  // 操作
  const startRun = useWorkflowRunStore((state) => state.startRun);
  const stopRun = useWorkflowRunStore((state) => state.stopRun);
  const resetRun = useWorkflowRunStore((state) => state.resetRun);
  const closePanel = useWorkflowRunStore((state) => state.closePanel);
  const updateInputVariable = useWorkflowRunStore((state) => state.updateInputVariable);
  
  // 获取开始节点的输入变量定义
  const startNode = nodes.find(n => n.type === NodeType.START);
  const startNodeInputs = (startNode?.data as StartNodeData)?.inputs || [];
  
  // 自动滚动到最新日志
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // 更新运行时长（使用定时器避免无限循环）
  useEffect(() => {
    if (!startTime) {
      setDuration(0);
      return;
    }

    // 如果已结束，计算最终时长
    if (endTime) {
      setDuration(endTime - startTime);
      return;
    }

    // 如果正在运行，每秒更新一次
    if (isRunning) {
      const timer = setInterval(() => {
        setDuration(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, endTime, isRunning]);

  // 如果面板关闭，不渲染
  if (!isPanelOpen) {
    return null;
  }

  // 构建 Collapse items（不使用 useMemo，避免依赖项变化导致的问题）
  const collapseItems: CollapseProps['items'] = [];

  // 输入变量面板
  if (startNodeInputs.length > 0) {
    collapseItems.push({
      key: 'inputs',
      label: <span className="font-medium text-gray-700">输入变量 ({startNodeInputs.length})</span>,
      children: (
        <Form layout="vertical" size="small" className="px-2">
          {startNodeInputs.map((input) => (
            <Form.Item
              key={input.name}
              label={
                <span className="text-gray-600">
                  {input.name}
                  {input.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              }
              className="mb-2"
            >
              <Input
                placeholder={input.description || `请输入 ${input.name}`}
                value={(inputVariables[input.name] as string) || (input.defaultValue as string) || ''}
                onChange={(e) => updateInputVariable(input.name, e.target.value)}
                disabled={isRunning}
              />
            </Form.Item>
          ))}
        </Form>
      ),
    });
  }

  // 节点状态面板
  collapseItems.push({
    key: 'nodes',
    label: <span className="font-medium text-gray-700">节点状态 ({nodes.length})</span>,
    children: (
      <div className="space-y-2 px-2">
        {nodes.map((node) => {
          const nodeStatus = nodeStatuses[node.id] || NodeExecutionStatus.PENDING;
          const nodeResult = nodeResults.find(r => r.nodeId === node.id);
          
          return (
            <div
              key={node.id}
              className={`flex items-center justify-between p-2 rounded border ${
                nodeStatus === NodeExecutionStatus.SUCCESS
                  ? 'border-green-200 bg-green-50'
                  : nodeStatus === NodeExecutionStatus.FAILED
                  ? 'border-red-200 bg-red-50'
                  : nodeStatus === NodeExecutionStatus.RUNNING
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(nodeStatus)}
                <span className="text-sm text-gray-700">{node.data.label}</span>
              </div>
              {nodeResult?.duration && (
                <span className="text-xs text-gray-400">
                  {formatDuration(nodeResult.duration)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    ),
  });

  // 执行日志面板
  collapseItems.push({
    key: 'logs',
    label: <span className="font-medium text-gray-700">执行日志 ({logs.length})</span>,
    children: (
      <div className="h-48 overflow-y-auto bg-gray-900 rounded p-2 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            暂无日志，点击运行按钮开始执行
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`py-0.5 ${
                log.type === 'error'
                  ? 'text-red-400'
                  : log.type === 'success'
                  ? 'text-green-400'
                  : log.type === 'warning'
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            >
              <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span>{' '}
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    ),
  });

  // 最终输出面板
  if (finalOutput && Object.keys(finalOutput).length > 0) {
    collapseItems.push({
      key: 'output',
      label: <span className="font-medium text-gray-700">最终输出</span>,
      children: (
        <div className="bg-gray-50 rounded p-3 font-mono text-xs overflow-x-auto">
          <pre className="text-gray-700">
            {JSON.stringify(finalOutput, null, 2)}
          </pre>
        </div>
      ),
    });
  }

  // 处理运行
  const handleRun = async () => {
    await startRun(nodes, edges);
  };

  // 处理停止
  const handleStop = () => {
    stopRun();
  };

  // 处理重置
  const handleReset = () => {
    resetRun();
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col max-h-[calc(100vh-120px)]">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-green-500 text-white">
            <PlayCircleOutlined />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">运行面板</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {getWorkflowStatusTag(status)}
              {duration > 0 && (
                <span>耗时: {formatDuration(duration)}</span>
              )}
            </div>
          </div>
        </div>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={closePanel}
        />
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <Collapse 
          defaultActiveKey={['inputs', 'nodes', 'logs']} 
          ghost
          items={collapseItems}
        />
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <Tooltip title="重置运行状态">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={isRunning}
          >
            重置
          </Button>
        </Tooltip>
        
        {isRunning ? (
          <Button
            type="primary"
            danger
            icon={<StopOutlined />}
            onClick={handleStop}
          >
            停止
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleRun}
            className="bg-green-500 hover:bg-green-600 border-green-500"
          >
            运行
          </Button>
        )}
      </div>
    </div>
  );
};

export default RunPanel;
