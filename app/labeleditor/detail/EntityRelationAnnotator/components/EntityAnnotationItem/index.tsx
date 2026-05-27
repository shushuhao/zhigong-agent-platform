import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from 'antd';
import type { EntityAnnotation } from '../../store';
import styles from '../../index.module.css';
import entityStyles from '../EntityAnnotation.module.css';
import ConditionalTooltip from '../../../components/ConditionalTooltip';
import { addOpacityToColor } from '../../../utils/color';

interface EntityAnnotationItemProps {
    entity: EntityAnnotation;
    // 状态
    connecting: boolean;
    connectingFromId: string | null;
    hoveredEntity: string | null;
    showingConnectionTooltip: string | null;
    selectedRelationLabelId: string | null;
    // 事件处理
    onMouseEnter: (entityId: string) => void;
    onMouseLeave: () => void;
    onEntityClick: (entityId: string) => void;
    onDeleteEntity: (entityId: string) => void;
    onConnectionTooltipEnter: (entityId: string) => void;
    onConnectionTooltipLeave: () => void;
    onDeleteRelation: (relationId: string) => void;
    onRelationMouseEnter: (relationId: string) => void;
    onRelationMouseLeave: () => void;
    // 工具函数
    canConnectToEntity: (entityId: string) => boolean;
    getEntityConnectionCount: (entityId: string) => number;
    getEntityRelations: (entityId: string) => Array<{
        id: string;
        fromEntityId: string;
        toEntityId: string;
        relationId: string;
        visible: boolean;
        fromEntity?: EntityAnnotation;
        toEntity?: EntityAnnotation;
        relationLabel?: { id: string; name: string; entityLabelIds: string[]; selected: boolean };
    }>;
}

function EntityAnnotationItem({
    entity,
    connecting,
    connectingFromId,
    hoveredEntity,
    showingConnectionTooltip,
    selectedRelationLabelId,
    onMouseEnter,
    onMouseLeave,
    onEntityClick,
    onDeleteEntity,
    onConnectionTooltipEnter,
    onConnectionTooltipLeave,
    onDeleteRelation,
    onRelationMouseEnter,
    onRelationMouseLeave,
    canConnectToEntity,
    getEntityConnectionCount,
    getEntityRelations,
}: EntityAnnotationItemProps): React.ReactElement {
    // 计算状态
    const isConnectingFrom = connecting && connectingFromId === entity.id;
    const canConnect = connecting && connectingFromId !== entity.id && canConnectToEntity(entity.id);
    const cannotConnect = connecting && connectingFromId !== entity.id && !canConnectToEntity(entity.id);
    const shouldHighlight = selectedRelationLabelId && entity.highlighted;
    const connectionCount = getEntityConnectionCount(entity.id);

    // 计算样式
    const entityClasses = `${styles.entityAnnotation} ${shouldHighlight ? styles.highlighted : ''} ${isConnectingFrom ? styles.connecting : ''} ${cannotConnect ? styles.disabled : ''}`;

    const entityStyle = {
        backgroundColor: addOpacityToColor(entity.color, 0.6), // 统一使用透明度版本，避免颜色突变
        color: '#000',
        fontWeight: 500,
        opacity: (() => {
            if (!entity.visible) return 0.5;
            if (cannotConnect) return 0.4; // 不可连接时降低透明度而不是改变颜色
            return 1;
        })(),
        cursor: (() => {
            if (isConnectingFrom) return 'default';
            if (canConnect) return 'pointer';
            if (cannotConnect) return 'not-allowed';
            return 'pointer';
        })(),
        transition: 'opacity 0.2s ease', // 添加平滑过渡动画
    };

    const handleClick = (e: React.MouseEvent): void => {
        e.stopPropagation();
        onEntityClick(entity.id);
    };

    const handleMouseEnter = (): void => {
        onMouseEnter(entity.id);
    };

    const handleDeleteClick = (e: React.MouseEvent): void => {
        e.stopPropagation();
        onDeleteEntity(entity.id);
    };

    const entityRef = useRef<HTMLSpanElement>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [warningTooltipPosition, setWarningTooltipPosition] = useState({ top: 0, left: 0 });
    const [deleteButtonPosition, setDeleteButtonPosition] = useState({ top: 0, right: 0 });
    const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
    const [hoveredDeleteIcon, setHoveredDeleteIcon] = useState<string | null>(null);
    const [hoveredRelationRow, setHoveredRelationRow] = useState<string | null>(null);
    const connectionCountRef = useRef<HTMLSpanElement>(null);
    const [connectionTooltipPosition, setConnectionTooltipPosition] = useState({ top: 0, left: 0, showBelow: false });
    const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 计算tooltip位置
    useEffect(() => {
        if (hoveredEntity === entity.id && !showingConnectionTooltip && !connecting && !isDeleteButtonHovered && entityRef.current) {
            const rect = entityRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const tooltipWidth = 120; // 估算tooltip宽度

            // 获取实际的文本范围，处理换行情况
            const range = document.createRange();
            const textNode = entityRef.current.firstChild;

            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                range.selectNodeContents(textNode);
                const textRect = range.getBoundingClientRect();

                // 检查是否为跨行文本
                const lineHeight = 20; // 估算单行高度
                const isMultiLine = textRect.height > lineHeight * 1.5;

                let left;
                let top;

                if (isMultiLine) {
                    // 跨行文本：找到第一行的中心位置
                    console.log(`🎯 Tooltip位置计算：检测到跨行实体 ${entity.id}，寻找第一行中心位置`);

                    try {
                        // 尝试获取第一行的位置
                        // 方法：逐个字符检查，找到第一行的结束位置
                        const text = textNode.textContent || '';
                        let firstLineEndIndex = text.length;

                        // 从文本开始逐个字符检查，找到第一行结束的位置
                        for (let i = 1; i <= text.length; i++) {
                            range.setStart(textNode, 0);
                            range.setEnd(textNode, i);
                            const partialRect = range.getBoundingClientRect();

                            // 如果高度突然增加，说明换行了
                            if (partialRect.height > lineHeight * 1.2) {
                                firstLineEndIndex = i - 1;
                                break;
                            }
                        }

                        // 获取第一行的边界框
                        range.setStart(textNode, 0);
                        range.setEnd(textNode, Math.max(1, firstLineEndIndex));
                        const firstLineRect = range.getBoundingClientRect();

                        left = firstLineRect.left + firstLineRect.width / 2;
                        top = firstLineRect.bottom + 4;

                        console.log('跨行文本tooltip位置（第一行中心）:', {
                            entityId: entity.id,
                            text: text.substring(0, firstLineEndIndex),
                            firstLineEndIndex,
                            firstLineRect,
                            calculatedPosition: { left, top },
                        });
                    } catch (error) {
                        console.error('第一行位置计算失败，使用文本区域中心:', error);
                        // 回退到使用文本区域的中心
                        left = textRect.left + textRect.width / 2;
                        top = textRect.bottom + 4;
                    }
                } else {
                    // 单行文本：使用文本的实际位置
                    left = textRect.left + textRect.width / 2;
                    top = textRect.bottom + 4;

                    console.log('单行文本tooltip位置:', {
                        entityId: entity.id,
                        textRect,
                        calculatedPosition: { left, top },
                    });
                }

                // 检查是否会超出右边界
                if (left + tooltipWidth / 2 > viewportWidth - 10) {
                    left = viewportWidth - tooltipWidth / 2 - 10;
                }

                // 检查是否会超出左边界
                if (left - tooltipWidth / 2 < 10) {
                    left = tooltipWidth / 2 + 10;
                }

                setTooltipPosition({
                    top,
                    left,
                });
            } else {
                // 回退到使用元素的边界框
                let left = rect.left + rect.width / 2;

                if (left + tooltipWidth / 2 > viewportWidth - 10) {
                    left = viewportWidth - tooltipWidth / 2 - 10;
                }

                if (left - tooltipWidth / 2 < 10) {
                    left = tooltipWidth / 2 + 10;
                }

                setTooltipPosition({
                    top: rect.bottom + 4,
                    left,
                });
            }
        }
    }, [hoveredEntity, entity.id, showingConnectionTooltip, connecting, isDeleteButtonHovered]);

    // 计算警告提示框位置
    useEffect(() => {
        if (hoveredEntity === entity.id && cannotConnect && entityRef.current) {
            const rect = entityRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const tooltipWidth = 300; // 警告提示框的最大宽度

            // 获取实际的文本范围，处理换行情况
            const range = document.createRange();
            const textNode = entityRef.current.firstChild;

            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                range.selectNodeContents(textNode);
                const textRect = range.getBoundingClientRect();

                // 计算基础位置
                let left = textRect.left + window.scrollX + textRect.width / 2;
                const top = textRect.top + window.scrollY - 60;

                // 检查是否会超出右边界
                if (left + tooltipWidth / 2 > viewportWidth - 10) {
                    left = viewportWidth - tooltipWidth / 2 - 10;
                }

                // 检查是否会超出左边界
                if (left - tooltipWidth / 2 < 10) {
                    left = tooltipWidth / 2 + 10;
                }

                const position = {
                    top,
                    left,
                };

                console.log('警告提示框位置计算 - 文本节点:', {
                    entityId: entity.id,
                    textRect,
                    position,
                    entityText: entity.text,
                    viewportWidth,
                    tooltipWidth,
                });

                setWarningTooltipPosition(position);
            } else {
                // 回退到使用元素的边界框
                let left = rect.left + window.scrollX + rect.width / 2;
                const top = rect.top + window.scrollY - 60;

                // 检查是否会超出右边界
                if (left + tooltipWidth / 2 > viewportWidth - 10) {
                    left = viewportWidth - tooltipWidth / 2 - 10;
                }

                // 检查是否会超出左边界
                if (left - tooltipWidth / 2 < 10) {
                    left = tooltipWidth / 2 + 10;
                }

                const position = {
                    top,
                    left,
                };

                console.log('警告提示框位置计算 - 元素边界框:', {
                    entityId: entity.id,
                    rect,
                    position,
                    entityText: entity.text,
                    viewportWidth,
                    tooltipWidth,
                });

                setWarningTooltipPosition(position);
            }
        }
    }, [hoveredEntity, entity.id, cannotConnect]);

    // 计算连接数tooltip位置
    useEffect(() => {
        if (showingConnectionTooltip === entity.id && connectionCountRef.current) {
            const rect = connectionCountRef.current.getBoundingClientRect();
            const tooltipWidth = 400; // 最大宽度
            const arrowSize = 8; // 箭头大小
            const gap = 4; // 箭头与数字之间的间距
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // 根据关系数量估算tooltip高度
            const relations = getEntityRelations(entity.id);
            // 更精确的高度估算：
            // - padding: 12px * 2 = 24px
            // - 每个关系行: 约40px（包括间距）
            // - 总高度 = padding + 关系行高度
            const estimatedTooltipHeight = Math.min(
                24 + relations.length * 40, // 更精确的高度估算
                viewportHeight * 0.6, // 最多占视口60%
                500, // 最大500px
            );

            // 计算数字的中心点位置
            const badgeCenterX = rect.left + rect.width / 2;
            const badgeCenterY = rect.top + rect.height / 2;

            // 默认显示在数字上方
            let top = rect.top - gap - arrowSize;
            let left = badgeCenterX;
            let showBelow = false;

            // 检查上方和下方的可用空间
            // transform: translate(-50%, -100%) 会让tooltip向上偏移自身高度
            // 所以实际顶部位置 = top - estimatedTooltipHeight
            const spaceAbove = top - estimatedTooltipHeight;
            const spaceBelow = viewportHeight - rect.bottom;

            // 计算上方和下方实际可用的空间（不考虑transform）
            const actualSpaceAbove = rect.top;
            const actualSpaceBelow = viewportHeight - rect.bottom;

            console.log('🎯 Tooltip position calculation:', {
                badge: {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    centerX: badgeCenterX,
                    centerY: badgeCenterY,
                },
                viewport: { width: viewportWidth, height: viewportHeight },
                tooltip: { estimatedHeight: estimatedTooltipHeight, width: tooltipWidth, relationCount: relations.length },
                space: {
                    above: spaceAbove,
                    below: spaceBelow,
                    actualAbove: actualSpaceAbove,
                    actualBelow: actualSpaceBelow,
                },
            });

            // 智能选择显示位置：
            // 1. 优先显示在上方（避免遮挡文本内容和关系连线）
            // 2. 如果上方空间不足，但下方空间充足，显示在下方
            // 3. 如果两边都不足，选择空间更大的一侧

            let decision = '';
            const minBuffer = 20; // 最小缓冲区，减小到20px使判断更宽松

            if (actualSpaceAbove >= estimatedTooltipHeight + minBuffer) {
                // 上方空间充足，优先显示在上方
                showBelow = false;
                top = rect.top - gap - arrowSize;
                decision = 'ABOVE (enough space above, preferred)';
            } else if (actualSpaceBelow >= estimatedTooltipHeight + minBuffer) {
                // 上方空间不足，但下方空间充足，显示在下方
                showBelow = true;
                top = rect.bottom + gap + arrowSize;
                decision = 'BELOW (not enough space above)';
            } else {
                // 两边都不够，选择空间更大的一侧
                if (actualSpaceBelow > actualSpaceAbove) {
                    showBelow = true;
                    top = rect.bottom + gap + arrowSize;
                    decision = 'BELOW (more space below, will scroll)';
                } else {
                    showBelow = false;
                    top = rect.top - gap - arrowSize;
                    decision = 'ABOVE (more space above, will scroll)';
                }
            }

            console.log('✅ Decision:', decision, {
                estimatedTooltipHeight,
                minBuffer,
                requiredSpace: estimatedTooltipHeight + minBuffer,
                actualSpaceAbove,
                actualSpaceBelow,
            });

            // 检查是否会超出右边界
            if (left + tooltipWidth / 2 > viewportWidth - 10) {
                left = viewportWidth - tooltipWidth / 2 - 10;
                console.log('⚠️ Adjusted left for right boundary:', left);
            }

            // 检查是否会超出左边界
            if (left - tooltipWidth / 2 < 10) {
                left = tooltipWidth / 2 + 10;
                console.log('⚠️ Adjusted left for left boundary:', left);
            }

            console.log('📍 Final position:', { top, left, showBelow });
            setConnectionTooltipPosition({ top, left, showBelow });
        }
    }, [showingConnectionTooltip, entity.id, getEntityRelations]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (tooltipTimerRef.current) {
                clearTimeout(tooltipTimerRef.current);
            }
        };
    }, []);

    // 计算删除按钮位置 - 当悬浮到实体时计算
    useEffect(() => {
        if (hoveredEntity === entity.id && entityRef.current) {
            const textNode = entityRef.current.firstChild;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                const range = document.createRange();
                const text = textNode.textContent || '';

                // 获取整个文本的边界框
                range.selectNodeContents(textNode);
                const fullTextRect = range.getBoundingClientRect();

                // 检查是否跨行（高度超过一行的高度通常表示跨行）
                const lineHeight = 20; // 估算单行高度
                const isMultiLine = fullTextRect.height > lineHeight * 1.5;

                if (isMultiLine) {
                    console.log(`🎯 删除按钮位置计算：检测到跨行实体 ${entity.id}，高度=${fullTextRect.height}，宽度=${fullTextRect.width}`);

                    try {
                        // 对于跨行文本，我们需要找到第一行的结束位置，而不是整个文本的最后字符
                        // 因为删除按钮应该显示在第一行的右上角

                        const containerRect = entityRef.current.getBoundingClientRect();
                        console.log('容器边界框:', containerRect);

                        // 对于跨行文本，删除按钮放在容器的右上角

                        // 对于跨行文本，删除按钮应该放在容器的右上角
                        // 而不是跟随最后一个字符的位置
                        const buttonTop = -8; // 相对于容器顶部的偏移
                        const buttonRight = -8; // 相对于容器右边的偏移

                        console.log('跨行文本使用容器右上角位置:', {
                            buttonTop,
                            buttonRight,
                            containerRect: {
                                top: containerRect.top,
                                right: containerRect.right,
                                width: containerRect.width,
                                height: containerRect.height,
                            },
                        });

                        setDeleteButtonPosition({
                            top: buttonTop,
                            right: buttonRight,
                        });

                        console.log('跨行删除按钮最终位置:', {
                            entityId: entity.id,
                            text: text.substring(Math.max(0, text.length - 3)), // 显示最后3个字符
                            strategy: '使用容器右上角',
                            containerRect: {
                                top: containerRect.top,
                                right: containerRect.right,
                                width: containerRect.width,
                                height: containerRect.height,
                            },
                            finalPosition: {
                                top: buttonTop,
                                right: buttonRight,
                            },
                        });
                    } catch (error) {
                        console.error('删除按钮位置计算出错:', error);
                        // 出错时使用默认位置
                        setDeleteButtonPosition({ top: -8, right: -8 });
                    }
                } else {
                    // 单行文本，使用默认位置（右上角）
                    setDeleteButtonPosition({ top: -8, right: -8 });
                    console.log(`单行实体 ${entity.id} 使用默认删除按钮位置`);
                }
            } else {
                // 没有文本节点，使用默认位置
                setDeleteButtonPosition({ top: -8, right: -8 });
            }
        }
    }, [hoveredEntity, entity.id]); // 当悬浮状态变化时重新计算位置

    // 渲染实体内容
    const renderEntityContent = (): React.ReactElement => (
        <>
            {entity.text}
            <span className={entityStyles.entityLabel}>
        (
                {entity.labelName}
)
            </span>

            {/* 删除按钮 - 显示在实体右上角，支持跨行定位 */}
            {hoveredEntity === entity.id && !connecting && (
                <Tooltip
                    title={<div style={{ color: '#000' }}>删除标签后，所有关系也会删除</div>}
                    placement='top'
                    color='#fff'
                >
                    <button
                        type='button'
                        className={entityStyles.deleteEntity}
                        style={{
                            top: `${deleteButtonPosition.top}px`,
                            right: `${deleteButtonPosition.right}px`,
                        }}
                        onClick={handleDeleteClick}
                        onMouseEnter={() => setIsDeleteButtonHovered(true)}
                        onMouseLeave={() => setIsDeleteButtonHovered(false)}
                    >
            ×
                    </button>
                </Tooltip>
            )}

            {/* 使用Portal渲染tooltip到body，避免被其他元素遮挡 */}
            {hoveredEntity === entity.id && !showingConnectionTooltip && !connecting && !isDeleteButtonHovered &&
        createPortal(
            <div
                style={{
                    position: 'fixed',
                    top: `${tooltipPosition.top}px`,
                    left: `${tooltipPosition.left + 7}px`,
                    transform: 'translateX(-50%)',
                    zIndex: 99999999,
                    background: '#ffffff',
                    color: '#333333',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: '500',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                }}
            >
            点击可连接关系
            </div>,
            document.body,
        )}
        </>
    );

    // 渲染连接数量显示
    const renderConnectionCount = (): React.ReactElement | null => {
        if (connectionCount === 0) return null;

        // 连线模式下禁用所有tooltip和鼠标事件
        if (connecting) {
            return (
                <span
                    className={`${entityStyles.connectionCount} ${entityStyles.connectionCountDisabled}`}
                >
                    {connectionCount}
                </span>
            );
        }

        // 创建关系详情内容
        const relationDetailsContent = (
            <div className={entityStyles.relationDetails}>
                {getEntityRelations(entity.id).map((relation) => (
                    <div
                        key={relation.id}
                        className={entityStyles.relationDetail}
                        onMouseEnter={() => {
                            onRelationMouseEnter(relation.id);
                            setHoveredRelationRow(relation.id);
                        }}
                        onMouseLeave={() => {
                            onRelationMouseLeave();
                            setHoveredRelationRow(null);
                        }}
                        onMouseUp={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                            }
                        }}
                        role='button'
                        tabIndex={0}
                    >
                        <div className={entityStyles.relationTriple}>
                            <ConditionalTooltip title={relation.fromEntity?.text || ''}>
                                <span
                                    className={entityStyles.fromEntity}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.stopPropagation();
                                        }
                                    }}
                                    role='button'
                                    tabIndex={0}
                                >
                                    {relation.fromEntity?.text}
                                </span>
                            </ConditionalTooltip>
                            <div className={entityStyles.relationArrowContainer}>
                                <ConditionalTooltip title={relation.relationLabel?.name || ''}>
                                    <span
                                        className={entityStyles.relationName}
                                        onMouseUp={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.stopPropagation();
                                            }
                                        }}
                                        role='button'
                                        tabIndex={0}
                                    >
                                        {relation.relationLabel?.name}
                                    </span>
                                </ConditionalTooltip>
                                <svg
                                    className={entityStyles.relationArrow}
                                    width='60'
                                    height='8'
                                    viewBox='0 0 60 8'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        d='M60 7.06865H0V5.06865H49.6973V0.931396L60 7.06865Z'
                                        fill='#438DFB'
                                    />
                                </svg>
                            </div>
                            <ConditionalTooltip title={relation.toEntity?.text || ''}>
                                <span
                                    className={entityStyles.toEntity}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.stopPropagation();
                                        }
                                    }}
                                    role='button'
                                    tabIndex={0}
                                >
                                    {relation.toEntity?.text}
                                </span>
                            </ConditionalTooltip>
                        </div>
                        <div className={entityStyles.deleteRelationContainer}>
                            <Tooltip overlayStyle={{ zIndex: 9999999999 }} title='删除关系' color='#fff' style={{ color: '#000' }}>
                                <div
                                    className={`${entityStyles.deleteRelation} ${hoveredRelationRow === relation.id ? entityStyles.visible : ''}`}
                                    role='button'
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteRelation(relation.id);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onDeleteRelation(relation.id);
                                        }
                                    }}
                                    onMouseEnter={() => setHoveredDeleteIcon(relation.id)}
                                    onMouseLeave={() => setHoveredDeleteIcon(null)}
                                >
                                    {hoveredDeleteIcon === relation.id ? (
                                        <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                            <path fillRule='evenodd' clipRule='evenodd' d='M11.3346 3.00008V1.66675L4.66797 1.66675V3.00008L1.66797 3.00008V4.33342H2.83464L2.83464 13.3334C2.83464 13.8857 3.28235 14.3334 3.83464 14.3334L12.168 14.3334C12.7203 14.3334 13.168 13.8857 13.168 13.3334V4.33342L14.3346 4.33342V3.00008L11.3346 3.00008ZM4.16797 13.0001L4.16797 4.33342L11.8346 4.33342V13.0001L4.16797 13.0001ZM6.0013 6.00008V11.0001H7.33464V6.00008H6.0013ZM8.66797 6.00008V11.0001H10.0013V6.00008H8.66797Z' fill='#007DFA' />
                                        </svg>
                                    ) : (
                                        <svg
                                            width='16'
                                            height='16'
                                            viewBox='0 0 16 16'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path fillRule='evenodd' clipRule='evenodd' d='M11.3346 3.00008V1.66675L4.66797 1.66675V3.00008L1.66797 3.00008V4.33342H2.83464L2.83464 13.3334C2.83464 13.8857 3.28235 14.3334 3.83464 14.3334L12.168 14.3334C12.7203 14.3334 13.168 13.8857 13.168 13.3334V4.33342L14.3346 4.33342V3.00008L11.3346 3.00008ZM4.16797 13.0001L4.16797 4.33342L11.8346 4.33342V13.0001L4.16797 13.0001ZM6.0013 6.00008V11.0001H7.33464V6.00008H6.0013ZM8.66797 6.00008V11.0001H10.0013V6.00008H8.66797Z' fill='#0F172A' />
                                        </svg>
                                    )}
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                ))}
            </div>
        );

        const handleMouseEnterTooltip = (): void => {
            // 清除可能存在的离开定时器
            if (tooltipTimerRef.current) {
                clearTimeout(tooltipTimerRef.current);
                tooltipTimerRef.current = null;
            }
            onConnectionTooltipEnter(entity.id);
        };

        const handleMouseLeaveTooltip = (): void => {
            // 延迟隐藏，给用户时间移动到tooltip上
            tooltipTimerRef.current = setTimeout(() => {
                onConnectionTooltipLeave();
            }, 200);
        };

        return (
            <>
                <span
                    ref={connectionCountRef}
                    className={entityStyles.connectionCount}
                    onMouseEnter={handleMouseEnterTooltip}
                    onMouseLeave={handleMouseLeaveTooltip}
                >
                    {connectionCount}
                </span>
                {/* 使用Portal渲染自定义tooltip，避免Firefox兼容性问题 */}
                {showingConnectionTooltip === entity.id &&
                    createPortal(
                        <div
                            style={{
                                position: 'fixed',
                                top: `${connectionTooltipPosition.top}px`,
                                left: `${connectionTooltipPosition.left}px`,
                                // 如果显示在下方，向下偏移；否则向上偏移
                                transform: connectionTooltipPosition.showBelow
                                    ? 'translate(-50%, 0%)'
                                    : 'translate(-50%, -100%)',
                                zIndex: Number.MAX_SAFE_INTEGER,
                            }}
                            onMouseEnter={handleMouseEnterTooltip}
                            onMouseLeave={handleMouseLeaveTooltip}
                        >
                            {/* 箭头 - 根据显示位置调整 */}
                            {connectionTooltipPosition.showBelow ? (
                                // 显示在下方时，箭头朝上（在tooltip上方）
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '10px solid transparent',
                                        borderRight: '10px solid transparent',
                                        borderBottom: '10px solid #ffffff',
                                        filter: 'drop-shadow(0 -3px 3px rgba(0, 0, 0, 0.1))',
                                        zIndex: 1,
                                    }}
                                />
                            ) : (
                                // 显示在上方时，箭头朝下（在tooltip下方）
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '-10px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '10px solid transparent',
                                        borderRight: '10px solid transparent',
                                        borderTop: '10px solid #ffffff',
                                        filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.1))',
                                        zIndex: 1,
                                    }}
                                />
                            )}
                            {/* Tooltip内容容器 */}
                            <div
                                style={{
                                    position: 'relative',
                                    background: '#ffffff',
                                    borderRadius: '8px',
                                    boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
                                    maxWidth: '400px',
                                    maxHeight: `${Math.min(window.innerHeight * 0.6, 500)}px`,
                                    overflowY: 'auto',
                                    padding: '12px 16px',
                                }}
                            >
                                {relationDetailsContent}
                            </div>
                        </div>,
                        document.body,
                    )}
            </>
        );
    };

    return (
        <span className={entityStyles.entityWrapper}>
            {(cannotConnect && connecting && connectingFromId && connectingFromId !== entity.id) ? (
                <span style={{ position: 'relative' }}>
                    <span
                        ref={entityRef}
                        data-entity-id={entity.id}
                        data-start={entity.start}
                        data-end={entity.end}
                        className={entityClasses}
                        style={entityStyle}
                        onClick={handleClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleClick(e as any);
                            }
                        }}
                        role='button'
                        tabIndex={0}
                    >
                        {renderEntityContent()}
                    </span>
                    {/* 使用Portal渲染警告提示框到body，避免被其他元素遮挡 */}
                    {hoveredEntity === entity.id && cannotConnect &&
            createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: `${warningTooltipPosition.top + 16}px`,
                        left: `${warningTooltipPosition.left}px`,
                        transform: 'translateX(-50%)', // 精确居中
                        backgroundColor: '#fff',
                        color: '#000',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        zIndex: 99999999, // 比关系选择菜单(9999999)和右侧面板更高
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        maxWidth: '300px',
                        pointerEvents: 'none', // 不阻挡鼠标事件
                    }}
                >
                    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path fillRule='evenodd' clipRule='evenodd' d='M0.333984 6.99998C0.333984 3.31808 3.31875 0.333313 7.00065 0.333313C10.6826 0.333313 13.6673 3.31808 13.6673 6.99998C13.6673 10.6819 10.6826 13.6666 7.00065 13.6666C3.31875 13.6666 0.333984 10.6819 0.333984 6.99998ZM6.33398 8.99998V10.3333H7.66732V8.99998H6.33398ZM7.66732 8.33331L7.66732 3.66665H6.33399L6.33398 8.33331H7.66732Z' fill='#F97316' />
                    </svg>
                    <span>此标签无可添加的关系，请核对标签类型</span>
                </div>,
                document.body,
            )}
                </span>
            ) : (
                <span
                    ref={entityRef}
                    data-entity-id={entity.id}
                    data-start={entity.start}
                    data-end={entity.end}
                    className={entityClasses}
                    style={entityStyle}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleClick(e as any);
                        }
                    }}
                    role='button'
                    tabIndex={0}
                >
                    {renderEntityContent()}
                </span>
            )}
            {renderConnectionCount()}
        </span>
    );
}

export default EntityAnnotationItem;
