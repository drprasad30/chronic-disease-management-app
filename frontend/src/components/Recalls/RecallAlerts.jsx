import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { recallService } from '../../services/api';

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const RecallAlerts = () => {
  const [priority, setPriority] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAlerts = async (selectedPriority) => {
    try {
      setLoading(true);
      setError('');
      const data =
        selectedPriority === 'all'
          ? await recallService.list()
          : await recallService.byPriority(selectedPriority);
      setAlerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(priority);
  }, [priority]);

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Recall Alerts</Typography>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading recall alerts...
        </Typography>
      ) : alerts.length ? (
        alerts.map((alert) => (
          <Card key={`${alert.patientId}-${alert.reviewType}`}> 
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">{alert.patientName}</Typography>
                  <Typography color="text.secondary">NHS: {alert.nhsNumber}</Typography>
                </Box>
                <Chip label={alert.priority} color={priorityColors[alert.priority] || 'default'} />
              </Stack>
              <Box mt={2}>
                <Typography>
                  Review Type: <strong>{alert.reviewType || 'General Review'}</strong>
                </Typography>
                <Typography color="text.secondary">
                  Due Date: {alert.dueDate ? new Date(alert.dueDate).toLocaleDateString() : 'Unknown'}
                </Typography>
                {alert.daysOverdue ? (
                  <Typography color="error">Overdue by {alert.daysOverdue} days</Typography>
                ) : (
                  <Typography color="text.secondary">Status: {alert.status}</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No recall alerts for the selected priority.
        </Typography>
      )}
    </Stack>
  );
};

export default RecallAlerts;
