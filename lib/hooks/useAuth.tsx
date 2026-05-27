import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { api } from '@/lib/services/api';
import { storageUtils } from '@/lib/utils';
import { STORAGE_KEYS } from '@/lib/constants';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const token = storageUtils.get(STORAGE_KEYS.TOKEN);
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.auth.getProfile();
      setUser(response.data);
    } catch (error) {
      // Token 无效，清除本地存储
      storageUtils.remove(STORAGE_KEYS.TOKEN);
      storageUtils.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storageUtils.remove(STORAGE_KEYS.USER_INFO);
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.auth.login(email, password);
      const { token, refreshToken, user: userData } = response.data;

      // 保存认证信息
      storageUtils.set(STORAGE_KEYS.TOKEN, token);
      storageUtils.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      storageUtils.set(STORAGE_KEYS.USER_INFO, userData);

      setUser(userData);
      message.success('登录成功');
      
      // 跳转到首页
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.message || '登录失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      // 即使退出登录 API 失败，也要清除本地状态
      console.error('Logout API failed:', error);
    } finally {
      // 清除本地存储
      storageUtils.remove(STORAGE_KEYS.TOKEN);
      storageUtils.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storageUtils.remove(STORAGE_KEYS.USER_INFO);

      setUser(null);
      message.success('已退出登录');
      
      // 跳转到登录页
      router.push('/login');
    }
  };

  // 更新用户信息
  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      storageUtils.set(STORAGE_KEYS.USER_INFO, updatedUser);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证 Hook
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
