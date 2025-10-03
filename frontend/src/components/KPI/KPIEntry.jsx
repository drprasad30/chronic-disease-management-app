import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { kpiService, patientService } from '../../services/api';

const diseaseOptions = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'copd', label: 'COPD' },
  { value: 'heart_failure', label: 'Heart Failure' },
  { value: 'ckd', label: 'Chronic Kidney Disease' },
  { value: 'cad', label: 'Coronary Artery Disease' },
  { value: 'hypertension', label: 'Hypertension' },
];

const KPIEntry = () => {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    diseaseType: 'diabetes',
    metricName: 'bloodPressure',
    value: '',
    unit: 'mmHg',
    recordedDate: new Date().toISOString().substring(0, 10),
    achievementStatus: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await patientService.list();
        setPatients(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadPatients();
  }, []);

  const metricOptions = useMemo(() => {
    switch (form.diseaseType) {
      case 'diabetes':
        return [
          { value: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg' },
          { value: 'hba1c', label: 'HbA1c', unit: 'mmol/mol' },
          { value: 'cholesterol', label: 'Cholesterol', unit: 'mmol/L' },
        ];
      case 'copd':
        return [
          { value: 'fev1', label: 'FEV1', unit: 'L' },
          { value: 'mrcDyspnoeaScore', label: 'MRC Dyspnoea Score', unit: 'scale 1-5' },
        ];
      case 'ckd':
        return [
          { value: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²' },
          { value: 'acr', label: 'ACR', unit: 'mg/mmol' },
        ];
      case 'hypertension':
        return [
          { value: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg' },
        ];
      default:
        return [
          { value: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg' },
        ];
    }
  }, [form.diseaseType]);

  useEffect(() => {
    const selectedMetric = metricOptions[0];
    if (selectedMetric) {
      setForm((prev) => ({
        ...prev,
        metricName: selectedMetric.value,
        unit: selectedMetric.unit,
      }));
    }
  }, [metricOptions]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await kpiService.create({
        patient: form.patientId,
        diseaseType: form.diseaseType,
        currentMetrics: [
          {
            metricName: form.metricName,
            value: Number(form.value),
            unit: form.unit,
            achievementStatus: form.achievementStatus,
            recordedDate: new Date(form.recordedDate).toISOString(),
          },
        ],
      });

      setSuccess('KPI entry saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth={600}>
      <Typography variant="h4" gutterBottom>
        Enter KPI Metrics
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="patient-label">Patient</InputLabel>
          <Select
            labelId="patient-label"
            label="Patient"
            name="patientId"
            value={form.patientId}
            onChange={handleChange}
            required
          >
            {patients.map((patient) => (
              <MenuItem key={patient._id} value={patient._id}>
                {patient.firstName} {patient.lastName} ({patient.nhsNumber})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="disease-label">Disease</InputLabel>
          <Select
            labelId="disease-label"
            label="Disease"
            name="diseaseType"
            value={form.diseaseType}
            onChange={handleChange}
          >
            {diseaseOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="metric-label">Metric</InputLabel>
          <Select
            labelId="metric-label"
            label="Metric"
            name="metricName"
            value={form.metricName}
            onChange={handleChange}
          >
            {metricOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Value"
          name="value"
          type="number"
          value={form.value}
          onChange={handleChange}
          required
        />
        <TextField
          label="Unit"
          name="unit"
          value={form.unit}
          onChange={handleChange}
          required
        />
        <TextField
          type="date"
          label="Recorded Date"
          name="recordedDate"
          value={form.recordedDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <FormControl fullWidth>
          <InputLabel id="achievement-label">Achievement Status</InputLabel>
          <Select
            labelId="achievement-label"
            label="Achievement Status"
            name="achievementStatus"
            value={form.achievementStatus}
            onChange={handleChange}
          >
            <MenuItem value="achieved">Achieved</MenuItem>
            <MenuItem value="not_achieved">Not Achieved</MenuItem>
            <MenuItem value="exception">Exception</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit KPI'}
        </Button>
      </Stack>
    </Box>
  );
};

export default KPIEntry;
