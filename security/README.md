# PART G & Security — Defense in Depth

This directory implements automated security controls across the five key layers of the application lifecycle.

---

## The 5 Security Layers

```text
1. SAST (Static Analysis)         ──► Bandit (Code level)
2. SCA (Dependency Analysis)       ──► pip-audit (Packages level)
3. Secret Scanning                 ──► Gitleaks (Credentials level)
4. Container Vulnerability Scan    ──► Trivy (OS & Container image level)
5. Network Zero-Trust Security     ──► Kubernetes NetworkPolicies (Runtime traffic)
```

---

## 1. SAST (Static Application Security Testing) — Bandit
Scans Python source code for common security flaws (e.g. SQL injection, insecure imports):
```bash
pip install bandit
bandit -r backend/app/ --skip B104
```

---

## 2. SCA (Software Composition Analysis) — pip-audit
Scans Python dependencies against known CVE databases:
```bash
pip install pip-audit
pip-audit -r backend/requirements.txt
```

---

## 3. Container Scanning — Trivy
Scans built container images for HIGH and CRITICAL vulnerabilities:
```bash
./security/trivy-scan.sh
```
Or directly with Docker:
```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL taskboard-backend:local
```

---

## 4. Kubernetes Network Isolation — Zero Trust
Restricts pod-to-pod network traffic inside the cluster:
- Frontend can only receive external ingress traffic.
- Backend only accepts traffic from the Frontend.
- PostgreSQL only accepts database connections from the Backend.

Apply the network policies:
```bash
kubectl apply -f security/network-policy.yaml
```

Verify:
```bash
kubectl get networkpolicies -n taskboard
```
