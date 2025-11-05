from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
import datetime

# --- 1. SETUP ---
# Define the NEW database file
DATABASE_FILE = "reports.db"
engine = create_engine(f"sqlite:///{DATABASE_FILE}")
Base = declarative_base()

# --- 2. DEFINE THE "ReportedPage" TABLE ---
# This table is simpler, as we know everything is a report.
class ReportedPage(Base):
    __tablename__ = 'reported_pages'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    reported_url = Column(String(1000))
    # We could add more details here later, like user_id, etc.

# --- 3. CREATE THE DATABASE (if it doesn't exist) ---
def init_reports_db():
    Base.metadata.create_all(engine)
    print("--- Database 'reports.db' created successfully. ---")

# --- 4. CREATE A "SESSION" ---
SessionLocal = sessionmaker(bind=engine)

def get_reports_db_session():
    return SessionLocal()

# This part means if you run "python database_reports.py" directly,
# it will create the database file.
if __name__ == "__main__":
    init_reports_db()