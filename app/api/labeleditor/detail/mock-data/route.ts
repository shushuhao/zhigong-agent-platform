import { NextRequest, NextResponse } from 'next/server';
import { createMockData } from '../../../../labeleditor/detail/mock/data';
import type { ApiResponse } from '../../../../labeleditor/detail/types';

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

        await new Promise((resolve) => setTimeout(resolve, 500));

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
