import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Table, Button, Space, message, Modal, Form, Input, DatePicker, Select, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { auditTasks, auditPlans } from '../services/api';
import { handleError } from '../utils/errorHandler';
import dayjs from 'dayjs';

const { Content } = Layout;
const { RangePicker } = DatePicker;

const AuditExecution = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [auditPlanOptions, setAuditPlanOptions] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const fetchAuditTasks = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching audit tasks...');
      const response = await auditTasks.fetchAll();
      console.log('Fetched audit tasks:', response);
      const tasks = Array.isArray(response) ? response : [];
      const tasksWithPlanInfo = await Promise.all(
        tasks.map(async (task) => {
          if (task.auditPlanId) {
            try {
              const planResponse = await auditPlans.fetchById(task.auditPlanId);
              console.log(`Fetched plan for task ${task.id}:`, planResponse);
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
    } catch (error) {
      console.error('Error fetching audit tasks:', error);
      handleError(error);
      message.error('加载审核任务失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      console.log('Fetching audit plans...');
      const response = await auditPlans.fetchAll();
      console.log('Fetched audit plans:', response);
      const plans = Array.isArray(response) ? response : [];
      console.log('Processed plans:', plans);
      setAuditPlanOptions(plans.map(plan => ({ value: plan.id, label: plan.name })));
      console.log('Set audit plan options:', plans.map(plan => ({ value: plan.id, label: plan.name })));
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
    fetchAuditPlans();  // 每次打开模态框时重新获取审核计划
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

      console.log('Submitting task data:', taskData);

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

  const columns = [
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    { title: '关联审核计划', dataIndex: 'planName', key: 'planName' },
    { title: '任务类型', dataIndex: 'type', key: 'type' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: '20px' }}>
      <h1>审核执行</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        创建新审核任务
      </Button>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        loading={loading}
        locale={{
          emptyText: loading ? <Spin /> : '暂无数据'
        }}
      />

      <Modal
        title={editingRecord ? "编辑审核任务" : "创建新审核任务"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
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
    </Content>
  );
};

export default AuditExecution;