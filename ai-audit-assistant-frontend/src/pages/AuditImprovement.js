import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Table, Input, Button, Space, Tag, Modal, Typography, Row, Col, Card, Select, Form, message, Tooltip, Progress, Alert, Spin } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, RobotOutlined, BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
import { auditImprovements, aiService } from '../services/api';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, ResponsiveContainer } from 'recharts';
import debounce from 'lodash/debounce';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

// 扩展模拟数据
const mockSuppliers = [
  { id: 1, name: '供应商A', status: '待审核', lastAuditDate: '2024-07-15', improvementCount: 5, aiRiskScore: 75 },
  { id: 2, name: '供应商B', status: '已完成', lastAuditDate: '2024-07-20', improvementCount: 2, aiRiskScore: 30 },
  { id: 3, name: '供应商C', status: '待审核', lastAuditDate: '2024-08-01', improvementCount: 8, aiRiskScore: 85 },
  { id: 4, name: '供应商D', status: '已完成', lastAuditDate: '2024-07-25', improvementCount: 1, aiRiskScore: 20 },
  { id: 5, name: '供应商E', status: '待审核', lastAuditDate: '2024-08-05', improvementCount: 6, aiRiskScore: 60 },
];

const AuditImprovement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, statusFilter]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await auditImprovements.fetchSuppliers();
      const enhancedData = await Promise.all(data.map(async (supplier) => {
        const aiAnalysis = await aiService.analyzeSupplier(supplier.id);
        return { ...supplier, aiRiskScore: aiAnalysis.riskScore, aiSuggestions: aiAnalysis.suggestions };
      }));
      setSuppliers(enhancedData);
      setIsUsingMockData(false);
    } catch (error) {
      console.error('获取供应商列表失败:', error);
      message.warning('无法连接到服务器，显示模拟数据');
      setSuppliers(mockSuppliers);
      setIsUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    let result = suppliers;
    if (searchTerm) {
      result = result.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(supplier => supplier.status === statusFilter);
    }
    setFilteredSuppliers(result);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const showSupplierDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalVisible(true);
    form.setFieldsValue(supplier);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const markAsCompleted = async (supplierId) => {
    // 实现标记完成的逻辑
  };

  const showAiSuggestions = async (supplier) => {
    // 实现显示AI建议的逻辑
  };

  const showTrendChart = () => {
    // 实现显示趋势图表的逻辑
  };

  const columns = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '待审核' ? 'orange' : 'green'}>{status}</Tag>
      ),
    },
    {
      title: '上次审核日期',
      dataIndex: 'lastAuditDate',
      key: 'lastAuditDate',
      sorter: (a, b) => new Date(a.lastAuditDate) - new Date(b.lastAuditDate),
    },
    {
      title: '待改进项数量',
      dataIndex: 'improvementCount',
      key: 'improvementCount',
      sorter: (a, b) => a.improvementCount - b.improvementCount,
    },
    {
      title: 'AI风险评分',
      dataIndex: 'aiRiskScore',
      key: 'aiRiskScore',
      render: (score) => (
        <Tooltip title={`AI评估的风险分数: ${score}`}>
          <Progress percent={score} size="small" status={score > 70 ? "exception" : "active"} />
        </Tooltip>
      ),
      sorter: (a, b) => a.aiRiskScore - b.aiRiskScore,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="查看详情">
            <Button icon={<EyeOutlined />} onClick={() => showSupplierDetails(record)} />
          </Tooltip>
          <Tooltip title="标记完成">
            <Button icon={<CheckOutlined />} onClick={() => markAsCompleted(record.id)} disabled={record.status !== '待审核'} />
          </Tooltip>
          <Tooltip title="AI建议">
            <Button icon={<RobotOutlined />} onClick={() => showAiSuggestions(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2}>审核改进</Title>
      {isUsingMockData && (
        <Alert
          message="注意：当前显示的是模拟数据"
          description="无法连接到服务器，显示的信息可能不是最新的。请稍后再试。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Search
                placeholder="智能搜索供应商"
                allowClear
                enterButton="搜索"
                size="large"
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
              <Select defaultValue="all" style={{ width: 120 }} onChange={handleStatusChange}>
                <Option value="all">所有状态</Option>
                <Option value="待审核">待审核</Option>
                <Option value="已完成">已完成</Option>
              </Select>
              <Button type="primary" icon={<ReloadOutlined />} onClick={fetchSuppliers}>
                刷新
              </Button>
              <Button icon={<BarChartOutlined />} onClick={showTrendChart}>
                趋势分析
              </Button>
            </Space>
            <Table
              columns={columns}
              dataSource={filteredSuppliers}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="供应商审核详情"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedSupplier && (
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="供应商名称">
              <Input disabled />
            </Form.Item>
            <Form.Item name="status" label="审核状态">
              <Select disabled>
                <Option value="待审核">待审核</Option>
                <Option value="已完成">已完成</Option>
              </Select>
            </Form.Item>
            <Form.Item name="lastAuditDate" label="上次审核日期">
              <Input disabled />
            </Form.Item>
            <Form.Item name="improvementCount" label="待改进项数量">
              <Input type="number" disabled />
            </Form.Item>
            <Form.Item name="aiRiskScore" label="AI风险评分">
              <Progress percent={selectedSupplier.aiRiskScore} status={selectedSupplier.aiRiskScore > 70 ? "exception" : "active"} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Content>
  );
};

export default AuditImprovement;