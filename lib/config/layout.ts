/**
 * 智能布局配置系统
 * 基于"约定优于配置"的设计理念
 */

export interface LayoutConfig {
  /** 是否显示侧边栏 */
  showSidebar: boolean;
  /** 是否显示头部导航 */
  showHeader: boolean;
  /** 是否显示面包屑 */
  showBreadcrumb: boolean;
  /** 是否显示页脚 */
  showFooter?: boolean;
  /** 页面容器样式类名 */
  containerClassName?: string;
  /** 页面标题 */
  title?: string;
}

/**
 * 布局类型枚举
 */
export enum LayoutType {
  FULL = 'full',           // 完整布局（侧边栏 + 头部）
  CONTENT = 'content',     // 内容布局（仅头部，无侧边栏）
  MINIMAL = 'minimal',     // 最小布局（无侧边栏，无头部）
  FULLSCREEN = 'fullscreen', // 全屏布局（完全无布局元素）
}

/**
 * 默认布局配置
 */
export const DEFAULT_LAYOUT: LayoutConfig = {
  showSidebar: true,
  showHeader: true,
  showBreadcrumb: true,
  showFooter: false,
  containerClassName: 'p-6',
  title: 'AI Agent Studio',
};

/**
 * 预定义布局配置
 */
export const LAYOUT_PRESETS: Record<LayoutType, Partial<LayoutConfig>> = {
  [LayoutType.FULL]: {
    showSidebar: true,
    showHeader: true,
    showBreadcrumb: true,
    containerClassName: 'p-6',
  },
  [LayoutType.CONTENT]: {
    showSidebar: false,
    showHeader: true,
    showBreadcrumb: true,
    containerClassName: 'p-6 max-w-6xl mx-auto',
  },
  [LayoutType.MINIMAL]: {
    showSidebar: false,
    showHeader: false,
    showBreadcrumb: false,
    containerClassName: 'min-h-screen flex items-center justify-center bg-gray-50',
  },
  [LayoutType.FULLSCREEN]: {
    showSidebar: false,
    showHeader: false,
    showBreadcrumb: false,
    showFooter: false,
    containerClassName: 'min-h-screen',
  },
};

/**
 * 智能路径约定规则
 * 根据 URL 模式自动判断布局类型
 */
const LAYOUT_CONVENTIONS = [
  // 认证相关页面 - 最小布局
  {
    pattern: /^\/auth\//,
    layout: LayoutType.MINIMAL,
    title: '用户认证',
  },
  {
    pattern: /^\/(login|register|forgot-password)$/,
    layout: LayoutType.MINIMAL,
    title: '用户认证',
  },

  // 详情页面 - 内容布局
  {
    pattern: /\/detail$/,
    layout: LayoutType.CONTENT,
    title: '详情页面',
  },

  // 编辑/创建页面 - 内容布局
  {
    pattern: /\/(edit|create)$/,
    layout: LayoutType.CONTENT,
    containerClassName: 'p-6 max-w-4xl mx-auto',
    title: '编辑页面',
  },

  // 全屏页面 - 全屏布局
  {
    pattern: /\/(fullscreen|screen)$/,
    layout: LayoutType.FULLSCREEN,
    containerClassName: 'min-h-screen bg-gray-900',
    title: '全屏页面',
  },

  // 打印页面 - 全屏布局
  {
    pattern: /^\/print\//,
    layout: LayoutType.FULLSCREEN,
    containerClassName: 'p-4 print:p-0',
    title: '打印页面',
  },

  // 预览页面 - 内容布局
  {
    pattern: /^\/preview\//,
    layout: LayoutType.CONTENT,
    containerClassName: 'p-0',
    title: '预览页面',
  },

  // 错误页面 - 最小布局
  {
    pattern: /^\/(404|403|500)$/,
    layout: LayoutType.MINIMAL,
    title: '错误页面',
  },

  // 个人中心 - 内容布局
  {
    pattern: /^\/profile/,
    layout: LayoutType.CONTENT,
    containerClassName: 'p-6 max-w-4xl mx-auto',
    title: '个人中心',
  },
];

/**
 * 特殊路由配置（覆盖约定规则）
 * 只有非常特殊的页面才需要在这里配置
 */
export const EXPLICIT_ROUTE_LAYOUTS: Record<string, Partial<LayoutConfig>> = {
  // 数据大屏 - 特殊的全屏布局
  '/dashboard/screen': {
    showSidebar: false,
    showHeader: false,
    showBreadcrumb: false,
    showFooter: false,
    containerClassName: 'min-h-screen bg-gray-900 text-white',
    title: '数据大屏',
  },

  // 工作流编辑器 - 全屏编辑布局
  '/workflow/editor': {
    showSidebar: false,
    showHeader: false,
    showBreadcrumb: false,
    showFooter: false,
    containerClassName: 'min-h-screen',
    title: '工作流编辑器',
  },

  // 知识库列表 - 完整布局
  '/knowledge/list': {
    showSidebar: true,
    showHeader: true,
    showBreadcrumb: true,
    containerClassName: 'p-6',
    title: '知识库',
  },

  // 创建知识库 - 完整布局（保留侧边栏）
  '/knowledge/create': {
    showSidebar: true,
    showHeader: true,
    showBreadcrumb: true,
    containerClassName: 'p-6',
    title: '创建知识库',
  },

  // 知识库详情页 - 隐藏侧边栏
  '/knowledge/*': {
    showSidebar: false,
    showHeader: false,
    showBreadcrumb: false,
    containerClassName: 'p-6',
    title: '知识库详情',
  },

  '/plugins/market': {
    showSidebar: true,
    showHeader: true,
    showBreadcrumb: true,
    containerClassName: 'p-6',
    title: '插件广场',
  },
  '/plugins/market/*': {
    showSidebar: true,
    showHeader: true,
    showBreadcrumb: true,
    containerClassName: 'p-6',
    title: '插件详情',
  },

  // 系统设置 - 保持完整布局
  '/settings': {
    showSidebar: true,
    showHeader: true,
    showBreadcrumb: true,
    containerClassName: 'p-6',
    title: '系统设置',
  },
  '/agent/editor': {
    showSidebar: false,
    showHeader: false,
    showBreadcrumb: false,
    showFooter: false,
    containerClassName: 'h-screen bg-gray-50 overflow-hidden',
    title: '智能体编辑器',
  },
};

/**
 * 根据约定规则获取布局配置
 */
function getLayoutByConvention(pathname: string): LayoutConfig {
  // 检查约定规则
  for (const convention of LAYOUT_CONVENTIONS) {
    if (convention.pattern.test(pathname)) {
      const preset = LAYOUT_PRESETS[convention.layout];
      return {
        ...DEFAULT_LAYOUT,
        ...preset,
        title: convention.title || DEFAULT_LAYOUT.title,
        containerClassName: convention.containerClassName || preset.containerClassName,
      };
    }
  }

  // 默认使用完整布局
  return { ...DEFAULT_LAYOUT, ...LAYOUT_PRESETS[LayoutType.FULL] };
}

/**
 * 通配符模式匹配
 */
function matchWildcardPattern(pattern: string, pathname: string): boolean {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]+') + '$');
  return regex.test(pathname);
}

/**
 * 智能获取路由的布局配置
 * @param pathname 当前路由路径
 * @returns 布局配置
 */
export function getLayoutConfig(pathname: string): LayoutConfig {
  // 1. 优先检查显式配置（特殊情况）
  const explicitConfig = EXPLICIT_ROUTE_LAYOUTS[pathname];
  if (explicitConfig) {
    return { ...DEFAULT_LAYOUT, ...explicitConfig };
  }

  // 2. 检查通配符显式配置
  for (const [pattern, config] of Object.entries(EXPLICIT_ROUTE_LAYOUTS)) {
    if (pattern.includes('*') && matchWildcardPattern(pattern, pathname)) {
      return { ...DEFAULT_LAYOUT, ...config };
    }
  }

  // 3. 使用智能约定规则
  return getLayoutByConvention(pathname);
}

/**
 * 检查路由是否需要认证
 */
export function requiresAuth(pathname: string): boolean {
  // 公开路由（不需要认证）
  const publicPatterns = [
    /^\/auth\//,
    /^\/(login|register|forgot-password)$/,
    /^\/(404|403|500)$/,
    /^\/public\//,
  ];

  return !publicPatterns.some(pattern => pattern.test(pathname));
}

/**
 * 获取页面标题
 */
export function getPageTitle(pathname: string): string {
  const config = getLayoutConfig(pathname);

  // 如果有自定义标题，使用自定义标题
  if (config.title && config.title !== DEFAULT_LAYOUT.title) {
    return config.title;
  }

  // 根据路径生成标题
  return generateTitleFromPath(pathname);
}

/**
 * 根据路径生成页面标题
 */
function generateTitleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '首页';
  }

  // 路径到标题的映射
  const pathTitleMap: Record<string, string> = {
    dashboard: '仪表盘',
    users: '用户管理',
    products: '商品管理',
    orders: '订单管理',
    analytics: '数据分析',
    content: '内容管理',
    articles: '文章管理',
    team: '团队管理',
    settings: '系统设置',
    profile: '个人中心',
    list: '列表',
    detail: '详情',
    edit: '编辑',
    create: '新建',
    overview: '概览',
    reports: '报表',
  };

  // 获取最后一个有意义的段落
  const lastSegment = segments[segments.length - 1];
  const secondLastSegment = segments[segments.length - 2];

  // 如果是详情、编辑等页面，使用上级模块名称
  if (['detail', 'edit', 'create'].includes(lastSegment) && secondLastSegment) {
    const moduleName = pathTitleMap[secondLastSegment] || secondLastSegment;
    const actionName = pathTitleMap[lastSegment] || lastSegment;
    return `${moduleName}${actionName}`;
  }

  // 使用第一个段落作为主要模块
  const mainModule = pathTitleMap[segments[0]] || segments[0];
  return mainModule;
}

/**
 * 检查路由是否需要显示侧边栏
 * @param pathname 当前路由路径
 * @returns 是否显示侧边栏
 */
export function shouldShowSidebar(pathname: string): boolean {
  return getLayoutConfig(pathname).showSidebar;
}

/**
 * 检查路由是否需要显示头部
 * @param pathname 当前路由路径
 * @returns 是否显示头部
 */
export function shouldShowHeader(pathname: string): boolean {
  return getLayoutConfig(pathname).showHeader;
}

/**
 * 检查路由是否需要显示面包屑
 * @param pathname 当前路由路径
 * @returns 是否显示面包屑
 */
export function shouldShowBreadcrumb(pathname: string): boolean {
  return getLayoutConfig(pathname).showBreadcrumb;
}
