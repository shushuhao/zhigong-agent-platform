'use client';

import React from 'react';
import { Spin, Alert } from 'antd';
import { useDataContext } from '../contexts/DataContext';
import RankingContent from './components/RankingContent';
import styles from './index.module.css';

function RankingPage(): React.ReactElement {
    const { data, loading, error } = useDataContext();

    console.log('RankingPage 组件已渲染！');

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size='large' />
                <div className={styles.loadingText}>加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <Alert
                    message='加载失败'
                    description={error}
                    type='error'
                    showIcon
                />
            </div>
        );
    }

    if (!data || data.type !== 'ranking') {
        return (
            <div className={styles.errorContainer}>
                <Alert
                    message='数据错误'
                    description='无法加载排序标注数据'
                    type='warning'
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className={styles.rankingPage}>
            <RankingContent data={data as any} />
        </div>
    );
}

export default RankingPage;
