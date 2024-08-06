import React, { useEffect, useState, useCallback } from 'react';
import { 
  Layout, Table, Button, Space, message, Modal, Form, 
  Input, DatePicker, Select, Spin, Upload, Drawer, Tag,
  Row, Col, Card, Statistic, Tooltip, Progress, Tabs
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UploadOutlined, BulbOutlined, WarningOutlined,
  SortAscendingOutlined, SearchOutlined, DownloadOutlined
} from '@ant-design/icons';
import { auditTasks, auditPlans, aiService } from '../services/api';
import { handleError } from '../utils/errorHandler';
import dayjs from 'dayjs';

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const AuditExecution = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [auditPlanOptions, setAuditPlanOptions] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [guidanceVisible, setGuidanceVisible] = useState(false);
  const [currentGuidance, setCurrentGuidance] = useState('');
  const [anomalies, setAnomalies] = useState({});
  const [sortedData, setSortedData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    planned: 0
  });

  const fetchAuditTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await auditTasks.fetchAll();
      const tasks = Array.isArray(response) ? response : [];
      const tasksWithPlanInfo = await Promise.all(
        tasks.map(async (task) => {
          if (task.auditPlanId) {
            try {
              const planResponse = await auditPlans.fetchById(task.auditPlanId);
              return {
                ...task,
                planName: planResponse.name,
              };
            } catch (error) {
              console.error(`Error fetching plan for task ${task.id}:`, error);
              return { 
                ...task, 
                planName: error.response?.status === 404 ? 'Plan Not Found' : 'Error Loading Plan' 
              };
            }
          }
          return { ...task, planName: 'No Plan Associated' };
        })
      );
      setData(tasksWithPlanInfo);
      setFilteredData(tasksWithPlanInfo);
      updateStatistics(tasksWithPlanInfo);
    } catch (error) {
      console.error('Error fetching audit tasks:', error);
      handleError(error);
      message.error('加载审核任务失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatistics = useCallback((tasks) => {
    const stats = tasks.reduce((acc, task) => {
      acc.total++;
      if (task.status === '进行中') acc.inProgress++;
      else if (task.status === '已完成') acc.completed++;
      else if (task.status === '计划中') acc.planned++;
      return acc;
    }, { total: 0, inProgress: 0, completed: 0, planned: 0 });
    setStatistics(stats);
  }, []);

  const fetchAuditPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const response = await auditPlans.fetchAll();
      const plans = Array.isArray(response) ? response : [];
      setAuditPlanOptions(plans.map(plan => ({ value: plan.id, label: plan.name })));
    } catch (error) {
      console.error('Failed to fetch audit plans:', error);
      message.error('加载审核计划失败，请稍后重试');
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditTasks();
    fetchAuditPlans();
  }, [fetchAuditTasks, fetchAuditPlans]);

  const showModal = useCallback((record = null) => {
    setEditingRecord(record);
    fetchAuditPlans();
    if (record) {
      form.setFieldsValue({
        ...record,
        auditPlanId: record.auditPlanId,
        dateRange: record.startDate && record.endDate ? [dayjs(record.startDate), dayjs(record.endDate)] : undefined,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  }, [form, fetchAuditPlans]);

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const taskData = {
        name: values.name,
        auditPlanId: values.auditPlanId,
        type: values.type,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        status: values.status
      };

      if (editingRecord) {
        await auditTasks.update(editingRecord.id, taskData);
        message.success('更新审核任务成功');
      } else {
        await auditTasks.create(taskData);
        message.success('创建审核任务成功');
      }

      setIsModalVisible(false);
      fetchAuditTasks();
    } catch (error) {
      console.error('Error in handleOk:', error);
      handleError(error);
      message.error('操作失败，请检查输入并稍后重试');
    }
  }, [form, editingRecord, fetchAuditTasks]);

  const handleDelete = useCallback(async (id) => {
    try {
      await auditTasks.delete(id);
      message.success('删除审核任务成功');
      fetchAuditTasks();
    } catch (error) {
      console.error('Error deleting audit task:', error);
      handleError(error);
      message.error('删除审核任务失败，请稍后重试');
    }
  }, [fetchAuditTasks]);

  const handleAIPrioritize = async () => {
    try {
      setLoading(true);
      const prioritizedTasks = await aiService.prioritizeTasks(data);
      setSortedData(prioritizedTasks);
      message.success('任务已按AI建议优先级排序');
    } catch (error) {
      console.error('Error prioritizing tasks:', error);
      handleError(error);
      message.error('AI排序失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (info) => {
    const { status } = info.file;
    if (status === 'done') {
      setFileList([info.file]);
      setAnalyzing(true);
      try {
        const analysis = await aiService.analyzeDocument(info.file);
        form.setFieldsValue({
          name: analysis.suggestedName,
          type: analysis.suggestedType,
          // ... 其他字段
        });
        message.success(`文件 ${info.file.name} 分析成功`);
      } catch (error) {
        console.error('Error analyzing document:', error);
        handleError(error);
        message.error('文件分析失败，请稍后重试');
      } finally {
        setAnalyzing(false);
      }
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  };

  const showGuidance = async (record) => {
    setGuidanceVisible(true);
    try {
      const guidance = await aiService.getAuditGuidance(record);
      setCurrentGuidance(guidance);
    } catch (error) {
      console.error('Error fetching guidance:', error);
      handleError(error);
      message.error('获取AI指导失败，请稍后重试');
    }
  };

  const detectAnomalies = async () => {
    try {
      const detectedAnomalies = await aiService.detectAnomalies(data);
      setAnomalies(detectedAnomalies);
      message.info('异常检测完成');
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      handleError(error);
      message.error('异常检测失败，请稍后重试');
    }
  };

  const handleSearch = useCallback((value) => {
    setSearchText(value);
    const filtered = data.filter(item => 
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      item.id.toString().includes(value)
    );
    setFilteredData(filtered);
  }, [data]);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'P1': return 'red';
      case 'P2': return 'orange';
      case 'P3': return 'yellow';
      default: return 'green';
    }
  };

  const columns = [
    { 
      title: '优先级', 
      dataIndex: 'priority', 
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority || 'P4'}
        </Tag>
      )
    },
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    { title: '关联审核计划', dataIndex: 'planName', key: 'planName' },
    { title: '任务类型', dataIndex: 'type', key: 'type' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space>
          <Tag color={status === '进行中' ? 'blue' : status === '已完成' ? 'green' : 'orange'}>
            {status}
          </Tag>
          {anomalies[record.id] && (
            <Tooltip title="检测到异常">
              <Tag color="red" icon={<WarningOutlined />}>
                异常
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      render: (_, record) => (
        <Tooltip title={`${record.progress || 0}%`}>
          <Progress percent={record.progress || 0} size="small" />
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger>删除</Button>
          <Tooltip title="查看AI指导">
            <Button icon={<BulbOutlined />} onClick={() => showGuidance(record)}>AI指导</Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: '20px' }}>
      <h1>审核执行</h1>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总任务数" value={statistics.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="进行中任务" value={statistics.inProgress} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成任务" value={statistics.completed} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="计划中任务" value={statistics.planned} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          创建新审核任务
        </Button>
        <Button icon={<SortAscendingOutlined />} onClick={handleAIPrioritize}>
          AI优先级排序
        </Button>
        <Button icon={<WarningOutlined />} onClick={detectAnomalies}>
          检测异常
        </Button>
        <Button icon={<DownloadOutlined />} onClick={() => message.info('导出功能即将上线')}>
          导出任务列表
        </Button>
        <Input
          placeholder="搜索任务"
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Space>

      <Tabs defaultActiveKey="all">
        <TabPane tab="所有任务" key="all">
          <Table 
            columns={columns} 
            dataSource={filteredData} 
            rowKey="id" 
            loading={loading}
          />
        </TabPane>
        <TabPane tab="进行中" key="inProgress">
          <Table 
            columns={columns} 
            dataSource={filteredData.filter(task => task.status === '进行中')} 
            rowKey="id" 
          />
        </TabPane>
        <TabPane tab="已完成" key="completed">
          <Table 
            columns={columns} 
            dataSource={filteredData.filter(task => task.status === '已完成')} 
            rowKey="id" 
          />
        </TabPane>
        </Tabs>

<Modal
  title={editingRecord ? "编辑审核任务" : "创建新审核任务"}
  open={isModalVisible}
  onOk={handleOk}
  onCancel={() => setIsModalVisible(false)}
  confirmLoading={loading || analyzing}
>
  <Form form={form} layout="vertical">
    <Form.Item name="document" label="上传审核文档">
      <Upload
        accept=".pdf,.doc,.docx"
        beforeUpload={() => false}
        onChange={handleFileUpload}
        fileList={fileList}
      >
        <Button icon={<UploadOutlined />}>选择文件</Button>
      </Upload>
    </Form.Item>
    <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
      <Input />
    </Form.Item>
    <Form.Item name="auditPlanId" label="关联审核计划" rules={[{ required: true, message: '请选择关联审核计划' }]}>
      <Select 
        options={auditPlanOptions} 
        loading={loadingPlans}
        notFoundContent={loadingPlans ? <Spin size="small" /> : '暂无数据'}
      />
    </Form.Item>
    <Form.Item name="type" label="任务类型" rules={[{ required: true, message: '请选择任务类型' }]}>
      <Select>
        <Select.Option value="内部审核">内部审核</Select.Option>
        <Select.Option value="外部审核">外部审核</Select.Option>
        <Select.Option value="供应商审核">供应商审核</Select.Option>
      </Select>
    </Form.Item>
    <Form.Item 
      name="dateRange" 
      label="任务日期范围" 
      rules={[{ required: true, message: '请选择日期范围' }]}
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
  </Form>
</Modal>

<Drawer
  title="AI审核指导"
  placement="right"
  onClose={() => setGuidanceVisible(false)}
  open={guidanceVisible}
  width={400}
>
  <p>{currentGuidance}</p>
</Drawer>
</Content>
);
};

export default AuditExecution;
      