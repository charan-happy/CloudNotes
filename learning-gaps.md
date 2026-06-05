# Learning Gaps — Topics Not Covered in CloudNotes

> This file tracks every DevOps/SRE/Platform Engineering topic that cannot be fully covered
> within the CloudNotes project scope.
>
> **Why this file exists:** CloudNotes covers one path through the DevOps landscape. The roles
> you are targeting (DevOps / Senior DevOps / SRE / Platform Engineering, 4–7 yrs, startups to
> mid-sized, India + remote/international) require breadth beyond what any single project teaches.
>
> For each gap: understand what it is, why interviewers ask about it, and what side project
> gives you real hands-on experience.
>
> **How to use this:** After CloudNotes is done, pick the gaps rated HIGH for your target role
> and build focused side projects around them. One gap = one weekend project = one interview story.

---

## Difficulty key
- `L1` — Can learn in a day, common in junior interviews
- `L2` — Needs a weekend project, common in mid-level interviews
- `L3` — Needs 1–2 weeks of depth, expected at senior/SRE level
- `L4` — Deep specialist knowledge, differentiating at Staff/Principal level

## Frequency key
- `★★★` — Asked in almost every interview at this level
- `★★` — Asked frequently, especially at product companies
- `★` — Asked at specialist roles or specific company types

---

## 1. CI/CD

### 1.1 Jenkins
**Gap:** CloudNotes uses GitHub Actions. Jenkins is not covered.
**Why it matters:** Most Indian product companies and large enterprises (TCS, Infosys clients, banks) still run Jenkins. Any company that predates 2020 probably has Jenkins. Senior roles often involve migrating FROM Jenkins TO something modern.
**Frequency:** `★★★` in Indian enterprise, `★` in startups/abroad
**Difficulty:** `L2`
**Side project idea:** Set up Jenkins on a local Docker container. Create a Declarative Pipeline (`Jenkinsfile`) that builds a simple Python Flask app, runs tests, and pushes a Docker image to DockerHub. Add a shared library. Practice the groovy syntax.
**Key concepts to know:** Declarative vs Scripted pipelines, shared libraries, agents, credentials management, Blue Ocean UI, multibranch pipelines, Jenkins as code (JCasC).

---

### 1.2 GitLab CI/CD
**Gap:** CloudNotes uses GitHub Actions. GitLab CI is not covered.
**Why it matters:** GitLab is heavily used in European companies, mid-sized Indian IT firms, and any shop that self-hosts their git. Many remote European/German/Dutch companies are GitLab shops.
**Frequency:** `★★` in European remote roles, `★★` in mid-sized Indian IT
**Difficulty:** `L2`
**Side project idea:** Create a free GitLab.com account. Mirror the CloudNotes auth-service there. Write a `.gitlab-ci.yml` with stages: lint → test → build → deploy to GitLab Container Registry. Practice GitLab environments, protected branches, and merge request approvals.
**Key concepts to know:** `.gitlab-ci.yml` stages/jobs, GitLab Runners (shared vs self-hosted), container registry, environments and deployments, merge request pipelines.

---

### 1.3 Tekton
**Gap:** CloudNotes does not use Tekton.
**Why it matters:** Tekton is the cloud-native CI/CD framework built on Kubernetes CRDs. Platform engineering teams at companies like Red Hat, IBM, and cloud-native startups use it. It is the basis for OpenShift Pipelines.
**Frequency:** `★` in platform engineering roles, `★★` if the company uses OpenShift
**Difficulty:** `L3`
**Side project idea:** Install Tekton on your local kind cluster. Create a Pipeline with Tasks: git-clone → build-image → push-image. Understand PipelineRuns, TaskRuns, and Workspaces. Compare the mental model to GitHub Actions.
**Key concepts to know:** Task, Pipeline, PipelineRun, TaskRun, Workspace, Triggers (TEP), ClusterTask vs Task.

---

### 1.4 Multi-architecture Docker builds (ARM64 + AMD64)
**Gap:** CloudNotes builds single-arch (AMD64) images.
**Why it matters:** Apple Silicon Macs (M1/M2/M3) run ARM64. If your CI builds AMD64-only images, they run with emulation on Mac dev machines (slow, QEMU overhead). Companies with AWS Graviton instances (cheaper, more efficient) need ARM64 images. SRE and platform roles are expected to know this.
**Frequency:** `★★` in any company using AWS Graviton or Apple Silicon dev machines
**Difficulty:** `L2`
**Side project idea:** Add `docker buildx` to your CI pipeline. Build and push a multi-arch manifest for any one service. Test pulling it on an ARM Mac and an AMD64 Linux box.
**Key concepts to know:** `docker buildx`, `--platform linux/amd64,linux/arm64`, manifest lists, QEMU emulation, BuildKit.

---

## 2. Kubernetes

### 2.1 Service Mesh (Istio / Linkerd)
**Gap:** CloudNotes uses plain Kubernetes Services. No service mesh is covered.
**Why it matters:** Any company running more than ~5 microservices in production asks about service mesh in senior interviews. Concepts like mTLS between services, traffic management (canary via weight), circuit breaking, and distributed tracing are all service mesh territory.
**Frequency:** `★★★` at Senior DevOps / SRE level, especially product companies
**Difficulty:** `L3`
**Side project idea:** Install Istio on your local kind cluster using `istioctl`. Deploy 2 services with sidecar injection enabled. Observe mTLS between them using Kiali. Set up a canary split (90/10 traffic) between two versions of the same service using VirtualService + DestinationRule.
**Key concepts to know:** Envoy sidecar, mTLS, VirtualService, DestinationRule, Gateway, traffic shifting, circuit breaker (Outlier Detection), Kiali, Jaeger integration with Istio.

---

### 2.2 Cluster Autoscaler vs Karpenter
**Gap:** CloudNotes covers HPA (pod scaling) but not node-level autoscaling.
**Why it matters:** HPA adds pods. But if no node has capacity, pods stay Pending forever. Node autoscaling (adding/removing EC2 instances) is the other half. Karpenter is the modern AWS-native solution, replacing Cluster Autoscaler. Senior AWS interviews always ask this.
**Frequency:** `★★★` in any AWS EKS role at senior level
**Difficulty:** `L2`
**Side project idea:** Deploy Cluster Autoscaler on your EKS cluster. Simulate a pod Pending state by deploying more replicas than node capacity allows. Watch CA provision a new node. Then try Karpenter and compare the provisioning speed and flexibility.
**Key concepts to know:** CA node groups vs Karpenter NodePools, scale-down delay, spot instance handling in Karpenter, `topologySpreadConstraints`, overprovisioning pattern.

---

### 2.3 Custom Resource Definitions (CRDs) and Operators
**Gap:** CloudNotes uses ArgoCD (which itself is an operator), but we never build a CRD or operator.
**Why it matters:** Platform engineering roles at product companies often involve building or maintaining operators. Understanding the reconciliation loop is fundamental to understanding how Kubernetes extensions work.
**Frequency:** `★★` in platform engineering, `★` in standard DevOps roles
**Difficulty:** `L3`
**Side project idea:** Use `kubebuilder` or `operator-sdk` to build a simple operator. Example: a `DatabaseBackup` CRD that, when created, triggers a `pg_dump` Job. Understand the reconcile loop, owner references, and finalizers.
**Key concepts to know:** Reconcile loop, controller-runtime, kubebuilder markers, status subresource, owner references, leader election, finalizers.

---

### 2.4 Advanced Scheduling (Affinity, Taints, Topology Spread)
**Gap:** CloudNotes uses default scheduling.
**Why it matters:** In production, you want control over which node runs which pod. Database pods should be on dedicated nodes. Frontend pods should spread across AZs. GPU workloads need GPU nodes. This is expected knowledge for any senior Kubernetes role.
**Frequency:** `★★★` in senior SRE / platform engineering interviews
**Difficulty:** `L2`
**Side project idea:** On your kind cluster, label nodes (`kubectl label node worker-1 node-type=compute`). Add `nodeAffinity` to one deployment to only schedule on that node. Add a taint to another node and add a `toleration` to a pod that must run there. Add `topologySpreadConstraints` to spread pods across AZs.
**Key concepts to know:** `nodeSelector` vs `nodeAffinity` (required vs preferred), taints and tolerations, `topologySpreadConstraints`, pod anti-affinity for HA, DaemonSet scheduling.

---

### 2.5 etcd Backup and Restore
**Gap:** CloudNotes does not cover etcd operations.
**Why it matters:** etcd is the brain of Kubernetes. If etcd is lost without a backup, the entire cluster state is gone. Senior SRE and platform roles are expected to know how to back up and restore etcd — especially for self-managed clusters (not EKS managed control plane).
**Frequency:** `★★` in SRE interviews, `★★★` if the company runs self-managed Kubernetes
**Difficulty:** `L2`
**Side project idea:** On your kind cluster, take an etcd snapshot using `etcdctl snapshot save`. Deliberately corrupt the cluster state (delete a namespace). Restore from snapshot. Verify state is back.
**Key concepts to know:** `etcdctl snapshot save/restore`, ETCD_API=3, peer URLs, client certificates, leader election in etcd, what happens when quorum is lost.

---

### 2.6 Certificate Management (cert-manager)
**Gap:** CloudNotes does not set up TLS certificate automation.
**Why it matters:** In production, every HTTPS endpoint needs a TLS certificate. cert-manager automates issuance and renewal from Let's Encrypt or internal CAs. Most companies use it. Without it, certificate expiry incidents happen.
**Frequency:** `★★★` in any role that owns production Kubernetes
**Difficulty:** `L1`
**Side project idea:** Install cert-manager on your kind cluster. Create a self-signed ClusterIssuer. Annotate an Ingress resource to get a certificate automatically issued. Watch the Certificate, CertificateRequest, and Order resources go through their lifecycle.
**Key concepts to know:** ClusterIssuer vs Issuer, ACME challenges (HTTP-01 vs DNS-01), Certificate resource lifecycle, cert rotation, Let's Encrypt rate limits.

---

## 3. Observability

### 3.1 Distributed Tracing (OpenTelemetry + Jaeger)
**Gap:** CloudNotes has structured logs with trace_id passthrough but no actual OTel SDK instrumentation or Jaeger export.
**Why it matters:** When a request goes through 5 microservices and fails, you need to see the entire request path — which service added latency, where the error originated. Logs can't show this. Traces can. Every SRE role expects this.
**Frequency:** `★★★` at SRE level, `★★` at senior DevOps
**Difficulty:** `L3`
**Side project idea:** Instrument auth-service (Python) with `opentelemetry-sdk`. Export spans to Jaeger running locally. Trace a login request: frontend → auth-service → DB. See the full waterfall. Add a slow span intentionally and see it show up in Jaeger.
**Key concepts to know:** Spans, traces, context propagation (W3C TraceContext header), sampling strategies, OTel Collector as a sidecar vs gateway, Jaeger vs Zipkin vs Tempo, baggage.

---

### 3.2 Commercial Observability Platforms (Datadog / New Relic)
**Gap:** CloudNotes uses open-source (Prometheus/Grafana/Loki). Commercial platforms are not covered.
**Why it matters:** Most product companies paying for observability use Datadog or New Relic. The agent setup, APM, dashboards, and alerting are different from open-source. Interviewers at these companies expect you to have used it.
**Frequency:** `★★★` at startups and product companies with budget
**Difficulty:** `L1` (free trial available)
**Side project idea:** Sign up for Datadog's 14-day trial. Install the Datadog agent as a DaemonSet on your kind cluster. Set up an APM trace for the auth-service. Build a dashboard with the 4 Golden Signals. Create a monitor (alert) with a notification channel.
**Key concepts to know:** Datadog Agent, DogStatsD, APM traces vs infrastructure metrics, Log Management, monitors vs synthetic tests, tags-based filtering, cost model (per host pricing).

---

### 3.3 ELK Stack (Elasticsearch + Logstash + Kibana)
**Gap:** CloudNotes uses Loki for logs. ELK is not covered.
**Why it matters:** ELK is still the dominant log management stack in Indian enterprises, banks, and government tech. If you work at a company that has been around since 2015, they are probably on ELK. Senior roles require knowing both PLG and ELK.
**Frequency:** `★★★` in Indian enterprise/banking, `★` in cloud-native startups
**Difficulty:** `L2`
**Side project idea:** Run a local ELK stack using Docker Compose (there are official Elastic compose files). Ship logs from one of the CloudNotes services using Filebeat. Create an index pattern in Kibana. Build a dashboard showing error rates from structured JSON logs.
**Key concepts to know:** Index vs data stream, ILM (Index Lifecycle Management), Logstash pipeline vs Beats (Filebeat, Metricbeat), KQL query language, cluster health (green/yellow/red), shard allocation.

---

### 3.4 SLO Tooling (Sloth / OpenSLO)
**Gap:** CloudNotes covers SLO concepts (in instructions-docs.md) but not the tooling to define and track them as code.
**Why it matters:** SRE roles at companies with mature SRE practices use tooling to define SLOs declaratively (as YAML/code). Sloth generates Prometheus recording rules and alerts from a simple SLO definition. This is "SLOs as code."
**Frequency:** `★★` in SRE roles at product companies
**Difficulty:** `L2`
**Side project idea:** Install Sloth. Write an SLO definition YAML for the note-service (99.5% availability, 300ms latency). Run `sloth generate` to get the PrometheusRule. Apply it to your cluster. Build an Error Budget dashboard in Grafana using the generated recording rules.
**Key concepts to know:** SLI spec, SLO window (rolling vs calendar), error budget burn rate alerts (multiwindow, multi-burn-rate), the difference between an alert on SLO breach vs an alert on burn rate.

---

## 4. Infrastructure as Code

### 4.1 Terragrunt
**Gap:** CloudNotes uses plain Terraform. Terragrunt is not covered.
**Why it matters:** At scale, plain Terraform becomes repetitive. Every environment (dev, staging, prod) duplicates the same `backend.tf`, `provider.tf`, and variable calls. Terragrunt solves this with DRY (Don't Repeat Yourself) patterns. Any company with 3+ environments in Terraform likely uses Terragrunt.
**Frequency:** `★★` in companies with mature IaC, especially those with many environments
**Difficulty:** `L2`
**Side project idea:** Take the CloudNotes Terraform modules and reorganise them into a Terragrunt layout with `dev/` and `staging/` environments. Use `terragrunt.hcl` with `include` and `dependency` blocks. Deploy both environments from the same module code.
**Key concepts to know:** `terragrunt.hcl`, `include`, `dependency`, `generate` blocks, `run-all` command, DRY backend configuration, working with multiple AWS accounts.

---

### 4.2 Atlantis (GitOps for Terraform)
**Gap:** CloudNotes runs Terraform manually. Atlantis is not covered.
**Why it matters:** In teams, running `terraform apply` manually from a laptop is dangerous. Atlantis makes Terraform GitOps: open a PR → Atlantis runs `terraform plan` as a PR comment → you approve → `terraform apply` runs automatically. Most mature DevOps teams use this or Terraform Cloud.
**Frequency:** `★★` in any team with more than 2 DevOps engineers
**Difficulty:** `L2`
**Side project idea:** Run Atlantis as a Docker container locally. Use `ngrok` to expose it to GitHub webhooks. Point it at your Terraform repo. Open a PR that changes an instance type. See the plan comment. Approve and apply via PR comment.
**Key concepts to know:** `atlantis.yaml`, repo-level config, workflows, apply requirements (approved, mergeable), plan-only vs apply locks, Atlantis vs Terraform Cloud vs Spacelift.

---

### 4.3 Pulumi
**Gap:** CloudNotes uses Terraform (HCL). Pulumi (TypeScript/Python/Go IaC) is not covered.
**Why it matters:** Pulumi is gaining traction, especially in companies where developers own infrastructure. Writing infra in TypeScript/Python means full IDE support, real loops, conditionals, and unit tests. Platform engineering roles increasingly see this.
**Frequency:** `★` currently, but growing — differentiating in interviews
**Difficulty:** `L2`
**Side project idea:** Rewrite one CloudNotes Terraform module (e.g., the VPC) in Pulumi using Python or TypeScript. Compare the experience. Understand how Pulumi state works (Pulumi Cloud vs S3 backend). Write a unit test for the VPC component.
**Key concepts to know:** Stack, Project, Resource, Output, ComponentResource, Pulumi state backend, `pulumi up/preview/destroy`, Automation API.

---

## 5. Security

### 5.1 HashiCorp Vault (Secret Management)
**Gap:** CloudNotes uses AWS Secrets Manager + Kubernetes Secrets. Vault is not covered.
**Why it matters:** Vault is the industry standard for dynamic secrets, secret leasing, and fine-grained secret access control. Many companies (especially those not fully on one cloud provider) use Vault. SRE and platform engineering roles at banks, fintechs, and security-conscious companies expect Vault knowledge.
**Frequency:** `★★★` in fintech, banking, security-focused companies
**Difficulty:** `L3`
**Side project idea:** Run Vault dev server locally. Store the CloudNotes `JWT_SECRET` in Vault. Use the Vault Agent Injector on Kubernetes to inject the secret into a pod as an env var (without the app knowing about Vault at all). Then enable dynamic database secrets: Vault creates a temporary PostgreSQL user with a TTL, the app uses it, then it expires.
**Key concepts to know:** Auth methods (Kubernetes, AppRole, AWS IAM), secret engines (KV v2, database, PKI), leases and renewal, Vault Agent vs Vault Sidecar Injector, token policies, audit logging, HA with Raft storage.

---

### 5.2 OPA (Open Policy Agent) / Kyverno
**Gap:** CloudNotes has no policy enforcement on the Kubernetes cluster.
**Why it matters:** Without policies, developers can deploy containers as root, without resource limits, with privileged access, or from untrusted registries. OPA/Gatekeeper or Kyverno enforces guardrails at the admission webhook level — the request is rejected before the pod even starts.
**Frequency:** `★★` in senior DevOps/SRE, `★★★` in platform engineering
**Difficulty:** `L2`
**Side project idea:** Install Kyverno on your kind cluster. Write policies that: (1) block pods running as root, (2) require resource limits on all containers, (3) only allow images from `ghcr.io/YOUR_USERNAME`. Try deploying a violating pod and see it rejected with a clear message.
**Key concepts to know:** Admission webhook (validating vs mutating), Kyverno Policy vs ClusterPolicy, enforce vs audit mode, OPA Rego language basics, Conftest for testing policies locally, `kubectl explain` for custom resources.

---

### 5.3 Falco (Runtime Security)
**Gap:** CloudNotes does not cover runtime threat detection.
**Why it matters:** Image scanning (Trivy) catches known CVEs at build time. Falco catches malicious behaviour at runtime — someone exec-ing into a production pod, a process writing to `/etc/passwd`, unexpected outbound connections. SRE at security-conscious companies expects this.
**Frequency:** `★` in standard DevOps, `★★` in SRE at fintechs and security orgs
**Difficulty:** `L2`
**Side project idea:** Install Falco on your kind cluster as a DaemonSet. Exec into a running pod (`kubectl exec -it <pod> -- sh`). See Falco fire an alert: "A shell was spawned in a container." Forward alerts to Slack. Write a custom Falco rule that alerts when a file is created in `/tmp` inside a specific container.
**Key concepts to know:** Falco rules (condition, output, priority), syscall-based detection vs eBPF, Falcosidekick for output routing, the difference from OPA (admission-time vs runtime).

---

### 5.4 SAST and Dependency Scanning (SonarQube / Snyk)
**Gap:** CloudNotes CI uses Trivy for image CVEs and gitleaks for secrets. SAST (Static Analysis Security Testing) for code quality and Snyk for dependency trees are not covered.
**Why it matters:** Trivy checks the image. SAST checks your code for SQL injection, hardcoded passwords in logic, insecure function calls. Snyk checks your `requirements.txt` / `go.mod` / `pom.xml` for known-vulnerable library versions before the image is even built.
**Frequency:** `★★` in any company with a security mandate (fintech, SaaS, healthcare)
**Difficulty:** `L1`
**Side project idea:** Add Snyk to your GitHub repo (free tier). Let it scan `src/auth-service/requirements.txt` and `src/note-service/go.mod`. Fix the vulnerabilities it finds. Add SonarQube Community Edition as a Docker container and run it against the Python auth-service. Understand the Quality Gate concept.
**Key concepts to know:** SAST vs DAST vs SCA (Software Composition Analysis), OWASP Top 10 categories, SonarQube Quality Gate, Snyk fix PRs, false positive handling.

---

## 6. Networking

### 6.1 Service Mesh Deep-Dive (Istio — Traffic Management)
**Gap:** Noted above in section 2.1, but the traffic management depth (canary, fault injection, retries) deserves its own entry.
**Why it matters:** SRE and platform roles own traffic management decisions. Knowing how to shift 5% of traffic to a new version, inject a 500ms delay to test resilience, and set retry policies without changing application code is a differentiating skill.
**Frequency:** `★★` in SRE at product companies with Kubernetes
**Difficulty:** `L3`
**Side project idea:** With Istio installed, deploy two versions of note-service (v1 and v2 with a distinguishing header). Set up a VirtualService that sends 5% to v2. Then inject a fault (500 error) on 10% of requests to test your client's retry logic. Enable circuit breaking using Outlier Detection.
**Key concepts to know:** VirtualService, DestinationRule, Subset, weight-based routing, fault injection (delay + abort), retries, timeouts, circuit breaker (consecutive 5xx threshold), traffic mirroring.

---

### 6.2 eBPF-based Networking (Cilium)
**Gap:** CloudNotes uses default kind networking (kindnet). Cilium is not covered.
**Why it matters:** Cilium replaces kube-proxy using eBPF for better performance and observability. It is the CNI of choice for EKS in modern setups. Hubble (Cilium's observability layer) gives you network-level visibility without any application changes. Platform engineering roles at cloud-native companies expect this.
**Frequency:** `★` currently but fast-growing — differentiating at senior level
**Difficulty:** `L3`
**Side project idea:** Create a kind cluster with Cilium as the CNI (no kube-proxy). Enable Hubble. Deploy two services and observe the L4/L7 network flows in the Hubble UI. Write a Cilium NetworkPolicy and see it enforced at the eBPF level.
**Key concepts to know:** eBPF basics (kernel programs, maps, hooks), Cilium vs Calico vs Flannel, Hubble relay and UI, identity-based policies (vs IP-based), kube-proxy replacement, BPF masquerade.

---

## 7. Cloud Platforms

### 7.1 GCP (Google Cloud Platform)
**Gap:** CloudNotes uses AWS. GCP is not covered.
**Why it matters:** Many product companies, especially those using Google Workspace, run on GCP. GKE (Google Kubernetes Engine) is often considered the most mature managed Kubernetes. Remote roles in Europe sometimes default to GCP. If you only know AWS, 30% of job postings are inaccessible.
**Frequency:** `★★` in companies using GCP (common in startups and Google-adjacent orgs)
**Difficulty:** `L2`
**Side project idea:** Create a GCP free-tier account. Deploy a single CloudNotes service (auth-service) to Cloud Run (serverless containers — no Kubernetes needed). Then deploy the same service to GKE Autopilot. Compare the operational overhead. Use Cloud SQL as the PostgreSQL backend.
**Key concepts to know:** Cloud Run vs GKE Autopilot vs GKE Standard, GCR vs Artifact Registry, IAM (service accounts vs IAM bindings — different from AWS), Cloud SQL Proxy, VPC in GCP (global vs regional), Workload Identity.

---

### 7.2 Azure (AKS + Azure DevOps)
**Gap:** CloudNotes uses AWS. Azure is not covered.
**Why it matters:** Enterprises running Microsoft stacks (Active Directory, Office 365) almost always run Azure. Indian IT services companies doing enterprise work for US/EU clients frequently use Azure. Azure DevOps is a complete CI/CD + Boards platform.
**Frequency:** `★★★` in Indian IT services companies, `★★` in enterprises with Microsoft contracts
**Difficulty:** `L2`
**Side project idea:** Use Azure free tier. Deploy auth-service to AKS (Azure Kubernetes Service). Set up Azure Container Registry (ACR). Create an Azure DevOps pipeline that builds the image and deploys to AKS. Use Azure Key Vault for secrets.
**Key concepts to know:** AKS vs AKS with Azure CNI, Azure DevOps Pipelines (YAML-based), ACR tasks, Azure Key Vault + CSI driver for Kubernetes, Managed Identity (Azure equivalent of IAM roles for pods), Azure Monitor.

---

### 7.3 Multi-Cloud Strategy and Trade-offs
**Gap:** CloudNotes deploys to one cloud (AWS). Multi-cloud concepts are not practiced.
**Why it matters:** Senior DevOps and platform engineering roles at companies with compliance requirements (data residency, regulatory), or those that want vendor lock-in avoidance, need multi-cloud thinking. Interviews at this level ask: "How would you avoid vendor lock-in? What would you change in this architecture if you had to run it on GCP tomorrow?"
**Frequency:** `★★` in senior roles at large product companies
**Difficulty:** `L3`
**Side project idea:** Take the CloudNotes Terraform and abstract the AWS-specific parts (RDS → variable database type, ECR → variable registry). Document what would need to change to run on GCP vs Azure. This is mostly a design exercise, not a build — but being able to articulate it confidently is what matters.
**Key concepts to know:** Cloud-agnostic abstractions (Crossplane, Pulumi), cloud-native lock-in risks (SQS vs Pub/Sub vs EventBridge), data sovereignty and residency, the cost of multi-cloud (operational overhead vs vendor risk), when multi-cloud makes sense vs not.

---

## 8. Database Operations

### 8.1 PgBouncer (Connection Pooling)
**Gap:** CloudNotes connects services directly to PostgreSQL. PgBouncer is mentioned in the theory but not implemented.
**Why it matters:** PostgreSQL has a connection limit. Each application connection opens a new process on the DB server. At 100+ concurrent pods each with 10 connections, you hit the limit fast. PgBouncer pools connections, multiplexing many app connections to a few real DB connections. Every production PostgreSQL deployment should have it.
**Frequency:** `★★★` in any role owning a PostgreSQL production deployment
**Difficulty:** `L2`
**Side project idea:** Add PgBouncer as a container in the docker-compose and Kubernetes deployment. Configure it in transaction pooling mode in front of PostgreSQL. Verify that `SELECT count(*) FROM pg_stat_activity` shows fewer connections than the number of app pods. Run a load test before and after.
**Key concepts to know:** Session pooling vs transaction pooling vs statement pooling (and why transaction pooling is the only safe mode for most ORMs), `max_client_conn`, `pool_size`, `server_lifetime`, pgbouncer.ini configuration.

---

### 8.2 Redis (Caching and Session Management)
**Gap:** CloudNotes has no caching layer.
**Why it matters:** Almost every production web application uses Redis — session storage, API response caching, rate limiting, pub/sub for real-time features. Senior DevOps roles are expected to deploy and operate Redis clusters.
**Frequency:** `★★★` in any product company backend role
**Difficulty:** `L2`
**Side project idea:** Add Redis to the CloudNotes docker-compose. Cache the result of `GET /v1/notes?user_id=X` in Redis with a 60-second TTL. Invalidate the cache on `POST /v1/notes` and `DELETE /v1/notes/:id`. Use Redis Sentinel for local HA. Compare P95 latency before and after caching using k6.
**Key concepts to know:** Redis data structures (String, Hash, List, Set, ZSet), TTL and eviction policies (LRU, LFU, noeviction), persistence (RDB vs AOF), Redis Sentinel vs Redis Cluster, Pub/Sub pattern, Redis as a distributed lock (Redlock algorithm).

---

### 8.3 Kafka / Message Queues
**Gap:** CloudNotes analytics events are synchronous HTTP calls. Async event streaming is not implemented.
**Why it matters:** Analytics, notifications, audit logs, and inter-service events in production should be async. Kafka is the de facto standard. If one service is slow, it should not block the calling service. SRE and senior DevOps at product companies are expected to operate Kafka clusters.
**Frequency:** `★★` in product companies with event-driven architecture
**Difficulty:** `L3`
**Side project idea:** Add Kafka (via docker-compose with Confluent images) to CloudNotes. Change analytics-service to consume events from a `note.created` Kafka topic instead of a REST endpoint. Have note-service publish to Kafka after a successful note creation. Observe what happens if analytics-service is down — the events queue up and are consumed when it comes back.
**Key concepts to know:** Topics, partitions, consumer groups, offset management, at-least-once vs exactly-once semantics, retention policy, Kafka Connect for DB change streams, the difference between Kafka, RabbitMQ, and AWS SQS/SNS.

---

## 9. Platform Engineering

### 9.1 Backstage (Internal Developer Portal)
**Gap:** CloudNotes does not have an Internal Developer Platform.
**Why it matters:** Platform engineering roles are entirely about building systems that make other developers productive. Backstage is the CNCF project for developer portals — service catalog, docs, scaffolding, and plugin ecosystem. Companies like Spotify, Zalando, and Netflix pioneered this. It is the primary tool for platform engineering job descriptions.
**Frequency:** `★` in standard DevOps, `★★★` in Platform Engineering roles
**Difficulty:** `L3`
**Side project idea:** Run Backstage locally using the `@backstage/create-app` scaffolder. Register CloudNotes services in the software catalog using `catalog-info.yaml` files. Add the Kubernetes plugin so Backstage shows pod health for each service. Add a software template that scaffolds a new microservice with the standard CloudNotes structure.
**Key concepts to know:** Software Catalog (Component, API, System, Resource), `catalog-info.yaml`, scaffolder templates, plugins (K8s, GitHub Actions, TechDocs), entity providers, ADR (Architectural Decision Records) in TechDocs.

---

### 9.2 Crossplane (Infrastructure from Kubernetes)
**Gap:** CloudNotes uses Terraform for infrastructure. Crossplane is not covered.
**Why it matters:** Crossplane lets you provision cloud infrastructure (RDS, S3, VPCs) using Kubernetes CRDs. Platform teams use it to offer self-service infrastructure to developers — a developer creates a `PostgreSQLInstance` custom resource and Crossplane provisions RDS. No Terraform, no ticket, no waiting.
**Frequency:** `★` currently but growing fast in platform engineering
**Difficulty:** `L3`
**Side project idea:** Install Crossplane on your kind cluster with the AWS provider. Create a `PostgreSQLInstance` Composite Resource that provisions an RDS instance. A developer should be able to get a database by just applying a YAML file.
**Key concepts to know:** Provider, ProviderConfig, Managed Resources, Composite Resources (XRD/XR/XRC), Compositions, self-service infrastructure patterns, comparing Crossplane vs Terraform (and why you might use both).

---

## 10. Reliability Engineering

### 10.1 Chaos Engineering (LitmusChaos / Chaos Mesh)
**Gap:** CloudNotes does the "intentional failure" exercise manually. Formal chaos engineering tooling is not covered.
**Why it matters:** SRE roles at mature product companies run chaos experiments as part of the release process. Killing a pod, injecting latency, or stopping a network interface is done programmatically and automatically, with hypothesis and blast radius control. Netflix's Chaos Monkey concept, but structured.
**Frequency:** `★★` in SRE at product companies with reliability mandates
**Difficulty:** `L2`
**Side project idea:** Install LitmusChaos on your kind cluster. Create a `ChaosEngine` that runs a `pod-delete` experiment on the note-service every 5 minutes for 30 minutes. Define a hypothesis: error rate should stay below 1%. Observe in Grafana whether the hypothesis holds. If not, improve the deployment (PDB, min replicas, readiness probe).
**Key concepts to know:** GameDay concept, blast radius, steady-state hypothesis, abort criteria, Chaos Hub experiments, the difference between fault injection (Istio) and chaos engineering (LitmusChaos).

---

### 10.2 On-call and Runbook Engineering
**Gap:** CloudNotes defines alerting rules but does not have formal runbooks.
**Why it matters:** A runbook tells the on-call engineer exactly what to do when an alert fires at 3am — in plain language, step-by-step. Without runbooks, every on-call is an improvised debugging session. Good runbooks reduce MTTR (Mean Time To Resolve) significantly. SRE interviews ask: "Walk me through your on-call process. What runbooks do you maintain?"
**Frequency:** `★★★` in SRE and senior DevOps interviews
**Difficulty:** `L1`
**Side project idea:** Write 3 runbooks for CloudNotes alerts: (1) `HighErrorRate` on note-service, (2) `PodCrashLooping` for any service, (3) `PostgreSQLConnectionsExhausted`. Each runbook should have: impact, immediate action, diagnostic steps, escalation path, and rollback procedure. Store them in a `docs/runbooks/` directory.
**Key concepts to know:** Runbook vs Playbook (runbook = specific procedure, playbook = collection), MTTR vs MTTD vs MTBF, toil definition and toil elimination, alert fatigue, PagerDuty alert routing.

---

## 11. Developer Tooling

### 11.1 Skaffold / Tilt (Local Kubernetes Development)
**Gap:** CloudNotes uses docker-compose for local dev. Running against a local Kubernetes cluster during development is not covered.
**Why it matters:** Platform teams often mandate that development happens against a local Kubernetes cluster (kind/minikube) to match production behaviour. Skaffold and Tilt automate the build → deploy → hot-reload cycle so developers don't manually run kubectl after every code change.
**Frequency:** `★` in standard DevOps, `★★` in platform engineering
**Difficulty:** `L2`
**Side project idea:** Write a `skaffold.yaml` for the note-service. Run `skaffold dev` and edit a handler function. Watch Skaffold detect the file change, rebuild the Docker image, and redeploy the pod automatically. Compare the inner loop speed vs `docker compose up --build`.
**Key concepts to know:** Skaffold profiles (dev, staging), Jib for Java fast builds (no full Docker rebuild), file sync vs full rebuild, Tilt's Tiltfile (Starlark), comparing Skaffold vs Tilt vs DevSpace.

---

## 12. Soft Skills and Process (asked in senior interviews)

### 12.1 Incident Management Process
**Why it matters:** Senior and SRE interviews always include a scenario: "Tell me about an incident you handled. Walk me through your process." They are testing: did you have a structured process, did you communicate clearly, did you do a blameless postmortem, did you prevent recurrence?
**What CloudNotes does cover:** The incident response playbook and postmortem format in `instructions-docs.md`.
**What to practice:** Write 2–3 real (or simulated from CloudNotes exercises) postmortems. Practice the narrative: impact → detection → root cause → resolution → prevention. Be specific about numbers (MTTR, users affected, % error rate).

---

### 12.2 Toil Measurement and SRE Metrics
**Why it matters:** SRE role interviews ask: "How do you measure toil? How do you justify automation investment? What metrics do you track?" The Google SRE book defines toil precisely and every SRE interviewer has read it.
**What to know:** Toil definition (manual, repetitive, automatable, grows with load), 50% toil rule (SREs should spend <50% time on toil), error budget policy, SLA/SLO/SLI distinction, MTTR/MTTD/MTBF metrics.
**Side project:** Track your toil on CloudNotes for one week. Every time you do something manually that you could have automated — log it. Calculate how much time it took. Write an automation proposal for the top 3 items.

---

### 12.3 FinOps / Cloud Cost Management
**Gap:** CloudNotes does not implement cost optimisation.
**Why it matters:** Every company cares about cloud costs. Senior DevOps engineers are expected to not just deploy things but deploy them cost-effectively. Interviewers ask: "How do you rightsize instances? What do you do with idle resources? How do you handle spot instances?"
**Frequency:** `★★★` at startups and growing companies where budgets are tight
**Difficulty:** `L2`
**Side project idea:** Install Kubecost on your EKS cluster. Run it for a week. Identify the highest-cost namespace. Use Infracost in your Terraform PR to show cost diff before `terraform apply`. Practice rightsizing: run CloudNotes under load, check actual CPU/memory usage, reduce requests and limits to match actual usage (not estimated).
**Key concepts to know:** Reserved Instances vs Savings Plans vs Spot, rightsizing vs bin-packing, Kubecost allocation, Infracost for PR cost diff, tagging strategy for cost allocation, idle resource detection.

---

## Status tracking

Update the status column as you complete each gap on a side project.

| # | Topic | Status | Completed |
|---|---|---|---|
| 1.1 | Jenkins | Not started | — |
| 1.2 | GitLab CI/CD | Not started | — |
| 1.3 | Tekton | Not started | — |
| 1.4 | Multi-arch Docker builds | Not started | — |
| 2.1 | Istio service mesh | Not started | — |
| 2.2 | Cluster Autoscaler / Karpenter | Not started | — |
| 2.3 | CRDs and Operators | Not started | — |
| 2.4 | Advanced scheduling | Not started | — |
| 2.5 | etcd backup/restore | Not started | — |
| 2.6 | cert-manager | Not started | — |
| 3.1 | OpenTelemetry + Jaeger | Not started | — |
| 3.2 | Datadog / New Relic | Not started | — |
| 3.3 | ELK Stack | Not started | — |
| 3.4 | SLO tooling (Sloth) | Not started | — |
| 4.1 | Terragrunt | Not started | — |
| 4.2 | Atlantis | Not started | — |
| 4.3 | Pulumi | Not started | — |
| 5.1 | HashiCorp Vault | Not started | — |
| 5.2 | OPA / Kyverno | Not started | — |
| 5.3 | Falco | Not started | — |
| 5.4 | SAST / Snyk | Not started | — |
| 6.1 | Istio traffic management deep-dive | Not started | — |
| 6.2 | Cilium / eBPF networking | Not started | — |
| 7.1 | GCP | Not started | — |
| 7.2 | Azure + Azure DevOps | Not started | — |
| 7.3 | Multi-cloud strategy | Not started | — |
| 8.1 | PgBouncer | Not started | — |
| 8.2 | Redis | Not started | — |
| 8.3 | Kafka / message queues | Not started | — |
| 9.1 | Backstage | Not started | — |
| 9.2 | Crossplane | Not started | — |
| 10.1 | LitmusChaos | Not started | — |
| 10.2 | Runbook engineering | Not started | — |
| 11.1 | Skaffold / Tilt | Not started | — |
| 12.1 | Incident management process | Not started | — |
| 12.2 | Toil measurement | Not started | — |
| 12.3 | FinOps / Kubecost | Not started | — |

---

## 13. Resume-specific gaps (HIGH PRIORITY — on your resume, not covered in CloudNotes)

> These were identified after reviewing your resume on 2026-06-05.
> These are the items interviewers WILL ask about because they're explicitly on your resume.
> Treat these as URGENT side projects — do them alongside or immediately after CloudNotes.

---

### 13.1 Ansible
**Resume claim:** "Automated Linux server patching and configuration management via Ansible playbooks across 50+ servers — eliminated manual change windows entirely and reduced patching effort by 70%"
**Gap:** CloudNotes has no Ansible. If an interviewer asks you to walk through a playbook, you will not be able to.
**Why it matters:** Ansible is on every mid-to-large enterprise DevOps JD. Infosys-style companies use it heavily. Any interviewer who worked at scale will ask: "Walk me through a role you wrote. How did you handle idempotency? How did you manage dynamic inventory? How did you vault secrets?"
**Frequency:** `★★★` in enterprise and IT services roles, `★★` in product companies
**Difficulty:** `L2`
**Urgent side project:** Set up 3 Linux VMs using Vagrant or Docker (simulate servers). Write an Ansible role (not just a playbook — a proper role with `tasks/`, `handlers/`, `defaults/`, `templates/`) that:
1. Installs and configures Nginx
2. Applies OS patches (`yum update -y` or `apt upgrade`)
3. Creates a deploy user with SSH key
4. Manages a config file using a Jinja2 template
Run it against all 3 VMs. Use `ansible-vault` to store a secret. Run it twice and verify idempotency (no changes on second run).
**Interview questions you must be able to answer:**
- "What's the difference between a playbook and a role?"
- "How do you handle idempotency in Ansible?"
- "What is `ansible-vault` and when do you use it?"
- "How does dynamic inventory work? When would you use it over static?"
- "What's the difference between `notify` and `when`?"
- "How did you test your playbooks before running on production?"
**Key concepts:** Roles directory structure, handlers, `become: yes`, Jinja2 templates, `ansible-vault`, dynamic inventory (AWS EC2 plugin), tags, `--check` dry-run mode, idempotency design.

---

### 13.2 Jenkins (Infosys claim)
**Resume claim:** "Owned CI/CD pipeline design for 8 applications using Jenkins and GitHub Actions — introduced build caching and parallel stages, reducing average build time by 35%"
**Gap:** CloudNotes uses GitHub Actions. Jenkins is not touched.
**Why it matters:** If you say Jenkins at Infosys, an interviewer from a similar background will immediately ask for details.
**Frequency:** `★★★` in Indian IT services interviews, `★★` in enterprise
**Difficulty:** `L2`
**Urgent side project:** Run Jenkins in Docker locally (`docker run -p 8080:8080 jenkins/jenkins:lts`). Create a Declarative Pipeline (`Jenkinsfile`) for any one CloudNotes service that: checkout → lint → test → docker build → push to DockerHub. Add a parallel stage (lint and test run in parallel). Add a shared library function for the Docker push step. Store DockerHub credentials in Jenkins Credentials Manager.
**Interview questions you must answer:**
- "Show me a Jenkinsfile. Explain each section."
- "What's the difference between declarative and scripted pipeline?"
- "How did you handle credentials in Jenkins?"
- "What is a shared library and why did you use it?"
- "How did you implement parallel stages? What was the speedup?"
- "How did you handle a failing stage — did it block everything or could you continue?"
**Key concepts:** `agent`, `stages`, `parallel`, `post { always/failure/success }`, credentials binding, shared libraries (`vars/` and `src/`), Blue Ocean UI, `withCredentials`, JCasC (Jenkins Configuration as Code).

---

### 13.3 Azure — practical depth
**Resume claim:** VMs, VNet, Azure SQL, Storage Account, App Gateway, Load Balancer, Azure Monitor, Key Vault, Azure DNS, Azure DevOps, Azure AD integration, IAM federation, multi-cloud VPN, HIPAA on Azure.
**Gap:** CloudNotes is AWS only. You have AZ-900 (fundamentals) but the resume claims operational depth.
**Why it matters:** Interviewers at companies using Azure will verify specifics. "Walk me through the VNet setup" or "How did you federate Azure AD with AWS IAM?" are direct traps for someone who hasn't done it.
**Frequency:** `★★★` at companies using Azure, Indian IT services firms
**Difficulty:** `L3`
**Urgent side project (do in phases):**
- Phase A (1 day): Create a Resource Group. Deploy a VNet with public + private subnets. Deploy a VM in each. Verify connectivity. Set up a Network Security Group. This proves basic Azure networking.
- Phase B (1 day): Deploy AKS (Azure Kubernetes Service) in the private subnet. Deploy auth-service on it. Set up Azure Container Registry (ACR) and pull from it. This proves AKS operations.
- Phase C (1 day): Set up Azure Key Vault. Store a secret. Access it from the AKS pod using Managed Identity (not hardcoded credentials). This proves secret management.
- Phase D (2 hours): Set up Azure DevOps pipeline for one service. Compare it to GitHub Actions. Know the differences cold.
**The multi-cloud VPN claim** — This is the riskiest item. Site-to-site VPN between AWS and Azure is a complex, expensive setup. Know the theory: AWS Virtual Private Gateway + Azure VPN Gateway + BGP or static routing + shared PSK. Be able to draw it. Say you helped configure and validate it, not that you solo-designed it.
**Key concepts to know cold:** Managed Identity vs Service Principal, Azure RBAC vs IAM (role assignments on resources), VNet peering vs VPN Gateway, NSG vs Security Groups, Azure AD App Registration, Workload Identity for AKS, difference between Azure Monitor and Prometheus.

---

### 13.4 HIPAA and GDPR compliance
**Resume claim:** "Delivered HIPAA and GDPR-compliant infrastructure — encryption at rest (KMS), encryption in transit (TLS), VPC network segmentation, CloudTrail audit logging, least-privilege IAM, documented compliance controls for client audit requirements"
**Gap:** The controls listed are real and you may have implemented them. But compliance interviewers ask WHY each control maps to which requirement.
**Why it matters:** Healthcare and fintech companies screen for this. "What does HIPAA's Technical Safeguard section require?" is a question you cannot answer by guessing.
**Frequency:** `★★` in healthcare, fintech, and any company with enterprise clients
**Difficulty:** `L2` (mostly study, not build)
**What to study (2 days of reading):**
HIPAA Technical Safeguards (45 CFR § 164.312) — the four categories:
1. Access Control — unique user IDs, emergency access, automatic logoff, encryption
2. Audit Controls — hardware/software activity recording → CloudTrail, CloudWatch Logs, VPC Flow Logs
3. Integrity Controls — ensure PHI isn't improperly altered → S3 object versioning, checksums
4. Transmission Security — encryption in transit → TLS everywhere, no HTTP endpoints

GDPR Article 32 — "appropriate technical and organisational measures":
- Pseudonymisation and encryption of personal data
- Ability to restore data (backup and restore)
- Regular testing of security measures (vulnerability scanning → Trivy/SonarQube)
- Data minimisation

**What you should be able to say in an interview:**
"For HIPAA we implemented: CloudTrail for all API call logging (audit control), KMS-encrypted RDS and S3 (encryption at rest), ACM certificates + enforced HTTPS via ALB listener rules (transmission security), least-privilege IAM roles per service (access control). We documented each control in a compliance matrix mapping the 164.312 sections to our specific AWS resources. For GDPR we ensured no PII was logged in application logs (checked via log scanning), data was stored only in eu-west-1 (data residency), and we could delete all user data on request (right to erasure — implemented as a delete API endpoint that cascades)."

---

### 13.5 Metrics on your resume — be able to defend every number
**Resume claims with specific numbers:**
- "Deployment time from 25 min to under 8 min" — be ready to explain: what was slow in the 25 min pipeline? Which specific changes brought it to 8 min? (parallel jobs? caching? removing unnecessary steps?)
- "Rollback time from 20 min to under 3 min" — explain: what was the old rollback process? (manual kubectl, redeploy, wait) vs new (ArgoCD app rollback command = 10 seconds, but pod restart takes ~2 min)
- "99.6% uptime" — know the math: 99.6% = 52.6 hours downtime per year = 4.4 hours per month. How did you measure it? (uptime robot, Grafana SLO dashboard, ALB 5xx rate?)
- "22% monthly cost reduction" — what specifically was reduced? (oversized EC2 instances? idle RDS? unused EBS volumes? S3 lifecycle policies?)
- "40% reduction in debugging time" — how did you measure debugging time before and after?
- "Blocking 100% of HIGH/CRITICAL CVEs before staging" — how? (Trivy with `--exit-code 1 --severity HIGH,CRITICAL` in CI, pipeline fails on any finding)

If you can't explain the methodology behind each number, an experienced interviewer will call it out immediately.

---

## Updated status tracking

| # | Topic | Priority | Status | Completed |
|---|---|---|---|---|
| 1.1 | Jenkins | HIGH — on resume | Not started | — |
| 1.2 | GitLab CI/CD | MEDIUM | Not started | — |
| 1.3 | Tekton | LOW | Not started | — |
| 1.4 | Multi-arch Docker builds | LOW | Not started | — |
| 2.1 | Istio service mesh | MEDIUM | Not started | — |
| 2.2 | Cluster Autoscaler / Karpenter | MEDIUM | Not started | — |
| 2.3 | CRDs and Operators | LOW | Not started | — |
| 2.4 | Advanced scheduling | MEDIUM | Not started | — |
| 2.5 | etcd backup/restore | MEDIUM | Not started | — |
| 2.6 | cert-manager | MEDIUM | Not started | — |
| 3.1 | OpenTelemetry + Jaeger | MEDIUM | Not started | — |
| 3.2 | Datadog / New Relic | LOW | Not started | — |
| 3.3 | ELK Stack | MEDIUM | Not started | — |
| 3.4 | SLO tooling (Sloth) | LOW | Not started | — |
| 4.1 | Terragrunt | LOW | Not started | — |
| 4.2 | Atlantis | LOW | Not started | — |
| 4.3 | Pulumi | LOW | Not started | — |
| 5.1 | HashiCorp Vault | MEDIUM | Not started | — |
| 5.2 | OPA / Kyverno | MEDIUM | Not started | — |
| 5.3 | Falco | LOW | Not started | — |
| 5.4 | SAST / Snyk | LOW | Not started | — |
| 6.1 | Istio traffic management | LOW | Not started | — |
| 6.2 | Cilium / eBPF | LOW | Not started | — |
| 7.1 | GCP | LOW | Not started | — |
| 7.2 | Azure + Azure DevOps | HIGH — on resume | Not started | — |
| 7.3 | Multi-cloud strategy | HIGH — on resume | Not started | — |
| 8.1 | PgBouncer | MEDIUM | Not started | — |
| 8.2 | Redis | MEDIUM | Not started | — |
| 8.3 | Kafka / message queues | LOW | Not started | — |
| 9.1 | Backstage | LOW | Not started | — |
| 9.2 | Crossplane | LOW | Not started | — |
| 10.1 | LitmusChaos | LOW | Not started | — |
| 10.2 | Runbook engineering | MEDIUM | Not started | — |
| 11.1 | Skaffold / Tilt | LOW | Not started | — |
| 12.1 | Incident management process | HIGH | Not started | — |
| 12.2 | Toil measurement | LOW | Not started | — |
| 12.3 | FinOps / Kubecost | MEDIUM | Not started | — |
| **13.1** | **Ansible** | **URGENT — on resume** | **Not started** | **—** |
| **13.2** | **Jenkins** | **URGENT — on resume** | **Not started** | **—** |
| **13.3** | **Azure depth** | **URGENT — on resume** | **Not started** | **—** |
| **13.4** | **HIPAA/GDPR** | **URGENT — on resume** | **Not started** | **—** |
| **13.5** | **Defend resume metrics** | **URGENT** | **Not started** | **—** |

---

*Updated: 2026-06-05. Resume-specific gaps added after reviewing NagaCharan_DevOpsEngineer_4+YOE.pdf.*
