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

// 审核计划路由
app.get('/api/audit-plans', (req, res) => {
  res.json(auditPlans);
});

app.get('/api/audit-plans/list', (req, res) => {
  try {
    const planList = auditPlans.map(plan => ({
      id: plan.id,
      name: plan.name
    }));
    res.json(planList);
  } catch (error) {
    console.error('Error fetching audit plan list:', error);
    res.status(500).json({ message: 'Error fetching audit plan list' });
  }
});

app.post('/api/audit-plans', (req, res) => {
  try {
    const newPlan = req.body;
    newPlan.id = auditPlans.length + 1; // 生成字符串类型的 ID
    auditPlans.push(newPlan);
    console.log('New audit plan:', newPlan);
    res.status(201).json({ message: 'Audit plan created successfully', plan: newPlan });
  } catch (error) {
    console.error('Error creating audit plan:', error);
    res.status(500).json({ message: 'Error creating audit plan' });
  }
});

app.put('/api/audit-plans/:id', (req, res) => {
  try {
    const id = req.params.id;
    const updatedPlan = req.body;
    console.log(`Attempting to update audit plan with ID: ${id}`);
    console.log('Update data:', updatedPlan);

    const existingPlan = findAuditPlanById(id);
    if (!existingPlan) {
      console.log(`Audit plan with ID ${id} not found`);
      return res.status(404).json({ message: 'Audit plan not found' });
    }

    const updated = updateAuditPlan(id, updatedPlan);
    if (updated) {
      console.log('Audit plan updated successfully:', updated);
      res.json({ message: 'Audit plan updated successfully', plan: updated });
    } else {
      console.log(`Failed to update audit plan with ID ${id}`);
      res.status(500).json({ message: 'Failed to update audit plan' });
    }
  } catch (error) {
    console.error('Error updating audit plan:', error);
    res.status(500).json({ message: 'Error updating audit plan' });
  }
});

app.delete('/api/audit-plans/:id', (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Attempting to delete audit plan with ID: ${id}`);

    const planToDelete = findAuditPlanById(id);
    if (!planToDelete) {
      console.log(`Audit plan with ID ${id} not found`);
      return res.status(404).json({ message: 'Audit plan not found' });
    }

    const index = auditPlans.indexOf(planToDelete);
    auditPlans.splice(index, 1);
    console.log(`Audit plan with ID ${id} deleted successfully`);
    res.json({ message: 'Audit plan deleted successfully' });
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
    console.log('New audit task:', newTask);
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
      console.log('Updated audit task:', auditTasks[index]);
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
  try {
    console.log('Fetching audit reports');
    res.json(auditReports);
  } catch (error) {
    console.error('Error fetching audit reports:', error);
    res.status(500).json({ message: 'Error fetching audit reports' });
  }
});

// 404 处理
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});