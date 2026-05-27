// 通用类型定义
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sorter?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'banned';
  role: string;
  roleId: number;
  department?: string;
  position?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  name: string;
  password: string;
  phone?: string;
  roleId: number;
  department?: string;
  position?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  department?: string;
  position?: string;
  status?: 'active' | 'inactive' | 'banned';
}

// 角色权限类型
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
  userCount?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: number;
  path?: string;
  icon?: string;
  sort: number;
  children?: Permission[];
}

// 商品相关类型
export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number;
  category?: Category;
  images: string[];
  status: 'active' | 'inactive' | 'draft';
  tags: string[];
  attributes: ProductAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  sort: number;
  icon?: string;
  description?: string;
  status: 'active' | 'inactive';
  children?: Category[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
}

// 订单相关类型
export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  user?: User;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'alipay' | 'wechat' | 'bank' | 'cash';
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  finalAmount: number;
  items: OrderItem[];
  shippingAddress: Address;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Address {
  id?: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  postalCode?: string;
  isDefault?: boolean;
}

// 统计数据类型
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  productGrowth: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

// 系统设置类型
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  language: string;
  timezone: string;
  currency: string;
  enableRegistration: boolean;
  enableEmailVerification: boolean;
  enableSmsVerification: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

// 文件上传类型
export interface UploadFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  status: 'uploading' | 'done' | 'error';
  percent?: number;
}

// 通知类型
export interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  userId?: number;
  createdAt: string;
}

// 菜单类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  permission?: string;
}

// 面包屑类型
export interface BreadcrumbItem {
  title: string;
  path?: string;
}

// 表单验证规则类型
export interface FormRule {
  required?: boolean;
  message?: string;
  type?: 'string' | 'number' | 'email' | 'url' | 'date';
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (rule: any, value: any) => Promise<void>;
}

// HTTP 请求配置类型
export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

// 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 主题配置类型
export interface ThemeConfig {
  primaryColor: string;
  borderRadius: number;
  fontSize: number;
  colorBgContainer: string;
  colorText: string;
  colorTextSecondary: string;
  colorBorder: string;
}

// 路由类型
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  meta?: {
    title?: string;
    requireAuth?: boolean;
    permissions?: string[];
    layout?: string;
  };
}

// 工作流类型
export * from './workflow';
