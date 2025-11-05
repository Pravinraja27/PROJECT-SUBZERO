# Analysis Reports, Metrics, and Dashboard Visualization

Goal:

Extend the phishing + deepfake detection system to generate detailed analysis reports and display detection accuracy, model metrics, and live threat intelligence statistics in the admin dashboard.

Functional Requirements

Per-scan Analysis Report

Each analyzed item (URL, email, image, video, audio) produces a comprehensive report stored in the database.

Reports must include:

- Basic metadata (timestamp, user, source)
- Detection results (verdict, confidence score, risk level)
- Feature summary (e.g. “URL age < 30 days, obfuscated domain”)
- Visual explanations (heatmaps, extracted text, logos)
- Model name and version used
- Optional user feedback (true/false positive)

Dashboard Visualization

Web dashboard page should show:

- Overall detection accuracy per model type (URL, image, video, audio)
- Time-series charts for number of scans, threats detected, and false positives
- Threat breakdown by category (phishing, impersonation, synthetic media)
- Top malicious domains or IPs
- Model metrics (precision, recall, F1, AUC) pulled from models_registry
- Recent analyses with link to full reports
- Admin users can filter by date, content type, or risk level.

Model Performance Tracking

When retraining completes, store metrics in models_registry.metrics JSON:

{

"precision": 0.982,

"recall": 0.941,

"f1": 0.961,

"roc_auc": 0.991

}

Dashboard displays current deployed model version and comparison to previous version.

User Feedback Integration

User labels (false positives/negatives) are counted and shown in the dashboard.

“Model Feedback Accuracy” metric = 1 − (false positives + false negatives) / total feedback.

Database Additions

8. reports_detailed

ColumnTypeDescription

- id: UUID (PK)
- report_id: UUID (FK→reports.id)
- model_name: TEXT
- model_version: TEXT
- risk_score: FLOAT
- confidence: FLOAT
- features: JSONB
- explanation: JSONB
- metrics_used: JSONB
- generated_at: TIMESTAMP

9. dashboard_metrics

ColumnTypeDescription

- id: UUID
- model_type: ENUM('url','image','video','audio','email')
- metric_name: TEXT
- metric_value: FLOAT
- time_window: TEXT (e.g. “2025-10-W43”)
- created_at: TIMESTAMP

Backend APIs

Endpoints:

- GET /api/reports/{id}
  → returns full structured report with visual data

- GET /api/dashboard/summary
  → returns aggregated stats (threat counts, accuracy, FP/FN rates)

- GET /api/models/metrics
  → returns current & previous model performance (precision, recall, etc.)

Example Response for /api/dashboard/summary:

{
  "threats_today": 214,
  "safe_today": 1390,
  "total_scans": 1604,
  "accuracy_by_model": {
    "url_model": 0.982,
    "image_model": 0.941,
    "video_model": 0.928,
    "audio_model": 0.951
  },
  "false_positive_rate": 0.021,
  "recent_threat_domains": ["login-paypa1.com", "secure-appleid.co"],
  "trend_7d": [
    {"date":"2025-10-20","threats":185},
    {"date":"2025-10-21","threats":192},
    {"date":"2025-10-22","threats":214}
  ]
}

Dashboard UI Design (Frontend)

Tech Stack: React + Tailwind + Recharts + Framer Motion

Components:

- <ThreatStatsCard> — summary cards for total scans, threats, accuracy.
- <ThreatTrendsChart> — line chart of threats over time (Recharts).
- <ModelAccuracyChart> — bar chart comparing model precision/recall.
- <RecentReportsTable> — list of recent scans with verdict, confidence, and link to detailed report.
- <ReportDetailsModal> — popup to show full analysis with visuals and explanations.

Layout Example:

---------------------------------------------------------
| Threat Overview | Model Performance | Feedback Accuracy |
---------------------------------------------------------
| Threat Trends (7 days)              | Top Threat Domains|
---------------------------------------------------------
| Recent Reports Table                                       |
---------------------------------------------------------

Interactive Features:

- Date-range picker (last 24h / 7 days / 30 days)
- Filter by content type
- Search reports by URL/domain/ID
- Export report as PDF

Analytics Pipeline

Event Logging Service

Every analysis result emits an event to Kafka/RabbitMQ:

{ type:"scan_completed", model:"url", verdict:"malicious", confidence:0.97 }

Metrics Aggregator

Background worker consumes events, aggregates into dashboard_metrics.

Hourly or real-time update of threat counts, FP/FN rates, etc.

Frontend Dashboard

Polls /api/dashboard/summary every 30–60 s.

Shows live updates with motion transitions (Framer Motion).

Example Visualization (Frontend Snippet)

// Example React component for model accuracy chart

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const data = [

{ model: 'URL', precision: 0.98, recall: 0.94 },

{ model: 'Image', precision: 0.94, recall: 0.90 },

{ model: 'Video', precision: 0.93, recall: 0.88 },

{ model: 'Audio', precision: 0.95, recall: 0.92 }

];

export default function ModelAccuracyChart() {

return (

<div className="p-4 bg-white rounded-2xl" />

);

}

Goal:
Extend the phishing + deepfake detection system to generate detailed analysis reports and display detection accuracy, model metrics, and live threat intelligence statistics in the admin dashboard.

Functional Requirements
- Per-scan Analysis Report
  - Each analyzed item (URL, email, image, video, audio) produces a comprehensive report stored in the database.
  - Reports must include:
    - Basic metadata (timestamp, user, source)
    - Detection results (verdict, confidence score, risk level)
    - Feature summary (e.g. “URL age < 30 days, obfuscated domain”)
    - Visual explanations (heatmaps, extracted text, logos)
    - Model name and version used
    - Optional user feedback (true/false positive)
- Dashboard Visualization
  - Web dashboard page should show:
    - Overall detection accuracy per model type (URL, image, video, audio)
    - Time-series charts for number of scans, threats detected, and false positives
    - Threat breakdown by category (phishing, impersonation, synthetic media)
    - Top malicious domains or IPs
    - Model metrics (precision, recall, F1, AUC) pulled from models_registry
    - Recent analyses with link to full reports
  - Admin users can filter by date, content type, or risk level.
- Model Performance Tracking
  - When retraining completes, store metrics in `models_registry.metrics` JSON:
    - `{ "precision": 0.982, "recall": 0.941, "f1": 0.961, "roc_auc": 0.991 }`
  - Dashboard displays current deployed model version and comparison to previous version.
- User Feedback Integration
  - User labels (false positives/negatives) are counted and shown in the dashboard.
  - “Model Feedback Accuracy” metric = `1 − (false positives + false negatives) / total feedback`.

Database Additions
1) `reports_detailed`
   - `id` UUID (PK)
   - `report_id` UUID (FK→reports.id)
   - `model_name` TEXT
   - `model_version` TEXT
   - `risk_score` FLOAT
   - `confidence` FLOAT
   - `features` JSONB
   - `explanation` JSONB
   - `metrics_used` JSONB
   - `generated_at` TIMESTAMP

2) `dashboard_metrics`
   - `id` UUID
   - `model_type` ENUM('url','image','video','audio','email')
   - `metric_name` TEXT (e.g. “precision”, “threat_count”, “false_positive_rate”)
   - `metric_value` FLOAT
   - `time_window` TEXT (e.g. “2025-10-W43”)
   - `created_at` TIMESTAMP

Backend APIs
- `GET /api/reports/{id}` → returns full structured report with visual data
- `GET /api/dashboard/summary` → returns aggregated stats (threat counts, accuracy, FP/FN rates)
- `GET /api/models/metrics` → returns current & previous model performance (precision, recall, etc.)

Example Response for `/api/dashboard/summary`:
```
{
  "threats_today": 214,
  "safe_today": 1390,
  "total_scans": 1604,
  "accuracy_by_model": {
    "url_model": 0.982,
    "image_model": 0.941,
    "video_model": 0.928,
    "audio_model": 0.951
  },
  "false_positive_rate": 0.021,
  "recent_threat_domains": ["login-paypa1.com", "secure-appleid.co"],
  "trend_7d": [
    {"date":"2025-10-20","threats":185},
    {"date":"2025-10-21","threats":192},
    {"date":"2025-10-22","threats":214}
  ]
}
```

Dashboard UI Design (Frontend)
- Tech Stack: React + Tailwind + Recharts + Framer Motion
- Components:
  - `<ThreatStatsCard>` — summary cards for total scans, threats, accuracy
  - `<ThreatTrendsChart>` — line chart of threats over time (Recharts)
  - `<ModelAccuracyChart>` — bar chart comparing model precision/recall
  - `<RecentReportsTable>` — list of recent scans with verdict, confidence, and link to detailed report
  - `<ReportDetailsModal>` — popup to show full analysis with visuals and explanations
- Layout Example:
```
---------------------------------------------------------
| Threat Overview | Model Performance | Feedback Accuracy |
---------------------------------------------------------
| Threat Trends (7 days)              | Top Threat Domains|
---------------------------------------------------------
| Recent Reports Table                                       |
---------------------------------------------------------
```
- Interactive Features:
  - Date-range picker (last 24h / 7 days / 30 days)
  - Filter by content type
  - Search reports by URL/domain/ID
  - Export report as PDF

Analytics Pipeline
- Event Logging Service: Every analysis result emits an event to Kafka/RabbitMQ:
  - `{ type:"scan_completed", model:"url", verdict:"malicious", confidence:0.97 }`
- Metrics Aggregator: Background worker consumes events, aggregates into `dashboard_metrics`.
  - Hourly or real-time update of threat counts, FP/FN rates, etc.
- Frontend Dashboard
  - Polls `/api/dashboard/summary` every 30–60 s.
  - Shows live updates with motion transitions (Framer Motion).

Example Visualization (Frontend Snippet)
```jsx
// Example React component for model accuracy chart
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const data = [
  { model: 'URL', precision: 0.98, recall: 0.94 },
  { model: 'Image', precision: 0.94, recall: 0.90 },
  { model: 'Video', precision: 0.93, recall: 0.88 },
  { model: 'Audio', precision: 0.95, recall: 0.92 }
];

export default function ModelAccuracyChart() {
  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-2">Model Detection Accuracy</h2>
      <BarChart width={500} height={250} data={data}>
        <XAxis dataKey="model" />
        <YAxis domain={[0, 1]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="precision" fill="#3b82f6" />
        <Bar dataKey="recall" fill="#10b981" />
      </BarChart>
    </div>
  );
}
```

