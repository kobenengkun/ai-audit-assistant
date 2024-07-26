import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, AuditOutlined } from '@ant-design/icons';

const Navigation = () => {
  return (
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['audit-management']}>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        <Link to="/">首页</Link>
      </Menu.Item>
      <Menu.Item key="audit-management" icon={<AuditOutlined />}>
        <Link to="/audit-management">审核管理</Link>
      </Menu.Item>
    </Menu>
  );
};

export default Navigation;