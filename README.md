# TaskBoard — DevOps Final Capstone Project

TaskBoard is a production-grade, multi-tier project management application architected and deployed using modern DevOps and Cloud-Native best practices.

---

## 1. Architecture Overview

```text
Developer (Git Commit)
        │
        ▼
   GitHub Repository
        │
        ▼
GitHub Actions CI/CD Pipeline
   ├── Pytest Automated Testing
   ├── React Frontend Production Build
   ├── Docker Multi-Stage Image Builds
   ├── Trivy Container Security Scanning
   └── Push Images to GitHub Container Registry (GHCR)
              │
              ▼
    Infrastructure Layer (Terraform)
   └── AWS VPC + Public/Private Subnets + NAT GW + EKS Cluster
              │
              ▼
   Kubernetes & GitOps Orchestration (Helm / ArgoCD)
   ├── Namespace Isolation (taskboard)
   ├── Ingress Routing (taskboard.local)
   │     ├── /        ──► React Frontend (Nginx)
   │     └── /api     ──► FastAPI Backend
   ├── Horizontal Pod Autoscaler (HPA)
   ├── PostgreSQL with Persistent Volumes (PV/PVC)
   └── Zero-Trust Network Policies
              │
              ▼
      Observability & Monitoring
   ├── Prometheus (Scraping /metrics every 5s)
   └── Grafana (Real-time Latency, Error Rate, and Request Throughput Dashboards)
```

---

## 2. Technology Stack

- **Frontend:** React 18, Vite, Responsive CSS, Nginx runtime container
- **Backend:** Python 3.12, FastAPI, SQLAlchemy ORM, Alembic Migrations, Pydantic, Prometheus FastApi Instrumentator
- **Database:** PostgreSQL 16 Alpine with Persistent Volume Claim
- **Testing:** Pytest (10/10 automated tests covering all CRUD endpoints and probes)
- **Containerization:** Docker multi-stage builds, non-root security profiles, Docker Compose
- **CI/CD:** GitHub Actions (matrix testing, Trivy scanner, GHCR packaging, Helm linting)
- **Infrastructure as Code:** Terraform (AWS VPC, Subnets, Internet Gateway, NAT Gateway, EKS Cluster, Node Groups)
- **Kubernetes Packaging:** Helm v3 Chart (`helm/taskboard`) with dev and production profiles
- **Monitoring & SRE:** Prometheus Server, Grafana, custom ServiceMonitor, and dedicated API Metrics Dashboard
- **Security & DevSecOps:** Trivy vulnerability scanner, Bandit SAST, pip-audit SCA, zero-trust NetworkPolicies
- **Troubleshooting Lab:** Dedicated scenarios for diagnosing `ImagePullBackOff` and zero-endpoint Service misconfigurations

---

## 3. Quickstart: Local Docker Run

Start the full stack with a single command:

```bash
docker compose up --build -d
```

Access services:
- **TaskBoard React Dashboard:** [http://localhost:3000](http://localhost:3000)
- **FastAPI Swagger API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Probe:** [http://localhost:8000/health](http://localhost:8000/health)
- **Database Readiness Probe:** [http://localhost:8000/ready](http://localhost:8000/ready)
- **Prometheus Metrics:** [http://localhost:8000/metrics](http://localhost:8000/metrics)

Stop the stack:
```bash
docker compose down
```

---

## 4. Automated Testing

Run the test suite:
```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

---

## 5. Kubernetes & Helm Deployment

Deploy via Helm:
```bash
helm upgrade --install taskboard ./helm/taskboard \
  --namespace taskboard \
  --create-namespace \
  -f helm/taskboard/values.yaml
```

Inspect deployment status:
```bash
kubectl get all,pvc,ingress -n taskboard
```

---

## 6. Observability: Prometheus & Grafana

Access Grafana:
```bash
kubectl port-forward svc/prometheus-grafana 3001:80 -n monitoring
```
- Open [http://localhost:3001](http://localhost:3001)
- User: `admin` | Password: `prom-operator`
- Import `monitoring/grafana-dashboard.json` to view real-time request rates, P95 latency, and error breakdown.

---

## 7. Infrastructure as Code (Terraform)

```bash
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform plan
```
