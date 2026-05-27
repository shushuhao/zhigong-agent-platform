'use client';

import React, { useEffect, useRef } from 'react';
import { useDataContext } from '../contexts/DataContext';
import { QAData } from '../types';
import { useQAStore } from './store';
import TextDisplay from '../Class/components/TextDisplay';
import QAForm, { QAFormRef } from './components/QAForm';
import styles from './index.module.css';

function QAPage(): React.ReactElement | null {
    // 从 Context 获取数据
    const { data: contextData } = useDataContext();

    // Form ref
    const formRef = useRef<QAFormRef>(null);

    console.log('QAPage 组件已渲染！');

    // 使用问答store
    const {
        formValues,
        updatePromptValue,
        initializeWithData,
        setFormRef, // 添加这个方法到 store
    } = useQAStore();

    // 从 Context 数据初始化 store
    useEffect(() => {
        if (contextData && contextData.type === 'qa') {
            console.log('QAPage: Initializing with context data');
            initializeWithData(contextData as QAData);
        }
    }, [contextData, initializeWithData]);

    // 设置 Form ref 到 store
    useEffect(() => {
        setFormRef(formRef);
    }, [setFormRef]);

    // 如果没有数据，显示空状态
    if (!contextData || contextData.type !== 'qa') {
        return null;
    }

    const qaData = contextData as QAData;
    const hasContent = qaData.content && qaData.content.trim().length > 0;

    console.log('QA Index - 渲染数据:', {
        qaData,
        formValues,
        hasContent,
    });

    return (
        <div className={styles.qaPage}>
            {hasContent ? (
                // 有内容时：左右布局
                <div className={styles.mainContent}>
                    {/* 左侧：文本内容区域 */}
                    <div className={styles.leftPanel}>
                        <div className={styles.textCard}>
                            <TextDisplay content={qaData.content!} />
                        </div>
                    </div>

                    {/* 右侧：问答表单 */}
                    <div className={styles.rightPanel}>
                        <QAForm
                            ref={formRef}
                            prompts={qaData.prompts}
                            values={formValues}
                            onChange={updatePromptValue}
                            title='问答标注'
                        />
                    </div>
                </div>
            ) : (
                // 无内容时：只显示表单
                <div className={styles.formOnlyContent}>
                    <QAForm
                        ref={formRef}
                        prompts={qaData.prompts}
                        values={formValues}
                        onChange={updatePromptValue}
                        title='问答标注'
                    />
                </div>
            )}
        </div>
    );
}

export default QAPage;
