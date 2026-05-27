/**
 * 角色相关类型定义
 */

import { Status, PaginationParams } from './api';

// 权限定义
export interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  module: string;
  actions: string[]; // ['read', 'write', 'delete']
}

// 角色基础信息
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: Status;
  permissions: Permission[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

// 创建角色请求
export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  permissionIds: number[];
  status?: Status;
}

// 更新角色请求
export interface UpdateRoleRequest {
  name?: string;
  code?: string;
  description?: string;
  permissionIds?: number[];
  status?: Status;
}

// 角色查询参数
export interface GetRolesParams extends PaginationParams {
  status?: Status;
  module?: string;
}

// 角色统计信息
export interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  systemRoles: number;
  customRoles: number;
}

// 权限模块
export interface PermissionModule {
  name: string;
  code: string;
  permissions: Permission[];
}

// 角色权限树
export interface RolePermissionTree {
  module: string;
  permissions: {
    id: number;
    name: string;
    code: string;
    actions: {
      action: string;
      allowed: boolean;
    }[];
  }[];
}
