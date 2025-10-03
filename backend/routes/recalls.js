const express = require('express');
const RecallEngine = require('../services/recallEngine');

const router = express.Router();

const handleError = (res, error, status = 500) => {
  console.error('[RECALL ROUTE ERROR]', error);
  res.status(status).json({ message: error.message || 'An unexpected error occurred' });
};

// GET all current recall alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await RecallEngine.checkDueReviews();
    res.json(alerts);
  } catch (error) {
    handleError(res, error);
  }
});

// GET recalls by priority level
router.get('/priority/:level', async (req, res) => {
  try {
    const alerts = await RecallEngine.checkDueReviews();
    const filtered = alerts.filter(alert => alert.priority === req.params.level);
    res.json(filtered);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
