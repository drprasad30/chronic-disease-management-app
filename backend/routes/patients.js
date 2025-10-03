const express = require('express');
const Patient = require('../models/Patient');

const router = express.Router();

// Utility to handle errors consistently
const handleError = (res, error, status = 500) => {
  console.error('[PATIENT ROUTE ERROR]', error);
  res.status(status).json({ message: error.message || 'An unexpected error occurred' });
};

// GET all active patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find({ active: true })
      .populate('chronicConditions.diseaseKPIRef')
      .sort({ lastName: 1, firstName: 1 });

    res.json(patients);
  } catch (error) {
    handleError(res, error);
  }
});

// GET patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('chronicConditions.diseaseKPIRef');

    if (!patient || !patient.active) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    handleError(res, error);
  }
});

// POST create new patient
router.post('/', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    handleError(res, error, 400);
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('chronicConditions.diseaseKPIRef');

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(updatedPatient);
  } catch (error) {
    handleError(res, error, 400);
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

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient deactivated', patient });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
