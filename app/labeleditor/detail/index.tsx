import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Header from './components/Header';
import EntityRelationAnnotator from './EntityRelationAnnotator/index';
import ClassPage from './Class';
import QAPage from './QA';
import RankingPage from './Ranking';
import { DataProvider, useDataContext } from './contexts/DataContext';
import { getUrlParams, getAnnotationType } from './utils/urlParams';
import styles from './index.module.css';

function TextAnnotationContent(): React.ReactElement {
    const { loading, error, data, clearAutoSaveTimer } = useDataContext();

    // 从 URL 参数获取类型信息
    const { kindParam } = getUrlParams();
    const type = getAnnotationType(kindParam);

    console.log('TextAnnotationContent rendered, type:', kindParam, type, 'data:', data);

    // 组件卸载时清理定时器
    useEffect(() => {
        console.log('TextAnnotationContent: 组件已挂载');
        return () => {
            console.log('TextAnnotationContent: 组件即将卸载，清理自动保存定时器');
            clearAutoSaveTimer();
        };
    }, [clearAutoSaveTimer]);

    const renderContent = (): React.ReactElement => {
        if (loading) {
            return (
                <div className={styles.loading}>
                    <Spin indicator={<LoadingOutlined spin />} className='cvat-spinner' />
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.error}>
                    <div>
                        错误:
                        {' '}
                        {error}
                    </div>
                </div>
            );
        }

        // 根据 URL 参数中的 kind 渲染对应的组件
        switch (kindParam) {
            case 'classification':
                return <ClassPage />;
            case 'qa':
                return <QAPage />;
            case 'ranking':
                // TODO: 实现排序标注组件
                return <RankingPage />;
            case 'entity-relation':
            default:
                return <EntityRelationAnnotator />;
        }
    };

    return (
        <div className={styles.newAnnotator}>
            {/* 顶部信息栏 */}
            <Header />
            {renderContent()}
        </div>
    );
}

function TextAnnotationPlatform(): React.ReactElement {
    return (
        <DataProvider>
            <TextAnnotationContent />
        </DataProvider>
    );
}

export default TextAnnotationPlatform;
