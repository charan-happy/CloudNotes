# Instructions & Learning Journal — CloudNotes

> Living document. Every question asked, every decision made, every concept learned goes here.
> This is your personal DevOps field manual built from real experience on this project.

---

## Session Log

### Jun 3–4 2026 — Project bootstrap

**Questions asked this session:**
- Build a Next.js frontend for the Python auth backend
- Add register page, make login creative (split-screen)
- Rich text editor (TipTap): bold/italic/tables/code/images/videos
- Dark/light themes — app-wide and per-note independently
- Export notes as Markdown, HTML, JSON; full backup/restore
- Add Go note-service, Java user-service, Node analytics-service
- Multi-stage Dockerfiles for all 4 services
- docker-compose.yml for full local stack
- Fix: note colour gradient overlapping with title text
- Fix: marquee text invisible on both themes
- Fix: notes leaking across users (localStorage key not user-scoped)
- Move live editor demo above/right of CTAs on landing page
- Add Excalidraw / Miro embed button to editor toolbar
- Architecture diagram: show AWS infra inside a note mockup
- Update /health page to show all 4 services (was only showing auth)
- Create CLAUDE.md for context persistence across sessions
- **"How does a real enterprise DevOps workflow look end to end?"** ← Section 3

---

## Section 1 — Goal by end of project

- [ ] Full lifecycle hands-on: idea → ticket → code → PR → CI → staging → prod
- [ ] Real observability: Prometheus + Grafana, see req/sec and latency live
- [ ] Experience a scalability problem and solve it (HPA, connection pooling)
- [ ] Deploy to a real Kubernetes cluster (EKS or local kind/minikube)
- [ ] Run Terraform and actually provision AWS infra
- [ ] Set up ArgoCD and do a real GitOps deploy
- [ ] Write a postmortem after a self-inflicted incident
- [ ] Understand SLOs, error budgets, and toil from an SRE lens
- [ ] System design thinking: trade-offs, CAP theorem, sync vs async

---

## Section 2 — Decisions made and why

| Decision | Alternative | Reason |
|---|---|---|
| Next.js 16 | Vite+React, Express+EJS | SSR, Docker standalone, most enterprise-relevant |
| TipTap editor | Quill, Slate.js | ProseMirror under the hood, React-native, extensible |
| In-memory stores first | PostgreSQL day 1 | Ship shape first, replace internals — mirrors real startup pace |
| Per-user localStorage key | Single global key | User X must never see User Y's notes — data isolation |
| Fake tokens (not JWT) | JWT from day 1 | Get the API shape right, swap auth later |
| Go for note-service | Rust, Node.js | Fast, goroutines for future real-time, industry standard |
| Java Spring Boot for users | Kotlin, Quarkus | Enterprise standard — most companies still run Spring |
| Node.js for analytics | Python, Go | Event-driven fits Node's async model; matches frontend stack |

---

## Section 3 — Enterprise DevOps: Code to Production (full walkthrough)

### The question
> "Code is pushed to dev branch. What happens next in a real enterprise?"

---

### Phase 0 — Ticketing (before any code)

Nothing starts with just coding. In a real enterprise:

1. Product Manager raises requirement → creates an **Epic** in Jira/Linear
2. Epic → **Stories** → **Tasks** assigned to engineers
3. DevOps tasks look like: "Add Prometheus scraping to note-service", "Configure HPA"
4. Each ticket has **priority** (P0=fire now, P1=this sprint, P2=backlog), story points, and an owner
5. Branch naming convention enforced: `feature/CN-47-add-prometheus-metrics` or `fix/CN-52-notes-cross-user-leak`

**Why it matters:** Every deployment traces back to a ticket. Incident + ticket + postmortem = audit trail. Compliance, security reviews, and post-incident analysis all require this.

---

### Phase 1 — Local development

```bash
git checkout -b feature/CN-47-add-prometheus-metrics
# write code...
git add . && git commit -m "feat: add prometheus metrics to note-service"
```

Before the commit lands, **pre-commit hooks** fire:
- `gitleaks` — blocks if hardcoded AWS keys, passwords found
- `golangci-lint` / `ruff` / `eslint` — linting and formatting
- `terraform fmt` — keeps IaC consistent
- Unit tests fast subset — catches obvious breakage early

If any hook fails → commit is **blocked**. Fix it first.

**Why:** One leaked AWS key in a public repo = real incident. Companies have paid 6-figure fines. Pre-commit hooks are the cheapest defence.

---

### Phase 2 — Pull Request

Developer opens PR from `feature/CN-47` → `dev`.

PR template enforces:
- What changed and why (Jira ticket link)
- How to test locally
- Screenshots if it's a UI change
- Checklist: tests added? docs updated? breaking change? runbook updated?

**Branch protection rules on `dev` and `main`:**
- Minimum 2 reviewer approvals required
- All CI status checks must pass
- Direct push disabled — always via PR
- Commits must be signed

---

### Phase 3 — CI Pipeline (GitHub Actions fires on PR)

```
PR opened
    │
    ├── build          docker build (catches import errors, compile errors)
    ├── unit-tests     go test ./... | pytest | mvn test
    ├── lint           golangci-lint, ruff, eslint
    ├── security       trivy image scan (CVE check on base image + deps)
    │                  gitleaks (secret scan on entire diff)
    │                  tfsec (Terraform security scan)
    ├── coverage       must be ≥ 80% or PR is blocked
    └── integration    docker-compose up, run API tests against real services
```

Any red → developer **cannot merge** until fixed.

**Real example:** Trivy finds `CVE-2024-XXXX HIGH` in your Go base image `golang:1.24-alpine`. CI blocks the PR. You bump to `golang:1.25-alpine` where it is patched. Only then does CI go green.

This is not optional bureaucracy. This is how CVEs in production get prevented before they happen.

---

### Phase 4 — Code Review

Two senior engineers review:
- **Correctness:** Does it do what the ticket says?
- **Security:** SQL injection? Hardcoded credentials? Overly broad IAM permissions?
- **Performance:** N+1 DB queries? No pagination? Blocking goroutines?
- **Observability:** Prometheus metrics added? Structured logs? Trace IDs propagated?
- **Operability:** If this breaks at 3am, is there a runbook? Is the error message actionable?

Back-and-forth on inline comments is normal. 2–5 review rounds for significant changes.

**This catches more bugs than tests do.** Tests check what you thought of. Reviewers catch what you didn't think of.

---

### Phase 5 — Merge to `dev` + auto-deploy via GitOps

PR approved + CI green → merge happens.

GitHub Actions CD pipeline triggers:

```
merge to dev
    │
    ├── docker build note-service
    ├── tag image: note-service:dev-a3f4b12    ← git short SHA, not "latest"
    ├── push to ECR (AWS Elastic Container Registry)
    │
    ├── update GitOps repo:
    │     kubernetes/services/note-service/values-dev.yaml
    │       image.tag: dev-a3f4b12             ← this is the GitOps commit
    │
    └── ArgoCD detects the git change
              └── kubectl apply -n dev (rolling update)
                        └── smoke tests run
                                  └── Slack: "note-service:dev-a3f4b12 deployed to dev ✅"
```

**Key insight — why `dev-a3f4b12` not `latest`:**
- `latest` is overwritten on every push. You lose history.
- Git SHA as tag = every image is unique and traceable.
- `kubectl describe pod note-service-xyz` shows exact git commit that is running.
- Rollback = change the tag back in the GitOps repo. One `git revert` = one rollback.

**Key insight — GitOps separation:**
ArgoCD does NOT watch your application code repo directly. It watches a **GitOps config repo** (sometimes same repo, separate folder). When image tag changes in that config → ArgoCD syncs cluster to match git. Your deployment history is literally your git log. Auditors love this.

---

### Phase 6 — Dev Environment

Dev is low-fidelity. It's perpetually broken by developers testing things.
- No SLA. It's allowed to be down.
- QA starts basic testing here.
- Lighter monitoring — just enough to see obvious failures.
- Data is fake/seeded, not real user data.

---

### Phase 7 — Promotion to Staging

Someone (DevOps or tech lead) opens a PR: `dev` → `staging`.

Staging is a **production mirror**:
- Same instance sizes (m5.large, not t3.micro)
- Same database schema (different data)
- Same secrets management (Vault or Secrets Manager)
- Full observability stack (Prometheus, Grafana, Loki, Jaeger)
- Real-ish load (sometimes replayed from prod)

After merge → ArgoCD deploys to `staging` namespace. Then:
- **Load tests** run (k6 or Locust): can we handle 1000 concurrent users?
- **Performance baseline** established: P95 latency at X rps = Y ms
- **Regression tests** run: no existing feature broke?
- **Security pen test** for major releases (quarterly or on-demand)
- **Stakeholder demo** if it's a customer-visible feature

---

### Phase 8 — Production Deployment

This is where process matters most.

**Prerequisites before touching prod:**
1. Change ticket created in ITSM (ServiceNow, Jira SM)
2. Deployment window agreed: "Tuesday 14:00–16:00 IST" (chosen because traffic is lowest)
3. Rollback plan written and reviewed
4. Relevant engineers on standby: DevOps + backend + on-call
5. Senior engineer approves the change ticket

**Deployment strategies** (choose based on risk level):

| Strategy | How it works | Rollback | When to use |
|---|---|---|---|
| Rolling update | Replace pods one at a time | Re-deploy old tag | Most releases |
| Blue/Green | Run both versions, flip traffic atomically | Flip back | Zero-downtime critical releases |
| Canary | Send 5% → 25% → 100% traffic gradually | Reduce weight to 0 | High-risk features, A/B testing |

**What the DevOps engineer has open during the deployment:**
- Grafana: request rate, error rate, P95 latency — watching for anomalies
- `kubectl get pods -n prod -w` — watching pod rollout
- Loki: tail logs for ERROR-level entries
- ArgoCD UI: watching sync status
- Rollback command ready to paste

**If error rate spikes above threshold → rollback immediately, no debate:**
```bash
argocd app rollback cloudnotes-note-service 1   # roll back to previous
# or
git revert <the GitOps commit> && git push       # ArgoCD auto-syncs
```

---

### Phase 9 — The Four Golden Signals (what you watch in production)

From the Google SRE Book. Memorise these.

| Signal | What it measures | Prometheus query |
|---|---|---|
| **Latency** | How slow are requests? | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` |
| **Traffic** | How many requests/sec? | `rate(http_requests_total[5m])` |
| **Errors** | What fraction fail? | `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])` |
| **Saturation** | How close to the limit? | `container_cpu_usage_seconds_total` / `container_memory_usage_bytes` |

**Alerts to configure** (AlertManager → PagerDuty for CRITICAL, Slack for WARNING):

| Alert | Condition | Severity |
|---|---|---|
| High error rate | error_rate > 5% for 2min | CRITICAL |
| Latency spike | P95 > 500ms for 5min | WARNING |
| Pod crash loop | restarts > 3 in 10min | CRITICAL |
| Service unreachable | /v1/health-status non-200 for 1min | CRITICAL |
| Memory pressure | usage > 85% of limit | WARNING |
| Disk space low | PV usage > 85% | WARNING |

---

### Phase 10 — Incident Response (3am)

PagerDuty fires. What do you do?

```
1. Acknowledge the alert (stops escalation timer)
2. Open the runbook for that specific alert
3. Open Grafana → 4 golden signals → which service? when did it start?
4. Open Loki → filter service + ERROR level → what's the error message?
5. Check recent changes:
      argocd app history cloudnotes-note-service
      → Did anything deploy in the last 30–60 min?
6. If deployment-related → rollback immediately, ask questions later
7. If not deployment-related → dig deeper:
      → DB connections exhausted? → restart PgBouncer, scale connection pool
      → OOMKilled? → increase memory limit, check for memory leak
      → External dependency down? → circuit breaker, fallback response
8. Once stable → update incident ticket with timeline + actions taken
9. Postmortem within 48h
```

---

### Phase 11 — Postmortem (blameless)

A postmortem is NOT "who screwed up." It's "what in our system allowed this to happen."

```markdown
# Postmortem: note-service OOM crash — 2026-06-03 03:17 IST

## Impact
23 minutes degraded service. ~340 users received 503 on /v1/notes.

## Timeline
03:17 — PagerDuty: error_rate > 5% on note-service
03:19 — On-call acknowledges
03:22 — Root cause: pod OOMKilled (memory limit 256Mi exceeded)
03:35 — Memory limit raised to 512Mi, pod restarted
03:40 — Error rate returns to 0%

## Root cause
GET /v1/notes?user_id=X loads ALL notes into memory at once.
A user with 50 notes averaging 2MB each (embedded images) = 100MB.
Pod memory limit was 256Mi. Pod killed.

## Contributing factors
- Memory limit copied from auth-service without sizing review
- Load test only used small text notes, no media

## Action items
- [ ] CN-89: Paginate GET /v1/notes (return 20 at a time)
- [ ] CN-90: Add large-note scenario to load test
- [ ] CN-91: Set memory requests=256Mi limits=1Gi
- [ ] CN-92: Alert at 80% of memory limit (not just on crash)
```

**Blameless means:** engineers report and document incidents honestly because they won't be punished. Fear of blame = incidents get hidden = same incident happens again.

---

### Phase 12 — Scalability thinking

**Decision framework when something is slow:**

```
Is it CPU-bound?
    → Scale horizontally (HPA: add more pods)
    → Or profile and optimise the hot path

Is it I/O-bound (database)?
    → Connection pooling (PgBouncer in front of RDS)
    → Read replica for read-heavy queries
    → Caching (Redis) for frequently-read, rarely-changed data

Is it network-bound?
    → CDN (CloudFront) for static assets
    → Edge caching for API responses
    → Keep services in the same VPC/AZ to reduce latency

Is it memory-bound?
    → Fix the leak (don't just raise limits forever)
    → Stream instead of load-all-into-memory
```

**HPA for note-service (what the YAML looks like):**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef:
    name: note-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70    # add pods when CPU > 70%
```

**The real bottleneck is almost always the database, not the app pods.**
Next steps for CloudNotes scalability:
1. PgBouncer (connection pooler) in front of RDS — prevents connection exhaustion
2. Read replica for all GET queries to note-service
3. Redis cache for note lists (invalidate on write)

---

### Phase 13 — SLOs, SLAs, Error Budgets

**SLI** (Service Level Indicator) = what you actually measure
→ "95th percentile request latency over the past 5 minutes"

**SLO** (Service Level Objective) = your internal target
→ "99.5% of requests succeed in < 300ms over any 30-day window"

**SLA** (Service Level Agreement) = legal promise to customers
→ "We guarantee 99.9% uptime. Breach = bill credit."

**Error budget math:**
- SLO = 99.5% success rate
- Error budget = 0.5% allowed failures over 30 days
- 0.5% × 30 × 24 × 60 = **216 minutes of allowed downtime per month**
- The 23-minute incident consumed 23/216 = **10.6% of monthly budget**
- If budget runs out → **no new deployments** until next month starts
- This aligns DevOps + product team: "do we risk this Friday deploy, or protect the budget?"

---

### Phase 14 — System design trade-offs (DevOps lens)

**CAP Theorem:**
- **C**onsistency — every read sees the latest write
- **A**vailability — every request gets a response (might be stale)
- **P**artition tolerance — system works even if network splits
→ You can have CP or AP. Not all three.
→ RDS PostgreSQL = CP. If DB is unreachable, return 503 (not stale data).
→ For CloudNotes: CP is correct. Losing a note you just saved is worse than a brief outage.

**Synchronous vs Asynchronous:**
- Currently: `POST /v1/notes` → writes to memory → returns 201. Synchronous.
- With DB: same flow, just slower. Still synchronous — user waits for DB confirmation.
- With queue: `POST /v1/notes` → publishes to Kafka → returns 202 Accepted. Worker processes async.
- Use async when: sending email, resizing images, recording analytics events, generating reports.
- CloudNotes analytics should be async — don't make the user wait for tracking.

**Monolith vs Microservices:**
- Monolith: one codebase, one deploy, simpler, faster to build, harder to scale independently.
- Microservices: independent deploy and scale, language flexibility, BUT: network hops, distributed tracing required, much more ops overhead.
- CloudNotes chose microservices intentionally for learning. In a real startup, you'd start with a monolith and extract services only when a specific scaling or team-boundary reason appears.

---

## Section 4 — Next concrete steps (in order)

1. **Connect auth-service to PostgreSQL** — replace the Python dict
   - Learn: DB migrations (Alembic), env vars for DATABASE_URL, psycopg2

2. **Set up local Kubernetes (kind or minikube)**
   - Apply the Helm charts that already exist in `kubernetes/`
   - Learn: namespaces, deployments, services, ingress, kubectl debugging

3. **Set up Prometheus + Grafana locally**
   - Scrape the `/metrics` endpoints already working on all 4 services
   - Build the 4 Golden Signals dashboard in Grafana
   - Learn: PromQL, dashboard building, alerting rules

4. **Write the GitHub Actions CI pipeline end-to-end**
   - Build → test → scan → push to GHCR (free registry)
   - Learn: jobs, steps, secrets, matrix strategy

5. **Set up ArgoCD on local cluster and do a GitOps deploy**
   - Learn: App of Apps pattern, sync policies, rollback via git

6. **Run k6 load test and watch Grafana live**
   - See req/sec, P95 latency, error rate change in real time
   - Learn: how to read Grafana under load, what breaks first

7. **Intentionally kill a service and run the incident response playbook**
   - Watch alerts fire, restore, write a postmortem
   - Learn: on-call mindset, runbooks, blameless culture

---

*Add new questions and decisions below as sessions continue.*
