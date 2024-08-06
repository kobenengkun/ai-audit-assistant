import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Table, Input, Button, Space, Tag, Modal, Typography, Card, Row, Col, Statistic, Tooltip, message, Form, DatePicker, Select, Spin } from 'antd';
import { EyeOutlined, DownloadOutlined, SwapOutlined, SearchOutlined, SyncOutlined, RobotOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';
import { auditReports, aiService } from '../services/api';
import debounce from 'lodash/debounce';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const AuditReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [isComparingReports, setIsComparingReports] = useState(false);
  const [statistics, setStatistics] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchReports();
    fetchRiskTrend();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await auditReports.fetchAll();
      setReports(data);
      updateStatistics(data);
    } catch (error) {
      message.error('获取审核报告失败');
    } finally {
      setLoading(false);
    }
  };

  const updateStatistics = (data) => {
    const stats = data.reduce((acc, report) => {
      acc.total++;
      if (report.riskLevel) {
        acc[report.riskLevel.toLowerCase()]++;
      }
      return acc;
    }, { total: 0, high: 0, medium: 0, low: 0 });
    setStatistics(stats);
  };

  const fetchRiskTrend = async () => {
    try {
      const data = await aiService.getRiskTrend();
      setTrendData(data);
    } catch (error) {
      message.error('获取风险趋势数据失败');
    }
  };

  const handleSearch = useCallback(debounce(async (value) => {
    setLoading(true);
    try {
      const results = await aiService.smartSearch(value);
      setReports(results);
      updateStatistics(results);
    } catch (error) {
      message.error('智能搜索失败');
    } finally {
      setLoading(false);
    }
  }, 300), []);

  const handleAdvancedSearch = async (values) => {
    setLoading(true);
    try {
      const results = await aiService.advancedSearch(values);
      setReports(results);
      updateStatistics(results);
    } catch (error) {
      message.error('高级搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdvancedSearch = () => {
    setAdvancedSearch(!advancedSearch);
  };

  const showReportDetails = (report) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const downloadReport = (reportId) => {
    message.info(`正在下载报告 ${reportId}`);
    // 实现实际的下载逻辑
  };

  const toggleReportSelection = (report) => {
    setSelectedReports(prev => 
      prev.includes(report.id) 
        ? prev.filter(id => id !== report.id)
        : [...prev, report.id]
    );
  };

  const compareReports = async () => {
    if (selectedReports.length !== 2) {
      message.error('请选择两个报告进行比较');
      return;
    }
    setIsComparingReports(true);
    try {
      const comparisonResult = await aiService.compareReports(selectedReports);
      // 在新的模态框或组件中显示比较结果
      message.success('报告比较成功');
    } catch (error) {
      message.error('报告比较失败');
    } finally {
      setIsComparingReports(false);
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch(riskLevel?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '报告ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '审核任务',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '审核日期',
      dataIndex: 'auditDate',
      key: 'auditDate',
    },
    {
      title: '审核人',
      dataIndex: 'auditor',
      key: 'auditor',
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (riskLevel) => (
        <Tag color={getRiskLevelColor(riskLevel)}>
          {riskLevel ? riskLevel.toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'AI分析',
      dataIndex: 'aiAnalysis',
      key: 'aiAnalysis',
      render: (aiAnalysis) => (
        <Tooltip title={aiAnalysis}>
          <Text ellipsis style={{ width: 200 }}>{aiAnalysis || 'N/A'}</Text>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="查看详情">
            <Button icon={<EyeOutlined />} onClick={() => showReportDetails(record)} />
          </Tooltip>
          <Tooltip title="下载报告">
            <Button icon={<DownloadOutlined />} onClick={() => downloadReport(record.id)} />
          </Tooltip>
          <Tooltip title="选择比较">
            <Button 
              icon={<SwapOutlined />} 
              onClick={() => toggleReportSelection(record)}
              type={selectedReports.includes(record.id) ? 'primary' : 'default'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2}>审核报告</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="总报告数" 
              value={statistics.total} 
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<small style={{fontSize: '12px'}}>+5%</small>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="高风险报告" value={statistics.high} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="中风险报告" value={statistics.medium} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="低风险报告" value={statistics.low} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={advancedSearch ? 24 : 12}>
            {advancedSearch ? (
              <Form form={form} layout="inline" onFinish={handleAdvancedSearch}>
                <Form.Item name="keyword">
                  <Input placeholder="关键词" />
                </Form.Item>
                <Form.Item name="dateRange">
                  <RangePicker />
                </Form.Item>
                <Form.Item name="riskLevel">
                  <Select placeholder="风险等级">
                    <Select.Option value="high">高</Select.Option>
                    <Select.Option value="medium">中</Select.Option>
                    <Select.Option value="low">低</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">搜索</Button>
                </Form.Item>
              </Form>
            ) : (
              <Search
                placeholder="智能搜索报告"
                allowClear
                enterButton="搜索"
                size="large"
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            )}
          </Col>
          <Col span={advancedSearch ? 24 : 12}>
            <Space>
              <Button onClick={toggleAdvancedSearch}>
                {advancedSearch ? '简单搜索' : '高级搜索'}
              </Button>
              <Tooltip title="刷新数据">
                <Button icon={<SyncOutlined />} onClick={fetchReports}>刷新</Button>
              </Tooltip>
              <Tooltip title="AI助手">
                <Button icon={<RobotOutlined />} onClick={() => message.info('AI助手功能即将推出')}>AI助手</Button>
              </Tooltip>
              <Tooltip title="对比选中的报告">
                <Button 
                  icon={<SwapOutlined />} 
                  onClick={compareReports}
                  disabled={selectedReports.length !== 2}
                  loading={isComparingReports}
                >
                  对比报告
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Spin spinning={loading}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Line type="monotone" dataKey="high" stroke="#cf1322" />
              <Line type="monotone" dataKey="medium" stroke="#faad14" />
              <Line type="monotone" dataKey="low" stroke="#3f8600" />
            </LineChart>
          </ResponsiveContainer>
        </Spin>
      </Card>

      <Table
        columns={columns}
        dataSource={reports}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 16 }}
      />

      <Modal
        title="审核报告详情"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedReport && (
          <div>
            <p><strong>报告ID:</strong> {selectedReport.id}</p>
            <p><strong>审核任务:</strong> {selectedReport.taskName}</p>
            <p><strong>审核日期:</strong> {selectedReport.auditDate}</p>
            <p><strong>审核人:</strong> {selectedReport.auditor}</p>
            <p><strong>风险等级:</strong> {selectedReport.riskLevel || 'N/A'}</p>
            <p><strong>AI分析:</strong> {selectedReport.aiAnalysis || 'N/A'}</p>
            {/* 可以添加更多详细信息 */}
          </div>
        )}
      </Modal>
    </Content>
  );
};

export default AuditReport;