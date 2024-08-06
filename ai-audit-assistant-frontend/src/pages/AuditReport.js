import React, { useState, useEffect } from 'react';
import { Layout, Table, Input, Button, Space, Tag, Modal, Typography, Descriptions, Row, Col, Card, Spin, message } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { auditReports, aiService } from '../services/api';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const AuditReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [riskLevels, setRiskLevels] = useState({});

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      reports.forEach(report => detectAnomalies(report.id));
    }
  }, [reports]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await auditReports.fetchAll();
      setReports(data);
    } catch (error) {
      message.error('Failed to fetch audit reports');
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async (reportId) => {
    try {
      const summary = await aiService.generateReportSummary(reportId);
      setAiSummary(summary);
    } catch (error) {
      message.error('Failed to generate AI summary');
    }
  };

  const handleQuestionSubmit = async () => {
    try {
      const response = await aiService.askQuestion(selectedReport.id, question);
      setAnswer(response.answer);
    } catch (error) {
      message.error('Failed to get AI response');
    }
  };

  const detectAnomalies = async (reportId) => {
    try {
      const result = await aiService.detectAnomalies(reportId);
      setRiskLevels(prevLevels => ({...prevLevels, [reportId]: result.riskLevel}));
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
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
      sorter: (a, b) => a.taskName.localeCompare(b.taskName),
    },
    {
      title: '审核日期',
      dataIndex: 'auditDate',
      key: 'auditDate',
      sorter: (a, b) => new Date(a.auditDate) - new Date(b.auditDate),
    },
    {
      title: '审核人',
      dataIndex: 'auditor',
      key: 'auditor',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '已完成' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'id',
      key: 'riskLevel',
      render: (id) => (
        <Tag color={riskLevels[id] === 'high' ? 'red' : riskLevels[id] === 'medium' ? 'orange' : 'green'}>
          {riskLevels[id] || 'Analyzing'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => showReportDetails(record)}>
            查看
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => downloadReport(record.id)}>
            下载
          </Button>
        </Space>
      ),
    },
  ];

  const showReportDetails = (report) => {
    setSelectedReport(report);
    setIsModalVisible(true);
    setAiSummary('');
    setAnswer('');
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const downloadReport = (reportId) => {
    message.info(`Downloading report ${reportId}`);
  };

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2}>审核报告</Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="搜索报告"
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
              />
              <Button type="primary" onClick={fetchReports}>
                刷新
              </Button>
              <Button icon={<BarChartOutlined />} onClick={() => message.info('Trend analysis feature coming soon')}>
                趋势分析
              </Button>
            </Space>
            <Table
              columns={columns}
              dataSource={reports}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="审核报告详情"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedReport && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="报告ID">{selectedReport.id}</Descriptions.Item>
              <Descriptions.Item label="审核任务">{selectedReport.taskName}</Descriptions.Item>
              <Descriptions.Item label="审核日期">{selectedReport.auditDate}</Descriptions.Item>
              <Descriptions.Item label="审核人">{selectedReport.auditor}</Descriptions.Item>
              <Descriptions.Item label="状态">{selectedReport.status}</Descriptions.Item>
              <Descriptions.Item label="发现问题数">{selectedReport.issuesFound}</Descriptions.Item>
              <Descriptions.Item label="审核结果" span={2}>
                <Paragraph>{selectedReport.summary}</Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="主要发现" span={2}>
                <ul>
                  {selectedReport.findings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </Descriptions.Item>
              <Descriptions.Item label="建议" span={2}>
                <ul>
                  {selectedReport.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </Descriptions.Item>
              <Descriptions.Item label="AI摘要" span={2}>
                {aiSummary ? (
                  <Paragraph>{aiSummary}</Paragraph>
                ) : (
                  <Button onClick={() => generateAISummary(selectedReport.id)}>
                    生成AI摘要
                  </Button>
                )}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <Input.Search
                placeholder="询问关于报告的问题"
                enterButton="提问"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onSearch={handleQuestionSubmit}
              />
              {answer && (
                <Paragraph style={{ marginTop: 8 }}>
                  <strong>AI回答：</strong> {answer}
                </Paragraph>
              )}
            </div>
          </>
        )}
      </Modal>
    </Content>
  );
};

export default AuditReport;