'use client';

import React from 'react';
import { Card, Form, Input, Select, Button, Space, Avatar, Upload, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layouts/MainLayout';

const { Option } = Select;

const UserEditPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [form] = Form.useForm();

  // 模拟用户数据
  const userData = {
    id: userId,
    name: '运维主管',
    email: 'ops-lead@example.com',
    phone: '13800138000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OpsLead',
    role: 'admin',
    status: 'active',
    department: '设备运维部',
    position: '运维负责人',
    description: '负责设备运维团队管理、故障响应协同和工业智能体应用推广。',
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async (values: any) => {
    try {
      console.log('保存用户信息:', values);
      message.success('用户信息保存成功！');
      router.push(`/users/${userId}/detail`);
    } catch (error) {
      message.error('保存失败，请重试！');
    }
  };

  const handleUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功！');
    } else if (info.file.status === 'error') {
      message.error('头像上传失败！');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              type="text"
            >
              返回
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">编辑用户</h1>
          </div>
        </div>

        {/* 编辑表单 */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            initialValues={userData}
            onFinish={handleSave}
            className="max-w-2xl"
          >
            {/* 头像上传 */}
            <Form.Item label="用户头像">
              <div className="flex items-center space-x-4">
                <Avatar size={80} src={userData.avatar} />
                <Upload
                  name="avatar"
                  action="/api/upload"
                  onChange={handleUpload}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </div>
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 基本信息 */}
              <Form.Item
                label="用户名"
                name="name"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>

              <Form.Item
                label="邮箱地址"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>

              <Form.Item
                label="手机号码"
                name="phone"
                rules={[{ required: true, message: '请输入手机号码' }]}
              >
                <Input placeholder="请输入手机号码" />
              </Form.Item>

              <Form.Item
                label="用户角色"
                name="role"
                rules={[{ required: true, message: '请选择用户角色' }]}
              >
                <Select placeholder="请选择用户角色">
                  <Option value="admin">管理员</Option>
                  <Option value="user">普通用户</Option>
                  <Option value="editor">知识运营</Option>
                  <Option value="viewer">只读观察员</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="账户状态"
                name="status"
                rules={[{ required: true, message: '请选择账户状态' }]}
              >
                <Select placeholder="请选择账户状态">
                  <Option value="active">活跃</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="所属部门"
                name="department"
                rules={[{ required: true, message: '请输入所属部门' }]}
              >
                <Input placeholder="请输入所属部门" />
              </Form.Item>

              <Form.Item
                label="职位"
                name="position"
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </div>

            {/* 个人简介 */}
            <Form.Item
              label="个人简介"
              name="description"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="请输入个人简介"
                maxLength={500}
                showCount
              />
            </Form.Item>

            {/* 操作按钮 */}
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  保存修改
                </Button>
                <Button onClick={handleBack}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserEditPage;
