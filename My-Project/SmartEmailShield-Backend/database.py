from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
import datetime

# --- 1. SETUP ---
# Define the database file
DATABASE_FILE = "scans.db"
# Create an "engine" to connect to the database
# 'sqlite:///scans.db' means we are using SQLite and the file is scans.db
engine = create_engine(f"sqlite:///{DATABASE_FILE}")

# Create a "Base" class that our data models will inherit from
Base = declarative_base()

# --- 2. DEFINE THE "Scans" TABLE ---
# We are creating a table called 'Scan'
class Scan(Base):
    __tablename__ = 'scans'
    
    id = Column(Integer, primary_key=True) # An auto-incrementing ID for each scan
    timestamp = Column(DateTime, default=datetime.datetime.utcnow) # The exact time of the scan
    scan_type = Column(String(50)) # e.g., 'page', 'url', 'report'
    content = Column(String(1000)) # The URL or page text that was scanned
    risk_level = Column(String(50)) # e.g., 'GREEN', 'YELLOW', 'RED', 'REPORTED'
    reason = Column(String(1000)) # The "why" text (e.g., "Contains 'password'")
    is_reported = Column(Boolean, default=False) # True if the user clicked "Report"

# --- 3. CREATE THE DATABASE (if it doesn't exist) ---
def init_db():
    # This tells SQLAlchemy to create all the tables we defined (just 'Scan')
    Base.metadata.create_all(engine)
    print("--- Database 'scans.db' created successfully. ---")

# --- 4. CREATE A "SESSION" (How we talk to the DB) ---
# A "Session" is our handle for all conversations with the database
SessionLocal = sessionmaker(bind=engine)

# This is a helper for the main API
def get_db_session():
    return SessionLocal()

# This part means if you run "python database.py" directly,
# it will create the database file.
if __name__ == "__main__":
    init_db()