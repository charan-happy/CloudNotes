# CloudNotes Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 AWS Cloud                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         VPC (10.0.0.0/16)                          │    │
│  │                                                                     │    │
│  │  ┌──────────────────┐    ┌─────────────────────────────────────┐  │    │
│  │  │   Public Subnet  │    │         Private Subnet             │  │    │
│  │  │   (AZ1, AZ2)     │    │         (AZ1, AZ2)                  │  │    │
│  │  │                  │    │                                     │  │    │
│  │  │  ┌────────────┐  │    │  ┌──────────────────────────────┐ │  │    │
│  │  │  │    ALB     │  │    │  │         EKS Cluster           │ │  │    │
│  │  │  │            │  │    │  │                               │ │  │    │
│  │  │  └─────┬──────┘  │    │  │  ┌─────┐ ┌─────┐ ┌─────┐   │ │  │    │
│  │  │        │         │    │  │  │Node1│ │Node2│ │Node3│   │ │  │    │
│  │  │        │         │    │  │  └─────┘ └─────┘ └─────┘   │ │  │    │
│  │  │        │         │    │  │                               │ │  │    │
│  │  │        └─────────┼───┼──┼───────────────────────────────┘ │  │    │
│  │  │                  │    │  │                                     │  │    │
│  │  │                  │    │  │  ┌─────────────────────────────────┘ │  │    │
│  │  │                  │    │  │  │                                   │  │    │
│  │  │    ┌────────────┴┐   │    │  │   ┌────────────────────────────┐ │  │    │
│  │  │    │  NAT GWs    │   │    │  │   │        Services             │ │  │    │
│  │  │    │  (AZ1, AZ2) │   │    │  │   │  auth│note│user│analytics   │ │  │    │
│  │  │    └────────────┘   │    │  │   └────────────────────────────┘ │  │    │
│  │  │                     │    │  │                                   │  │    │
│  │  └─────────────────────┘    │  │   ┌────────────────────────────┐  │  │    │
│  │                             │    │   │      Monitoring Stack     │  │  │    │
│  │   ┌───────────────┐         │    │   │ prometheus│grafana│loki  │  │  │    │
│  │   │    IGW       │         │    │   └────────────────────────────┘  │  │    │
│  │   └───────────────┘         │    │                                   │  │    │
│  │                             │    └───────────────────────────────────┘  │    │
│  │                             │                                            │    │
│  └─────────────────────────────┘                                            │    │
│                                                                             │    │
│  ┌────────────────┐   ┌────────────┐   ┌──────────┐   ┌────────────┐     │    │
│  │  Route 53 DNS  │   │ ACM TLS    │   │    S3    │   │ SecretsMgr │     │    │
│  └────────────────┘   └────────────┘   └──────────┘   └────────────┘     │    │
│                                                                             └────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

## Microservices Architecture

```
                    ┌─────────────────┐
                    │  User / Client  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   NGINX Ingress │
                    │   (ALB + TLS)   │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ Auth Service│   │ Note Service│   │User Service │
    │  (Python)   │   │    (Go)     │   │  (Node.js)  │
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                 │                 │
           │          ┌──────┴──────┐          │
           │          │             │          │
           ▼          ▼             ▼          ▼
      ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
      │PostgreSQL│ │ MongoDB  │ │  MySQL  │ │    S3    │
      │(Auth DB) │ │(Notes DB)│ │(Users)  │ │(Analytics)│
      └─────────┘ └──────────┘ └─────────┘ └──────────┘
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Cloud Provider | AWS |
| Container Orchestration | Kubernetes (EKS) |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| GitOps | ArgoCD |
| Service Mesh | None (lightweight) |
| Ingress | NGINX Ingress Controller |
| Monitoring | Prometheus + Grafana |
| Logging | Loki + Promtail |
| Secrets | AWS Secrets Manager |
| Container Scanning | Trivy |
| Code Quality | SonarQube |

## Network Architecture

- **VPC CIDR**: 10.0.0.0/16 (customizable per environment)
- **Public Subnets**: 10.0.0.0/20, 10.0.16.0/20 (2 AZs)
- **Private Subnets**: 10.0.32.0/20, 10.0.48.0/20 (2 AZs)
- **EKS Service CIDR**: 172.20.0.0/16
- **VPC Endpoints**: S3, ECR API, ECR DKR, Secrets Manager, CloudWatch Logs

## Security Architecture

- **Encryption at Rest**: KMS keys for all data stores
- **Encryption in Transit**: TLS 1.2+ for all traffic
- **IAM**: IRSA (IAM Roles for Service Accounts) for pod-level permissions
- **Security Groups**: Minimal access, least privilege
- **Container Scanning**: Trivy in CI pipeline
- **Network Policies**: Kubernetes network policies for pod-to-pod communication
- **RBAC**: Namespace-scoped roles with least privilege

## High Availability

- **Multi-AZ**: Services deployed across 2 availability zones
- **RDS**: Multi-AZ for production (optional for dev/staging)
- **EKS**: Node groups spread across AZs
- **ALB**: Cross-zone load balancing enabled
- **Auto-scaling**: HPA based on CPU/memory metrics
- **Self-healing**: Liveness and readiness probes

## Disaster Recovery

- **RDS Backups**: Daily automated backups with 7-30 day retention
- **S3 Versioning**: Enabled for all buckets
- **EKS Backup**: etcd snapshots via Velero (optional)
- **RTO**: 4 hours (target)
- **RPO**: 1 hour (target)