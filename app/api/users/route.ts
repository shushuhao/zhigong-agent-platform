/**
 * 用户 API 路由
 * GET /api/users - 获取用户列表
 * POST /api/users - 创建用户
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { GetUsersParams, CreateUserRequest } from '@/lib/types/user';
import type { ApiResponse, PaginatedResponse } from '@/lib/types/api';

// 模拟数据库操作（实际项目中应该使用真实的数据库）
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active' as const,
    roleId: 1,
    roleName: 'Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'active' as const,
    roleId: 2,
    roleName: 'User',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

// 创建用户验证 schema
const createUserSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名不能超过50个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位').max(20, '密码不能超过20位'),
  phone: z.string().optional(),
  roleId: z.number().int().positive('角色ID必须是正整数'),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

// 查询参数验证 schema
const getUsersParamsSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default(1),
  pageSize: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default(10),
  keyword: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  roleId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * GET /api/users - 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // 验证查询参数
    const validatedParams = getUsersParamsSchema.parse(params);
    
    // 模拟数据库查询
    let filteredUsers = [...mockUsers];
    
    // 关键词搜索
    if (validatedParams.keyword) {
      const keyword = validatedParams.keyword.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      );
    }
    
    // 状态过滤
    if (validatedParams.status) {
      filteredUsers = filteredUsers.filter(user => user.status === validatedParams.status);
    }
    
    // 角色过滤
    if (validatedParams.roleId) {
      filteredUsers = filteredUsers.filter(user => user.roleId === validatedParams.roleId);
    }
    
    // 排序
    filteredUsers.sort((a, b) => {
      const aValue = a[validatedParams.sortBy as keyof typeof a];
      const bValue = b[validatedParams.sortBy as keyof typeof b];
      
      if (validatedParams.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // 分页
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / validatedParams.pageSize);
    const startIndex = (validatedParams.page - 1) * validatedParams.pageSize;
    const endIndex = startIndex + validatedParams.pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    const response: PaginatedResponse = {
      data: paginatedUsers,
      total,
      page: validatedParams.page,
      pageSize: validatedParams.pageSize,
      totalPages,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('获取用户列表失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '参数验证失败',
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: '获取用户列表失败',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - 创建用户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createUserSchema.parse(body);
    
    // 检查邮箱是否已存在
    const existingUser = mockUsers.find(user => user.email === validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: '邮箱已存在',
        },
        { status: 409 }
      );
    }
    
    // 创建新用户（模拟）
    const newUser = {
      id: mockUsers.length + 1,
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      status: validatedData.status,
      roleId: validatedData.roleId,
      roleName: validatedData.roleId === 1 ? 'Admin' : 'User', // 模拟角色名称
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 添加到模拟数据库
    mockUsers.push(newUser);
    
    const response: ApiResponse = {
      success: true,
      data: newUser,
      message: '用户创建成功',
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('创建用户失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '数据验证失败',
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: '创建用户失败',
      },
      { status: 500 }
    );
  }
}
