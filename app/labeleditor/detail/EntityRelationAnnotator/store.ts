import { create } from 'zustand';
import { message } from 'antd';
import React from 'react';

// 真实API返回的实体标签数据结构
export interface ApiEntityLabel {
    order_num: number;
    label_name_cn: string;
    label_name_en: string;
    label_shape: number;
    label_colour: string;
    label_info_attribute_groups: any;
}

// 真实API返回的关系标签数据结构
export interface ApiRelationLabel {
    order_num: number;
    relation_name_cn: string;
    relation_name_en: string;
    start_entity_labels: string[];
    target_entity_labels: string[];
    color: string;
}

// 真实API返回的标签数据结构
export interface ApiLabelsResponse {
    code: number;
    message: string;
    requestId: string;
    data: {
        file_labels: any;
        labels: ApiEntityLabel[];
        entity_relations: ApiRelationLabel[];
    };
}

// 实体标签定义（内部使用）
export interface EntityLabel {
    id: string; // 对应 label_name_en
    name: string; // 对应 label_name_cn
    color: string; // 对应 label_colour
    selected: boolean;
    order_num?: number; // 保留排序信息
}

// 关系标签定义（内部使用）
export interface RelationLabel {
    id: string; // 对应 relation_name_en
    name: string; // 对应 relation_name_cn
    entityLabelIds: string[]; // 合并 start_entity_labels 和 target_entity_labels
    startEntityLabels: string[]; // 保留原始的起始实体标签
    targetEntityLabels: string[]; // 保留原始的目标实体标签
    selected: boolean;
    order_num?: number; // 保留排序信息
    color?: string; // 关系颜色
}

// 实体标注
export interface EntityAnnotation {
    id: string;
    start: number;
    end: number;
    text: string;
    labelId: string;
    labelName: string;
    color: string;
    visible: boolean;
    highlighted: boolean; // 是否高亮显示
}

// 关系连线
export interface RelationConnection {
    id: string;
    fromEntityId: string;
    toEntityId: string;
    relationId: string;
    relationName: string;
    visible: boolean;
}

// 动态表单字段
export interface FormField {
    id: string;
    name: string;
    type: 'input' | 'textarea' | 'select' | 'checkbox';
    label: string;
    value: any;
    options?: { label: string; value: any }[];
    required?: boolean;
}

// 标注数据结构
export interface AnnotationData {
    id: string;
    name: string; // 标注名称
    content: string;
    entityLabels: EntityLabel[];
    relationLabels: RelationLabel[];
    entities: EntityAnnotation[];
    relations: RelationConnection[];
    dynamicForm: FormField[];
    lastSaved: string;
    createdAt: string;
    updatedAt: string;
    progress: {
        totalCharacters: number;
        annotatedCharacters: number;
        percentage: number;
    };
}

// 选择范围
export interface SelectionRange {
    start: number;
    end: number;
}

// 数据转换工具函数
export const convertApiLabelsToEntityLabels = (apiLabels: ApiEntityLabel[]): EntityLabel[] => apiLabels.map((label) => ({
    id: label.label_name_en,
    name: label.label_name_cn,
    color: label.label_colour,
    selected: false,
    order_num: label.order_num,
}));

export const convertApiRelationsToRelationLabels = (apiRelations: ApiRelationLabel[]): RelationLabel[] => apiRelations.map((relation) => ({
    id: relation.relation_name_en,
    name: relation.relation_name_cn,
    entityLabelIds: [
        ...relation.start_entity_labels,
        ...relation.target_entity_labels,
    ],
    startEntityLabels: relation.start_entity_labels,
    targetEntityLabels: relation.target_entity_labels,
    selected: false,
    order_num: relation.order_num,
    color: relation.color || '#ff6b35', // 默认关系连线颜色
}));

// Zustand 状态接口
interface EntityRelationState {
    // 数据相关
    data: AnnotationData | null;

    // 选择状态
    selectedEntityLabelId: string | null;
    selectedRelationLabelId: string | null;
    selectedText: string;
    selectionRange: SelectionRange | null;

    // 连线状态
    connecting: boolean;
    connectingFromId: string | null;

    // UI状态
    loading: boolean;
    error: string | null;
    lastSaved: string | null;

    // 新增UI状态
    continuousAnnotation: boolean; // 连续标注开关
    entityPanelExpanded: { [labelId: string]: boolean }; // 实体标签面板展开状态
    relationPanelExpanded: { [labelId: string]: boolean }; // 关系标签面板展开状态
    showEntityDropdown: boolean; // 是否显示实体选择下拉框
    dropdownPosition: { x: number; y: number } | null; // 下拉框位置

    // 关系选择菜单状态
    showRelationMenu: boolean;
    relationMenuPosition: { x: number; y: number } | null;
    pendingConnection: { fromEntityId: string; toEntityId: string } | null;
    hoveredRelationId: string | null; // 悬浮的关系ID（用于在文本中高亮显示连接线）
    showTutorial: boolean; // 是否显示使用教程
    lastSaveTime: string; // 最后保存时间

    // Actions
    loadData: (id: string) => void;
    initializeWithData: (data: AnnotationData) => void;
    initializeWithApiData: (data: AnnotationData, apiLabelsData?: ApiLabelsResponse) => void;
    selectEntityLabel: (labelId: string) => void;
    selectRelationLabel: (labelId: string) => void;
    updateRelationLabels: () => void;
    highlightRelatedEntities: (relationId: string) => void;
    handleTextSelection: (text: string, range: SelectionRange | null) => void;
    addEntityAnnotation: (labelId?: string) => void; // 支持指定标签ID
    toggleEntityVisibility: (entityId: string) => void;
    deleteEntity: (entityId: string) => void;
    startConnection: (entityId: string) => void;
    completeConnection: (toEntityId: string) => void;
    cancelConnection: () => void;
    showRelationSelectionMenu: (fromEntityId: string, toEntityId: string, position: { x: number; y: number }) => void;
    hideRelationMenu: () => void;
    selectRelationAndConnect: (relationId: string) => void;
    toggleRelationVisibility: (relationId: string) => void;
    deleteRelation: (relationId: string) => void;
    autoSave: () => Promise<void>;
    saveData: (isManual?: boolean) => Promise<void>;
    setSaveDataFunction: (saveDataFn: (isManual?: boolean) => Promise<void>) => void;

    // 新增Actions
    toggleContinuousAnnotation: () => void;
    toggleEntityPanelExpanded: (labelId: string) => void;
    toggleRelationPanelExpanded: (labelId: string) => void;
    showEntitySelectionDropdown: (position: { x: number; y: number }) => void;
    hideEntitySelectionDropdown: () => void;
    setHoveredRelation: (relationId: string | null) => void;
    calculateProgress: () => void;
    submitAnnotation: () => Promise<void>;
    showTutorialModal: () => void;
    hideTutorialModal: () => void;
    updateSaveTime: () => void;
}

// 创建 Zustand store
export const useEntityRelationStore = create<EntityRelationState>((set, get) => ({
    // 初始状态
    data: null,
    selectedEntityLabelId: null,
    selectedRelationLabelId: null,
    selectedText: '',
    selectionRange: null,
    connecting: false,
    connectingFromId: null,
    loading: false,
    error: null,
    lastSaved: null,

    // 新增UI状态初始值
    continuousAnnotation: false,
    entityPanelExpanded: {},
    relationPanelExpanded: {},
    showEntityDropdown: false,
    dropdownPosition: null,
    showRelationMenu: false,
    relationMenuPosition: null,
    pendingConnection: null,
    hoveredRelationId: null,
    showTutorial: false,
    lastSaveTime: '',

    // Actions
    loadData: (id: string) => {
        set({ loading: true, error: null });

        // 模拟异步加载
        setTimeout(() => {
            try {
                // Mock数据 - 实际应该调用API
                const content = '产线A-03空压机在2026年5月27日08:15触发高温告警，边缘网关GW-07通过Modbus TCP采集到排气温度96℃、振动RMS 8.2mm/s。运维工程师张工在一车间确认冷却风扇转速异常，并创建工单WO-20260527-001。';

                const mockData: AnnotationData = {
                    id,
                    name: '实体关系标注任务 - 设备告警工单',
                    content,
                    entityLabels: [
                        {
                            id: '1', name: '设备', color: '#1890ff', selected: false,
                        },
                        {
                            id: '2', name: '产线/位置', color: '#52c41a', selected: false,
                        },
                        {
                            id: '3', name: '告警', color: '#faad14', selected: false,
                        },
                        {
                            id: '4', name: '采集网关', color: '#f5222d', selected: false,
                        },
                    ],
                    relationLabels: [
                        {
                            id: 'r1',
                            name: '位于',
                            entityLabelIds: ['1', '4'],
                            startEntityLabels: ['1'],
                            targetEntityLabels: ['4'],
                            selected: false,
                        }, // 设备和产线之间
                        {
                            id: 'r2',
                            name: '位于',
                            entityLabelIds: ['4', '2'],
                            startEntityLabels: ['4'],
                            targetEntityLabels: ['2'],
                            selected: false,
                        }, // 网关和位置之间
                        {
                            id: 'r3',
                            name: '触发',
                            entityLabelIds: ['1', '3'],
                            startEntityLabels: ['1'],
                            targetEntityLabels: ['3'],
                            selected: false,
                        }, // 设备和告警之间
                        {
                            id: 'r4',
                            name: '不可用关系',
                            entityLabelIds: [],
                            startEntityLabels: [],
                            targetEntityLabels: [],
                            selected: false,
                        }, // 测试不可连接的关系
                    ],
                    entities: [
                        {
                            id: 'entity1',
                            start: 0,
                            end: 6,
                            text: '产线A-03',
                            labelId: '2',
                            labelName: '产线/位置',
                            color: '#52c41a',
                            visible: true,
                            highlighted: false,
                        },
                        {
                            id: 'entity2',
                            start: 6,
                            end: 9,
                            text: '空压机',
                            labelId: '1',
                            labelName: '设备',
                            color: '#1890ff',
                            visible: true,
                            highlighted: false,
                        },
                        {
                            id: 'entity3',
                            start: 27,
                            end: 31,
                            text: '高温告警',
                            labelId: '3',
                            labelName: '告警',
                            color: '#1890ff',
                            visible: true,
                            highlighted: false,
                        },
                        {
                            id: 'entity4',
                            start: 32,
                            end: 41,
                            text: '边缘网关GW-07',
                            labelId: '4',
                            labelName: '采集网关',
                            color: '#52c41a',
                            visible: true,
                            highlighted: false,
                        },
                        {
                            id: 'entity5',
                            start: 86,
                            end: 89,
                            text: '一车间',
                            labelId: '2',
                            labelName: '产线/位置',
                            color: '#52c41a',
                            visible: true,
                            highlighted: false,
                        },
                        {
                            id: 'entity6',
                            start: 43,
                            end: 53,
                            text: 'Modbus TCP',
                            labelId: '4',
                            labelName: '采集网关',
                            color: '#f5222d',
                            visible: true,
                            highlighted: false,
                        },
                    ],
                    relations: [
                        {
                            id: 'relation1',
                            fromEntityId: 'entity2',
                            toEntityId: 'entity1',
                            relationId: 'r1',
                            relationName: '位于',
                            visible: true,
                        },
                        {
                            id: 'relation2',
                            fromEntityId: 'entity2',
                            toEntityId: 'entity6',
                            relationId: 'r3',
                            relationName: '触发',
                            visible: true,
                        },
                    ],
                    dynamicForm: [
                        {
                            id: 'f1', name: 'title', type: 'input', label: '标题', value: '', required: true,
                        },
                        {
                            id: 'f2', name: 'description', type: 'textarea', label: '描述', value: '',
                        },
                        {
                            id: 'f3',
                            name: 'category',
                            type: 'select',
                            label: '分类',
                            value: '',
                            options: [
                                { label: '设备告警', value: 'alarm' },
                                { label: '工单处理', value: 'work_order' },
                            ],
                        },
                    ],
                    lastSaved: new Date().toISOString(),
                    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前创建
                    updatedAt: new Date().toISOString(),
                    progress: {
                        totalCharacters: content.length,
                        annotatedCharacters: 0, // 将在calculateProgress中计算
                        percentage: 0,
                    },
                };

                set({ data: mockData, loading: false });

                // 计算初始进度
                setTimeout(() => {
                    get().calculateProgress();
                }, 100);
            } catch (error) {
                set({ error: '加载数据失败', loading: false });
            }
        }, 500);
    },

    selectEntityLabel: (labelId: string) => {
        const { data } = get();
        if (!data) return;

        const updatedLabels = data.entityLabels.map((label: EntityLabel) => ({
            ...label,
            selected: label.id === labelId ? !label.selected : false,
        }));

        set({
            data: { ...data, entityLabels: updatedLabels },
            selectedEntityLabelId: labelId,
            selectedRelationLabelId: null,
        });

        // 更新关系标签状态
        get().updateRelationLabels();
    },

    selectRelationLabel: (labelId: string) => {
        const { data } = get();
        if (!data) return;

        const currentLabel = data.relationLabels.find((label: RelationLabel) => label.id === labelId);
        const wasSelected = currentLabel?.selected;

        const updatedLabels = data.relationLabels.map((label: RelationLabel) => ({
            ...label,
            selected: label.id === labelId ? !label.selected : false,
        }));

        const finalSelectedId = wasSelected ? null : labelId;

        set({
            data: { ...data, relationLabels: updatedLabels },
            selectedRelationLabelId: finalSelectedId,
            selectedEntityLabelId: null,
            // 取消连线状态
            connecting: false,
            connectingFromId: null,
        });

        // 高亮相关实体或清除高亮
        if (finalSelectedId) {
            get().highlightRelatedEntities(finalSelectedId);
        } else {
            // 清除所有高亮
            const clearedEntities = data.entities.map((entity: EntityAnnotation) => ({
                ...entity,
                highlighted: false,
            }));
            set({
                data: { ...data, entities: clearedEntities, relationLabels: updatedLabels },
            });
        }
    },

    updateRelationLabels: () => {
        const { data } = get();
        if (!data) return;

        const updatedRelationLabels = data.relationLabels.map((relation: RelationLabel) => ({
            ...relation,
            selected: false,
        }));

        set({
            data: { ...data, relationLabels: updatedRelationLabels },
        });
    },

    highlightRelatedEntities: (relationId: string) => {
        const { data } = get();
        if (!data) return;

        const relation = data.relationLabels.find((r: RelationLabel) => r.id === relationId);
        if (!relation) return;

        const updatedEntities = data.entities.map((entity: EntityAnnotation) => ({
            ...entity,
            highlighted: relation.entityLabelIds.includes(entity.labelId),
        }));

        set({
            data: { ...data, entities: updatedEntities },
        });
    },

    handleTextSelection: (text: string, range: SelectionRange | null) => {
        set({
            selectedText: text,
            selectionRange: range,
        });
    },
    // 在store中添加一个新的直接更新方法：
    addEntityDirectly: (entity: EntityAnnotation) => {
        const { data } = get();
        if (!data) return;

        const updatedEntities = [...data.entities, entity];

        set({
            data: {
                ...data,
                entities: updatedEntities,
                updatedAt: new Date().toISOString(),
            },
        });

        // 自动保存
        get().autoSave();
    },

    // 改进的 addEntityAnnotation 方法
    addEntityAnnotation: (labelId?: string) => {
        console.log('=== Store addEntityAnnotation 开始 ===');

        const state = get();
        const {
            data, selectionRange, selectedText, selectedEntityLabelId,
        } = state;
        const targetLabelId = labelId || selectedEntityLabelId;

        console.log('Store 当前状态:', {
            hasData: !!data,
            hasSelectionRange: !!selectionRange,
            hasSelectedText: !!selectedText,
            targetLabelId,
            currentEntitiesCount: data?.entities.length,
        });

        // 严格验证所有必需参数
        if (!data || !selectionRange || !selectedText || !targetLabelId) {
            console.error('Store: 参数验证失败', {
                hasData: !!data,
                hasSelectionRange: !!selectionRange,
                hasSelectedText: !!selectedText,
                hasTargetLabelId: !!targetLabelId,
            });
            // 清理状态
            set({
                selectedText: '',
                selectionRange: null,
                showEntityDropdown: false,
                dropdownPosition: null,
            });
            return;
        }

        const selectedLabel = data.entityLabels.find((label) => label.id === targetLabelId);
        if (!selectedLabel) {
            console.error('Store: 未找到标签', targetLabelId);
            // 清理状态
            set({
                selectedText: '',
                selectionRange: null,
                showEntityDropdown: false,
                dropdownPosition: null,
            });
            return;
        }

        // 检查重叠实体
        const overlappingEntity = data.entities.find((entity) => (entity.start === selectionRange.start && entity.end === selectionRange.end) ||
    (entity.start < selectionRange.end && entity.end > selectionRange.start),
        );

        let updatedEntities: EntityAnnotation[];

        if (overlappingEntity) {
            if (overlappingEntity.start === selectionRange.start &&
        overlappingEntity.end === selectionRange.end) {
                if (overlappingEntity.labelId === selectedLabel.id) {
                    console.log('Store: 相同标签已存在，跳过');
                    message.info('该文本已经标注为相同类型');
                    // 清理状态
                    set({
                        selectedText: '',
                        selectionRange: null,
                        showEntityDropdown: false,
                        dropdownPosition: null,
                    });
                    return;
                }

                // 更新现有实体的标签
                updatedEntities = data.entities.map((entity) => (entity.id === overlappingEntity.id ?
                    {
                        ...entity,
                        labelId: selectedLabel.id,
                        labelName: selectedLabel.name,
                        color: selectedLabel.color,
                    } :
                    entity),
                );

                message.success(`已将"${selectedText}"的标签更改为"${selectedLabel.name}"`);
            } else {
                // 部分重叠，阻止创建
                console.log('Store: 部分重叠，取消操作');
                message.warning('选择的文本与现有实体重叠');
                // 清理状态
                set({
                    selectedText: '',
                    selectionRange: null,
                    showEntityDropdown: false,
                    dropdownPosition: null,
                });
                return;
            }
        } else {
            // 创建新实体
            const newEntity: EntityAnnotation = {
                id: `entity_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                start: selectionRange.start,
                end: selectionRange.end,
                text: selectedText,
                labelId: selectedLabel.id,
                labelName: selectedLabel.name,
                color: selectedLabel.color,
                visible: true,
                highlighted: false,
            };

            updatedEntities = [...data.entities, newEntity];
        }

        // 自动展开对应的实体标签面板
        const { entityPanelExpanded } = get();
        const updatedEntityPanelExpanded = {
            ...entityPanelExpanded,
            [selectedLabel.id]: true, // 自动展开新创建实体对应的标签面板
        };

        // 一次性更新状态
        const updatedData = {
            ...data,
            entities: updatedEntities,
            updatedAt: new Date().toISOString(),
        };

        // 重要：在状态更新时同时清理选择相关状态
        set({
            data: updatedData,
            selectedText: '', // 清除选中文本
            selectionRange: null, // 清除选择范围
            showEntityDropdown: false, // 关闭下拉菜单
            dropdownPosition: null, // 清除下拉菜单位置
            entityPanelExpanded: updatedEntityPanelExpanded, // 自动展开对应的标签面板
        });

        console.log('Store: 状态更新完成，实体数量:', updatedEntities.length, new Date().toISOString());
        console.log('Store: 新增实体详情:', updatedEntities[updatedEntities.length - 1]);
        console.log('Store: showEntityDropdown 已设置为 false');
        console.log('Store: 所有实体:', updatedEntities.map((e) => ({
            id: e.id,
            text: e.text,
            labelName: e.labelName,
            start: e.start,
            end: e.end,
            visible: e.visible,
        })));

        // 异步保存和计算进度
        setTimeout(() => {
            get().calculateProgress();
            get().autoSave();
        }, 0);

        console.log('=== Store addEntityAnnotation 完成 ===');
    },
    toggleEntityVisibility: (entityId: string) => {
        const { data } = get();
        if (!data) return;

        const updatedEntities = data.entities.map((entity: EntityAnnotation) => (entity.id === entityId ? { ...entity, visible: !entity.visible } : entity),
        );

        set({
            data: { ...data, entities: updatedEntities },
        });
    },

    deleteEntity: (entityId: string) => {
        const { data } = get();
        if (!data) return;

        const updatedEntities = data.entities.filter((entity: EntityAnnotation) => entity.id !== entityId);
        const updatedRelations = data.relations.filter((relation: RelationConnection) => relation.fromEntityId !== entityId && relation.toEntityId !== entityId,
        );

        set({
            data: {
                ...data,
                entities: updatedEntities,
                relations: updatedRelations,
            },
        });

        // 自动保存
        get().autoSave();
    },

    startConnection: (entityId: string) => {
        console.log('Store: Starting connection from entity:', entityId);
        set({
            connecting: true,
            connectingFromId: entityId,
        });
    },

    completeConnection: (toEntityId: string) => {
        console.log('Store: Attempting to complete connection to:', toEntityId);
        const { connecting, connectingFromId, data } = get();

        console.log('Store state:', { connecting, connectingFromId, hasData: !!data });

        if (!connecting || !connectingFromId || !data) {
            console.log('Store: Invalid state, resetting connection');
            set({ connecting: false, connectingFromId: null });
            return;
        }

        // 不允许自己连自己
        if (connectingFromId === toEntityId) {
            set({ connecting: false, connectingFromId: null });
            message.warning('不能连接到自身');
            return;
        }

        // 获取目标实体的位置来显示关系选择菜单，使用与RelationConnector相同的过滤逻辑
        const allTargetElements = document.querySelectorAll(`[data-entity-id="${toEntityId}"]`);

        // 过滤出主文本编辑器中的元素
        const targetElements = Array.from(allTargetElements).filter((el) => {
            const element = el as HTMLElement;
            const isInCollapseContent = element.closest('.ant-collapse-content, .collapseContent');
            const isInMainEditor = element.closest('.text-editor-container, .editor-content, .ql-editor');
            return !isInCollapseContent || !!isInMainEditor;
        });

        if (targetElements.length === 0) {
            set({ connecting: false, connectingFromId: null });
            message.error('无法找到目标实体');
            return;
        }

        // 如果有多个元素，尝试找到正确的那个
        let targetElement = targetElements[0] as HTMLElement;
        const toEntity = data.entities.find((e) => e.id === toEntityId);

        if (targetElements.length > 1 && toEntity) {
            console.log(`目标实体 ${toEntityId} 有 ${targetElements.length} 个过滤后的DOM元素，尝试匹配正确的元素`);

            for (let i = 0; i < targetElements.length; i++) {
                const element = targetElements[i] as HTMLElement;
                const elementText = element.textContent || '';
                const rect = element.getBoundingClientRect();

                console.log(`  检查元素 ${i + 1}:`, {
                    text: elementText.substring(0, 20),
                    expected: toEntity.text.substring(0, 20),
                    visible: rect.width > 0 && rect.height > 0,
                    rect: {
                        x: rect.left, y: rect.top, w: rect.width, h: rect.height,
                    },
                });

                // 选择可见的、文本匹配的、在主文本区域的元素
                const isTextMatch = elementText.includes(toEntity.text) || toEntity.text.includes(elementText);
                const isVisible = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0;
                const collapseContent = element.closest('.ant-collapse-content') as HTMLElement;
                const isInMainContent = !collapseContent || collapseContent.style.maxHeight !== '0px';

                if (isTextMatch && isVisible && isInMainContent) {
                    console.log(`  ✅ 找到最佳匹配的目标元素 ${i + 1}`);
                    targetElement = element;
                    break;
                }
            }
        }

        const rect = targetElement.getBoundingClientRect();

        // 使用与RelationConnector相同的精确位置计算逻辑
        let textCenterX = rect.left + rect.width / 2;
        let textBottomY = rect.bottom;

        // 尝试获取更精确的文本位置，处理跨行文本
        try {
            const range = document.createRange();
            const textNode = targetElement.firstChild;

            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                range.selectNodeContents(textNode);
                const textRect = range.getBoundingClientRect();

                if (textRect.width > 0 && textRect.height > 0) {
                    // 检查是否为跨行文本
                    const lineHeight = 20; // 估算单行高度
                    const isMultiLine = textRect.height > lineHeight * 1.5;

                    if (isMultiLine) {
                        // 跨行文本：找到第一行的中心位置
                        console.log(`🎯 RelationSelect位置计算：检测到跨行实体 ${toEntityId}，寻找第一行中心位置`);

                        try {
                            // 尝试获取第一行的位置
                            const text = textNode.textContent || '';
                            let firstLineEndIndex = text.length;

                            // 从文本开始逐个字符检查，找到第一行结束的位置
                            for (let i = 1; i <= text.length; i++) {
                                range.setStart(textNode, 0);
                                range.setEnd(textNode, i);
                                const partialRect = range.getBoundingClientRect();

                                // 如果高度突然增加，说明换行了
                                if (partialRect.height > lineHeight * 1.2) {
                                    firstLineEndIndex = i - 1;
                                    break;
                                }
                            }

                            // 获取第一行的边界框
                            range.setStart(textNode, 0);
                            range.setEnd(textNode, Math.max(1, firstLineEndIndex));
                            const firstLineRect = range.getBoundingClientRect();

                            textCenterX = firstLineRect.left + firstLineRect.width / 2;
                            textBottomY = firstLineRect.bottom;

                            console.log('跨行文本RelationSelect位置（第一行中心）:', {
                                entityId: toEntityId,
                                text: text.substring(0, firstLineEndIndex),
                                firstLineEndIndex,
                                firstLineRect,
                                calculatedPosition: { textCenterX, textBottomY },
                            });
                        } catch (error) {
                            console.error('第一行位置计算失败，使用容器中心:', error);
                            // 回退到使用容器的中心
                            textCenterX = rect.left + rect.width / 2;
                            textBottomY = rect.bottom;
                        }
                    } else {
                        // 单行文本：使用文本的实际位置
                        textCenterX = textRect.left + textRect.width / 2;
                        textBottomY = textRect.bottom;

                        console.log('单行文本RelationSelect位置:', {
                            entityId: toEntityId,
                            textRect,
                            calculatedPosition: { textCenterX, textBottomY },
                        });
                    }
                }
            }
        } catch (error) {
            console.log('无法获取精确文本位置，使用元素位置');
        }

        // 添加调试信息
        console.log('🎯 RelationSelect位置计算:', {
            targetElement: targetElement.textContent?.substring(0, 20),
            elementRect: {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
            },
            calculatedPosition: {
                textCenterX,
                textBottomY,
            },
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
        });

        // 使用精确计算的位置，RelationSelect使用fixed定位
        const position = {
            x: textCenterX,
            y: textBottomY + 10, // 文本下方10px
        };

        console.log('🎯 计算出的菜单位置:', position);

        // 显示关系选择菜单
        get().showRelationSelectionMenu(connectingFromId, toEntityId, position);
    },

    cancelConnection: () => {
        set({
            connecting: false,
            connectingFromId: null,
            showRelationMenu: false,
            relationMenuPosition: null,
            pendingConnection: null,
        });
    },

    showRelationSelectionMenu: (fromEntityId: string, toEntityId: string, position: { x: number; y: number }) => {
        set({
            showRelationMenu: true,
            relationMenuPosition: position,
            pendingConnection: { fromEntityId, toEntityId },
        });
    },

    hideRelationMenu: () => {
        set({
            showRelationMenu: false,
            relationMenuPosition: null,
            pendingConnection: null,
        });
    },

    selectRelationAndConnect: (relationId: string) => {
        const { pendingConnection, data } = get();

        if (!pendingConnection || !data) {
            get().hideRelationMenu();
            return;
        }

        const { fromEntityId, toEntityId } = pendingConnection;
        const selectedRelation = data.relationLabels.find((r: RelationLabel) => r.id === relationId);

        if (!selectedRelation) {
            message.error('关系类型不存在');
            get().hideRelationMenu();
            return;
        }

        const fromEntity = data.entities.find((e: EntityAnnotation) => e.id === fromEntityId);
        const toEntity = data.entities.find((e: EntityAnnotation) => e.id === toEntityId);

        if (!fromEntity || !toEntity) {
            message.error('实体不存在');
            get().hideRelationMenu();
            return;
        }

        // 检查关系标签是否允许这两种实体类型 - 根据真实API数据结构验证
        let isValidRelation = false;

        if (selectedRelation.startEntityLabels && selectedRelation.targetEntityLabels) {
            // 严格验证：fromEntity必须在startEntityLabels中，toEntity必须在targetEntityLabels中
            isValidRelation = selectedRelation.startEntityLabels.includes(fromEntity.labelId) &&
                       selectedRelation.targetEntityLabels.includes(toEntity.labelId);
        } else {
            // 兼容旧数据：使用entityLabelIds进行验证
            isValidRelation = selectedRelation.entityLabelIds.includes(fromEntity.labelId) &&
                       selectedRelation.entityLabelIds.includes(toEntity.labelId);
        }

        if (!isValidRelation) {
            message.warning(`关系"${selectedRelation.name}"不支持"${fromEntity.labelName}"和"${toEntity.labelName}"之间的连接`);
            get().hideRelationMenu();
            return;
        }

        // 检查是否已存在相同的关系
        const existingRelation = data.relations.find((rel: RelationConnection) => rel.fromEntityId === fromEntityId &&
      rel.toEntityId === toEntityId &&
      rel.relationId === selectedRelation.id,
        );

        if (existingRelation) {
            message.warning({
                content: '该关系已存在',
                icon: React.createElement('svg',
                    {
                        width: '14',
                        height: '14',
                        viewBox: '0 0 14 14',
                        fill: 'none',
                        xmlns: 'http://www.w3.org/2000/svg',
                        style: { marginRight: '4px' },
                    },
                    React.createElement('path', {
                        fillRule: 'evenodd',
                        clipRule: 'evenodd',
                        d: 'M0.333984 6.99998C0.333984 3.31808 3.31875 0.333313 7.00065 0.333313C10.6826 0.333313 13.6673 3.31808 13.6673 6.99998C13.6673 10.6819 10.6826 13.6666 7.00065 13.6666C3.31875 13.6666 0.333984 10.6819 0.333984 6.99998ZM6.33398 8.99998V10.3333H7.66732V8.99998H6.33398ZM7.66732 8.33331L7.66732 3.66665H6.33399L6.33398 8.33331H7.66732Z',
                        fill: '#F97316',
                    }),
                ),
            });
            get().hideRelationMenu();
            return;
        }

        const newRelation: RelationConnection = {
            id: Date.now().toString(),
            fromEntityId,
            toEntityId,
            relationId: selectedRelation.id,
            relationName: selectedRelation.name,
            visible: true,
        };

        set({
            data: {
                ...data,
                relations: [...data.relations, newRelation],
            },
            connecting: false,
            connectingFromId: null,
            showRelationMenu: false,
            relationMenuPosition: null,
            pendingConnection: null,
        });

        // 强制触发RelationConnector重新计算位置
        console.log('🔄 关系创建完成，触发位置重新计算');

        // 延迟一点时间确保状态更新完成
        setTimeout(() => {
            // 触发一个自定义事件来通知RelationConnector重新计算位置
            window.dispatchEvent(new CustomEvent('relationCreated', {
                detail: { relationId: newRelation.id },
            }));
        }, 50);

        // 自动保存
        get().autoSave();
    },

    toggleRelationVisibility: (relationId: string) => {
        const { data } = get();
        if (!data) return;

        const updatedRelations = data.relations.map((relation: RelationConnection) => (relation.id === relationId ? { ...relation, visible: !relation.visible } : relation),
        );

        set({
            data: { ...data, relations: updatedRelations },
        });

        // 自动保存
        get().autoSave();
    },

    deleteRelation: (relationId: string) => {
        const { data, hoveredRelationId } = get();
        if (!data) return;

        const updatedRelations = data.relations.filter((relation: RelationConnection) => relation.id !== relationId);

        set({
            data: {
                ...data,
                relations: updatedRelations,
            },
            // 如果删除的是当前悬浮的关系，清除悬浮状态
            hoveredRelationId: hoveredRelationId === relationId ? null : hoveredRelationId,
        });

        // 自动保存
        get().autoSave();
    },

    autoSave: async () => {
        const { data, saveData } = get();
        if (!data) return;

        try {
            // 调用真正的保存函数（自动保存，不显示提示）
            // 注意：现在自动保存由 Header 组件统一处理，这个方法主要用于手动触发保存
            await saveData(false);
            set({ lastSaved: new Date().toISOString() });
            get().updateSaveTime(); // 更新保存时间显示
        } catch (error) {
            console.error('Auto save failed:', error);
        }
    },

    saveData: async (isManual?: boolean) => {
        console.log('Store saveData called - 这个方法应该被外部传入的 saveData 覆盖, isManual:', isManual);
    // 这个方法会被 EntityRelationAnnotator 组件中传入的实际 saveData 方法覆盖
    },

    setSaveDataFunction: (saveDataFn: (isManual?: boolean) => Promise<void>) => {
        set({ saveData: saveDataFn });
    },

    // 新增Actions
    toggleContinuousAnnotation: () => {
        const { continuousAnnotation } = get();
        set({ continuousAnnotation: !continuousAnnotation });
    },

    toggleEntityPanelExpanded: (labelId: string) => {
        const { entityPanelExpanded } = get();
        set({
            entityPanelExpanded: {
                ...entityPanelExpanded,
                [labelId]: !entityPanelExpanded[labelId],
            },
        });
    },

    toggleRelationPanelExpanded: (labelId: string) => {
        const { relationPanelExpanded } = get();
        set({
            relationPanelExpanded: {
                ...relationPanelExpanded,
                [labelId]: !relationPanelExpanded[labelId],
            },
        });
    },

    showEntitySelectionDropdown: (position: { x: number; y: number }) => {
        console.log('Store: 显示实体选择下拉框', position, new Date().toISOString());
        set({
            showEntityDropdown: true,
            dropdownPosition: position,
        });
    },

    hideEntitySelectionDropdown: () => {
        console.log('Store: 隐藏实体选择下拉框', new Date().toISOString());
        set({
            showEntityDropdown: false,
            dropdownPosition: null,
        });
    },

    // 设置悬浮的关系ID
    setHoveredRelation: (relationId: string | null) => {
        set({ hoveredRelationId: relationId });
    },

    calculateProgress: () => {
        const { data } = get();
        if (!data) return;

        // 计算已标注的字符数
        let annotatedCharacters = 0;
        data.entities.forEach((entity) => {
            annotatedCharacters += entity.end - entity.start;
        });

        const percentage = Math.round((annotatedCharacters / data.content.length) * 100);

        set({
            data: {
                ...data,
                progress: {
                    totalCharacters: data.content.length,
                    annotatedCharacters,
                    percentage,
                },
            },
        });
    },

    submitAnnotation: async () => {
        const { data } = get();
        if (!data) return;

        set({ loading: true });
        try {
            // Mock提交 - 实际应该调用API
            console.log('Submitting annotation:', data);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟网络延迟

            set({ loading: false });
            message.success('提交成功');
        } catch (error) {
            set({ loading: false });
            message.error('提交失败');
        }
    },

    // 从真实API数据初始化store（处理标签数据转换）
    initializeWithApiData: (data: AnnotationData, apiLabelsData?: ApiLabelsResponse) => {
        console.log('initializeWithApiData - 输入数据:', { data, apiLabelsData });
        console.log('initializeWithApiData - 输入的 entities:', (data as any).entities);
        console.log('initializeWithApiData - 输入的 relations:', (data as any).relations);

        let processedData = { ...data };

        // 如果有API标签数据，进行转换
        if (apiLabelsData?.data) {
            console.log('转换API标签数据...');

            // 转换实体标签
            const entityLabels = convertApiLabelsToEntityLabels(apiLabelsData.data.labels || []);
            console.log('转换后的实体标签:', entityLabels);

            // 转换关系标签
            const relationLabels = convertApiRelationsToRelationLabels(apiLabelsData.data.entity_relations || []);
            console.log('转换后的关系标签:', relationLabels);

            // 更新数据 - 保留原有的 entities 和 relations
            processedData = {
                ...processedData,
                entityLabels,
                relationLabels,
                // 明确保留原有的标注数据
                entities: (data as any).entities || [],
                relations: (data as any).relations || [],
            };
        }

        console.log('最终处理的数据:', processedData);
        console.log('最终的 entities:', processedData.entities);
        console.log('最终的 relations:', processedData.relations);

        set({
            data: processedData,
            loading: false,
            error: null,
        });
    },

    // 从外部数据初始化store
    initializeWithData: (data: AnnotationData) => {
        set({
            data,
            loading: false,
            error: null,
        });
    },

    // 显示使用教程
    showTutorialModal: () => {
        set({ showTutorial: true });
    },

    // 隐藏使用教程
    hideTutorialModal: () => {
        set({ showTutorial: false });
    },

    // 更新保存时间
    updateSaveTime: () => {
        const now = new Date();
        const timeString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        set({ lastSaveTime: timeString });
    },
}));
