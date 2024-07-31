const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// 增强的 CORS 配置
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 处理 OPTIONS 请求
app.options('*', cors());

// 添加详细的请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 模拟审核计划数据
let auditPlans = [
  { id: 1, name: 'Audit Plan 1', type: 'Type A', startDate: '2024-08-01', endDate: '2024-08-05', status: '计划中' },
  { id: 2, name: 'Audit Plan 2', type: 'Type B', startDate: '2024-08-10', endDate: '2024-08-15', status: '进行中' },
];

// 模拟审核任务数据
let auditTasks = [
  { id: 1, name: 'Audit Task 1', status: 'pending' },
  { id: 2, name: 'Audit Task 2', status: 'completed' },
];

// Dashboard API 路由
app.get('/api/dashboard', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Credentials', 'true');
  try {
    const dashboardData = {
      totalTasks: 16,
      pendingTasks: 3,
      completedTasksThisMonth: 8,
      taskStatusDistribution: [
        { name: "已完成", value: 8, color: "#52C41A" },
        { name: "进行中", value: 5, color: "#1890FF" },
        { name: "待处理", value: 3, color: "#FF4D4F" }
      ],
      recentActivities: [
        "用户A完成了任务1",
        "用户B开始了任务2",
        "用户C更新了任务3的状态"
      ]
    };
    res.json(dashboardData);
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 审核计划 API 路由
app.get('/api/audit-plans', (req, res) => {
  res.json(auditPlans);
});

// 审核任务 API 路由
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

// 通用的错误处理中间件
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// 处理 404 的中间件
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: "Sorry, that route doesn't exist." });
});

// 启动服务器监听
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});