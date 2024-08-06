import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { HomeOutlined, ScheduleOutlined, AuditOutlined, FileTextOutlined, ToolOutlined } from '@ant-design/icons';

const { Header } = Layout;

const Navigation = () => {
  const location = useLocation();

  return (
    <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
        <Menu.Item key="/" icon={<HomeOutlined />}>
          <Link to="/">首页</Link>
        </Menu.Item>
        <Menu.Item key="/audit-plan" icon={<ScheduleOutlined />}>
          <Link to="/audit-plans">审核计划</Link>
        </Menu.Item>
        <Menu.Item key="/audit-execution" icon={<AuditOutlined />}>
          <Link to="/audit-execution">审核执行</Link>
        </Menu.Item>
        <Menu.Item key="/audit-report" icon={<FileTextOutlined />}>
          <Link to="/audit-report">审核报告</Link>
        </Menu.Item>
        <Menu.Item key="/audit-improvement" icon={<ToolOutlined />}>
          <Link to="/audit-improvement">审核改进</Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
};

export default Navigation;