# DevOps Mastery Checklist

> Your personal benchmark for becoming a production-trustworthy senior DevOps engineer.
>
> **How to use this:**
> - Junior topics = foundation. A mid-level engineer must own all of these.
> - Mid-level topics = operational depth. A senior engineer must own all junior + mid.
> - Senior topics = system thinking, architecture decisions, production judgment.
> - A checkbox is only earned when you can **explain it clearly to someone else AND implement it without documentation.**
> - Checking a box because you read about it is lying to yourself.

---

## How to read the levels

| Level | What it means |
|---|---|
| **Junior** | You know what it is, can use basic commands, can follow a guide |
| **Mid-level** | You can configure it, troubleshoot it, integrate it with other tools |
| **Senior** | You design it, defend trade-offs, recover it when it breaks at 3am |

---

## 1. Linux

### Junior
- [ ] Know the Linux filesystem structure — what lives in `/etc`, `/var`, `/proc`, `/tmp`, `/home`
- [ ] Use basic commands fluently: `ls`, `cd`, `cp`, `mv`, `rm`, `cat`, `grep`, `find`, `chmod`, `chown`
- [ ] Understand file permissions — read/write/execute, numeric notation (755, 644, 600)
- [ ] Manage processes: `ps aux`, `top`, `kill`, `pkill`, `systemctl start/stop/status/enable`
- [ ] Manage users and groups: `useradd`, `usermod`, `passwd`, `groups`, `/etc/sudoers`
- [ ] Install packages: `apt install`, `yum install`, `dnf install`
- [ ] Basic networking commands: `ip addr`, `ping`, `curl`, `wget`, `ss -tulpn`
- [ ] Edit files with `vi`/`vim` — open, insert, save, quit (`:wq`, `:q!`)
- [ ] Use redirects and pipes: `>`, `>>`, `|`, `2>&1`, `/dev/null`
- [ ] Write basic shell scripts: variables, `if/else`, `for` loops, functions, `exit` codes

### Mid-level
- [ ] Manage services with `systemd` — unit files, `journalctl -u servicename -f`
- [ ] Schedule jobs with `cron` — understand crontab syntax, `crontab -e`, `/etc/cron.d/`
- [ ] Configure SSH — `sshd_config`, key-based auth, `~/.ssh/authorized_keys`, `ssh-copy-id`
- [ ] Manage disks — `df -h`, `du -sh`, `lsblk`, `mount`/`umount`, understand LVM basics
- [ ] Troubleshoot network issues — `tcpdump`, `netstat -tulpn`, `lsof -i :PORT`, `traceroute`
- [ ] Monitor performance — `htop`, `iostat`, `vmstat`, `sar`, `free -h`, `uptime`
- [ ] Use text processing tools fluently — `sed`, `awk`, `cut`, `sort`, `uniq`, `wc`, `xargs`
- [ ] Understand environment variables — `.bashrc` vs `.bash_profile`, `export`, `env`, `source`
- [ ] Use `tmux` or `screen` for persistent sessions
- [ ] Understand `ulimits` — what `open files`, `max processes` limits are and how to change them
- [ ] Read `/proc` files — `/proc/cpuinfo`, `/proc/meminfo`, `/proc/net/tcp`
- [ ] Write shell scripts with proper error handling — `set -e`, `set -o pipefail`, `trap`

### Senior
- [ ] Understand Linux namespaces (pid, net, mnt, uts, ipc, user) — the foundation of containers
- [ ] Understand cgroups v1 and v2 — how container resource limits actually work
- [ ] Tune kernel parameters with `sysctl` — `net.ipv4.tcp_tw_reuse`, `fs.file-max`, `vm.swappiness`
- [ ] Understand OOM killer — how Linux decides which process to kill, how to prevent it
- [ ] Know `SIGTERM` vs `SIGKILL` — why graceful shutdown matters and how to implement it
- [ ] Debug with `strace` — trace system calls to understand what a process is doing
- [ ] Understand TCP tuning for high-concurrency environments — `TIME_WAIT`, `SO_REUSEADDR`
- [ ] Know SELinux/AppArmor basics — what MAC (mandatory access control) adds over DAC
- [ ] Understand seccomp profiles — how to restrict syscalls for containers
- [ ] Explain eBPF basics — what it is, why it matters for modern observability and networking
- [ ] Design shell scripts for production use — idempotency, logging, alerting on failure, retry logic

---

## 2. Git

### Junior
- [ ] `git init`, `clone`, `add`, `commit`, `push`, `pull`, `fetch`
- [ ] `git status`, `log --oneline`, `diff`, `show`
- [ ] Create and switch branches — `git checkout -b`, `git switch`
- [ ] Merge branches — `git merge`
- [ ] Write a `.gitignore` that covers your language/framework
- [ ] Understand remote vs local — `origin`, `upstream`, tracking branches

### Mid-level
- [ ] Rebase interactively — `git rebase -i HEAD~N` — squash, reword, fixup commits
- [ ] Cherry-pick specific commits across branches
- [ ] Use `git stash` — stash, pop, apply, list, drop
- [ ] Use `git bisect` to find which commit introduced a bug
- [ ] Use `git reflog` to recover a "lost" commit
- [ ] Understand merge strategies — fast-forward vs recursive vs squash — and when to use each
- [ ] Write meaningful commit messages — Conventional Commits format (`feat:`, `fix:`, `chore:`)
- [ ] Configure and use git hooks — `pre-commit`, `commit-msg`, `pre-push`
- [ ] Use `git blame` to find who changed a line and when
- [ ] Resolve merge conflicts properly — understand conflict markers, choose correct resolution
- [ ] Understand `CODEOWNERS` — automatic reviewer assignment based on file paths

### Senior
- [ ] Explain git internals — blob, tree, commit, tag objects — how git stores data
- [ ] Design a branching strategy for a team — GitFlow vs trunk-based, trade-offs for each
- [ ] Handle large files with `git-lfs` — what it does and when you need it
- [ ] Clean secrets from git history — `git filter-branch` or BFG Repo Cleaner
- [ ] Understand monorepo patterns and the tooling challenges they introduce
- [ ] Configure GPG commit signing — why it matters for supply chain security
- [ ] Design branch protection / ruleset strategy for an organisation
- [ ] Know when `git rebase` is dangerous on shared branches — and enforce it via policy

---

## 3. Networking

### Junior
- [ ] Explain the OSI model — what happens at each of the 7 layers
- [ ] Understand TCP vs UDP — when you'd choose each
- [ ] Read and write CIDR notation — `/24`, `/16`, calculate host ranges
- [ ] Explain how DNS resolution works — recursive resolver, authoritative server, TTL
- [ ] Know HTTP vs HTTPS — what TLS adds and why HTTP alone is unacceptable in production
- [ ] Know common ports — 22, 80, 443, 3306, 5432, 6379, 8080, 8443, 27017
- [ ] Use `ping`, `traceroute`, `nslookup`, `dig` for basic troubleshooting

### Mid-level
- [ ] Explain the TCP 3-way handshake and 4-way termination — why TIME_WAIT exists
- [ ] Understand TLS handshake — certificate chain, CA, leaf certificate, SNI
- [ ] Explain L4 vs L7 load balancing — what each can and cannot do
- [ ] Understand NAT — SNAT vs DNAT, how your laptop reaches the internet through a NAT gateway
- [ ] Configure firewall rules — iptables basics, security groups vs NACLs on AWS
- [ ] Explain reverse proxy vs forward proxy — when you'd use nginx vs Squid
- [ ] Understand CDN — how CloudFront caches, cache-hit vs cache-miss, cache invalidation
- [ ] Explain VPN types — site-to-site vs client VPN, when to use each

### Senior
- [ ] Design a VPC from scratch — CIDR planning, public/private subnet strategy, AZ distribution
- [ ] Explain BGP basics — how AWS routing and Transit Gateway use BGP
- [ ] Understand MTU and packet fragmentation — why this causes silent issues in VPNs and overlays
- [ ] Explain east-west vs north-south traffic in Kubernetes — why it matters for network policy design
- [ ] Understand service mesh networking — why mTLS, how Envoy intercepts traffic, sidecar injection
- [ ] Troubleshoot a network issue systematically — OSI layer by layer, from physical to application
- [ ] Design network segmentation for compliance — HIPAA, PCI-DSS requirements on network isolation
- [ ] Explain TCP congestion control — why it matters for latency-sensitive applications

---

## 4. CI/CD (Core Concepts)

### Junior
- [ ] Explain what CI is and the problem it solves
- [ ] Explain Continuous Delivery vs Continuous Deployment — the difference
- [ ] Know what an artifact is — binary, Docker image, helm chart
- [ ] Understand pipeline stages — build → test → scan → deploy
- [ ] Know what environment variables in pipelines are — and why not to hardcode values

### Mid-level
- [ ] Write pipeline-as-code (not clicking in a UI)
- [ ] Design parallel vs sequential stages — know when parallelism helps vs hurts
- [ ] Implement caching in CI — Docker layer cache, dependency cache (npm, pip, go modules)
- [ ] Manage secrets in pipelines — never in code, always injected at runtime
- [ ] Trigger pipelines based on branch patterns and path filters
- [ ] Implement integration tests in CI — docker-compose up, run tests, tear down
- [ ] Set up build failure notifications — Slack, email

### Senior
- [ ] Know DORA metrics — deployment frequency, lead time, MTTR, change failure rate — and how to measure them
- [ ] Design pipeline strategy for microservices — matrix builds, per-service triggers, shared templates
- [ ] Enforce security gates — SAST must pass, image scan must pass, secrets check must pass — before merge
- [ ] Understand GitOps vs push-based CD — trade-offs, when each is appropriate
- [ ] Design for deployment strategies — rolling, blue-green, canary — from the pipeline perspective
- [ ] Measure and reduce pipeline duration — find bottlenecks, parallelize, cache aggressively
- [ ] Design a self-hosted runner strategy — when, sizing, security concerns

---

## 5. GitHub Actions

### Junior
- [ ] Understand YAML workflow syntax — `on:`, `jobs:`, `steps:`, `uses:`, `run:`
- [ ] Know trigger types — `push`, `pull_request`, `workflow_dispatch`, `schedule`
- [ ] Use marketplace actions — `actions/checkout`, `actions/setup-python`, `docker/build-push-action`
- [ ] Use environment variables — `${{ env.VAR }}` and `${{ secrets.SECRET }}`
- [ ] Read workflow run logs and understand why a step failed

### Mid-level
- [ ] Define job dependencies with `needs:` — understand execution order
- [ ] Use matrix strategy — test across multiple OS versions or language versions simultaneously
- [ ] Write reusable workflows — `workflow_call` trigger, passing inputs and secrets
- [ ] Write composite actions — packaging multiple steps into a reusable action
- [ ] Set up self-hosted runners — install, register, label, use in workflows
- [ ] Use `actions/cache` effectively — cache key strategy, restore keys
- [ ] Use `upload-artifact` and `download-artifact` across jobs
- [ ] Configure environments with protection rules — required reviewers before production deploy
- [ ] Understand `GITHUB_TOKEN` permissions — principle of least privilege per workflow
- [ ] Use concurrency groups — cancel in-progress runs on new push

### Senior
- [ ] Configure OIDC for keyless AWS authentication — no long-lived AWS credentials in GitHub
- [ ] Pin all third-party actions to a full commit SHA — not a tag (supply chain security)
- [ ] Audit `GITHUB_TOKEN` permissions — set `permissions:` explicitly, never use broad defaults
- [ ] Write a custom Docker container action
- [ ] Design a reusable workflow template library for an organisation
- [ ] Debug failing workflows — enable `ACTIONS_RUNNER_DEBUG`, use `tmate` for SSH into runner
- [ ] Optimise billable minutes — cache aggressively, cancel redundant runs, right-size runners
- [ ] Understand GitHub Actions security model — what can a fork PR do? How to prevent secret exfiltration

---

## 6. Jenkins

### Junior
- [ ] Explain what Jenkins is — master/agent architecture, plugin ecosystem
- [ ] Create a Freestyle job — understand build triggers, build steps, post-build actions
- [ ] Read a basic `Jenkinsfile` — understand stages and steps
- [ ] Understand declarative pipeline syntax — `pipeline {}`, `agent`, `stages`, `steps`

### Mid-level
- [ ] Write a full declarative `Jenkinsfile` — with parallel stages, post-conditions, environment blocks
- [ ] Set up a Multibranch Pipeline — auto-discover branches and PRs
- [ ] Create and use a Shared Library — `vars/` for global steps, `src/` for classes
- [ ] Manage credentials — credential binding plugin, `withCredentials {}` block
- [ ] Configure agents/nodes — static agent vs dynamic (Kubernetes pod templates)
- [ ] Set up webhooks from GitHub/GitLab to trigger builds
- [ ] Use Blue Ocean UI for pipeline visualisation
- [ ] Configure build caching — `.m2` cache, npm cache between builds

### Senior
- [ ] Configure Jenkins as Code (JCasC) — manage Jenkins configuration via YAML in git
- [ ] Design Kubernetes-based agents — pod templates, ephemeral agents, no persistent agents
- [ ] Harden Jenkins security — matrix-based security, CSRF protection, script approval
- [ ] Design a shared library for an organisation — versioning, testing, documentation
- [ ] Explain Jenkins vs GitHub Actions vs GitLab CI trade-offs — when you'd keep Jenkins
- [ ] Plan Jenkins disaster recovery — backup strategies, restore from backup
- [ ] Optimise pipeline performance — executor tuning, distributed builds, agent affinity

---

## 7. Docker

### Junior
- [ ] Explain containers vs VMs — what isolation each provides, trade-offs
- [ ] Write a Dockerfile — `FROM`, `RUN`, `COPY`, `ADD`, `EXPOSE`, `CMD`, `ENTRYPOINT`
- [ ] Know `CMD` vs `ENTRYPOINT` — when to use each, how they combine
- [ ] Build, run, stop, remove containers — `docker build`, `run`, `ps`, `stop`, `rm`
- [ ] Map ports and mount volumes — `-p`, `-v`, bind mounts vs named volumes
- [ ] Pass environment variables — `-e`, `--env-file`
- [ ] Write a `docker-compose.yml` — services, networks, volumes, depends_on
- [ ] Read container logs — `docker logs -f`, understand stdout vs stderr

### Mid-level
- [ ] Write multi-stage Dockerfiles — why they reduce image size significantly
- [ ] Understand Docker layer caching — which instructions bust the cache, how to optimise order
- [ ] Write a proper `.dockerignore` — what to exclude and why
- [ ] Understand Docker networking modes — bridge, host, overlay — when to use each
- [ ] Add health checks to Docker containers — `HEALTHCHECK` instruction
- [ ] Run containers as non-root — why root in container is dangerous, how to fix it
- [ ] Apply resource limits — `--memory`, `--cpus` — how Docker enforces them via cgroups
- [ ] Use BuildKit — `DOCKER_BUILDKIT=1`, `--mount=type=cache`, `--secret`
- [ ] Understand image tag strategy — why `latest` is dangerous in production

### Senior
- [ ] Harden container security — read-only root filesystem, `no-new-privileges`, drop capabilities
- [ ] Build multi-architecture images — `docker buildx`, ARM64 + AMD64, manifest lists
- [ ] Sign container images — `cosign sign`, verify before deploy
- [ ] Explain containerd vs Docker — why Kubernetes deprecated Docker shim, what changed
- [ ] Analyse image layers — use `dive` to find bloated layers
- [ ] Generate SBOM (Software Bill of Materials) — `syft`, `docker sbom`
- [ ] Understand OCI image spec — what it is and why it matters for portability
- [ ] Design a secure image build pipeline — scan → sign → push → verify on deploy
- [ ] Manage a private container registry — ECR lifecycle policies, replication, pull-through cache

---

## 8. Terraform

### Junior
- [ ] Explain what IaC is and why it exists — the problem with clicking in a console
- [ ] Run `terraform init`, `plan`, `apply`, `destroy` — understand what each does
- [ ] Write basic resources — EC2, S3 bucket, security group in HCL
- [ ] Use variables and outputs — `variables.tf`, `outputs.tf`, `terraform.tfvars`
- [ ] Understand what the state file is — why losing it is catastrophic
- [ ] Use data sources — read existing resources without managing them

### Mid-level
- [ ] Configure remote state — S3 backend + DynamoDB lock table — understand why both are needed
- [ ] Write and consume modules — input variables, output values, module versioning
- [ ] Use workspaces for environment separation — understand their limitations
- [ ] Import existing resources into state — `terraform import`
- [ ] Manage state safely — `terraform state list`, `mv`, `rm`, `taint`
- [ ] Handle sensitive variables — `sensitive = true`, never commit secrets to tfvars
- [ ] Use `depends_on` and `lifecycle` blocks — `create_before_destroy`, `ignore_changes`
- [ ] Use `terraform console` for expression testing
- [ ] Format and validate — `terraform fmt`, `terraform validate` before every commit
- [ ] Read and understand a `terraform plan` output — additions, changes, destructions

### Senior
- [ ] Design a module library — interface design, backward compatibility, semantic versioning
- [ ] Lock provider versions — `required_providers` with exact or pessimistic constraints
- [ ] Understand state file security — encryption, access control, audit who touched state
- [ ] Handle Terraform at scale — split state by component, avoid single large state file
- [ ] Detect and remediate drift — `terraform plan` shows drift, design workflow around it
- [ ] Break and refactor Terraform safely — `state mv`, plan carefully, never destroy live infra by accident
- [ ] Write Terraform tests — `terraform test` (native) or terratest
- [ ] Estimate cost before apply — Infracost in CI pipeline
- [ ] Explain Terragrunt — what problem it solves, when plain Terraform is enough
- [ ] Explain Atlantis — GitOps for Terraform, plan-in-PR, apply-on-merge workflow

---

## 9. Ansible

### Junior
- [ ] Explain what Ansible is — agentless, SSH-based, push model
- [ ] Write a static inventory file — groups, variables per host
- [ ] Run ad-hoc commands — `ansible all -m ping`, `ansible webservers -m shell -a "uptime"`
- [ ] Write a basic playbook — `hosts`, `tasks`, common modules (`apt`, `copy`, `service`, `user`, `file`)
- [ ] Understand what idempotency means — running a playbook twice produces no changes

### Mid-level
- [ ] Write a proper Ansible role — `tasks/`, `handlers/`, `defaults/`, `vars/`, `templates/`, `files/`
- [ ] Use `ansible-vault` — encrypt secrets, use in playbooks with `--ask-vault-pass` or vault password file
- [ ] Write Jinja2 templates — variable substitution, conditionals, loops in templates
- [ ] Use conditionals (`when:`) and loops (`loop:`) correctly
- [ ] Understand variable precedence — 22 levels, know the most common ones: `defaults` < `vars` < `extra-vars`
- [ ] Use tags for selective execution — `--tags`, `--skip-tags`
- [ ] Configure dynamic inventory — AWS EC2 inventory plugin, auto-discover instances by tag
- [ ] Handle errors — `ignore_errors: yes`, `failed_when:`, `block/rescue/always`
- [ ] Use `ansible-lint` — catch common mistakes before running
- [ ] Design playbooks for idempotency — every task must be safe to run repeatedly

### Senior
- [ ] Use Ansible Galaxy and collections — install, version-pin, offline mirror
- [ ] Test roles with Molecule — write a test scenario, verify with testinfra/ansible
- [ ] Optimise performance — `forks`, `pipelining`, `async` tasks, `strategy: free`
- [ ] Use `ansible-pull` — pull mode for decentralised configuration
- [ ] Set up Ansible Tower/AWX — job templates, inventories, RBAC, scheduling
- [ ] Implement CIS benchmarks with Ansible — server hardening at scale
- [ ] Explain Ansible vs Terraform — configuration management vs infrastructure provisioning — and when each is wrong

---

## 10. Kubernetes

### Junior
- [ ] Explain what Kubernetes is — container orchestration, desired state vs actual state
- [ ] Know core resources — Pod, Deployment, Service (ClusterIP, NodePort, LoadBalancer)
- [ ] Use kubectl fluently — `get`, `describe`, `logs`, `exec -it`, `apply`, `delete`
- [ ] Understand YAML manifest structure — `apiVersion`, `kind`, `metadata`, `spec`
- [ ] Use namespaces — why they exist, how to work across namespaces
- [ ] Use ConfigMaps and Secrets — create, mount as env vars and volumes
- [ ] Understand labels and selectors — how Services find their Pods

### Mid-level
- [ ] Understand Deployment vs ReplicaSet — what Deployment adds on top
- [ ] Configure rolling updates — `maxSurge`, `maxUnavailable`, rollback with `kubectl rollout undo`
- [ ] Set resource requests and limits — what happens when a pod exceeds its limit (OOMKilled)
- [ ] Configure liveness and readiness probes — why both are needed, difference between them
- [ ] Use PersistentVolumes and PersistentVolumeClaims — storage classes, dynamic provisioning
- [ ] Configure Ingress — rules, host-based and path-based routing, TLS termination
- [ ] Write RBAC — `Role`, `ClusterRole`, `RoleBinding`, `ClusterRoleBinding`, `ServiceAccount`
- [ ] Configure HorizontalPodAutoscaler — CPU and memory-based scaling, understand the control loop
- [ ] Use DaemonSet and StatefulSet — when each is appropriate
- [ ] Write NetworkPolicies — default deny, whitelist specific traffic
- [ ] Configure Pod Disruption Budgets — protect availability during node maintenance
- [ ] Use node affinity and pod anti-affinity — spread pods across AZs for HA

### Senior
- [ ] Explain Kubernetes control plane components — API server, etcd, scheduler, controller manager, kubelet, kube-proxy
- [ ] Understand the scheduler — how it selects a node for a pod, predicates and priorities
- [ ] Explain etcd — why it's the source of truth, what happens if it loses quorum
- [ ] Back up and restore etcd — `etcdctl snapshot save/restore`, test the restore process
- [ ] Design admission controllers — validating webhook blocks a bad resource, mutating webhook patches it
- [ ] Write a Custom Resource Definition (CRD) and understand the operator pattern
- [ ] Design multi-tenancy — namespace isolation, RBAC boundaries, network policies, resource quotas
- [ ] Configure Cluster Autoscaler or Karpenter — understand difference, configure for spot instances
- [ ] Plan a Kubernetes version upgrade — control plane first, then node groups, understand API deprecations
- [ ] Design a Kubernetes security hardening plan — pod security standards, read-only FS, non-root, no privilege escalation
- [ ] Explain CNI — what it does, why different CNIs (Calico, Cilium, Flannel) make different trade-offs
- [ ] Cost-optimize a Kubernetes cluster — rightsizing, spot nodes, Kubecost, bin packing

---

## 11. SonarQube

### Junior
- [ ] Explain what SAST is — static analysis, finds issues in code without running it
- [ ] Understand the SonarQube quality gate — what makes a gate pass or fail
- [ ] Read the SonarQube dashboard — bugs vs vulnerabilities vs code smells vs coverage vs duplication
- [ ] Run a local scan with SonarScanner

### Mid-level
- [ ] Integrate SonarQube in CI — fail the pipeline when quality gate fails
- [ ] Configure branch analysis — scan feature branches, compare to main
- [ ] Import test coverage — link coverage reports from pytest/jest/jacoco to SonarQube
- [ ] Configure exclusions — ignore generated code, vendor directories
- [ ] Manage rules — activate/deactivate specific rules, understand rule severity

### Senior
- [ ] Set up and administer SonarQube — server setup, database, backup
- [ ] Design custom quality profiles — organisation-wide coding standards
- [ ] Define and enforce quality gates for different teams — not one size fits all
- [ ] Manage security hotspots — triage, investigate, mark as safe or escalate
- [ ] Map findings to OWASP Top 10 — communicate security risk to development teams
- [ ] Decide SonarCloud vs self-hosted — cost, data residency, maintenance trade-offs

---

## 12. Trivy

### Junior
- [ ] Understand what a CVE is — Common Vulnerabilities and Exposures
- [ ] Run `trivy image <image>` locally — read the output, understand severity levels
- [ ] Know severity levels — CRITICAL > HIGH > MEDIUM > LOW > UNKNOWN — and which to block on

### Mid-level
- [ ] Add Trivy to CI — `--exit-code 1 --severity CRITICAL,HIGH` blocks the pipeline
- [ ] Scan multiple targets — filesystem, git repos, Terraform IaC, Kubernetes manifests
- [ ] Manage `.trivyignore` — suppress false positives with justification
- [ ] Keep Trivy DB updated — understand how vulnerability DB works
- [ ] Generate SBOM — `trivy sbom` output, why it matters for supply chain

### Senior
- [ ] Deploy Trivy Operator in Kubernetes — continuous scanning of running workloads
- [ ] Design a vulnerability management workflow — scan → triage → fix → rescan → accept risk with justification
- [ ] Understand VEX (Vulnerability Exploitability eXchange) — when a CVE exists but is not exploitable
- [ ] Compare Trivy vs Snyk vs Grype — trade-offs, why you might use more than one
- [ ] Integrate image signing with scanning — sign only after clean scan, verify before deploy

---

## 13. Checkov

### Junior
- [ ] Explain what IaC security scanning is — find misconfigurations before `terraform apply`
- [ ] Run `checkov -d .` on a Terraform directory — read the output
- [ ] Understand what a failed check means — what the risk is, what the fix is

### Mid-level
- [ ] Add Checkov to CI — fail PR when new HIGH/CRITICAL checks fail
- [ ] Skip specific checks with justification — `# checkov:skip=CKV_AWS_xxx:reason`
- [ ] Scan multiple IaC types — Terraform, Kubernetes YAML, Dockerfile, CloudFormation
- [ ] Use baseline files — track existing failures, only fail on new ones

### Senior
- [ ] Write custom Checkov policies — Python-based checks for org-specific standards
- [ ] Compare Checkov vs tfsec vs terrascan — when to use each or combine
- [ ] Integrate into a CSPM (Cloud Security Posture Management) workflow
- [ ] Use Checkov to enforce tagging standards, naming conventions, encryption requirements org-wide

---

## 14. OWASP

### Junior
- [ ] Know the OWASP Top 10 by name — all 10, not just 3
- [ ] Explain what injection is — SQL injection, command injection, how they work
- [ ] Explain broken authentication — what it means, examples
- [ ] Explain XSS — what it is, stored vs reflected

### Mid-level
- [ ] Map OWASP Top 10 to specific controls in your pipeline — which tool covers which category
- [ ] Use OWASP ZAP for DAST — scan a running application for vulnerabilities
- [ ] Use OWASP Dependency-Check — scan libraries for known CVEs
- [ ] Understand OWASP Testing Guide — what categories of tests exist

### Senior
- [ ] Design a DevSecOps program around OWASP — shift-left, integrate at each stage
- [ ] Conduct threat modelling — STRIDE methodology, identify threats before building
- [ ] Configure WAF rules based on OWASP Core Rule Set (CRS) — understand rule groups
- [ ] Understand OWASP SAMM — Software Assurance Maturity Model, assess and improve security maturity

---

## 15. AWS

### EC2

#### Junior
- [ ] Launch an EC2 instance — choose AMI, instance type, security group, key pair
- [ ] Connect via SSH — understand key pair, security group port 22
- [ ] Understand security groups — stateful, inbound/outbound rules
- [ ] Attach and resize EBS volumes
- [ ] Use user data scripts — run commands on first boot

#### Mid-level
- [ ] Write launch templates — version management, use with Auto Scaling Groups
- [ ] Configure Auto Scaling Groups — min/max/desired, scaling policies, cooldown
- [ ] Understand EBS volume types — gp2 vs gp3 vs io1 vs st1 vs sc1 — choose correctly
- [ ] Create and restore EBS snapshots — understand cross-AZ and cross-region copy
- [ ] Understand instance metadata service — IMDS v1 vs v2, why v1 is a security risk
- [ ] Use placement groups — cluster vs spread vs partition — when each matters

#### Senior
- [ ] Design spot instance strategy — interruption handling, mixed instance types, Spot Fleet
- [ ] Right-size instances — use CloudWatch metrics, Compute Optimizer recommendations
- [ ] Understand Nitro system — hypervisor-level security, ENA networking, NVMe storage
- [ ] Design for HA across AZs — which resources are AZ-scoped, how to handle AZ failure
- [ ] Optimize EC2 cost — reserved instances vs savings plans vs spot vs on-demand decision

---

### RDS

#### Junior
- [ ] Create an RDS instance — engine, instance class, storage, backup window
- [ ] Connect from an application — connection string, security group allowing app subnet
- [ ] Understand automated backups and manual snapshots

#### Mid-level
- [ ] Understand Multi-AZ vs Read Replica — Multi-AZ = HA failover, Read Replica = read scale-out
- [ ] Configure parameter groups — tune PostgreSQL/MySQL settings
- [ ] Use RDS Proxy — why connection pooling at the proxy level reduces DB load
- [ ] Use Performance Insights — identify slow queries, wait events
- [ ] Encrypt RDS with KMS — understand encryption at rest implications

#### Senior
- [ ] Explain Aurora vs RDS — when Aurora's shared storage and reader endpoints justify the cost
- [ ] Design a failover test — promote a Read Replica, measure RTO
- [ ] Plan a migration — DMS for live migration, minimal downtime strategies
- [ ] Design point-in-time recovery — understand WAL archiving, recovery targets
- [ ] Explain cross-region replication — use cases, RPO implications

---

### S3

#### Junior
- [ ] Create a bucket, upload/download objects
- [ ] Understand storage classes — Standard, IA, Glacier — and when to use each
- [ ] Understand public vs private access — bucket policy vs ACL vs Block Public Access

#### Mid-level
- [ ] Enable versioning — understand delete markers, how to restore previous versions
- [ ] Write lifecycle policies — transition to cheaper storage class, expire old objects
- [ ] Write bucket policies — allow specific IAM roles, deny unencrypted uploads
- [ ] Generate presigned URLs — temporary access without credentials
- [ ] Configure S3 event notifications — trigger Lambda, SQS, SNS on object events
- [ ] Enable CORS — when a browser needs to directly access S3

#### Senior
- [ ] Configure cross-region replication — replication rules, IAM for replication role
- [ ] Enable Object Lock — WORM storage for compliance, governance vs compliance mode
- [ ] Use S3 as Terraform state backend — encryption, versioning, locking
- [ ] Design cost optimization — Intelligent-Tiering, lifecycle rules, multipart upload cleanup
- [ ] Understand S3 request cost — GET, PUT, LIST pricing, reduce unnecessary calls

---

### ECS

#### Junior
- [ ] Explain ECS concepts — cluster, service, task definition, task
- [ ] Understand Fargate vs EC2 launch type — trade-offs

#### Mid-level
- [ ] Write a task definition — container definitions, CPU/memory, environment variables, secrets
- [ ] Configure IAM task roles — least-privilege access to AWS services
- [ ] Set up a service with ALB — target group, health check, rolling deploy
- [ ] Configure auto-scaling — target tracking on CPU or ALB request count
- [ ] Inject secrets from Secrets Manager into tasks

#### Senior
- [ ] Explain ECS vs EKS decision — when ECS is simpler and correct, when EKS is justified
- [ ] Configure capacity providers — Fargate Spot for cost, Fargate for reliability
- [ ] Design blue-green deployments on ECS — CodeDeploy integration
- [ ] Monitor ECS with Container Insights — task-level metrics in CloudWatch

---

### EKS

#### Junior
- [ ] Explain what EKS manages — control plane is AWS-managed, you manage node groups
- [ ] Configure `kubectl` for EKS — `aws eks update-kubeconfig`
- [ ] Understand managed node groups vs self-managed

#### Mid-level
- [ ] Configure IRSA (IAM Roles for Service Accounts) — how pods get AWS permissions without node-level roles
- [ ] Configure cluster autoscaler — annotations on node groups, auto-discovery
- [ ] Use Fargate profiles — which pods run on Fargate vs EC2 nodes
- [ ] Install EKS add-ons — CoreDNS, kube-proxy, VPC CNI, EBS CSI driver
- [ ] Configure EKS control plane logging — API server, audit, authenticator logs to CloudWatch

#### Senior
- [ ] Understand EKS VPC CNI networking — each pod gets a VPC IP, secondary IPs on ENI
- [ ] Configure Karpenter — NodePools, EC2NodeClass, spot diversification
- [ ] Plan EKS cluster upgrades — Kubernetes version upgrade process, add-on compatibility
- [ ] Harden EKS security — private cluster, envelope encryption with KMS, pod security standards
- [ ] Design multi-cluster strategy — separate clusters for environments, or namespaces — trade-offs

---

### ECR

#### Junior
- [ ] Push and pull images to ECR — authenticate, tag, push, pull
- [ ] Understand public vs private ECR repositories

#### Mid-level
- [ ] Configure lifecycle policies — keep last N images, delete untagged images
- [ ] Enable ECR scan on push — see vulnerabilities on upload
- [ ] Configure cross-account access — ECR resource policy for another account to pull
- [ ] Replicate ECR to another region — disaster recovery, multi-region deploy

#### Senior
- [ ] Configure ECR pull-through cache — cache from DockerHub to avoid rate limits
- [ ] Use VPC endpoints for ECR — keep image pulls inside VPC, no internet traffic
- [ ] Integrate image signing with ECR — cosign, Notation for supply chain security

---

### ELB (ALB / NLB)

#### Junior
- [ ] Explain what a load balancer does — distribute traffic, health check backends
- [ ] Create an ALB — listeners, target groups, health checks
- [ ] Understand target types — instance, IP, Lambda

#### Mid-level
- [ ] Configure path-based and host-based routing — multiple services on one ALB
- [ ] Configure weighted target groups — canary deployments, traffic splitting
- [ ] Enable sticky sessions — when needed, trade-offs
- [ ] Integrate WAF with ALB — attach Web ACL
- [ ] Understand ALB vs NLB — L7 vs L4, when NLB is needed (preserve source IP, ultra-low latency)

#### Senior
- [ ] Analyse ALB access logs — S3, Athena queries, identify slow requests and errors
- [ ] Understand connection draining — why it matters for zero-downtime deploys
- [ ] Configure NLB with TLS passthrough — end-to-end encryption, no termination at LB
- [ ] Design cross-zone load balancing strategy — trade-offs on data transfer cost vs distribution

---

### Secrets Manager

#### Junior
- [ ] Store and retrieve a secret — console and CLI
- [ ] Understand secret versions — AWSCURRENT, AWSPREVIOUS

#### Mid-level
- [ ] Configure automatic rotation — Lambda rotation function, understand rotation stages
- [ ] Compare Secrets Manager vs SSM Parameter Store — cost, features, when to use each
- [ ] Access secrets from EKS using External Secrets Operator — CSI driver approach
- [ ] Configure cross-account secret access — resource policy on the secret

#### Senior
- [ ] Design secret rotation without downtime — application must handle both old and new secret during rotation
- [ ] Audit secret access with CloudTrail — who retrieved which secret when
- [ ] Design a secrets management strategy for microservices — which pattern for which service

---

### IAM

#### Junior
- [ ] Understand users, groups, roles, policies — what each is for
- [ ] Understand managed vs inline policies
- [ ] Enable MFA on root and IAM users
- [ ] Understand difference between access keys (programmatic) vs console access

#### Mid-level
- [ ] Write IAM policies — Action, Resource, Effect, Condition — use least privilege
- [ ] Configure IAM roles for EC2 and Lambda — instance profile, execution role
- [ ] Use permission boundaries — limit what a role can do even if policies allow more
- [ ] Implement cross-account access — assume role, trust policy design
- [ ] Use IAM conditions — `aws:RequestedRegion`, `aws:SourceIp`, `s3:prefix`
- [ ] Understand SCPs (Service Control Policies) — organisation-level guardrails, not grants

#### Senior
- [ ] Use IAM Access Analyzer — find overly permissive policies, external access
- [ ] Use IAM policy simulator — test what a role can actually do before deploying
- [ ] Design ABAC (Attribute-Based Access Control) — tag-based policies at scale
- [ ] Configure identity federation — SAML 2.0, OIDC, web identity federation
- [ ] Design IAM for compliance — who has access to what, audit trail via CloudTrail
- [ ] Explain IRSA — how Kubernetes service accounts map to IAM roles via OIDC provider

---

### VPC

#### Junior
- [ ] Understand VPC, subnets, internet gateway, route tables
- [ ] Understand public vs private subnets — what makes a subnet public
- [ ] Understand security groups vs NACLs — stateful vs stateless

#### Mid-level
- [ ] Design a multi-AZ VPC — public, private, database subnets in each AZ
- [ ] Configure NAT Gateway — why private subnets need it, cost implications
- [ ] Use VPC peering — transitive peering limitation (why Transit Gateway exists)
- [ ] Configure VPC endpoints — Gateway (S3, DynamoDB free) vs Interface (cost per hour)
- [ ] Enable VPC Flow Logs — what they capture, analysing with Athena or CloudWatch Insights
- [ ] Plan CIDR blocks — avoid overlap with on-prem, future peering requirements

#### Senior
- [ ] Design Transit Gateway hub-spoke — centralised routing, shared services VPC
- [ ] Configure AWS PrivateLink — expose a service without VPC peering, keep traffic in AWS
- [ ] Design network segmentation for compliance — separate VPCs for PCI, HIPAA workloads
- [ ] Configure AWS Network Firewall — inspect and filter traffic, IDS/IPS
- [ ] Plan a large-scale VPC design — hundreds of accounts, AWS Organizations, IP address management

---

### CloudFront

#### Junior
- [ ] Understand what a CDN is — edge caching, reduce origin load, lower latency
- [ ] Create a CloudFront distribution — S3 origin or ALB origin

#### Mid-level
- [ ] Configure cache behaviours — TTL, cache keys, compress objects
- [ ] Invalidate cache — `/*` vs specific paths, understand cost
- [ ] Configure custom error pages — return a friendly 404 from S3
- [ ] Restrict S3 access to CloudFront — Origin Access Control (OAC)
- [ ] Enable HTTPS only — redirect HTTP to HTTPS, minimum TLS version

#### Senior
- [ ] Integrate WAF with CloudFront — global protection, rate limiting at edge
- [ ] Use Origin Shield — reduce origin hits with an additional caching layer
- [ ] Analyse CloudFront real-time logs — send to Kinesis, query with Athena
- [ ] Optimise cache-hit ratio — identify missed opportunities, reduce origin load
- [ ] Configure CloudFront for API caching — cache GET responses, invalidate on write

---

### WAF

#### Junior
- [ ] Explain what a WAF does — filter HTTP traffic, block known attack patterns
- [ ] Understand Web ACLs — rules evaluated top-to-bottom, first match wins

#### Mid-level
- [ ] Use AWS Managed Rules — Core Rule Set, Known Bad Inputs, IP Reputation list
- [ ] Configure rate limiting — count requests per IP per 5 minutes, block when exceeded
- [ ] Create IP sets — block lists and allow lists
- [ ] Enable WAF logging — log to S3 or CloudWatch, understand what's logged

#### Senior
- [ ] Write custom rule groups — regex match, geographic block, size constraints
- [ ] Map OWASP CRS rules to AWS Managed Rules — know what's covered and what's not
- [ ] Automate IP blocking — GuardDuty finding → Lambda → WAF IP set update
- [ ] Understand WAF capacity units — WCU limits, cost implications of complex rules

---

### Route 53

#### Junior
- [ ] Understand DNS record types — A, AAAA, CNAME, MX, TXT, NS, SOA
- [ ] Create a hosted zone and add records
- [ ] Understand alias records vs CNAME — why alias is preferred for AWS resources

#### Mid-level
- [ ] Configure routing policies — simple, weighted, latency-based, failover, geolocation
- [ ] Set up health checks — endpoint monitoring, trigger failover on unhealthy
- [ ] Use private hosted zones — DNS inside VPC for internal service discovery
- [ ] Configure Route 53 Resolver — hybrid DNS between on-prem and AWS

#### Senior
- [ ] Execute zero-downtime domain migration — TTL reduction strategy, staged cutover
- [ ] Enable DNSSEC — protect against DNS spoofing, understand key signing
- [ ] Design DNS-based service discovery for microservices
- [ ] Explain Route 53 Resolver endpoints — inbound and outbound, when needed

---

### Lambda

#### Junior
- [ ] Create a Lambda function — runtime, handler, execution role, test event
- [ ] Understand Lambda triggers — API Gateway, S3 events, EventBridge, SQS
- [ ] Use environment variables in Lambda

#### Mid-level
- [ ] Use Lambda Layers — shared code and dependencies, size limits
- [ ] Understand concurrency — reserved vs provisioned, throttling behaviour
- [ ] Understand cold starts — why they happen, how to mitigate (provisioned concurrency, warm-up)
- [ ] Run Lambda in a VPC — why it reduces cold start performance, security trade-off
- [ ] Access Secrets Manager from Lambda — without hardcoding credentials
- [ ] Use Lambda destinations — on success/failure routing to SQS or SNS

#### Senior
- [ ] Right-size Lambda memory — CPU scales with memory, use Lambda Power Tuning tool
- [ ] Implement Lambda@Edge — what runs at edge vs regional, limitations
- [ ] Design for Lambda at scale — event source mapping tuning, batch size, concurrency math
- [ ] Instrument Lambda with X-Ray — trace end-to-end requests across services
- [ ] Use Lambda for security automation — auto-remediate GuardDuty findings, rotate secrets

---

### API Gateway

#### Junior
- [ ] Understand REST API vs HTTP API — HTTP API is cheaper, fewer features
- [ ] Create an API with Lambda proxy integration
- [ ] Deploy to a stage — dev, staging, prod stages

#### Mid-level
- [ ] Configure authorizers — IAM, Cognito, Lambda custom authorizer
- [ ] Configure usage plans and API keys — rate limiting per consumer
- [ ] Set up custom domain names — ACM certificate, Route 53 alias record
- [ ] Configure CORS — preflight OPTIONS handling
- [ ] Understand VPC Link — route API Gateway to private ALB/NLB

#### Senior
- [ ] Choose between API Gateway vs ALB vs CloudFront — cost and feature comparison
- [ ] Design request/response transformation — mapping templates, without Lambda
- [ ] Configure throttling — account-level, stage-level, method-level limits
- [ ] Debug API Gateway — CloudWatch logging, X-Ray tracing, execution logs

---

### CloudWatch

#### Junior
- [ ] Understand metrics, alarms, dashboards, logs — what each is for
- [ ] Create a threshold-based alarm — CPU > 80% for 5 minutes
- [ ] Write log queries in CloudWatch Logs Insights — basic filter and field extraction

#### Mid-level
- [ ] Create metric filters — extract numeric values from log lines, publish as custom metric
- [ ] Install and configure CloudWatch Agent — collect memory and disk metrics (not built-in)
- [ ] Enable Container Insights — EKS/ECS pod-level metrics
- [ ] Write CloudWatch Logs Insights queries — parse JSON logs, aggregate, find patterns
- [ ] Create composite alarms — only alert when multiple conditions are true simultaneously

#### Senior
- [ ] Use Embedded Metric Format — emit structured metrics from Lambda/application logs
- [ ] Design cross-account observability — CloudWatch sharing, source accounts
- [ ] Compare CloudWatch vs Prometheus — when to use each for Kubernetes observability
- [ ] Optimise CloudWatch costs — log retention policies, metric resolution, alarm count
- [ ] Design SLO dashboards in CloudWatch — availability and latency metrics aligned to SLOs

---

## 16. Prometheus

### Junior
- [ ] Explain what metrics are and why they're different from logs
- [ ] Understand Prometheus data model — metric name, labels, value, timestamp
- [ ] Know the four metric types — Counter, Gauge, Histogram, Summary — and when to use each
- [ ] Write basic PromQL — `rate()`, `sum()`, `by()`, `increase()`

### Mid-level
- [ ] Configure scrape targets — `prometheus.yml` scrape_configs
- [ ] Use ServiceMonitor and PodMonitor — Prometheus Operator pattern
- [ ] Write alerting rules — `expr`, `for`, `labels`, `annotations`
- [ ] Configure Alertmanager — routes, receivers, grouping, inhibition, silences
- [ ] Use `histogram_quantile` correctly — P95 latency, understand bucket boundaries
- [ ] Understand label cardinality — why high-cardinality labels destroy Prometheus performance
- [ ] Write recording rules — precompute expensive queries for dashboard speed

### Senior
- [ ] Design Prometheus federation — hierarchical or cross-cluster scraping
- [ ] Configure remote write — Thanos, Cortex, or Mimir for long-term storage and HA
- [ ] Understand TSDB internals — blocks, WAL, compaction — how data is stored on disk
- [ ] Plan storage and retention — disk sizing based on series count × retention period
- [ ] Write a custom exporter — expose application metrics via `/metrics` endpoint
- [ ] Secure Prometheus — no built-in auth, reverse proxy with auth, network policy restrictions
- [ ] Design multi-cluster observability — Thanos Query aggregating multiple Prometheuses

---

## 17. Grafana

### Junior
- [ ] Connect a Prometheus data source
- [ ] Create a dashboard with basic panels — time series, stat, gauge, table
- [ ] Use dashboard variables — filter by namespace, service, environment
- [ ] Share a dashboard — export JSON, Grafana URL with time range

### Mid-level
- [ ] Set up Grafana alerting — alert rules, contact points, notification policies
- [ ] Use transformations — join queries, calculate fields, filter by value
- [ ] Provision dashboards and datasources as config — `provisioning/` directory in Grafana
- [ ] Use annotations — mark deployments or incidents on graphs
- [ ] Connect Loki data source — correlate logs with metrics on the same dashboard
- [ ] Build the 4 Golden Signals dashboard — traffic, errors, latency, saturation

### Senior
- [ ] Manage Grafana as code — Terraform Grafana provider, Grafonnet (Jsonnet)
- [ ] Design dashboards for on-call — what information matters at 3am, information hierarchy
- [ ] Set up Grafana SSO — LDAP or OAuth integration
- [ ] Prevent dashboard sprawl — folder structure, governance, standards
- [ ] Understand Grafana Mimir — scalable Prometheus-compatible backend
- [ ] Integrate Grafana with incident management — link alerts to runbooks, PagerDuty

---

## 18. Loki

### Junior
- [ ] Understand what log aggregation is — ship logs from many sources to one place
- [ ] Understand Loki's approach — label-based indexing (like Prometheus, not Elasticsearch)
- [ ] Write basic LogQL — `{app="note-service"} |= "ERROR"`
- [ ] Install Promtail — basic config to ship logs from a file or Docker

### Mid-level
- [ ] Design a label strategy — few, low-cardinality labels (avoid logging every request URL)
- [ ] Parse structured JSON logs — `| json` parser in LogQL, extract fields
- [ ] Configure Promtail pipeline stages — `json`, `regex`, `timestamp`, `labels`
- [ ] Create metric alerts from logs — `count_over_time`, rate of errors
- [ ] Configure log retention — per-stream retention, global retention

### Senior
- [ ] Understand Loki architecture — distributor, ingester, querier, ruler, compactor
- [ ] Configure S3 as Loki backend — chunks and indexes stored in object storage
- [ ] Scale Loki — microservices mode for high ingestion
- [ ] Write advanced LogQL — `unwrap`, metric extraction from logs, range aggregations
- [ ] Decide between Loki vs ELK vs Datadog Logs — cost, operations overhead, query power

---

## 19. ELK Stack

### Junior
- [ ] Understand what each component does — Elasticsearch (store/search), Logstash (process), Kibana (visualise)
- [ ] Understand the index concept — like a database table for logs
- [ ] Query logs in Kibana using KQL — simple searches and field filters
- [ ] Ship logs using Filebeat — basic config

### Mid-level
- [ ] Configure Index Lifecycle Management (ILM) — hot → warm → cold → delete phases
- [ ] Write index templates and mappings — define field types before indexing
- [ ] Write a Logstash pipeline — input (Beats), filter (grok, mutate, json), output (Elasticsearch)
- [ ] Use Ingest pipelines — lighter alternative to Logstash for simple transformations
- [ ] Understand cluster health — green (all shards assigned), yellow (replicas unassigned), red (primary missing)
- [ ] Size shards correctly — 30-50GB per shard rule, avoid too many small shards

### Senior
- [ ] Design an Elasticsearch cluster — master, data, coordinating, ingest node roles
- [ ] Configure cross-cluster replication — disaster recovery, geo-distributed search
- [ ] Harden Elasticsearch — TLS, RBAC, field-level security, audit logging
- [ ] Tune performance — JVM heap (50% of RAM max), refresh interval, `index.codec`
- [ ] Snapshot and restore — register an S3 repository, automate backups
- [ ] Optimise storage cost — ILM to move to frozen/cold tier, compression settings

---

## 20. Helm

### Junior
- [ ] Explain what Helm is — Kubernetes package manager, templating engine
- [ ] Install a public chart from Artifact Hub — `helm install`, `helm upgrade`, `helm uninstall`
- [ ] Understand chart structure — `Chart.yaml`, `values.yaml`, `templates/`
- [ ] Override values — `-f custom-values.yaml`, `--set key=value`

### Mid-level
- [ ] Write a Helm chart from scratch — deployment, service, ingress, configmap templates
- [ ] Use template functions — `toYaml`, `quote`, `default`, `required`, `if`, `range`, `with`
- [ ] Write Helm hooks — `pre-install`, `pre-upgrade`, `post-upgrade` for migrations
- [ ] Use chart dependencies — add subcharts in `Chart.yaml`
- [ ] Use Helmfile — manage multiple Helm releases with one file
- [ ] Override values per environment — `values-dev.yaml`, `values-prod.yaml`

### Senior
- [ ] Design a reusable chart — parameterise everything, document all values
- [ ] Compare Helm vs Kustomize — Helm for packaging and distribution, Kustomize for environment overlays
- [ ] Write a Helm library chart — shared templates imported by multiple charts
- [ ] Test Helm charts — `helm unittest`, `chart-testing` (ct)
- [ ] Host a private chart repository — OCI registry in ECR, ChartMuseum
- [ ] Design values structure for multi-environment — avoid duplication, use `global` section

---

## 21. ArgoCD and GitOps

### Junior
- [ ] Explain GitOps — desired state in git = actual state in cluster, ArgoCD is the agent
- [ ] Understand an ArgoCD Application — source repo, target cluster, sync status
- [ ] Sync an application — manual sync, understand what changes are applied
- [ ] Navigate ArgoCD UI — application health, sync status, resource tree

### Mid-level
- [ ] Write an Application manifest — `repoURL`, `path`, `targetRevision`, `destination`
- [ ] Configure sync policies — automated sync, prune, self-heal — understand each
- [ ] Use App of Apps pattern — one root app manages child apps
- [ ] Use ApplicationSet — generate apps from git directory structure or cluster list
- [ ] Use sync waves — `argocd.argoproj.io/sync-wave` to order resource creation
- [ ] Integrate Helm and Kustomize with ArgoCD — `helm.releaseName`, `kustomize.version`
- [ ] Perform a rollback — `argocd app rollback` vs `git revert` — understand the difference
- [ ] Configure ArgoCD RBAC — projects, roles, who can sync what

### Senior
- [ ] Solve the secrets problem in GitOps — Sealed Secrets, External Secrets Operator, Vault Agent — trade-offs
- [ ] Use ArgoCD Image Updater — auto-commit image tag updates to git, trigger sync
- [ ] Deploy ArgoCD in HA mode — multi-replica, Redis HA, Dex for SSO
- [ ] Manage multi-cluster GitOps — hub cluster runs ArgoCD, spoke clusters are targets
- [ ] Use Argo Rollouts — canary and blue-green deployments with automated analysis
- [ ] Design GitOps repo structure — monorepo vs polyrepo, folder structure conventions
- [ ] Explain when GitOps is NOT the right tool — ad-hoc debugging, stateful workloads

---

## Final check — Production readiness thinking

Before calling yourself senior, you should be able to answer these without hesitation:

- [ ] A pod is in `CrashLoopBackOff`. Walk me through your diagnosis — exactly which commands, in which order.
- [ ] Your CI pipeline is taking 45 minutes. How do you cut it to under 10?
- [ ] Terraform plan shows a destroy on a production RDS instance. What do you do?
- [ ] An alert fires at 3am: error rate on note-service is 12%. Walk me through the next 20 minutes.
- [ ] A developer asks to merge directly to main "just this once." What do you say and why?
- [ ] Your EKS cluster nodes are at 90% memory. What are your options in order of risk?
- [ ] A secret was accidentally committed to a public GitHub repository 2 hours ago. What do you do right now?
- [ ] You need to add a NOT NULL column to a PostgreSQL table with 50 million rows in production. How?
- [ ] Your Prometheus disk is 95% full at 11pm. What do you do?
- [ ] A new engineer asks: "Why can't I just use `latest` as the image tag?" Explain it clearly.

---

*Updated: 2026-06-07. Work through this systematically. One tool, one level at a time. Do not skip.*
