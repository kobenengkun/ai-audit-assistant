const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const planTemplateController = require('../controllers/planTemplateController');

router.post('/generate-report-summary', aiController.generateReportSummary);
router.post('/ask-question', aiController.askQuestion);
router.post('/detect-anomalies', aiController.detectAnomalies);

// Added this line to handle GET /plan-templates route
router.get('/plan-templates', planTemplateController.getAllTemplates);

module.exports = router;