#  TaskBoard — DevOps Final Capstone Project (Session 21)

TaskBoard is a production-grade, full-stack SaaS project management application engineered to demonstrate how modern web applications travel from a developer's laptop to an observable, multi-cloud Kubernetes environment.

---

##  Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Technology Stack](#-technology-stack)
3. [M1 — Application: Frontend, Backend & Database](#-m1--application-frontend-backend--database)
4. [M2 — Testing: Pytest Quality Gates](#-m2--testing-pytest-quality-gates)
5. [M3 & M4 — Docker: Containerization & Compose](#-m3--m4--docker-containerization--compose)
6. [M5 — CI/CD: GitHub Actions Automation Pipeline](#-m5--cicd-github-actions-automation-pipeline)
7. [M6 — DevSecOps: Security Auditing & Trivy](#-m6--devsecops-security-auditing--trivy)
8. [M7 — Terraform: AWS Infrastructure as Code](#-m7--terraform-aws-infrastructure-as-code)
9. [M8 — Kubernetes & Helm Orchestration](#-m8--kubernetes--helm-orchestration)
10. [M9 — Observability: Prometheus & Grafana](#-m9--observability-prometheus--grafana)
11. [M10 — Troubleshooting Lab](#-m10--troubleshooting-lab)
12. [GitOps Continuous Delivery](#-gitops-continuous-delivery-argocd)

---

##  Architecture Overview

```text
Developer Laptop (Git Commit)
        │
        ▼
   GitHub Repository (session21)
        │
        ▼
GitHub Actions CI/CD Pipeline
   ├── Pytest Automated Testing (10/10 Passed)
   ├── React Frontend Production Build (Vite)
   ├── Docker Multi-Stage Container Builds
   ├── Trivy Security Vulnerability Scanning
   └── Push Images to GitHub Container Registry (GHCR)
              │
              ▼
   Infrastructure Layer (Terraform on AWS)
   └── AWS VPC (10.0.0.0/16) + Public/Private Subnets + NAT GW + EKS Cluster
              │
              ▼
   Kubernetes Cluster & Helm Packaging (Minikube / EKS)
   ├── Namespace Isolation (taskboard)
   ├── Ingress Routing (taskboard.local)
   │     ├── /         ──► React Frontend (Nginx Container, Port 80)
   │     └── /api      ──► FastAPI Backend (Port 8000)
   ├── Horizontal Pod Autoscaler (HPA) (CPU > 75%)
   ├── PostgreSQL 16 with Persistent Volume Claim (Bound)
   └── Zero-Trust Network Policies
              │
              ▼
   Observability & SRE Monitoring
   ├── Prometheus Server (Scraping /metrics every 5s)
   └── Grafana Dashboards (Request Rates, P95 Latency, HTTP Error Rates)
```

---

##  Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Responsive Vanilla CSS, Nginx 1.27 Alpine |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0 ORM, Alembic Migrations, Uvicorn |
| **Database** | PostgreSQL 16 Alpine with Persistent Volume Claim (PVC) |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX TestClient, SQLite in-memory mock fixtures |
| **Containers** | Docker multi-stage builds, non-root security profiles, Docker Compose |
| **CI/CD** | GitHub Actions (Matrix testing, Trivy vulnerability scan, GHCR publishing) |
| **Infrastructure** | Terraform >= 1.5.0, AWS Provider ~> 5.0 (VPC, Subnets, IGW, NAT GW, IAM, EKS) |
| **Kubernetes** | Helm v3, Kubernetes Deployments, Services, Ingress, HPA, NetworkPolicies |
| **Monitoring** | Prometheus Server, Grafana, custom ServiceMonitor, PromQL |
| **DevSecOps** | Trivy Container Scanner, Bandit SAST, pip-audit SCA, Zero-Trust NetworkPolicy |

---

##  M1 — Application: Frontend, Backend & Database

The frontend is a modern SaaS Kanban board providing real-time KPI metrics, task creation modals, priority badges, and status filters. The backend is built with FastAPI and SQLAlchemy, backed by PostgreSQL.

### React SaaS Dashboard UI
![TaskBoard Frontend UI](ss/FrontBack-endSS/image.png)

### TaskBoard Kanban Interface & Live Board
![TaskBoard Live Board](ss/FrontBack-endSS/image4.png)

### Database Schema Migrations (Alembic)
Schema evolution is tracked using Alembic migrations (`0001_create_tasks_table.py`):
![Alembic Migrations](ss/FrontBack-endSS/image3.png)

---

##  M2 — Testing: Pytest Quality Gates

Automated tests validate every API endpoint and probe before any container image can be built or deployed. 10/10 integration tests pass against an isolated database fixture.

```bash
cd backend && source .venv/bin/activate && pytest tests/ -v
```

![Pytest Test Suite Passing](ss/FrontBack-endSS/image2.png)

---

##  M3 & M4 — Docker: Containerization & Compose

The complete stack is containerized with multi-stage Dockerfiles and orchestrated locally with Docker Compose:
- **`backend/Dockerfile`**: Slim Python 3.12 image executing as a non-root `appuser`.
- **`frontend/Dockerfile`**: Multi-stage build (Node 20 build stage ➔ Nginx Alpine runtime).
- **`docker-compose.yml`**: Full local stack with health checks.

### Multi-Container Startup & Health Verification
![Docker Compose Up](ss/docckerSS/image.png)

### Running Containers (`docker ps`)
Shows `taskboard-db`, `taskboard-backend`, and `taskboard-frontend` all active and healthy:
![Docker PS Output](ss/docckerSS/image2.png)

### Container Logs & Service Startup
![Docker Logs](ss/docckerSS/image3.png)
![Docker Container Output](ss/docckerSS/image4.png)
![Docker Compose Down Cleanup](ss/docckerSS/image5.png)

---

##  M5 — CI/CD: GitHub Actions Automation Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automates the full quality and delivery pipeline on every push to `main`:
1. ** Automated Tests:** Sets up Python 3.12 & Node 20, runs Pytest and builds Vite frontend.
2. ** Security Scan & Packaging:** Builds multi-stage Docker images, scans with Trivy, and pushes to GitHub Container Registry (`ghcr.io`) using Git commit SHA tags.
3. ** Deployment Check:** Validates and dry-run templates the Helm package.

### Workflow Runs Overview
![GitHub Actions Workflow Run](ss/githubSS/image.png)

### Green CI/CD Pipeline
![Successful CI/CD Pipeline](ss/githubSS/image2.png)

---

##  M6 — DevSecOps: Security Auditing & Trivy

Security is implemented in depth across 5 automated layers:

### 1. SAST & SCA Auditing
- **Bandit:** Static Application Security Testing for Python code (0 issues found).
- **pip-audit:** Software Composition Analysis scanning dependencies against CVE databases (0 vulnerabilities found).

![Security Scans Output](ss/securitySS/image.png)

### 2. Zero-Trust Kubernetes Network Policies
Restricts pod-to-pod traffic so that PostgreSQL only accepts database connections from the backend, and the backend only accepts HTTP traffic from frontend and Ingress:

```bash
kubectl apply -f security/network-policy.yaml
kubectl get networkpolicies -n taskboard
```
![Active Network Policies](ss/securitySS/image2.png)

---

##  M7 — Terraform: AWS Infrastructure as Code

Production AWS cloud infrastructure is provisioned using modular Terraform code in `terraform/`:
- **VPC (`10.0.0.0/16`)**: 2 Public Subnets, 2 Private Subnets across availability zones in `ap-south-1`.
- **Internet & NAT Gateways**: Configured with Elastic IP for secure outbound node traffic.
- **EKS Cluster (v1.30)**: Managed control plane with dedicated IAM roles.
- **EKS Managed Node Group**: Amazon Linux 2023 EC2 instances in private subnets.

### Terraform Formatting, Init & Plan (23 Resources Planned)
![Terraform Init & Plan Part 1](ss/terraformss/image.png)
![Terraform Plan Part 2](ss/terraformss/image2.png)

### Live AWS Provisioning (`terraform apply`)
Shows the VPC, subnets, NAT Gateway, IAM roles, and EKS Cluster being created on AWS:
![Terraform Apply Output](ss/terraformss/apply.png)

### AWS Management Console Verification
#### AWS EKS Cluster Active:
![AWS EKS Console](ss/terraformss/eks.jpeg)

#### AWS VPC & Subnets:
![AWS VPC Console](ss/terraformss/vpc1.jpeg)

### Clean Infrastructure Teardown (`terraform destroy`)
Confirms zero runaway cloud costs after testing:
![Terraform Destroy Complete](ss/terraformss/destroy.png)

---

##  M8 — Kubernetes & Helm Orchestration

The application is packaged as a reusable Helm chart in `helm/taskboard` and deployed to Kubernetes:

### Helm Lint & Template Validation
```bash
helm lint helm/taskboard
helm template taskboard ./helm/taskboard
helm template taskboard ./helm/taskboard -f helm/taskboard/values-dev.yaml
```
![Helm Lint Output](ss/helmSs/image.png)
![Helm Template Output](ss/helmSs/image2.png)
![Helm Dev Template Output](ss/helmSs/image3.png)

### Running Kubernetes Workloads
Shows all Pods, Services, Deployments, ReplicaSets, PersistentVolumeClaims (`Bound`), and Ingress:

```bash
kubectl get all,pvc,ingress -n taskboard
```
![Kubernetes Workloads Running](ss/kubeSS/image.png)

### Probes & Autoscaling (HPA) Verification
Demonstrates `/health` liveness probe, `/ready` readiness probe, and HPA:
![Kubernetes Probes & HPA](ss/kubeSS/image2.png)

---

##  M9 — Observability: Prometheus & Grafana

Full system observability is achieved by exposing machine-readable metrics from FastAPI and scraping them into Prometheus and Grafana.

### FastAPI `/metrics` Prometheus Endpoint
Exposes HTTP request counts, response latency histograms, and system memory/CPU metrics:
```bash
curl http://localhost:8000/metrics
```
![Prometheus Metrics Curl Output](ss/monitoringSS/image2.png)

### Prometheus Scrape Targets Active (`UP 1/1`)
![Prometheus Targets UP](ss/monitoringSS/prometheus2.png)

### Real-Time PromQL Metric Queries
![PromQL Query Table](ss/monitoringSS/prometheus3.png)
![PromQL Graph Visualization](ss/monitoringSS/prometheus4.png)
![PromQL Endpoint Rates](ss/monitoringSS/prometheus5.png)

### Grafana Production Dashboard (`TaskBoard - FastAPI Metrics`)
Displays live visualizations for:
- **Total Requests by Handler (req/s)**
- **P95 Request Latency**
- **5xx Server Errors (0 errors)**
- **HTTP Status Code Breakdown (2xx / 4xx / 5xx)**

![Grafana Dashboard](ss/monitoringSS/image.png)

---

##  M10 — Troubleshooting Lab

Hands-on exercises designed to practice diagnosing common real-world Kubernetes failures:

### Exercise 1: Broken Image (`ImagePullBackOff`)
Diagnosing non-existent image tags using `kubectl describe pod` and reading cluster events:
![ImagePullBackOff Pod Status](ss/troubleSS/image.png)
![Describe Pod Events](ss/troubleSS/image2.png)

### Exercise 2: Broken Service (`Zero Endpoints`)
Diagnosing mismatched label selectors resulting in `ENDPOINTS: <none>`:
![Broken Service Zero Endpoints](ss/troubleSS/image3.png)
![Describe Service Label Mismatch](ss/troubleSS/image4.png)

---

##  GitOps Continuous Delivery (ArgoCD)

The repository includes an ArgoCD Application manifest (`gitops/application.yaml`) that continuously synchronizes the `helm/taskboard` chart with the live Kubernetes cluster:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: taskboard
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/abhaysingh-oo7/session21.git
    path: helm/taskboard
  destination:
    server: https://kubernetes.default.svc
    namespace: taskboard
  syncPolicy:![alt text](image.png)
    automated:
      prune: true
      selfHeal: true
```

---
