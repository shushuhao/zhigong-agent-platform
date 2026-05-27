import { create } from 'zustand';
import { message } from 'antd';
import { QAData } from '../types';
import { QAFormRef } from './components/QAForm';

// 问答状态接口
export interface QAState {
    data: QAData | null;
    loading: boolean;
    error: string | null;
    formValues: Record<string, any>;
    formRef: React.RefObject<QAFormRef> | null;

    // Actions
    updateFormValue: (fieldId: string, value: any) => void;
    updatePromptValue: (promptId: number, value: string) => void; // 新增：更新问答值
    validateForm: () => { isValid: boolean; errors: string[] }; // 新增：表单验证
    validateFormWithAntd: () => Promise<any>; // 新增：使用 antd Form 校验
    submitQA: (
        updateData: (data: QAData) => void,
        submitData: (saveType: 1 | 2, resultType: 0 | 1, isManual?: boolean) => Promise<void>,
        noAnnotationRequired?: boolean,
    ) => Promise<void>;
    saveData: (
        updateData: (data: QAData) => void,
        submitData: (saveType: 1 | 2, resultType: 0 | 1, isManual?: boolean) => Promise<void>,
    ) => Promise<void>;
    initializeWithData: (data: QAData) => void;
    setFormRef: (ref: React.RefObject<QAFormRef>) => void;
}

export const useQAStore = create<QAState>((set, get) => ({
    data: null,
    loading: false,
    error: null,
    formValues: {},
    formRef: null,

    // 更新表单值
    updateFormValue: (fieldId: string, value: any) => {
        set((state) => ({
            formValues: {
                ...state.formValues,
                [fieldId]: value,
            },
        }));
    },

    // 更新问答值
    updatePromptValue: (promptId: number, value: string) => {
        const fieldKey = `prompt_${promptId}`;
        console.log('QA Store - 更新问答值:', { promptId, fieldKey, value });

        set((state) => {
            const newFormValues = {
                ...state.formValues,
                [fieldKey]: value,
            };
            console.log('QA Store - 新的 formValues:', newFormValues);
            return {
                formValues: newFormValues,
            };
        });
    },

    // 表单验证
    validateForm: () => {
        const { data, formValues } = get();
        const errors: string[] = [];

        if (!data || !data.prompts) {
            return { isValid: false, errors: ['数据不完整'] };
        }

        // 检查每个问题是否已回答
        data.prompts.forEach((prompt, index) => {
            const fieldKey = `prompt_${prompt.id}`;
            const value = formValues[fieldKey];

            // 检查是否为空（未输入或只有空白字符）
            if (!value || value.trim() === '') {
                errors.push(`问题 ${index + 1} 未回答：${prompt.prompt}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    // 使用 antd Form 校验
    validateFormWithAntd: async () => {
        const { formRef } = get();
        if (formRef?.current) {
            return formRef.current.validateFields();
        }
        throw new Error('Form ref not available');
    },

    // 提交问答标注
    submitQA: async (updateData, submitData, noAnnotationRequired = false) => {
        const { data, formValues, validateForm } = get();
        if (!data) return;

        // 只有在未勾选"无需标注"时才进行表单验证
        if (!noAnnotationRequired) {
            const validation = validateForm();
            if (!validation.isValid) {
                // 显示验证错误信息
                const errorMessage = `请完成以下必填项：\n${validation.errors.map((error) => `• ${error}`).join('\n')}`;
                message.error({
                    content: errorMessage,
                    duration: 5,
                });
                console.log('表单验证失败:', validation.errors);
                return;
            }
        }

        set({ loading: true, error: null });

        try {
            // 构建新的问答数据，将表单值转换为 prompts 格式
            const updatedPrompts = data.prompts.map((prompt) => {
                const fieldKey = `prompt_${prompt.id}`;
                const userInput = formValues[fieldKey];

                return {
                    ...prompt,
                    response: userInput && userInput.trim() ? [[userInput.trim()]] : [],
                };
            });

            const updatedData = {
                ...data,
                prompts: updatedPrompts,
            } as QAData;

            updateData(updatedData);

            // 调用统一的提交方法
            await submitData(2, 1); // save_type: 2 (提交任务), result_type: 1 (有效结果)

            set({ loading: false });
            console.log('问答标注提交成功');
        } catch (error) {
            set({
                loading: false,
                error: error instanceof Error ? error.message : '提交失败',
            });
            console.error('问答标注提交失败:', error);
        }
    },

    // 保存数据（暂存）
    saveData: async (updateData, submitData) => {
        const { data, formValues } = get();
        if (!data) return;

        try {
            console.log('QA Store - 暂存前的数据:', { data, formValues });

            // 构建新的问答数据，将表单值转换为 prompts 格式
            const updatedPrompts = data.prompts.map((prompt) => {
                const fieldKey = `prompt_${prompt.id}`;
                const userInput = formValues[fieldKey];

                console.log(`QA Store - 处理 prompt ${prompt.id}:`, {
                    fieldKey,
                    userInput,
                    hasInput: !!(userInput && userInput.trim()),
                });

                return {
                    ...prompt,
                    response: userInput && userInput.trim() ? [[userInput.trim()]] : [],
                };
            });

            const updatedData = {
                ...data,
                prompts: updatedPrompts,
            } as QAData;

            console.log('QA Store - 更新后的数据:', updatedData);

            updateData(updatedData);

            // 调用统一的暂存方法，标记为自动暂存
            await submitData(1, 1, false); // save_type: 1 (暂存), result_type: 1 (有效结果), isManual: false

            console.log('问答标注暂存成功');
        } catch (error) {
            console.error('问答标注暂存失败:', error);
        }
    },

    // 从外部数据初始化store
    initializeWithData: (data: QAData) => {
        // 初始化表单值
        const initialValues: Record<string, any> = {};

        // 处理新的 prompts 格式
        if (data.prompts) {
            data.prompts.forEach((prompt) => {
                const fieldKey = `prompt_${prompt.id}`;
                // 如果有预填充的答案，使用预填充值
                if (prompt.response && prompt.response.length > 0) {
                    initialValues[fieldKey] = prompt.response.map((answerArray) => answerArray.join(' ')).join('\n');
                } else {
                    initialValues[fieldKey] = '';
                }
            });
        }

        // 兼容旧的 formFields 格式
        if ((data as any).formFields) {
            (data as any).formFields.forEach((field: any) => {
                if (field.type === 'checkbox') {
                    initialValues[field.id] = [];
                } else {
                    initialValues[field.id] = '';
                }
            });
        }

        set({
            data,
            formValues: initialValues,
            loading: false,
            error: null,
        });
    },

    // 设置 Form ref
    setFormRef: (ref: React.RefObject<QAFormRef>) => {
        set({ formRef: ref });
    },
}));
