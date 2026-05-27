import { useCallback, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRouterStore } from '@/lib/stores/routerStore';

/**
 * 优化的菜单 Hook
 *
 * 功能：
 * 1. 防止菜单点击时的重复导航
 * 2. 使用 useCallback 缓存回调函数
 * 3. 使用 useRef 跟踪最后一次点击的时间
 * 4. 避免快速重复点击导致的性能问题
 * 5. 预加载路由以减少导航延迟
 */
export function useOptimizedMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const setIsLoading = useRouterStore((state) => state.setIsLoading);
  const lastClickTimeRef = useRef<number>(0);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preloadedRoutesRef = useRef<Set<string>>(new Set());

  const prefetchRoute = useCallback((route: string) => {
    if (!route.startsWith('/')) return;
    if (preloadedRoutesRef.current.has(route)) return;
    router.prefetch(route);
    preloadedRoutesRef.current.add(route);
  }, [router]);

  // 预加载常用路由
  useEffect(() => {
    const commonRoutes = [
      '/dashboard',
      '/agent/list',
      '/workflow/list',
      '/knowledge/list',
      '/knowledge/create',
      '/plugins/market',
      '/labeleditor/list',
      '/users/list',
      '/users/roles',
    ];

    commonRoutes.forEach((route) => prefetchRoute(route));
  }, [prefetchRoute]);

  /**
   * 处理菜单点击
   *
   * 特性：
   * - 防止快速重复点击
   * - 使用防抖处理导航
   * - 避免不必要的重新渲染
   */
  const handleMenuClick = useCallback((key: string) => {
    const now = Date.now();

    if (!key.startsWith('/')) {
      return;
    }
    if (key === pathname) {
      return;
    }

    // 如果距离上次点击不到 500ms，则忽略（更激进的防抖）
    if (now - lastClickTimeRef.current < 500) {
      return;
    }

    lastClickTimeRef.current = now;

    // 清除之前的导航超时
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    setIsLoading(true);
    // 立即导航，不使用 setTimeout 延迟
    router.push(key);
  }, [pathname, router, setIsLoading]);

  const handleMenuHover = useCallback((key: string) => {
    prefetchRoute(key);
  }, [prefetchRoute]);

  return { handleMenuClick, handleMenuHover };
}
