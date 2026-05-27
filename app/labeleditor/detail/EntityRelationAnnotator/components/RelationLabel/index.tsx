import React, { useState, useRef, useEffect } from 'react';
import { Tooltip } from 'antd';
import styles from './index.module.css';
import collapseStyles from '../CustomCollapse/index.module.css';
import relationPanelStyles from '../RelationPanel.module.css';
import { useEntityRelationStore } from '../../store';
import CustomCollapse from '../CustomCollapse';
import ConditionalTooltip from '../../../components/ConditionalTooltip';

function RelationLabel(): React.ReactElement {
    const [hoveredRelationId, setHoveredRelationId] = useState<string | null>(null);
    const [hoveredDeleteIcon, setHoveredDeleteIcon] = useState<string | null>(null);
    const [showShadow, setShowShadow] = useState(false);
    const scrollableRef = useRef<HTMLDivElement>(null);

    const {
        data,
        deleteRelation,
        setHoveredRelation,
        relationPanelExpanded,
        toggleRelationPanelExpanded,
    } = useEntityRelationStore();

    // 将 relationPanelExpanded 对象转换为 Set
    const expandedKeys = new Set(
        Object.entries(relationPanelExpanded)
            .filter(([, isExpanded]) => isExpanded)
            .map(([labelId]) => labelId),
    );

    // 检查是否需要显示阴影
    const checkScrollShadow = () => {
        if (scrollableRef.current) {
            const { scrollHeight, clientHeight } = scrollableRef.current;
            // 只有当内容可以滚动且有展开的面板时才显示阴影
            const hasExpandedPanels = expandedKeys.size > 0;
            const canScroll = scrollHeight > clientHeight;
            setShowShadow(canScroll && hasExpandedPanels);
        }
    };

    // 监听内容变化和窗口大小变化
    useEffect(() => {
        checkScrollShadow();

        const handleResize = () => checkScrollShadow();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [data, expandedKeys]);

    // 监听滚动容器的内容变化
    useEffect(() => {
        if (scrollableRef.current) {
            const observer = new ResizeObserver(checkScrollShadow);
            observer.observe(scrollableRef.current);

            return () => observer.disconnect();
        }
    }, []);
    return (
        <div className={styles.labelCard}>
            <div className={`${styles.fixedTitle} ${showShadow ? styles.withShadow : ''}`}>关系标签</div>
            <div className={styles.scrollableContent} ref={scrollableRef}>
                <CustomCollapse
                    expandedKeys={expandedKeys}
                    onToggle={toggleRelationPanelExpanded}
                    items={(data?.relationLabels || []).map((label) => {
                        const relationsForLabel = data?.relations?.filter((relation) => relation.relationId === label.id) || [];
                        // 检查是否可以连接 - 根据真实API数据结构验证
                        const canConnect = (label.startEntityLabels && label.targetEntityLabels &&
                            label.startEntityLabels.length > 0 && label.targetEntityLabels.length > 0) ||
                            (label.entityLabelIds && label.entityLabelIds.length > 0);

                        console.log('关系标签:', label.name, '可连接:', canConnect, {
                            startEntityLabels: label.startEntityLabels,
                            targetEntityLabels: label.targetEntityLabels,
                            entityLabelIds: label.entityLabelIds,
                        });

                        return {
                            key: label.id,
                            label: !canConnect ? (
                                <Tooltip
                                    title='此标签无可连接的关系，请核对标签类型'
                                    placement='bottom'
                                    rootClassName='custom-white-tooltip'
                                >
                                    <span className={collapseStyles.labelText} style={{ color: '#999', cursor: 'help' }}>
                                        {label.name}
                                    </span>
                                </Tooltip>
                            ) : (
                                <span className={collapseStyles.labelText}>{label.name}</span>
                            ),
                            children: relationsForLabel.length === 0 ? (
                                <div className={styles.emptyState}>暂无标注内容</div>
                            ) : (
                                <div className={styles.entityItems}>
                                    {relationsForLabel.map((relation) => {
                                        const fromEntity = data?.entities?.find((e) => e.id === relation.fromEntityId);
                                        const toEntity = data?.entities?.find((e) => e.id === relation.toEntityId);

                                        return (
                                            <div
                                                key={relation.id}
                                                className={styles.relationItem}
                                                onMouseEnter={() => {
                                                    setHoveredRelation(relation.id);
                                                    setHoveredRelationId(relation.id);
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredRelation(null);
                                                    setHoveredRelationId(null);
                                                }}
                                            >
                                                <div className={`${relationPanelStyles.relationConnection} ${styles.relationConnection}`}>
                                                    <div className={relationPanelStyles.entityInRelation}>
                                                        <ConditionalTooltip title={fromEntity?.text || ''} placement='top'>
                                                            <span className={relationPanelStyles.entityText}>
                                                                {fromEntity?.text}
                                                            </span>
                                                        </ConditionalTooltip>
                                                    </div>
                                                    <div className={relationPanelStyles.relationArrowContainer}>
                                                        <ConditionalTooltip title={label.name}>
                                                            <span className={relationPanelStyles.relationName}>{label.name}</span>
                                                        </ConditionalTooltip>
                                                        <svg
                                                            className={relationPanelStyles.relationArrow}
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
                                                    <div className={relationPanelStyles.entityInRelation}>
                                                        <ConditionalTooltip title={toEntity?.text || ''} placement='top'>
                                                            <span className={relationPanelStyles.entityText}>
                                                                {toEntity?.text}
                                                            </span>
                                                        </ConditionalTooltip>
                                                    </div>
                                                </div>
                                                <div className={styles.relationActions}>
                                                    <div className={styles.deleteRelationContainer}>
                                                        <Tooltip title='删除关系' color='#fff' style={{ color: '#000' }}>
                                                            <div
                                                                className={`${styles.deleteRelation} ${hoveredRelationId === relation.id ? styles.visible : ''}`}
                                                                role='button'
                                                                tabIndex={0}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteRelation(relation.id);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        deleteRelation(relation.id);
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
                                                                    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                                        <path fillRule='evenodd' clipRule='evenodd' d='M11.3346 3.00008V1.66675L4.66797 1.66675V3.00008L1.66797 3.00008V4.33342H2.83464L2.83464 13.3334C2.83464 13.8857 3.28235 14.3334 3.83464 14.3334L12.168 14.3334C12.7203 14.3334 13.168 13.8857 13.168 13.3334V4.33342L14.3346 4.33342V3.00008L11.3346 3.00008ZM4.16797 13.0001L4.16797 4.33342L11.8346 4.33342V13.0001L4.16797 13.0001ZM6.0013 6.00008V11.0001H7.33464V6.00008H6.0013ZM8.66797 6.00008V11.0001H10.0013V6.00008H8.66797Z' fill='#0F172A' />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ),
                        };
                    })}
                />
            </div>
        </div>
    );
}

export default RelationLabel;
