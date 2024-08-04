import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Typography, Spin, DatePicker, Switch, Tooltip, Button } from 'antd';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Label, LabelList } from 'recharts';
import { DownloadOutlined } from '@ant-design/icons';
import { dashboard } from '../services/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      const response = await dashboard.fetchData(dateRange[0], dateRange[1]);
      console.log('Dashboard data received:', response);
      setData(response);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
    // 在这里实现主题切换逻辑
  };

  const exportData = () => {
    // 实现数据导出逻辑
    console.log('Exporting data...');
  };

  if (loading) return <Spin size="large" />;
  if (error) return <div>Error: {error}</div>;
  if (!data || !data.taskStatusDistribution) {
    console.error('Invalid dashboard data:', data);
    return <div>Error: Invalid dashboard data</div>;
  }

  const themeColor = isDarkMode ? '#fff' : '#000';

  return (
    <Content style={{ margin: '24px 16px 0', color: themeColor, backgroundColor: isDarkMode ? '#001529' : '#fff' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ color: themeColor }}>AI审核小助手</Title>
        </Col>
        <Col>
          <RangePicker onChange={handleDateRangeChange} style={{ marginRight: 16 }} />
          <Switch
            checkedChildren="Dark"
            unCheckedChildren="Light"
            onChange={toggleDarkMode}
            style={{ marginRight: 16 }}
          />
          <Button icon={<DownloadOutlined />} onClick={exportData}>
            导出数据
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="总审核任务" value={data.totalTasks} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="待处理任务" value={data.pendingTasks} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="本月完成任务" value={data.completedTasksThisMonth} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <Card title="审核任务状态分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.taskStatusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.taskStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="outside" />
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近活动" style={{ height: '100%' }}>
            {data.recentActivities && data.recentActivities.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {data.recentActivities.map((activity, index) => (
                  <li key={index}>
                    <Tooltip title="点击查看详情">
                      <Text style={{ cursor: 'pointer' }}>{activity}</Text>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No recent activities</div>
            )}
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

const Statistic = ({ title, value, valueStyle }) => (
  <div>
    <Text>{title}</Text>
    <Title level={3} style={valueStyle}>{value}</Title>
  </div>
);

export default Dashboard;