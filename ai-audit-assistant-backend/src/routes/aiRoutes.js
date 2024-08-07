const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const planTemplateController = require('../controllers/planTemplateController');

// AI相关路由
router.post('/api/generate-report-summary', aiController.generateReportSummary);
router.post('/api/ask-question', aiController.askQuestion);
router.post('/api/detect-anomalies', aiController.detectAnomalies);

// 审核计划模板相关路由
router.get('/api/plan-templates', planTemplateController.getAllTemplates);
router.post('/api/plan-templates', planTemplateController.createTemplate);

module.exports = router;