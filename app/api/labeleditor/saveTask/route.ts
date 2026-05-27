import { NextRequest, NextResponse } from 'next/server';
import { taskStorage, TaskResult } from '../mockData';

// 保存标注结果
export async function POST(request: NextRequest) {
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        const requestData = await request.json();
        console.log('保存标注结果:', requestData);

        // 验证请求数据格式
        if (!requestData.taskId || !requestData.result) {
            return NextResponse.json(
                {
                    code: 1,
                    message: '请求数据格式不正确',
                    data: null
                },
                { status: 400 }
            );
        }

        const { taskId, result } = requestData;

        // 验证result结构
        if (!result.entities || !result.relations) {
            return NextResponse.json(
                {
                    code: 1,
                    message: 'result数据结构不正确',
                    data: null
                },
                { status: 400 }
            );
        }

        // 创建标注结果对象
        const taskResult: TaskResult = {
            taskId,
            result: {
                entities: result.entities,
                relations: result.relations
            },
            lastSaved: new Date().toISOString()
        };

        // 保存到内存存储
        taskStorage.set(taskId, taskResult);

        console.log('保存成功，实体数量:', result.entities.length);
        console.log('保存成功，关系数量:', result.relations.length);

        return NextResponse.json({
            code: 0,
            message: '保存成功',
            data: {
                taskId,
                savedAt: taskResult.lastSaved,
                entityCount: result.entities.length,
                relationCount: result.relations.length
            }
        });

    } catch (error) {
        console.error('保存标注结果失败:', error);
        return NextResponse.json(
            {
                code: 1,
                message: '保存失败',
                data: null
            },
            { status: 500 }
        );
    }
}
