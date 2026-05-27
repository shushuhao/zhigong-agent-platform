'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Handle, Position, useConnection, useNodeId, useEdges, useReactFlow } from '@xyflow/react';
import { PlusOutlined } from '@ant-design/icons';
import { NodeType } from '@/lib/workflow/types';
import { useWorkflowStore } from '@/stores/workflowStore';
import { NodeHoverMenu } from './NodeHoverMenu';

interface CustomHandleProps {
    type: 'source' | 'target';
    position: Position;
    id?: string;
}

export const CustomHandle: React.FC<CustomHandleProps> = ({
    type,
    position,
    id,
}) => {
    // 1. 获取 React Flow 核心状态
    const nodeId = useNodeId();
    const connection = useConnection();
    const edges = useEdges();
    const { getNode } = useReactFlow();
    const addNode = useWorkflowStore((state) => state.addNode);

    // 2. 内部状态管理（用于节点菜单）
    const [showNodeList, setShowNodeList] = useState(false);
    const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 3. 计算连接状态
    const isConnecting = connection.inProgress;
    const isSource = isConnecting && connection.fromNode?.id === nodeId;

    // 检查当前 Handle 是否已有连线
    const isConnected = useMemo(() => {
        return edges.some(edge => {
            if (type === 'source') {
                return edge.source === nodeId && (!id || edge.sourceHandle === id);
            } else {
                return edge.target === nodeId && (!id || edge.targetHandle === id);
            }
        });
    }, [edges, nodeId, type, id]);

    // 4. 计算可见性
    const isVisible = isConnected || (isConnecting && !isSource && type === 'target');
    const isLeft = position === Position.Left;

    // 5. 事件处理
    const handleAddNode = useCallback((nodeType: NodeType) => {
        if (!nodeId) return;
        const currentNode = getNode(nodeId);
        if (!currentNode) return;
        // [优化] 新节点间距设为 500px，让连线更舒展
        addNode(nodeType, { x: currentNode.position.x + 500, y: currentNode.position.y });
        setShowNodeList(false);
    }, [addNode, getNode, nodeId]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        // 只有作为输出点且未连接时，点击才打开菜单
        if (type === 'source' && !isConnected) {
            e.stopPropagation();
            setShowNodeList(prev => !prev);
        }
    }, [type, isConnected]);

    const handleMouseEnter = useCallback(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        hideTimerRef.current = setTimeout(() => setShowNodeList(false), 200);
    }, []);

    return (
        <>
            {/* 核心 Handle 组件 */}
            <Handle
                type={type}
                position={position}
                id={id}
                onClick={handleClick}
                // 使用 Tailwind 类名控制样式
                className={`
                    /* === 基础样式 === */
                    !bg-blue-500               /* 始终蓝色背景 */
                    transition-all duration-200 /* 平滑过渡动画 */
                    nodrag nopan               /* 阻止事件冒泡 */
                    flex items-center justify-center
                    
                    /* === 可见性控制 === */
                    ${isVisible ? '!opacity-100' : '!opacity-0 group-hover:!opacity-100'}

                    /* === 状态样式（关键） === */
                    ${isConnected
                        ? '!w-3 !h-3 !border-0' // [已连接]：实心小圆，无边框 -> 消除间隙！
                        : '!w-6 !h-6 !border-2 !border-white shadow-md hover:!scale-110 !cursor-pointer' // [未连接]：空心大圆
                    }
                `}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* 未连接时显示 + 图标 */}
                {!isConnected && (
                    <PlusOutlined className="text-white text-[10px] pointer-events-none" style={{ lineHeight: 1 }} />
                )}
            </Handle>

            {/* 节点选择菜单 - 抽离为独立组件 */}
            {showNodeList && type === 'source' && (
                <NodeHoverMenu
                    onSelect={handleAddNode}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        top: '50%',
                        transform: 'translateY(-50%)',
                        [isLeft ? 'right' : 'left']: '100%',
                        [isLeft ? 'marginRight' : 'marginLeft']: 15,
                    }}
                />
            )}
        </>
    );
};

export default CustomHandle;
