# CloudNotes Deployment Flow

## CI/CD Pipeline Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Commit    │───▶│    Build    │───▶│    Test     │───▶│   Security  │
│             │    │             │    │             │    │   Scanning  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                     │
                                                                     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  GitOps     │◀───│  Tag & Push │◀───│  Quality    │◀───│   Build &   │
│   Update    │    │    Image    │    │   Gate      │    │   Push      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Pipeline Stages

### 1. Build Stage
- Checkout code
- Set up Docker Buildx
- Login to Amazon ECR
- Extract metadata (tags, labels)
- Build Docker image with multi-stage build
- Push to ECR

### 2. Test Stage
- Run unit tests
- Run integration tests
- Test coverage reporting

### 3. Security Scanning
- **Trivy FS**: Scan source code for vulnerabilities
- **Trivy Image**: Scan container image
- **SonarQube**: Code quality analysis
- **Gitleaks**: Detect secrets in code

### 4. Quality Gate
- Block on HIGH/CRITICAL vulnerabilities
- Block on SonarQube quality gate failure
- Require minimum test coverage

### 5. Push to Registry
- Tag image as `latest` and commit SHA
- Push to Amazon ECR

### 6. GitOps Update
- Update image tag in GitOps repository
- Update Helm chart values
- Commit and push changes
- ArgoCD auto-syncs changes

## Environment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Environment Pipeline                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  dev ──────▶ staging ──────▶ prod                                     │
│  │              │              │                                        │
│  │              │              │                                        │
│  ▼              ▼              ▼                                        │
│ Automated    Manual         Manual +                                   │
│ deploy      promote        approval                                    │
│             to staging     to prod                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Development Environment (dev)
- Auto-deploy on commit to `main`
- Single node cluster
- No multi-AZ
- No deletion protection
- Lower resource limits

### Staging Environment (staging)
- Manual deployment
- 2-node cluster
- Full monitoring
- Integration tests

### Production Environment (prod)
- Manual deployment with approval
- 3-node cluster
- Multi-AZ enabled
- Full security
- HIPAA/GDPR compliance

## Branching Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Git Branch Flow                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  main ─────────────────────────────────────────────────────────────►   │
│   │                                                             │       │
│   │    ┌──────────────┐                                         │       │
│   │    │  pre-prod   │◀────────────────── Merge PR             │       │
│   │    │  (staging) │                        │                │       │
│   │    └──────┬───────┘                        │                │       │
│   │           │                                  │                │       │
│   │    ┌──────┴───────┐                         │                │       │
│   │    │  dev         │◀────────────────── Merge PR            │       │
│   │    │              │                         │                │       │
│   │    └──────┬───────┘                         │                │       │
│   │           │                                   │                │       │
│   │    ┌──────┴───────┐          ┌──────────────┴───────┐       │       │
│   │    │ feature/*   │          │ fix/*                │       │       │
│   │    └──────────────┘          └───────────────────────┘       │       │
│   │                                                           │       │
│   │    PR ──▶ CI Checks ──▶ Review ──▶ Merge                  │       │
│   │                                                           │       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Branch Types

| Branch | Purpose | Protected | Auto-deploy |
|--------|---------|-----------|-------------|
| main | Production code | Yes | No |
| pre-prod | Staging/UAT | Yes | Staging |
| dev | Development | Yes | Dev |
| feature/* | New features | No | No |
| fix/* | Bug fixes | No | No |

## GitOps Workflow

1. **Code Change**: Developer commits code
2. **CI Pipeline**: GitHub Actions runs build, test, scan
3. **Image Push**: New image pushed to ECR
4. **GitOps Update**: CI updates image tag in GitOps repo
5. **ArgoCD Sync**: ArgoCD detects change, syncs to cluster
6. **Verification**: Health checks pass, deployment complete

## Rollback Procedure

### Automatic Rollback
- ArgoCD automatically rolls back on sync failure
- K8s liveness probe failure triggers restart
- HPA scales down on prolonged failures

### Manual Rollback
```bash
# Rollback via ArgoCD CLI
argocd app rollback <service-name>

# Or revert Git commit and push
git revert <commit>
git push
```

## Monitoring & Alerting

### Key Metrics
- Deployment success rate
- Error rate (5xx)
- Latency (p95, p99)
- Pod restarts
- CPU/Memory utilization

### Alert Channels
- Slack: #cloudnotes-alerts (warnings)
- Slack: #cloudnotes-critical (critical)
- PagerDuty: On-call rotation (prod only)