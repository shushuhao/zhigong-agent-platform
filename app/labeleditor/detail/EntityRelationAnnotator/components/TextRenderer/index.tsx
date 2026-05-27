import React from 'react';
import type { AnnotationData, EntityAnnotation } from '../../store';
import EntityAnnotationItem from '../EntityAnnotationItem';

interface TextRendererProps {
    data: AnnotationData;
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

function TextRenderer({
    data,
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
}: TextRendererProps): React.ReactElement {
    // 处理实体重叠检测
    const processEntitiesOverlap = (entities: EntityAnnotation[]): EntityAnnotation[] => {
        const processedEntities: EntityAnnotation[] = [];

        for (let i = 0; i < entities.length; i++) {
            const current = entities[i];
            const next = entities[i + 1];

            // 如果当前实体与下一个实体重叠，跳过较短的那个
            if (next && current.end > next.start) {
                const currentLength = current.end - current.start;
                const nextLength = next.end - next.start;
                if (currentLength >= nextLength) {
                    processedEntities.push(current);
                    entities.splice(i + 1, 1); // 移除下一个实体
                } else {
                    continue; // 跳过当前实体
                }
            } else {
                processedEntities.push(current);
            }
        }

        return processedEntities;
    };

    // 渲染文本内容
    const renderContent = (): React.ReactNode[] => {
        let lastIndex = 0;
        const elements: React.ReactNode[] = [];

        // 按位置排序实体，并过滤掉不可见的实体
        console.log('原始实体:', data?.entities?.map((e: EntityAnnotation) => ({
            id: e.id,
            text: e.text,
            visible: e.visible,
            start: e.start,
            end: e.end,
        })));

        const sortedEntities = [...data.entities]
            .filter((entity) => entity.visible)
            .sort((a, b) => a.start - b.start);

        // 检查实体重叠并处理
        const processedEntities = processEntitiesOverlap(sortedEntities);

        processedEntities.forEach((entity, index) => {
            // 添加实体前的普通文本
            if (entity.start > lastIndex) {
                const beforeText = data.content.slice(lastIndex, entity.start);
                console.log(`添加实体前文本 [${lastIndex}-${entity.start}]:`, beforeText);
                elements.push(
                    <span key={`text-${index}`} data-text-segment='normal' data-start={lastIndex} data-end={entity.start}>
                        {beforeText}
                    </span>,
                );
            }

            elements.push(
                <EntityAnnotationItem
                    key={`entity-${entity.id}`}
                    entity={entity}
                    connecting={connecting}
                    connectingFromId={connectingFromId}
                    hoveredEntity={hoveredEntity}
                    showingConnectionTooltip={showingConnectionTooltip}
                    selectedRelationLabelId={selectedRelationLabelId}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onEntityClick={onEntityClick}
                    onDeleteEntity={onDeleteEntity}
                    onConnectionTooltipEnter={onConnectionTooltipEnter}
                    onConnectionTooltipLeave={onConnectionTooltipLeave}
                    onDeleteRelation={onDeleteRelation}
                    onRelationMouseEnter={onRelationMouseEnter}
                    onRelationMouseLeave={onRelationMouseLeave}
                    canConnectToEntity={canConnectToEntity}
                    getEntityConnectionCount={getEntityConnectionCount}
                    getEntityRelations={getEntityRelations}
                />,
            );

            lastIndex = entity.end;
        });

        // 添加最后的普通文本
        if (lastIndex < data.content.length) {
            const endText = data.content.slice(lastIndex);
            console.log(`添加结尾文本 [${lastIndex}-${data.content.length}]:`, endText);
            elements.push(
                <span key='text-end' data-text-segment='normal' data-start={lastIndex} data-end={data.content.length}>
                    {endText}
                </span>,
            );
        }

        return elements;
    };

    return <>{renderContent()}</>;
}

export default TextRenderer;
