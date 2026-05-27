// API 相关常量
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // 用户管理
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
    DETAIL: (id: number) => `/users/${id}`,
    BATCH_DELETE: '/users/batch-delete',
    EXPORT: '/users/export',
    IMPORT: '/users/import',
  },
  
  // 角色权限
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles',
    UPDATE: (id: number) => `/roles/${id}`,
    DELETE: (id: number) => `/roles/${id}`,
    PERMISSIONS: '/permissions',
    ASSIGN_PERMISSIONS: (id: number) => `/roles/${id}/permissions`,
  },
  
  // 商品管理
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
    DETAIL: (id: number) => `/products/${id}`,
    CATEGORIES: '/products/categories',
    BATCH_UPDATE: '/products/batch-update',
  },
  
  // 分类管理
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id: number) => `/categories/${id}`,
    DELETE: (id: number) => `/categories/${id}`,
    TREE: '/categories/tree',
  },
  
  // 订单管理
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: (id: number) => `/orders/${id}`,
    DELETE: (id: number) => `/orders/${id}`,
    DETAIL: (id: number) => `/orders/${id}`,
    STATISTICS: '/orders/statistics',
  },
  
  // 文件上传
  UPLOAD: {
    IMAGE: '/upload/image',
    FILE: '/upload/file',
    AVATAR: '/upload/avatar',
  },
  
  // 统计分析
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    USERS: '/analytics/users',
    ORDERS: '/analytics/orders',
    REVENUE: '/analytics/revenue',
    PRODUCTS: '/analytics/products',
  },
  
  // 系统设置
  SETTINGS: {
    GENERAL: '/settings/general',
    SECURITY: '/settings/security',
    EMAIL: '/settings/email',
    SMS: '/settings/sms',
  },
  
  // 通知
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: number) => `/notifications/${id}`,
  },
} as const;

// 状态常量
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
} as const;

// 分页常量
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
} as const;

// 表格常量
export const TABLE_CONFIG = {
  SCROLL_Y: 400,
  ROW_SELECTION_TYPE: 'checkbox',
  SIZE: 'middle',
} as const;

// 文件上传常量
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB
} as const;

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  THEME: 'theme_config',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  TABLE_SETTINGS: 'table_settings',
  AGENT_DRAFT: 'agent_draft', // 新增
  AGENT_UI: 'agent_ui', // 新增
  AGENT_LIST: 'agent_list',  // 新增：智能体列表
} as const;

// 主题常量
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4',
  },
  BREAKPOINTS: {
    XS: 480,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  },
  SIDEBAR_WIDTH: {
    EXPANDED: 256,
    COLLAPSED: 80,
  },
  HEADER_HEIGHT: 64,
} as const;

// 正则表达式常量
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  URL: /^https?:\/\/.+/,
  NUMBER: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/,
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器内部错误，请稍后重试',
  UNAUTHORIZED: '未授权访问，请重新登录',
  FORBIDDEN: '权限不足，无法访问该资源',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '数据验证失败',
  UPLOAD_ERROR: '文件上传失败',
  UNKNOWN_ERROR: '未知错误，请联系管理员',
} as const;

// 成功消息常量
export const SUCCESS_MESSAGES = {
  CREATE_SUCCESS: '创建成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
  SAVE_SUCCESS: '保存成功',
  UPLOAD_SUCCESS: '上传成功',
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  OPERATION_SUCCESS: '操作成功',
} as const;

// 日期格式常量
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY',
  DISPLAY_DATE: 'YYYY年MM月DD日',
  DISPLAY_DATETIME: 'YYYY年MM月DD日 HH:mm:ss',
} as const;

// 语言常量
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US',
  JA_JP: 'ja-JP',
} as const;

// 货币常量
export const CURRENCIES = {
  CNY: 'CNY',
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
} as const;

// 时区常量
export const TIMEZONES = {
  BEIJING: 'Asia/Shanghai',
  NEW_YORK: 'America/New_York',
  LONDON: 'Europe/London',
  TOKYO: 'Asia/Tokyo',
} as const;

// 导出类型
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];
