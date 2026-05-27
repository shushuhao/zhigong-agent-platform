import { Node, XYPosition } from '@xyflow/react';

const NODE_WIDTH = 220; // Default min-width of nodes
const NODE_HEIGHT = 100; // Approximate height
const BUFFER = 4; // Minimal buffer for tight packing

const getBounds = (node: Node | { position: XYPosition; measured?: { width: number; height: number } }) => {
    const x = node.position.x;
    const y = node.position.y;
    const w = 'measured' in node ? (node.measured?.width || NODE_WIDTH) : NODE_WIDTH;
    const h = 'measured' in node ? (node.measured?.height || NODE_HEIGHT) : NODE_HEIGHT;

    return {
        left: x,
        right: x + w,
        top: y,
        bottom: y + h,
        width: w,
        height: h
    };
};

const checkCollision = (r1: ReturnType<typeof getBounds>, r2: ReturnType<typeof getBounds>) => {
    return !(
        r2.left >= r1.right + BUFFER ||
        r2.right <= r1.left - BUFFER ||
        r2.top >= r1.bottom + BUFFER ||
        r2.bottom <= r1.top - BUFFER
    );
};

/**
 * 优化后的刚体碰撞算法：基于移动方向的阻挡
 * 
 * 原理：
 * 1. 判断"上一帧"节点在障碍物的哪个方位。
 * 2. 如果上一帧在左边，那么这一帧即使撞进去了，也强制锁定在左边（X轴阻挡），但允许 Y 轴自由移动。
 * 3. 这样可以避免"瞬移"到上下方，实现自然的贴边阻挡效果。
 */
export const getValidPosition = (
    draggedNode: Node,      // 目标位置（鼠标所在位置）
    originalNode: Node,     // 原始位置（上一帧的位置）
    otherNodes: Node[]      // 障碍物列表
): XYPosition => {
    let currentBounds = getBounds(draggedNode);
    let newX = draggedNode.position.x;
    let newY = draggedNode.position.y;

    // 获取原始位置的边界（用于判断方位）
    const originalBounds = getBounds(originalNode);

    for (const other of otherNodes) {
        const otherBounds = getBounds(other);

        if (checkCollision(currentBounds, otherBounds)) {
            // === 发生碰撞 ===
            // 核心逻辑：判断我们是从哪个方向"撞"上去的
            // 我们使用 originalBounds (撞击前的位置) 来判断

            // 1. 之前在左边 (Right < Left)
            // 这里的判断加一点点容错 (BUFFER/2)，防止边界闪烁
            if (originalBounds.right <= otherBounds.left + BUFFER) {
                // 锁定 X 轴在障碍物左侧
                newX = otherBounds.left - currentBounds.width - BUFFER;
            }
            // 2. 之前在右边 (Left > Right)
            else if (originalBounds.left >= otherBounds.right - BUFFER) {
                // 锁定 X 轴在障碍物右侧
                newX = otherBounds.right + BUFFER;
            }
            // 3. 之前在上面 (Bottom < Top)
            else if (originalBounds.bottom <= otherBounds.top + BUFFER) {
                // 锁定 Y 轴在障碍物上侧
                newY = otherBounds.top - currentBounds.height - BUFFER;
            }
            // 4. 之前在下面 (Top > Bottom)
            else if (originalBounds.top >= otherBounds.bottom - BUFFER) {
                // 锁定 Y 轴在障碍物下侧
                newY = otherBounds.bottom + BUFFER;
            }
            // 5. 如果以上都不是（比如生来就在重叠区域，或者瞬移进去了），
            // 降级策略：使用原来的最小距离法弹出（或者直接不动）
            else {
                // 简单的降级处理：保持原位，防止穿模
                // 也可以重新计算最小脱出距离（同上一版算法），这里为保持手感一致，
                // 我们选择沿用上一版的"最小推挤"逻辑作为 Fallback
                const distLeft = (currentBounds.right + BUFFER) - otherBounds.left;
                const distRight = otherBounds.right + BUFFER - currentBounds.left;
                const distTop = (currentBounds.bottom + BUFFER) - otherBounds.top;
                const distBottom = otherBounds.bottom + BUFFER - currentBounds.top;
                const minDist = Math.min(distLeft, distRight, distTop, distBottom);

                if (minDist === distLeft) newX -= distLeft;
                else if (minDist === distRight) newX += distRight;
                else if (minDist === distTop) newY -= distTop;
                else if (minDist === distBottom) newY += distBottom;
            }

            // 更新 Bounds 用于下一个障碍物检测
            currentBounds = {
                ...currentBounds,
                left: newX,
                right: newX + currentBounds.width,
                top: newY,
                bottom: newY + currentBounds.height
            };
        }
    }

    return { x: newX, y: newY };
};
