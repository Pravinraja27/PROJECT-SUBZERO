-- SQLite schema approximating required tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  source TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS reports_detailed (
  id TEXT PRIMARY KEY,
  report_id TEXT,
  model_name TEXT,
  model_version TEXT,
  risk_score REAL,
  confidence REAL,
  features TEXT,        -- JSON
  explanation TEXT,     -- JSON
  metrics_used TEXT,    -- JSON
  generated_at TEXT,
  FOREIGN KEY (report_id) REFERENCES reports(id)
);

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id TEXT PRIMARY KEY,
  model_type TEXT,      -- ENUM-like ('url','image','video','audio','email')
  metric_name TEXT,
  metric_value REAL,
  time_window TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS models_registry (
  id TEXT PRIMARY KEY,
  model_type TEXT,
  version TEXT,
  metrics TEXT,         -- JSON
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  model TEXT,
  verdict TEXT,
  confidence REAL,
  created_at TEXT
);
