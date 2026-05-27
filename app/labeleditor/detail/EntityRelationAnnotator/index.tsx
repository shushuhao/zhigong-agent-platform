'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'antd';
import { useEntityRelationStore } from './store';
import { useDataContext } from '../contexts/DataContext';
import TutorialModal from './components/TutorialModal';
import RelationConnector from './components/RelationConnector';
import styles from './index.module.css';
import EntityLabel from './components/EntityLabel';
import RelationLabel from './components/RelationLabel';
import RelationSelect from './components/RelationSelect';
import EntitySelect from './components/EntitySelect';
import TextRenderer from './components/TextRenderer';
import { useKeyboardShortcuts } from './hooks/keyboard';

function EntityRelationAnnotator(): React.ReactElement | null {
    // 从 Context 获取数据和方法
    const { data: contextData, saveData: contextSaveData } = useDataContext();

    // 本地状态 - 移除selectedText和selectionRange，改用store状态
    const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
    const [showingConnectionTooltip, setShowingConnectionTooltip] = useState<string | null>(null);
    const [tooltipHideTimer, setTooltipHideTimer] = useState<NodeJS.Timeout | null>(null);
    const [forceUpdateKey, setForceUpdateKey] = useState(0);
    const [relationHoverDisabled, setRelationHoverDisabled] = useState(false);
    const textContainerRef = useRef<HTMLDivElement>(null);

    // 使用 Zustand store
    const {
        data,
        selectedText,
        selectionRange,
        selectedRelationLabelId,
        connecting,
        connectingFromId,
        error,

        showEntityDropdown,
        dropdownPosition,
        showRelationMenu,
        relationMenuPosition,
        pendingConnection,
        hoveredRelationId,
        showTutorial,
        // Actions
        initializeWithData,
        initializeWithApiData,
        handleTextSelection: storeHandleTextSelection,
        addEntityAnnotation,
        deleteEntity,
        startConnection,
        completeConnection,
        cancelConnection,
        deleteRelation,

        showEntitySelectionDropdown,
        hideEntitySelectionDropdown,
        hideRelationMenu,
        setHoveredRelation,
        showTutorialModal,
        hideTutorialModal,
        setSaveDataFunction,
    } = useEntityRelationStore();

    // 启用键盘快捷键
    useKeyboardShortcuts({
        enableAutoSave: true,
        enableEscapeCancel: true,
    });

    // 从 Context 数据初始化 store
    useEffect(() => {
        if (contextData && contextData.type === 'entity-relation') {
            console.log('EntityRelationAnnotator: Initializing with context data');
            console.log('EntityRelationAnnotator: Context data:', contextData);
            console.log('EntityRelationAnnotator: Entity labels:', (contextData as any).entityLabels);
            console.log('EntityRelationAnnotator: Relation labels:', (contextData as any).relationLabels);
            console.log('EntityRelationAnnotator: Entities:', (contextData as any).entities);
            console.log('EntityRelationAnnotator: Relations:', (contextData as any).relations);
            console.log('EntityRelationAnnotator: Original labels data:', (contextData as any).labels);

            // 特别检查实体数据
            if ((contextData as any).entities && (contextData as any).entities.length > 0) {
                console.log('✅ EntityRelationAnnotator: 发现实体数据，数量:', (contextData as any).entities.length);
                (contextData as any).entities.forEach((entity: any, index: number) => {
                    console.log(`  实体 ${index + 1}:`, entity);
                });
            } else {
                console.log('❌ EntityRelationAnnotator: 没有发现实体数据');
            }

            // 转换 Context 数据为 EntityRelationStore 需要的格式
            const storeData = {
                ...contextData,
                content: contextData.content || '', // 确保 content 不为 undefined
                dynamicForm: [], // EntityRelationStore 需要这个字段，但实体关系标注不使用
                // 确保必需的字段存在，如果 contextData 中没有这些字段
                entityLabels: (contextData as any).entityLabels || [],
                relationLabels: (contextData as any).relationLabels || [],
                progress: (contextData as any).progress || {
                    totalCharacters: 0,
                    annotatedCharacters: 0,
                    percentage: 0,
                },
                // 转换 entities 格式：从 contextData 格式转换为 EntityAnnotation 格式
                entities: ((contextData as any).entities || []).map((entity: any) => ({
                    id: entity.id,
                    start: entity.start,
                    end: entity.end,
                    text: entity.text,
                    labelId: entity.label || entity.labelId || '', // 使用 label 字段作为 labelId
                    labelName: entity.labelName || entity.label || '', // 如果没有 labelName，使用 label
                    color: entity.color || '#1890ff', // 默认颜色
                    visible: entity.visible !== undefined ? entity.visible : true,
                    highlighted: entity.highlighted || false,
                })),
                // 转换 relations 格式：从 contextData 格式转换为 RelationConnection 格式
                relations: ((contextData as any).relations || []).map((relation: any) => ({
                    id: relation.id,
                    fromEntityId: relation.fromEntity || relation.fromEntityId,
                    toEntityId: relation.toEntity || relation.toEntityId,
                    relationId: relation.label || relation.relationId || '',
                    relationName: relation.relationName || relation.label || '',
                    visible: relation.visible !== undefined ? relation.visible : true,
                })),
            };
            console.log('EntityRelationAnnotator: Store data to initialize:', storeData);

            // 检查是否有原始的 API 标签数据
            const apiLabelsData = (contextData as any).labels;
            if (apiLabelsData && apiLabelsData.data) {
                console.log('EntityRelationAnnotator: Using API data initialization');
                initializeWithApiData(storeData, apiLabelsData);
            } else {
                console.log('EntityRelationAnnotator: Using standard initialization');
                initializeWithData(storeData);
            }
        }
    }, [contextData, initializeWithData, initializeWithApiData]);

    console.log('demo');
    // 设置 saveData 函数
    useEffect(() => {
        if (contextSaveData) {
            console.log('EntityRelationAnnotator: Setting saveData function');
            setSaveDataFunction(contextSaveData);
        }
    }, [contextSaveData, setSaveDataFunction]);

    // 首次访问时显示使用教程
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('entity-relation-tutorial-seen');
        if (!hasSeenTutorial) {
            showTutorialModal();
        }
    }, [showTutorialModal]);

    // 关闭教程Modal
    const handleCloseTutorial = (): void => {
        hideTutorialModal();
        localStorage.setItem('entity-relation-tutorial-seen', 'true');
    };

    // 清理定时器
    useEffect(() => () => {
        if (tooltipHideTimer) {
            clearTimeout(tooltipHideTimer);
        }
    }, [tooltipHideTimer]);

    // 监听实体数据变化，强制重新渲染
    useEffect(() => {
        setForceUpdateKey((prev) => prev + 1);
    }, [data?.entities]);

    // 监听关系数据变化，强制重新渲染（确保连线后位置正确）
    useEffect(() => {
        console.log('关系数据变化，当前数量:', data?.relations.length);
        setForceUpdateKey((prev) => prev + 1);

        // 连线完成后，清除tooltip状态，避免自动显示
        setShowingConnectionTooltip(null);
        if (tooltipHideTimer) {
            clearTimeout(tooltipHideTimer);
            setTooltipHideTimer(null);
        }

        // 延迟再次强制更新，确保DOM完全渲染后位置计算正确
        setTimeout(() => {
            setForceUpdateKey((prev) => prev + 1);
        }, 200);
    }, [data?.relations]);

    // 自动保存由 Header 组件统一处理，这里不需要重复的定时器
    // useEffect(() => {
    //     if (!data) return undefined;

    //     const interval = setInterval(() => {
    //         useEntityRelationStore.getState().autoSave();
    //     }, 30000); // 每30秒自动保存

    //     return () => clearInterval(interval);
    // }, [data]);

    // 移除重复的点击外部区域逻辑，由EntitySelect组件处理

    // 处理文本选择
    const handleTextSelection = (): void => {
        const selection = window.getSelection();
        console.log('selection', selection);
        if (!selection || selection.rangeCount === 0) {
            // 如果没有选择，清理状态
            storeHandleTextSelection('', null);
            hideEntitySelectionDropdown();
            return;
        }

        const range = selection.getRangeAt(0);
        console.log('range', range);
        const currentSelectedText = selection.toString().trim();
        console.log('当前选中文本:', currentSelectedText);
        if (currentSelectedText.length === 0) {
            storeHandleTextSelection('', null);
            hideEntitySelectionDropdown();
            return;
        }

        // **改进范围计算**
        const container = textContainerRef.current;
        if (!container || !data?.content) {
            console.error('缺少容器或内容');
            return;
        }

        // 使用原始文本内容计算位置，而不是渲染后的textContent
        const originalContent = data.content;
        const selectionText = selection.toString();

        console.log('原始文本内容:', originalContent);
        console.log('选中的文本:', selectionText);

        // 在原始文本内容中查找选中文本的位置
        let start = originalContent.indexOf(selectionText);
        if (start === -1) {
            console.error('无法在原始文本中找到选中内容');
            return;
        }

        // 如果有多个相同的文本，需要确定用户实际选择的是哪一个
        const allMatches: number[] = [];
        let index = originalContent.indexOf(selectionText);
        while (index !== -1) {
            allMatches.push(index);
            index = originalContent.indexOf(selectionText, index + 1);
        }
        console.log('index', index, allMatches);

        if (allMatches.length > 1) {
            console.log('发现多个匹配:', allMatches);
            // 使用更精确的方法：直接分析Range的位置
            try {
                const { startContainer, endContainer } = range;
                const { startOffset, endOffset } = range;
                console.log('Range信息:', {
                    startContainer,
                    startOffset,
                    endContainer,
                    endOffset,
                    selectedText: selectionText
                });

                // 获取已排序的可见实体列表
                const sortedEntities = data.entities
                    ? [...data.entities]
                        .filter((entity) => entity.visible)
                        .sort((a, b) => a.start - b.start)
                    : [];

                // 新方法：使用DOM元素的data属性直接获取位置
                const calculateOriginalPosition = (targetContainer: Node, targetOffset: number): number => {
                    // 方法1：检查父元素是否有位置信息
                    let currentElement = targetContainer.parentElement;

                    // 向上查找，直到找到带有位置信息的元素
                    while (currentElement && currentElement !== container) {
                        // 检查是否是实体节点
                        const entityId = currentElement.getAttribute('data-entity-id');
                        if (entityId) {
                            const entity = sortedEntities.find((e) => e.id === entityId);
                            if (entity) {
                                console.log('✅ 直接从实体节点获取位置:', {
                                    entityId,
                                    entityStart: entity.start,
                                    offset: targetOffset,
                                    计算位置: entity.start + targetOffset
                                });
                                return entity.start + targetOffset;
                            }
                        }

                        // 检查是否是普通文本段
                        const textSegment = currentElement.getAttribute('data-text-segment');
                        const dataStart = currentElement.getAttribute('data-start');
                        if (textSegment === 'normal' && dataStart !== null) {
                            const segmentStart = parseInt(dataStart, 10);
                            console.log('✅ 直接从文本段获取位置:', {
                                segmentStart,
                                offset: targetOffset,
                                计算位置: segmentStart + targetOffset
                            });
                            return segmentStart + targetOffset;
                        }

                        currentElement = currentElement.parentElement;
                    }

                    // 方法2：如果没有找到位置信息，使用遍历方法（降级方案）
                    console.warn('⚠️ 未找到直接位置信息，使用遍历方法');
                    let position = 0;
                    const walker = document.createTreeWalker(
                        container,
                        NodeFilter.SHOW_TEXT,
                        null,
                    );

                    let currentNode = walker.nextNode();

                    while (currentNode) {
                        if (currentNode === targetContainer) {
                            position += targetOffset;
                            break;
                        }

                        // 检查节点的父元素
                        const nodeParent = (currentNode.parentNode as HTMLElement);

                        // 检查是否是实体节点
                        const nodeEntityId = nodeParent?.getAttribute?.('data-entity-id');
                        if (nodeEntityId) {
                            const entity = sortedEntities.find((e) => e.id === nodeEntityId);
                            if (entity) {
                                position += (entity.end - entity.start);
                            } else {
                                position += currentNode.textContent?.length || 0;
                            }
                        } else {
                            // 检查是否有位置信息
                            const segmentStart = nodeParent?.getAttribute?.('data-start');
                            const segmentEnd = nodeParent?.getAttribute?.('data-end');

                            if (segmentStart !== null && segmentEnd !== null) {
                                // 使用段落的实际长度
                                const segmentLength = parseInt(segmentEnd, 10) - parseInt(segmentStart, 10);
                                position += segmentLength;
                            } else {
                                // 使用DOM文本长度
                                position += currentNode.textContent?.length || 0;
                            }
                        }

                        currentNode = walker.nextNode();
                    }

                    return position;
                };

                const calculatedStart = calculateOriginalPosition(startContainer, startOffset);
                console.log('计算出的起始位置:', calculatedStart);
                console.log('所有可能的匹配位置:', allMatches);

                // 找到最接近的匹配
                let bestMatch = allMatches[0];
                let minDistance = Math.abs(calculatedStart - bestMatch);

                for (const match of allMatches) {
                    const distance = Math.abs(calculatedStart - match);
                    console.log(`匹配位置 ${match} 与计算位置 ${calculatedStart} 的距离: ${distance}`);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestMatch = match;
                    }
                }

                start = bestMatch;
                console.log('✅ 选择最佳匹配:', {
                    计算位置: calculatedStart,
                    最佳匹配: bestMatch,
                    距离: minDistance,
                    匹配文本: originalContent.substring(bestMatch, bestMatch + selectionText.length)
                });
            } catch (positionError) {
                console.warn('精确位置计算失败，使用第一个匹配:', positionError);
                const [firstMatch] = allMatches;
                start = firstMatch;
            }
        }

        const end = start + selectionText.length;

        console.log('计算的文本范围:', {
            start,
            end,
            selectedText: selectionText,
            extractedText: originalContent.slice(start, end),
            match: originalContent.slice(start, end) === selectionText,
        });

        // 验证范围是否正确
        if (originalContent.slice(start, end) !== selectionText) {
            console.error('范围计算错误');
            return;
        }

        const calculatedRange = { start, end };

        // 使用store方法更新选择状态
        storeHandleTextSelection(selectionText, calculatedRange);

        // 显示实体选择下拉框
        const rect = range.getBoundingClientRect();
        showEntitySelectionDropdown({
            x: rect.left, // 使用文本左侧位置
            y: rect.bottom + 10,
        });

        console.log('文本选择完成:', { selectedText: selectionText, range: calculatedRange });
    };

    // 处理实体标签选择 - 使用store的addEntityAnnotation方法
    const handleEntityLabelSelect = async (labelId: string): Promise<void> => {
        console.log('=== 开始实体标注流程 ===');
        console.log('当前状态:', { labelId, selectedText, selectionRange });

        try {
            // 直接调用store的addEntityAnnotation方法
            addEntityAnnotation(labelId);

            // 延迟检查状态，确保状态更新完成
            setTimeout(() => {
                const currentState = useEntityRelationStore.getState();
                console.log('延迟检查状态:', {
                    showEntityDropdown: currentState.showEntityDropdown,
                    dropdownPosition: currentState.dropdownPosition,
                    entitiesCount: currentState.data?.entities.length,
                });

                // 如果状态没有正确清理，强制清理
                if (currentState.showEntityDropdown) {
                    console.log('强制隐藏下拉框');
                    hideEntitySelectionDropdown();
                }
            }, 100);

            // 强制重新渲染以确保UI更新
            setForceUpdateKey((prev) => prev + 1);

            console.log('实体标注成功');
        } catch (annotationError) {
            console.error('实体标注失败:', annotationError);
            // 即使出错也要隐藏下拉框
            hideEntitySelectionDropdown();
        } finally {
            // 清除文本选择
            window.getSelection()?.removeAllRanges();
        }

        console.log('=== 实体标注流程完成 ===');
    };

    // 如果没有 Context 数据，返回 null（让主入口处理加载状态）
    if (!contextData || contextData.type !== 'entity-relation') {
        return null;
    }

    // 如果 store 中没有数据，也返回 null（等待初始化完成）
    if (!data) {
        return null;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <div>
错误:
                    {error}
                </div>
                <Button onClick={() => window.location.reload()}>重新加载</Button>
            </div>
        );
    }

    // 计算实体的连接数量
    const getEntityConnectionCount = (entityId: string): number => {
        if (!data) return 0;
        return data.relations.filter((relation) => relation.visible && (relation.fromEntityId === entityId || relation.toEntityId === entityId),
        ).length;
    };

    // 获取实体相关的关系（包含完整的实体和关系标签信息）
    const getEntityRelations = (entityId: string): any[] => {
        if (!data) return [];
        return data.relations
            .filter((relation) => relation.visible && (relation.fromEntityId === entityId || relation.toEntityId === entityId),
            )
            .map((relation) => ({
                ...relation,
                fromEntity: data.entities.find((e) => e.id === relation.fromEntityId),
                toEntity: data.entities.find((e) => e.id === relation.toEntityId),
                relationLabel: data.relationLabels.find((r) => r.id === relation.relationId),
            }));
    };

    // 删除关系
    const handleDeleteRelation = (relationId: string): void => {
    // 清除悬浮状态，防止删除后下一个关系的连线立即显示
        setHoveredRelation(null);

        // 临时禁用关系悬浮事件，防止DOM重新渲染后立即触发新的悬浮
        setRelationHoverDisabled(true);

        deleteRelation(relationId);

        // 300ms后重新启用关系悬浮事件
        setTimeout(() => {
            setRelationHoverDisabled(false);
        }, 300);
    };

    // 处理实体鼠标悬浮事件
    const handleEntityMouseEnter = (entityId: string): void => {
        console.log('🔍 实体鼠标悬浮:', {
            entityId,
            connecting,
            connectingFromId,
            entityText: data?.entities.find((e: any) => e.id === entityId)?.text,
        });
        setHoveredEntity(entityId);
    };

    const handleEntityMouseLeave = (): void => {
        console.log('🔍 实体鼠标离开');
        setHoveredEntity(null);
    };

    // 处理连接数量tooltip的显示和隐藏
    const handleConnectionTooltipEnter = (entityId: string): void => {
        console.log('连接数量tooltip悬浮:', entityId);
        if (connecting) return; // 连接模式下不显示

        if (tooltipHideTimer) {
            clearTimeout(tooltipHideTimer);
            setTooltipHideTimer(null);
        }
        setShowingConnectionTooltip(entityId);
    };

    const handleConnectionTooltipLeave = (): void => {
        console.log('连接数量tooltip离开');
        const timer = setTimeout(() => {
            setShowingConnectionTooltip(null);
        }, 200); // 200ms延迟隐藏
        setTooltipHideTimer(timer);
    };

    // 处理关系鼠标事件
    const handleRelationMouseEnter = (relationId: string): void => {
        console.log('🔗 关系鼠标悬浮事件触发:', { relationId, relationHoverDisabled });
        // 如果关系悬浮被禁用，则不处理悬浮事件
        if (relationHoverDisabled) return;
        console.log('🔗 设置悬浮关系:', relationId);
        setHoveredRelation(relationId);
    };

    const handleRelationMouseLeave = (): void => {
    // 如果关系悬浮被禁用，则不处理离开事件
        if (relationHoverDisabled) return;
        setHoveredRelation(null);
    };

    // 判断是否可以连接到目标实体
    const canConnectToEntity = (targetEntityId: string): boolean => {
        if (!connecting || !connectingFromId || !data) return false;
        if (connectingFromId === targetEntityId) return false; // 不能连接自己

        const fromEntity = data.entities.find((e) => e.id === connectingFromId);
        const toEntity = data.entities.find((e) => e.id === targetEntityId);

        if (!fromEntity || !toEntity) return false;

        // 检查是否有可用的关系标签适用于这两个实体类型 - 根据真实API数据结构验证
        const availableRelations = data.relationLabels.filter((relation) => {
            // 检查是否有明确的起始和目标实体标签定义
            if (relation.startEntityLabels && relation.targetEntityLabels) {
                // 严格验证：fromEntity必须在startEntityLabels中，toEntity必须在targetEntityLabels中
                return relation.startEntityLabels.includes(fromEntity.labelId) &&
               relation.targetEntityLabels.includes(toEntity.labelId);
            }
            // 兼容旧数据：使用entityLabelIds进行验证
            return relation.entityLabelIds.includes(fromEntity.labelId) &&
               relation.entityLabelIds.includes(toEntity.labelId);
        });

        return availableRelations.length > 0;
    };

    // 处理实体点击事件
    const handleEntityClick = (entityId: string): void => {
        if (connecting) {
            if (connectingFromId === entityId) {
                // 点击起始实体，取消连接
                cancelConnection();
            } else if (canConnectToEntity(entityId)) {
                // 点击可连接的目标实体，完成连接
                completeConnection(entityId);
            } else {
                // 点击不可连接的实体，显示提示
                console.log('无法连接到此实体');
            }
        } else {
            // 不在连接模式，开始连接
            startConnection(entityId);
        }
    };

    // 处理容器点击事件 - 点击空白区域取消连线
    const handleContainerClick = (e: React.MouseEvent): void => {
        console.log('🖱️ 容器点击事件触发:', {
            target: e.target,
            currentTarget: e.currentTarget,
            connecting,
            connectingFromId,
        });

        // 检查是否点击的是空白区域（不是实体、按钮等交互元素）
        const target = e.target as HTMLElement;

        // 详细检查每个条件
        const roleButtonElement = target.closest('[role="button"]');
        const isMainContainer = roleButtonElement === e.currentTarget; // 检查是否是主容器本身

        const checks = {
            entity: target.closest('[data-entity-id]'),
            button: target.closest('button'),
            dropdown: target.closest('.ant-dropdown'),
            tooltip: target.closest('.ant-tooltip'),
            roleButton: roleButtonElement && !isMainContainer, // 排除主容器本身
            svg: target.closest('svg'),
            relationMenu: target.closest('.relation-menu'),
            entityDropdown: target.closest('.entity-dropdown'),
        };

        console.log('🔍 详细检查点击目标:', {
            tagName: target.tagName,
            className: target.className,
            isMainContainer,
            checks,
        });

        // 如果点击的是实体、按钮、菜单等交互元素，不处理
        if (
            checks.entity || // 实体元素
            checks.button || // 按钮
            checks.dropdown || // 下拉菜单
            checks.tooltip || // 提示框
            checks.roleButton || // 其他按钮角色元素（排除主容器）
            checks.svg || // SVG元素（连线图形）
            checks.relationMenu || // 关系选择菜单
            checks.entityDropdown // 实体选择下拉框
        ) {
            console.log('🚫 点击了交互元素，不取消连线', {
                matchedChecks: Object.entries(checks).filter(([, value]) => value).map(([key]) => key),
            });
            return;
        }

        // 如果正在连线，点击空白区域取消连线
        if (connecting && connectingFromId) {
            console.log('✅ 点击空白区域，取消连线');
            cancelConnection();
        } else {
            console.log('❌ 不在连线状态，无需取消');
        }
    };

    console.log('data', data);

    return (
        <>
            {/* 主要内容区域 */}
            <div
                className={styles.mainContent}
                onClick={handleContainerClick}
                onKeyDown={(e) => {
                    // 支持键盘操作的可访问性
                    if (e.key === 'Escape' && connecting && connectingFromId) {
                        cancelConnection();
                    }
                }}
                role='button'
                tabIndex={0}
                aria-label='点击空白区域取消连线'
            >
                {/* 左侧：文本内容区域 */}
                <div className={styles.leftPanel}>
                    <div
                        className={styles.textCard}
                    >
                        <div
                            key={`text-content-${forceUpdateKey}`}
                            ref={textContainerRef}
                            className={styles.textContent}
                            onMouseUp={handleTextSelection}
                            style={{ position: 'relative' }}
                            role='textbox'
                            tabIndex={0}
                            aria-label='文本标注区域'
                        >
                            {data && (
                                <TextRenderer
                                    data={data}
                                    connecting={connecting}
                                    connectingFromId={connectingFromId}
                                    hoveredEntity={hoveredEntity}
                                    showingConnectionTooltip={showingConnectionTooltip}
                                    selectedRelationLabelId={selectedRelationLabelId}
                                    onMouseEnter={handleEntityMouseEnter}
                                    onMouseLeave={handleEntityMouseLeave}
                                    onEntityClick={handleEntityClick}
                                    onDeleteEntity={deleteEntity}
                                    onConnectionTooltipEnter={handleConnectionTooltipEnter}
                                    onConnectionTooltipLeave={handleConnectionTooltipLeave}
                                    onDeleteRelation={handleDeleteRelation}
                                    onRelationMouseEnter={handleRelationMouseEnter}
                                    onRelationMouseLeave={handleRelationMouseLeave}
                                    canConnectToEntity={canConnectToEntity}
                                    getEntityConnectionCount={getEntityConnectionCount}
                                    getEntityRelations={getEntityRelations}
                                />
                            )}

                            {/* 关系连接器 */}
                            <RelationConnector
                                entities={data.entities}
                                relations={data.relations}
                                containerRef={textContainerRef}
                                connecting={connecting}
                                connectingFromId={connectingFromId}
                                hoveredEntity={hoveredEntity}
                                hoveredRelation={hoveredRelationId}
                                onDeleteRelation={deleteRelation}
                                canConnectToEntity={canConnectToEntity}
                            />
                        </div>
                    </div>
                </div>

                {/* 右侧：实体和关系标签面板 */}
                <div className={styles.rightPanel}>
                    {/* 实体标签面板 */}
                    <EntityLabel />

                    {/* 关系标签面板 */}
                    <RelationLabel />
                </div>
            </div>

            {/* 实体选择下拉框 */}
            {showEntityDropdown && dropdownPosition && (
                <EntitySelect position={dropdownPosition} handleEntityLabelSelect={handleEntityLabelSelect} />
            )}

            {/* 关系选择菜单 */}
            {showRelationMenu && relationMenuPosition && pendingConnection && data && (
                <RelationSelect />
            )}

            {/* 点击其他地方关闭菜单 */}
            {showRelationMenu && (
                <div
                    className={styles.menuOverlay}
                    onClick={hideRelationMenu}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            hideRelationMenu();
                        }
                    }}
                    role='button'
                    tabIndex={0}
                    aria-label='关闭关系菜单'
                />
            )}

            {/* 使用教程Modal */}
            {/* <TutorialModal
                visible={showTutorial}
                onClose={handleCloseTutorial}
            /> */}
        </>
    );
}

export default EntityRelationAnnotator;
