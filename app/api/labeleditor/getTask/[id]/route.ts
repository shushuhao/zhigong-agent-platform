import { NextRequest, NextResponse } from 'next/server';
import { mockTaskData } from '../../mockData';

// 获取任务信息
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));

        const { id } = await params;
        const taskId = id;
        console.log('获取任务数据，任务ID:', taskId);

        // 模拟根据任务ID获取不同的数据
        const taskData = {
            ...mockTaskData,
            id: taskId,
            name: `${mockTaskData.name} - ${taskId}`
        };

        return NextResponse.json({
            code: 0,
            message: 'success',
            data: taskData
        });

    } catch (error) {
        console.error('获取任务数据失败:', error);
        return NextResponse.json(
            {
                code: 1,
                message: '获取任务数据失败',
                data: null
            },
            { status: 500 }
        );
    }
}