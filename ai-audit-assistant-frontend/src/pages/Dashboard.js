import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Card, Row, Col, Typography, Spin, DatePicker, Switch, Button, message, ConfigProvider, theme, Table, List, Input, Modal, Avatar, Tooltip } from 'antd';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { DownloadOutlined, ReloadOutlined, PlusOutlined, RobotOutlined, SendOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import { dashboard } from '../services/api';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [anomalies, setAnomalies] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboard.fetchData(dateRange[0], dateRange[1]);
      setData(response);
      setAiInsights(response.aiInsights);
      setAiRecommendations(response.aiRecommendations);
      setAnomalies(response.anomalies);
    } catch (err) {
      message.error('获取仪表板数据失败');
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
    message.info('导出数据中...');
    // 实现导出逻辑
  };

  const handleAiAssistant = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { type: 'user', content: inputValue };
    setChatMessages([...chatMessages, userMessage]);
    setInputValue('');

    try {
      const response = await dashboard.queryAiAssistant(inputValue);
      setChatMessages((prevMessages) => [...prevMessages, { type: 'ai', content: response.answer }]);
    } catch (err) {
      message.error('AI助手无法处理您的请求');
    }
  };

  if (loading) return <Spin size="large" />;
  if (!data) return <div>没有可用数据</div>;

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
              checkedChildren="暗色"
              unCheckedChildren="亮色"
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
            <Statistic title="总审核任务" value={data.totalTasks} />
          </Col>
          <Col span={8}>
            <Statistic title="待处理任务" value={data.pendingTasks} valueStyle={{ color: '#ff4d4f' }} />
          </Col>
          <Col span={8}>
            <Statistic title="本月完成任务" value={data.completedTasksThisMonth} valueStyle={{ color: '#52c41a' }} />
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
                  <RechartsTooltip />
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
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#8884d8" />
                  <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeDasharray="3 3" />
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
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="AI洞察" extra={<Button type="link">查看所有洞察</Button>}>
              <List
                dataSource={aiInsights}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={<Paragraph ellipsis={{ rows: 2 }}>{item.summary}</Paragraph>}
                    />
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

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="AI推荐">
              <List
                dataSource={aiRecommendations}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="AI助手" bodyStyle={{ height: 300, overflowY: 'auto' }}>
              <List
                dataSource={chatMessages}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar icon={item.type === 'user' ? <UserOutlined /> : <RobotOutlined />} />
                      }
                      title={item.type === 'user' ? '你' : 'AI助手'}
                      description={item.content}
                    />
                  </List.Item>
                )}
              />
              <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#fff', padding: '10px 0' }}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleAiAssistant}
                  suffix={
                    <Button type="primary" icon={<SendOutlined />} onClick={handleAiAssistant}>
                      发送
                    </Button>
                  }
                  placeholder="询问AI助手..."
                />
              </div>
            </Card>
          </Col>
        </Row>

        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="异常检测">
              <List
                dataSource={anomalies}
                renderItem={(item) => (
                  <List.Item>
                    <Tooltip title={item.description}>
                      <WarningOutlined style={{ color: 'red', marginRight: 8 }} />
                      <Text>{item.title}</Text>
                    </Tooltip>
                  </List.Item>
                )}
              />
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
  <Card>
    <Text>{title}</Text>
    <Title level={3} style={valueStyle}>
      {value}
      {suffix && <small style={{ fontSize: '65%', marginLeft: 8 }}>{suffix}</small>}
    </Title>
  </Card>
);

export default Dashboard;