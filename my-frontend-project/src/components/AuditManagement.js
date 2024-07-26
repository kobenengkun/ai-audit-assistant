import React from 'react';
import { Button, Card, Row, Col, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AuditManagement = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>审核管理</Title>
      
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: '20px' }}>
        创建新审核任务
      </Button>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card title="进行中的审核" extra={<a href="#">更多</a>}>
            <p>暂无进行中的审核任务</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="待处理的审核" extra={<a href="#">更多</a>}>
            <p>暂无待处理的审核任务</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="已完成的审核" extra={<a href="#">更多</a>}>
            <p>暂无已完成的审核任务</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AuditManagement;