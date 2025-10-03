# Frontend API Consumption Guide

This document describes how the React frontend interacts with the Node/Express API for the Chronic Disease Management App.

## Configuration

All Axios requests are configured with the base URL `REACT_APP_API_BASE_URL` (default `http://localhost:5000/api`). The Axios instance automatically unwraps JSON responses and normalises errors.

```
src/services/api.js
```
- Creates the `apiClient` Axios instance
- Exposes `patientService`, `kpiService`, `recallService`, and `dashboardService`

## Patient Management

### Endpoints
- `GET /api/patients` – Retrieve active patients
- `POST /api/patients` – Create patient records
- `GET /api/patients/:id` – Retrieve single patient
- `PUT /api/patients/:id` – Update patient
- `DELETE /api/patients/:id` – Soft delete patient

### Components
- `PatientList` (`src/components/Patient/PatientList.jsx`)
  - Calls `patientService.list()` on mount
  - Displays loading & error states
  - Invokes `patientService.remove(id)` for soft deletion, then refreshes list
- `PatientForm` (`src/components/Patient/PatientForm.jsx`)
  - Submits registration via `patientService.create(payload)`
  - Navigates to `/patients` after success
- `PatientEdit` (`src/components/Patient/PatientEdit.jsx`)
  - Loads patient via `patientService.get(patientId)`
  - Saves edits with `patientService.update(patientId, payload)`

## KPI Metric Entry & Visualisation

### Endpoints
- `POST /api/kpi` – Create KPI entries
- `GET /api/kpi/summary` – Practice KPI summary
- `GET /api/kpi/disease/:type` – Historical disease metrics
- `GET /api/dashboard/overview` – Latest KPI snapshots & totals

### Components
- `KPIEntry` (`src/components/KPI/KPIEntry.jsx`)
  - Preloads patients using `patientService.list()`
  - Posts KPI metrics through `kpiService.create()`
- `KPICharts` (`src/components/KPI/KPICharts.jsx`)
  - Fetches disease data via `kpiService.byDisease(type)`
  - Auto-refreshes every 30 seconds
  - Displays latest metrics (sample data) from MongoDB
- `KPIDashboard` (`src/components/KPI/KPIDashboard.jsx`)
  - Loads summary data via `kpiService.summary()`
  - Loads latest KPI snapshots via `dashboardService.overview()`

## Recall Alerts

### Endpoints
- `GET /api/recalls` – Full recall list
- `GET /api/recalls/priority/:level` – Filtered recalls

### Components
- `RecallAlerts` (`src/components/Recalls/RecallAlerts.jsx`)
  - Uses `recallService.list()` and `recallService.byPriority(level)` depending on the selected filter
  - Shows priority chips and overdue status

## Error & Loading States
- All components show `CircularProgress`, `Typography`, or `Alert` feedback during loading/error conditions
- Axios interceptor normalises error messages for consistent display

## Auto Refresh Strategy
- `KPICharts` refreshes KPI data every 30 seconds with `setInterval`
- Other views re-fetch on navigation or user action to avoid unnecessary traffic

## Extending the Integration
- Add new endpoints to `src/services/api.js`
- Inject service methods into React components using hooks
- Keep documentation updated as new endpoints are introduced
