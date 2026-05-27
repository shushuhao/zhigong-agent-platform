import React, { useEffect, useState, useRef } from 'react';
import type { EntityAnnotation, RelationConnection } from '../store';
import styles from './RelationConnector.module.css';

interface RelationConnectorProps {
    entities: EntityAnnotation[];
    relations: RelationConnection[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    connecting: boolean;
    connectingFromId: string | null;
    hoveredEntity: string | null;
    hoveredRelation?: string | null;
    onDeleteRelation: (relationId: string) => void;
    canConnectToEntity?: (entityId: string) => boolean;
}

interface EntityPosition {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

function RelationConnector({
    entities,
    relations,
    containerRef,
    connecting,
    connectingFromId,
    hoveredEntity,
    hoveredRelation,
    onDeleteRelation,
    canConnectToEntity,
}: RelationConnectorProps): JSX.Element {
    const [entityPositions, setEntityPositions] = useState<EntityPosition[]>([]);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // 计算实体位置
    useEffect(() => {
        const updatePositions = (): void => {
            if (!containerRef.current) return;

            const positions: EntityPosition[] = [];
            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();

            entities.forEach((entity) => {
                // 只查找主文本编辑器中的实体元素，排除折叠面板中的
                const allEntityElements = container.querySelectorAll(`[data-entity-id="${entity.id}"]`);

                const entityElements = Array.from(allEntityElements).filter((el) => {
                    const element = el as HTMLElement;
                    // 检查是否在主文本编辑器中（不在折叠面板的内容区域中）
                    const isInCollapseContent = element.closest('.ant-collapse-content, .collapseContent');
                    const isInMainEditor = element.closest('.text-editor-container, .editor-content, .ql-editor');

                    return !isInCollapseContent || !!isInMainEditor;
                });
                if (entityElements.length > 0) {
                    // 如果有多个元素，需要找到正确的那个
                    let targetElement = entityElements[0] as HTMLElement;

                    if (entityElements.length > 1) {
                        console.warn(`实体 ${entity.id} 有 ${entityElements.length} 个DOM元素，需要选择正确的元素`);

                        // 优先选择可见的、在主文本内容中的元素
                        for (let i = 0; i < entityElements.length; i++) {
                            const element = entityElements[i] as HTMLElement;
                            const elementText = element.textContent || '';
                            const rect = element.getBoundingClientRect();

                            // 选择可见的、文本匹配的、在主文本区域的元素
                            const isTextMatch = elementText.includes(entity.text) || entity.text.includes(elementText);
                            const isVisible = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0;
                            const collapseContent = element.closest('.ant-collapse-content') as HTMLElement;
                            const isInMainContent = !collapseContent ||
                                    collapseContent.style.maxHeight !== '0px';

                            if (isTextMatch && isVisible && isInMainContent) {
                                targetElement = element;
                                break;
                            }
                        }
                    }

                    const rect = targetElement.getBoundingClientRect();

                    // 尝试获取更精确的文本位置
                    let textCenterX = rect.left + rect.width / 2;
                    let textBottomY = rect.bottom;

                    // 如果是文本节点，尝试获取更精确的位置
                    try {
                        const range = document.createRange();
                        const textNode = targetElement.firstChild;

                        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                            range.selectNodeContents(textNode);
                            const textRect = range.getBoundingClientRect();

                            if (textRect.width > 0 && textRect.height > 0) {
                                // 检查是否是跨行元素（宽度很大）
                                if (textRect.width > 400) {
                                    // 对于跨行元素，找到第一行的位置
                                    const text = textNode.textContent || '';
                                    let firstLineLeft = textRect.left;
                                    let firstLineRight = textRect.left;

                                    // 逐字符检查，找到第一行的结束位置
                                    for (let i = 1; i <= text.length; i++) {
                                        range.setStart(textNode, 0);
                                        range.setEnd(textNode, i);
                                        const charRect = range.getBoundingClientRect();

                                        // 如果right坐标不再增加，说明换行了
                                        if (charRect.right > firstLineRight) {
                                            firstLineRight = charRect.right;
                                            if (i === 1) firstLineLeft = charRect.left; // 记录第一行的左端
                                        } else {
                                            break;
                                        }
                                    }

                                    // 使用第一行的中心位置，并稍微往左偏移
                                    const firstLineCenter = (firstLineLeft + firstLineRight) / 2;
                                    const adjustedX = firstLineCenter - 10; // 往左偏移10px，避免箭头过长
                                    textCenterX = adjustedX;
                                    textBottomY = textRect.top + 20; // 使用第一行的底部
                                } else {
                                    textCenterX = textRect.left + textRect.width / 2;
                                    textBottomY = textRect.bottom;
                                }
                            }
                        }
                    } catch (error) {
                        console.log('无法获取文本节点位置，使用元素位置');
                    }

                    positions.push({
                        id: entity.id,
                        x: textCenterX - containerRect.left, // 使用精确的文本中心
                        y: textBottomY - containerRect.top + 10, // 圆形：文本下方10px
                        width: rect.width,
                        height: rect.height,
                    });
                } else {
                    console.warn(`未找到实体 ${entity.id} 的DOM元素`);
                }
            });

            setEntityPositions(positions);
        };

        updatePositions();

        // 延迟更新以确保DOM完全渲染
        const timeouts = [
            setTimeout(updatePositions, 100),
            setTimeout(updatePositions, 500),
        ];

        const resizeObserver = new ResizeObserver(updatePositions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            timeouts.forEach(clearTimeout);
            resizeObserver.disconnect();
        };
    }, [entities, relations, containerRef]);

    // 监听关系创建事件，强制重新计算位置
    useEffect(() => {
        const handleRelationCreated = (event: CustomEvent): void => {
            console.log('🔄 收到关系创建事件，重新计算位置:', event.detail);

            // 延迟更新确保DOM已经更新
            setTimeout(() => {
                if (!containerRef.current) return;

                const positions: EntityPosition[] = [];
                const container = containerRef.current;
                const containerRect = container.getBoundingClientRect();

                entities.forEach((entity) => {
                    const entityElements = document.querySelectorAll(`[data-entity-id="${entity.id}"]`);
                    const filteredElements = Array.from(entityElements).filter((el) => {
                        const element = el as HTMLElement;
                        const isInCollapseContent = element.closest('.ant-collapse-content, .collapseContent');
                        const isInMainEditor = element.closest('.text-editor-container, .editor-content, .ql-editor');
                        return !isInCollapseContent || !!isInMainEditor;
                    });

                    if (filteredElements.length > 0) {
                        let targetElement = filteredElements[0] as HTMLElement;

                        if (filteredElements.length > 1) {
                            for (let i = 0; i < filteredElements.length; i++) {
                                const el = filteredElements[i] as HTMLElement;
                                const elementText = el.textContent || '';
                                const rect = el.getBoundingClientRect();
                                const isTextMatch = elementText.includes(entity.text) || entity.text.includes(elementText);
                                const isVisible = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0;
                                const collapseContent = el.closest('.ant-collapse-content') as HTMLElement;
                                const isInMainContent = !collapseContent || collapseContent.style.maxHeight !== '0px';

                                if (isTextMatch && isVisible && isInMainContent) {
                                    targetElement = el;
                                    break;
                                }
                            }
                        }

                        const rect = targetElement.getBoundingClientRect();
                        let textCenterX = rect.left + rect.width / 2;
                        let textBottomY = rect.bottom;

                        try {
                            const range = document.createRange();
                            const textNode = targetElement.firstChild;
                            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                                range.selectNodeContents(textNode);
                                const textRect = range.getBoundingClientRect();
                                if (textRect.width > 0 && textRect.height > 0) {
                                    textCenterX = textRect.left + textRect.width / 2;
                                    textBottomY = textRect.bottom;
                                }
                            }
                        } catch (error) {
                            // 使用元素位置作为回退
                        }

                        positions.push({
                            id: entity.id,
                            x: textCenterX - containerRect.left,
                            y: textBottomY - containerRect.top + 10, // 圆形：文本下方10px
                            width: rect.width,
                            height: rect.height,
                        });
                    }
                });

                console.log('🎯 关系创建后重新计算的位置:', positions);
                setEntityPositions(positions);
            }, 100);
        };

        window.addEventListener('relationCreated', handleRelationCreated as EventListener);

        return () => {
            window.removeEventListener('relationCreated', handleRelationCreated as EventListener);
        };
    }, [entities, containerRef]);

    // 当hover关系变化时，强制更新实体位置
    useEffect(() => {
        if (hoveredRelation) {
            // 直接调试 container 信息，不用 setTimeout
            const hasContainer = !!containerRef.current;
            if (hasContainer) {
                console.log('🎯 Container 存在，开始调试');
            } else {
                console.log('🎯 Container 不存在！');
                return undefined;
            }

            if (containerRef.current) {
                const container = containerRef.current;
                try {
                    const containerRect = container.getBoundingClientRect();
                    console.log('🎯 Container 信息:', {
                        className: container.className,
                        tagName: container.tagName,
                        rect: {
                            left: Math.round(containerRect.left),
                            top: Math.round(containerRect.top),
                            width: Math.round(containerRect.width),
                            height: Math.round(containerRect.height),
                        },
                        totalChildElements: container.querySelectorAll('*').length,
                    });
                } catch (error) {
                    console.log('🎯 获取 container 信息时出错:', error);
                }

                const allTextElements = container.querySelectorAll('*');
                let foundCount = 0;
                Array.from(allTextElements).forEach((el) => {
                    const text = el.textContent || '';
                    if (text.includes('检查')) {
                        const rect = el.getBoundingClientRect();
                        const entityId = (el as HTMLElement).getAttribute('data-entity-id');
                        const left = Math.round(rect.left);
                        console.log(`元素${foundCount}: left=${left}, entityId="${entityId}"`);
                        foundCount++;
                    }
                });
                const rightSideElements = container.querySelectorAll('.yE7qhG9OLo8j3yKTl4K4');
                Array.from(rightSideElements).forEach((el, i) => {
                    const rect = el.getBoundingClientRect();
                    const entityId = (el as HTMLElement).getAttribute('data-entity-id');
                    console.log(`  右侧元素${i}: left=${Math.round(rect.left)}, entityId="${entityId}"`);
                });

                // 直接在整个 document 中查找目标实体
                console.log('🔍 在整个 document 中查找目标实体:');
                const allTargetElements = document.querySelectorAll('[data-entity-id="entity_1757514566021_pn3bkdz46"]');
                console.log('🔍 document 中找到目标实体数量:', allTargetElements.length);
                Array.from(allTargetElements).forEach((el, i) => {
                    const rect = el.getBoundingClientRect();
                    console.log(`  document元素${i}: left=${Math.round(rect.left)}, top=${Math.round(rect.top)}, right=${Math.round(rect.right)}, width=${Math.round(rect.width)}`);

                    // 检查是否是跨行元素
                    if (rect.width > 400) { // 如果宽度很大，可能是跨行
                        console.log(`    元素${i} 可能跨行，宽度=${Math.round(rect.width)}`);

                        // 尝试获取文本节点的具体位置
                        try {
                            const textContent = el.textContent || '';
                            console.log(`    文本内容: "${textContent}"`);
                            console.log(`    子节点数量: ${el.childNodes.length}`);

                            // 检查所有子节点
                            Array.from(el.childNodes).forEach((node, nodeIndex) => {
                                console.log(`    子节点${nodeIndex}: 类型=${node.nodeType}, 内容="${node.textContent?.substring(0, 20)}"`);
                            });

                            // 尝试更小的文本片段来找到换行点
                            const range = document.createRange();
                            const textNode = el.firstChild;
                            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                                const text = textNode.textContent || '';
                                console.log(`    第一个文本节点: "${text}"`);

                                // 尝试逐字符检查，找到换行的位置
                                for (let j = 1; j <= Math.min(text.length, 10); j++) {
                                    range.setStart(textNode, 0);
                                    range.setEnd(textNode, j);
                                    const charRect = range.getBoundingClientRect();
                                    console.log(`    前${i}字符: "${text.substring(0, i)}" -> right=${Math.round(charRect.right)}, top=${Math.round(charRect.top)}`);
                                }
                            }
                        } catch (error) {
                            console.log('    获取文本位置时出错:', error);
                        }
                    }
                });

                // 如果没找到"检查"，尝试查找其他关键词
                if (foundCount === 0) {
                    console.log('🔍 没找到"检查"，尝试查找"冷却":');
                    let coolCount = 0;
                    Array.from(allTextElements).forEach((el) => {
                        const text = el.textContent || '';
                        if (text.includes('冷却')) {
                            const rect = el.getBoundingClientRect();
                            const entityId = (el as HTMLElement).getAttribute('data-entity-id');
                            console.log(`  冷却元素${coolCount}: left=${Math.round(rect.left)}, entityId="${entityId}", text="${text.substring(0, 50)}"`);
                            coolCount++;
                        }
                    });
                }
            }

            // 延迟更新以确保DOM已经更新
            const timeout = setTimeout(() => {
                console.log('🎯 setTimeout 执行，开始更新位置');
                const updatePositions = (): void => {
                    console.log('🎯 updatePositions 函数开始执行');
                    console.log('🎯 containerRef.current:', !!containerRef.current);
                    if (!containerRef.current) {
                        console.log('🎯 containerRef.current 为空，退出');
                        return;
                    }
                    console.log('🎯 containerRef.current 存在，继续执行');

                    console.log('🎯 开始遍历实体，总数:', entities.length);
                    console.log('🎯 实体列表:', entities.map((e) => ({ id: e.id, text: e.text.substring(0, 20) })));

                    const positions: EntityPosition[] = [];
                    const container = containerRef.current;
                    const containerRect = container.getBoundingClientRect();

                    // 调试 container 的范围
                    console.log('🎯 Container 信息:', {
                        className: container.className,
                        tagName: container.tagName,
                        rect: {
                            left: Math.round(containerRect.left),
                            top: Math.round(containerRect.top),
                            width: Math.round(containerRect.width),
                            height: Math.round(containerRect.height),
                        },
                        totalChildElements: container.querySelectorAll('*').length,
                    });

                    entities.forEach((entity) => {
                        // 只查找主文本编辑器中的实体元素
                        const allEntityElements = container.querySelectorAll(`[data-entity-id="${entity.id}"]`);

                        const entityElements = Array.from(allEntityElements).filter((el) => {
                            const element = el as HTMLElement;
                            const isInCollapseContent = element.closest('.ant-collapse-content, .collapseContent');
                            const isInMainEditor = element.closest('.text-editor-container, .editor-content, .ql-editor');
                            return !isInCollapseContent || !!isInMainEditor;
                        });
                        if (entityElements.length > 0) {
                            let targetElement = entityElements[0] as HTMLElement;

                            if (entityElements.length > 1) {
                                for (let i = 0; i < entityElements.length; i++) {
                                    const element = entityElements[i] as HTMLElement;
                                    const elementText = element.textContent || '';
                                    const rect = element.getBoundingClientRect();

                                    const isTextMatch = elementText.includes(entity.text) || entity.text.includes(elementText);
                                    const isVisible = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0;
                                    const collapseContent = element.closest('.ant-collapse-content') as HTMLElement;
                                    const isInMainContent = !collapseContent || collapseContent.style.maxHeight !== '0px';

                                    if (isTextMatch && isVisible && isInMainContent) {
                                        targetElement = element;
                                        break;
                                    }
                                }
                            }

                            const rect = targetElement.getBoundingClientRect();
                            let textCenterX = rect.left + rect.width / 2;
                            let textBottomY = rect.bottom;

                            try {
                                const range = document.createRange();
                                const textNode = targetElement.firstChild;

                                if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                                    range.selectNodeContents(textNode);
                                    const textRect = range.getBoundingClientRect();

                                    if (textRect.width > 0 && textRect.height > 0) {
                                        // 检查是否是跨行元素（宽度很大）
                                        if (textRect.width > 400) {
                                            console.log(`🎯 实体位置计算：检测到跨行元素 ${entity.id}，宽度=${textRect.width}`);

                                            // 对于跨行元素，找到第一行的位置
                                            const text = textNode.textContent || '';
                                            let firstLineLeft = textRect.left;
                                            let firstLineRight = textRect.left;

                                            // 逐字符检查，找到第一行的结束位置
                                            for (let i = 1; i <= text.length; i++) {
                                                range.setStart(textNode, 0);
                                                range.setEnd(textNode, i);
                                                const charRect = range.getBoundingClientRect();

                                                // 如果right坐标不再增加，说明换行了
                                                if (charRect.right > firstLineRight) {
                                                    firstLineRight = charRect.right;
                                                    if (i === 1) firstLineLeft = charRect.left; // 记录第一行的左端
                                                } else {
                                                    break;
                                                }
                                            }

                                            // 使用第一行的中心位置，并稍微往左偏移
                                            const firstLineCenter = (firstLineLeft + firstLineRight) / 2;
                                            const adjustedX = firstLineCenter - 10; // 往左偏移10px，避免箭头过长

                                            console.log(`🎯 实体位置计算：第一行 left=${firstLineLeft}, right=${firstLineRight}, center=${firstLineCenter}, adjusted=${adjustedX}`);
                                            textCenterX = adjustedX;
                                            textBottomY = textRect.top + 20; // 使用第一行的底部
                                        } else {
                                            textCenterX = textRect.left + textRect.width / 2;
                                            textBottomY = textRect.bottom;
                                        }
                                    }
                                }
                            } catch (error) {
                                // 使用元素位置作为回退
                            }

                            positions.push({
                                id: entity.id,
                                x: textCenterX - containerRect.left,
                                y: textBottomY - containerRect.top + 8,
                                width: rect.width,
                                height: rect.height,
                            });
                        }
                    });

                    setEntityPositions(positions);
                    console.log('🎯 Hover时更新的实体位置:', positions);
                };

                updatePositions();
            }, 50);

            return () => clearTimeout(timeout);
        }
        return undefined;
    }, [hoveredRelation, entities, containerRef]);

    // 监听鼠标移动事件
    useEffect(() => {
        if (!connecting || !containerRef.current) {
            setMousePosition(null);
            return undefined;
        }

        const handleMouseMove = (e: MouseEvent): void => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - containerRect.left,
                y: e.clientY - containerRect.top,
            });
        };

        const container = containerRef.current;
        container.addEventListener('mousemove', handleMouseMove);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
        };
    }, [connecting, containerRef]);

    // 生成SVG路径 - 改为向下弯曲
    const generatePath = (fromPos: EntityPosition, toPos: EntityPosition): string => {
        // 计算中点
        const midX = (fromPos.x + toPos.x) / 2;

        // 向下弯曲：控制点Y坐标比起点和终点都要大
        const maxY = Math.max(fromPos.y, toPos.y);
        const controlY = maxY + 120; // 增加弯曲度，从80改为120像素

        // 使用传入的位置，不再重新计算，确保预览和实际连线位置一致
        const finalToX = toPos.x;
        const finalToY = toPos.y;

        // 连线从圆形中心连到箭头中心
        const path = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${controlY} ${finalToX} ${finalToY}`;

        return path;
    };

    // 计算标签位置 - 放在弯曲的底部
    const getLabelPosition = (fromPos: EntityPosition, toPos: EntityPosition): { x: number; y: number } => {
        const midX = (fromPos.x + toPos.x) / 2;
        const maxY = Math.max(fromPos.y, toPos.y);
        const controlY = maxY + 120; // 与路径控制点一致

        return {
            x: midX,
            y: controlY + 5, // 在弯曲底部稍微下方
        };
    };

    if (!containerRef.current) return <div />;

    return (
        <svg
            ref={svgRef}
            className={styles.relationSvg}
        >
            <defs>
                {/* 普通箭头标记 */}
                <marker
                    id='arrowhead'
                    markerWidth='4'
                    markerHeight='4'
                    refX='0'
                    refY='2'
                    orient='auto'
                >
                    <polygon
                        points='0 0, 4 2, 0 4'
                        className={styles.arrowMarker}
                    />
                </marker>

                {/* 高亮箭头标记 */}
                <marker
                    id='arrowhead-highlighted'
                    markerWidth='4'
                    markerHeight='4'
                    refX='0'
                    refY='2'
                    orient='auto'
                >
                    <polygon
                        points='0 0, 4 2, 0 4'
                        className={`${styles.arrowMarker} ${styles.highlighted}`}
                    />
                </marker>

                {/* 连接预览箭头标记 */}
                <marker
                    id='arrowhead-preview'
                    markerWidth='4'
                    markerHeight='4'
                    refX='0'
                    refY='2'
                    orient='auto'
                >
                    <polygon
                        points='0 0, 4 2, 0 4'
                        className={styles.previewArrowMarker}
                    />
                </marker>

                {/* 不可连接预览箭头标记 */}
                <marker
                    id='arrowhead-preview-disabled'
                    markerWidth='4'
                    markerHeight='4'
                    refX='0'
                    refY='2'
                    orient='auto'
                >
                    <polygon
                        points='0 0, 4 2, 0 4'
                        className={styles.previewArrowMarkerDisabled}
                    />
                </marker>

                {/* 点击连线时的灰色箭头标记 */}
                <marker
                    id='arrowhead-connecting'
                    markerWidth='4'
                    markerHeight='4'
                    refX='0'
                    refY='2'
                    orient='auto'
                >
                    <polygon
                        points='0 0, 4 2, 0 4'
                        fill='#999999'
                    />
                </marker>
            </defs>

            {/* 渲染连接预览线 */}
            {connecting && connectingFromId && (
                (() => {
                    const fromEntity = entityPositions.find((pos) => pos.id === connectingFromId);
                    if (!fromEntity) return null;

                    let targetPosition = null;
                    let canConnect = true;

                    // 优先使用鼠标悬浮的实体（更准确），然后才是距离检测
                    if (hoveredEntity && hoveredEntity !== connectingFromId) {
                        // 鼠标悬浮到实体上，使用实体的精确位置
                        const hoveredEntityPosition = entityPositions.find((pos) => pos.id === hoveredEntity);
                        if (hoveredEntityPosition) {
                            targetPosition = hoveredEntityPosition;
                            canConnect = canConnectToEntity ? canConnectToEntity(hoveredEntity) : true;
                            console.log('🎯 优先使用鼠标悬浮实体，箭头指向实体位置:', {
                                hoveredEntity,
                                entityPosition: hoveredEntityPosition,
                                canConnect,
                                allEntityPositions: entityPositions.map((p) => ({ id: p.id, x: p.x, y: p.y })),
                            });
                        } else {
                            console.warn('⚠️ 悬浮实体位置未找到:', {
                                hoveredEntity,
                                availablePositions: entityPositions.map((p) => ({ id: p.id, x: p.x, y: p.y })),
                            });
                            if (mousePosition) {
                                // 实体位置未找到，回退到鼠标位置
                                targetPosition = {
                                    id: 'mouse',
                                    x: mousePosition.x,
                                    y: mousePosition.y,
                                    width: 0,
                                    height: 0,
                                };
                            }
                        }
                    } else if (mousePosition) {
                        // 备用方案：查找鼠标附近的实体，改进距离计算逻辑
                        let nearbyEntity: EntityPosition | null = null;
                        let minDistance = Infinity;
                        const tolerance = 50; // 50px容差范围

                        for (const entityPos of entityPositions) {
                            if (entityPos.id === connectingFromId) continue; // 跳过起始实体

                            const distance = Math.sqrt(
                                (mousePosition.x - entityPos.x) ** 2 +
                                (mousePosition.y - entityPos.y) ** 2,
                            );

                            // 找到距离最近且在容差范围内的实体
                            if (distance <= tolerance && distance < minDistance) {
                                nearbyEntity = entityPos;
                                minDistance = distance;
                            }
                        }

                        if (nearbyEntity) {
                            targetPosition = nearbyEntity;
                            canConnect = canConnectToEntity ? canConnectToEntity(nearbyEntity.id) : true;
                            console.log('🎯 使用距离检测找到附近实体:', {
                                nearbyEntityId: nearbyEntity.id,
                                distance: minDistance,
                                entityPosition: nearbyEntity,
                                canConnect,
                            });
                        } else {
                            // 没有找到附近的实体，跟随鼠标位置
                            targetPosition = {
                                id: 'mouse',
                                x: mousePosition.x,
                                y: mousePosition.y,
                                width: 0,
                                height: 0,
                            };
                        }
                    }

                    if (!targetPosition) {
                        // 只显示起点
                        return (
                            <g key='connection-start'>
                                <circle
                                    cx={fromEntity.x}
                                    cy={fromEntity.y}
                                    className={styles.startPoint}
                                />
                            </g>
                        );
                    }

                    const path = generatePath(fromEntity, targetPosition); // 预览模式

                    return (
                        <g key='connection-preview'>
                            {/* 起点圆点 - 点击连线时使用灰色 */}
                            <circle
                                cx={fromEntity.x}
                                cy={fromEntity.y}
                                r='4'
                                fill='#999999'
                                stroke='#999999'
                                strokeWidth='1'
                            />

                            {/* 预览连线 - 点击连线时使用灰色圆点虚线 */}
                            <path
                                d={path}
                                stroke='#999999'
                                strokeDasharray='4 4'
                                strokeWidth='2'
                                fill='none'
                                markerEnd='url(#arrowhead-connecting)'
                                style={{ pointerEvents: 'none' }}
                            />
                        </g>
                    );
                })()
            )}

            {/* 渲染关系连线 */}
            {relations.map((relation) => {
                if (!relation.visible) return null;

                const fromEntity = entityPositions.find((pos) => pos.id === relation.fromEntityId);
                const toEntity = entityPositions.find((pos) => pos.id === relation.toEntityId);

                if (!fromEntity || !toEntity) return null;

                const path = generatePath(fromEntity, toEntity);
                const labelPos = getLabelPosition(fromEntity, toEntity);

                // 只有当悬浮到具体关系时才显示连接线
                if (hoveredRelation !== relation.id) return null;

                return (
                    <g key={relation.id}>
                        {/* 起点圆点 */}
                        <circle
                            cx={fromEntity.x}
                            cy={fromEntity.y}
                            className={`${styles.startPoint} ${styles.highlighted}`}
                            style={{ pointerEvents: 'all', cursor: 'pointer' }}
                        />

                        {/* 连线路径 */}
                        <path
                            d={path}
                            className={`${styles.connectionLine} ${styles.highlighted}`}
                            markerEnd='url(#arrowhead-highlighted)'
                        />

                        {/* 悬停时显示删除按钮 */}
                        {hoveredRelation === relation.id && (
                            <circle
                                cx={labelPos.x + 35}
                                cy={labelPos.y}
                                r='8'
                                className={styles.deleteButton}
                                onClick={() => onDeleteRelation(relation.id)}
                            />
                        )}
                        {hoveredRelation === relation.id && (
                            <text
                                x={labelPos.x + 35}
                                y={labelPos.y + 3}
                                textAnchor='middle'
                                style={{
                                    fontSize: '10px',
                                    fill: 'white',
                                    fontWeight: 'bold',
                                    pointerEvents: 'none',
                                }}
                            >
                ×
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

export default RelationConnector;
