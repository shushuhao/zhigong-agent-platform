/**
 * 自动布局算法
 * 使用 dagre 库实现有向图的自动布局
 */
import dagre from 'dagre';
import { Edge, Position } from '@xyflow/react';
import { WorkflowNode, NodeType } from './types';

// 节点默认大小（用于布局计算）
const NODE_WIDTH = 250;
const NODE_HEIGHT = 100;

/**
 * 计算自动布局后的节点和边
 * @param nodes 当前节点列表
 * @param edges 当前边列表
 * @param direction 布局方向：'TB' (从上到下) | 'LR' (从左到右)
 */
export const getLayoutedElements = (
    nodes: WorkflowNode[],
    edges: Edge[],
    direction = 'LR'
): { nodes: WorkflowNode[]; edges: Edge[] } => {
    // 0. 特殊处理：如果没有连线，手动进行简单水平排列 (避免 Dagre 默认的垂直堆叠)
    if (edges.length === 0) {
        const sortedNodes = [...nodes].sort((a, b) => {
            // Start 排最前
            if (a.type === NodeType.START) return -1;
            if (b.type === NodeType.START) return 1;
            // End 排最后
            if (a.type === NodeType.END) return 1;
            if (b.type === NodeType.END) return -1;
            // 其他保持原序（或按 ID）
            return 0;
        });

        let currentX = 0;
        const layoutedNodes = sortedNodes.map((node) => {
            const width = node.measured?.width || NODE_WIDTH;
            const position = { x: currentX, y: 0 };
            currentX += width + 50; // 50px 间距
            return {
                ...node,
                targetPosition: direction === 'LR' ? Position.Left : Position.Top,
                sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
                position,
            };
        });
        return { nodes: layoutedNodes, edges };
    }

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // 设置布局方向
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
        rankdir: direction,
        align: 'DL', // 尽量向左上对齐
        nodesep: 50, // 同层节点间距
        ranksep: 80  // 层与层间距
    });

    // 1. 向 dagre 图中添加节点
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: node.measured?.width || NODE_WIDTH,
            height: node.measured?.height || NODE_HEIGHT
        });
    });

    // 2. 向 dagre 图中添加边
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // 3. 执行布局计算
    dagre.layout(dagreGraph);

    // 4. 将计算后的位置应用回节点
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // dagre 返回的是中心点坐标，React Flow 需要左上角坐标
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            // 需要减去一半的宽高来得到左上角坐标
            position: {
                x: nodeWithPosition.x - (node.measured?.width || NODE_WIDTH) / 2,
                y: nodeWithPosition.y - (node.measured?.height || NODE_HEIGHT) / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};
