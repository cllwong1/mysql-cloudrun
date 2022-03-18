GOOGLE_PROJECT_ID=$(gcloud config list --format='value(core.project)') # YOUR GCP PROJECT ID GOES HERE
CLOUD_RUN_SERVICE=mysql-cloud-run # NAME OF YOUR CLOUD RUN SERVICE
INSTANCE_CONNECTION_NAME=cellular-codex-344210:us-central1:mysql-machine # PROJECT:REGION:INSTANCE
DB_NAME=mysql_cloudrun
DB_USER=root
DB_PASS=Password
INSTANCE_CONNECTION_NAME=cellular-codex-344210:us-central1:mysql-machine
JWT_SECRET=secret-password

# gcloud services enable compute.googleapis.com sqladmin.googleapis.com run.googleapis.com \
#   containerregistry.googleapis.com cloudbuild.googleapis.com

# gcloud iam service-accounts list
# Get the email of the Compute Engine Service Account
# gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
#   --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
#   --role="roles/cloudsql.client"

# create table users (
#     user_id int not null auto_increment primary key,
#     first_name varchar(255) not null,
#     last_name varchar(255) not null,
#     email varchar(255) not null unique,
#     password varchar(255) not null,
#     created_at timestamp not null default current_timestamp
# );

# backend API: https://mysql-cloud-run-uc4rkdapoq-uc.a.run.app

gcloud builds submit -t gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE .


gcloud run deploy $CLOUD_RUN_SERVICE --image gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE \
  --platform managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
  --set-env-vars JWT_SECRET=$JWT_SECRET\
  --set-env-vars INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME \
  --set-env-vars INSTANCE_UNIX_SOCKET="/cloudsql/${INSTANCE_CONNECTION_NAME}" \
  --set-env-vars DB_NAME=$DB_NAME \
  --set-env-vars DB_USER=$DB_USER \
  --set-env-vars DB_PASS=$DB_PASS \


