const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate-report-summary', aiController.generateReportSummary);
router.post('/ask-question', aiController.askQuestion);
router.post('/detect-anomalies', aiController.detectAnomalies);

module.exports = router;