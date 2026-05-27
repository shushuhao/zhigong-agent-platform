import React, { useState, useRef, useEffect } from 'react';
import { Tooltip } from 'antd';
import styles from './index.module.css';
import collapseStyles from '../CustomCollapse/index.module.css';
import { useEntityRelationStore } from '../../store';
import CustomCollapse from '../CustomCollapse';
import ConditionalTooltip from '../../../components/ConditionalTooltip';

function EntityLabel(): React.ReactElement {
    const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);
    const [hoveredDeleteIcon, setHoveredDeleteIcon] = useState<string | null>(null);
    const [showShadow, setShowShadow] = useState(false);
    const scrollableRef = useRef<HTMLDivElement>(null);

    const {
        data,
        deleteEntity,
        entityPanelExpanded,
        toggleEntityPanelExpanded,
    } = useEntityRelationStore();

    // 将 entityPanelExpanded 对象转换为 Set
    const expandedKeys = new Set(
        Object.entries(entityPanelExpanded)
            .filter(([, isExpanded]) => isExpanded)
            .map(([labelId]) => labelId),
    );

    // 检查是否需要显示阴影
    const checkScrollShadow = () => {
        if (scrollableRef.current) {
            const { scrollHeight, clientHeight } = scrollableRef.current;
            setShowShadow(scrollHeight > clientHeight);
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
            <div className={`${styles.fixedTitle} ${showShadow ? styles.withShadow : ''}`}>实体标签</div>
            <div className={styles.scrollableContent} ref={scrollableRef}>
                <CustomCollapse
                    items={(data?.entityLabels || []).map((label) => {
                        const entitiesForLabel = data?.entities?.filter((entity) => entity.labelId === label.id) || [];
                        return {
                            key: label.id,
                            indicatorColor: label.color,
                            label: (
                                <span className={collapseStyles.labelText}>{label.name}</span>
                            ),
                            children: entitiesForLabel.length === 0 ? (
                                <div className={styles.emptyState}>暂无标注内容</div>
                            ) : (
                                <div className={styles.entityItems}>
                                    {entitiesForLabel.map((entity) => (
                                        <div
                                            key={entity.id}
                                            className={styles.entityItem}
                                            onMouseEnter={() => setHoveredEntityId(entity.id)}
                                            onMouseLeave={() => setHoveredEntityId(null)}
                                        >
                                            <ConditionalTooltip title={entity.text}>
                                                <span className={styles.entityText}>{entity.text}</span>
                                            </ConditionalTooltip>
                                            <div className={styles.entityActions}>
                                                {hoveredEntityId === entity.id && (
                                                    <Tooltip title='删除标签后，所有关系都会删除' color='#fff' style={{ color: '#000' }}>
                                                        <div
                                                            role='button'
                                                            tabIndex={0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteEntity(entity.id);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    deleteEntity(entity.id);
                                                                }
                                                            }}
                                                            onMouseEnter={() => setHoveredDeleteIcon(entity.id)}
                                                            onMouseLeave={() => setHoveredDeleteIcon(null)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            {hoveredDeleteIcon === entity.id ? (
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
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ),
                        };
                    })}
                    expandedKeys={expandedKeys}
                    onToggle={toggleEntityPanelExpanded}
                />
            </div>
        </div>
    );
}

export default EntityLabel;
