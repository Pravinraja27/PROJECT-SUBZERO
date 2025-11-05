# SUBZERO: Phishinng email Detection Platform

SUBZERO is a comprehensive platform for detecting fake and manipulated media across multiple formats including URLs, emails, images, videos, and audio.

## Features

- **Multi-modal Detection**: Analyze URLs, emails, images, videos, and audio for signs of manipulation
- **Browser Extension**: Chrome extension for real-time scanning of web content
- **API Access**: Secure API with rate limiting and authentication
- **Dashboard**: Analytics dashboard with detection metrics and trends
- **Compliance**: Built-in GDPR compliance and data privacy features
- **Retraining Pipeline**: Automated model retraining with Airflow

## System Architecture

SUBZERO consists of several components:

1. **API Server**: FastAPI backend for handling scan requests
2. **ML Models**: Specialized models for each content type
3. **Web Dashboard**: Frontend for analytics and management
4. **Browser Extension**: Chrome extension for real-time scanning
5. **Airflow Pipeline**: For automated data collection and model retraining

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for production deployment)
- Python 3.9+
- Node.js 16+

### Local Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-org/subzero.git
cd subzero
```

2. **Set up environment variables**

Create a `.env` file in the root directory:

```
DATABASE_URL=postgresql://subzero:subzero_password@postgres:5432/subzero
API_KEY_SECRET=your_secret_key_here
MODEL_PATH=/app/models
```

3. **Start the development environment**

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis for caching
- API server on port 8000
- Web dashboard on port 3000
- Airflow webserver on port 8080

4. **Access the services**

- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Web Dashboard: http://localhost:3000
- Airflow: http://localhost:8080

### Production Deployment with Kubernetes

1. **Build and push Docker images**

```bash
docker build -t your-registry/subzero-api:latest -f Dockerfile.api .
docker build -t your-registry/subzero-web:latest -f Dockerfile.web .
docker push your-registry/subzero-api:latest
docker push your-registry/subzero-web:latest
```

2. **Update Kubernetes secrets**

Edit the `kubernetes/deployment.yaml` file to update the secrets with your production values.

3. **Deploy to Kubernetes**

```bash
kubectl apply -f kubernetes/deployment.yaml
```

4. **Access the services**

The web service is exposed via a LoadBalancer. Get the external IP:

```bash
kubectl get service subzero-web-service
```

## Browser Extension Setup

1. **Open Chrome and navigate to extensions**

Go to `chrome://extensions/`

2. **Enable Developer Mode**

Toggle the "Developer mode" switch in the top-right corner

3. **Load the extension**

Click "Load unpacked" and select the `extensions/chrome` directory

4. **Configure the extension**

Click on the SUBZERO extension icon and enter your API key and endpoint

## API Usage

### Authentication

All API requests require an API key in the header:

```
X-API-Key: your_api_key_here
```

### Endpoints

- `POST /scan/url`: Scan a URL for deepfakes
- `POST /scan/email`: Scan an email for deepfakes
- `POST /scan/image`: Scan an image for deepfakes
- `POST /scan/video`: Scan a video for deepfakes
- `POST /scan/audio`: Scan audio for deepfakes

See the API documentation at `/docs` for detailed request/response formats.

## Airflow Pipelines

SUBZERO includes two Airflow DAGs:

1. **data_collection_dag**: Collects scan data for model retraining
2. **model_retraining_dag**: Retrains models with new data

Access the Airflow web interface at http://localhost:8080 to manage and monitor these pipelines.

## Security and Compliance

SUBZERO includes several security and compliance features:

- API key authentication
- Rate limiting
- GDPR consent management
- Data anonymization
- Audit logging

## License

[Your License Here]

## Contact

For support or inquiries, please contact [your-email@example.com]
