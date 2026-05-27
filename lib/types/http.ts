/**
 * HTTP 请求配置接口
 * 
 * 这个接口定义了一个 HTTP 请求需要的所有配置项。
 * 当我们发送请求时，需要提供这些配置。
 */
export interface RequestConfig {
  // 请求的 URL 路径（不包含域名）
  // 例如：'/api/users' 或 '/api/tasks/123'
  url: string;

  // HTTP 方法：GET、POST、PUT、DELETE、PATCH
  // 默认值是 'GET'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  // 请求头对象
  // 例如：{ 'Authorization': 'Bearer token123' }
  headers?: Record<string, string>;

  // 查询参数（用于 GET 请求）
  // 例如：{ page: 1, limit: 10 }
  // 会被转换为 URL 中的 ?page=1&limit=10
  params?: Record<string, any>;

  // 请求体（用于 POST、PUT、PATCH 请求）
  // 可以是普通对象或 FormData
  data?: any;

  // 请求超时时间（毫秒）
  // 如果请求在这个时间内没有完成，就会被中止
  timeout?: number;
}

/**
 * API 响应的标准格式
 * 
 * 后端返回的数据应该遵循这个格式，这样前端就能统一处理。
 * 
 * 示例：
 * {
 *   code: 0,
 *   message: '成功',
 *   data: { id: 1, name: '张三' }
 * }
 */
export interface ApiResponse<T = any> {
  // 状态码：0 表示成功，其他值表示失败
  code: number;

  // 响应消息：成功或失败的描述
  message: string;

  // 响应数据：实际的业务数据
  // 使用泛型 T，可以让不同的请求有不同的数据类型
  data?: T;
}

/**
 * API 错误信息
 *
 * 当请求失败时，我们会创建这样一个错误对象，
 * 包含错误的详细信息。
 */
export interface ApiError {
  // 错误代码：用于区分不同类型的错误
  // 例如：'NETWORK_ERROR'、'UNAUTHORIZED'、'SERVER_ERROR'
  code: string;

  // 错误消息：用户可读的错误描述
  message: string;

  // 错误详情：包含更多的调试信息
  details?: any;

  // HTTP 状态码
  status?: number;
}

/**
 * 请求拦截器类型
 *
 * 请求拦截器是一个函数，接收请求配置，返回修改后的配置。
 * 可以是同步函数或异步函数。
 *
 * 示例：
 * (config) => {
 *   config.headers = { ...config.headers, 'Authorization': 'Bearer token' };
 *   return config;
 * }
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * 响应拦截器类型
 *
 * 响应拦截器是一个函数，接收响应数据，返回处理后的数据。
 *
 * 示例：
 * (response) => {
 *   if (response.code !== 0) {
 *     throw new Error(response.message);
 *   }
 *   return response.data;
 * }
 */
export type ResponseInterceptor = (response: any) => any;

/**
 * 错误拦截器类型
 *
 * 错误拦截器是一个函数，接收错误对象，进行处理。
 * 可以选择抛出错误或返回恢复的数据。
 *
 * 示例：
 * (error) => {
 *   if (error.status === 401) {
 *     window.location.href = '/login';
 *   }
 *   throw error;
 * }
 */
export type ErrorInterceptor = (error: any) => any;