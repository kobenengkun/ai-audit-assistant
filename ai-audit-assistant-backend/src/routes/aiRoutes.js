const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/detect-anomalies', aiController.detectAnomalies);

module.exports = router;