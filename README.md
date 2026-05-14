## 🚀 CloudNotes – A DevOps-First Note-Taking SaaS Platform
- Multi-tenant, production-ready microservices SaaS built with DevOps-first principles
Designed to showcase deep real-world expertise in DevOps, GitOps, Security, CI/CD, and Cloud Infrastructure.

## 📌 Project Summary
- CloudNotes is a scalable, cloud-native, note-taking SaaS platform built using microservices and deployed on AWS EKS with full CI/CD automation. It mimics a real-world startup architecture and enables users to register, authenticate, create notes, and view analytics — all while showcasing best practices in DevSecOps, GitOps, Infrastructure-as-Code, container orchestration, and production monitoring.

## 🧱 Tech Stack Overview

|Layer|	Tools/Technologies|
|---|---|
|Frontend	|Planned: React (optional, not required for backend showcase)|
|Microservices|	Go (Note), Python (Auth), Node.js (User), Java (Analytics)|
|Databases	|PostgreSQL, MongoDB, MySQL|
|API Gateway	| NGINX Ingress Controller on EKS|
|CI/CD|	GitHub Actions, ArgoCD|
|IaC	|Terraform (AWS Infra + EKS)|
|Config Management|	Ansible (optional for bootstrap, SSH setup, DB)|
|Security	|HashiCorp Vault, Trivy, Gitleaks, tfsec, OWASP|
|Observability|	Prometheus, Grafana|
|Storage	|S3 (File Attachments, Logs), RDS|
|Secrets	|Vault + K8s Sidecar Injector|
|Git Strategy	|GitHub Flow (main, dev, preprod, feature/*)|
|Environments|	dev, preprod, prod (multi-namespace EKS)|

## 🎯 Key Features

✅ Multi-service architecture using 4 microservices  
✅ Each service deployed as a separate container on Kubernetes   
✅ GitHub Actions pipeline for building, scanning, pushing, and deploying  
✅ ArgoCD GitOps setup with Helm charts per service  
✅ Secure credential management via Vault  
✅ Pre-commit hooks for security and quality checks 
✅ Centralized logging, metrics, and health checks  
✅ Environment isolation using K8s namespaces (dev, preprod, prod)  
✅ Cost-optimized AWS Free Tier deployment (< ₹500)  

## 🛠️ DevOps Implementations
| Area |	Highlights |
|---|---|
|CI	|GitHub Actions for build, test, Trivy scan, gitleaks, Docker push|
|CD	|ArgoCD GitOps auto-sync from main or preprod|
|Infra|	Modular Terraform code with tfvars for multi-env|
|Secrets|	Vault K8s agent-injected secrets per pod|
|Security|	Trivy, OWASP Dependency-Check, tfsec, IAM roles per service|
|Monitoring	|Prometheus metrics scraping + Grafana dashboard|
|Branching	|GitHub Flow: main → preprod → dev → feature/*|
|Envs	|Terraform + ArgoCD deploys separate workloads for each stage|
|Docker	|Multi-stage secure Dockerfiles for each service|

## 📂 Microservices Breakdown

|Service|	Language	|DB	|Purpose|
|---|---|---|---|
|auth-service	|Python Flask|	PostgreSQL|	Handles login/signup, JWT, OAuth2
|note-service	|Go	|MongoDB	|CRUD for user notes
|user-service	|Node.js Express|	MySQL	|User profiles, preferences
|analytics-service|	Java Spring Boot|	S3 / Kafka	|Generates reports, tracks usage

## 🌍 Architecture Diagram
```
User → Ingress (NGINX) → Microservices → DBs
                            ↓
                     Prometheus + Vault + ArgoCD
                            ↓
                        AWS Infra via Terraform
```

## 🧪 What This Project Demonstrates

✔️ End-to-End DevOps Ownership  
✔️ Secure Software Supply Chain Practices  
✔️ GitOps + Multi-Environment Delivery  
✔️ Cloud-Native Application Deployment on AWS  
✔️ Production Observability and Monitoring  
✔️ Industry-grade Infrastructure as Code  
✔️ Highly Modular, Maintainable Codebase  

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/charan-happy/CloudNotes.git
cd CloudNotes

# Deploy infrastructure
cd terraform/environments/dev
terraform init
terraform plan
terraform apply

# Deploy to Kubernetes
kubectl apply -f kubernetes/namespaces/
kubectl apply -f kubernetes/argocd/
kubectl apply -f kubernetes/apps/
```

## 📁 Project Structure

```
CloudNotes/
├── terraform/           # Infrastructure as Code
│   ├── modules/        # Reusable Terraform modules
│   └── environments/   # dev, staging, prod configs
├── kubernetes/         # Kubernetes manifests
│   ├── argocd/        # ArgoCD installation
│   ├── ingress/       # NGINX Ingress
│   ├── namespaces/    # Namespace definitions
│   ├── services/      # Helm charts for microservices
│   ├── apps/          # ArgoCD Applications
│   └── monitoring/    # Prometheus, Grafana, Loki
├── .github/workflows/ # GitHub Actions CI/CD
└── docs/              # Architecture & runbooks
```  
