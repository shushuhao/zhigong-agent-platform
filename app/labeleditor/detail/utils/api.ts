// 临时使用 DataContext 中的类型，避免循环依赖
type AnnotationData = any;
type TaskMetaData = any;
type TaskResultData = any;

interface ApiResponse<T = any> {
    message: string;
    data?: T;
    code?: number;
    requestId?: string;
}

/**
 * 检查对象是否为空
 */
export const isEmptyObject = (obj: any): boolean => !obj || Object.keys(obj).length === 0;

/**
 * 转换真实接口数据为表单字段格式
 */
function convertFileLabelsToFormFields(fileLabels: any[]): any[] {
    console.log('🔧 开始转换 file_labels:', fileLabels);

    return fileLabels
        .map((group) => {
            const fieldId = `group_${group.order_num}`;

            // 确定表单类型
            let fieldType: string;
            if (group.attribute_group_class === 1) {
                fieldType = 'radio';
            } else if (group.attribute_group_class === 2) {
                fieldType = 'checkbox';
            } else if (group.attribute_group_class === 3) {
                fieldType = 'textarea'; // 文本框类型
            } else {
                fieldType = 'input';
            }

            console.log(`📋 组 "${group.attribute_group_name}" - class: ${group.attribute_group_class}, type: ${fieldType}`);

            // 处理选项
            let options: any[] = [];
            if (group.file_label_attribute && Array.isArray(group.file_label_attribute)) {
                options = group.file_label_attribute.map((attr) => ({
                    label: attr.attribute_name_cn,
                    value: attr.attribute_name_en,
                    hasInput: attr.input_type === 2, // input_type=2 表示需要文本框
                    inputPlaceholder: attr.input_type === 2 ? '请输入详细信息' : undefined,
                }));
            }

            // 对于 attribute_group_class=3 的组，即使没有 file_label_attribute 也要渲染文本框
            if (group.attribute_group_class === 3) {
                console.log(`📝 文本框组 "${group.attribute_group_name}" - file_label_attribute 为空，直接渲染文本框`);
            }

            const formField = {
                id: fieldId,
                name: group.attribute_group_name,
                label: group.attribute_group_name,
                type: fieldType,
                required: group.attribute_group_type === 1, // 1=必填，2=非必填
                options: options.length > 0 ? options : undefined,
                placeholder: fieldType === 'textarea' ? '请输入内容' : undefined,
                rows: fieldType === 'textarea' ? 4 : undefined,
            };

            console.log(`🎯 转换组 "${group.attribute_group_name}":`, formField);
            return formField;
        });
}

/**
 * 检查是否有标注结果
 */
export const hasAnnotationResult = (resultData: TaskResultData | null): boolean => {
    console.log('hasAnnotationResult - 检查标注结果:', resultData);

    if (!resultData || !resultData.result || Object.keys(resultData.result).length === 0) {
        console.log('hasAnnotationResult - 没有结果数据');
        return false;
    }

    const result = resultData.result as any;
    console.log('hasAnnotationResult - 结果数据:', result);

    // 检查实体关系标注类型
    if (result.type === 'entity-relation') {
        console.log('hasAnnotationResult - 检查实体关系标注');

        // 检查是否有实体或关系数据
        const hasEntities = result.entities && Array.isArray(result.entities) && result.entities.length > 0;
        const hasRelations = result.relations && Array.isArray(result.relations) && result.relations.length > 0;

        console.log('hasAnnotationResult - 实体数量:', result.entities?.length || 0);
        console.log('hasAnnotationResult - 关系数量:', result.relations?.length || 0);

        const hasEntityRelationContent = hasEntities || hasRelations;
        console.log('hasAnnotationResult - 实体关系标注有内容:', hasEntityRelationContent);
        return hasEntityRelationContent;
    }

    // 检查分类标注类型
    if (result.type === 'classification') {
        console.log('hasAnnotationResult - 检查分类标注');

        // 检查是否有表单值数据
        const hasFormValues = result.formValues && Object.keys(result.formValues).length > 0;

        console.log('hasAnnotationResult - 表单值:', result.formValues);
        console.log('hasAnnotationResult - 分类标注有内容:', hasFormValues);
        return hasFormValues;
    }

    // 检查是否有 prompts 字段（QA 和排序类型）
    if (!result.prompts || !Array.isArray(result.prompts)) {
        console.log('hasAnnotationResult - 没有 prompts 字段');
        return false;
    }

    // 检查是否有实际的标注内容
    console.log('hasAnnotationResult - 检查标注内容，result.type:', result.type);

    // 检查是否有任何 prompt 包含标注内容
    const hasContent = result.prompts.some((prompt: any) => {
        console.log('hasAnnotationResult - 检查 prompt:', prompt);

        // 检查 QA 类型的 response 字段（二维数组格式）
        if (prompt.response && Array.isArray(prompt.response) && prompt.response.length > 0) {
            const hasQAContent = prompt.response.some((responseItem: any) => (Array.isArray(responseItem) ? responseItem.length > 0 : responseItem),
            );
            if (hasQAContent) {
                console.log('hasAnnotationResult - 找到 QA 类型的内容');
                return true;
            }
        }

        // 检查排序类型的 responses 字段（对象数组格式）
        if (prompt?.responses && Array.isArray(prompt?.responses) && prompt?.responses.length > 0) {
            // 排序类型：检查 responses 数组是否有内容，且顺序是否被改变
            // 如果有 responses 且不是原始顺序，就认为有标注内容
            const hasRankingContent = prompt?.responses.some((responseItem: any) => responseItem && (responseItem.response || responseItem.id),
            );
            if (hasRankingContent) {
                console.log('hasAnnotationResult - 找到排序类型的内容');
                return true;
            }
        }

        return false;
    });

    console.log('hasAnnotationResult - 最终判断有内容:', hasContent);
    return hasContent;
};

// 调用计数器
let callCounter = 0;

/**
 * 获取任务元数据
 */
export const getTaskMetaData = async (requirementId?: number): Promise<TaskMetaData | null> => {
    callCounter++;
    const currentCall = callCounter;

    try {
        const response: ApiResponse<TaskMetaData> = await (window as any).$wujie?.props?.getTextEditorTask(requirementId);

        if (response && response.message === 'success' && response.data) {
            return response.data;
        }
        console.warn(`[调用 ${currentCall}] ❌ 条件不通过，Failed to get task meta data, response:`, response);
        return null;
    } catch (error) {
        console.error(`[调用 ${currentCall}] Error calling getTaskMetaData:`, error);
        return null;
    }
};

/**
 * 获取任务结果数据
 */
export const getTaskResultData = async (taskId: number): Promise<TaskResultData | null> => {
    try {
        const response: ApiResponse<TaskResultData> = await (window as any).$wujie?.props?.getTextEditorResult(taskId);
        console.log('getTaskResultData response:', response);

        if (response.message === 'success' && response.data) {
            return response.data;
        }
        console.warn('Failed to get task result data');
        return null;
    } catch (error) {
        console.error('Error calling getTaskResultData:', error);
        return null;
    }
};

/**
 * 获取远程 JSON 数据
 */
export const fetchRemoteJsonData = async (itemPath: string): Promise<any> => {
    try {
        console.log('Fetching remote JSON data from:', itemPath);

        const response = await fetch(itemPath, {
            method: 'GET',
            mode: 'cors',
        });

        if (response) {
            const jsonData = await response.json();
            console.log('Remote JSON data loaded:', jsonData);
            return jsonData;
        }
        console.warn('Failed to fetch remote JSON data');
        return null;
    } catch (error) {
        console.error('Error fetching remote JSON:', error);
        return null;
    }
};

/**
 * 提交标注结果
 */
export const submitAnnotationResult = async (payload: {
    task_id: number;
    save_type: 1 | 2;
    result_type: 0 | 1;
    result: AnnotationData;
}): Promise<ApiResponse> => {
    try {
        console.log('Submitting annotation result:', payload);

        const response: ApiResponse = await (window as any).$wujie?.props?.saveTextEditorResult(payload);
        console.log('Submit response:', response);

        return response;
    } catch (error) {
        console.error('Error submitting annotation result:', error);
        throw error;
    }
};

/**
 * 构建处理后的数据
 */
export const buildProcessedData = (
    metaData: TaskMetaData | null,
    resultData: TaskResultData | null,
    remoteJsonData: any,
    labelsData: any,
    rId: string,
    type: string,
): AnnotationData => {
    console.log('buildProcessedData - 输入参数:', {
        hasResult: hasAnnotationResult(resultData),
        hasRemoteJson: !!remoteJsonData,
        hasLabelsData: !!labelsData,
        type,
        rId,
    });

    if (hasAnnotationResult(resultData)) {
    // 情况1: 已有标注结果
        console.log('Using existing annotation result');

        const resultDataObj = resultData!.result as any;
        console.log('=== 详细数据检查 ===');
        console.log('resultData:', resultData);
        console.log('resultDataObj:', resultDataObj);
        console.log('resultDataObj.entities:', resultDataObj.entities);
        console.log('resultDataObj.relations:', resultDataObj.relations);

        // 根据类型进行不同的处理
        if (type === 'classification') {
            // 分类标注：合并标注结果和标签数据
            console.log('Processing classification data with labels');
            console.log('Labels data for classification:', labelsData);

            // 将真实接口数据转换为 formFields 格式
            let formFields = [];

            console.log('🔧 转换分类标签数据 (已有结果):', {
                labelsData,
                labelsDataType: typeof labelsData,
                hasFileLabels: !!(labelsData?.data?.file_labels),
            });

            // 转换真实接口数据
            if (labelsData && labelsData.data && Array.isArray(labelsData.data.file_labels)) {
                formFields = convertFileLabelsToFormFields(labelsData.data.file_labels);
                console.log('🎯 转换后的 formFields:', formFields);
            } else {
                console.warn('🚨 无法从 labelsData 中提取 file_labels，使用空数组');
                formFields = [];
            }

            return {
                ...resultDataObj,
                // 添加表单字段数据
                formFields,
                labels: labelsData || [], // 保留原始标签数据用于调试
                // 确保基本字段正确
                id: rId,
                name: metaData?.requirement_info?.name || '标注任务',
                type: type as any,
                lastSaved: resultData!.update_time || '',
                createdAt: new Date().toISOString(),
                updatedAt: resultData!.update_time || new Date().toISOString(),
                // 添加任务元数据信息
                requirement_info: metaData?.requirement_info || null,
            } as AnnotationData;
        } if (type === 'entity-relation') {
            // 实体关系标注：合并标注结果和标签数据
            console.log('Processing entity-relation data with labels');
            console.log('Labels data for entity-relation:', labelsData);
            console.log('Result data object:', resultDataObj);
            console.log('Raw result data:', resultData);
            console.log('Existing entities in result:', resultDataObj.entities);
            console.log('Existing relations in result:', resultDataObj.relations);

            // 尝试从不同可能的字段中获取实体和关系数据
            let entities = resultDataObj.entities || [];
            let relations = resultDataObj.relations || [];

            // 检查是否数据在其他字段中
            if ((!entities || entities.length === 0) && resultData?.result) {
                console.log('尝试从其他字段获取实体数据...');

                // 可能的字段名称
                const possibleEntityFields = ['entities', 'annotations', 'entityAnnotations', 'textAnnotations'];
                const possibleRelationFields = ['relations', 'connections', 'relationAnnotations', 'entityRelations'];

                for (const field of possibleEntityFields) {
                    if (resultData.result[field] && Array.isArray(resultData.result[field])) {
                        console.log(`找到实体数据在字段: ${field}`, resultData.result[field]);
                        entities = resultData.result[field];
                        break;
                    }
                }

                for (const field of possibleRelationFields) {
                    if (resultData.result[field] && Array.isArray(resultData.result[field])) {
                        console.log(`找到关系数据在字段: ${field}`, resultData.result[field]);
                        relations = resultData.result[field];
                        break;
                    }
                }
            }

            console.log('最终获取的实体数据:', entities);
            console.log('最终获取的关系数据:', relations);

            // 转换实体标签数据：labels -> EntityLabel[]
            const entityLabels = (labelsData?.data?.labels || []).map((label: any) => ({
                id: label.label_name_en, // 使用英文名作为ID
                name: label.label_name_cn, // 使用中文名作为显示名称
                color: label.label_colour, // 颜色
                selected: false, // 默认未选中
                order_num: label.order_num, // 保留排序信息
            }));

            // 转换关系标签数据：entity_relations -> RelationLabel[]
            const relationLabels = (labelsData?.data?.entity_relations || []).map((relation: any) => ({
                id: relation.relation_name_en, // 使用英文名作为ID
                name: relation.relation_name_cn, // 使用中文名作为显示名称
                entityLabelIds: [ // 合并起始和目标实体标签（兼容旧逻辑）
                    ...(relation.start_entity_labels || []),
                    ...(relation.target_entity_labels || []),
                ],
                startEntityLabels: relation.start_entity_labels || [], // 保留原始的起始实体标签
                targetEntityLabels: relation.target_entity_labels || [], // 保留原始的目标实体标签
                selected: false, // 默认未选中
                order_num: relation.order_num, // 保留排序信息
                color: relation.color || '#ff6b35', // 关系颜色，默认橙色
            }));

            console.log('Converted entity labels:', entityLabels);
            console.log('Converted relation labels:', relationLabels);

            const finalData = {
                ...resultDataObj,
                // 添加转换后的实体和关系标签数据
                entityLabels,
                relationLabels,
                // 使用我们找到的实体和关系数据
                entities, // 实体标注数据
                relations, // 关系连接数据
                dynamicForm: resultDataObj.dynamicForm || [], // 动态表单数据
                progress: resultDataObj.progress || {
                    totalCharacters: 0,
                    annotatedCharacters: 0,
                    percentage: 0,
                },
                labels: labelsData || [], // 保留原始标签数据用于调试
                // 确保基本字段正确
                id: rId,
                name: metaData?.requirement_info?.name || '标注任务',
                type: type as any,
                lastSaved: resultData!.update_time || '',
                createdAt: new Date().toISOString(),
                updatedAt: resultData!.update_time || new Date().toISOString(),
                // 添加任务元数据信息
                requirement_info: metaData?.requirement_info || null,
            } as AnnotationData;

            console.log('Final processed entity-relation data:', finalData);
            console.log('Final entities count:', finalData.entities?.length);
            console.log('Final relations count:', finalData.relations?.length);

            return finalData;
        }
        // 其他类型：原有逻辑
        if (remoteJsonData) {
            console.log('Merging annotation result with remote JSON data');
            return {
                ...remoteJsonData, // 远程JSON的基础数据（包含type等）
                ...resultDataObj, // 标注结果数据（覆盖prompts等）
                // 确保基本字段正确
                id: rId,
                name: metaData?.requirement_info?.name || '标注任务',
                lastSaved: resultData!.update_time || '',
                createdAt: new Date().toISOString(),
                updatedAt: resultData!.update_time || new Date().toISOString(),
            } as AnnotationData;
        }
        // 没有远程JSON数据，直接使用标注结果
        return {
            ...resultDataObj,
            // 确保基本字段正确
            id: rId,
            name: metaData?.requirement_info?.name || '标注任务',
            type: type as any, // 使用URL参数中的type
            lastSaved: resultData!.update_time || '',
            createdAt: new Date().toISOString(),
            updatedAt: resultData!.update_time || new Date().toISOString(),
        } as AnnotationData;
    }
    // 情况2: 首次标注
    console.log('Using original data for first-time annotation');

    const baseData = {
        id: rId,
        name: metaData?.requirement_info?.name || '标注任务',
        type: type as any,
        lastSaved: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    if (type === 'classification') {
        // 分类标注：使用标签数据
        console.log('Processing first-time classification data with labels');
        console.log('Labels data for first-time classification:', labelsData);

        // 将真实接口数据转换为 formFields 格式
        let formFields = [];

        console.log('🔧 转换首次分类标签数据:', {
            labelsData,
            labelsDataType: typeof labelsData,
            hasFileLabels: !!(labelsData?.data?.file_labels),
        });

        // 转换真实接口数据
        if (labelsData && labelsData.data && Array.isArray(labelsData.data.file_labels)) {
            formFields = convertFileLabelsToFormFields(labelsData.data.file_labels);
            console.log('🎯 首次转换后的 formFields:', formFields);
        } else {
            console.warn('🚨 无法从首次 labelsData 中提取 file_labels，使用空数组');
            formFields = [];
        }

        return {
            ...baseData,
            formFields,
            labels: labelsData || [], // 保留原始标签数据用于调试
            // 如果有远程JSON数据，也合并进来
            ...(remoteJsonData || {}),
            // 保留基本信息
            id: baseData.id,
            type: baseData.type,
            name: baseData.name,
            // 添加任务元数据信息
            requirement_info: metaData?.requirement_info || null,
        } as AnnotationData;
    } if (type === 'entity-relation') {
        // 实体关系标注：使用标签数据
        console.log('Processing first-time entity-relation data with labels');
        console.log('Labels data for first-time entity-relation:', labelsData);

        // 转换实体标签数据：labels -> EntityLabel[]
        const entityLabels = (labelsData?.data?.labels || []).map((label: any) => ({
            id: label.label_name_en, // 使用英文名作为ID
            name: label.label_name_cn, // 使用中文名作为显示名称
            color: label.label_colour, // 颜色
            selected: false, // 默认未选中
            order_num: label.order_num, // 保留排序信息
        }));

        // 转换关系标签数据：entity_relations -> RelationLabel[]
        const relationLabels = (labelsData?.data?.entity_relations || []).map((relation: any) => ({
            id: relation.relation_name_en, // 使用英文名作为ID
            name: relation.relation_name_cn, // 使用中文名作为显示名称
            entityLabelIds: [ // 合并起始和目标实体标签（兼容旧逻辑）
                ...(relation.start_entity_labels || []),
                ...(relation.target_entity_labels || []),
            ],
            startEntityLabels: relation.start_entity_labels || [], // 保留原始的起始实体标签
            targetEntityLabels: relation.target_entity_labels || [], // 保留原始的目标实体标签
            selected: false, // 默认未选中
            order_num: relation.order_num, // 保留排序信息
            color: relation.color || '#ff6b35', // 关系颜色，默认橙色
        }));

        console.log('Converted entity labels for first-time:', entityLabels);
        console.log('Converted relation labels for first-time:', relationLabels);

        return {
            ...baseData,
            entityLabels,
            relationLabels,
            // 确保必需的字段存在（首次标注时使用空数组）
            entities: [], // 实体标注数据（首次为空）
            relations: [], // 关系连接数据（首次为空）
            dynamicForm: [], // 动态表单数据（首次为空）
            progress: {
                totalCharacters: 0,
                annotatedCharacters: 0,
                percentage: 0,
            },
            labels: labelsData || [], // 保留原始标签数据用于调试
            // 如果有远程JSON数据，也合并进来
            ...(remoteJsonData || {}),
            // 保留基本信息
            id: baseData.id,
            type: baseData.type,
            name: baseData.name,
            // 添加任务元数据信息
            requirement_info: metaData?.requirement_info || null,
        } as AnnotationData;
    }
    // 其他类型：原有逻辑
    if (remoteJsonData) {
        return {
            ...baseData,
            ...remoteJsonData,
            // 保留原始的基本信息
            id: baseData.id,
            type: baseData.type,
            name: baseData.name,
            // 添加任务元数据信息
            requirement_info: metaData?.requirement_info || null,
        } as AnnotationData;
    }
    return baseData as AnnotationData;
};
