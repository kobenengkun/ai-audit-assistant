const reportAnalyzer = require('../ai/reportAnalyzer');

exports.generateReportSummary = async (req, res) => {
  try {
    const { reportId } = req.body;
    const summary = await reportAnalyzer.generateSummary(reportId);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

exports.askQuestion = async (req, res) => {
  try {
    const { reportId, question } = req.body;
    const answer = await reportAnalyzer.answerQuestion(reportId, question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to answer question' });
  }
};

exports.detectAnomalies = async (req, res) => {
  try {
    const { reportId } = req.body;
    const riskLevel = await reportAnalyzer.detectAnomalies(reportId);
    res.json({ riskLevel });
  } catch (error) {
    res.status(500).json({ error: 'Failed to detect anomalies' });
  }
};