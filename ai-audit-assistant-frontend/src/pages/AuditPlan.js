import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Layout, Table, Button, Modal, Form, Input, DatePicker, Select, Space,
  message, Tooltip, Tag, Alert, Popconfirm, Card, Row, Col, Statistic, Progress
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, RobotOutlined, AlertOutlined,
  ScheduleOutlined, SafetyOutlined, TeamOutlined, SearchOutlined, DownloadOutlined
} from '@ant-design/icons';
import { auditPlans } from '../services/api';
import { handleError } from '../utils/errorHandler';
import dayjs from 'dayjs';

const { Content } = Layout;
const { RangePicker } = DatePicker;

const AuditPlan = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchForm] = Form.useForm();
  const [statisticsData, setStatisticsData] = useState({
    total: 0,
    '进行中': 0,
    '已完成': 0,
    '计划中': 0
  });

  const fetchAuditPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditPlans.fetchAll();
      setData(response);
      updateStatistics(response);
    } catch (error) {
      setError('获取审核计划失败');
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditPlans();
  }, [fetchAuditPlans]);

  const updateStatistics = useCallback((plans) => {
    const stats = plans.reduce((acc, plan) => {
      acc.total++;
      acc[plan.status] = (acc[plan.status] || 0) + 1;
      return acc;
    }, { total: 0, '进行中': 0, '已完成': 0, '计划中': 0 });
    setStatisticsData(stats);
  }, []);

  const showModal = useCallback((record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  }, [form]);

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const auditPlanData = {
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
      };
      delete auditPlanData.dateRange;

      if (editingRecord) {
        await auditPlans.update(editingRecord.id, auditPlanData);
        message.success('更新审核计划成功');
      } else {
        await auditPlans.create(auditPlanData);
        message.success('创建审核计划成功');
      }

      setIsModalVisible(false);
      fetchAuditPlans();
    } catch (error) {
      message.error('操作失败，请重试');
      handleError(error);
    }
  }, [form, editingRecord, fetchAuditPlans]);

  const handleDelete = useCallback(async (id) => {
    try {
      await auditPlans.delete(id);
      message.success('删除审核计划成功');
      fetchAuditPlans();
    } catch (error) {
      message.error('删除审核计划失败');
      handleError(error);
    }
  }, [fetchAuditPlans]);

  const getAiSuggestions = useCallback(async () => {
    setError(null);
    try {
      const suggestions = await auditPlans.getAiSuggestions();
      setAiSuggestions(suggestions);
      message.success('AI建议获取成功');
    } catch (error) {
      setError('获取AI建议失败');
      handleError(error);
    }
  }, []);

  const applyAiSuggestions = useCallback(async () => {
    setError(null);
    try {
      const updatedPlans = await auditPlans.applyAiSuggestions();
      setData(updatedPlans);
      updateStatistics(updatedPlans);
      message.success('AI建议应用成功');
      setAiSuggestions(null);
    } catch (error) {
      setError('应用AI建议失败');
      handleError(error);
    }
  }, [updateStatistics]);

  const generateSmartSchedule = useCallback(async () => {
    setError(null);
    try {
      const smartSchedule = await auditPlans.generateSmartSchedule();
      setData(smartSchedule);
      updateStatistics(smartSchedule);
      message.success('智能排程生成成功');
    } catch (error) {
      setError('智能排程生成失败');
      handleError(error);
    }
  }, [updateStatistics]);

  const optimizeResources = useCallback(async () => {
    setError(null);
    try {
      const optimizedPlans = await auditPlans.optimizeResources();
      setData(optimizedPlans);
      updateStatistics(optimizedPlans);
      message.success('资源分配优化完成');
    } catch (error) {
      setError('资源分配优化失败');
      handleError(error);
    }
  }, [updateStatistics]);

  const handleBatchDelete = useCallback(async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => auditPlans.delete(id)));
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchAuditPlans();
    } catch (error) {
      message.error('批量删除失败');
      handleError(error);
    }
  }, [selectedRowKeys, fetchAuditPlans]);

  const handleAdvancedSearch = useCallback(async (values) => {
    setLoading(true);
    try {
      const filteredPlans = await auditPlans.advancedSearch(values);
      setData(filteredPlans);
      updateStatistics(filteredPlans);
    } catch (error) {
      message.error('搜索失败');
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [updateStatistics]);

  const columns = useMemo(() => [
    { title: '审核计划名称', dataIndex: 'name', key: 'name' },
    { title: '审核类型', dataIndex: 'type', key: 'type' },
    { title: '审核人员', dataIndex: 'staff', key: 'staff' },
    { title: '审核标准', dataIndex: 'standard', key: 'standard' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === '已完成' ? 'green' : status === '进行中' ? 'blue' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除这个审核计划吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger>删除</Button>
          </Popconfirm>
          <Button icon={<SafetyOutlined />} onClick={() => message.info('风险评估功能即将上线')}>风险评估</Button>
        </Space>
      ),
    },
  ], [showModal, handleDelete]);

  const renderStatistics = () => (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={6}>
        <Card>
          <Statistic title="总计划数" value={statisticsData.total} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="进行中" value={statisticsData['进行中']} valueStyle={{ color: '#1890ff' }} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="已完成" value={statisticsData['已完成']} valueStyle={{ color: '#3f8600' }} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="计划中" value={statisticsData['计划中']} valueStyle={{ color: '#faad14' }} />
        </Card>
      </Col>
    </Row>
  );

  const renderProgress = () => {
    const total = statisticsData.total;
    const completed = statisticsData['已完成'];
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <Card title="审核计划完成进度" style={{ marginBottom: 16 }}>
        <Progress percent={percent} status="active" />
      </Card>
    );
  };

  return (
    <Content style={{ padding: '20px' }}>
      <h1>审核计划</h1>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      
      {renderStatistics()}
      {renderProgress()}

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          创建新审核计划
        </Button>
        <Button icon={<RobotOutlined />} onClick={getAiSuggestions}>
          获取AI建议
        </Button>
        <Button icon={<ScheduleOutlined />} onClick={generateSmartSchedule}>
          智能排程
        </Button>
        <Button icon={<TeamOutlined />} onClick={optimizeResources}>
          优化资源分配
        </Button>
        <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
          批量删除
        </Button>
        <Button icon={<DownloadOutlined />} onClick={() => message.info('导出功能即将上线')}>
          导出数据
        </Button>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleAdvancedSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="搜索审核计划" prefix={<SearchOutlined />} />
          </Form.Item>
          <Form.Item name="type" label="审核类型">
            <Select style={{ width: 200 }} placeholder="选择审核类型">
              <Select.Option value="一方审核:内部审核">内部审核</Select.Option>
              <Select.Option value="二方审核:客户审核">客户审核</Select.Option>
              <Select.Option value="三方审核:审核机构">审核机构</Select.Option>
              <Select.Option value="供应商审核">供应商审核</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select style={{ width: 200 }} placeholder="选择状态">
              <Select.Option value="计划中">计划中</Select.Option>
              <Select.Option value="进行中">进行中</Select.Option>
              <Select.Option value="已完成">已完成</Select.Option>
              <Select.Option value="已取消">已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="日期范围">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
      </Card>

      {aiSuggestions && (
        <Alert
          message="AI建议"
          description={
            <div>
              <p>{aiSuggestions}</p>
              <Button type="primary" icon={<RobotOutlined />} onClick={applyAiSuggestions}>
                应用AI建议
              </Button>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      <Modal
        title={editingRecord ? "编辑审核计划" : "创建新审核计划"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="审核计划名称" rules={[{ required: true, message: '请输入审核计划名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="审核类型" rules={[{ required: true, message: '请选择审核类型' }]}>
            <Select>
              <Select.Option value="一方审核:内部审核">一方审核:内部审核</Select.Option>
              <Select.Option value="二方审核:客户审核">二方审核:客户审核</Select.Option>
              <Select.Option value="三方审核:审核机构">三方审核:审核机构</Select.Option>
              <Select.Option value="供应商审核">供应商审核</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="staff" label="审核人员">
            <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>
              {/* 这里可以添加从后端获取的审核人员选项 */}
            </Select>
          </Form.Item>
          <Form.Item name="standard" label="审核标准">
            <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>
              <Select.Option value="IATF 16949">IATF 16949</Select.Option>
              <Select.Option value="ISO 9001">ISO 9001</Select.Option>
              <Select.Option value="VDA 6.3">VDA 6.3</Select.Option>
              {/* 可以添加更多审核标准选项 */}
            </Select>
          </Form.Item>
          <Form.Item 
            name="dateRange" 
            label="计划日期范围" 
            rules={[
              { required: true, message: '请选择日期范围' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || (value[0] && value[1])) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('请选择有效的日期范围'));
                },
              }),
            ]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select>
              <Select.Option value="计划中">计划中</Select.Option>
              <Select.Option value="进行中">进行中</Select.Option>
              <Select.Option value="已完成">已完成</Select.Option>
              <Select.Option value="已取消">已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="progress" label="进度" rules={[{ required: true, message: '请输入进度' }]}>
            <Progress
              type="circle"
              percent={form.getFieldValue('progress') || 0}
              format={percent => `${percent}%`}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default React.memo(AuditPlan);