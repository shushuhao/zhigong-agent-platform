'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Checkbox, Dropdown, Space, Typography, message } from 'antd';
import {
  ArrowLeftOutlined,
  MoreOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useDataContext } from '@/app/labeleditor/detail/context/DataContext';
import { useEntityRelationStore } from '@/app/labeleditor/detail/stores/entityRelationStore';
import styles from './index.module.css';

const { Text } = Typography;

const Header: React.FC = () => {
  const router = useRouter();
  const {
    data,
    loading,
    submitting,
    noAnnotationRequired,
    saveData,
    submitData,
    toggleNoAnnotationRequired
  } = useDataContext();

  // 获取Store中的统计数据
  const { entities, relations } = useEntityRelationStore();

  // 本地状态
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // 格式化时间
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 自动保存功能
  const startAutoSave = useCallback(() => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
    }

    const timer = setInterval(async () => {
      if (data && !loading && !submitting) {
        try {
          await saveData(false); // 非手动保存
          setLastAutoSaveTime(new Date().toISOString());
        } catch (error) {
          console.error('自动保存失败:', error);
        }
      }
    }, 30000); // 30秒自动保存

    // setAutoSaveTimer(timer);
  }, [data, loading, submitting, saveData, autoSaveTimer]);

  // 手动保存
  const handleManualSave = async () => {
    try {
      await saveData(true); // 手动保存
      setLastAutoSaveTime(new Date().toISOString());
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 提交标注
  const handleSubmit = async () => {
    try {
      await submitData(1, 1, true);
      message.success('提交成功');
      // 可以跳转到其他页面
    } catch (error) {
      message.error('提交失败');
    }
  };

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 启动自动保存
  useEffect(() => {
    if (data) {
      startAutoSave();
      setLastAutoSaveTime(data.updatedAt);
    }

    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [data, startAutoSave]);

  // 更多操作菜单
  const moreMenuItems = [
    {
      key: 'shortcuts',
      label: (
        <Space>
          <QuestionCircleOutlined />
          快捷键说明
        </Space>
      ),
      onClick: () => {
        message.info('Ctrl+S: 手动保存');
      }
    },
    {
      key: 'tutorial',
      label: (
        <Space>
          <QuestionCircleOutlined />
          使用教程
        </Space>
      ),
      onClick: () => {
        message.info('使用教程功能');
      }
    }
  ];

  return (
    <div className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className={styles.backButton}
            onClick={() => router.back()}
          />
          <div className={styles.titleSection}>
            <div className={styles.titleText}>
              {data?.name || '加载中...'}
            </div>
            <div className={styles.titleTime}>
              自动保存于 {formatTime(lastAutoSaveTime)}
            </div>
            {/* 实体关系统计信息 */}
            {data?.type === 'entity-relation' && (
              <div className={styles.statsInfo}>
                实体: {entities.length} | 关系: {relations.length}
              </div>
            )}
          </div>
        </div>

        <div className={styles.topRight}>
          <Space size="middle">
            <Checkbox
              checked={noAnnotationRequired}
              onChange={toggleNoAnnotationRequired}
              disabled={loading || submitting}
            >
              无需标注
            </Checkbox>

            <Button
              type="primary"
              loading={submitting}
              disabled={loading || noAnnotationRequired}
              onClick={handleSubmit}
            >
              提交
            </Button>

            <Dropdown
              menu={{ items: moreMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                className={styles.moreButton}
              />
            </Dropdown>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default Header;