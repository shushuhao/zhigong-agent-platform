// 通用数据接口
export interface BaseAnnotationData {
    id: string;
    name: string;
    content: string;
    type: 'entity-relation' | 'classification' | 'qa' | 'ranking';
    lastSaved: string;
    createdAt: string;
    updatedAt: string;
    item_path?: string; // 可选的远程JSON数据路径
    requirement_info?: {
        name: string;
        label_tool: {
            label_tool_code: string;
            label_tool_name: string;
            image_out_of_bounds: number;
        };
        label_type: number;
        description: string;
        label_count: number;
        not_started_num: number;
    } | null; // 任务元数据信息
}

// 实体关系数据
export interface EntityRelationData extends BaseAnnotationData {
    type: 'entity-relation';
    entities: Array<{
        id: string;
        text: string;
        start: number;
        end: number;
        label: string;
    }>;
    relations: Array<{
        id: string;
        fromEntity: string;
        toEntity: string;
        label: string;
    }>;
}

// 分类数据
export interface ClassificationData extends BaseAnnotationData {
    type: 'classification';
    formFields: Array<{
        id: string;
        name: string;
        type: 'radio' | 'checkbox' | 'input';
        label: string;
        required: boolean;
        options?: Array<{
            value: string;
            label: string;
            hasInput?: boolean;
        }>;
    }>;
    formValues: Record<string, any>;
}

// 问答数据
export interface QAData extends BaseAnnotationData {
    type: 'qa';
    prompts: QAPrompt[];
}

// 问答提示项接口
export interface QAPrompt {
    id: number;
    prompt: string;
    response?: string[][]; // 可选的回填答案
    required?: boolean; // 是否必填，根据 attribute_group_type === 1 判断
}

// 排序响应项接口
export interface RankingResponse {
    id: number;
    response: string;
}

// 排序提示项接口
export interface RankingPrompt {
    id: number;
    prompt: string;
    responses: RankingResponse[];
}

// 排序数据（新格式）
export interface RankingData extends BaseAnnotationData {
    type: 'ranking';
    content: string; // 左侧显示的内容
    prompts: RankingPrompt[]; // 右侧的排序内容
}

// 联合类型
export type AnnotationData = EntityRelationData | ClassificationData | QAData | RankingData;

// API 响应类型
export interface ApiResponse<T = any> {
    message: string;
    data?: T;
    code?: number;
    requestId?: string;
}

// 任务元数据类型
export interface TaskMetaData {
    task_id: number;
    item_path: string;
    item_type: number;
    task_info: {
        pic: any;
    };
    requirement_info: {
        name: string;
        label_tool: {
            label_tool_code: string;
            label_tool_name: string;
            image_out_of_bounds: number;
        };
        label_type: number;
        description: string;
        label_count: number;
        not_started_num: number;
    };
}

// 任务结果数据类型
export interface TaskResultData {
    task_id: number;
    task_status: number;
    result_type: number;
    update_time: string;
    result: AnnotationData;
}

// DataContext 接口
export interface DataContextType {
    data: AnnotationData | null;
    loading: boolean;
    submitting: boolean; // 提交状态
    saving: boolean; // 暂存状态
    error: string | null;
    noAnnotationRequired: boolean; // 无需标注
    loadData: (isNext: boolean, rId: string, type: string, tId?: string) => Promise<void>;
    saveData: (isManual?: boolean) => Promise<void>;
    submitData: (saveType?: 1 | 2, resultType?: 0 | 1, isManual?: boolean) => Promise<void>;
    toggleNoAnnotationRequired: () => void;
    updateData: (newData: AnnotationData) => void; // 更新数据
    clearAutoSaveTimer: () => void; // 清理自动保存定时器
    registerAutoSaveTimerCleaner: (cleaner: () => void) => void; // 注册清理函数
}

// DataProvider Props
export interface DataProviderProps {
    children: React.ReactNode;
}
