# PART N — Kubernetes Troubleshooting Lab

This lab provides hands-on exercises to practice diagnosing common real-world Kubernetes failures.

---

## Exercise 1: Broken Container Image (`ImagePullBackOff`)

### 1. Trigger the failure
```bash
kubectl apply -f troubleshooting/broken-image.yaml
```

### 2. Observe the symptom
```bash
kubectl get pods -n taskboard
```
**Observed state:** The Pod status will show `ErrImagePull` and quickly transition into `ImagePullBackOff`.

### 3. Diagnose the root cause
```bash
# Inspect the Pod's lifecycle events
kubectl describe pod -l app=taskboard-broken-image -n taskboard

# Or view recent cluster events
kubectl get events -n taskboard --sort-by=.lastTimestamp
```
**Diagnostic finding:** Look at the `Events` section:
```text
Failed to pull image "...:v999.999-doesnotexist": rpc error: code = NotFound desc = failed to pull and unpack image ...: not found
```

### 4. Resolution
Fix the image repository/tag in the deployment or update the image using `kubectl`:
```bash
kubectl set image deployment/taskboard-broken-image backend=ghcr.io/yourusername/taskboard-backend:latest -n taskboard
```
Clean up when done:
```bash
kubectl delete -f troubleshooting/broken-image.yaml
```

---

## Exercise 2: Broken Service (`Zero Endpoints`)

### 1. Trigger the failure
```bash
kubectl apply -f troubleshooting/broken-service.yaml
```

### 2. Observe the symptom
```bash
kubectl get svc taskboard-broken-svc -n taskboard
```
The Service appears active and has an assigned `CLUSTER-IP`. However, any request routed to it will hang or return `503 Service Unavailable` / `connection refused`.

### 3. Diagnose the root cause
Inspect the endpoints backing this Service:
```bash
kubectl get endpoints taskboard-broken-svc -n taskboard
```
**Diagnostic finding:**
```text
NAME                   ENDPOINTS
taskboard-broken-svc   <none>
```
The Service has **`<none>`** endpoints because its label selector does not match any running Pod.

Inspect Pod labels in the namespace:
```bash
kubectl get pods -n taskboard --show-labels
```
Inspect what the Service is looking for:
```bash
kubectl describe svc taskboard-broken-svc -n taskboard | grep Selector
```

### 4. Resolution
Align the Service selector to match the actual Pod labels:
```bash
kubectl patch svc taskboard-broken-svc -n taskboard -p '{"spec":{"selector":{"app.kubernetes.io/name":"taskboard-backend"}}}'
```
Verify endpoints are now populated:
```bash
kubectl get endpoints taskboard-broken-svc -n taskboard
```
Clean up when done:
```bash
kubectl delete -f troubleshooting/broken-service.yaml
```
