// 文本分类相关类型定义

// 表单字段类型
export type FormFieldType = 'radio' | 'checkbox' | 'input' | 'textarea' | 'select';

// 表单选项
export interface FormOption {
    label: string;
    value: string | number;
    hasInput?: boolean; // 是否需要输入框
    inputPlaceholder?: string; // 输入框占位符
}

// 动态表单字段
export interface ClassificationFormField {
    id: string;
    name: string;
    label: string;
    type: FormFieldType;
    required: boolean;
    options?: FormOption[];
    value?: any;
    placeholder?: string;
    maxLength?: number;
    rows?: number; // 用于textarea
}

// 文本分类数据结构
export interface ClassificationData {
    id: string;
    name: string;
    content: string;
    formFields: ClassificationFormField[];
    formValues: Record<string, any>;
    lastSaved: string;
    createdAt: string;
    updatedAt: string;
}

// 文本分类状态接口
export interface ClassificationState {
    data: ClassificationData | null;
    loading: boolean;
    error: string | null;
    formValues: Record<string, any>;
    formRef: React.RefObject<any> | null; // 添加 formRef

    // Actions
    loadData: (id: string) => Promise<void>;
    updateFormValue: (fieldId: string, value: any) => void;
    submitClassification: () => Promise<void>;
    saveData: () => Promise<void>;
    initializeWithData: (data: ClassificationData) => void;
    validateFormWithAntd: () => Promise<any>; // 添加 antd Form 校验方法
    setFormRef: (ref: React.RefObject<any>) => void; // 添加设置 formRef 方法

    // Header组件兼容性方法
    submitAnnotation: () => Promise<void>;
    noAnnotationRequired: boolean;
    toggleNoAnnotationRequired: () => void;
    autoSave: () => Promise<void>;

    // 重置store状态
    resetStore: () => void;
}
