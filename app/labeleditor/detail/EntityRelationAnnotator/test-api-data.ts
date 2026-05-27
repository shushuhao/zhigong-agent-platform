// 测试真实API数据转换的工具文件
import { convertApiLabelsToEntityLabels, convertApiRelationsToRelationLabels, ApiLabelsResponse } from './store';

// 模拟真实API返回的数据
export const mockApiResponse: ApiLabelsResponse = {
    code: 0,
    message: 'success',
    requestId: 'label-service-7a4b7b56-4427-4ea0-86a7-e34637ced4c7',
    data: {
        file_labels: null,
        labels: [
            {
                order_num: 1,
                label_name_cn: '武器名称',
                label_name_en: 'weapon',
                label_shape: 0,
                label_colour: '#FF0000',
                label_info_attribute_groups: null,
            },
            {
                order_num: 2,
                label_name_cn: '零部件名称',
                label_name_en: 'parts_name',
                label_shape: 0,
                label_colour: '#00FF00',
                label_info_attribute_groups: null,
            },
            {
                order_num: 3,
                label_name_cn: '故障描述',
                label_name_en: 'Fault_description',
                label_shape: 0,
                label_colour: '#00FF11',
                label_info_attribute_groups: null,
            },
            {
                order_num: 4,
                label_name_cn: '处理方式',
                label_name_en: 'handling_method',
                label_shape: 0,
                label_colour: '#00FF22',
                label_info_attribute_groups: null,
            },
        ],
        entity_relations: [
            {
                order_num: 1,
                relation_name_cn: '武器上的零部件',
                relation_name_en: 'en_name1',
                start_entity_labels: ['weapon'],
                target_entity_labels: ['parts_name'],
                color: '',
            },
            {
                order_num: 2,
                relation_name_cn: '零部件及故障描述',
                relation_name_en: 'en_name2',
                start_entity_labels: ['parts_name'],
                target_entity_labels: ['Fault_description'],
                color: '',
            },
            {
                order_num: 3,
                relation_name_cn: '故障描述及处理方式',
                relation_name_en: 'en_name3',
                start_entity_labels: ['Fault_description'],
                target_entity_labels: ['handling_method'],
                color: '',
            },
        ],
    },
};

// 测试数据转换函数
export const testDataConversion = (): { entityLabels: any; relationLabels: any } => {
    console.log('=== 测试API数据转换 ===');

    // 转换实体标签
    const entityLabels = convertApiLabelsToEntityLabels(mockApiResponse.data.labels);
    console.log('转换后的实体标签:', entityLabels);

    // 转换关系标签
    const relationLabels = convertApiRelationsToRelationLabels(mockApiResponse.data.entity_relations);
    console.log('转换后的关系标签:', relationLabels);

    // 验证转换结果
    console.log('\n=== 验证转换结果 ===');

    // 验证实体标签
    entityLabels.forEach((label) => {
        console.log(`实体标签: ${label.name} (${label.id}) - 颜色: ${label.color}`);
    });

    // 验证关系标签
    relationLabels.forEach((relation) => {
        console.log(`关系标签: ${relation.name} (${relation.id})`);
        console.log(`  起始实体: ${relation.startEntityLabels.join(', ')}`);
        console.log(`  目标实体: ${relation.targetEntityLabels.join(', ')}`);
        console.log(`  所有实体: ${relation.entityLabelIds.join(', ')}`);
    });

    return { entityLabels, relationLabels };
};

// 测试保存功能
export const testSaveFunction = async (): Promise<void> => {
    console.log('=== 测试保存功能 ===');

    try {
        // 获取 EntityRelationStore 的状态
        const { useEntityRelationStore } = await import('./store');
        const store = useEntityRelationStore.getState();

        console.log('当前 store 状态:', {
            hasData: !!store.data,
            saveDataFunction: typeof store.saveData,
        });

        // 尝试调用保存
        console.log('调用 saveData...');
        await store.saveData();
        console.log('saveData 调用完成');
    } catch (error) {
        console.error('保存测试失败:', error);
    }
};

// 测试快捷键功能
export const testKeyboardShortcuts = (): void => {
    console.log('=== 测试快捷键功能 ===');
    console.log('请按下以下快捷键进行测试:');
    console.log('- Mac: Command + S');
    console.log('- Windows: Ctrl + S');
    console.log('- ESC (在连线状态下)');
    console.log('查看控制台日志以确认快捷键是否被正确触发');
};

// 测试数据加载和显示
export const testDataLoading = async (): Promise<void> => {
    console.log('=== 测试数据加载和显示 ===');

    try {
        // 获取 EntityRelationStore 的状态
        const { useEntityRelationStore } = await import('./store');
        const store = useEntityRelationStore.getState();

        console.log('当前 store 数据:', {
            hasData: !!store.data,
            entitiesCount: store.data?.entities?.length || 0,
            relationsCount: store.data?.relations?.length || 0,
            entityLabelsCount: store.data?.entityLabels?.length || 0,
            relationLabelsCount: store.data?.relationLabels?.length || 0,
        });

        if (store.data?.entities) {
            console.log('实体详情:', store.data.entities);
        }

        if (store.data?.relations) {
            console.log('关系详情:', store.data.relations);
        }

        // 获取 DataContext 的状态
        const { useDataContext } = await import('../contexts/DataContext');
        const contextState = useDataContext();

        console.log('DataContext 数据:', {
            hasData: !!contextState.data,
            dataType: (contextState.data as any)?.type,
            entitiesCount: (contextState.data as any)?.entities?.length || 0,
            relationsCount: (contextState.data as any)?.relations?.length || 0,
        });

        if ((contextState.data as any)?.entities) {
            console.log('Context 中的实体:', (contextState.data as any).entities);
        }
    } catch (error) {
        console.error('数据加载测试失败:', error);
    }
};

// 测试箭头位置是否正确
export const testArrowPosition = (): void => {
    console.log('=== 测试箭头位置 ===');

    try {
        // 获取 EntityRelationStore 的状态
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { useEntityRelationStore } = require('./store');
        const store = useEntityRelationStore.getState();

        if (!store.data || !store.data.entities) {
            console.log('没有实体数据');
            return;
        }

        console.log('检查实体位置计算:');
        store.data.entities.forEach((entity: any, index: number) => {
            const elements = document.querySelectorAll(`[data-entity-id="${entity.id}"]`);
            if (elements.length > 0) {
                const element = elements[0];
                const elementRect = element.getBoundingClientRect();

                // 尝试获取文本节点位置
                let textRect = null;
                try {
                    const range = document.createRange();
                    const textNode = element.firstChild;

                    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                        range.selectNodeContents(textNode);
                        textRect = range.getBoundingClientRect();
                    }
                } catch (error) {
                    // 忽略错误
                }

                const expectedX = textRect ? textRect.left + textRect.width / 2 : elementRect.left + elementRect.width / 2;
                const expectedY = textRect ? textRect.bottom + 5 : elementRect.bottom + 5;

                console.log(`实体 ${index + 1} (${entity.text.substring(0, 20)}...):`, {
                    entityId: entity.id,
                    elementCenter: {
                        x: Math.round(elementRect.left + elementRect.width / 2),
                        y: Math.round(elementRect.bottom + 5),
                    },
                    textCenter: textRect ? {
                        x: Math.round(textRect.left + textRect.width / 2),
                        y: Math.round(textRect.bottom + 5),
                    } : null,
                    expectedPosition: {
                        x: Math.round(expectedX),
                        y: Math.round(expectedY),
                    },
                    positionDifference: textRect ? {
                        x: Math.round(Math.abs((elementRect.left + elementRect.width / 2) - (textRect.left + textRect.width / 2))),
                        y: Math.round(Math.abs((elementRect.bottom + 5) - (textRect.bottom + 5))),
                    } : { x: 0, y: 0 },
                });
            }
        });

        // 检查关系连线
        if (store.data.relations && store.data.relations.length > 0) {
            console.log('\n检查关系连线:');
            store.data.relations.forEach((relation: any, index: number) => {
                const fromEntity = store.data.entities.find((e: any) => e.id === relation.fromEntityId);
                const toEntity = store.data.entities.find((e: any) => e.id === relation.toEntityId);

                console.log(`关系 ${index + 1}:`, {
                    relationId: relation.id,
                    from: fromEntity ? `${fromEntity.text.substring(0, 15)}...` : 'Unknown',
                    to: toEntity ? `${toEntity.text.substring(0, 15)}...` : 'Unknown',
                    fromEntityId: relation.fromEntityId,
                    toEntityId: relation.toEntityId,
                });
            });
        }
    } catch (error) {
        console.error('箭头位置测试失败:', error);
    }
};

// 测试连线位置精度问题
export const testConnectionPositionAccuracy = (): void => {
    console.log('=== 测试连线位置精度 ===');

    // 获取所有实体元素
    const allEntityElements = document.querySelectorAll('[data-entity-id]');
    console.log(`找到 ${allEntityElements.length} 个实体元素`);

    allEntityElements.forEach((element, index) => {
        const entityId = element.getAttribute('data-entity-id');
        const elementRect = element.getBoundingClientRect();
        const text = element.textContent || '';

        // 尝试获取文本节点的精确位置
        let textRect = null;
        try {
            const range = document.createRange();
            const textNode = element.firstChild;

            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                range.selectNodeContents(textNode);
                textRect = range.getBoundingClientRect();
            }
        } catch (error) {
            console.log('无法获取文本节点位置');
        }

        console.log(`实体 ${index + 1} (${entityId}):`, {
            text: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
            elementRect: {
                left: Math.round(elementRect.left),
                top: Math.round(elementRect.top),
                width: Math.round(elementRect.width),
                height: Math.round(elementRect.height),
                center: Math.round(elementRect.left + elementRect.width / 2),
            },
            textRect: textRect ? {
                left: Math.round(textRect.left),
                top: Math.round(textRect.top),
                width: Math.round(textRect.width),
                height: Math.round(textRect.height),
                center: Math.round(textRect.left + textRect.width / 2),
            } : null,
            positionDifference: textRect ? Math.round(Math.abs((elementRect.left + elementRect.width / 2) - (textRect.left + textRect.width / 2))) : 0,
        });
    });

    // 添加鼠标移动监听器来实时显示位置
    const handleMouseMove = (e: MouseEvent): void => {
        const target = e.target as HTMLElement;
        const entityId = target.getAttribute('data-entity-id') || target.closest('[data-entity-id]')?.getAttribute('data-entity-id');

        if (entityId) {
            const rect = target.getBoundingClientRect();
            console.log(`鼠标在实体 ${entityId} 上:`, {
                mouseX: e.clientX,
                mouseY: e.clientY,
                elementLeft: Math.round(rect.left),
                elementRight: Math.round(rect.right),
                elementCenter: Math.round(rect.left + rect.width / 2),
                relativeX: Math.round(e.clientX - rect.left),
                percentX: Math.round(((e.clientX - rect.left) / rect.width) * 100),
            });
        }
    };

    // 添加临时的鼠标监听器
    document.addEventListener('mousemove', handleMouseMove);

    // 5秒后移除监听器
    setTimeout(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        console.log('鼠标位置监听已停止');
    }, 5000);

    console.log('已添加5秒的鼠标位置监听，请移动鼠标到实体上测试');
};

// 测试具体的连线跳转问题
export const testSpecificConnectionJump = (): any => {
    console.log('=== 测试连线跳转问题 ===');

    // 获取所有实体元素
    const allEntityElements = document.querySelectorAll('[data-entity-id]');
    console.log(`找到 ${allEntityElements.length} 个实体元素`);

    // 检查每个元素的详细信息
    allEntityElements.forEach((element, index) => {
        const entityId = element.getAttribute('data-entity-id');
        const rect = element.getBoundingClientRect();
        const text = element.textContent || '';

        console.log(`实体元素 ${index + 1}:`, {
            entityId,
            text: text.substring(0, 20) + (text.length > 20 ? '...' : ''),
            fullText: text,
            position: {
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
            },
            element,
        });
    });

    // 检查是否有重复的 data-entity-id
    const entityIds = Array.from(allEntityElements).map((el) => el.getAttribute('data-entity-id'));
    const uniqueIds = [...new Set(entityIds)];

    if (entityIds.length !== uniqueIds.length) {
        console.warn('⚠️ 发现重复的 data-entity-id!');
        const duplicates = entityIds.filter((id, index) => entityIds.indexOf(id) !== index);
        console.log('重复的ID:', [...new Set(duplicates)]);

        duplicates.forEach((duplicateId) => {
            const elements = document.querySelectorAll(`[data-entity-id="${duplicateId}"]`);
            console.log(`ID "${duplicateId}" 出现 ${elements.length} 次:`);
            elements.forEach((el, i) => {
                console.log(`  ${i + 1}. 文本: "${el.textContent?.substring(0, 30)}..."`);
                console.log(`     位置: ${Math.round(el.getBoundingClientRect().left)}, ${Math.round(el.getBoundingClientRect().top)}`);
            });
        });
    } else {
        console.log('✅ 所有实体ID都是唯一的');
    }

    return {
        totalElements: allEntityElements.length,
        uniqueIds: uniqueIds.length,
        hasDuplicates: entityIds.length !== uniqueIds.length,
        elements: Array.from(allEntityElements).map((el) => ({
            id: el.getAttribute('data-entity-id'),
            text: el.textContent?.substring(0, 30),
            rect: el.getBoundingClientRect(),
        })),
    };
};

// 测试连线问题
export const testConnectionIssues = async (): Promise<void> => {
    console.log('=== 测试连线问题 ===');

    try {
        // 获取 EntityRelationStore 的状态
        const { useEntityRelationStore } = await import('./store');
        const store = useEntityRelationStore.getState();

        if (!store.data) {
            console.log('没有数据');
            return;
        }

        console.log('当前状态:', {
            connecting: store.connecting,
            connectingFromId: store.connectingFromId,
            hoveredRelationId: store.hoveredRelationId,
            entitiesCount: store.data.entities?.length || 0,
            relationsCount: store.data.relations?.length || 0,
        });

        // 检查实体
        if (store.data.entities) {
            console.log('实体列表:');
            store.data.entities.forEach((entity, index) => {
                console.log(`  ${index + 1}. ${entity.id} - "${entity.text}" (${entity.labelName})`);

                // 检查DOM元素
                const elements = document.querySelectorAll(`[data-entity-id="${entity.id}"]`);
                console.log(`    DOM元素数量: ${elements.length}`);
                if (elements.length > 0) {
                    const rect = elements[0].getBoundingClientRect();
                    console.log(`    位置: ${rect.left}, ${rect.top}, ${rect.width}x${rect.height}`);
                }
            });
        }

        // 检查关系
        if (store.data.relations) {
            console.log('关系列表:');
            store.data.relations.forEach((relation, index) => {
                console.log(`  ${index + 1}. ${relation.id} - ${relation.fromEntityId} -> ${relation.toEntityId}`);
            });
        }

        // 检查关系标签
        if (store.data.relationLabels) {
            console.log('关系标签:');
            store.data.relationLabels.forEach((label, index) => {
                console.log(`  ${index + 1}. ${label.id} - "${label.name}"`);
                console.log(`    起始实体: ${label.startEntityLabels?.join(', ')}`);
                console.log(`    目标实体: ${label.targetEntityLabels?.join(', ')}`);
            });
        }
    } catch (error) {
        console.error('连线问题测试失败:', error);
    }
};

// 测试后端数据结构
export const testBackendDataStructure = async (): Promise<void> => {
    console.log('=== 测试后端数据结构 ===');

    try {
        // 获取当前任务ID
        const urlParams = new URLSearchParams(window.location.search);
        const taskId = urlParams.get('task_id');

        if (!taskId) {
            console.error('无法获取 task_id');
            return;
        }

        console.log('任务ID:', taskId);

        // 调用后端接口
        const { getTaskResultData } = await import('../utils/api');
        const resultData = await getTaskResultData(parseInt(taskId, 10));

        console.log('后端返回的原始数据:', resultData);

        if (resultData?.result) {
            console.log('result 字段内容:', resultData.result);
            console.log('result 字段的所有键:', Object.keys(resultData.result));

            // 检查可能包含实体数据的字段
            const possibleEntityFields = ['entities', 'annotations', 'entityAnnotations', 'textAnnotations'];
            const possibleRelationFields = ['relations', 'connections', 'relationAnnotations', 'entityRelations'];

            console.log('检查可能的实体字段:');
            possibleEntityFields.forEach((field) => {
                if (resultData.result[field] !== undefined) {
                    console.log(`  ${field}:`, resultData.result[field]);
                } else {
                    console.log(`  ${field}: 不存在`);
                }
            });

            console.log('检查可能的关系字段:');
            possibleRelationFields.forEach((field) => {
                if (resultData.result[field] !== undefined) {
                    console.log(`  ${field}:`, resultData.result[field]);
                } else {
                    console.log(`  ${field}: 不存在`);
                }
            });

            // 显示所有字段的类型和内容
            console.log('所有字段详情:');
            Object.keys(resultData.result).forEach((key) => {
                const value = resultData.result[key];
                console.log(`  ${key} (${typeof value}):`, value);
            });
        }
    } catch (error) {
        console.error('后端数据结构测试失败:', error);
    }
};

// 在浏览器控制台中运行测试
if (typeof window !== 'undefined') {
    (window as any).testDataConversion = testDataConversion;
    (window as any).testSaveFunction = testSaveFunction;
    (window as any).testKeyboardShortcuts = testKeyboardShortcuts;
    (window as any).testDataLoading = testDataLoading;
    (window as any).testBackendDataStructure = testBackendDataStructure;
    (window as any).testConnectionIssues = testConnectionIssues;
    (window as any).testSpecificConnectionJump = testSpecificConnectionJump;
    (window as any).testConnectionPositionAccuracy = testConnectionPositionAccuracy;
    (window as any).testArrowPosition = testArrowPosition;
    console.log('测试函数已添加到 window 对象:');
    console.log('- window.testDataConversion() - 测试数据转换');
    console.log('- window.testSaveFunction() - 测试保存功能');
    console.log('- window.testKeyboardShortcuts() - 测试快捷键');
    console.log('- window.testDataLoading() - 测试数据加载和显示');
    console.log('- window.testBackendDataStructure() - 测试后端数据结构');
    console.log('- window.testConnectionIssues() - 测试连线问题');
    console.log('- window.testSpecificConnectionJump() - 测试连线跳转问题');
    console.log('- window.testConnectionPositionAccuracy() - 测试连线位置精度');
    console.log('- window.testArrowPosition() - 测试箭头位置');
}
