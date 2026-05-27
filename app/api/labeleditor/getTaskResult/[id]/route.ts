import { NextRequest, NextResponse } from 'next/server';
import { taskStorage } from '../../mockData';

// 获取标注结果
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));

        const { id } = await params;
        const taskId = id;
        console.log('获取标注结果，任务ID:', taskId);

        // 从内存存储中获取标注结果
        const taskResult = taskStorage.get(taskId);

        if (!taskResult) {
            // 如果没有标注结果，返回空数据
            return NextResponse.json({
                code: 0,
                message: 'success',
                data: {
                    taskId,
                    result: {
                        entities: [],
                        relations: []
                    },
                    lastSaved: ''
                }
            });
        }

        return NextResponse.json({
            code: 0,
            message: 'success',
            data: taskResult
        });

    } catch (error) {
        console.error('获取标注结果失败:', error);
        return NextResponse.json(
            {
                code: 1,
                message: '获取标注结果失败',
                data: null
            },
            { status: 500 }
        );
    }
}