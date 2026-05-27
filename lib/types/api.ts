/**
 * API 通用类型定义
 */

// 通用 API 响应结构
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// 分页响应结构
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 分页请求参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API 错误类型
export interface ApiError {
  message: string;
  code: number;
  details?: Record<string, any>;
}

// 通用 ID 参数
export interface IdParams {
  id: string | number;
}

// 批量操作参数
export interface BatchParams {
  ids: (string | number)[];
}

// 状态枚举
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted',
}

// 排序方向
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// HTTP 方法
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// 请求配置
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}
