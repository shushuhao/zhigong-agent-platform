import { API_BASE_URL } from '@/lib/constants';
import type {
  RequestConfig,
  ApiResponse,
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from '@/lib/types/http';

/**
 * HTTP 状态码常量
 *
 * 这些是常见的 HTTP 状态码，我们用它们来判断请求是否成功。
 * - 2xx：成功
 * - 4xx：客户端错误
 * - 5xx：服务器错误
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

class HttpClient {
  /**
   * API 基础 URL
   *
   * 所有相对 URL 的请求都会基于这个 URL。
   * 例如：如果 baseURL 是 'https://api.example.com'，
   * 请求 '/users' 会变成 'https://api.example.com/users'
   */
  private baseURL: string;

  /**
   * 请求超时时间（毫秒）
   *
   * 如果请求在这个时间内没有完成，就会被中止。
   * 默认值是 10000 毫秒（10 秒）。
   */
  private timeout: number;

  /**
   * 请求拦截器数组
   *
   * 存储所有注册的请求拦截器。
   * 当发送请求时，会依次执行这些拦截器。
   */
  private requestInterceptors: RequestInterceptor[] = [];

  /**
   * 响应拦截器数组
   *
   * 存储所有注册的响应拦截器。
   * 当收到响应时，会依次执行这些拦截器。
   */
  private responseInterceptors: ResponseInterceptor[] = [];

  /**
   * 错误拦截器数组
   *
   * 存储所有注册的错误拦截器。
   * 当请求出错时，会依次执行这些拦截器。
   */
  private errorInterceptors: ErrorInterceptor[] = [];



  /**
   * 创建 HttpClient 实例
   *
   * @param baseURL - API 基础 URL，默认从环境变量读取
   * @param timeout - 请求超时时间，默认 10000 毫秒
   *
   * 示例：
   * const http = new HttpClient('https://api.example.com', 15000);
   */
  constructor(baseURL = API_BASE_URL, timeout = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.setupDefaultInterceptors();
  }


  /**
   * 添加请求拦截器
   *
   * 请求拦截器会在请求发送前执行。
   * 可以用来添加认证头、验证参数等。
   *
   * @param interceptor - 拦截器函数
   */
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   *
   * 响应拦截器会在收到响应后执行。
   * 可以用来统一处理响应格式、检查状态码等。
   *
   * @param interceptor - 拦截器函数
   */
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 添加错误拦截器
   *
   * 错误拦截器会在请求出错时执行。
   * 可以用来统一处理错误、显示错误提示等。
   *
   * @param interceptor - 拦截器函数
   */
  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
  }


  /**
   * 设置默认拦截器
   *
   * 这个方法会添加一些默认的拦截器，这些拦截器会对所有请求生效。
   *
   * 包括：
   * 1. 请求拦截器：添加认证令牌
   * 2. 响应拦截器：处理响应格式
   * 3. 错误拦截器：处理错误
   */
  private setupDefaultInterceptors() {
    // ========== 请求拦截器 ==========
    // 这个拦截器会在每个请求发送前执行
    // 它的作用是自动添加认证令牌到请求头
    this.addRequestInterceptor((config) => {
      // 从本地存储获取认证令牌
      // 注意：typeof window !== 'undefined' 是为了兼容 SSR（服务端渲染）
      // 在服务端没有 window 对象，所以需要检查
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('auth_token')
        : null;

      // 如果有令牌，就添加到请求头
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    });

    // ========== 响应拦截器 ==========
    // 这个拦截器会在收到响应后执行
    // 它的作用是处理响应格式和检查 HTTP 状态码
    this.addResponseInterceptor((response) => {
      // 如果响应是 Response 对象（来自 fetch），需要先转换为 JSON
      if (response instanceof Response) {
        return response.json().then(data => {
          // 检查 HTTP 状态码
          // response.ok 表示状态码在 200-299 之间
          if (!response.ok) {
            throw new Error(data.message || '请求失败');
          }
          return data;
        });
      }
      return response;
    });

    // ========== 错误拦截器 ==========
    // 这个拦截器会在请求出错时执行
    // 它的作用是处理特殊的错误情况
    this.addErrorInterceptor((error) => {
      // 如果是 401 未授权错误，说明用户的认证信息已过期
      // 需要清除本地存储的认证信息并跳转到登录页
      if (error.status === HTTP_STATUS.UNAUTHORIZED) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
          window.location.href = '/login';
        }
      }
      throw error;
    });
  }


  /**
   * 应用所有请求拦截器
   *
   * 这个方法会依次执行所有注册的请求拦截器。
   * 每个拦截器都会接收前一个拦截器的输出作为输入。
   *
   * 执行流程：
   * 1. 初始配置 -> 拦截器1 -> 拦截器2 -> ... -> 最终配置
   *
   * @param config - 原始请求配置
   * @returns 处理后的请求配置
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  /**
   * 应用所有响应拦截器
   *
   * 这个方法会依次执行所有注册的响应拦截器。
   *
   * @param response - 原始响应数据
   * @returns 处理后的响应数据
   */
  private async applyResponseInterceptors(response: any): Promise<any> {
    let finalResponse = response;
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }
    return finalResponse;
  }

  /**
   * 应用所有错误拦截器
   *
   * 这个方法会依次执行所有注册的错误拦截器。
   *
   * @param error - 原始错误对象
   * @returns 处理后的错误对象
   */
  private async applyErrorInterceptors(error: any): Promise<any> {
    let finalError = error;
    for (const interceptor of this.errorInterceptors) {
      try {
        finalError = await interceptor(finalError);
      } catch (e) {
        finalError = e;
      }
    }
    return finalError;
  }

  /**
   * 构建完整的请求 URL
   *
   * 这个方法会：
   * 1. 检查 URL 是否已经是完整的（以 http 开头）
   * 2. 如果不是，就拼接 baseURL
   * 3. 如果有查询参数，就添加到 URL 后面
   *
   * 示例：
   * buildURL('/api/users', { page: 1, limit: 10 })
   * // 返回：'https://api.example.com/api/users?page=1&limit=10'
   *
   * @param url - 请求 URL（可以是相对或绝对）
   * @param params - 查询参数对象
   * @returns 完整的 URL
   */
  private buildURL(url: string, params?: Record<string, any>): string {
    // 如果 URL 已经是完整的（以 http 开头），就直接使用
    // 否则，拼接 baseURL
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // 如果有查询参数，就添加到 URL 后面
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        // 只添加非空的参数
        if (value !== null && value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      return queryString ? `${fullURL}?${queryString}` : fullURL;
    }

    return fullURL;
  }


  /**
   * 通用请求方法
   *
   * 这是所有 HTTP 请求的核心方法。
   * 其他方法（get、post 等）都是基于这个方法实现的。
   *
   * 执行流程：
   * 1. 应用请求拦截器
   * 2. 构建请求头
   * 3. 构建 fetch 选项
   * 4. 添加请求体（如果有的话）
   * 5. 构建完整 URL
   * 6. 发送 fetch 请求
   * 7. 应用响应拦截器
   * 8. 返回响应数据
   *
   * 如果出错，会应用错误拦截器，然后抛出错误。
   *
   * @param config - 请求配置
   * @returns API 响应
   */
  private async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      // 第一步：应用请求拦截器
      // 这会自动添加认证令牌等信息
      const finalConfig = await this.applyRequestInterceptors(config);

      // 第二步：构建请求头
      // 默认设置 Content-Type 为 application/json
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...finalConfig.headers,
      };

      // 第三步：构建 fetch 选项
      const fetchOptions: RequestInit = {
        method: finalConfig.method || 'GET',
        headers,
        // 使用 AbortSignal.timeout 实现超时控制
        // 如果请求在指定时间内没有完成，就会被中止
        signal: AbortSignal.timeout(finalConfig.timeout || this.timeout),
      };

      // 第四步：添加请求体（如果有的话）
      // 只有 POST、PUT、PATCH 请求才需要请求体
      if (finalConfig.data && ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method!)) {
        if (finalConfig.data instanceof FormData) {
          // FormData 不需要设置 Content-Type，浏览器会自动设置
          // 包括 boundary 等信息
          delete headers['Content-Type'];
          fetchOptions.body = finalConfig.data;
        } else {
          // 普通对象转换为 JSON 字符串
          fetchOptions.body = JSON.stringify(finalConfig.data);
        }
      }

      // 第五步：构建完整 URL
      const url = this.buildURL(finalConfig.url, finalConfig.params);

      // 第六步：发送 fetch 请求
      const response = await fetch(url, fetchOptions);

      // 第七步：应用响应拦截器
      // 这会处理响应格式、检查状态码等
      const data = await this.applyResponseInterceptors(response);

      return data;
    } catch (error: any) {
      // 构建错误对象
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || '未知错误',
        details: error,
      };

      // 应用错误拦截器
      // 这会处理特殊的错误情况，比如 401 未授权
      await this.applyErrorInterceptors(apiError);

      throw apiError;
    }
  }


  /**
   * GET 请求
   *
   * 用于获取数据，不修改服务器状态。
   *
   * 使用示例：
   * const response = await http.get('/api/users', { page: 1, limit: 10 });
   *
   * @param url - 请求 URL
   * @param params - 查询参数
   * @param config - 额外的请求配置
   * @returns API 响应
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      params,
      ...config,
    });
  }

  /**
   * POST 请求
   *
   * 用于创建新资源。
   *
   * 使用示例：
   * const response = await http.post('/api/users', { name: '张三', age: 25 });
   *
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param config - 额外的请求配置
   * @returns API 响应
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config,
    });
  }

  /**
   * PUT 请求
   *
   * 用于完全替换一个资源。
   *
   * 使用示例：
   * const response = await http.put('/api/users/1', { name: '李四', age: 30 });
   *
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param config - 额外的请求配置
   * @returns API 响应
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config,
    });
  }

  /**
   * PATCH 请求
   *
   * 用于部分更新一个资源。
   *
   * 使用示例：
   * const response = await http.patch('/api/users/1', { age: 31 });
   *
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param config - 额外的请求配置
   * @returns API 响应
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config,
    });
  }

  /**
   * DELETE 请求
   *
   * 用于删除一个资源。
   *
   * 使用示例：
   * const response = await http.delete('/api/users/1');
   *
   * @param url - 请求 URL
   * @param config - 额外的请求配置
   * @returns API 响应
   */
  async delete<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...config,
    });
  }
}

/**
 * 创建默认的 HttpClient 实例
 *
 * 这个实例会被整个应用使用。
 * 我们可以在这个实例上添加全局的拦截器。
 *
 * 使用示例：
 * import { http } from '@/lib/services/http';
 *
 * const response = await http.get('/api/users');
 */
export const http = new HttpClient();

// 导出 HttpClient 类，以便需要时创建新实例
export { HttpClient };

// 导出类型，以便在其他文件中使用
export type { RequestConfig, ApiResponse, ApiError };