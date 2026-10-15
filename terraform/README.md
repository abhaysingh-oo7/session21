# PART H — Terraform Infrastructure as Code (AWS VPC + EKS)

This directory contains Terraform code to provision the complete AWS infrastructure for TaskBoard.

---

## Architecture Overview

```text
AWS (ap-south-1)
 └── VPC (10.0.0.0/16)
      ├── Internet Gateway
      ├── NAT Gateway (in Public Subnet 1)
      │
      ├── Public Subnet 1 (10.0.1.0/24 - ap-south-1a) ──► External ELB / Ingress
      ├── Public Subnet 2 (10.0.2.0/24 - ap-south-1b) ──► External ELB / Ingress
      │
      ├── Private Subnet 1 (10.0.10.0/24 - ap-south-1a) ──► EKS Worker Nodes
      └── Private Subnet 2 (10.0.20.0/24 - ap-south-1b) ──► EKS Worker Nodes
           └── EKS Cluster (v1.30)
                └── Managed Node Group (2x t3.medium)
```

---

## Prerequisites

1. **AWS CLI** configured with credentials:
   ```bash
   aws configure
   ```
2. **Terraform** (>= 1.5.0) installed:
   ```bash
   terraform version
   ```

---

## Step-by-Step Execution

### 1. Initialize Terraform
Downloads the AWS provider plugins:
```bash
cd terraform
terraform init
```

### 2. Validate Code Syntax & Formatting
```bash
terraform fmt -check
terraform validate
```

### 3. Generate Execution Plan
Previews the resources that will be created:
```bash
terraform plan
```

### 4. Apply / Provision Infrastructure
Creates the VPC, subnets, NAT gateway, EKS cluster, and node group:
```bash
terraform apply
```

### 5. Configure `kubectl` for EKS
After apply completes, run the command printed in the outputs:
```bash
aws eks update-kubeconfig --region ap-south-1 --name taskboard-eks
```

Verify connection to your new AWS cluster:
```bash
kubectl get nodes
```

---

## Cleanup / Teardown

To destroy all created AWS resources to avoid incurring cloud costs:
```bash
terraform destroy
```
