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

// 新的排序标注数据接口（适配新的API格式）
export interface RankingData {
    id?: string;
    name?: string;
    title?: string;
    items?: any[];
    lastSaved?: string;
    createdAt?: string;
    updatedAt?: string;
    content: string; // 左侧显示的内容
    type: string; // 如 "TEXT_SORT"
    prompts: RankingPrompt[]; // 右侧的排序内容
}

// 旧的排序项接口（保留兼容性）
export interface RankingItem {
    id: string;
    content: string;
    order: number;
}

// 排序标注状态接口
export interface RankingState {
    data: RankingData | null;
    loading: boolean;
    error: string | null;
    items: RankingItem[]; // 当前排序状态

    // 基础方法
    loadData: (id: string) => Promise<void>;
    updateItemOrder: (items: RankingItem[]) => void;
    submitRanking: () => Promise<void>;
    saveData: () => Promise<void>;
    initializeWithData: (data: RankingData) => void;

    // Header组件兼容性方法
    submitAnnotation: () => Promise<void>;
    noAnnotationRequired: boolean;
    toggleNoAnnotationRequired: () => void;
    autoSave: () => Promise<void>;
}
