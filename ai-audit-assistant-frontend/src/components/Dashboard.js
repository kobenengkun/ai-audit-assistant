import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Typography, Spin } from 'antd';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboard } from '../services/api';

const { Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboard.fetchData();
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Spin size="large" />;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <Content style={{ margin: '24px 16px 0' }}>
      <Title level={2}>AI审核小助手</Title>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="总审核任务">
            <Title level={3}>{data.totalTasks}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="待处理任务">
            <Title level={3} style={{ color: '#FF4D4F' }}>{data.pendingTasks}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="本月完成任务">
            <Title level={3} style={{ color: '#52C41A' }}>{data.completedTasksThisMonth}</Title>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="审核任务状态分布">
            <PieChart width={300} height={300}>
              <Pie
                data={data.taskStatusDistribution}
                cx={150}
                cy={150}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.taskStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近活动">
            <ul>
              {data.recentActivities.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default Dashboard;