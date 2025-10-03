const express = require('express');

const router = express.Router();

const educationResources = {
  diabetes: [
    { title: 'Managing Diabetes', url: 'https://www.nhs.uk/conditions/diabetes/' },
    { title: 'Diabetes Diet Guide', url: 'https://www.diabetes.org.uk/guide-to-diabetes/enjoy-food' }
  ],
  copd: [
    { title: 'Living with COPD', url: 'https://www.nhs.uk/conditions/chronic-obstructive-pulmonary-disease-copd/' }
  ],
  hypertension: [
    { title: 'High Blood Pressure', url: 'https://www.nhs.uk/conditions/high-blood-pressure-hypertension/' }
  ]
};

router.get('/:diseaseType', (req, res) => {
  const resources = educationResources[req.params.diseaseType] || [];
  res.json(resources);
});

module.exports = router;
