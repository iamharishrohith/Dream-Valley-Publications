param(
    [Parameter(Mandatory = $true)][string]$ProjectId,
    [string]$Zone = "asia-south1-a",
    [string]$InstanceName = "dvpublishers",
    [string]$MachineType = "e2-small",
    [string]$SiteUrl = "https://dreamvalleypublications.com"
)

$ErrorActionPreference = "Stop"

if (-not $env:NEXT_PUBLIC_API_URL) {
    throw "Set NEXT_PUBLIC_API_URL before running deployment."
}

if (-not $env:ADMIN_EMAIL -or -not $env:ADMIN_PASSWORD -or -not $env:JWT_SECRET) {
    throw "Set ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET before running deployment."
}

$remoteDir = "/opt/dvpublishers"
$archivePath = "C:\tmp\dvpublishers-deploy.tgz"

tar -czf $archivePath --exclude=.git --exclude=node_modules --exclude=server/node_modules --exclude=.next --exclude=.env --exclude=.env.local .

& gcloud.cmd config set project $ProjectId | Out-Null
& gcloud.cmd compute instances describe $InstanceName --zone $Zone | Out-Null 2>$null
if ($LASTEXITCODE -ne 0) {
    & gcloud.cmd compute instances create $InstanceName `
        --project $ProjectId `
        --zone $Zone `
        --machine-type $MachineType `
        --image-family debian-12 `
        --image-project debian-cloud `
        --boot-disk-size 30GB `
        --tags http-server,https-server
}

& gcloud.cmd compute firewall-rules describe dvpublishers-web | Out-Null 2>$null
if ($LASTEXITCODE -ne 0) {
    & gcloud.cmd compute firewall-rules create dvpublishers-web `
        --project $ProjectId `
        --allow tcp:80,tcp:443,tcp:3000,tcp:3001 `
        --target-tags http-server,https-server
}

& gcloud.cmd compute scp $archivePath "${InstanceName}:~/dvpublishers-deploy.tgz" --zone $Zone --project $ProjectId

$remoteScript = @"
set -e
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo mkdir -p $remoteDir
sudo tar -xzf ~/dvpublishers-deploy.tgz -C $remoteDir --strip-components=1
cd $remoteDir
cat <<'EOF' | sudo tee .env >/dev/null
NEXT_PUBLIC_API_URL=$($env:NEXT_PUBLIC_API_URL)
NEXT_PUBLIC_SITE_URL=$SiteUrl
NEXT_PUBLIC_COMPANY_NAME=$($env:NEXT_PUBLIC_COMPANY_NAME)
NEXT_PUBLIC_COMPANY_SHORT_NAME=$($env:NEXT_PUBLIC_COMPANY_SHORT_NAME)
NEXT_PUBLIC_SUPPORT_EMAIL=$($env:NEXT_PUBLIC_SUPPORT_EMAIL)
NEXT_PUBLIC_CONSULTATION_EMAIL=$($env:NEXT_PUBLIC_CONSULTATION_EMAIL)
NEXT_PUBLIC_SUPPORT_PHONE=$($env:NEXT_PUBLIC_SUPPORT_PHONE)
NEXT_PUBLIC_PRIMARY_REGION=$($env:NEXT_PUBLIC_PRIMARY_REGION)
NEXT_PUBLIC_PRIMARY_TIMEZONE=$($env:NEXT_PUBLIC_PRIMARY_TIMEZONE)
EOF
sudo mkdir -p $remoteDir/server
cat <<'EOF' | sudo tee $remoteDir/server/.env >/dev/null
ADMIN_EMAIL=$($env:ADMIN_EMAIL)
ADMIN_PASSWORD=$($env:ADMIN_PASSWORD)
JWT_SECRET=$($env:JWT_SECRET)
CLOUDINARY_CLOUD_NAME=$($env:CLOUDINARY_CLOUD_NAME)
CLOUDINARY_API_KEY=$($env:CLOUDINARY_API_KEY)
CLOUDINARY_API_SECRET=$($env:CLOUDINARY_API_SECRET)
FIREBASE_PROJECT_ID=$($env:FIREBASE_PROJECT_ID)
FIREBASE_CLIENT_EMAIL=$($env:FIREBASE_CLIENT_EMAIL)
FIREBASE_PRIVATE_KEY=$($env:FIREBASE_PRIVATE_KEY)
EOF
sudo docker compose --env-file .env -f docker-compose.prod.yml up -d --build
"@

& gcloud.cmd compute ssh $InstanceName --zone $Zone --project $ProjectId --command $remoteScript

Write-Host "Deployment complete. Check the instance external IP and point your DNS for dvpublishers to it."
