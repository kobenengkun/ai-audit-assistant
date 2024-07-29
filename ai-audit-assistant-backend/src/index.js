const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Audit Assistant Backend' });
});

app.get('/api/dashboard', (req, res) => {
  try {
    // 这里你可以返回一些模拟的仪表板数据
    // 在实际应用中，这些数据通常来自数据库
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