import React from 'react';
import styles from './index.module.css';
import { useEntityRelationStore } from '../../store';

function RelationSelect(): React.ReactElement {
    const {
        data,
        pendingConnection,
        selectRelationAndConnect,
        relationMenuPosition,
    } = useEntityRelationStore();

    // 添加调试信息
    console.log('🎯 RelationSelect渲染:', {
        relationMenuPosition,
        pendingConnection,
        hasData: !!data,
    });
    return (
        <div
            className={styles.relationSelectionMenu}
            style={{
                position: 'fixed',
                left: Number(relationMenuPosition?.x) + 20,
                top: Number(relationMenuPosition?.y) - 3,
                zIndex: 9999999,
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    e.stopPropagation();
                }
            }}
            role='menu'
            tabIndex={-1}
        >
            <div className={styles.menuBody}>
                {(() => {
                    const fromEntity = data?.entities.find((e) => e.id === pendingConnection?.fromEntityId);
                    const toEntity = data?.entities.find((e) => e.id === pendingConnection?.toEntityId);

                    if (!fromEntity || !toEntity) return null;

                    // 获取可用的关系标签 - 根据真实API数据结构验证
                    const availableRelations = data?.relationLabels.filter((relation) => {
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

                    if (availableRelations?.length === 0) {
                        return (
                            <div className={styles.noRelations}>
                    没有可用的关系类型
                            </div>
                        );
                    }

                    return availableRelations?.map((relation) => (
                        <div
                            key={relation.id}
                            className={styles.relationOption}
                            onClick={() => selectRelationAndConnect(relation.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    selectRelationAndConnect(relation.id);
                                }
                            }}
                            role='menuitem'
                            tabIndex={0}
                            aria-label={`选择关系类型: ${relation.name}`}
                        >
                            <span className={styles.relationName}>{relation.name}</span>
                        </div>
                    ));
                })()}
            </div>
        </div>
    );
}

export default RelationSelect;
