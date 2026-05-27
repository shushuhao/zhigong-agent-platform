'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts/MainLayout';

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <MainLayout>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在。"
        extra={
          <div className="space-x-4">
            <Button 
              type="primary" 
              icon={<HomeOutlined />}
              onClick={handleGoHome}
            >
              返回首页
            </Button>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
            >
              返回上页
            </Button>
          </div>
        }
      />
    </MainLayout>
  );
};

export default NotFoundPage;
