/**
 * 节点选择菜单组件
 * 
 * 展示所有可用节点，按分类分组
 * 用于 CustomHandle 点击时显示
 */
import React, { useMemo } from 'react';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';
import { NodeType, categoryLabels, NodeCategory } from '@/lib/workflow/types';

interface NodeHoverMenuProps {
    onSelect: (type: NodeType) => void;
    onClose?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    style?: React.CSSProperties;
}

export const NodeHoverMenu: React.FC<NodeHoverMenuProps> = ({
    onSelect,
    onMouseEnter,
    onMouseLeave,
    style
}) => {
    // 1. 获取所有节点定义
    const availableNodes = useMemo(() => {
        return nodeRegistry.getAll().filter(n => n.type !== NodeType.START);
    }, []);

    // 2. 按分类分组
    const groupedNodes = useMemo(() => {
        const groups: Partial<Record<NodeCategory, typeof availableNodes>> = {};
        availableNodes.forEach(node => {
            if (!groups[node.category]) groups[node.category] = [];
            groups[node.category]?.push(node);
        });
        return groups;
    }, [availableNodes]);

    return (
        <div
            className="absolute bg-white rounded-lg shadow-xl border border-gray-100 w-56 max-h-80 overflow-y-auto z-[100] nodrag nopan"
            style={style}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {Object.entries(groupedNodes).map(([category, nodes]) => (
                <div key={category} className="border-b last:border-0 border-gray-100">
                    {/* 分类标题 */}
                    <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-500 font-medium sticky top-0">
                        {categoryLabels[category as NodeCategory]}
                    </div>

                    {/* 节点列表 */}
                    {nodes?.map(node => (
                        <div
                            key={node.type}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 transition-colors duration-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(node.type);
                            }}
                        >
                            <div className="w-5 h-5 rounded flex items-center justify-center text-xs text-white bg-blue-500">
                                {node.icon}
                            </div>
                            <span className="text-sm text-gray-700">{node.label}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default NodeHoverMenu;
