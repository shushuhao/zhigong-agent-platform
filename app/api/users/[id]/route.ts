/**
 * 用户详情 API 路由
 * GET /api/users/[id] - 获取用户详情
 * PUT /api/users/[id] - 更新用户
 * DELETE /api/users/[id] - 删除用户
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { UpdateUserRequest } from '@/lib/types/user';
import type { ApiResponse } from '@/lib/types/api';

// 模拟数据库（实际项目中应该使用真实的数据库）
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

// 更新用户验证 schema
const updateUserSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名不能超过50个字符').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().optional(),
  roleId: z.number().int().positive('角色ID必须是正整数').optional(),
  status: z.enum(['active', 'inactive']).optional(),
  avatar: z.string().url('头像必须是有效的URL').optional(),
});

// 路由参数验证
const paramsSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive('用户ID必须是正整数')),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/users/[id] - 获取用户详情
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 验证路由参数
    const { id } = paramsSchema.parse(await params);
    
    // 查找用户
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: '用户不存在',
        },
        { status: 404 }
      );
    }
    
    // 模拟获取用户详情（包含更多信息）
    const userDetail = {
      ...user,
      permissions: user.roleId === 1 ? ['user:read', 'user:write', 'user:delete'] : ['user:read'],
      loginHistory: [
        {
          id: 1,
          userId: user.id,
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          location: '北京市',
          loginAt: '2024-01-01T10:00:00Z',
        },
      ],
      profile: {
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || '',
        bio: '这是用户的个人简介',
      },
    };
    
    const response: ApiResponse = {
      success: true,
      data: userDetail,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('获取用户详情失败:', error);
    
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
        message: '获取用户详情失败',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id] - 更新用户
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 验证路由参数
    const { id } = paramsSchema.parse(await params);
    
    // 验证请求数据
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);
    
    // 查找用户
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: '用户不存在',
        },
        { status: 404 }
      );
    }
    
    // 检查邮箱是否已被其他用户使用
    if (validatedData.email) {
      const existingUser = mockUsers.find(u => u.email === validatedData.email && u.id !== id);
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: '邮箱已被其他用户使用',
          },
          { status: 409 }
        );
      }
    }
    
    // 更新用户
    const updatedUser = {
      ...mockUsers[userIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers[userIndex] = updatedUser;
    
    const response: ApiResponse = {
      success: true,
      data: updatedUser,
      message: '用户更新成功',
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('更新用户失败:', error);
    
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
        message: '更新用户失败',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id] - 删除用户
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 验证路由参数
    const { id } = paramsSchema.parse(await params);
    
    // 查找用户
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: '用户不存在',
        },
        { status: 404 }
      );
    }
    
    // 检查是否是管理员（不能删除）
    if (mockUsers[userIndex].roleId === 1) {
      return NextResponse.json(
        {
          success: false,
          message: '不能删除管理员用户',
        },
        { status: 403 }
      );
    }
    
    // 删除用户
    mockUsers.splice(userIndex, 1);
    
    const response: ApiResponse = {
      success: true,
      data: null,
      message: '用户删除成功',
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('删除用户失败:', error);
    
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
        message: '删除用户失败',
      },
      { status: 500 }
    );
  }
}
