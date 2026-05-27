import { NextRequest, NextResponse } from 'next/server';
import { mockLabelsData, mockClassificationLabels, mockQALabels, mockRankingLabels } from '../../mockData';

// 获取标签配置
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 400));

        const { id } = await params;
        const taskId = id;

        // 获取标注类型参数
        const url = new URL(request.url);
        const annotationType = url.searchParams.get('type') || 'entity-relation';

        console.log('获取标签配置，任务ID:', taskId, '标注类型:', annotationType);

        // 根据标注类型返回不同的标签配置
        let labelsData;
        switch (annotationType) {
            case 'classification':
                labelsData = mockClassificationLabels;
                break;
            case 'qa':
                labelsData = mockQALabels;
                break;
            case 'ranking':
                labelsData = mockRankingLabels;
                break;
            case 'entity-relation':
            default:
                labelsData = mockLabelsData;
                break;
        }

        return NextResponse.json({
            code: 0,
            message: 'success',
            data: labelsData
        });

    } catch (error) {
        console.error('获取标签配置失败:', error);
        return NextResponse.json(
            {
                code: 1,
                message: '获取标签配置失败',
                data: null
            },
            { status: 500 }
        );
    }
}