import React, { useState, useCallback, useMemo } from 'react';
import { Layout, Table, Button, Modal, Form, Input, DatePicker, Select, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { auditPlans } from '../services/api';
import { handleError } from '../utils/errorHandler';
import { format, parseISO } from 'date-fns';

const { Content } = Layout;
const { RangePicker } = DatePicker;

const AuditPlan = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchAuditPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await auditPlans.fetchAll();
      setData(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAuditPlans();
  }, [fetchAuditPlans]);

  const showModal = useCallback((record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        dateRange: [parseISO(record.startDate), parseISO(record.endDate)],
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
        startDate: format(values.dateRange[0], 'yyyy-MM-dd'),
        endDate: format(values.dateRange[1], 'yyyy-MM-dd'),
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
      handleError(error);
    }
  }, [form, editingRecord, fetchAuditPlans]);

  const handleDelete = useCallback(async (id) => {
    try {
      await auditPlans.delete(id);
      message.success('删除审核计划成功');
      fetchAuditPlans();
    } catch (error) {
      handleError(error);
    }
  }, [fetchAuditPlans]);

  const columns = useMemo(() => [
    { title: '审核计划名称', dataIndex: 'name', key: 'name' },
    { title: '审核类型', dataIndex: 'type', key: 'type' },
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
  ], [showModal, handleDelete]);

  return (
    <Content style={{ padding: '20px' }}>
      <h1>审核计划</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        创建新审核计划
      </Button>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal
        title={editingRecord ? "编辑审核计划" : "创建新审核计划"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="审核计划名称" rules={[{ required: true, message: '请输入审核计划名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="审核类型" rules={[{ required: true, message: '请选择审核类型' }]}>
            <Select>
              <Select.Option value="财务审核">财务审核</Select.Option>
              <Select.Option value="运营审核">运营审核</Select.Option>
              <Select.Option value="合规审核">合规审核</Select.Option>
              <Select.Option value="IT审核">IT审核</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="dateRange" 
            label="计划日期范围" 
            rules={[
              { required: true, message: '请选择日期范围' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || (value[0].isBefore(new Date()) && value[1].isAfter(new Date()))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('开始日期必须在今天之前，结束日期必须在今天之后'));
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