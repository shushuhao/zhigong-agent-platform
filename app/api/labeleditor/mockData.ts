// 数据类型定义
export interface EntityLabel {
    id: string;
    name: string;
    color: string;
    order: number;
}

export interface RelationLabel {
    id: string;
    name: string;
    color: string;
    startEntityLabels: string[];
    targetEntityLabels: string[];
    order: number;
}

export interface EntityAnnotation {
    id: string;
    start: number;
    end: number;
    text: string;
    labelId: string;
    labelName: string;
    color: string;
    visible: boolean;        // 是否可见
    highlighted: boolean;    // 是否高亮
    selected: boolean;       // 是否选中
    canConnect: boolean;     // 是否可以连线
}

export interface RelationConnection {
    id: string;
    fromEntityId: string;
    toEntityId: string;
    relationId: string;
    relationName: string;
    color: string;           // 连线颜色
    visible: boolean;        // 是否可见
    canDelete: boolean;      // 是否可以删除
}

export interface TaskData {
    id: string;
    name: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface LabelsData {
    entityLabels: EntityLabel[];
    relationLabels: RelationLabel[];
}

export interface TaskResult {
    taskId: string;
    result: {
        entities: EntityAnnotation[];
        relations: RelationConnection[];
    };
    lastSaved: string;
}
// Mock实体标签数据
export const mockEntityLabels: EntityLabel[] = [
    {
        id: 'weapon',
        name: '武器名称',
        color: '#FF0000',
        order: 1
    },
    {
        id: 'parts_name',
        name: '零部件名称',
        color: '#00FF00',
        order: 2
    },
    {
        id: 'fault_description',
        name: '故障描述',
        color: '#0000FF',
        order: 3
    },
    {
        id: 'processing_method',
        name: '处理方式',
        color: '#FFFF00',
        order: 4
    }
];

// Mock关系标签数据
export const mockRelationLabels: RelationLabel[] = [
    {
        id: 'weapon_parts',
        name: '武器上的零部件',
        color: '#FF6B35',
        startEntityLabels: ['weapon'],
        targetEntityLabels: ['parts_name'],
        order: 1
    },
    {
        id: 'parts_fault',
        name: '零部件及故障描述',
        color: '#4ECDC4',
        startEntityLabels: ['parts_name'],
        targetEntityLabels: ['fault_description'],
        order: 2
    },
    {
        id: 'fault_processing',
        name: '故障描述及处理方式',
        color: '#45B7D1',
        startEntityLabels: ['fault_description'],
        targetEntityLabels: ['processing_method'],
        order: 3
    }
];

// Mock任务数据
export const mockTaskData: TaskData = {
    id: 'task_001',
    name: '武器故障标注任务',
    content: '某型号步枪在使用过程中出现了击发机构故障，具体表现为扳机无法正常回位，导致无法连续射击。经初步检查发现是击发机构中的复进簧出现了疲劳断裂，需要更换新的复进簧并对整个击发机构进行全面检修。',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
};

// Mock标签配置数据
export const mockLabelsData: LabelsData = {
    entityLabels: mockEntityLabels,
    relationLabels: mockRelationLabels
};

// Mock标注结果数据 - 包含完整的字段和连线约束测试
export const mockTaskResult: TaskResult = {
    taskId: 'task_001',
    result: {
        entities: [
            {
                id: 'entity_1',
                start: 5,
                end: 7,
                text: '步枪',
                labelId: 'weapon',
                labelName: '武器名称',
                color: '#FF0000',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            {
                id: 'entity_2',
                start: 15,
                end: 19,
                text: '击发机构',
                labelId: 'parts_name',
                labelName: '零部件名称',
                color: '#00FF00',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            {
                id: 'entity_3',
                start: 25,
                end: 29,
                text: '扳机',
                labelId: 'parts_name',
                labelName: '零部件名称',
                color: '#00FF00',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            {
                id: 'entity_4',
                start: 35,
                end: 41,
                text: '无法正常回位',
                labelId: 'fault_description',
                labelName: '故障描述',
                color: '#0000FF',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            {
                id: 'entity_5',
                start: 55,
                end: 58,
                text: '复进簧',
                labelId: 'parts_name',
                labelName: '零部件名称',
                color: '#00FF00',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            {
                id: 'entity_6',
                start: 62,
                end: 66,
                text: '疲劳断裂',
                labelId: 'fault_description',
                labelName: '故障描述',
                color: '#0000FF',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            {
                id: 'entity_7',
                start: 70,
                end: 76,
                text: '更换新的复进簧',
                labelId: 'processing_method',
                labelName: '处理方式',
                color: '#FFFF00',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            {
                id: 'entity_8',
                start: 80,
                end: 86,
                text: '全面检修',
                labelId: 'processing_method',
                labelName: '处理方式',
                color: '#FFFF00',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            }
        ],
        relations: [
            {
                id: 'relation_1',
                fromEntityId: 'entity_1',
                toEntityId: 'entity_2',
                relationId: 'weapon_parts',
                relationName: '武器上的零部件',
                color: '#FF6B35',
                visible: true,
                canDelete: true
            },
            {
                id: 'relation_2',
                fromEntityId: 'entity_1',
                toEntityId: 'entity_3',
                relationId: 'weapon_parts',
                relationName: '武器上的零部件',
                color: '#FF6B35',
                visible: true,
                canDelete: true
            },
            {
                id: 'relation_3',
                fromEntityId: 'entity_1',
                toEntityId: 'entity_5',
                relationId: 'weapon_parts',
                relationName: '武器上的零部件',
                color: '#FF6B35',
                visible: true,
                canDelete: true
            },
            {
                id: 'relation_4',
                fromEntityId: 'entity_3',
                toEntityId: 'entity_4',
                relationId: 'parts_fault',
                relationName: '零部件及故障描述',
                color: '#4ECDC4',
                visible: true,
                canDelete: true
            },
            {
                id: 'relation_5',
                fromEntityId: 'entity_5',
                toEntityId: 'entity_6',
                relationId: 'parts_fault',
                relationName: '零部件及故障描述',
                color: '#4ECDC4',
                visible: true,
                canDelete: true
            },
            {
                id: 'relation_6',
                fromEntityId: 'entity_6',
                toEntityId: 'entity_7',
                relationId: 'fault_processing',
                relationName: '故障描述及处理方式',
                color: '#45B7D1',
                visible: true,
                canDelete: true
            },
            {
                id: 'relation_7',
                fromEntityId: 'entity_2',
                toEntityId: 'entity_8',
                relationId: 'fault_processing',
                relationName: '故障描述及处理方式',
                color: '#45B7D1',
                visible: true,
                canDelete: true
            }
        ]
    },
    lastSaved: '2024-01-15T14:30:00Z'
};

// 创建连线约束测试数据
export const mockTaskResultWithConstraints: TaskResult = {
    taskId: 'task_002',
    result: {
        entities: [
            // 武器实体
            {
                id: 'entity_w1',
                start: 0,
                end: 4,
                text: '手枪',
                labelId: 'weapon',
                labelName: '武器名称',
                color: '#FF0000',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            // 零部件实体
            {
                id: 'entity_p1',
                start: 10,
                end: 14,
                text: '扳机',
                labelId: 'parts_name',
                labelName: '零部件名称',
                color: '#00FF00',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            {
                id: 'entity_p2',
                start: 20,
                end: 24,
                text: '枪管',
                labelId: 'parts_name',
                labelName: '零部件名称',
                color: '#00FF00',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            // 故障描述实体
            {
                id: 'entity_f1',
                start: 30,
                end: 34,
                text: '卡弹',
                labelId: 'fault_description',
                labelName: '故障描述',
                color: '#0000FF',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            },
            // 处理方式实体
            {
                id: 'entity_m1',
                start: 40,
                end: 44,
                text: '清洁',
                labelId: 'processing_method',
                labelName: '处理方式',
                color: '#FFFF00',
                visible: true,
                highlighted: false,
                selected: false,
                canConnect: true
            }
        ],
        relations: [
            // 可以连线的关系：武器 → 零部件
            {
                id: 'relation_valid_1',
                fromEntityId: 'entity_w1',
                toEntityId: 'entity_p1',
                relationId: 'weapon_parts',
                relationName: '武器上的零部件',
                color: '#FF6B35',
                visible: true,
                canDelete: true
            },
            // 可以连线的关系：零部件 → 故障描述
            {
                id: 'relation_valid_2',
                fromEntityId: 'entity_p1',
                toEntityId: 'entity_f1',
                relationId: 'parts_fault',
                relationName: '零部件及故障描述',
                color: '#4ECDC4',
                visible: true,
                canDelete: true
            },
            // 可以连线的关系：故障描述 → 处理方式
            {
                id: 'relation_valid_3',
                fromEntityId: 'entity_f1',
                toEntityId: 'entity_m1',
                relationId: 'fault_processing',
                relationName: '故障描述及处理方式',
                color: '#45B7D1',
                visible: true,
                canDelete: true
            }
        ]
    },
    lastSaved: '2024-01-15T16:00:00Z'
};

// ==================== 分类标注 Mock 数据 ====================

export interface FormField {
    id: string;
    name: string;
    type: 'radio' | 'checkbox' | 'input' | 'textarea' | 'select';
    label: string;
    required: boolean;
    placeholder?: string;
    maxLength?: number;
    options?: Array<{
        value: string;
        label: string;
        hasInput?: boolean;
    }>;
}

export interface ClassificationLabelsData {
    formFields: FormField[];
}

export const mockClassificationLabels: ClassificationLabelsData = {
    formFields: [
        {
            id: 'sentiment',
            name: 'sentiment',
            type: 'radio',
            label: '情感倾向',
            required: true,
            options: [
                { value: 'positive', label: '正面' },
                { value: 'negative', label: '负面' },
                { value: 'neutral', label: '中立' }
            ]
        },
        {
            id: 'category',
            name: 'category',
            type: 'select',
            label: '文本分类',
            required: true,
            placeholder: '请选择分类',
            options: [
                { value: 'news', label: '新闻' },
                { value: 'review', label: '评论' },
                { value: 'social', label: '社交媒体' },
                { value: 'other', label: '其他' }
            ]
        },
        {
            id: 'keywords',
            name: 'keywords',
            type: 'input',
            label: '关键词',
            required: false,
            placeholder: '请输入关键词，多个用逗号分隔',
            maxLength: 200
        },
        {
            id: 'notes',
            name: 'notes',
            type: 'textarea',
            label: '备注',
            required: false,
            placeholder: '请输入备注信息',
            maxLength: 500
        }
    ]
};

// ==================== 问答标注 Mock 数据 ====================

export interface QAPrompt {
    id: number;
    prompt: string;
    response?: string[][];
    required?: boolean;
}

export interface QALabelsData {
    prompts: QAPrompt[];
}

export const mockQALabels: QALabelsData = {
    prompts: [
        {
            id: 1,
            prompt: '这段文本的主要内容是什么？',
            required: true
        },
        {
            id: 2,
            prompt: '文本中提到了哪些关键实体？',
            required: true
        },
        {
            id: 3,
            prompt: '这段文本的情感倾向如何？',
            required: false
        },
        {
            id: 4,
            prompt: '还有其他需要补充的信息吗？',
            required: false
        }
    ]
};

// ==================== 排序标注 Mock 数据 ====================

export interface RankingItem {
    id: string;
    content: string;
    order: number;
}

export interface RankingPromptData {
    id: number;
    prompt: string;
    items: RankingItem[];
}

export interface RankingLabelsData {
    prompts: RankingPromptData[];
}

export const mockRankingLabels: RankingLabelsData = {
    prompts: [
        {
            id: 1,
            prompt: '请按相关性排序以下搜索结果',
            items: [
                { id: 'item_1', content: '完全匹配搜索关键词的结果', order: 1 },
                { id: 'item_2', content: '部分匹配搜索关键词的结果', order: 2 },
                { id: 'item_3', content: '包含相关概念的结果', order: 3 },
                { id: 'item_4', content: '间接相关的结果', order: 4 }
            ]
        },
        {
            id: 2,
            prompt: '请按重要性排序以下信息',
            items: [
                { id: 'item_5', content: '核心业务信息', order: 1 },
                { id: 'item_6', content: '重要支持信息', order: 2 },
                { id: 'item_7', content: '参考信息', order: 3 },
                { id: 'item_8', content: '补充说明', order: 4 }
            ]
        }
    ]
};

// 内存存储，模拟数据库
export const taskStorage = new Map<string, TaskResult>();
// 初始化测试数据
taskStorage.set('task_001', mockTaskResult);
taskStorage.set('task_002', mockTaskResultWithConstraints);
// 为了支持 URL 中的任务 ID (1407)，添加映射
taskStorage.set('1407', mockTaskResult);

