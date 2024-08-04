import React, { useState, useEffect } from 'react';
import { Layout, Table, Input, Button, Space, Tag, Modal, Typography, Row, Col, Card, Select, Form, message } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons';
import { auditImprovements } from '../services/api'; // 假设您有一个 API 服务

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const AuditImprovement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await auditImprovements.fetchSuppliers();
      setSuppliers(data);
    } catch (error) {
      message.error('获取供应商列表失败');
    } finally {
      setLoading(false);
    }
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
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => showSupplierDetails(record)}>
            查看
          </Button>
          <Button icon={<CheckOutlined />} onClick={() => markAsCompleted(record.id)} disabled={record.status !== '待审核'}>
            标记完成
          </Button>
        </Space>
      ),
    },
  ];

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
    try {
      await auditImprovements.markAsCompleted(supplierId);
      message.success('供应商审核已标记为完成');
      fetchSuppliers(); // 刷新列表
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const onFinish = async (values) => {
    try {
      await auditImprovements.updateSupplier(selectedSupplier.id, values);
      message.success('供应商信息已更新');
      handleModalClose();
      fetchSuppliers(); // 刷新列表
    } catch (error) {
      message.error('更新失败，请重试');
    }
  };

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2}>审核改进</Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="搜索供应商"
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
              />
              <Select defaultValue="all" style={{ width: 120 }}>
                <Option value="all">所有状态</Option>
                <Option value="pending">待审核</Option>
                <Option value="completed">已完成</Option>
              </Select>
              <Button type="primary" onClick={fetchSuppliers}>
                刷新
              </Button>
            </Space>
            <Table
              columns={columns}
              dataSource={suppliers}
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
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="供应商名称">
            <Input disabled />
          </Form.Item>
          <Form.Item name="status" label="审核状态">
            <Select>
              <Option value="待审核">待审核</Option>
              <Option value="已完成">已完成</Option>
            </Select>
          </Form.Item>
          <Form.Item name="lastAuditDate" label="上次审核日期">
            <Input disabled />
          </Form.Item>
          <Form.Item name="improvementCount" label="待改进项数量">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="comments" label="审核评论">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              更新信息
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default AuditImprovement;