import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Table, Button, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { auditTasks } from '../services/api';
import { handleError } from '../utils/errorHandler';

const { Content } = Layout;

const AuditExecution = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await auditTasks.fetchAll();
      setData(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditTasks();
  }, [fetchAuditTasks]);

  const handleDelete = useCallback(async (id) => {
    try {
      await auditTasks.delete(id);
      message.success('删除审核任务成功');
      fetchAuditTasks();
    } catch (error) {
      handleError(error);
    }
  }, [fetchAuditTasks]);

  const columns = [
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    { title: '任务类型', dataIndex: 'type', key: 'type' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />}>编辑</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: '20px' }}>
      <h1>审核执行</h1>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
        创建新审核任务
      </Button>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
    </Content>
  );
};

export default AuditExecution;
