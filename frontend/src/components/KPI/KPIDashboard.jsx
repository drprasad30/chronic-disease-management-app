import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { dashboardService, kpiService } from '../../services/api';

const KPIDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [summaryData, overviewData] = await Promise.all([
        kpiService.summary(),
        dashboardService.overview(),
      ]);
      setSummary(summaryData);
      setOverview(overviewData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Practice Summary
            </Typography>
            <Typography variant="h2">{summary?.totalPatients || 0}</Typography>
            <Typography color="text.secondary">Active Patients</Typography>
            <Box mt={2}>
              <Typography variant="subtitle1">QOF Achievement</Typography>
              <Typography variant="h4">
                {summary?.qofAchievement?.achievementPercentage || 0}%
              </Typography>
              <Typography color="text.secondary">
                {summary?.qofAchievement?.achievedPoints || 0} / {summary?.qofAchievement?.totalPoints || 0} points
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Disease Breakdown
            </Typography>
            <List>
              {summary &&
                Object.entries(summary.byDisease || {}).map(([disease, stats]) => (
                  <ListItem key={disease} divider>
                    <ListItemText
                      primary={`${disease} (${stats.count})`}
                      secondary={`Avg Achievement: ${stats.averageAchievement?.toFixed(2) || 0}%`}
                    />
                  </ListItem>
                ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Recent KPI Snapshots
            </Typography>
            <List>
              {overview?.latestKpi?.map((entry) => (
                <ListItem key={entry._id} divider>
                  <ListItemText
                    primary={entry.diseaseType}
                    secondary={
                      entry.currentMetrics?.length
                        ? `${entry.currentMetrics[0].metricName}: ${entry.currentMetrics[0].value} ${entry.currentMetrics[0].unit}`
                        : 'No metrics recorded'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default KPIDashboard;
