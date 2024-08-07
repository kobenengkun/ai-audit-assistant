import React, { useState, useCallback, useEffect } from 'react';
import {
  Layout, Table, Button, Modal, Form, Input, DatePicker, Select, Space,
  message, Tag, Alert, Popconfirm, Card, Row, Col, Statistic, Progress,
  Calendar, Badge, Tabs, List, Drawer, Descriptions, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, FileAddOutlined,
  SafetyOutlined, SearchOutlined, EyeOutlined
} from '@ant-design/icons';
import { auditPlans } from '../services/api';
import { handleError } from '../utils/errorHandler';
import dayjs from 'dayjs';

const { Content } = Layout;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditPlan = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [statisticsData, setStatisticsData] = useState({
    total: 0,
    '进行中': 0,
    '已完成': 0,
    '计划中': 0
  });

  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templateForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState({ keyword: '', status: 'all' });

  const fetchAuditPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditPlans.fetchAll(searchParams);
      setData(response);
      updateStatistics(response);
    } catch (error) {
      setError('获取审核计划失败');
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await auditPlans.fetchTemplates();
      setTemplates(response);
    } catch (error) {
      message.error('获取模板失败');
      handleError(error);
    }
  }, []);

  useEffect(() => {
    fetchAuditPlans();
    fetchTemplates();
  }, [fetchAuditPlans, fetchTemplates]);

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

  const showDetailDrawer = useCallback((record) => {
    setDetailRecord(record);
    setIsDetailDrawerVisible(true);
  }, []);

  const showTemplateModal = useCallback(() => {
    templateForm.resetFields();
    setIsTemplateModalVisible(true);
  }, [templateForm]);

  const handleTemplateOk = useCallback(async () => {
    try {
      const values = await templateForm.validateFields();
      await auditPlans.createTemplate(values);
      message.success('创建模板成功');
      setIsTemplateModalVisible(false);
      fetchTemplates();
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写所有必填字段');
      } else {
        message.error('创建模板失败');
        handleError(error);
      }
    }
  }, [templateForm, fetchTemplates]);

  const handleUseTemplate = useCallback((template) => {
    form.setFieldsValue({
      ...template,
      dateRange: [dayjs(), dayjs().add(7, 'day')],
    });
    showModal();
  }, [form, showModal]);

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

  const handleBatchDelete = useCallback(async () => {
    try {
      await auditPlans.batchDelete(selectedRowKeys);
      message.success('批量删除审核计划成功');
      fetchAuditPlans();
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量删除审核计划失败');
      handleError(error);
    }
  }, [selectedRowKeys, fetchAuditPlans]);

  const handleSearch = useCallback((values) => {
    setSearchParams(values);
  }, []);

  const renderCalendarData = (value) => {
    const listData = data.filter(item =>
      dayjs(item.startDate).isSame(value, 'day') || dayjs(item.endDate).isSame(value, 'day')
    );

    return (
      <ul className="events">
        {listData.map(item => (
          <li key={item.id}>
            <Badge status={item.status === '已完成' ? 'success' : 'processing'} text={item.name} />
          </li>
        ))}
      </ul>
    );
  };

  const renderTemplateList = () => (
    <List
      dataSource={templates}
      renderItem={item => (
        <List.Item
          actions={[
            <Button key="use" icon={<FileAddOutlined />} onClick={() => handleUseTemplate(item)}>使用</Button>,
          ]}
        >
          <List.Item.Meta
            title={item.name}
            description={`${item.type} - ${item.standard.join(', ')}`}
          />
        </List.Item>
      )}
    />
  );

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

  const columns = [
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
          <Button icon={<EyeOutlined />} onClick={() => showDetailDrawer(record)}>详情</Button>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Popconfirm
            title="你确定要删除这个审核计划吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="是的"
            cancelText="不用了"
          >
            <Button icon={<DeleteOutlined />} danger>删除</Button>
          </Popconfirm>
          <Button icon={<SafetyOutlined />} onClick={() => message.info('风险评估功能即将上线')}>风险评估</Button>
        </Space>
      ),
    },
  ];

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
        <Button icon={<SaveOutlined />} onClick={showTemplateModal}>
          创建模板
        </Button>
        <Popconfirm
          title={`你确定要删除这 ${selectedRowKeys.length} 个审核计划吗?`}
          onConfirm={handleBatchDelete}
          okText="是的"
          cancelText="不用了"
          disabled={!selectedRowKeys.length}
        >
          <Button icon={<DeleteOutlined />} danger disabled={!selectedRowKeys.length}>
            批量删除
          </Button>
        </Popconfirm>
      </Space>

      <Form layout="inline" onFinish={handleSearch}>
        <Form.Item name="keyword">
          <Input prefix={<SearchOutlined />} placeholder="搜索审核计划" allowClear />
        </Form.Item>
        <Form.Item name="status">
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部状态</Option>
            <Option value="进行中">进行中</Option>
            <Option value="已完成">已完成</Option>
            <Option value="计划中">计划中</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
        </Form.Item>
      </Form>

      <Tabs defaultActiveKey="table">
        <TabPane tab="表格视图" key="table">
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
        </TabPane>
        <TabPane tab="日历视图" key="calendar">
          <Calendar
            dateCellRender={renderCalendarData}
            mode="month"
          />
        </TabPane>
        <TabPane tab="模板" key="templates">
          {renderTemplateList()}
        </TabPane>
      </Tabs>

      <Modal
        title={editingRecord ? "编辑审核计划" : "创建新审核计划"}
        visible={isModalVisible}
        onOk={() => { /* 处理提交审核计划表单逻辑 */ }}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="审核计划名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="审核类型" rules={[{ required: true }]}>
            <Select>
              <Option value="财务审核">财务审核</Option>
              <Option value="合规审核">合规审核</Option>
              <Option value="运营审核">运营审核</Option>
            </Select>
          </Form.Item>
          <Form.Item name="staff" label="审核人员" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="standard" label="审核标准" rules={[{ required: true }]}>
            <Select mode="multiple">
              <Option value="ISO 9001">ISO 9001</Option>
              <Option value="ISO 14001">ISO 14001</Option>
              <Option value="OHSAS 18001">OHSAS 18001</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="审核日期范围" rules={[{ required: true }]}>
            <RangePicker />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Option value="计划中">计划中</Option>
              <Option value="进行中">进行中</Option>
              <Option value="已完成">已完成</Option>
              </Select>
          </Form.Item>
          <Form.Item name="progress" label="进度" rules={[{ required: true, type: 'number', min: 0, max: 100 }]}>
            <Input type="number" suffix="%" />
          </Form.Item>
        </Form>
      </Modal>
        
      <Modal
        title="创建审核计划模板"
        visible={isTemplateModalVisible}
        onOk={handleTemplateOk}
        onCancel={() => setIsTemplateModalVisible(false)}
        width={800}
      >
        <Form form={templateForm} layout="vertical">
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="审核类型"
            rules={[{ required: true, message: '请选择审核类型' }]}
          >
            <Select>
              <Option value="财务审核">财务审核</Option>
              <Option value="合规审核">合规审核</Option>
              <Option value="运营审核">运营审核</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="standard"
            label="审核标准"
            rules={[{ required: true, message: '请选择审核标准' }]}
          >
            <Select mode="multiple">
              <Option value="ISO 9001">ISO 9001</Option>
              <Option value="ISO 14001">ISO 14001</Option>
              <Option value="OHSAS 18001">OHSAS 18001</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="模板描述"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
        
      {detailRecord && (
        <Drawer
          title="审核计划详情"
          width={640}
          placement="right"
          onClose={() => setIsDetailDrawerVisible(false)}
          visible={isDetailDrawerVisible}
        >
          <Descriptions title={detailRecord.name} bordered column={2}>
            <Descriptions.Item label="审核类型">{detailRecord.type}</Descriptions.Item>
            <Descriptions.Item label="审核人员">{detailRecord.staff}</Descriptions.Item>
            <Descriptions.Item label="审核标准">
              {detailRecord.standard.join(', ')}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">{detailRecord.startDate}</Descriptions.Item>
            <Descriptions.Item label="结束日期">{detailRecord.endDate}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={detailRecord.status === '已完成' ? 'green' : detailRecord.status === '进行中' ? 'blue' : 'orange'}>{detailRecord.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="进度">
              <Progress percent={detailRecord.progress} size="small" />
            </Descriptions.Item>
          </Descriptions>
          <Divider />
          <h3>审核内容</h3>
          {/* 此处可以添加该审核计划的更多详细信息,如审核内容、审核结果、整改意见等 */}
        </Drawer>
      )}
    </Content>
  );
};

export default React.memo(AuditPlan);