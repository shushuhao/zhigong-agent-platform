import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useMemo,
    useCallback,
    useEffect,
} from 'react';
import { message } from 'antd';
import { getUrlParams } from '../utils/urlParams';
import {
    AnnotationData,
    DataContextType,
} from '../types';

// 导入 mock 数据
import { createMockData, mockApiDelay } from '../mock/data';

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps): React.ReactElement {
    // 使用 state 存储 URL 参数，确保在客户端获取
    const [initialUrlParams, setInitialUrlParams] = useState<ReturnType<typeof getUrlParams> | null>(null);

    const [data, setData] = useState<AnnotationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false); // 提交状态
    const [saving, setSaving] = useState(false); // 暂存状态
    const [error, setError] = useState<string | null>(null);
    const [noAnnotationRequired, setNoAnnotationRequired] = useState(false);

    // 在客户端挂载时获取 URL 参数
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = getUrlParams();
            setInitialUrlParams(params);
            console.log('DataProvider: URL params initialized on client:', params);
        }
    }, []);

    // Mock 模式：简化自动保存定时器相关代码
    const registerAutoSaveTimerCleaner = useCallback((_cleaner: () => void): void => {
        // Mock 模式下不需要实现
        console.log('Mock 模式: 注册自动保存定时器清理函数（无操作）');
    }, []);

    const clearAutoSaveTimer = useCallback((): void => {
        // Mock 模式下不需要实现
        console.log('Mock 模式: 清理自动保存定时器（无操作）');
    }, []);

    const loadData = useCallback(async (_isNext: boolean, rId: string, type: string, _tId?: string, forceReload: boolean = false, setLoadingState: boolean = true): Promise<void> => {

        // 如果已经有相同的数据且不是强制重新加载，不重新加载
        if (!forceReload && data && data.id === rId && data.type === type) {
            return;
        }

        if (setLoadingState) {
            setLoading(true);
        }
        setError(null);

        try {
            // 使用 mock 数据模式
            console.log('DataContext: 使用 mock 数据模式', { rId, type });

            // 模拟 API 延迟
            await mockApiDelay(500);
            console.log('type', type)

            // 创建 mock 数据
            const mockData = createMockData(rId, type);

            // 设置数据
            setData(mockData);
            setNoAnnotationRequired(false);
            setLoading(false);

            console.log('DataContext: Mock 数据加载成功', mockData);
            return;

            // 以下是原来的真实 API 调用代码（已注释）
            /*
            // 尝试调用真实 API
            try {
                // 将 rId 转换为 requirement_id（数字）
                const requirementId = parseInt(rId, 10);
                if (Number.isNaN(requirementId)) {
                    throw new Error(`Invalid requirement_id: ${rId}`);
                }

                // 如果有 tId，也转换为数字
                let taskIdNumber: number | undefined;
                if (tId) {
                    taskIdNumber = parseInt(tId, 10);
                    if (Number.isNaN(taskIdNumber)) {
                        taskIdNumber = undefined;
                    }
                }

                let actualTaskId = null;
                let resultData = null;
                let metaData = null;

                if (isNext) {
                    // 下一个任务：调用 switchNextTask 更新 URL，然后直接使用 URL 中的 tId
                    try {
                        await (window as any).$wujie?.props?.switchNextTask();

                        // 等待一段时间，让主应用处理完成
                        await new Promise((resolve) => { setTimeout(resolve, 500); });

                        // 检查当前页面是否还在标注页面（通过检查URL或其他方式）
                        const currentUrl = window.location.href;

                        // 只有当明确跳转到任务列表页面时才清理定时器
                        if (currentUrl.includes('/taskList')) {
                            clearAutoSaveTimer();
                            setLoading(false);
                            return;
                        }

                        // 重新获取 URL 参数
                        const { tId: newTaskId } = getCurrentUrlParams();

                        if (newTaskId && newTaskId !== taskId) {
                            actualTaskId = newTaskId;
                            setTaskId(actualTaskId);

                            // 获取新任务的元数据（包含 item_path）
                            try {
                                // 重新获取URL参数，因为切换任务后URL可能已经更新
                                const { rId: newRId } = getCurrentUrlParams();
                                const newRequirementId = parseInt(newRId, 10);
                                metaData = await getTaskMetaData(newRequirementId);
                            } catch (metaError) {
                                metaData = null;
                            }

                            // 直接获取任务结果数据
                            try {
                                resultData = await getTaskResultData(Number(actualTaskId));
                            } catch (resultError) {
                                console.error('DataContext: getTaskResultData 失败:', resultError);
                                resultData = null;
                            }
                        } else {
                            clearAutoSaveTimer();
                            setError('没有更多任务');
                            setLoading(false);
                            return;
                        }
                    } catch (switchError) {
                        console.error('DataContext: 切换任务失败:', switchError);
                        setError('切换任务失败');
                        setLoading(false);
                        return;
                    }
                } else {
                    // 正常加载：先获取任务元数据，再获取任务结果数据
                    metaData = await getTaskMetaData(requirementId);
                    if (metaData) {
                        actualTaskId = metaData.task_id?.toString();
                        setTaskId(actualTaskId);

                        // 第二步：获取任务结果数据
                        resultData = await getTaskResultData(Number(actualTaskId));
                    } else {
                        console.log('DataContext: No meta data from API, using URL task_id:', taskUrlId);
                        if (taskUrlId) {
                            actualTaskId = taskUrlId;
                            setTaskId(actualTaskId);
                            resultData = await getTaskResultData(Number(actualTaskId));
                        }
                    }
                }

                // 第三步：如果是分类标注或实体关系标注，获取标签数据
                let labelsData = null;
                if (type === 'classification' || type === 'entity-relation') {
                    try {
                        labelsData = await (window as any).$wujie?.props?.getTextEditorLabels(requirementId);
                    } catch (labelsError) {
                        console.error(`DataContext: Failed to get labels data for ${type}:`, labelsError);
                    }
                }

                // 如果至少有一个API调用成功，或者有标签数据，使用真实数据
                if (metaData || resultData || labelsData) {
                    let remoteJsonData = null;

                    // 获取远程JSON数据的条件：
                    // 1. 没有标注结果时，需要获取原始数据
                    // 2. 有标注结果但缺少type字段时，需要获取type等基础信息
                    const needRemoteJson = !hasAnnotationResult(resultData) ||
                        (resultData && resultData.result && !(resultData.result as any).type);

                    if (needRemoteJson) {
                        remoteJsonData = await fetchRemoteJsonData(metaData.item_path);
                    }
                    console.log('remoteJsonData', remoteJsonData);

                    // if(!remoteJsonData){
                    //     setError('文件解析失败');
                    //     setLoading(false);
                    //     return;
                    // }

                    // 构建最终的处理数据
                    const processedData = buildProcessedData(metaData, resultData, remoteJsonData, labelsData, rId, type);

                    // 根据 result_type 恢复"无需标注"状态
                    if (resultData && resultData.result_type === 0) {
                        setNoAnnotationRequired(true);
                    } else {
                        setNoAnnotationRequired(false);
                    }

                    setData(processedData);
                    setLoading(false);

                    // 强制触发组件重新渲染
                    setTimeout(() => {
                        setData({ ...processedData });
                    }, 100);
                    return;
                }
            } catch (apiError) {
                console.warn('DataContext: Real API failed, falling back to mock data:', apiError);
            }
            console.log('DataContext: Data set successfully');
            */
        } catch (err) {
            console.error('DataContext: Load data error:', err);
            setError(err instanceof Error ? err.message : '加载数据失败');
        } finally {
            setLoading(false);
        }
    }, [clearAutoSaveTimer]);

    // 加载下一个任务（Mock 模式：简化实现）
    const loadNextTask = useCallback(async (): Promise<void> => {
        try {
            // Mock 模式下，简单提示没有更多任务
            message.info('Mock 模式：没有更多任务');
            console.log('DataContext: Mock 模式 - 没有更多任务');
        } catch (loadError) {
            console.error('❌ 加载下一个任务失败:', loadError);
            setError('加载下一个任务失败');
        }
    }, []);

    const submitData = useCallback(async (saveType: 1 | 2 = 2, resultType: 0 | 1 = 1, isManual: boolean = true): Promise<void> => {
        if (!data) {
            console.error('No data available for submitting');
            return;
        }

        const isSubmit = saveType === 2; // 是否为提交操作
        const actionText = isSubmit ? '提交' : '暂存';

        try {
            // 根据操作类型设置不同的状态
            if (isSubmit) {
                setSubmitting(true);
            } else {
                setSaving(true);
            }

            // Mock 模式：模拟 API 延迟
            await mockApiDelay(300);

            // Mock 模式：直接显示成功消息
            console.log(`Mock 模式: ${actionText}数据`, { saveType, resultType, data });

            // 只有手动操作才显示成功提示
            if (isManual && !isSubmit) {
                message.success(`${actionText}成功`);
            }

            // 如果是提交操作（不是暂存），提示用户
            if (isSubmit) {
                message.success('提交成功');
                // Mock 模式下，不自动跳转到下一个任务
                setTimeout(() => {
                    loadNextTask();
                }, 500);
            }
        } catch (err) {
            console.error(`${actionText}failed:`, err);
            message.error(`${actionText}失败`);
            throw err;
        } finally {
            // 根据操作类型重置对应的状态
            if (isSubmit) {
                setSubmitting(false);
            } else {
                setSaving(false);
            }
        }
    }, [data, loadNextTask]);

    const saveData = useCallback(async (isManual: boolean = true): Promise<void> => {
        console.log('sss', data);
        if (!data) return;

        try {
            // 调用 submitData 进行暂存，根据"无需标注"状态设置 result_type
            const resultType = noAnnotationRequired ? 0 : 1;
            await submitData(1, resultType, isManual); // 传递 isManual 参数
        } catch (err) {
            console.error('DataContext: 暂存失败:', err);
            throw err;
        }
    }, [data, noAnnotationRequired, submitData]);

    // 切换"无需标注"状态
    const toggleNoAnnotationRequired = useCallback((): void => {
        setNoAnnotationRequired((prev) => !prev);
    }, []);

    // 更新数据
    const updateData = useCallback((newData: AnnotationData): void => {
        setData(newData);
    }, []);

    // 在客户端自动调用API - 当 URL 参数初始化完成后
    useEffect(() => {
        if (initialUrlParams && typeof window !== 'undefined') {
            // 使用初始 URL 参数
            const { rId, tId, kindParam } = initialUrlParams;

            console.log('DataProvider: Loading data with params:', { rId, tId, kindParam });

            // 直接调用loadData
            loadData(false, rId, kindParam, tId);
        }
    }, [loadData, initialUrlParams]); // 当 initialUrlParams 改变时执行

    const contextValue: DataContextType = useMemo(() => ({
        data,
        loading,
        submitting,
        saving,
        error,
        noAnnotationRequired,
        loadData,
        saveData,
        submitData,
        toggleNoAnnotationRequired,
        updateData,
        clearAutoSaveTimer,
        registerAutoSaveTimerCleaner,
    }), [
        data,
        loading,
        submitting,
        saving,
        error,
        noAnnotationRequired,
        loadData,
        saveData,
        submitData,
        toggleNoAnnotationRequired,
        updateData,
        clearAutoSaveTimer,
        registerAutoSaveTimerCleaner,
    ]);

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
}

export function useDataContext(): DataContextType {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
}
