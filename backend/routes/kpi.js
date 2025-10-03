const express = require('express');
const DiseaseKPI = require('../models/DiseaseKPI');
const Patient = require('../models/Patient');

const router = express.Router();

const handleError = (res, error, status = 500) => {
  console.error('[KPI ROUTE ERROR]', error);
  res.status(status).json({ message: error.message || 'An unexpected error occurred' });
};

// GET KPI summary for practice dashboard
router.get('/summary', async (req, res) => {
  try {
    const kpis = await DiseaseKPI.find();
    const totalPatients = await Patient.countDocuments({ active: true });

    const summary = {
      totalPatients,
      byDisease: {},
      qofAchievement: {
        totalPoints: 0,
        achievedPoints: 0,
        achievementPercentage: 0
      }
    };

    kpis.forEach(kpi => {
      if (!summary.byDisease[kpi.diseaseType]) {
        summary.byDisease[kpi.diseaseType] = {
          count: 0,
          averageAchievement: 0
        };
      }

      const diseaseSummary = summary.byDisease[kpi.diseaseType];
      diseaseSummary.count += 1;
      diseaseSummary.averageAchievement += kpi.qofAchievement?.achievementPercentage || 0;

      summary.qofAchievement.totalPoints += kpi.qofAchievement?.totalPoints || 0;
      summary.qofAchievement.achievedPoints += kpi.qofAchievement?.achievedPoints || 0;
    });

    Object.values(summary.byDisease).forEach(disease => {
      if (disease.count > 0) {
        disease.averageAchievement = parseFloat(
          (disease.averageAchievement / disease.count).toFixed(2)
        );
      }
    });

    summary.qofAchievement.achievementPercentage = summary.qofAchievement.totalPoints
      ? parseFloat(((summary.qofAchievement.achievedPoints / summary.qofAchievement.totalPoints) * 100).toFixed(2))
      : 0;

    res.json(summary);
  } catch (error) {
    handleError(res, error);
  }
});

// GET KPI records by disease type
router.get('/disease/:type', async (req, res) => {
  try {
    const kpis = await DiseaseKPI.find({ diseaseType: req.params.type }).sort({ recordedDate: -1 });
    res.json(kpis);
  } catch (error) {
    handleError(res, error);
  }
});

// POST create or update KPI entry for a patient/disease
router.post('/', async (req, res) => {
  try {
    const kpiEntry = new DiseaseKPI(req.body);
    const savedEntry = await kpiEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    handleError(res, error, 400);
  }
});

module.exports = router;
