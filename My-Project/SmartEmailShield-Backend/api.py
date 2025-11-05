from flask import Flask, request, jsonify
from flask_cors import CORS
import model

# --- DATABASE IMPORTS ---
# 1. Import for the GENERAL scan logs
from database import get_db_session, Scan

# 2. NEW: Import for the USER REPORTS
from database_reports import get_reports_db_session, ReportedPage

app = Flask(__name__)
CORS(app) 

# --- HELPER 1: For logging general scans to scans.db ---
def log_to_db(scan_type, content, risk_level, reason):
    session = get_db_session() # Connects to scans.db
    try:
        new_scan = Scan(
            scan_type=scan_type,
            content=content,
            risk_level=risk_level,
            reason=reason,
            is_reported=False # We now set this to False
        )
        session.add(new_scan)
        session.commit()
        print(f"--- Logged {scan_type} scan to scans.db. ---")
    except Exception as e:
        print(f"DB Log Error: {e}")
        session.rollback()
    finally:
        session.close()

# --- NEW HELPER 2: For logging reports to reports.db ---
def log_report_to_db(url):
    session = get_reports_db_session() # Connects to reports.db
    try:
        new_report = ReportedPage(
            reported_url=url
        )
        session.add(new_report)
        session.commit()
        print(f"--- Logged USER REPORT to reports.db. ---")
    except Exception as e:
        print(f"DB Log Error: {e}")
        session.rollback()
    finally:
        session.close()

# --- ENDPOINT 1: ANALYZE THE PAGE ---
# (This still logs to scans.db)
@app.route("/api/v1/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    email_text = data.get("email_text", "")
    analysis_result = model.analyze_email(email_text)
    
    log_to_db( # Uses Helper 1
        scan_type='page',
        content=email_text[:900],
        risk_level=analysis_result['risk_level'],
        reason=analysis_result['reason_text']
    )
    
    return jsonify(analysis_result)

# --- ENDPOINT 2: ANALYZE A PASTED URL ---
# (This still logs to scans.db)
@app.route("/api/v1/analyze-url", methods=["POST"])
def analyze_url_endpoint():
    data = request.get_json()
    url_to_check = data.get("url", "")
    analysis_result = model.analyze_url(url_to_check)
    
    log_to_db( # Uses Helper 1
        scan_type='url',
        content=url_to_check,
        risk_level=analysis_result['risk_level'],
        reason=analysis_result['reason_text']
    )
    
    return jsonify(analysis_result)

# --- ENDPOINT 3: REPORT A PAGE ---
# (MODIFIED: This now logs to reports.db)
@app.route("/api/v1/report", methods=["POST"])
def report():
    data = request.get_json()
    reported_item_url = data.get("email_id", "Unknown") # This is the URL
    
    # 1. NEW: Log this "report" to the separate database
    log_report_to_db(reported_item_url) # Uses Helper 2
    
    # 2. Return success
    return jsonify({"status": "Reported successfully"})

# --- RUN THE SERVER ---
if __name__ == "__main__":
    app.run(debug=True, port=5000, host='0.0.0.0')