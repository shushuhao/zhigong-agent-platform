'use client';

import React, { useCallback, useEffect } from 'react';
import { Card, Typography, Row, Col, Tag, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDataContext } from '../context/DataContext';
import { useEntityRelationStore } from '../stores/entityRelationStore';
import TextRenderer from '../components/TextRenderer';
import EntityLabelPanel from '../components/EntityLabelPanel';
import styles from './index.module.css';

const { Title, Text } = Typography;

const EntityRelationAnnotator: React.FC = () => {
  // 从Context获取数据
  const { data: contextData, loading: contextLoading, error: contextError } = useDataContext();
  console.log('contextData', contextData)

  // 使用Store
  const {
    taskId,
    taskName,
    content,
    entityLabels,
    relationLabels,
    entities,
    relations,
    selectedText,
    selectedEntityId,
    showLabelPanel,
    labelPanelPosition,
    loading: storeLoading,
    error: storeError,
    initializeWithData,
    showEntityLabelPanel,
    hideLabelPanel,
    addEntityAnnotation,
    removeEntityAnnotation,
    setSelectedEntity
  } = useEntityRelationStore();
  console.log('entityLabels', entityLabels)

  useEffect(() => {
     initializeWithData(contextData)
  },[contextData])

  // 处理文本选择
  const handleTextSelect = useCallback((selection: { start: number; end: number; text: string }) => {
    // 显示标签选择面板
    const rect = window.getSelection()?.getRangeAt(0)?.getBoundingClientRect();
    if (rect) {
      showEntityLabelPanel({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10
      });
    }
  }, [showEntityLabelPanel]);

  // 处理标签选择
  const handleLabelSelect = useCallback((labelId: string) => {
    if (!selectedText) return;

    const selectedLabel = entityLabels.find(label => label.id === labelId);
    if (!selectedLabel) return;

    // 检查是否与现有实体重叠
    const hasOverlap = entities.some(entity =>
      (selectedText.start < entity.end && selectedText.end > entity.start)
    );

    if (hasOverlap) {
      message.warning('选择的文本与现有实体重叠，请重新选择');
      return;
    }

    // 添加新的实体标注
    addEntityAnnotation({
      start: selectedText.start,
      end: selectedText.end,
      text: selectedText.text,
      labelId: selectedLabel.id,
      labelName: selectedLabel.name,
      color: selectedLabel.color,
    });

    message.success(`已添加实体标注: ${selectedLabel.name}`);
  }, [selectedText, entityLabels, entities, addEntityAnnotation]);

  // 处理实体点击
  const handleEntityClick = useCallback((entityId: string) => {
    setSelectedEntity(entityId);
  }, [setSelectedEntity]);

  // 处理实体删除
  const handleEntityDelete = useCallback((entityId: string) => {
    removeEntityAnnotation(entityId);
    message.success('已删除实体标注');
  }, [removeEntityAnnotation]);

  // ... 现有的错误处理和加载状态代码保持不变 ...

  return (
    <div className={styles.container}>
      {/* 标签配置卡片 - 保持不变 */}
      <Card className={styles.labelsCard} title="标签配置">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Title level={5}>实体标签 ({entityLabels.length})</Title>
            <div className={styles.labelList}>
              {entityLabels.map((label) => (
                <Tag
                  key={label.id}
                  color={label.color}
                  className={styles.labelTag}
                >
                  {label.name}
                </Tag>
              ))}
            </div>
          </Col>
          <Col span={12}>
            <Title level={5}>关系标签 ({relationLabels.length})</Title>
            <div className={styles.labelList}>
              {relationLabels.map((label) => (
                <Tag
                  key={label.id}
                  color={label.color}
                  className={styles.labelTag}
                >
                  {label.name}
                </Tag>
              ))}
            </div>
          </Col>
        </Row>
      </Card>

      {/* 文本标注区域 - 新增 */}
      <Card className={styles.annotationCard} title="文本标注">
        <TextRenderer
          content={content || ''}
          onTextSelect={handleTextSelect}
          onEntityClick={handleEntityClick}
        />

        {/* 标签选择面板 */}
        <EntityLabelPanel
          visible={showLabelPanel}
          position={labelPanelPosition}
          onLabelSelect={handleLabelSelect}
          onClose={hideLabelPanel}
        />
      </Card>

      {/* 已标注实体列表 - 新增 */}
      <Card className={styles.entitiesCard} title={`已标注实体 (${entities.length})`}>
        <div className={styles.entityList}>
          {entities.map((entity) => (
            <div
              key={entity.id}
              className={`${styles.entityItem} ${selectedEntityId === entity.id ? styles.entityItemSelected : ''}`}
            >
              <div className={styles.entityInfo}>
                <Tag color={entity.color} className={styles.entityTag}>
                  {entity.labelName}
                </Tag>
                <Text className={styles.entityText}>"{entity.text}"</Text>
                <Text type="secondary" className={styles.entityPosition}>
                  ({entity.start}-{entity.end})
                </Text>
              </div>
              <div className={styles.entityActions}>
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleEntityDelete(entity.id)}
                  className={styles.deleteButton}
                />
              </div>
            </div>
          ))}

          {entities.length === 0 && (
            <div className={styles.emptyState}>
              <Text type="secondary">
                请在上方文本中选择文字进行标注
              </Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EntityRelationAnnotator;