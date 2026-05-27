import { create } from 'zustand';

// 真实API返回的数据结构（基于现有项目）
export interface ApiEntityLabel {
    order_num: number;
    label_name_cn: string;
    label_name_en: string;
    label_shape: number;
    label_colour: string;
    label_info_attribute_groups: any;
}

export interface ApiRelationLabel {
    order_num: number;
    relation_name_cn: string;
    relation_name_en: string;
    start_entity_labels: string[];
    target_entity_labels: string[];
    color: string;
}

// 内部使用的数据结构
export interface EntityLabel {
    id: string; // 对应 label_name_en
    name: string; // 对应 label_name_cn
    color: string; // 对应 label_colour
    selected: boolean;
    order_num?: number;
}

export interface RelationLabel {
    id: string; // 对应 relation_name_en
    name: string; // 对应 relation_name_cn
    startEntityLabels: string[]; // 对应 start_entity_labels
    targetEntityLabels: string[]; // 对应 target_entity_labels
    selected: boolean;
    order_num?: number;
    color?: string;
}

export interface EntityAnnotation {
    id: string;
    start: number;
    end: number;
    text: string;
    labelId: string;
    labelName: string;
    color: string;
    visible: boolean;
    highlighted: boolean;
    selected: boolean; // 新增：是否被选中
}

export interface RelationConnection {
    id: string;
    fromEntityId: string;
    toEntityId: string;
    relationId: string;
    relationName: string;
    visible: boolean;
}

// 文本选择相关接口
export interface TextSelection {
    start: number;
    end: number;
    text: string;
    isValid: boolean;
}

// 数据转换函数（基于现有项目）
export const convertApiLabelsToEntityLabels = (apiLabels: ApiEntityLabel[]): EntityLabel[] =>
    apiLabels.map((label) => ({
        id: label.label_name_en,
        name: label.label_name_cn,
        color: label.label_colour,
        selected: false,
        order_num: label.order_num,
    }));

export const convertApiRelationsToRelationLabels = (apiRelations: ApiRelationLabel[]): RelationLabel[] =>
    apiRelations.map((relation) => ({
        id: relation.relation_name_en,
        name: relation.relation_name_cn,
        startEntityLabels: relation.start_entity_labels,
        targetEntityLabels: relation.target_entity_labels,
        selected: false,
        order_num: relation.order_num,
        color: relation.color || '#ff6b35',
    }));

// Store状态接口
interface EntityRelationState {
    // 基础数据
    taskId: string | null;
    taskName: string | null;
    content: string | null;
    entityLabels: EntityLabel[];
    relationLabels: RelationLabel[];
    entities: EntityAnnotation[];
    relations: RelationConnection[];

    // 文本选择相关状态
    selectedText: TextSelection | null;
    isSelecting: boolean;

    // 实体操作相关状态
    selectedEntityLabel: EntityLabel | null;
    hoveredEntityId: string | null;
    selectedEntityId: string | null;

    // UI状态
    showLabelPanel: boolean;
    labelPanelPosition: { x: number; y: number } | null;

    // 基础状态
    loading: boolean;
    error: string | null;

    // 基础Actions
    initializeWithData: (data: any) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;

    // 文本标注相关Actions
    setTextSelection: (selection: TextSelection | null) => void;
    setSelectedEntityLabel: (label: EntityLabel | null) => void;
    setHoveredEntity: (entityId: string | null) => void;
    setSelectedEntity: (entityId: string | null) => void;
    showEntityLabelPanel: (position: { x: number; y: number }) => void;
    hideLabelPanel: () => void;
    addEntityAnnotation: (annotation: Omit<EntityAnnotation, 'id'>) => void;
    removeEntityAnnotation: (entityId: string) => void;
    updateEntityAnnotation: (entityId: string, updates: Partial<EntityAnnotation>) => void;
}

// 完整的初始状态
const initialState = {
    // 基础数据
    taskId: null,
    taskName: null,
    content: null,
    entityLabels: [],
    relationLabels: [],
    entities: [],
    relations: [],

    // 文本选择相关状态的初始值
    selectedText: null,
    isSelecting: false,

    // 实体操作相关状态的初始值
    selectedEntityLabel: null,
    hoveredEntityId: null,
    selectedEntityId: null,

    // UI状态的初始值
    showLabelPanel: false,
    labelPanelPosition: null,

    // 基础状态
    loading: false,
    error: null,
};

// 创建Store
export const useEntityRelationStore = create<EntityRelationState>((set, get) => ({
    // 使用完整的初始状态
    ...initialState,

    // 数据初始化
    initializeWithData: (data: any) => {
        console.log('Store: 初始化数据', data);

        try {
            // 转换实体标签
            const entityLabels = data?.entityLabels 

            // 转换关系标签
            const relationLabels = data.relationLabels

            set({
                taskId: data.id,
                taskName: data.name,
                content: data.content,
                entityLabels,
                relationLabels,
                entities: data.entities || [],
                relations: data.relations || [],
                loading: false,
                error: null,
                // 重置所有新增状态到初始值
                selectedText: null,
                isSelecting: false,
                selectedEntityLabel: null,
                hoveredEntityId: null,
                selectedEntityId: null,
                showLabelPanel: false,
                labelPanelPosition: null,
            });
        } catch (error) {
            console.error('数据初始化失败:', error);
            set({
                error: '数据初始化失败',
                loading: false
            });
        }
    },

    // 设置加载状态
    setLoading: (loading: boolean) => {
        set({ loading });
    },

    // 设置错误状态
    setError: (error: string | null) => {
        set({ error, loading: false });
    },

    // 文本标注相关Actions
    setTextSelection: (selection: TextSelection | null) => {
        set({ selectedText: selection });
    },

    setSelectedEntityLabel: (label: EntityLabel | null) => {
        set({ selectedEntityLabel: label });
    },

    setHoveredEntity: (entityId: string | null) => {
        set({ hoveredEntityId: entityId });
    },

    setSelectedEntity: (entityId: string | null) => {
        set({ selectedEntityId: entityId });
    },

    showEntityLabelPanel: (position: { x: number; y: number }) => {
        set({
            showLabelPanel: true,
            labelPanelPosition: position
        });
    },

    hideLabelPanel: () => {
        set({
            showLabelPanel: false,
            labelPanelPosition: null
        });
    },

    addEntityAnnotation: (annotation: Omit<EntityAnnotation, 'id'>) => {
        const state = get();
        const newEntity: EntityAnnotation = {
            ...annotation,
            id: `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            visible: true,
            highlighted: false,
            selected: false,
        };

        set({
            entities: [...state.entities, newEntity],
            selectedText: null,
            showLabelPanel: false,
            labelPanelPosition: null
        });

        console.log('添加实体标注:', newEntity);
    },

    removeEntityAnnotation: (entityId: string) => {
        const state = get();
        const updatedEntities = state.entities.filter(entity => entity.id !== entityId);

        set({
            entities: updatedEntities,
            selectedEntityId: state.selectedEntityId === entityId ? null : state.selectedEntityId
        });

        console.log('删除实体标注:', entityId);
    },

    updateEntityAnnotation: (entityId: string, updates: Partial<EntityAnnotation>) => {
        const state = get();
        const updatedEntities = state.entities.map(entity =>
            entity.id === entityId ? { ...entity, ...updates } : entity
        );

        set({ entities: updatedEntities });

        console.log('更新实体标注:', entityId, updates);
    },

    // 重置状态
    reset: () => {
        set(initialState);
    },
}));