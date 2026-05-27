'use client';

import React, { useEffect, useRef } from 'react';
import { useClassificationStore } from './store';
import { useClassificationKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDataContext } from '../contexts/DataContext';
import { ClassificationData } from './types';
import TextDisplay from './components/TextDisplay';
import DynamicForm, { DynamicFormRef } from './components/DynamicForm';
import styles from './index.module.css';

function ClassPage(): React.ReactElement | null {
    // 从 Context 获取数据
    const { data: contextData } = useDataContext();

    // Form ref
    const formRef = useRef<DynamicFormRef>(null);

    console.log('ClassPage 组件已渲染！');

    // 使用文本分类store
    const {
        formValues,
        updateFormValue,
        initializeWithData,
        setFormRef,
    } = useClassificationStore();

    // 启用键盘快捷键
    useClassificationKeyboardShortcuts();

    // 从 Context 数据初始化 store
    useEffect(() => {
        if (contextData && contextData.type === 'classification') {
            console.log('ClassPage: Initializing with context data');
            initializeWithData(contextData as ClassificationData);
        }
    }, [contextData, initializeWithData]);

    // 设置 Form ref 到 store
    useEffect(() => {
        setFormRef(formRef);
    }, [setFormRef]);

    // 如果没有数据，显示空状态
    if (!contextData || contextData.type !== 'classification') {
        return null;
    }

    const classificationData = contextData as ClassificationData;

    console.log('ClassPage - 分类数据:', {
        classificationData,
        formFields: classificationData.formFields,
        labels: (classificationData as any).labels,
        hasFormFields: !!(classificationData.formFields && Array.isArray(classificationData.formFields)),
        formFieldsLength: classificationData.formFields?.length,
    });

    // 详细检查每个字段的选项配置
    if (classificationData.formFields && Array.isArray(classificationData.formFields)) {
        classificationData.formFields.forEach((field, index) => {
            console.log(`🔍 ClassPage - 字段 ${index + 1} (${field.id}):`, {
                id: field.id,
                label: field.label,
                type: field.type,
                required: field.required,
                options: field.options,
            });

            if (field.options && Array.isArray(field.options)) {
                field.options.forEach((option, optIndex) => {
                    console.log(`  选项 ${optIndex + 1}: label="${option.label}", value="${option.value}" (${typeof option.value}), hasInput=${option.hasInput}`);
                });
            }
        });
    }

    return (
        <div className={styles.classificationPage}>
            {/* 主要内容区域 */}
            <div className={styles.mainContent}>
                {/* 左侧：文本内容区域 */}
                <div className={styles.leftPanel}>
                    <div className={styles.textCard}>
                        <TextDisplay content={classificationData.content || ''} />
                    </div>
                </div>

                {/* 右侧：动态表单 */}
                <div className={styles.rightPanel}>
                    <DynamicForm
                        ref={formRef}
                        fields={classificationData.formFields}
                        values={formValues}
                        onChange={updateFormValue}
                        title='文本分类'
                    />
                </div>
            </div>
        </div>
    );
}

export default ClassPage;
