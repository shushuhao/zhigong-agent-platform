import { create } from 'zustand';
import { message } from 'antd';
import { ClassificationState, ClassificationData } from './types';
import { DynamicFormRef } from './components/DynamicForm';

// 模拟API数据
const mockClassificationData: ClassificationData = {
    id: '1',
    name: '告警文本分类任务 - 工业设备状态',
    content: `设备告警记录

告警编号：ALM-20260527-0087
设备名称：A03 空压机
所属产线：总装一线
采集来源：边缘网关 GW-07 / Modbus TCP
触发时间：2026-05-27 08:15:32

告警内容：排气温度连续 6 分钟高于 95℃，振动 RMS 从 5.4mm/s 升至 8.2mm/s，设备健康评分降至 64。现场点检发现冷却风扇转速偏低，建议限制负载并创建预测性维护工单。

关联指标：排气温度、振动 RMS、电流负载率、冷却风扇转速、设备健康评分。`,
    formFields: [
        {
            id: 'document_type',
            name: 'document_type',
            label: '文本类型',
            type: 'radio',
            required: true,
            options: [
                {
                    label: '设备告警',
                    value: 'alarm',
                    hasInput: true,
                    inputPlaceholder: '请输入告警类型',
                },
                {
                    label: '点检记录',
                    value: 'inspection',
                    hasInput: false,
                },
                {
                    label: '维修工单',
                    value: 'work_order',
                    hasInput: false,
                },
                {
                    label: '其他',
                    value: 'other',
                    hasInput: true,
                    inputPlaceholder: '请说明其他类型',
                },
            ],
        },
        {
            id: 'alarm_level',
            name: 'alarm_level',
            label: '告警等级',
            type: 'checkbox',
            required: false,
            options: [
                {
                    label: '一般',
                    value: 'minor',
                    hasInput: false,
                },
                {
                    label: '严重',
                    value: 'major',
                    hasInput: true,
                    inputPlaceholder: '请输入严重原因',
                },
                {
                    label: '紧急',
                    value: 'critical',
                    hasInput: false,
                },
            ],
        },
        {
            id: 'affected_asset',
            name: 'affected_asset',
            label: '影响设备/产线',
            type: 'input',
            required: false,
            placeholder: '例如：A03 空压机 / 总装一线',
            maxLength: 100,
        },
    ],
    formValues: {},
    lastSaved: '',
    createdAt: '2024-08-10 09:21:00',
    updatedAt: '2024-08-10 09:21:00',
};

export const useClassificationStore = create<ClassificationState>((set, get) => ({
    data: null,
    loading: false,
    error: null,
    formValues: {},
    formRef: null,
    noAnnotationRequired: false,

    loadData: async () => {
        set({ loading: true, error: null });
        try {
            // 模拟API调用
            await new Promise<void>((resolve) => {
                setTimeout(() => resolve(), 500);
            });

            // 初始化表单值
            const initialValues: Record<string, any> = {};
            mockClassificationData.formFields.forEach((field) => {
                if (field.type === 'checkbox') {
                    initialValues[field.id] = [];
                } else if (field.type === 'radio') {
                    // 单选框使用 null，避免与空字符串选项匹配
                    initialValues[field.id] = null;
                } else {
                    // 其他类型（input, textarea等）使用空字符串
                    initialValues[field.id] = '';
                }
            });

            set({
                data: mockClassificationData,
                formValues: initialValues,
                loading: false,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : '加载数据失败',
                loading: false,
            });
        }
    },

    updateFormValue: (fieldId: string, value: any) => {
        set((state) => ({
            formValues: {
                ...state.formValues,
                [fieldId]: value,
            },
        }));
    },

    submitClassification: async () => {
        const { data, formValues } = get();
        if (!data) return;

        set({ loading: true });
        try {
            // 验证必填字段
            const requiredFields = data.formFields.filter((field) => field.required);
            for (const field of requiredFields) {
                const value = formValues[field.id];
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    throw new Error(`请填写必填字段：${field.label}`);
                }
            }

            // 整理提交数据，只包含选中选项的输入框数据
            const submitData: Record<string, any> = {
                ...formValues,
                optionInputs: {} as Record<string, string>,
            };

            // 遍历表单字段，只收集选中选项的输入框数据
            data.formFields.forEach((field) => {
                if (field.type === 'radio') {
                    // 单选：只收集选中选项的输入框数据
                    const selectedValue = formValues[field.id];
                    if (selectedValue) {
                        const inputKey = `${field.id}_${selectedValue}_input`;
                        const inputValue = formValues[inputKey];
                        if (inputValue && typeof inputValue === 'string' && inputValue.trim()) {
                            (submitData.optionInputs as Record<string, string>)[inputKey] = inputValue;
                        }
                    }
                } else if (field.type === 'checkbox') {
                    // 多选：只收集选中选项的输入框数据
                    const selectedValues = formValues[field.id] || [];
                    if (Array.isArray(selectedValues)) {
                        selectedValues.forEach((selectedValue) => {
                            const inputKey = `${field.id}_${selectedValue}_input`;
                            const inputValue = formValues[inputKey];
                            if (inputValue && typeof inputValue === 'string' && inputValue.trim()) {
                                (submitData.optionInputs as Record<string, string>)[inputKey] = inputValue;
                            }
                        });
                    }
                }
            });

            console.log('提交的完整数据:', submitData);

            // 模拟提交API调用
            await new Promise<void>((resolve) => {
                setTimeout(() => resolve(), 1000);
            });

            message.success('提交成功！');
            set({ loading: false });
        } catch (error) {
            message.error(error instanceof Error ? error.message : '提交失败');
            set({ loading: false });
        }
    },

    saveData: async () => {
        const { data, formValues } = get();
        if (!data) return;

        try {
            // 模拟保存API调用
            await new Promise<void>((resolve) => {
                setTimeout(() => resolve(), 500);
            });

            const now = new Date().toLocaleString('zh-CN');
            set((state) => ({
                data: state.data ? {
                    ...state.data,
                    formValues,
                    lastSaved: now,
                    updatedAt: now,
                } : null,
            }));

            console.log('分类组件暂存成功');
        } catch (error) {
            console.error('分类组件暂存失败:', error);
        }
    },

    // Header组件兼容性方法
    submitAnnotation: async () => get().submitClassification(),

    toggleNoAnnotationRequired: () => {
        set((state) => ({
            noAnnotationRequired: !state.noAnnotationRequired,
        }));
    },

    autoSave: async () => get().saveData(),

    // 从外部数据初始化store
    initializeWithData: (data: ClassificationData) => {
        console.log('🔧 initializeWithData 接收到的数据:', {
            data,
            formFields: data.formFields,
            formFieldsType: typeof data.formFields,
            isArray: Array.isArray(data.formFields),
        });

        // 初始化表单值
        const initialValues: Record<string, any> = {};

        // 防御性检查：确保 formFields 是数组
        const formFields = Array.isArray(data.formFields) ? data.formFields : [];

        if (formFields.length === 0) {
            console.warn('🚨 formFields 为空数组，可能数据格式不正确');
        }

        formFields.forEach((field) => {
            // 如果已有表单数据，使用已有数据进行回显
            if (data.formValues && data.formValues[field.id] !== undefined) {
                initialValues[field.id] = data.formValues[field.id];
                console.log(`🔄 回显字段 ${field.id}:`, data.formValues[field.id]);
            } else if (field.type === 'checkbox') {
                // 否则使用默认值
                initialValues[field.id] = [];
            } else if (field.type === 'radio') {
                // 单选框使用 null，避免与空字符串选项匹配
                initialValues[field.id] = null;
            } else {
                // 其他类型（input, textarea等）使用空字符串
                initialValues[field.id] = '';
            }

            // 处理带输入框的选项的回显
            if (field.options) {
                field.options.forEach((option) => {
                    if (option.hasInput) {
                        const inputKey = `${field.id}_${option.value}_input`;
                        if (data.formValues && data.formValues[inputKey] !== undefined) {
                            initialValues[inputKey] = data.formValues[inputKey];
                            console.log(`🔄 回显输入框 ${inputKey}:`, data.formValues[inputKey]);
                        } else {
                            initialValues[inputKey] = '';
                        }
                    }
                });
            }
        });

        set({
            data: {
                ...data,
                formFields,
            },
            formValues: initialValues,
            loading: false,
            error: null,
        });
    },

    // 使用 antd Form 校验
    validateFormWithAntd: async () => {
        const { formRef } = get();
        if (formRef?.current) {
            return formRef.current.validateFields();
        }
        throw new Error('Form ref not available');
    },

    // 设置 Form ref
    setFormRef: (ref: React.RefObject<DynamicFormRef>) => {
        set({ formRef: ref });
    },

    // 重置store状态
    resetStore: () => {
        console.log('🧹 重置分类标注store状态');
        set({
            data: null,
            loading: false,
            error: null,
            formValues: {},
            formRef: null,
            noAnnotationRequired: false,
        });
    },
}));
