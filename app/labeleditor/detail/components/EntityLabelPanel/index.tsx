'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Card, Button, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useEntityRelationStore } from '../../stores/entityRelationStore';
import styles from './index.module.css';

const { Text } = Typography;

interface EntityLabelPanelProps {
  visible: boolean;
  position: { x: number; y: number } | null;
  onLabelSelect: (labelId: string) => void;
  onClose: () => void;
}

const EntityLabelPanel: React.FC<EntityLabelPanelProps> = ({
  visible,
  position,
  onLabelSelect,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { entityLabels } = useEntityRelationStore();

  const handleLabelSelect = useCallback((labelId: string) => {
    onLabelSelect(labelId);
    onClose();
  }, [onLabelSelect, onClose]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, handleClickOutside, handleKeyDown]);

  const getPanelStyle = useCallback(() => {
    if (!position) return { display: 'none' };

    const style: React.CSSProperties = {
      position: 'fixed',
      left: position.x,
      top: position.y,
      zIndex: 1000,
    };

    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (position.x + rect.width > viewportWidth) {
        style.left = viewportWidth - rect.width - 10;
      }

      if (position.y + rect.height > viewportHeight) {
        style.top = position.y - rect.height - 10;
      }
    }

    return style;
  }, [position]);

  if (!visible || !position) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      style={getPanelStyle()}
    >
      <Card
        size="small"
        title={
          <div className={styles.panelHeader}>
            <Text strong>选择实体标签</Text>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onClose}
              className={styles.closeButton}
            />
          </div>
        }
        className={styles.panelCard}
      >
        <div className={styles.labelList}>
          {entityLabels.map((label) => (
            <Button
              key={label.id}
              type="default"
              size="small"
              className={styles.labelButton}
              style={{
                borderColor: label.color,
                color: label.color,
              }}
              onClick={() => handleLabelSelect(label.id)}
            >
              <div className={styles.labelContent}>
                <div
                  className={styles.labelColor}
                  style={{ backgroundColor: label.color }}
                />
                <span className={styles.labelName}>{label.name}</span>
              </div>
            </Button>
          ))}
        </div>

        {entityLabels.length === 0 && (
          <div className={styles.emptyState}>
            <Text type="secondary">暂无可用标签</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EntityLabelPanel;
