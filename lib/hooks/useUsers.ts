import React, { useState, useCallback } from 'react';
import { message } from 'antd';
import { api } from '@/lib/services/api';
import useApi from './useApi';
import usePagination from './usePagination';
import type { User, CreateUserRequest, UpdateUserRequest, PaginationParams } from '@/lib/types';

interface UseUsersOptions {
  immediate?: boolean;
  pageSize?: number;
}

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: ReturnType<typeof usePagination>;
  searchParams: {
    search: string;
    status?: string;
    roleId?: number;
  };
  setSearchParams: (params: any) => void;
  createUser: (userData: CreateUserRequest) => Promise<User>;
  updateUser: (id: number, userData: UpdateUserRequest) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  batchDeleteUsers: (ids: number[]) => Promise<void>;
  refreshUsers: () => Promise<void>;
  exportUsers: () => Promise<void>;
  importUsers: (file: File) => Promise<void>;
}

function useUsers(options: UseUsersOptions = {}): UseUsersResult {
  const { immediate = true, pageSize = 10 } = options;

  const [searchParams, setSearchParams] = useState({
    search: '',
    status: undefined as string | undefined,
    roleId: undefined as number | undefined,
  });

  const pagination = usePagination({ pageSize });

  // 获取用户列表
  const {
    data: users = [],
    loading,
    error,
    execute: fetchUsers,
  } = useApi(
    (params: PaginationParams) => api.user.getUsers(params),
    { immediate: false }
  );

  // 创建用户
  const createUser = useCallback(async (userData: CreateUserRequest): Promise<User> => {
    try {
      const response = await api.user.createUser(userData);
      message.success('用户创建成功');
      await refreshUsers();
      return response.data;
    } catch (error: any) {
      message.error(error.message || '创建用户失败');
      throw error;
    }
  }, []);

  // 更新用户
  const updateUser = useCallback(async (id: number, userData: UpdateUserRequest): Promise<User> => {
    try {
      const response = await api.user.updateUser(id, userData);
      message.success('用户更新成功');
      await refreshUsers();
      return response.data;
    } catch (error: any) {
      message.error(error.message || '更新用户失败');
      throw error;
    }
  }, []);

  // 删除用户
  const deleteUser = useCallback(async (id: number): Promise<void> => {
    try {
      await api.user.deleteUser(id);
      message.success('用户删除成功');
      await refreshUsers();
    } catch (error: any) {
      message.error(error.message || '删除用户失败');
      throw error;
    }
  }, []);

  // 批量删除用户
  const batchDeleteUsers = useCallback(async (ids: number[]): Promise<void> => {
    try {
      await api.user.batchDeleteUsers(ids);
      message.success(`成功删除 ${ids.length} 个用户`);
      await refreshUsers();
    } catch (error: any) {
      message.error(error.message || '批量删除失败');
      throw error;
    }
  }, []);

  // 导出用户
  const exportUsers = useCallback(async (): Promise<void> => {
    try {
      await api.user.exportUsers();
      message.success('用户数据导出成功');
    } catch (error: any) {
      message.error(error.message || '导出失败');
      throw error;
    }
  }, []);

  // 导入用户
  const importUsers = useCallback(async (file: File): Promise<void> => {
    try {
      await api.user.importUsers(file);
      message.success('用户数据导入成功');
      await refreshUsers();
    } catch (error: any) {
      message.error(error.message || '导入失败');
      throw error;
    }
  }, []);

  // 刷新用户列表
  const refreshUsers = useCallback(async (): Promise<void> => {
    const params: PaginationParams = {
      page: pagination.current,
      limit: pagination.pageSize,
      ...searchParams,
    };
    
    const response = await fetchUsers(params);
    
    // 更新分页信息
    if (response && typeof response === 'object' && 'total' in response) {
      pagination.setTotal(response.total as number);
    }
  }, [pagination.current, pagination.pageSize, searchParams, fetchUsers]);

  // 当分页或搜索参数变化时，重新获取数据
  React.useEffect(() => {
    if (immediate) {
      refreshUsers();
    }
  }, [pagination.current, pagination.pageSize, searchParams, immediate]);

  return {
    users,
    loading,
    error,
    pagination,
    searchParams,
    setSearchParams,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    refreshUsers,
    exportUsers,
    importUsers,
  };
}

export default useUsers;
