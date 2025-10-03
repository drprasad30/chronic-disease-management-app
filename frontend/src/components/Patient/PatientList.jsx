import React, { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { patientService } from '../../services/api';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await patientService.list();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this patient?')) {
      return;
    }
    try {
      setDeletingId(id);
      await patientService.remove(id);
      await loadPatients();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Register
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>NHS Number</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient._id} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/patients/${patient._id}`} underline="hover">
                    {patient.firstName} {patient.lastName}
                  </Link>
                </TableCell>
                <TableCell>{patient.nhsNumber}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>
                  {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <IconButton
                    component={RouterLink}
                    to={`/patients/${patient._id}`}
                    size="small"
                    aria-label="edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="delete"
                    onClick={() => handleDelete(patient._id)}
                    disabled={deletingId === patient._id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!patients.length && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No patients found. Add a patient to get started.
        </Typography>
      )}
    </Box>
  );
};

export default PatientList;
