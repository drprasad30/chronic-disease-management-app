# Implementation Guide - Chronic Disease Management App

## Project Structure Overview

This document provides a comprehensive guide to implementing the complete application structure.

## Backend Structure

```
backend/
├── models/
│   ├── DiseaseKPI.js          ✅ IMPLEMENTED
│   └── Patient.js             ✅ IMPLEMENTED
├── routes/
│   ├── patients.js            📝 TO IMPLEMENT
│   ├── kpi.js                 📝 TO IMPLEMENT
│   ├── recalls.js             📝 TO IMPLEMENT
│   ├── dashboard.js           📝 TO IMPLEMENT
│   └── education.js           📝 TO IMPLEMENT
├── services/
│   ├── recallEngine.js        📝 TO IMPLEMENT
│   └── kpiCalculator.js       📝 TO IMPLEMENT
├── package.json               ✅ IMPLEMENTED
└── server.js                  ✅ IMPLEMENTED
```

## Frontend Structure (React)

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── PatientRegister/
│   │   ├── KPITracker/
│   │   ├── RecallAlerts/
│   │   ├── Dashboard/
│   │   └── PatientEducation/
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── index.js
└── package.json
```

## Backend Routes Implementation

### 1. Patient Routes (backend/routes/patients.js)

```javascript
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// GET all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find({ active: true })
      .populate('chronicConditions.diseaseKPIRef');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('chronicConditions.diseaseKPIRef');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new patient
router.post('/', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE patient (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient deactivated', patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 2. KPI Routes (backend/routes/kpi.js)

```javascript
const express = require('express');
const router = express.Router();
const DiseaseKPI = require('../models/DiseaseKPI');
const Patient = require('../models/Patient');

// GET KPI summary for practice
router.get('/summary', async (req, res) => {
  try {
    const kpis = await DiseaseKPI.find();
    const summary = {
      totalPatients: await Patient.countDocuments({ active: true }),
      byDisease: {},
      qofAchievement: { totalPoints: 0, achievedPoints: 0 }
    };
    
    kpis.forEach(kpi => {
      if (!summary.byDisease[kpi.diseaseType]) {
        summary.byDisease[kpi.diseaseType] = { count: 0, achievement: 0 };
      }
      summary.byDisease[kpi.diseaseType].count++;
      summary.byDisease[kpi.diseaseType].achievement += kpi.qofAchievement?.achievementPercentage || 0;
    });
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET KPI by disease type
router.get('/disease/:type', async (req, res) => {
  try {
    const kpis = await DiseaseKPI.find({ diseaseType: req.params.type });
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 3. Recall Alert Engine (backend/services/recallEngine.js)

```javascript
const Patient = require('../models/Patient');
const cron = require('node-cron');

class RecallEngine {
  // Check for due and overdue reviews
  static async checkDueReviews() {
    const today = new Date();
    const patients = await Patient.find({ active: true });
    
    const alerts = [];
    
    patients.forEach(patient => {
      patient.reviews.forEach(review => {
        if (review.status === 'due' && review.dueDate <= today) {
          const daysOverdue = Math.floor((today - review.dueDate) / (1000 * 60 * 60 * 24));
          
          alerts.push({
            patientId: patient._id,
            patientName: patient.fullName,
            nhsNumber: patient.nhsNumber,
            reviewType: review.reviewType,
            dueDate: review.dueDate,
            daysOverdue: daysOverdue,
            priority: daysOverdue > 30 ? 'high' : daysOverdue > 14 ? 'medium' : 'low'
          });
          
          // Update review status to overdue
          if (daysOverdue > 0) {
            review.status = 'overdue';
          }
        }
      });
    });
    
    // Save updated patient records
    await Promise.all(patients.map(p => p.save()));
    
    return alerts;
  }
  
  // Schedule automatic recall checks (daily at 8 AM)
  static scheduleRecallChecks() {
    cron.schedule('0 8 * * *', async () => {
      console.log('Running scheduled recall check...');
      const alerts = await this.checkDueReviews();
      console.log(`Generated ${alerts.length} recall alerts`);
      // Here you would send notifications (email/SMS)
    });
  }
}

module.exports = RecallEngine;
```

### 4. Recall Routes (backend/routes/recalls.js)

```javascript
const express = require('express');
const router = express.Router();
const RecallEngine = require('../services/recallEngine');

// GET all current recall alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await RecallEngine.checkDueReviews();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET recalls by priority
router.get('/priority/:level', async (req, res) => {
  try {
    const allAlerts = await RecallEngine.checkDueReviews();
    const filtered = allAlerts.filter(a => a.priority === req.params.level);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 5. Dashboard Routes (backend/routes/dashboard.js)

```javascript
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const DiseaseKPI = require('../models/DiseaseKPI');

// GET dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ active: true });
    const diseaseBreakdown = await Patient.aggregate([
      { $unwind: '$chronicConditions' },
      { $group: { _id: '$chronicConditions.diseaseType', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalPatients,
      diseaseBreakdown,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 6. Patient Education Routes (backend/routes/education.js)

```javascript
const express = require('express');
const router = express.Router();

const educationResources = {
  diabetes: [
    { title: 'Managing Diabetes', url: 'https://www.nhs.uk/conditions/diabetes/', type: 'article' },
    { title: 'Diabetes Diet Guide', url: 'https://www.diabetes.org.uk/guide-to-diabetes/enjoy-food', type: 'guide' }
  ],
  copd: [
    { title: 'Living with COPD', url: 'https://www.nhs.uk/conditions/chronic-obstructive-pulmonary-disease-copd/', type: 'article' }
  ],
  hypertension: [
    { title: 'High Blood Pressure', url: 'https://www.nhs.uk/conditions/high-blood-pressure-hypertension/', type: 'article' }
  ],
  // Add more resources for other conditions
};

// GET education resources by disease type
router.get('/:diseaseType', (req, res) => {
  const resources = educationResources[req.params.diseaseType] || [];
  res.json(resources);
});

module.exports = router;
```

## Frontend Setup

### Frontend Package.json (frontend/package.json)

```json
{
  "name": "chronic-disease-management-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "axios": "^1.4.0",
    "@mui/material": "^5.13.0",
    "@mui/icons-material": "^5.13.0",
    "recharts": "^2.7.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
```

## Environment Configuration

### Backend .env file

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chronic-disease-mgmt
NODE_ENV=development
```

## Next Steps

1. Create route files in `backend/routes/` directory
2. Create service files in `backend/services/` directory
3. Initialize React frontend with `npx create-react-app frontend`
4. Install backend dependencies: `cd backend && npm install`
5. Install frontend dependencies: `cd frontend && npm install`
6. Start MongoDB: `mongod`
7. Start backend: `cd backend && npm run dev`
8. Start frontend: `cd frontend && npm start`

## Module Documentation

- **DiseaseKPI Model**: Comprehensive SNOMED CT coded disease KPI tracking
- **Patient Model**: Full patient register with CRUD operations, recall tracking, and clinical measurements
- **Server**: Express server with MongoDB connection and API structure
- **Routes**: RESTful API endpoints for all modules
- **Recall Engine**: Automated due/overdue review detection with cron scheduling

All core components are scaffolded and ready for further development.
