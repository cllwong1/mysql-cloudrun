GOOGLE_PROJECT_ID=$(gcloud config list --format='value(core.project)') # YOUR GCP PROJECT ID GOES HERE
CLOUD_RUN_SERVICE=mysql-cloud-run # NAME OF YOUR CLOUD RUN SERVICE
INSTANCE_CONNECTION_NAME=micro-harmony-342312:us-central1:mysql-machine # PROJECT:REGION:INSTANCE
# DB_USER=root # SQL USER 
# DB_PASS=Password # SQL PASSWORD (DEVELOPMENT ONLY!)
# DB_NAME=demo-mysql # DATABASE NAME

# gcloud services enable compute.googleapis.com sqladmin.googleapis.com run.googleapis.com \
#   containerregistry.googleapis.com cloudbuild.googleapis.com

# gcloud iam service-accounts list
# Get the email of the Compute Engine Service Account
# gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
#   --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
#   --role="roles/cloudsql.client"

gcloud builds submit -t gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE .

gcloud run deploy $CLOUD_RUN_SERVICE --image gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE \
  --platform managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
#   --set-env-vars INSTANCE_CONNECTION_NAME="${INSTANCE_CONNECTION_NAME}" \
#   --set-env-vars INSTANCE_UNIX_SOCKET="/cloudsql/${INSTANCE_CONNECTION_NAME}" \
#   --set-env-vars DB_NAME="${DB_NAME}" \
#   --set-env-vars DB_USER="${DB_USER}" \
#   --set-env-vars DB_PASS="${DB_PASS}"


