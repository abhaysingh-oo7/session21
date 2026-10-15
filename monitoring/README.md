# PART M — Monitoring (Prometheus & Grafana)

This guide documents the setup for monitoring the TaskBoard FastAPI backend metrics on Kubernetes using Prometheus Operator and Grafana.

---

## 1. Architecture

```text
FastAPI Backend (/metrics)
         │
         │  (Scraped every 15s)
         ▼
    ServiceMonitor
         │
         ▼
     Prometheus
         │
         ▼
      Grafana (Dashboards)
```

FastAPI uses `prometheus-fastapi-instrumentator` to automatically expose application metrics at `http://<backend>:8000/metrics`.

---

## 2. Deploy Prometheus & Grafana (kube-prometheus-stack)

```bash
# 1. Add Prometheus Community Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 2. Install the Prometheus Operator Stack
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  -f monitoring/prometheus-values.yaml
```

---

## 3. Apply the TaskBoard ServiceMonitor

This tells Prometheus to scrape the `taskboard-backend` service:

```bash
kubectl apply -f monitoring/servicemonitor.yaml
```

Verify the ServiceMonitor is created:
```bash
kubectl get servicemonitors -n taskboard
```

---

## 4. Access Prometheus & Grafana

### Prometheus UI
```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```
Open: [http://localhost:9090](http://localhost:9090)  
Go to **Status → Targets** to verify `taskboard-backend-monitor` is **UP (1/1)**.

### Grafana UI
```bash
kubectl port-forward svc/prometheus-grafana 3001:80 -n monitoring
```
Open: [http://localhost:3001](http://localhost:3001)  
- **Username:** `admin`
- **Password:** `prom-operator`

---

## 5. Import the TaskBoard Dashboard

1. In Grafana, click **Dashboards → New → Import**.
2. Upload `monitoring/grafana-dashboard.json` or paste its JSON content.
3. Select the Prometheus data source and click **Import**.

### What the Dashboard Visualizes:
- **Request Rate (req/s):** `sum by (handler) (rate(http_requests_total[1m]))`
- **P95 Latency:** `histogram_quantile(0.95, sum by (le, handler) (rate(http_request_duration_seconds_bucket[1m])))`
- **Error Rates (5xx):** `sum(rate(http_requests_total{status=~"5.."}[1m]))`
- **Status Codes:** Breakdown of 2xx, 4xx, and 5xx responses.

---

## 6. Key PromQL Queries for Verification

Test these queries directly inside the Prometheus Expression Browser:

```promql
# Total HTTP requests to FastAPI
http_requests_total{job="taskboard-backend-monitor"}

# Request rate per second over the last 1 minute
sum by (handler) (rate(http_requests_total{job="taskboard-backend-monitor"}[1m]))

# 95th percentile latency
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[1m])))
```
