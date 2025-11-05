import sqlite3
import json
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / 'app.db'
SCHEMA_PATH = Path(__file__).parent / 'schema.sql'

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as conn:
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            conn.executescript(f.read())

def seed_demo():
    now = datetime.utcnow().isoformat()
    with get_conn() as conn:
        conn.execute("INSERT OR IGNORE INTO reports(id, user_id, source, created_at) VALUES(?,?,?,?)",
                     ("rpt-001", "admin", "url", now))
        conn.execute("INSERT OR IGNORE INTO reports(id, user_id, source, created_at) VALUES(?,?,?,?)",
                     ("rpt-002", "admin", "email", now))

        detailed = {
            "id": "rptdet-001",
            "report_id": "rpt-001",
            "model_name": "url_model",
            "model_version": "v2.4",
            "risk_score": 92.1,
            "confidence": 0.971,
            "features": {"url_age_days": 12, "obfuscated_domain": True},
            "explanation": {"heatmap": null_safe({"regions": []}), "nlp": {"highlights": ["login", "verify"]}},
            "metrics_used": {"precision": 0.982, "recall": 0.941, "f1": 0.961, "roc_auc": 0.991},
            "generated_at": now
        }
        conn.execute("INSERT OR IGNORE INTO reports_detailed(id, report_id, model_name, model_version, risk_score, confidence, features, explanation, metrics_used, generated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
                     (
                         detailed["id"], detailed["report_id"], detailed["model_name"], detailed["model_version"],
                         detailed["risk_score"], detailed["confidence"], json.dumps(detailed["features"]),
                         json.dumps(detailed["explanation"]), json.dumps(detailed["metrics_used"]), detailed["generated_at"]
                     ))

        # models_registry: current and previous
        conn.execute("INSERT OR IGNORE INTO models_registry(id, model_type, version, metrics, created_at) VALUES(?,?,?,?,?)",
                     ("url-current", "url", "v2.4", json.dumps({"precision": 0.982, "recall": 0.941, "f1": 0.961, "roc_auc": 0.991}), now))
        conn.execute("INSERT OR IGNORE INTO models_registry(id, model_type, version, metrics, created_at) VALUES(?,?,?,?,?)",
                     ("url-prev", "url", "v2.3", json.dumps({"precision": 0.975, "recall": 0.935, "f1": 0.955, "roc_auc": 0.988}), now))

def null_safe(obj):
    return obj