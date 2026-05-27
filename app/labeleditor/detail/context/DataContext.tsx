'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 基础数据接口（
interface BaseData {
  id: string;
  name: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// 实体关系标注数据接口
interface EntityRelationData extends BaseData {
  type: 'entity-relation';
  entityLabels: any[];
  relationLabels: any[];
  entities: any[];
  relations: any[];
}

// DataContext接口
interface DataContextType {
  // 数据状态
  data: EntityRelationData | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;

  // 通用状态
  noAnnotationRequired: boolean;

  // 方法
  loadData: (taskId: string) => Promise<void>;
  saveData: (isManual?: boolean) => Promise<void>;
  submitData: (submitType: number, resultType: number, showMessage?: boolean) => Promise<void>;
  toggleNoAnnotationRequired: () => void;
}

// 创建Context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider组件
interface DataProviderProps {
  children: ReactNode;
  taskId?: string;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, taskId }) => {
  // 状态管理
  const [data, setData] = useState<EntityRelationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [noAnnotationRequired, setNoAnnotationRequired] = useState(false);

  // 加载数据
  const loadData = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // 并行获取任务信息、标签配置和标注结果
      const [taskResponse, labelsResponse, resultResponse] = await Promise.all([
        fetch(`/api/labeleditor/getTask/${id}`),
        fetch(`/api/labeleditor/getLabels/${id}`),
        fetch(`/api/labeleditor/getTaskResult/${id}`)
      ]);

      if (!taskResponse.ok || !labelsResponse.ok) {
        throw new Error('获取数据失败');
      }

      const taskData = await taskResponse.json();
      const labelsData = await labelsResponse.json();

      // 标注结果可能不存在（首次标注）
      let resultData = { data: { result: { entities: [], relations: [] } } };
      if (resultResponse.ok) {
        resultData = await resultResponse.json();
      }

      // 组合数据
      const combinedData: EntityRelationData = {
        type: 'entity-relation',
        id: taskData.data.id,
        name: taskData.data.name,
        content: taskData.data.content,
        createdAt: taskData.data.createdAt,
        updatedAt: taskData.data.updatedAt,
        entityLabels: labelsData.data.entityLabels,
        relationLabels: labelsData.data.relationLabels,
        entities: resultData.data.result.entities,
        relations: resultData.data.result.relations,
      };

      setData(combinedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存数据
  const saveData = async (isManual = false) => {
    if (!data) return;

    try {
      const response = await fetch('/api/labeleditor/saveTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: data.id,
          result: {
            entities: data.entities,
            relations: data.relations,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      const result = await response.json();

      // 更新最后保存时间
      setData(prev => prev ? {
        ...prev,
        updatedAt: result.data.savedAt
      } : null);

      if (isManual) {
        // 显示保存成功提示
        console.log('保存成功');
      }
    } catch (err) {
      console.error('保存失败:', err);
      throw err;
    }
  };

  // 提交数据
  const submitData = async (submitType: number, resultType: number, showMessage = true) => {
    if (!data) return;

    setSubmitting(true);
    try {
      // 先保存当前数据
      await saveData(false);

      // 这里可以添加提交逻辑
      console.log('提交数据:', { submitType, resultType });

      if (showMessage) {
        console.log('提交成功');
      }
    } catch (err) {
      console.error('提交失败:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // 切换无需标注状态
  const toggleNoAnnotationRequired = () => {
    setNoAnnotationRequired(prev => !prev);
  };

  // 自动加载数据
  useEffect(() => {
    if (taskId) {
      loadData(taskId);
    }
  }, [taskId]);

  const contextValue: DataContextType = {
    data,
    loading,
    error,
    submitting,
    noAnnotationRequired,
    loadData,
    saveData,
    submitData,
    toggleNoAnnotationRequired,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Hook
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};