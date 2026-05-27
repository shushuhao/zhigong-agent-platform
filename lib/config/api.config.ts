/**
 * API 配置和常量
 */

// API 基础配置
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
};

// API 端点配置
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    REGISTER: '/auth/register',
    CHANGE_PASSWORD: '/auth/change-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // 用户相关
  USERS: {
    LIST: '/users',
    DETAIL: (id: number) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
    BATCH_DELETE: '/users/batch',
    STATS: '/users/stats',
    SEARCH: '/users/search',
    IMPORT: '/users/import',
    EXPORT: '/users/export',
    CHANGE_PASSWORD: (id: number) => `/users/${id}/change-password`,
    RESET_PASSWORD: '/users/reset-password',
    TOGGLE_STATUS: (id: number) => `/users/${id}/toggle-status`,
    PERMISSIONS: (id: number) => `/users/${id}/permissions`,
  },
  
  // 角色相关
  ROLES: {
    LIST: '/roles',
    DETAIL: (id: number) => `/roles/${id}`,
    CREATE: '/roles',
    UPDATE: (id: number) => `/roles/${id}`,
    DELETE: (id: number) => `/roles/${id}`,
    BATCH_DELETE: '/roles/batch',
    STATS: '/roles/stats',
    COPY: (id: number) => `/roles/${id}/copy`,
    TOGGLE_STATUS: (id: number) => `/roles/${id}/toggle-status`,
    USERS: (id: number) => `/roles/${id}/users`,
    PERMISSION_TREE: (id: number) => `/roles/${id}/permission-tree`,
    PERMISSIONS: (id: number) => `/roles/${id}/permissions`,
    CHECK_CODE: '/roles/check-code',
  },
  
  // 权限相关
  PERMISSIONS: {
    LIST: '/permissions',
    MODULES: '/permissions/modules',
  },
  
  // 仪表盘相关
  DASHBOARD: {
    STATS: '/dashboard/stats',
    CHARTS: '/dashboard/charts',
    USER_GROWTH: '/dashboard/user-growth',
    ACTIVITY_LOG: '/dashboard/activity-log',
  },
};

// HTTP 状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// 错误消息映射
export const ERROR_MESSAGES = {
  [HTTP_STATUS.BAD_REQUEST]: '请求参数错误',
  [HTTP_STATUS.UNAUTHORIZED]: '未授权，请重新登录',
  [HTTP_STATUS.FORBIDDEN]: '权限不足',
  [HTTP_STATUS.NOT_FOUND]: '资源不存在',
  [HTTP_STATUS.CONFLICT]: '资源冲突',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: '数据验证失败',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [HTTP_STATUS.BAD_GATEWAY]: '网关错误',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: '服务不可用',
  NETWORK_ERROR: '网络连接失败',
  TIMEOUT: '请求超时',
  UNKNOWN: '未知错误',
} as const;

// API 请求方法枚举
export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// 内容类型
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
} as const;

// 缓存策略
export const CACHE_STRATEGIES = {
  NO_CACHE: 'no-cache',
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
} as const;

/**
 * 构建完整的 API URL
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * 获取错误消息
 */
export function getErrorMessage(status: number): string {
  return ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.UNKNOWN;
}

/**
 * 检查是否为成功状态码
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * 检查是否为客户端错误
 */
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * 检查是否为服务器错误
 */
export function isServerError(status: number): boolean {
  return status >= 500;
}
