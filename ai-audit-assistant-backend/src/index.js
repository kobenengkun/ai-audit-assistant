const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('Request body:', req.body);
  next();
});

// Routes
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
  try {
    const auditPlans = [
      { id: 1, name: 'Audit Plan 1', status: 'In Progress', startDate: '2024-08-01', endDate: '2024-08-05' },
      { id: 2, name: 'Audit Plan 2', status: 'Completed', startDate: '2024-08-10', endDate: '2024-08-15' },
      { id: 3, name: 'Audit Plan 3', status: 'Pending', startDate: '2024-08-20', endDate: '2024-08-25' }
    ];
    res.json(auditPlans);
  } catch (error) {
    console.error('Error in /api/audit-plans route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// New POST route for creating audit plans
app.post('/api/audit-plans', (req, res) => {
  try {
    const newPlan = req.body;
    // 这里应该添加将新计划保存到数据库的逻辑
    // 现在我们只是将其打印出来并返回成功消息
    console.log('New audit plan:', newPlan);
    res.status(201).json({ message: 'Audit plan created successfully', plan: newPlan });
  } catch (error) {
    console.error('Error creating audit plan:', error);
    res.status(500).json({ message: 'Error creating audit plan' });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});