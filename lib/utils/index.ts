import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { REGEX_PATTERNS, DATE_FORMATS } from '@/lib/constants';

// 样式工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化工具函数
export const formatUtils = {
  // 格式化货币
  currency: (amount: number, currency = 'CNY'): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  },

  // 格式化数字
  number: (num: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat('zh-CN', options).format(num);
  },

  // 格式化百分比
  percentage: (value: number, decimals = 2): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // 格式化文件大小
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  // 格式化时间距离
  timeAgo: (date: string | Date): string => {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years}年前`;
    if (months > 0) return `${months}个月前`;
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  },

  // 格式化日期
  date: (date: string | Date, format = DATE_FORMATS.DATETIME): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },
};

// 验证工具函数
export const validateUtils = {
  // 验证邮箱
  email: (email: string): boolean => {
    return REGEX_PATTERNS.EMAIL.test(email);
  },

  // 验证手机号
  phone: (phone: string): boolean => {
    return REGEX_PATTERNS.PHONE.test(phone);
  },

  // 验证密码强度
  password: (password: string): boolean => {
    return REGEX_PATTERNS.PASSWORD.test(password);
  },

  // 验证用户名
  username: (username: string): boolean => {
    return REGEX_PATTERNS.USERNAME.test(username);
  },

  // 验证URL
  url: (url: string): boolean => {
    return REGEX_PATTERNS.URL.test(url);
  },

  // 验证身份证号
  idCard: (idCard: string): boolean => {
    const pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    return pattern.test(idCard);
  },

  // 验证银行卡号
  bankCard: (cardNumber: string): boolean => {
    const pattern = /^[1-9]\d{12,18}$/;
    return pattern.test(cardNumber);
  },
};

// 字符串工具函数
export const stringUtils = {
  // 首字母大写
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // 驼峰转下划线
  camelToSnake: (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  },

  // 下划线转驼峰
  snakeToCamel: (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  },

  // 截断字符串
  truncate: (str: string, length: number, suffix = '...'): string => {
    if (str.length <= length) return str;
    return str.slice(0, length) + suffix;
  },

  // 生成随机字符串
  random: (length = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // 移除HTML标签
  stripHtml: (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  },

  // 高亮关键词
  highlight: (text: string, keyword: string): string => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },
};

// 数组工具函数
export const arrayUtils = {
  // 数组去重
  unique: <T>(arr: T[]): T[] => {
    return [...new Set(arr)];
  },

  // 数组分组
  groupBy: <T>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // 数组排序
  sortBy: <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // 数组分页
  paginate: <T>(arr: T[], page: number, limit: number): T[] => {
    const startIndex = (page - 1) * limit;
    return arr.slice(startIndex, startIndex + limit);
  },

  // 数组转树形结构
  toTree: <T extends { id: number; parentId?: number }>(
    arr: T[],
    parentId?: number
  ): (T & { children?: T[] })[] => {
    return arr
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: arrayUtils.toTree(arr, item.id),
      }));
  },

  // 树形结构转数组
  fromTree: <T extends { children?: T[] }>(tree: T[]): T[] => {
    const result: T[] = [];
    const traverse = (nodes: T[]) => {
      nodes.forEach(node => {
        const { children, ...rest } = node;
        result.push(rest as T);
        if (children && children.length > 0) {
          traverse(children);
        }
      });
    };
    traverse(tree);
    return result;
  },
};

// 对象工具函数
export const objectUtils = {
  // 深拷贝
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = objectUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  // 对象合并
  merge: <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
    return Object.assign({}, target, ...sources);
  },

  // 获取嵌套属性值
  get: (obj: any, path: string, defaultValue?: any): any => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    return result !== undefined ? result : defaultValue;
  },

  // 设置嵌套属性值
  set: (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  },

  // 删除空值属性
  removeEmpty: (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value;
      }
    }
    return result;
  },
};

// 本地存储工具函数
export const storageUtils = {
  // 设置本地存储
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set localStorage:', error);
    }
  },

  // 获取本地存储
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Failed to get localStorage:', error);
      return defaultValue || null;
    }
  },

  // 删除本地存储
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove localStorage:', error);
    }
  },

  // 清空本地存储
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

// URL 工具函数
export const urlUtils = {
  // 构建查询字符串
  buildQuery: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },

  // 解析查询字符串
  parseQuery: (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },

  // 获取文件扩展名
  getFileExtension: (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  },

  // 获取文件名（不含扩展名）
  getFileName: (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, '');
  },
};

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
}

// 睡眠函数
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
