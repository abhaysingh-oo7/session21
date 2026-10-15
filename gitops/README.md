# GitOps Deployment with ArgoCD

GitOps is an operational model where the **Git repository is the single source of truth** for infrastructure and application state.

---

## Architecture

```text
Developer Git Push
        │
        ▼
   GitHub Repository (session21)
   └── helm/taskboard/ (Desired State)
        ▲
        │ (Polls & Watches Git)
        │
     ArgoCD
        │
        ▼ (Reconciles & Syncs)
   Kubernetes Cluster (Actual State)
```

---

## 1. Prerequisites (Install ArgoCD)

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

## 2. Deploy TaskBoard via GitOps

Apply the ArgoCD Application resource:

```bash
kubectl apply -f gitops/application.yaml
```

Inspect the application state:

```bash
kubectl get applications -n argocd
```

---

## 3. GitOps Principles Demonstrated:
1. **Declarative Descriptions:** Everything stored in Git as Helm charts / Kubernetes manifests.
2. **Version Controlled & Immutable:** Every Git commit SHA acts as a reproducible release version.
3. **Automated Pull (Self-Healing):** If a pod or service is manually edited or deleted by mistake, ArgoCD automatically detects drift and restores the desired state from Git.
