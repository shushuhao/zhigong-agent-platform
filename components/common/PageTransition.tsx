'use client';

import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // 完全移除动画，直接渲染内容
  return (
    <div className="page-content">
      {children}
    </div>
  );
};

export default PageTransition;
