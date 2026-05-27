/**
 * MCP 选择弹窗组件
 *
 * 用于选择要添加到工作流的 MCP 工具
 * 支持搜索、展开查看工具列表、添加到画布
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Input, Button, Empty, Spin, Pagination } from 'antd';
import { SearchOutlined, ReloadOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import { getMCPServices, type MCPService, type MCPToolDefinition } from '@/lib/services/mcp.mock';

interface MCPSelectModalProps {
  open: boolean;
  onSelect: (service: MCPService, tool: MCPToolDefinition) => void;
  onCancel: () => void;
}

/**
 * MCP 选择弹窗组件
 */
export const MCPSelectModal: React.FC<MCPSelectModalProps> = ({
  open,
  onSelect,
  onCancel,
}) => {
  // 状态
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<MCPService[]>([]);
  const [searchText, setSearchText] = useState('');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 加载 MCP 服务列表
  useEffect(() => {
    if (open) {
      setLoading(true);
      setTimeout(() => {
        const data = getMCPServices();
        setServices(data);
        setLoading(false);
      }, 300);
    }
  }, [open]);

  // 搜索过滤
  const filteredServices = useMemo(() => {
    if (!searchText.trim()) return services;
    const lowerSearch = searchText.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerSearch) ||
        s.description.toLowerCase().includes(lowerSearch) ||
        s.tools.some((t) => t.name.toLowerCase().includes(lowerSearch))
    );
  }, [services, searchText]);

  // 分页数据
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage]);

  // 切换展开状态
  const handleToggleExpand = (serviceId: string) => {
    setExpandedServiceId((prev) => (prev === serviceId ? null : serviceId));
  };

  // 刷新列表
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const data = getMCPServices();
      setServices(data);
      setLoading(false);
    }, 300);
  };

  // 查看工具详情（跳转到插件详情页）
  const handleView = (service: MCPService) => {
    window.open(`/plugins/${service.id}`, '_blank');
  };

  // 添加工具
  const handleAdd = (service: MCPService, tool: MCPToolDefinition) => {
    onSelect(service, tool);
  };

  return (
    <Modal
      title="选择MCP"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
      styles={{ body: { padding: '16px 24px' } }}
    >
      {/* 搜索框和刷新按钮 */}
      <div className="flex items-center gap-3 mb-4">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="搜索服务名称"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          allowClear
          className="flex-1"
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        />
      </div>

      {/* MCP 服务列表 */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Spin tip="加载中..." />
          </div>
        ) : filteredServices.length === 0 ? (
          <Empty
            description={searchText ? '未找到匹配的 MCP 服务' : '暂无 MCP 服务'}
            className="py-12"
          />
        ) : (
          <div className="space-y-2">
            {paginatedServices.map((service) => {
              const isExpanded = expandedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* 服务头部 */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleToggleExpand(service.id)}
                  >
                    {/* 展开/收起图标 */}
                    <div className="text-gray-400">
                      {isExpanded ? <DownOutlined /> : <RightOutlined />}
                    </div>

                    {/* 服务图标 */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: service.iconBg }}
                    >
                      {service.icon}
                    </div>

                    {/* 服务信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800">{service.name}</div>
                      <div className="text-xs text-gray-500 truncate">{service.description}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        更新时间:{service.updatedAt}
                      </div>
                    </div>
                  </div>

                  {/* 工具列表（展开时显示） */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-blue-50/50">
                      {service.tools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center justify-between px-4 py-3 ml-8 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800">{tool.name}</div>
                            <div className="text-xs text-gray-500">{tool.description}</div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Button
                              type="text"
                              size="small"
                              onClick={() => handleView(service)}
                            >
                              查看
                            </Button>
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => handleAdd(service, tool)}
                            >
                              添加
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 分页 */}
      {filteredServices.length > pageSize && (
        <div className="flex justify-end mt-4">
          <Pagination
            current={currentPage}
            total={filteredServices.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}
    </Modal>
  );
};
