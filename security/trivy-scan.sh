#!/usr/bin/env bash
# Script to run Trivy security scanning locally on TaskBoard container images

set -euo pipefail

echo "🛡️  Checking for Trivy installation..."
if ! command -v trivy &> /dev/null; then
    echo "⚠️  Trivy is not installed locally. Installing via official install script or docker..."
    echo "   Running Trivy via Docker container..."
    TRIVY_CMD="docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest"
else
    TRIVY_CMD="trivy"
fi

echo "🔍 Scanning backend image (taskboard-backend:local)..."
$TRIVY_CMD image --severity HIGH,CRITICAL --ignore-unfixed taskboard-backend:local || true

echo "🔍 Scanning frontend image (taskboard-frontend:local)..."
$TRIVY_CMD image --severity HIGH,CRITICAL --ignore-unfixed taskboard-frontend:local || true

echo "✅ Security scan completed."
