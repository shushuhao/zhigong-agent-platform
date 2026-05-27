import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import type { ApiResponse } from '@/lib/types';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showError?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

/**
 * 通用 API 请求 Hook
 * @param apiFunction API 函数
 * @param options 配置选项
 * @returns API 请求结果和控制方法
 */
function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    immediate = false,
    onSuccess,
    onError,
    showError = true,
    showSuccess = false,
    successMessage,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFunction(...args);
        const result = response.data;

        setData(result);
        
        if (showSuccess && successMessage) {
          message.success(successMessage);
        }
        
        onSuccess?.(result);
        
        return result;
      } catch (err: any) {
        const errorMessage = err.message || '请求失败';
        setError(errorMessage);
        
        if (showError) {
          message.error(errorMessage);
        }
        
        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, showError, showSuccess, successMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

export default useApi;
