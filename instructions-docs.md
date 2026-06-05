# CloudNotes — DevOps Implementation Playbook

> This is your living field manual. Every phase you complete, every mistake you make, every concept you learn gets recorded here.
> Updated by your senior after every question, every decision, every session.
> You implement. I guide. You learn by doing — not by watching.

---

## How this works

- I am your senior DevOps engineer. I tell you what is missing and WHY it is needed.
- You implement every single piece yourself.
- When you are stuck → ask, and I will guide you step by step.
- When you have a question → ask, and I will explain the trade-offs.
- After every conversation, I update this file with what was discussed, what you did, and what is next.
- Goal: by end of project, you can handle the full lifecycle — code to production to incident to postmortem — without help.

---

## Current status snapshot (2026-06-04)

| Area | Status | Notes |
|---|---|---|
| App code | Done | 5 services + frontend running locally |
| Docker Compose | Done | Full local stack works |
| Git branches | Done | main, dev, pre-prod, feature/auth-service, infra/terraform-init, docs |
| Branch protection | Not done | GitHub settings not configured |
| PR template | Not done | `.github/pull_request_template.md` missing |
| Pre-commit hooks | Not done | `.pre-commit-config.yaml` missing |
| CI pipeline | Not done | No `.github/workflows/` directory |
| Kubernetes | Not done | No manifests, no local cluster |
| Observability | Not done | `/metrics` endpoints exist but nothing scraping them |
| Terraform | Not done | `infra/terraform-init` branch has code, never applied |
| ArgoCD / GitOps | Not done | No setup |
| Database | Not done | All services in-memory |
| Tests | Not done | No unit tests in any service |

---

## The implementation roadmap (your order of work)

Work through these phases in order. Each phase unlocks the next. Do not skip ahead.

---

## PHASE 1 — Source Control Hygiene

**Why start here:** Everything else in DevOps depends on a clean, enforced git workflow. CI runs on PRs, GitOps watches commits, audits trace deployments to commits. If the git foundation is weak, everything built on top of it is unreliable.

### 1.1 — Branching strategy

You already have branches. Good. Here is what each branch means in enterprise:

| Branch | Purpose | Who merges | Protected? |
|---|---|---|---|
| `main` | Production code. Only ever via PR from pre-prod | Tech lead / DevOps | Yes — no direct push |
| `pre-prod` | Staging mirror. Only via PR from dev | DevOps | Yes |
| `dev` | Integration branch. Feature branches merge here | Any approved PR | Yes |
| `feature/*` | Your working branch for a specific task | You | No |
| `fix/*` | Hotfix for a specific bug | You | No |
| `infra/*` | Terraform or Kubernetes changes | You | No |
| `docs` | Documentation only | You | No |

**Branch naming convention — enforce this from now on:**
```
feature/CN-<ticket-number>-<short-description>
fix/CN-<ticket-number>-<short-description>
infra/CN-<ticket-number>-<description>

# Examples
feature/CN-47-add-prometheus-metrics
fix/CN-52-notes-cross-user-leak
infra/CN-61-terraform-vpc-module
```

### 1.2 — Commit message convention (Conventional Commits)

Every commit must follow this format:

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

Types:
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `chore` — build/tool changes (CI, deps)
- `refactor` — code change with no new feature or fix
- `test` — adding or fixing tests
- `infra` — Terraform, Kubernetes, Docker changes
- `ci` — GitHub Actions workflow changes

Examples:
```bash
feat(note-service): add pagination to GET /v1/notes
fix(auth-service): prevent cross-user token reuse
infra(terraform): add VPC module with 3 public and 3 private subnets
ci: add trivy image scan to PR workflow
```

**Why:** Conventional Commits enables automatic changelog generation, semantic versioning, and makes `git log` readable across teams.

### 1.3 — Branch protection rules (you configure this on GitHub)

On GitHub → Settings → Branches → Add protection rules for `main`, `dev`, `pre-prod`:

For `main`:
- [x] Require a pull request before merging
- [x] Require 1 approving review
- [x] Dismiss stale reviews when new commits are pushed
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- [x] Do not allow bypassing the above settings

For `dev`:
- [x] Require a pull request before merging
- [x] Require 1 approving review (can be yourself for a solo project)
- [x] Require status checks to pass (add once CI is set up)

**Why:** Without protection, anyone (including you in a rushed moment) can push broken code directly to main. Branch protection makes careless mistakes impossible.

### 1.4 — PR template (you create this file)

Create `.github/pull_request_template.md` in your repo root (on the `dev` branch):

```markdown
## What this PR does
<!-- One sentence -->

## Why
<!-- Link to ticket or explain the motivation -->

## How to test locally
<!-- Steps to test the change -->

## Checklist
- [ ] Tests added or updated
- [ ] No hardcoded secrets
- [ ] Dockerfile still builds
- [ ] `docker compose up` still works
- [ ] Documentation updated if behaviour changed
```

**Why:** Without a template, PRs look like "fixed stuff" with no context. 6 months later nobody knows why a change was made. Templates enforce discipline.

### 1.5 — Pre-commit hooks (you install and configure)

Pre-commit hooks run on your machine before every `git commit`. They catch problems before they reach CI.

Install pre-commit:
```bash
pip install pre-commit
# or
brew install pre-commit
```

Create `.pre-commit-config.yaml` in the repo root:

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: detect-private-key

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.4
    hooks:
      - id: ruff                  # Python linting (auth-service)
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/dnephin/pre-commit-golang
    rev: v0.5.1
    hooks:
      - id: go-fmt               # Go formatting (note-service)
      - id: go-vet

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.57.0
    hooks:
      - id: eslint               # JavaScript/TypeScript (analytics, frontend)
        files: \.(js|ts|tsx)$
        args: [--fix]
```

Install the hooks:
```bash
pre-commit install
pre-commit run --all-files    # test it runs clean
```

**Why gitleaks matters:** One accidental `AWS_SECRET_KEY=AKIA...` committed to a public repo → within 2 minutes bots find it → your AWS account is compromised → cryptomining bills arrive. Real incident. Happens constantly. The hook takes 100ms to run.

---

## PHASE 2 — CI Pipeline with GitHub Actions

**Why this is Phase 2:** CI is the automated gatekeeper for every PR. Without CI, code quality depends entirely on reviewer attention (which is finite). With CI, every PR is automatically checked before human review even begins.

### 2.1 — What CI must do for CloudNotes

```
PR opened or commit pushed
        │
        ├── [auth-service]     ruff lint → pytest unit tests → docker build
        ├── [note-service]     golangci-lint → go test → docker build
        ├── [user-service]     mvn checkstyle → mvn test → docker build
        ├── [analytics-service] eslint → jest unit tests → docker build
        ├── [frontend]         eslint + tsc → next build
        │
        ├── [security]         trivy scan each image → gitleaks on diff
        │
        └── [status]           all green = PR can be merged
                               any red = PR is blocked
```

### 2.2 — GitHub Actions file structure

```
.github/
└── workflows/
    ├── ci-auth-service.yml        runs on: changes to src/auth-service/**
    ├── ci-note-service.yml        runs on: changes to src/note-service/**
    ├── ci-user-service.yml        runs on: changes to src/user-service/**
    ├── ci-analytics-service.yml   runs on: changes to src/analytics-service/**
    ├── ci-frontend.yml            runs on: changes to src/frontend/**
    ├── security-scan.yml          runs on: all PRs
    └── cd-dev.yml                 runs on: merge to dev (build + push image + update values)
```

### 2.3 — Example: CI for auth-service

Create `.github/workflows/ci-auth-service.yml`:

```yaml
name: CI — auth-service

on:
  pull_request:
    paths:
      - 'src/auth-service/**'
  push:
    branches: [dev]
    paths:
      - 'src/auth-service/**'

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        working-directory: src/auth-service
        run: pip install -r requirements.txt ruff pytest

      - name: Lint
        working-directory: src/auth-service
        run: ruff check .

      - name: Unit tests
        working-directory: src/auth-service
        run: pytest -v

  docker-build:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t auth-service:${{ github.sha }} src/auth-service/

  security-scan:
    runs-on: ubuntu-latest
    needs: docker-build
    steps:
      - uses: actions/checkout@v4

      - name: Build image for scanning
        run: docker build -t auth-service:scan src/auth-service/

      - name: Trivy vulnerability scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'auth-service:scan'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
```

**You write all 5 service CI files following this same pattern.**

### 2.4 — CD pipeline (after merge to dev)

This runs only when a PR is merged to `dev`. It builds the final image, pushes it to a registry, then updates the image tag in the Kubernetes values file.

For now, push to **GitHub Container Registry (GHCR)** — it's free and already linked to your repo.

```yaml
name: CD — push image on merge to dev

on:
  push:
    branches: [dev]
    paths:
      - 'src/auth-service/**'

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: src/auth-service
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/auth-service:dev-${{ github.sha }}
            ghcr.io/${{ github.repository }}/auth-service:dev-latest
```

**Why GHCR over DockerHub:** GHCR is tied to your GitHub identity, free for public repos, and the `GITHUB_TOKEN` secret is automatically injected — no extra secrets to manage. DockerHub has rate limits and requires a separate token.

**Why `dev-${{ github.sha }}` and not `latest`:**
- `latest` gets overwritten on every push — you lose the ability to know what's running
- SHA tag makes every image unique and traceable back to the exact commit
- `kubectl describe pod` shows the exact image tag → you know the exact git commit running in any environment

### 2.5 — Secrets in GitHub Actions

Never hardcode credentials. Use GitHub Secrets (Settings → Secrets → Actions):

| Secret name | What it holds | When used |
|---|---|---|
| `GITHUB_TOKEN` | Auto-injected | GHCR push |
| `AWS_ACCESS_KEY_ID` | AWS credentials | Terraform, ECR push |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | Terraform, ECR push |
| `POSTGRES_PASSWORD` | DB password | Integration tests |

**Why not just put secrets in `.env`:** `.env` can be accidentally committed. Secrets in GitHub are encrypted, access-logged, and never appear in build logs.

---

## PHASE 3 — Local Kubernetes (kind)

**Why before AWS:** Kubernetes on AWS costs money and has longer feedback loops. kind (Kubernetes IN Docker) runs a full cluster on your laptop in 30 seconds, costs nothing, and is disposable. Learn every kubectl command here before touching EKS.

### 3.1 — Install tools (do this first)

```bash
# kind — local kubernetes cluster in docker
brew install kind

# kubectl — kubernetes CLI
brew install kubectl

# helm — kubernetes package manager
brew install helm

# kubectx + kubens — fast context and namespace switching
brew install kubectx

# k9s — terminal UI for kubernetes (optional but great)
brew install k9s
```

### 3.2 — Create a local cluster

```bash
kind create cluster --name cloudnotes --config kind-config.yaml
```

Create `kind-config.yaml` in the repo root:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
```

Verify it works:
```bash
kubectl cluster-info --context kind-cloudnotes
kubectl get nodes
```

You should see 3 nodes (1 control-plane, 2 workers) all in Ready state.

### 3.3 — Namespace strategy

In Kubernetes, namespaces provide logical isolation. Think of them as virtual clusters within the cluster.

```bash
kubectl create namespace cloudnotes-dev
kubectl create namespace cloudnotes-staging
kubectl create namespace monitoring        # prometheus + grafana
kubectl create namespace argocd
```

**Convention:** all CloudNotes services run in `cloudnotes-dev` on local. On AWS EKS, same namespaces exist.

### 3.4 — Write Kubernetes manifests

For each service, you need minimum 3 files:

**Deployment** — tells Kubernetes how to run your container:
```yaml
# kubernetes/auth-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: cloudnotes-dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
        - name: auth-service
          image: ghcr.io/YOUR_USERNAME/cloudnotes/auth-service:dev-latest
          ports:
            - containerPort: 8000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: cloudnotes-secrets
                  key: DATABASE_URL
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /v1/health-status
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /v1/health-status
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 10
```

**Service** — exposes the deployment inside the cluster:
```yaml
# kubernetes/auth-service/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: cloudnotes-dev
spec:
  selector:
    app: auth-service
  ports:
    - port: 8000
      targetPort: 8000
  type: ClusterIP
```

**Key concepts to understand:**
- `Deployment` = desired state. Kubernetes ensures the right number of healthy pods are always running.
- `Service` = stable DNS name. Other services call `http://auth-service:8000`. They don't care which pod answers.
- `ClusterIP` = internal only. Use `Ingress` to expose outside.
- `requests` = guaranteed minimum. `limits` = hard maximum. OOMKilled = pod exceeded memory limit.
- `livenessProbe` = if this fails, restart the pod. `readinessProbe` = if this fails, stop sending traffic to this pod.

### 3.5 — Apply and verify

```bash
kubectl apply -f kubernetes/auth-service/
kubectl get pods -n cloudnotes-dev
kubectl get svc -n cloudnotes-dev
kubectl logs -n cloudnotes-dev deployment/auth-service
kubectl describe pod -n cloudnotes-dev <pod-name>  # use this to debug failures
```

**Debugging commands you will use constantly:**
```bash
kubectl describe pod <name>         # events section tells you WHY it failed
kubectl logs <pod-name>             # stdout/stderr from the container
kubectl logs <pod-name> --previous  # logs from crashed pod
kubectl exec -it <pod-name> -- sh   # shell inside the running container
kubectl get events -n cloudnotes-dev --sort-by=.lastTimestamp
```

---

## PHASE 4 — Observability Stack

**Why before production:** You cannot run production software you cannot observe. If something breaks and you have no metrics, no logs, and no alerts, you are blind. Observability must exist BEFORE your first real deployment, not after.

### 4.1 — What you are setting up

```
Your services expose /metrics (Prometheus format)
        │
Prometheus scrapes /metrics every 15s
        │
Grafana queries Prometheus to display dashboards
        │
Loki collects logs from all pods
        │
Alertmanager fires alerts when thresholds are crossed
        │
PagerDuty / Slack receives the alert
```

### 4.2 — Install with Helm (kube-prometheus-stack)

The `kube-prometheus-stack` Helm chart installs Prometheus + Alertmanager + Grafana + a set of pre-built dashboards, all in one command.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=cloudnotes
```

Access Grafana locally:
```bash
kubectl port-forward -n monitoring svc/monitoring-grafana 3001:80
# open http://localhost:3001 — login: admin / cloudnotes
```

### 4.3 — Wire your services to Prometheus

Your services already expose `/metrics`. You need to tell Prometheus where to scrape them.

Create a `ServiceMonitor` resource for each service:

```yaml
# kubernetes/auth-service/servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: auth-service
  namespace: monitoring
  labels:
    release: monitoring    # must match the helm release label
spec:
  namespaceSelector:
    matchNames:
      - cloudnotes-dev
  selector:
    matchLabels:
      app: auth-service
  endpoints:
    - port: http
      path: /metrics
      interval: 15s
```

### 4.4 — The 4 Golden Signals dashboard

Build this in Grafana. These 4 panels are the minimum for any production service:

**Panel 1 — Request rate (Traffic):**
```
rate(http_requests_total{job="auth-service"}[5m])
```

**Panel 2 — Error rate:**
```
rate(http_requests_total{job="auth-service", status=~"5.."}[5m])
/
rate(http_requests_total{job="auth-service"}[5m])
```

**Panel 3 — P95 Latency:**
```
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket{job="auth-service"}[5m])
)
```

**Panel 4 — Saturation (CPU):**
```
rate(container_cpu_usage_seconds_total{container="auth-service"}[5m])
```

**What to look for:**
- Error rate spikes → something is broken
- Latency spike without traffic spike → slowness in a dependency (usually DB)
- Traffic spike → investigate if planned or unexpected
- Saturation > 80% → consider scaling

### 4.5 — Alerting rules

Create `kubernetes/monitoring/alerting-rules.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: cloudnotes-alerts
  namespace: monitoring
spec:
  groups:
    - name: cloudnotes.rules
      rules:
        - alert: HighErrorRate
          expr: |
            rate(http_requests_total{status=~"5.."}[2m])
            / rate(http_requests_total[2m]) > 0.05
          for: 2m
          labels:
            severity: critical
          annotations:
            summary: "High error rate on {{ $labels.job }}"
            description: "Error rate is {{ $value | humanizePercentage }}"

        - alert: HighLatency
          expr: |
            histogram_quantile(0.95,
              rate(http_request_duration_seconds_bucket[5m])
            ) > 0.5
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "P95 latency above 500ms on {{ $labels.job }}"

        - alert: PodCrashLooping
          expr: |
            rate(kube_pod_container_status_restarts_total[10m]) > 0.3
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "Pod {{ $labels.pod }} is crash-looping"
```

---

## PHASE 5 — GitOps with ArgoCD

**Why GitOps over plain CI/CD push:** In a push-based CD pipeline, your CI server runs `kubectl apply`. This means your CI server has cluster credentials and can do anything to the cluster. If CI is compromised, your cluster is compromised. GitOps inverts this: ArgoCD runs inside the cluster, watches a git repo, and pulls changes. No external system has cluster credentials.

**Second reason:** Your cluster state is always the git state. If someone manually runs `kubectl` and changes something, ArgoCD detects the drift and can auto-correct it. This is called self-healing.

### 5.1 — Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for all pods to be ready
kubectl get pods -n argocd -w

# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Access the UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# open https://localhost:8080 — login: admin / <password above>
```

### 5.2 — Application manifest

An ArgoCD Application tells ArgoCD what to deploy and where to watch:

```yaml
# kubernetes/argocd/auth-service-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: cloudnotes-auth-service
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/YOUR_USERNAME/CloudNotes
    targetRevision: dev
    path: kubernetes/auth-service
  destination:
    server: https://kubernetes.default.svc
    namespace: cloudnotes-dev
  syncPolicy:
    automated:
      prune: true       # delete resources removed from git
      selfHeal: true    # revert manual kubectl changes
    syncOptions:
      - CreateNamespace=true
```

Apply it:
```bash
kubectl apply -f kubernetes/argocd/auth-service-app.yaml
```

### 5.3 — What happens on a code change (full GitOps flow)

```
1. You push code to feature branch
2. You open PR → CI runs lint + test + build
3. PR approved + CI green → merge to dev
4. CD pipeline fires:
      docker build auth-service
      tag: ghcr.io/yourname/cloudnotes/auth-service:dev-abc1234
      push to GHCR
5. CD pipeline updates kubernetes/auth-service/deployment.yaml:
      image: ghcr.io/yourname/cloudnotes/auth-service:dev-abc1234
      commits this change to the dev branch
6. ArgoCD detects git changed (polls every 3 min or via webhook)
7. ArgoCD runs kubectl apply with the new manifest
8. Rolling update begins: new pod starts, passes readiness probe, old pod terminates
9. ArgoCD reports: Synced + Healthy
```

This is the full GitOps loop. Every deployment is a git commit. Every rollback is a git revert. Full audit trail.

---

## PHASE 6 — Terraform & AWS Infrastructure

**Why Terraform over clicking in the AWS console:**
- Clicking in the console = you can't reproduce it, can't review it, can't audit who changed what
- Terraform = infrastructure is code, in git, reviewed in PRs, applied repeatably
- If your AWS account is compromised and deleted, you can recreate everything from code in 30 minutes

### 6.1 — Remote state backend (do this before anything else)

Terraform state tracks what it created. By default it's a local file (`terraform.tfstate`). Problems:
- If the file is lost, Terraform doesn't know what it created
- If two people run Terraform at the same time, state is corrupted

Solution: remote state in S3 with a DynamoDB lock table.

You will create these manually once (bootstrap problem — you need AWS resources to manage AWS resources with Terraform):

```bash
# Create S3 bucket for state (replace YOUR_UNIQUE_NAME)
aws s3api create-bucket \
  --bucket cloudnotes-terraform-state-YOUR_UNIQUE_NAME \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
  --bucket cloudnotes-terraform-state-YOUR_UNIQUE_NAME \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name cloudnotes-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

Then in `terraform/backend.tf`:
```hcl
terraform {
  backend "s3" {
    bucket         = "cloudnotes-terraform-state-YOUR_UNIQUE_NAME"
    key            = "cloudnotes/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "cloudnotes-terraform-lock"
    encrypt        = true
  }
}
```

### 6.2 — Infrastructure modules to build

```
terraform/
├── backend.tf
├── main.tf           # module calls
├── variables.tf
├── outputs.tf
├── terraform.tfvars  # actual values (gitignored for sensitive ones)
└── modules/
    ├── vpc/          # VPC + subnets + NAT + IGW
    ├── eks/          # EKS cluster + managed node groups
    ├── rds/          # RDS PostgreSQL instance
    └── secrets/      # AWS Secrets Manager entries
```

### 6.3 — The order matters

```
1. VPC first         (EKS and RDS go inside the VPC)
2. EKS second        (needs VPC subnets)
3. RDS third         (needs VPC, private subnets)
4. Secrets fourth    (needs nothing, but used by EKS pods)
```

**Never run `terraform apply` without `terraform plan` first.**
`terraform plan` shows exactly what will be created, changed, or destroyed. Review it. If it says "destroy" on something you didn't intend, stop and investigate.

### 6.4 — Terraform workflow

```bash
terraform init              # download providers, configure backend
terraform fmt               # format all .tf files (run before every commit)
terraform validate          # syntax check
terraform plan              # show what will change (ALWAYS review this)
terraform apply             # apply the changes
terraform destroy           # tear everything down (CAREFUL — this costs money to recreate)
```

**Cost awareness:** An EKS cluster + 2 t3.medium nodes + a db.t3.micro RDS instance costs approximately $5–10/day. Always `terraform destroy` when you are done for the day while learning.

---

## PHASE 7 — Database Migration (in-memory → PostgreSQL)

**Why this is its own phase:** Changing the data layer is the highest-risk change in any system. Done wrong: data loss, downtime, impossible rollback. Done right: zero-downtime migration with full rollback capability.

### 7.1 — Migration strategy

For CloudNotes (zero existing users), the approach is simple:
1. Add the Alembic/Flyway/migrate migration tool to each service
2. Write migration scripts (CREATE TABLE, not manual SQL)
3. On startup, the service runs `migrate up` automatically
4. The service only starts serving traffic after migrations succeed

**Why migration tools instead of raw SQL scripts:**
- Migration tools track which scripts have run (in a `schema_migrations` table)
- Running migrations twice is safe (idempotent)
- Rollback is `migrate down` — which runs the reverse SQL

### 7.2 — Migration tools per service

| Service | Language | Tool | Command |
|---|---|---|---|
| auth-service | Python | Alembic | `alembic upgrade head` |
| note-service | Go | golang-migrate | `migrate -path ./migrations up` |
| user-service | Java | Flyway (built into Spring) | Auto-runs on startup |
| analytics-service | Node.js | db-migrate or Knex | `npx db-migrate up` |

### 7.3 — Order of operations for auth-service

1. Add `alembic` and `psycopg2-binary` to `requirements.txt`
2. Run `alembic init migrations` in `src/auth-service/`
3. Write `migrations/versions/001_create_users_table.py`
4. Replace the Python dict with SQLAlchemy ORM calls
5. Test locally with `docker compose up postgres` then `alembic upgrade head`

---

## PHASE 8 — Production Hardening

Once deployed to EKS and working, apply these before calling it production-ready:

### 8.1 — Resource limits (you must set these)

Every pod must have `resources.requests` and `resources.limits` set. Without limits, one misbehaving pod can starve the entire node.

Sizing guide for CloudNotes services on t3.medium (2 vCPU, 4GB RAM):

| Service | CPU request | CPU limit | Memory request | Memory limit |
|---|---|---|---|---|
| auth-service | 50m | 200m | 64Mi | 256Mi |
| note-service | 100m | 500m | 128Mi | 512Mi |
| user-service | 200m | 1000m | 256Mi | 768Mi |
| analytics-service | 50m | 200m | 64Mi | 256Mi |
| frontend | 100m | 500m | 128Mi | 512Mi |

### 8.2 — Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: note-service-hpa
  namespace: cloudnotes-dev
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: note-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

**Why minReplicas: 2 (not 1):** A single pod means any pod restart = brief downtime. Two pods means one pod can restart while the other keeps serving traffic.

### 8.3 — Pod Disruption Budget (PDB)

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: note-service-pdb
  namespace: cloudnotes-dev
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: note-service
```

**Why:** Without a PDB, Kubernetes can evict all your pods at once during a node drain (maintenance). PDB says "always keep at least 1 pod running."

### 8.4 — Network Policies

By default, all pods can talk to all other pods in Kubernetes. This is a security risk.

Network policies define which pods can talk to which:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: auth-service-netpol
  namespace: cloudnotes-dev
spec:
  podSelector:
    matchLabels:
      app: auth-service
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend      # only frontend can call auth-service
      ports:
        - port: 8000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres      # auth-service can only call postgres
      ports:
        - port: 5432
```

---

## PHASE 9 — Load Testing & Incident Practice

**Why:** You cannot know your system's limits until you hit them. Load tests reveal the bottleneck before users do.

### 9.1 — k6 load test

Install k6:
```bash
brew install k6
```

Create `load-tests/notes-api.js`:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // ramp up to 50 users
    { duration: '3m', target: 50 },    // stay at 50 users
    { duration: '1m', target: 200 },   // ramp up to 200 users
    { duration: '3m', target: 200 },   // stay at 200 users
    { duration: '1m', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // less than 1% failure rate
  },
};

export default function () {
  const res = http.get('http://localhost:8001/v1/health-status');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
```

Run it:
```bash
k6 run load-tests/notes-api.js
```

**Watch Grafana while k6 is running.** See the traffic panel increase, latency curve change, CPU saturation rise. This is how you learn what your system actually does under load.

### 9.2 — Intentional failure exercise

Do this once the Kubernetes + observability stack is set up:

```bash
# Kill the note-service deployment
kubectl scale deployment note-service -n cloudnotes-dev --replicas=0

# Watch what happens in Grafana — error rate spike
# Watch AlertManager fire the HighErrorRate alert
# Check Loki for the last error logs before the pod died

# Restore it
kubectl scale deployment note-service -n cloudnotes-dev --replicas=2
```

Then write a postmortem (even though it was intentional). Practice the format.

---

## Session log

### 2026-06-04 — DevOps journey begins

**What happened this session:**
- User asked to implement full DevOps process from scratch
- Senior (Claude) established mentor mode: user implements, senior guides and documents
- User created the `docs` branch independently — first git task completed correctly
- User created `instructions-docs.md` as the living playbook — this file
- Senior updated `CLAUDE.md` with behaviour rules: always stash → docs → write → return

**What was clarified:**
- User is DevOps engineer, 4.5 years, wants to relearn deeply as if enterprise
- Goal: full lifecycle competency without needing help
- Approach: do every step yourself, ask only when stuck

**Next task for user:**
Start Phase 1 — Source Control Hygiene:
1. Go to GitHub → Settings → Branches → configure protection rules for `main` and `dev`
2. Create `.github/pull_request_template.md` on the `dev` branch
3. Install pre-commit (`brew install pre-commit`) and create `.pre-commit-config.yaml`
4. Run `pre-commit run --all-files` and fix any issues it finds

When you have done these 4 things, come back and tell me what happened.

---

### 2026-06-05 — GitHub access + repository setup

**What happened this session:**
- User got GitHub repo access as the DevOps engineer
- Senior explained the correct order: configure repo settings → verify local runs → write CI
- User created branch protection **Rulesets** (modern GitHub feature, better than old branch protection rules)
  - `dev-ruleset` — 2 rules targeting `dev` branch
  - `main-ruleset` — 3 rules targeting `main` branch
- Senior explained why Squash-only merge strategy and auto-delete head branches matter

**Key concept learned — Rulesets vs Branch Protection Rules:**
- GitHub Rulesets (new) = can target multiple branches by pattern, can be layered, can be bypassed by specific roles, push rules supported
- Branch Protection Rules (old, being deprecated) = one rule per branch, less flexible
- Both achieve the same goal. Rulesets are the correct choice for new repos going forward.

**What still needs verification:**
- Confirm exact rules inside each ruleset are correct (see Phase 1.3 in this file)
- Merge strategy setting (squash-only) — configured under Settings → General, not Rulesets
- Auto-delete head branches — same location

**Next tasks in order:**
1. Verify ruleset rules match the Phase 1.3 checklist
2. Settings → General → set squash-only merge + auto-delete head branches
3. Create `.github/pull_request_template.md` on `dev` branch
4. Install pre-commit + create `.pre-commit-config.yaml`
5. Run `docker compose up --build` and verify all services healthy

---

*Every session adds a new entry to this log. Every question asked gets answered here for future reference.*
