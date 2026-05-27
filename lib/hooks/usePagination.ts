import { useState, useCallback } from 'react';
import { PAGINATION } from '@/lib/constants';

interface UsePaginationOptions {
  pageSize?: number;
  current?: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  pageSizeOptions?: string[];
}

interface UsePaginationResult {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  pageSizeOptions: string[];
  onChange: (page: number, size?: number) => void;
  onShowSizeChange: (current: number, size: number) => void;
  setCurrent: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotal: (total: number) => void;
  reset: () => void;
  showTotal: (total: number, range: [number, number]) => string;
}

function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const {
    pageSize: initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    current: initialCurrent = PAGINATION.DEFAULT_PAGE,
    total: initialTotal = 0,
    showSizeChanger = PAGINATION.SHOW_SIZE_CHANGER,
    showQuickJumper = PAGINATION.SHOW_QUICK_JUMPER,
    pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS,
  } = options;

  const [current, setCurrent] = useState(initialCurrent);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);

  const onChange = useCallback((page: number, size?: number) => {
    setCurrent(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  }, [pageSize]);

  const onShowSizeChange = useCallback((current: number, size: number) => {
    setPageSize(size);
    setCurrent(1); // 改变页面大小时重置到第一页
  }, []);

  const reset = useCallback(() => {
    setCurrent(initialCurrent);
    setPageSize(initialPageSize);
    setTotal(initialTotal);
  }, [initialCurrent, initialPageSize, initialTotal]);

  const showTotal = useCallback((total: number, range: [number, number]) => {
    return `第 ${range[0]}-${range[1]} 条，共 ${total} 条`;
  }, []);

  return {
    current,
    pageSize,
    total,
    showSizeChanger,
    showQuickJumper,
    pageSizeOptions,
    onChange,
    onShowSizeChange,
    setCurrent,
    setPageSize,
    setTotal,
    reset,
    showTotal,
  };
}

export default usePagination;
