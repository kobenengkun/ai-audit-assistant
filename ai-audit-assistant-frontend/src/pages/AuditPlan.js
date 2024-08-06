import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Layout, Table, Button, Modal, Form, Input, DatePicker, Select, Space, message, Tooltip, Tag, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RobotOutlined, AlertOutlined } from '@ant-design/icons';
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

  const fetchAuditPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditPlans.fetchAll();
      setData(response);
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
        setData(data.map(plan => plan.id === editingRecord.id ? { ...editingRecord, ...auditPlanData } : plan));
      } else {
        const newPlan = await auditPlans.create(auditPlanData);
        message.success('创建审核计划成功');
        setData([...data, newPlan]);
      }

      setIsModalVisible(false);
      fetchAuditPlans();
    } catch (error) {
      message.error('操作失败，请重试');
      handleError(error);
    }
  }, [form, editingRecord, data, fetchAuditPlans]);

  const handleDelete = useCallback(async (id) => {
    try {
      await auditPlans.delete(id);
      message.success('删除审核计划成功');
      setData(data.filter(plan => plan.id !== id));
    } catch (error) {
      message.error('删除审核计划失败');
      handleError(error);
    }
  }, [data]);

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
      message.success('AI建议应用成功');
      setAiSuggestions(null);
    } catch (error) {
      setError('应用AI建议失败');
      handleError(error);
    }
  }, []);

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
      render: (status, record) => (
        <Space>
          <Tag color={status === '已完成' ? 'green' : status === '进行中' ? 'blue' : 'orange'}>{status}</Tag>
          {record.riskLevel && (
            <Tooltip title={`风险等级: ${record.riskLevel}`}>
              <AlertOutlined style={{ color: record.riskLevel === 'high' ? 'red' : record.riskLevel === 'medium' ? 'orange' : 'green' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
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
  ], [showModal, handleDelete]);

  return (
    <Content style={{ padding: '20px' }}>
      <h1>审核计划</h1>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          创建新审核计划
        </Button>
        <Button icon={<RobotOutlined />} onClick={getAiSuggestions}>
          获取AI建议
        </Button>
      </Space>
      {aiSuggestions && (
        <Alert
          message="AI建议"
          description={
            <>
              <p>{aiSuggestions}</p>
              <Button type="primary" icon={<RobotOutlined />} onClick={applyAiSuggestions}>
                应用AI建议
              </Button>
            </>
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
      />

      <Modal
        title={editingRecord ? "编辑审核计划" : "创建新审核计划"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
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
              {/* 从后端获取的审核人员选项数据 */}
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
        </Form>
      </Modal>
    </Content>
  );
};

export default React.memo(AuditPlan);