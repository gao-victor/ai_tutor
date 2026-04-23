# AI Tutor - GCP Deployment Guide

## Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Docker** installed locally
3. **MongoDB Atlas** or **Cloud SQL** instance set up
4. **Environment variables** configured

## Building and Deploying to GCP

### 1. Build the Docker Image

```bash
# Build the image
docker build -t ai-tutor .

# Test the image locally
docker run -p 5001:5001 --env-file .env ai-tutor
```

### 2. Deploy to Google Cloud Run

#### Option A: Using Cloud Build (Recommended)

```bash
# Set your project ID
export PROJECT_ID=your-gcp-project-id

# Build and deploy in one command
gcloud run deploy ai-tutor \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="MONGODB_URI=your-mongodb-uri,JWT_SECRET=your-jwt-secret,NODE_ENV=production"
```

#### Option B: Using Container Registry

```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build and push to GCR
docker build -t gcr.io/$PROJECT_ID/ai-tutor .
docker push gcr.io/$PROJECT_ID/ai-tutor

# Deploy to Cloud Run
gcloud run deploy ai-tutor \
  --image gcr.io/$PROJECT_ID/ai-tutor \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="MONGODB_URI=your-mongodb-uri,JWT_SECRET=your-jwt-secret,NODE_ENV=production"
```

### 3. Environment Variables

Make sure to set these environment variables in your GCP deployment:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `NODE_ENV`: Set to `production`
- `PORT`: Cloud Run will set this automatically

### 4. Database Setup

#### MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas cluster
2. Whitelist Cloud Run's IP ranges (or use 0.0.0.0/0 for development)
3. Create a database user
4. Get the connection string

#### Cloud SQL (Alternative)

1. Create a Cloud SQL instance
2. Set up a database and user
3. Use the connection string format for Cloud SQL

### 5. Custom Domain (Optional)

```bash
# Map a custom domain
gcloud run domain-mappings create \
  --service ai-tutor \
  --domain your-domain.com \
  --region us-central1
```

## Monitoring and Logs

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ai-tutor" --limit 50

# Monitor metrics
gcloud monitoring dashboards create --config-from-file=dashboard.json
```

## Scaling

Cloud Run automatically scales based on traffic. You can set limits:

```bash
gcloud run services update ai-tutor \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 1000
```

## Security Considerations

1. **Environment Variables**: Use Google Secret Manager for sensitive data
2. **HTTPS**: Cloud Run provides HTTPS by default
3. **Authentication**: Consider adding authentication for production
4. **CORS**: Configure CORS properly for your domain
5. **Rate Limiting**: Add rate limiting for API endpoints

## Cost Optimization

1. **Min Instances**: Set to 0 for development, 1+ for production
2. **CPU Allocation**: Use CPU only during requests for cost savings
3. **Memory**: Right-size memory allocation
4. **Region**: Choose the closest region to your users
