import { http } from './http';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Role,
  Permission,
  Product,
  Category,
  Order,
  DashboardStats,
  SystemSettings,
  Notification,
  PaginationParams,
  ApiResponse,
} from '@/lib/types';

// 认证相关 API
export const authApi = {
  // 登录
  login: (email: string, password: string) =>
    http.post<{ token: string; refreshToken: string; user: User }>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password }
    ),

  // 注册
  register: (userData: CreateUserRequest) =>
    http.post<User>(API_ENDPOINTS.AUTH.REGISTER, userData),

  // 退出登录
  logout: () =>
    http.post(API_ENDPOINTS.AUTH.LOGOUT),

  // 刷新令牌
  refreshToken: (refreshToken: string) =>
    http.post<{ token: string; refreshToken: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    ),

  // 获取用户信息
  getProfile: () =>
    http.get<User>(API_ENDPOINTS.AUTH.PROFILE),

  // 修改密码
  changePassword: (oldPassword: string, newPassword: string) =>
    http.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      oldPassword,
      newPassword,
    }),
};

// 用户管理 API
export const userApi = {
  // 获取用户列表
  getUsers: (params: PaginationParams) =>
    http.get<User[]>(API_ENDPOINTS.USERS.LIST, params),

  // 创建用户
  createUser: (userData: CreateUserRequest) =>
    http.post<User>(API_ENDPOINTS.USERS.CREATE, userData),

  // 更新用户
  updateUser: (id: number, userData: UpdateUserRequest) =>
    http.put<User>(API_ENDPOINTS.USERS.UPDATE(id), userData),

  // 删除用户
  deleteUser: (id: number) =>
    http.delete(API_ENDPOINTS.USERS.DELETE(id)),

  // 获取用户详情
  getUserDetail: (id: number) =>
    http.get<User>(API_ENDPOINTS.USERS.DETAIL(id)),

  // 批量删除用户
  batchDeleteUsers: (ids: number[]) =>
    http.post(API_ENDPOINTS.USERS.BATCH_DELETE, { ids }),

  // 导出用户数据
  exportUsers: (params?: any) =>
    http.download(API_ENDPOINTS.USERS.EXPORT, 'users.xlsx'),

  // 导入用户数据
  importUsers: (file: File) =>
    http.upload(API_ENDPOINTS.USERS.IMPORT, file),
};

// 角色权限 API
export const roleApi = {
  // 获取角色列表
  getRoles: (params?: PaginationParams) =>
    http.get<Role[]>(API_ENDPOINTS.ROLES.LIST, params),

  // 创建角色
  createRole: (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) =>
    http.post<Role>(API_ENDPOINTS.ROLES.CREATE, roleData),

  // 更新角色
  updateRole: (id: number, roleData: Partial<Role>) =>
    http.put<Role>(API_ENDPOINTS.ROLES.UPDATE(id), roleData),

  // 删除角色
  deleteRole: (id: number) =>
    http.delete(API_ENDPOINTS.ROLES.DELETE(id)),

  // 获取权限列表
  getPermissions: () =>
    http.get<Permission[]>(API_ENDPOINTS.ROLES.PERMISSIONS),

  // 分配权限
  assignPermissions: (roleId: number, permissionIds: number[]) =>
    http.post(API_ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(roleId), {
      permissionIds,
    }),
};

// 商品管理 API
export const productApi = {
  // 获取商品列表
  getProducts: (params: PaginationParams) =>
    http.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST, params),

  // 创建商品
  createProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    http.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, productData),

  // 更新商品
  updateProduct: (id: number, productData: Partial<Product>) =>
    http.put<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), productData),

  // 删除商品
  deleteProduct: (id: number) =>
    http.delete(API_ENDPOINTS.PRODUCTS.DELETE(id)),

  // 获取商品详情
  getProductDetail: (id: number) =>
    http.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id)),

  // 批量更新商品
  batchUpdateProducts: (updates: Array<{ id: number; data: Partial<Product> }>) =>
    http.post(API_ENDPOINTS.PRODUCTS.BATCH_UPDATE, { updates }),

  // 获取商品分类
  getProductCategories: () =>
    http.get<Category[]>(API_ENDPOINTS.PRODUCTS.CATEGORIES),
};

// 分类管理 API
export const categoryApi = {
  // 获取分类列表
  getCategories: (params?: PaginationParams) =>
    http.get<Category[]>(API_ENDPOINTS.CATEGORIES.LIST, params),

  // 创建分类
  createCategory: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) =>
    http.post<Category>(API_ENDPOINTS.CATEGORIES.CREATE, categoryData),

  // 更新分类
  updateCategory: (id: number, categoryData: Partial<Category>) =>
    http.put<Category>(API_ENDPOINTS.CATEGORIES.UPDATE(id), categoryData),

  // 删除分类
  deleteCategory: (id: number) =>
    http.delete(API_ENDPOINTS.CATEGORIES.DELETE(id)),

  // 获取分类树
  getCategoryTree: () =>
    http.get<Category[]>(API_ENDPOINTS.CATEGORIES.TREE),
};

// 订单管理 API
export const orderApi = {
  // 获取订单列表
  getOrders: (params: PaginationParams) =>
    http.get<Order[]>(API_ENDPOINTS.ORDERS.LIST, params),

  // 创建订单
  createOrder: (orderData: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) =>
    http.post<Order>(API_ENDPOINTS.ORDERS.CREATE, orderData),

  // 更新订单
  updateOrder: (id: number, orderData: Partial<Order>) =>
    http.put<Order>(API_ENDPOINTS.ORDERS.UPDATE(id), orderData),

  // 删除订单
  deleteOrder: (id: number) =>
    http.delete(API_ENDPOINTS.ORDERS.DELETE(id)),

  // 获取订单详情
  getOrderDetail: (id: number) =>
    http.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(id)),

  // 获取订单统计
  getOrderStatistics: (params?: { startDate?: string; endDate?: string }) =>
    http.get<any>(API_ENDPOINTS.ORDERS.STATISTICS, params),
};

// 文件上传 API
export const uploadApi = {
  // 上传图片
  uploadImage: (file: File, onProgress?: (progress: number) => void) =>
    http.upload<{ url: string }>(API_ENDPOINTS.UPLOAD.IMAGE, file, onProgress),

  // 上传文件
  uploadFile: (file: File, onProgress?: (progress: number) => void) =>
    http.upload<{ url: string }>(API_ENDPOINTS.UPLOAD.FILE, file, onProgress),

  // 上传头像
  uploadAvatar: (file: File, onProgress?: (progress: number) => void) =>
    http.upload<{ url: string }>(API_ENDPOINTS.UPLOAD.AVATAR, file, onProgress),
};

// 统计分析 API
export const analyticsApi = {
  // 获取仪表盘统计数据
  getDashboardStats: () =>
    http.get<DashboardStats>(API_ENDPOINTS.ANALYTICS.DASHBOARD),

  // 获取用户统计
  getUserAnalytics: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    http.get<any>(API_ENDPOINTS.ANALYTICS.USERS, params),

  // 获取订单统计
  getOrderAnalytics: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    http.get<any>(API_ENDPOINTS.ANALYTICS.ORDERS, params),

  // 获取收入统计
  getRevenueAnalytics: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    http.get<any>(API_ENDPOINTS.ANALYTICS.REVENUE, params),

  // 获取商品统计
  getProductAnalytics: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    http.get<any>(API_ENDPOINTS.ANALYTICS.PRODUCTS, params),
};

// 系统设置 API
export const settingsApi = {
  // 获取通用设置
  getGeneralSettings: () =>
    http.get<SystemSettings>(API_ENDPOINTS.SETTINGS.GENERAL),

  // 更新通用设置
  updateGeneralSettings: (settings: Partial<SystemSettings>) =>
    http.put<SystemSettings>(API_ENDPOINTS.SETTINGS.GENERAL, settings),

  // 获取安全设置
  getSecuritySettings: () =>
    http.get<any>(API_ENDPOINTS.SETTINGS.SECURITY),

  // 更新安全设置
  updateSecuritySettings: (settings: any) =>
    http.put<any>(API_ENDPOINTS.SETTINGS.SECURITY, settings),

  // 获取邮件设置
  getEmailSettings: () =>
    http.get<any>(API_ENDPOINTS.SETTINGS.EMAIL),

  // 更新邮件设置
  updateEmailSettings: (settings: any) =>
    http.put<any>(API_ENDPOINTS.SETTINGS.EMAIL, settings),

  // 获取短信设置
  getSmsSettings: () =>
    http.get<any>(API_ENDPOINTS.SETTINGS.SMS),

  // 更新短信设置
  updateSmsSettings: (settings: any) =>
    http.put<any>(API_ENDPOINTS.SETTINGS.SMS, settings),
};

// 通知 API
export const notificationApi = {
  // 获取通知列表
  getNotifications: (params?: PaginationParams) =>
    http.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST, params),

  // 标记通知为已读
  markAsRead: (id: number) =>
    http.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),

  // 标记所有通知为已读
  markAllAsRead: () =>
    http.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),

  // 删除通知
  deleteNotification: (id: number) =>
    http.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id)),
};

// 导出所有 API
export const api = {
  auth: authApi,
  user: userApi,
  role: roleApi,
  product: productApi,
  category: categoryApi,
  order: orderApi,
  upload: uploadApi,
  analytics: analyticsApi,
  settings: settingsApi,
  notification: notificationApi,
};

export default api;
