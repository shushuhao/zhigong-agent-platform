/**
 * 服务层统一导出
 * 方便其他模块导入和使用
 */

// HTTP 客户端
export { HttpClient, http as httpClient } from './http';

// 用户服务
import { userService as userServiceInstance, type UserService } from './user.service';
export { userService, type UserService } from './user.service';

// 工作流服务
export { workflowService, type WorkflowService } from './workflow.service';

// 工作流存储服务
export { workflowStorageService, type StoredWorkflowData } from './workflowStorage.service';

// 角色服务（示例）
// export { roleService, type RoleService } from './role.service';

// 认证服务（示例）
// export { authService, type AuthService } from './auth.service';

// 仪表盘服务（示例）
// export { dashboardService, type DashboardService } from './dashboard.service';

/**
 * 所有服务的统一接口
 * 可以用于依赖注入或测试 Mock
 */
export interface ApiServices {
  userService: UserService;
  // roleService: RoleService;
  // authService: AuthService;
  // dashboardService: DashboardService;
}

/**
 * 服务实例集合
 */
export const services: Partial<ApiServices> = {
  userService: userServiceInstance,
  // roleService,
  // authService,
  // dashboardService,
};

/**
 * 获取服务实例
 * @param serviceName 服务名称
 * @returns 服务实例
 */
export function getService<K extends keyof ApiServices>(serviceName: K): ApiServices[K] {
  const service = services[serviceName];
  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }
  return service as ApiServices[K];
}

/**
 * 服务健康检查
 */
export async function checkServicesHealth(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  try {
    // 检查用户服务
    await userServiceInstance.getUserStats();
    results.userService = true;
  } catch {
    results.userService = false;
  }
  
  // 可以添加其他服务的健康检查
  
  return results;
}
