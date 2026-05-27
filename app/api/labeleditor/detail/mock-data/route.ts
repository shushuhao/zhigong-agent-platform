import { NextRequest, NextResponse } from 'next/server';
import {
    EntityRelationData,
    ClassificationData,
    QAData,
    RankingData,
    AnnotationData,
    ApiResponse,
} from '../../../labeleditor/detail/types';

/**
 * 生成模拟数据的工厂函数
 * @param rId - 资源 ID
 * @param type - 标注类型
 */
function createMockData(rId: string, type: string): AnnotationData {
    if (!rId) {
        throw new Error('Invalid rId: rId cannot be empty');
    }

    if (!type) {
        throw new Error('Invalid type: type cannot be empty or undefined');
    }

    const baseData = {
        id: rId,
        lastSaved: '',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00',
    };

    switch (type) {
        case 'entity-relation':
            return {
                ...baseData,
                name: '实体关系标注任务 - 科技公司介绍',
                content: '微软（Microsoft）由比尔·盖茨（Bill Gates）和保罗·艾伦（Paul Allen）于1975年4月4日在新墨西哥州的阿尔伯克基创立。当时，比尔·盖茨是公司的首席执行官（CEO）。作为一家总部位于美国华盛顿州雷德蒙德的跨国科技公司，微软是全球最大的软件制造商之一。',
                type: 'entity-relation',
                entityLabels: [
                    { id: '1', name: '人物', color: '#1890ff', selected: false },
                    { id: '2', name: '公司', color: '#52c41a', selected: false },
                    { id: '3', name: '地点', color: '#fa8c16', selected: false },
                    { id: '4', name: '时间', color: '#eb2f96', selected: false },
                    { id: '5', name: '职位', color: '#722ed1', selected: false },
                ],
                relationLabels: [
                    { id: '1', name: '创立', entityLabelIds: ['1', '2'], selected: false },
                    { id: '2', name: '担任', entityLabelIds: ['1', '5'], selected: false },
                    { id: '3', name: '位于', entityLabelIds: ['2', '3'], selected: false },
                ],
                entities: [
                    {
                        id: 'entity_1',
                        text: '微软',
                        start: 0,
                        end: 2,
                        labelId: '2',
                        labelName: '公司',
                        color: '#52c41a',
                        visible: true,
                        highlighted: false,
                    },
                    {
                        id: 'entity_2',
                        text: '比尔·盖茨',
                        start: 15,
                        end: 20,
                        labelId: '1',
                        labelName: '人物',
                        color: '#1890ff',
                        visible: true,
                        highlighted: false,
                    },
                    {
                        id: 'entity_3',
                        text: '保罗·艾伦',
                        start: 32,
                        end: 37,
                        labelId: '1',
                        labelName: '人物',
                        color: '#1890ff',
                        visible: true,
                        highlighted: false,
                    },
                    {
                        id: 'entity_4',
                        text: '1975年4月4日',
                        start: 39,
                        end: 49,
                        labelId: '4',
                        labelName: '时间',
                        color: '#eb2f96',
                        visible: true,
                        highlighted: false,
                    },
                    {
                        id: 'entity_5',
                        text: '新墨西哥州',
                        start: 51,
                        end: 56,
                        labelId: '3',
                        labelName: '地点',
                        color: '#fa8c16',
                        visible: true,
                        highlighted: false,
                    },
                    {
                        id: 'entity_6',
                        text: '首席执行官',
                        start: 85,
                        end: 90,
                        labelId: '5',
                        labelName: '职位',
                        color: '#722ed1',
                        visible: true,
                        highlighted: false,
                    },
                ],
                relations: [
                    {
                        id: 'relation_1',
                        fromEntityId: 'entity_2',
                        toEntityId: 'entity_1',
                        relationId: '1',
                        relationName: '创立',
                        visible: true,
                    },
                    {
                        id: 'relation_2',
                        fromEntityId: 'entity_3',
                        toEntityId: 'entity_1',
                        relationId: '1',
                        relationName: '创立',
                        visible: true,
                    },
                    {
                        id: 'relation_3',
                        fromEntityId: 'entity_2',
                        toEntityId: 'entity_6',
                        relationId: '2',
                        relationName: '担任',
                        visible: true,
                    },
                ],
                progress: {
                    totalCharacters: 95,
                    annotatedCharacters: 35,
                    percentage: 37,
                },
            } as EntityRelationData;

        case 'classification':
            return {
                ...baseData,
                name: '这是一个标注名称（标注任务: 123）',
                content: `内部采购合同

合同编号：CG-2024-0810-001

甲方（采购方）：
部门名称：创新事业部
负责人：李经理
联系方式：li@company.com / 分机号：8001

乙方（供应方）：
部门名称：行政部-采购处
负责人：王主管
联系方式：wang@company.com / 分机号：6005`,
                type: 'classification',
                formFields: [
                    {
                        id: 'document_type',
                        name: 'document_type',
                        label: '文本类型',
                        type: 'radio',
                        required: true,
                        options: [
                            { label: '合同', value: 'contract', hasInput: true, inputPlaceholder: '请输入合同类型' },
                            { label: '报告', value: 'report', hasInput: false },
                            { label: '发票', value: 'invoice', hasInput: false },
                            { label: '其他', value: 'other', hasInput: true, inputPlaceholder: '请说明其他类型' },
                        ],
                    },
                    {
                        id: 'business_department',
                        name: 'business_department',
                        label: '业务部门',
                        type: 'checkbox',
                        required: false,
                        options: [
                            { label: '财务部', value: 'finance', hasInput: false },
                            { label: '市场部', value: 'marketing', hasInput: true, inputPlaceholder: '请输入具体市场部门' },
                            { label: '人力资源部', value: 'hr', hasInput: false },
                        ],
                    },
                    {
                        id: 'project_client',
                        name: 'project_client',
                        label: '项目/客户',
                        type: 'input',
                        required: false,
                        placeholder: '输入内容',
                        maxLength: 100,
                    },
                ],
                formValues: {},
            } as ClassificationData;

        case 'qa':
            const hasContent = rId !== 'no-content';
            return {
                ...baseData,
                name: '问答标注任务 - AI助手对话',
                content: hasContent ? '一加一等于几？' : '',
                type: 'qa',
                prompts: [
                    {
                        id: 1,
                        prompt: '请回答这个问题',
                        response: [['']],
                        required: true,
                    },
                    {
                        id: 2,
                        prompt: '请提供详细解释',
                        response: [['']],
                        required: false,
                    },
                ],
            } as QAData;

        case 'ranking':
            return {
                ...baseData,
                name: '问答排序标注任务',
                type: 'ranking',
                content: '小白菜',
                prompts: [
                    {
                        id: 1,
                        prompt: '这是什么东西？',
                        responses: [
                            { id: 1, response: '一种绿色蔬菜' },
                            { id: 2, response: '一种农作物' },
                            { id: 3, response: '一种食物' },
                            { id: 4, response: '一种绿色有机蔬菜食品' },
                        ],
                    },
                    {
                        id: 2,
                        prompt: '多少钱一斤',
                        responses: [
                            { id: 1, response: '310分' },
                            { id: 2, response: '31角' },
                            { id: 3, response: '3块1毛' },
                        ],
                    },
                ],
            } as RankingData;

        default:
            throw new Error(`Unknown annotation type: "${type}"`);
    }
}

/**
 * GET /api/labeleditor/detail/mock-data
 * 获取 mock 数据
 * 查询参数: rId, type
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
        const { searchParams } = new URL(request.url);
        const rId = searchParams.get('rId') || '1';
        const type = searchParams.get('type') || 'entity-relation';

        // 模拟 API 延迟
        await new Promise((resolve) => setTimeout(resolve, 500));

        const data = createMockData(rId, type);

        return NextResponse.json({
            code: 0,
            message: 'Success',
            data,
        });
    } catch (error) {
        console.error('Mock data API error:', error);
        return NextResponse.json(
            {
                code: 1,
                message: error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 400 }
        );
    }
}

/**
 * POST /api/labeleditor/detail/mock-data
 * 保存标注数据
 * 请求体: { rId, type, formData }
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
        const body = await request.json();
        const { rId, type, formData, title, description } = body;

        console.log('=== POST 请求数据 ===');
        console.log('rId:', rId);
        console.log('type:', type);
        console.log('formData:', formData);
        console.log('title:', title);
        console.log('description:', description);
        console.log('====================');

        // 验证必需字段
        if (!rId) {
            return NextResponse.json(
                {
                    code: 1,
                    message: 'rId is required',
                },
                { status: 400 }
            );
        }

        if (!type) {
            return NextResponse.json(
                {
                    code: 1,
                    message: 'type is required',
                },
                { status: 400 }
            );
        }

        // 模拟 API 延迟
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 模拟保存成功
        const savedData = {
            id: rId,
            type,
            title: title || '未命名',
            description: description || '',
            formData: formData || {},
            savedAt: new Date().toISOString(),
            status: 'success',
        };

        return NextResponse.json({
            code: 0,
            message: 'Data saved successfully',
            data: savedData,
        });
    } catch (error) {
        console.error('Mock data POST error:', error);
        return NextResponse.json(
            {
                code: 1,
                message: error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 400 }
        );
    }
}

