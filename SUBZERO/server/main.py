from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import uvicorn
import os
import json
from pydantic import BaseModel, HttpUrl
import uuid
from datetime import datetime

app = FastAPI(
    title="PhishDeep API",
    description="API for PhishDeep - AI-powered phishing and deepfake detection",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class UrlAnalysisRequest(BaseModel):
    url: HttpUrl
    scan_depth: Optional[int] = 1
    check_resources: Optional[bool] = True

class UrlAnalysisResponse(BaseModel):
    scan_id: str
    url: str
    verdict: str
    confidence: float
    timestamp: datetime
    explanation: Optional[str] = None
    threats: Optional[List[dict]] = None

class MediaAnalysisResponse(BaseModel):
    scan_id: str
    media_type: str
    verdict: str
    confidence: float
    timestamp: datetime
    explanation: Optional[str] = None
    manipulated_regions: Optional[List[dict]] = None

# Authentication dependency
async def verify_api_key(x_api_key: str = Header(...)):
    # In production, validate against database
    if x_api_key != "test_api_key" and os.getenv("API_KEY") != x_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to PhishDeep API"}

@app.post("/api/analyze/url", response_model=UrlAnalysisResponse)
async def analyze_url(request: UrlAnalysisRequest, api_key: str = Depends(verify_api_key)):
    """
    Analyze a URL for phishing content
    """
    # In production, this would call the URL analysis service
    # For now, return mock data
    return {
        "scan_id": str(uuid.uuid4()),
        "url": str(request.url),
        "verdict": "suspicious",
        "confidence": 0.87,
        "timestamp": datetime.now(),
        "explanation": "Domain registered recently with suspicious patterns",
        "threats": [
            {"type": "brand_impersonation", "confidence": 0.92},
            {"type": "suspicious_redirect", "confidence": 0.78}
        ]
    }

@app.post("/api/analyze/media", response_model=MediaAnalysisResponse)
async def analyze_media(
    file: UploadFile = File(...),
    media_type: str = Form(...),
    api_key: str = Depends(verify_api_key)
):
    """
    Analyze media (image, video, audio) for deepfake content
    """
    # Validate media type
    if media_type not in ["image", "video", "audio"]:
        raise HTTPException(status_code=400, detail="Invalid media type")
    
    # In production, this would save the file and queue it for processing
    # For now, return mock data
    return {
        "scan_id": str(uuid.uuid4()),
        "media_type": media_type,
        "verdict": "likely_manipulated",
        "confidence": 0.91,
        "timestamp": datetime.now(),
        "explanation": "Detected inconsistencies in facial features",
        "manipulated_regions": [
            {"x": 120, "y": 80, "width": 100, "height": 100, "confidence": 0.95}
        ] if media_type == "image" else None
    }

@app.post("/api/feedback")
async def submit_feedback(
    scan_id: str = Form(...),
    is_correct: bool = Form(...),
    comments: Optional[str] = Form(None),
    api_key: str = Depends(verify_api_key)
):
    """
    Submit feedback on scan results for model improvement
    """
    # In production, store feedback in database for retraining
    return {"status": "success", "message": "Feedback received"}

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)