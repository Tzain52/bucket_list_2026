# GCP Cloud Run + Supabase Deployment Guide

## Prerequisites

1. **GCP Account** with billing enabled
2. **Supabase Account** (free tier available)
3. **gcloud CLI** installed and authenticated
4. **Docker** installed (optional, Cloud Run can build from source)

---

## Step 1: Set Up Supabase PostgreSQL

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for database to be provisioned (~2 minutes)
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
5. Save this connection string - you'll need it for Cloud Run

### Initialize Database Tables

Run this SQL in Supabase SQL Editor (Database → SQL Editor):

```sql
CREATE TABLE bucket_list_items (
    id SERIAL PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    added_by VARCHAR(100) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE item_photos (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES bucket_list_items(id) ON DELETE CASCADE,
    photo_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_item_photos_item_id ON item_photos(item_id);
```

---

## Step 2: Deploy to GCP Cloud Run

### Option A: Deploy from GitHub (Recommended)

```bash
# 1. Authenticate with GCP
gcloud auth login

# 2. Set your project
gcloud config set project YOUR_PROJECT_ID

# 3. Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 4. Deploy from GitHub
gcloud run deploy bucket-list-2026 \
  --source https://github.com/Tzain52/bucket_list_2026 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="YOUR_SUPABASE_CONNECTION_STRING" \
  --set-env-vars SECRET_KEY="YOUR_RANDOM_SECRET_KEY" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

### Option B: Deploy from Local Directory

```bash
# 1. Navigate to project directory
cd /Users/a38371/Desktop/sql/new_website

# 2. Deploy
gcloud run deploy bucket-list-2026 \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="YOUR_SUPABASE_CONNECTION_STRING" \
  --set-env-vars SECRET_KEY="YOUR_RANDOM_SECRET_KEY" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

---

## Step 3: Environment Variables

You need to set these environment variables:

### Required:
- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `SECRET_KEY`: Generate with: `python -c "import secrets; print(secrets.token_hex(32))"`

### Optional:
- `UPLOAD_FOLDER`: Default is "uploads"

### Set via GCP Console:
1. Go to Cloud Run → Your Service
2. Click **Edit & Deploy New Revision**
3. Go to **Variables & Secrets** tab
4. Add environment variables

---

## Step 4: Configure Photo Storage

**Important**: Cloud Run is stateless, so uploaded photos won't persist between deployments.

### Option A: Use GCS (Google Cloud Storage) - Recommended

You'll need to modify the app to use GCS instead of local filesystem:

```bash
# Enable Cloud Storage API
gcloud services enable storage.googleapis.com

# Create a bucket
gsutil mb gs://bucket-list-2026-photos

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://bucket-list-2026-photos
```

### Option B: Use Supabase Storage (Easier)

Supabase includes free storage. You can store photos there instead.

---

## Step 5: Verify Deployment

After deployment, Cloud Run will give you a URL like:
```
https://bucket-list-2026-xxxxx-uc.a.run.app
```

Test it:
1. Visit the URL
2. Add a bucket list item
3. Mark it complete
4. Upload a photo

---

## Cost Estimate

### GCP Cloud Run:
- **Free tier**: 2 million requests/month, 360,000 GB-seconds/month
- **Your usage**: Likely FREE for personal use
- **If exceeded**: ~$0.40 per million requests

### Supabase:
- **Free tier**: 500MB database, 1GB storage
- **Your usage**: FREE for personal use

**Total: $0/month** (within free tiers)

---

## Troubleshooting

### Database Connection Issues:
```bash
# Test connection string
gcloud run services describe bucket-list-2026 --region us-central1
```

### View Logs:
```bash
gcloud run logs read bucket-list-2026 --region us-central1 --limit 50
```

### Update Environment Variables:
```bash
gcloud run services update bucket-list-2026 \
  --region us-central1 \
  --set-env-vars DATABASE_URL="NEW_CONNECTION_STRING"
```

---

## What I Need From You

Please provide:

1. ✅ **GCP Project ID** (e.g., `my-project-12345`)
2. ✅ **Supabase Connection String** (from Supabase Dashboard → Settings → Database)
3. ✅ **Preferred Region** (default: `us-central1`)
4. ✅ **Secret Key** (or I can generate one for you)

Once you provide these, I can give you the exact deployment command to run!
