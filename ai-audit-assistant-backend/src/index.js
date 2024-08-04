const express = require('express');
const cors = require('cors');
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

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('Request body:', req.body);
  next();
});

// 模拟数据（考虑移到单独的模块）
let auditPlans = [
  { id: 1, name: 'Audit Plan 1', type: 'Type A', startDate: '2024-08-01', endDate: '2024-08-05', status: '计划中' },
  { id: 2, name: 'Audit Plan 2', type: 'Type B', startDate: '2024-08-10', endDate: '2024-08-15', status: '进行中' },
];

let auditTasks = [
  { id: 1, name: 'Audit Task 1', status: 'pending' },
  { id: 2, name: 'Audit Task 2', status: 'completed' },
];

// 路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Audit Assistant Backend' });
});

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
      recentActivities: [
        '用户A完成了任务1',
        '用户B开始了任务2',
        '用户C更新了任务3的状态'
      ]
    });
  } catch (error) {
    console.error('Error in /api/dashboard route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/audit-plans', (req, res) => {
  res.json(auditPlans);
});

app.post('/api/audit-plans', (req, res) => {
  try {
    const newPlan = req.body;
    // 这里应该添加将新计划保存到数据库的逻辑
    console.log('New audit plan:', newPlan);
    res.status(201).json({ message: 'Audit plan created successfully', plan: newPlan });
  } catch (error) {
    console.error('Error creating audit plan:', error);
    res.status(500).json({ message: 'Error creating audit plan' });
  }
});

app.get('/api/audit-tasks', (req, res) => {
  const { status } = req.query;
  if (status === 'pending') {
    const pendingTasks = auditTasks.filter(task => task.status === 'pending');
    res.json(pendingTasks);
  } else if (status === 'completed') {
    const completedTasks = auditTasks.filter(task => task.status === 'completed');
    res.json(completedTasks);
  } else {
    res.json(auditTasks);
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});