import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Card, Row, Col, Typography, Spin, DatePicker, Switch, Button, message, ConfigProvider, theme, Table, List } from 'antd';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DownloadOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { dashboard } from '../services/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboard.fetchData(dateRange[0], dateRange[1]);
      setData(response);
    } catch (err) {
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const toggleTheme = (checked) => {
    setIsDarkMode(checked);
  };

  const exportData = () => {
    message.info('Exporting data...');
  };

  if (loading) return <Spin size="large" />;
  if (!data) return <div>No data available</div>;

  return (
    <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Content style={{ padding: '24px' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2}>AI审核小助手</Title>
          </Col>
          <Col>
            <RangePicker onChange={handleDateRangeChange} style={{ marginRight: 16 }} />
            <Switch
              checkedChildren="Dark"
              unCheckedChildren="Light"
              onChange={toggleTheme}
              checked={isDarkMode}
              style={{ marginRight: 16 }}
            />
            <Button icon={<DownloadOutlined />} onClick={exportData} style={{ marginRight: 16 }}>
              导出数据
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchDashboardData}>
              刷新
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <Statistic title="总审核任务" value={data.totalTasks} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="待处理任务" value={data.pendingTasks} valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="本月完成任务" value={data.completedTasksThisMonth} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="任务状态分布">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.taskStatusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {data.taskStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="近期任务完成趋势">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="审核类型分布">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.auditTypeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="最近活动">
              <List
                dataSource={data.recentActivities}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="性能指标">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="平均审核时间" value={data.avgAuditTime} suffix="分钟" />
                </Col>
                <Col span={8}>
                  <Statistic title="审核效率" value={data.auditEfficiency} suffix="%" />
                </Col>
                <Col span={8}>
                  <Statistic title="本月新增任务" value={data.newTasksThisMonth} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="快速操作">
              <Button type="primary" icon={<PlusOutlined />} style={{ marginRight: 16 }}>
                创建新任务
              </Button>
              <Button>查看所有任务</Button>
            </Card>
          </Col>
        </Row>
      </Content>
    </ConfigProvider>
  );
};

const Statistic = ({ title, value, valueStyle, suffix }) => (
  <div>
    <Text>{title}</Text>
    <Title level={3} style={valueStyle}>
      {value}
      {suffix && <small style={{ fontSize: '65%', marginLeft: 8 }}>{suffix}</small>}
    </Title>
  </div>
);

export default Dashboard;