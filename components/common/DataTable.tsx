'use client';

import React from 'react';
import { Table, Card } from 'antd';
import type { TableProps } from 'antd';

interface DataTableProps<T = any> extends TableProps<T> {
  title?: string;
  extra?: React.ReactNode;
  cardProps?: any;
}

export function DataTable<T extends Record<string, any>>({
  title,
  extra,
  cardProps,
  ...tableProps
}: DataTableProps<T>) {
  const tableContent = (
    <Table
      {...tableProps}
      scroll={{ x: 'max-content' }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
        ...tableProps.pagination,
      }}
    />
  );

  if (title || extra) {
    return (
      <Card
        title={title}
        extra={extra}
        {...cardProps}
      >
        {tableContent}
      </Card>
    );
  }

  return tableContent;
}
