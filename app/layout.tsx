import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { theme } from '@/lib/theme';
import PerformanceMonitor from '@/components/common/PerformanceMonitor';
import GlobalRouterLoading from '@/components/common/GlobalRouterLoading';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "智工智能体平台",
  description: "面向工业互联网场景的 AI 智能体编排与工作流可视化平台，包含设备故障诊断、工业知识库和 SSE 流式预览。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <Suspense fallback={null}>
              <GlobalRouterLoading />
            </Suspense>
            <PerformanceMonitor>
              {children}
            </PerformanceMonitor>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
