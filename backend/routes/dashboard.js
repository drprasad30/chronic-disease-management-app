const express = require('express');
const Patient = require('../models/Patient');
const DiseaseKPI = require('../models/DiseaseKPI');

const router = express.Router();

const handleError = (res, error, status = 500) => {
  console.error('[DASHBOARD ROUTE ERROR]', error);
  res.status(status).json({ message: error.message || 'An unexpected error occurred' });
};

router.get('/overview', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ active: true });
    const diseaseBreakdown = await Patient.aggregate([
      { $match: { active: true } },
      { $unwind: { path: '$chronicConditions', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$chronicConditions.diseaseType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const latestKpi = await DiseaseKPI.find().sort({ recordedDate: -1 }).limit(10);

    res.json({
      totalPatients,
      diseaseBreakdown,
      latestKpi,
      timestamp: new Date()
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
