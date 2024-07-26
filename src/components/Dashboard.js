import React from 'react';
import { Layout, Row, Col, Card, Statistic, Button, Typography } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const { Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const auditStatusData = [
    { name: '进行中', value: 5 },
    { name: '待处理', value: 3 },
    { name: '已完成', value: 8 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <Content style={{ padding: '20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
        AI审核小助手
      </Title>
      <Title level={3}>审核系统概览</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="总审核任务" value={16} />
            <Button style={{ marginTop: 16 }} type="primary">
              查看所有任务
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="待处理任务" value={3} valueStyle={{ color: '#cf1322' }} />
            <Button style={{ marginTop: 16 }} type="primary">
              处理任务
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="本月完成任务" value={8} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="审核任务状态分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={auditStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {auditStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近活动">
            {/* 这里可以添加最近的审核活动列表 */}
            <p>暂无最近活动</p>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default Dashboard;