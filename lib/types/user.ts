/**
 * 用户相关类型定义
 */

import { Status, PaginationParams } from './api';

// 用户基础信息
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  status: Status;
  roleId: number;
  roleName?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// 创建用户请求
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId: number;
  status?: Status;
}

// 更新用户请求
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  status?: Status;
  avatar?: string;
}

// 用户查询参数
export interface GetUsersParams extends PaginationParams {
  status?: Status;
  roleId?: number;
  startDate?: string;
  endDate?: string;
}

// 用户统计信息
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  growthRate: number;
}

// 用户详情（包含更多信息）
export interface UserDetail extends User {
  permissions: string[];
  loginHistory: LoginRecord[];
  profile: UserProfile;
}

// 用户档案
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// 登录记录
export interface LoginRecord {
  id: number;
  userId: number;
  ip: string;
  userAgent: string;
  location?: string;
  loginAt: string;
  logoutAt?: string;
}

// 密码修改请求
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 重置密码请求
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

// 用户导入数据
export interface ImportUserData {
  name: string;
  email: string;
  phone?: string;
  roleName: string;
}

// 用户导出配置
export interface ExportUsersConfig {
  format: 'csv' | 'excel' | 'pdf';
  fields: (keyof User)[];
  filters?: GetUsersParams;
}
