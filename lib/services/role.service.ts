/**
 * 角色服务层
 * 负责所有角色相关的 API 调用
 */

import { http } from './http';
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  GetRolesParams,
  RoleStats,
  Permission,
  PermissionModule,
  RolePermissionTree,
} from '@/lib/types/role';
import type { PaginatedResponse } from '@/lib/types/api';

/**
 * 角色服务类
 */
export class RoleService {
  private readonly baseUrl = '/api/roles';
  private readonly permissionUrl = '/api/permissions';

  /**
   * 获取角色列表
   */
  async getRoles(params?: GetRolesParams): Promise<PaginatedResponse<Role>> {
    const response = await http.get<PaginatedResponse<Role>>(this.baseUrl, params);
    return response.data;
  }

  /**
   * 获取角色详情
   */
  async getRoleById(id: number): Promise<Role> {
    const response = await http.get<Role>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * 创建角色
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await http.post<Role>(this.baseUrl, data);
    return response.data;
  }

  /**
   * 更新角色
   */
  async updateRole(id: number, data: UpdateRoleRequest): Promise<Role> {
    const response = await http.put<Role>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * 删除角色
   */
  async deleteRole(id: number): Promise<void> {
    await http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * 批量删除角色
   */
  async batchDeleteRoles(ids: number[]): Promise<void> {
    await http.delete(`${this.baseUrl}/batch`, {
      data: { ids },
    });
  }

  /**
   * 获取角色统计信息
   */
  async getRoleStats(): Promise<RoleStats> {
    const response = await http.get<RoleStats>(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * 获取所有权限
   */
  async getPermissions(): Promise<Permission[]> {
    const response = await http.get<Permission[]>(this.permissionUrl);
    return response.data;
  }

  /**
   * 获取权限模块
   */
  async getPermissionModules(): Promise<PermissionModule[]> {
    const response = await http.get<PermissionModule[]>(`${this.permissionUrl}/modules`);
    return response.data;
  }

  /**
   * 获取角色权限树
   */
  async getRolePermissionTree(roleId: number): Promise<RolePermissionTree[]> {
    const response = await http.get<RolePermissionTree[]>(`${this.baseUrl}/${roleId}/permission-tree`);
    return response.data;
  }

  /**
   * 更新角色权限
   */
  async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    await http.put(`${this.baseUrl}/${roleId}/permissions`, {
      permissionIds,
    });
  }

  /**
   * 复制角色
   */
  async copyRole(id: number, newName: string): Promise<Role> {
    const response = await http.post<Role>(`${this.baseUrl}/${id}/copy`, {
      name: newName,
    });
    return response.data;
  }

  /**
   * 启用/禁用角色
   */
  async toggleRoleStatus(id: number): Promise<Role> {
    const response = await http.patch<Role>(`${this.baseUrl}/${id}/toggle-status`);
    return response.data;
  }

  /**
   * 获取角色下的用户
   */
  async getRoleUsers(roleId: number): Promise<any[]> {
    const response = await http.get<any[]>(`${this.baseUrl}/${roleId}/users`);
    return response.data;
  }

  /**
   * 检查角色代码是否可用
   */
  async checkRoleCode(code: string, excludeId?: number): Promise<boolean> {
    const response = await http.get<{ available: boolean }>(`${this.baseUrl}/check-code`, {
      code, excludeId,
    });
    return response.data.available;
  }
}

// 导出单例实例
export const roleService = new RoleService();
