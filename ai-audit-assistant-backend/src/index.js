const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const aiRoutes = require('./routes/aiRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 增强的 CORS 配置
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 处理 OPTIONS 请求
app.options('*', cors());

// 中间件
app.use(express.json());
app.use('/api', aiRoutes); // 这行很重要,它将aiRoutes挂载到'/api'路径下

// 配置 multer 用于文件上传
const upload = multer({ dest: 'uploads/' });

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) console.log('Request body:', req.body);
  next();
});

// 模拟数据（考虑移到单独的模块）
let auditPlans = [
  { id: '1', name: 'Audit Plan 1', type: 'Type A', startDate: '2024-08-01', endDate: '2024-08-05', status: '计划中' },
  { id: '2', name: 'Audit Plan 2', type: 'Type B', startDate: '2024-08-10', endDate: '2024-08-15', status: '进行中' },
];

let auditTasks = [
  { id: 1, name: 'Audit Task 1', status: 'pending', auditPlanId: '1' },
  { id: 2, name: 'Audit Task 2', status: 'completed', auditPlanId: '2' },
];

let auditReports = [
  { id: '1', taskName: '审核任务1', auditDate: '2024-08-01', auditor: '审核员A', status: '已完成' },
  { id: '2', taskName: '审核任务2', auditDate: '2024-08-05', auditor: '审核员B', status: '进行中' }
];

// 新增：计划模板模拟数据
let planTemplates = [
  { id: 1, name: '年度财务审核', type: '财务', standard: ['GAAP', 'IFRS'] },
  { id: 2, name: '季度合规检查', type: '合规', standard: ['ISO 9001', 'ISO 14001'] }
];

// AI相关的模拟数据
const aiInsights = [
  { id: 1, title: '审核效率提升', summary: '本月审核效率提升了15%', details: '通过分析近期数据，我们发现审核效率有显著提升。主要原因包括新培训计划的实施和工作流程的优化。建议继续关注这些方面，以維持效率提升趋势。', confidence: 85 },
  { id: 2, title: '异常任务识别', summary: '检测到3个可能的异常任务', details: '基于历史模式，以下任务可能需要额外关注：1) Task #A457 - 完成时间异常长; 2) Task #B231 - 多次被退回修改; 3) Task #C789 - 资源分配不足。建议相关负责人进行深入审查。', confidence: 75 },
];

const aiRecommendations = [
  '建议优先处理项目A的审核任务，因为截止日期临近',
  '考虑为审核员X分配更多培训资源，其效率低于平均水平',
  '项目B的审核复杂度高于预期，建议增加人力配置',
];

const anomalies = [
  { id: 1, title: '审核时间异常', description: '任务#1234的审核时间远超平均值，可能需要进一步调查原因' },
  { id: 2, title: '高风险项目识别', description: '项目C显示出高风险特征，建议进行深入审查并可能需要额外的控制措施' },
];

// 辅助函数
function findAuditPlanById(id) {
  return auditPlans.find(plan => plan.id === id);
}

function updateAuditPlan(id, updatedPlan) {
  const index = auditPlans.findIndex(plan => plan.id === id);
  if (index !== -1) {
    auditPlans[index] = { ...auditPlans[index], ...updatedPlan };
    return auditPlans[index];
  }
  return null;
}

// 路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Audit Assistant Backend' });
});

// Dashboard 路由
app.get('/api/dashboard', (req, res) => {
  try {
    res.json({
      totalTasks: 16,
      pendingTasks: 3,
      completedTasksThisMonth: 8,
      taskStatusDistribution: [
        { name: '已完成', value: 8, color: '#52C41A' },
        { name: '进行中', value: 5, color: '#1890FF' },
        { name: '待处理', value: 3, color: '#FF4D4F' }
      ],
      completionTrend: [
        { date: '2024-07-01', completed: 5, predicted: 6 },
        { date: '2024-07-02', completed: 7, predicted: 7 },
        { date: '2024-07-03', completed: 6, predicted: 8 },
        { date: '2024-07-04', completed: 8, predicted: 7 },
        { date: '2024-07-05', completed: 9, predicted: 9 },
      ],
      auditTypeDistribution: [
        { name: '财务审核', value: 10 },
        { name: '合规审核', value: 8 },
        { name: '运营审核', value: 6 },
      ],
      avgAuditTime: 120,
      auditEfficiency: 85,
      newTasksThisMonth: 12,
      aiInsights: aiInsights.map(insight => ({ id: insight.id, title: insight.title, summary: insight.summary })),
      aiRecommendations: aiRecommendations,
      anomalies: anomalies,
    });
  } catch (error) {
    console.error('Error in /api/dashboard route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 审核计划路由
app.get('/api/audit-plans', (req, res) => {
  res.json(auditPlans);
});

app.post('/api/audit-plans', (req, res) => {
  try {
    const newPlan = req.body;
    newPlan.id = String(auditPlans.length + 1);
    auditPlans.push(newPlan);
    console.log('New audit plan:', newPlan);
    res.status(201).json({ message: 'Audit plan created successfully', plan: newPlan });
  } catch (error) {
    console.error('Error creating audit plan:', error);
    res.status(500).json({ message: 'Error creating audit plan' });
  }
});

app.get('/api/audit-plans/:id', (req, res) => {
  const id = req.params.id;
  const plan = findAuditPlanById(id);
  if (plan) {
    res.json(plan);
  } else {
    res.status(404).json({ message: 'Audit plan not found' });
  }
});

app.put('/api/audit-plans/:id', (req, res) => {
  try {
    const id = req.params.id;
    const updatedPlan = req.body;
    const updated = updateAuditPlan(id, updatedPlan);
    if (updated) {
      res.json({ message: 'Audit plan updated successfully', plan: updated });
    } else {
      res.status(404).json({ message: 'Audit plan not found' });
    }
  } catch (error) {
    console.error('Error updating audit plan:', error);
    res.status(500).json({ message: 'Error updating audit plan' });
  }
});

app.delete('/api/audit-plans/:id', (req, res) => {
  try {
    const id = req.params.id;
    const index = auditPlans.findIndex(plan => plan.id === id);
    if (index !== -1) {
      auditPlans.splice(index, 1);
      res.json({ message: 'Audit plan deleted successfully' });
    } else {
      res.status(404).json({ message: 'Audit plan not found' });
    }
  } catch (error) {
    console.error('Error deleting audit plan:', error);
    res.status(500).json({ message: 'Error deleting audit plan' });
  }
});

// 审核任务路由
app.get('/api/audit-tasks', (req, res) => {
  const { status } = req.query;
  let filteredTasks = auditTasks;
  if (status === 'pending') {
    filteredTasks = auditTasks.filter(task => task.status === 'pending');
  } else if (status === 'completed') {
    filteredTasks = auditTasks.filter(task => task.status === 'completed');
  }
  res.json(filteredTasks);
});

app.post('/api/audit-tasks', (req, res) => {
  try {
    const newTask = req.body;
    newTask.id = auditTasks.length + 1;
    auditTasks.push(newTask);
    res.status(201).json({ message: 'Audit task created successfully', task: newTask });
  } catch (error) {
    console.error('Error creating audit task:', error);
    res.status(500).json({ message: 'Error creating audit task' });
  }
});

app.put('/api/audit-tasks/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedTask = req.body;
    const index = auditTasks.findIndex(task => task.id === id);
    if (index !== -1) {
      auditTasks[index] = { ...auditTasks[index], ...updatedTask };
      res.json({ message: 'Audit task updated successfully', task: auditTasks[index] });
    } else {
      res.status(404).json({ message: 'Audit task not found' });
    }
  } catch (error) {
    console.error('Error updating audit task:', error);
    res.status(500).json({ message: 'Error updating audit task' });
  }
});

// 审核报告路由
app.get('/api/audit-reports', (req, res) => {
  res.json(auditReports);
});

// 新增：计划模板路由
app.get('/api/plan-templates', (req, res) => {
  try {
    res.json(planTemplates);
  } catch (error) {
    console.error('Error fetching plan templates:', error);
    res.status(500).json({ message: 'Error fetching plan templates' });
  }
});

app.post('/api/plan-templates', (req, res) => {
  try {
    const newTemplate = {
      id: planTemplates.length + 1,
      ...req.body
    };
    planTemplates.push(newTemplate);
    res.status(201).json({ message: 'Plan template created successfully', template: newTemplate });
  } catch (error) {
    console.error('Error creating plan template:', error);
    res.status(500).json({ message: 'Error creating plan template' });
  }
});

// 新增：处理模板文件上传
app.post('/api/upload-template', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const file = req.file;
  let templateData = {};

  try {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // 处理 Excel 文件
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      templateData = XLSX.utils.sheet_to_json(worksheet)[0];
    } else if (file.mimetype === 'text/csv') {
      // 处理 CSV 文件
      const results = [];
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          templateData = results[0];
        });
    } else if (file.mimetype === 'application/json') {
      // 处理 JSON 文件
      const fileContent = fs.readFileSync(file.path, 'utf8');
      templateData = JSON.parse(fileContent);
    } else {
      return res.status(400).send('Unsupported file type.');
    }

    // 清理临时文件
    fs.unlinkSync(file.path);

    // 返回解析后的模板数据
    res.json(templateData);
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    res.status(500).json({ message: 'Error processing uploaded file', error: error.message });
  }
});

// AI相关路由
app.post('/api/ai/prioritize-tasks', (req, res) => {
  try {
    const tasks = req.body.tasks;
    const prioritizedTasks = tasks.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return 0;
    }).map((task, index) => ({
      ...task,
      priority: index + 1
    }));
    res.json(prioritizedTasks);
  } catch (error) {
    console.error('Error in prioritize-tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ai/analyze-document', (req, res) => {
  try {
    res.json({
      suggestedName: 'Analyzed Document',
      suggestedType: '内部审核',
      keyFindings: ['重要发现1', '重要发现2'],
      riskLevel: 'medium'
    });
  } catch (error) {
    console.error('Error in analyze-document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ai/audit-guidance', (req, res) => {
  try {
    const task = req.body.task;
    res.json({
      guidance: `针对 ${task.name} 的审核指导：\n1. 重点关注X方面\n2. 注意Y的合规性\n3. 检查Z的完整性`,
      suggestedSteps: ['步骤1', '步骤2', '步骤3'],
      relevantRegulations: ['法规A', '法规B']
    });
  } catch (error) {
    console.error('Error in audit-guidance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ai/detect-anomalies', (req, res) => {
  try {
    const tasks = req.body.tasks;
    const anomalies = tasks.reduce((acc, task) => {
      if (task.status === 'pending' && new Date(task.endDate) < new Date()) {
        acc[task.id] = 'Task overdue';
      }
      return acc;
    }, {});
    res.json(anomalies);
  } catch (error) {
    console.error('Error in detect-anomalies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 处理
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;