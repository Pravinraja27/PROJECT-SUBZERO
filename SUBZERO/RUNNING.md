# SUBZERO: Running Instructions

This document provides detailed instructions for running the SUBZERO platform in different environments.

## Local Development Environment

### Prerequisites
- Docker and Docker Compose
- Git
- Python 3.9+ (for local development outside Docker)
- Node.js 16+ (for local development outside Docker)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/subzero.git
cd subzero
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgresql://subzero:subzero_password@postgres:5432/subzero
API_KEY_SECRET=your_secret_key_here
MODEL_PATH=/app/models
AIRFLOW_FERNET_KEY=your_fernet_key_here
```

You can generate a Fernet key for Airflow using Python:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Step 3: Start the Development Environment
```bash
docker-compose up -d
```

This command starts all services defined in the `docker-compose.yml` file:
- PostgreSQL database
- Redis for caching
- API server (FastAPI)
- Web dashboard
- Airflow webserver and scheduler

### Step 4: Verify Services
Check that all services are running:
```bash
docker-compose ps
```

Access the services:
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Web Dashboard: http://localhost:3000
- Airflow: http://localhost:8080

### Step 5: Generate an API Key
Use the following command to generate an API key for testing:
```bash
docker-compose exec api python -c "from server.security.api_key import api_key_manager; print(api_key_manager.generate_key('test-user'))"
```

## Running the Browser Extension

### Step 1: Build the Extension
```bash
cd extensions/chrome
```

### Step 2: Load in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top-right corner)
3. Click "Load unpacked" and select the `extensions/chrome` directory

### Step 3: Configure the Extension
1. Click on the SUBZERO extension icon in the Chrome toolbar
2. Go to the "Settings" tab
3. Enter your API key and API endpoint (http://localhost:8000 for local development)
4. Configure auto-scan settings according to your preferences

## Production Deployment with Kubernetes

### Prerequisites
- Kubernetes cluster
- kubectl configured to access your cluster
- Container registry access

### Step 1: Build and Push Docker Images
```bash
# Build images
docker build -t your-registry/subzero-api:latest -f Dockerfile.api .
docker build -t your-registry/subzero-web:latest -f Dockerfile.web .

# Push to registry
docker push your-registry/subzero-api:latest
docker push your-registry/subzero-web:latest
```

### Step 2: Update Kubernetes Configuration
Edit `kubernetes/deployment.yaml` to:
- Update image references to match your registry
- Configure resource limits based on your cluster capacity
- Update secrets with production values

### Step 3: Apply Kubernetes Configuration
```bash
kubectl apply -f kubernetes/deployment.yaml
```

### Step 4: Verify Deployment
```bash
kubectl get pods
kubectl get services
```

### Step 5: Access the Services
Get the external IP for the web service:
```bash
kubectl get service subzero-web-service
```

## Running Airflow Pipelines

### Step 1: Access Airflow Web UI
Navigate to http://localhost:8080 (for local development) or your production Airflow endpoint.

### Step 2: Enable DAGs
In the Airflow UI:
1. Navigate to the DAGs page
2. Enable the following DAGs:
   - `data_collection_dag`
   - `model_retraining_dag`

### Step 3: Configure DAG Variables
In the Airflow UI:
1. Go to Admin > Variables
2. Add the following variables:
   - `model_path`: Path to model storage
   - `data_path`: Path to training data storage
   - `database_url`: PostgreSQL connection string

### Step 4: Trigger DAGs
You can trigger DAGs manually from the UI or wait for their scheduled runs:
- `data_collection_dag` runs daily to collect new scan data
- `model_retraining_dag` runs weekly to retrain models with new data

## Troubleshooting

### Database Connection Issues
If the API can't connect to the database:
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres
docker-compose logs api
```

### API Key Issues
If you're having trouble with API authentication:
```bash
# Generate a new API key
docker-compose exec api python -c "from server.security.api_key import api_key_manager; print(api_key_manager.generate_key('test-user'))"

# Check API logs
docker-compose logs api
```

### Browser Extension Issues
If the extension isn't working:
1. Check the browser console for errors
2. Verify the API endpoint and key in the extension settings
3. Ensure the API server is accessible from your browser

### Kubernetes Deployment Issues
```bash
# Check pod status
kubectl get pods

# Check pod logs
kubectl logs <pod-name>

# Check service status
kubectl get services
```

## Maintenance Tasks

### Backing Up the Database
```bash
docker-compose exec postgres pg_dump -U subzero -d subzero > backup.sql
```

### Updating Models
Place new model files in the `models/` directory and restart the API service:
```bash
docker-compose restart api
```

### Monitoring
Monitor the system using:
- API logs: `docker-compose logs -f api`
- Web logs: `docker-compose logs -f web`
- Database logs: `docker-compose logs -f postgres`
- Airflow logs: `docker-compose logs -f airflow-webserver`