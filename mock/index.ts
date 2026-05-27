// Mock 数据生成器
import type { User, Role, Permission, Product, Category, Order } from '@/lib/types';

// 生成随机 ID
const generateId = (() => {
  let id = 1;
  return () => id++;
})();

// 生成随机字符串
const randomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 生成随机日期
const randomDate = (start: Date = new Date(2023, 0, 1), end: Date = new Date()): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

// 生成随机数字
const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 生成随机布尔值
const randomBoolean = (): boolean => Math.random() > 0.5;

// 随机选择数组元素
const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Mock 权限数据
export const mockPermissions: Permission[] = [
  {
    id: 1,
    name: '用户管理',
    code: 'user',
    type: 'menu',
    path: '/users',
    icon: 'UserOutlined',
    sort: 1,
    children: [
      {
        id: 2,
        name: '用户列表',
        code: 'user.list',
        type: 'menu',
        parentId: 1,
        path: '/users/list',
        sort: 1,
      },
      {
        id: 3,
        name: '角色管理',
        code: 'user.roles',
        type: 'menu',
        parentId: 1,
        path: '/users/roles',
        sort: 2,
      },
      {
        id: 4,
        name: '添加用户',
        code: 'user.create',
        type: 'button',
        parentId: 2,
        sort: 1,
      },
      {
        id: 5,
        name: '编辑用户',
        code: 'user.update',
        type: 'button',
        parentId: 2,
        sort: 2,
      },
      {
        id: 6,
        name: '删除用户',
        code: 'user.delete',
        type: 'button',
        parentId: 2,
        sort: 3,
      },
    ],
  },
  {
    id: 7,
    name: '商品管理',
    code: 'product',
    type: 'menu',
    path: '/products',
    icon: 'ShoppingOutlined',
    sort: 2,
    children: [
      {
        id: 8,
        name: '商品列表',
        code: 'product.list',
        type: 'menu',
        parentId: 7,
        path: '/products/list',
        sort: 1,
      },
      {
        id: 9,
        name: '分类管理',
        code: 'product.categories',
        type: 'menu',
        parentId: 7,
        path: '/products/categories',
        sort: 2,
      },
    ],
  },
  {
    id: 10,
    name: '订单管理',
    code: 'order',
    type: 'menu',
    path: '/orders',
    icon: 'ShoppingCartOutlined',
    sort: 3,
  },
];

// Mock 角色数据
export const mockRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    permissions: mockPermissions,
    userCount: 1,
    status: 'active',
    createdAt: randomDate(),
    updatedAt: randomDate(),
  },
  {
    id: 2,
    name: '管理员',
    code: 'admin',
    description: '拥有大部分管理权限',
    permissions: mockPermissions.slice(0, 2),
    userCount: 3,
    status: 'active',
    createdAt: randomDate(),
    updatedAt: randomDate(),
  },
  {
    id: 3,
    name: '编辑员',
    code: 'editor',
    description: '拥有内容编辑权限',
    permissions: mockPermissions.slice(1, 3),
    userCount: 5,
    status: 'active',
    createdAt: randomDate(),
    updatedAt: randomDate(),
  },
  {
    id: 4,
    name: '查看员',
    code: 'viewer',
    description: '只有查看权限',
    permissions: [],
    userCount: 10,
    status: 'inactive',
    createdAt: randomDate(),
    updatedAt: randomDate(),
  },
];

// Mock 用户数据
export const mockUsers: User[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  username: `user${index + 1}`,
  email: `user${index + 1}@example.com`,
  name: `用户${index + 1}`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
  phone: `138${randomNumber(10000000, 99999999)}`,
  status: randomChoice(['active', 'inactive', 'banned']),
  role: randomChoice(mockRoles).name,
  roleId: randomChoice(mockRoles).id,
  department: randomChoice(['技术部', '产品部', '运营部', '市场部', '人事部']),
  position: randomChoice(['工程师', '产品经理', '运营专员', '市场专员', '人事专员']),
  lastLoginAt: randomDate(),
  createdAt: randomDate(),
  updatedAt: randomDate(),
}));

// Mock 分类数据
export const mockCategories: Category[] = [
  {
    id: 1,
    name: '电子产品',
    code: 'electronics',
    level: 1,
    sort: 1,
    icon: 'LaptopOutlined',
    description: '各类电子产品',
    status: 'active',
    productCount: 25,
    createdAt: randomDate(),
    updatedAt: randomDate(),
    children: [
      {
        id: 2,
        name: '手机',
        code: 'phones',
        parentId: 1,
        level: 2,
        sort: 1,
        status: 'active',
        productCount: 10,
        createdAt: randomDate(),
        updatedAt: randomDate(),
      },
      {
        id: 3,
        name: '电脑',
        code: 'computers',
        parentId: 1,
        level: 2,
        sort: 2,
        status: 'active',
        productCount: 15,
        createdAt: randomDate(),
        updatedAt: randomDate(),
      },
    ],
  },
  {
    id: 4,
    name: '服装',
    code: 'clothing',
    level: 1,
    sort: 2,
    icon: 'ShirtOutlined',
    description: '各类服装产品',
    status: 'active',
    productCount: 30,
    createdAt: randomDate(),
    updatedAt: randomDate(),
    children: [
      {
        id: 5,
        name: '男装',
        code: 'mens_clothing',
        parentId: 4,
        level: 2,
        sort: 1,
        status: 'active',
        productCount: 15,
        createdAt: randomDate(),
        updatedAt: randomDate(),
      },
      {
        id: 6,
        name: '女装',
        code: 'womens_clothing',
        parentId: 4,
        level: 2,
        sort: 2,
        status: 'active',
        productCount: 15,
        createdAt: randomDate(),
        updatedAt: randomDate(),
      },
    ],
  },
];

// Mock 商品数据
export const mockProducts: Product[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `商品${index + 1}`,
  sku: `SKU${randomString(8).toUpperCase()}`,
  description: `这是商品${index + 1}的详细描述`,
  price: randomNumber(10, 1000),
  originalPrice: randomNumber(1000, 2000),
  stock: randomNumber(0, 100),
  categoryId: randomChoice(mockCategories).id,
  category: randomChoice(mockCategories),
  images: [
    `https://picsum.photos/400/400?random=${index * 3 + 1}`,
    `https://picsum.photos/400/400?random=${index * 3 + 2}`,
    `https://picsum.photos/400/400?random=${index * 3 + 3}`,
  ],
  status: randomChoice(['active', 'inactive', 'draft']),
  tags: [randomChoice(['热销', '新品', '推荐', '限时']), randomChoice(['优质', '精选', '特价'])],
  attributes: [
    { name: '颜色', value: randomChoice(['红色', '蓝色', '绿色', '黑色', '白色']), type: 'select' },
    { name: '尺寸', value: randomChoice(['S', 'M', 'L', 'XL']), type: 'select' },
    { name: '重量', value: `${randomNumber(100, 2000)}g`, type: 'text' },
  ],
  createdAt: randomDate(),
  updatedAt: randomDate(),
}));

// Mock 订单数据
export const mockOrders: Order[] = Array.from({ length: 200 }, (_, index) => {
  const user = randomChoice(mockUsers);
  const itemCount = randomNumber(1, 5);
  const items = Array.from({ length: itemCount }, (_, itemIndex) => {
    const product = randomChoice(mockProducts);
    const quantity = randomNumber(1, 3);
    const price = product.price;
    return {
      id: itemIndex + 1,
      productId: product.id,
      product,
      quantity,
      price,
      totalPrice: price * quantity,
    };
  });
  
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = randomNumber(0, totalAmount * 0.2);
  const shippingAmount = randomNumber(0, 20);
  const finalAmount = totalAmount - discountAmount + shippingAmount;

  return {
    id: index + 1,
    orderNo: `ORD${Date.now()}${randomString(6).toUpperCase()}`,
    userId: user.id,
    user,
    status: randomChoice(['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']),
    paymentStatus: randomChoice(['pending', 'paid', 'failed', 'refunded']),
    paymentMethod: randomChoice(['alipay', 'wechat', 'bank', 'cash']),
    totalAmount,
    discountAmount,
    shippingAmount,
    finalAmount,
    items,
    shippingAddress: {
      name: user.name,
      phone: user.phone || '13800138000',
      province: randomChoice(['北京市', '上海市', '广东省', '浙江省', '江苏省']),
      city: randomChoice(['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市']),
      district: randomChoice(['朝阳区', '海淀区', '浦东新区', '黄浦区', '天河区', '福田区']),
      detail: `${randomChoice(['中关村', '陆家嘴', '珠江新城', '西湖区'])}${randomNumber(1, 999)}号`,
      postalCode: `${randomNumber(100000, 999999)}`,
      isDefault: randomBoolean(),
    },
    remark: randomBoolean() ? `订单备注${index + 1}` : undefined,
    createdAt: randomDate(),
    updatedAt: randomDate(),
  };
});

// Mock 仪表盘统计数据
export const mockDashboardStats = {
  totalUsers: mockUsers.length,
  totalOrders: mockOrders.length,
  totalRevenue: mockOrders.reduce((sum, order) => sum + order.finalAmount, 0),
  totalProducts: mockProducts.length,
  userGrowth: randomNumber(-10, 30),
  orderGrowth: randomNumber(-5, 25),
  revenueGrowth: randomNumber(-15, 40),
  productGrowth: randomNumber(-8, 20),
};

// 导出所有 Mock 数据
export const mockData = {
  users: mockUsers,
  roles: mockRoles,
  permissions: mockPermissions,
  products: mockProducts,
  categories: mockCategories,
  orders: mockOrders,
  dashboardStats: mockDashboardStats,
};

export default mockData;
