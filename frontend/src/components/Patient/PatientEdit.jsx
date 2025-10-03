import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { patientService } from '../../services/api';

const PatientEdit = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await patientService.get(patientId);
      setForm({
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      nhsNumber: form.nhsNumber,
      firstName: form.firstName,
      lastName: form.lastName,
      dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
      gender: form.gender,
      contact: form.contact,
      gpPractice: form.gpPractice,
    };

    try {
      await patientService.update(patientId, payload);
      navigate('/patients');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth={600}>
      <Typography variant="h4" gutterBottom>
        Edit Patient
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <TextField
          required
          label="NHS Number"
          name="nhsNumber"
          value={form.nhsNumber}
          onChange={handleChange}
        />
        <TextField
          required
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
        />
        <TextField
          required
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
        />
        <TextField
          required
          type="date"
          label="Date of Birth"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl fullWidth>
          <InputLabel id="gender-edit-label">Gender</InputLabel>
          <Select
            labelId="gender-edit-label"
            label="Gender"
            name="gender"
            value={form.gender || 'not_specified'}
            onChange={handleChange}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
            <MenuItem value="not_specified">Not Specified</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Phone"
          name="contact.phone"
          value={form.contact?.phone || ''}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              contact: { ...prev.contact, phone: event.target.value },
            }))
          }
        />
        <TextField
          label="Email"
          name="contact.email"
          value={form.contact?.email || ''}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              contact: { ...prev.contact, email: event.target.value },
            }))
          }
        />
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Saving...' : 'Update Patient'}
        </Button>
      </Stack>
    </Box>
  );
};

export default PatientEdit;
