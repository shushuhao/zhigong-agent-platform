'use client';

import React, { useRef, useCallback } from 'react';
import { useEntityRelationStore } from '../../stores/entityRelationStore';
import { getCurrentSelection, clearSelection } from '../../utils/textSelection';
import styles from './index.module.css';

interface TextRendererProps {
  content: string;
  onTextSelect?: (selection: { start: number; end: number; text: string }) => void;
  onEntityClick?: (entityId: string) => void;
  onEntityHover?: (entityId: string | null) => void;
}

const TextRenderer: React.FC<TextRendererProps> = ({
  content,
  onTextSelect,
  onEntityClick,
  onEntityHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    entities,
    hoveredEntityId,
    selectedEntityId,
    setTextSelection,
    setHoveredEntity,
    setSelectedEntity,
  } = useEntityRelationStore();

  const handleTextSelection = useCallback(() => {
    const selection = getCurrentSelection();
    if (selection && selection.text.length > 0) {
      setTextSelection({
        start: selection.start,
        end: selection.end,
        text: selection.text,
        isValid: true,
      });
      onTextSelect?.(selection);
    } else {
      setTextSelection(null);
    }
  }, [setTextSelection, onTextSelect]);

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      handleTextSelection();
    }, 10);
  }, [handleTextSelection]);

  const handleEntityClick = useCallback((entityId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    clearSelection();
    setSelectedEntity(entityId);
    onEntityClick?.(entityId);
  }, [setSelectedEntity, onEntityClick]);

  const handleEntityMouseEnter = useCallback((entityId: string) => {
    setHoveredEntity(entityId);
    onEntityHover?.(entityId);
  }, [setHoveredEntity, onEntityHover]);

  const handleEntityMouseLeave = useCallback(() => {
    setHoveredEntity(null);
    onEntityHover?.(null);
  }, [setHoveredEntity, onEntityHover]);

  const renderTextWithEntities = useCallback(() => {
    if (!content || entities.length === 0) {
      return <span>{content}</span>;
    }

    const sortedEntities = [...entities]
      .filter((entity) => entity.visible)
      .sort((a, b) => a.start - b.start);

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedEntities.forEach((entity) => {
      if (entity.start > lastEnd) {
        parts.push(
          <span key={`text-${lastEnd}-${entity.start}`}>
            {content.slice(lastEnd, entity.start)}
          </span>
        );
      }

      const isHovered = hoveredEntityId === entity.id;
      const isSelected = selectedEntityId === entity.id;

      parts.push(
        <span
          key={`entity-${entity.id}`}
          className={`${styles.entity} ${isHovered ? styles.entityHovered : ''} ${isSelected ? styles.entitySelected : ''}`}
          style={{
            backgroundColor: `${entity.color}40`,
            borderColor: entity.color,
          }}
          onClick={(event) => handleEntityClick(entity.id, event)}
          onMouseEnter={() => handleEntityMouseEnter(entity.id)}
          onMouseLeave={handleEntityMouseLeave}
          title={`${entity.labelName}: ${entity.text}`}
        >
          {entity.text}
        </span>
      );

      lastEnd = Math.max(lastEnd, entity.end);
    });

    if (lastEnd < content.length) {
      parts.push(
        <span key={`text-${lastEnd}-end`}>
          {content.slice(lastEnd)}
        </span>
      );
    }

    return parts;
  }, [content, entities, hoveredEntityId, selectedEntityId, handleEntityClick, handleEntityMouseEnter, handleEntityMouseLeave]);

  return (
    <div
      ref={containerRef}
      className={styles.textContainer}
      data-text-container="true"
      onMouseUp={handleMouseUp}
    >
      <div className={styles.textContent}>
        {renderTextWithEntities()}
      </div>
    </div>
  );
};

export default TextRenderer;
