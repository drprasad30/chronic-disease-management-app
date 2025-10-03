import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { kpiService } from '../../services/api';

const diseaseOptions = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'ckd', label: 'Chronic Kidney Disease' },
  { value: 'copd', label: 'COPD' },
];

const KPICharts = () => {
  const [diseaseType, setDiseaseType] = useState('diabetes');
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchKpi = async (type) => {
    try {
      setLoading(true);
      setError('');
      const data = await kpiService.byDisease(type);
      setKpiData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpi(diseaseType);
    const interval = setInterval(() => fetchKpi(diseaseType), 30000);
    return () => clearInterval(interval);
  }, [diseaseType]);

  const chartSeries = useMemo(() => {
    if (!kpiData.length) {
      return [];
    }

    return kpiData.flatMap((entry) =>
      (entry.currentMetrics || []).map((metric) => ({
        ...metric,
        diseaseType: entry.diseaseType,
        recordedDate: metric.recordedDate ? new Date(metric.recordedDate).toLocaleDateString() : 'Unknown',
      }))
    );
  }, [kpiData]);

  const latestMetrics = useMemo(() => chartSeries.slice(-10).reverse(), [chartSeries]);

  return (
    <Stack spacing={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Real-time KPI Charts</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="chart-disease-label">Disease</InputLabel>
          <Select
            labelId="chart-disease-label"
            label="Disease"
            value={diseaseType}
            onChange={(event) => setDiseaseType(event.target.value)}
          >
            {diseaseOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            KPI Trend
          </Typography>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading KPI data...
            </Typography>
          ) : chartSeries.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="recordedDate" />
                <YAxis dataKey="value" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1976d2" name="Metric Value" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No KPI data available for this disease yet.
            </Typography>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Latest KPI Entries (MongoDB sample data)
          </Typography>
          {latestMetrics.length ? (
            <Stack spacing={1}>
              {latestMetrics.map((metric, index) => (
                <Box key={`${metric.metricName}-${index}`} display="flex" justifyContent="space-between">
                  <Typography>{metric.metricName}</Typography>
                  <Typography>
                    {metric.value} {metric.unit} · {metric.recordedDate}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recent metrics recorded.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default KPICharts;
