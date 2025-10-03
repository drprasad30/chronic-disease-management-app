import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Stack } from '@mui/material';
import PatientList from './components/Patient/PatientList';
import PatientForm from './components/Patient/PatientForm';
import PatientEdit from './components/Patient/PatientEdit';
import KPIEntry from './components/KPI/KPIEntry';
import KPICharts from './components/KPI/KPICharts';
import KPIDashboard from './components/KPI/KPIDashboard';
import RecallAlerts from './components/Recalls/RecallAlerts';

const App = () => {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chronic Disease Management
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" component={NavLink} to="/patients" end>
              Patients
            </Button>
            <Button color="inherit" component={NavLink} to="/patients/new">
              Add Patient
            </Button>
            <Button color="inherit" component={NavLink} to="/kpi/entry">
              KPI Entry
            </Button>
            <Button color="inherit" component={NavLink} to="/kpi/charts">
              KPI Charts
            </Button>
            <Button color="inherit" component={NavLink} to="/kpi/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={NavLink} to="/recalls">
              Recalls
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<KPIDashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/:patientId" element={<PatientEdit />} />
          <Route path="/kpi/entry" element={<KPIEntry />} />
          <Route path="/kpi/charts" element={<KPICharts />} />
          <Route path="/kpi/dashboard" element={<KPIDashboard />} />
          <Route path="/recalls" element={<RecallAlerts />} />
        </Routes>
      </Container>
    </div>
  );
};

export default App;
