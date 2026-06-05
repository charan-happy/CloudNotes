<div align="center">

# ☁️ CloudNotes

### _Write. Store. Own it._

**A cloud-native, notes-that-think platform — built like a real enterprise, one microservice at a time.**

[![Python](https://img.shields.io/badge/Auth-Python%203.12%20·%20FastAPI-3776AB?logo=python&logoColor=white)](#-the-services)
[![Go](https://img.shields.io/badge/Notes-Go%201.25%20·%20Gin-00ADD8?logo=go&logoColor=white)](#-the-services)
[![Java](https://img.shields.io/badge/Users-Java%2017%20·%20Spring%20Boot-6DB33F?logo=spring&logoColor=white)](#-the-services)
[![Node](https://img.shields.io/badge/Analytics-Node%2020%20·%20Express-339933?logo=node.js&logoColor=white)](#-the-services)
[![Realtime](https://img.shields.io/badge/Collab-Hocuspocus%20·%20Yjs%20CRDT-6C47FF?logo=socket.io&logoColor=white)](#-the-services)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20·%20TypeScript-000000?logo=next.js&logoColor=white)](#-the-services)
[![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL%2016-4169E1?logo=postgresql&logoColor=white)](#-the-services)
[![Kubernetes](https://img.shields.io/badge/Runs%20on-Kubernetes-326CE5?logo=kubernetes&logoColor=white)](#-infrastructure)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)

</div>

---

> _"Your mind is for having ideas, not holding them."_
> — **David Allen**, Getting Things Done

CloudNotes is where your ideas go to **stay alive**. Capture a 3 a.m. spark, paste a runbook, drop in a screenshot, embed an architecture diagram, draft a sprint plan in a table that **auto-sums itself** — and let an AI tidy your prose while you sip coffee. It looks like a polished SaaS. Under the hood, it's a **four-language microservices system** wearing a tuxedo.

---

## ✨ Why this exists

This isn't a toy. It's a **DevOps engineer's dojo** — a real, runnable product built to relearn the entire software lifecycle _from scratch, as if it were an enterprise_: code → PR → CI → staging → prod → observability → incident → postmortem.

> _"Tell me and I forget. Teach me and I remember. Involve me and I learn."_
> — **Benjamin Franklin**

So instead of reading about microservices, we **built five of them across four languages**. Instead of theorizing about scaling, we **load-tested it** (200 concurrent writes, zero errors). Instead of "we should add observability someday," every service ships **Prometheus metrics + structured JSON logs** today.

---

## 🎬 What it can do

<table>
<tr>
<td width="50%">

### 📝 A real editor, not a text box
- Rich text: **bold, italic, headings, code blocks, quotes, highlights**
- **Tables** with drag-to-resize columns + **Excel-style auto-sum (Σ)**
- Drag-and-drop **images & video**, embed **YouTube**
- Embed **Excalidraw / Miro / Lucidchart** diagrams
- **Tab to indent**, markdown shortcuts (`## `, `- `, `> `, ` ``` `)
- Keyboard shortcuts: `⌘K` link · `⌘⌥T` table · `⌘⌥Y` video

</td>
<td width="50%">

### 🧠 Notes that think & flex
- **✨ AI assist** — improve, rephrase, fix grammar, summarize, change tone
- **⚡ Real-time co-editing** — multiple people, one note, **live cursors** + instant sync (Yjs CRDT, conflict-free)
- **Tags** (Personal · Work · Ideas…) with color + instant filtering
- **Dark / light** mode — app-wide _and_ per-note
- **Zoom** the page, **resize** the sidebar, **adjust** the header
- **Import** Markdown / Notion exports · **Export** MD / HTML / JSON
- **Backup & restore** your whole brain in one click

</td>
</tr>
</table>

---

## 🏗️ Architecture

> _"Prefer boring infrastructure over clever code."_

```
                             🌐  Browser
                             │  REST (HTTP)  +  live editing (WebSocket)
                ┌────────────▼────────────┐
                │   Next.js 16   ·   :3000 │  Editor · AI · Tags · co-editing
                └────────────┬────────────┘
     ┌───────────┬───────────┼───────────┬────────────┐
     │           │           │           │            │
┌────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌────▼─────┐ ┌────▼─────┐
│  Auth   │ │  Notes  │ │  Users  │ │Analytics │ │  Collab  │
│ 🐍 Py   │ │ 🐹 Go   │ │ ☕ Java │ │ 🟢 Node  │ │ 🟢 Node  │
│ FastAPI │ │  Gin    │ │ Spring  │ │ Express  │ │Hocuspocus│
│  :8000  │ │  :8001  │ │  :8002  │ │  :8003   │ │ :8004 ⇄  │
│JWT+bcrypt│ │JWT-scope│ │JPA+Hika │ │event ing │ │ Yjs CRDT │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬─────┘ └────┬─────┘
     └───────────┴───────────┴─────┬─────┴────────────┘
                                   │
                         ┌─────────▼──────────┐
                         │   🐘 PostgreSQL 16  │   local · or RDS / Cloud SQL / Azure / OCI
                         └────────────────────┘

   📊 Prometheus + Grafana   ·   🪵 JSON logs → ELK / Loki / CloudWatch   ·   🚀 ArgoCD GitOps
```

Every service is **12-factor and cloud-agnostic** — point `DATABASE_URL` at any Postgres and it runs on **AWS, GCP, Azure, OCI, or your laptop**, unchanged.

---

## 🧰 The services

| Service | Language | Framework | Port | Superpower |
|---|---|---|---|---|
| **auth-service** | 🐍 Python 3.12 | FastAPI | `8000` | bcrypt hashing · HS256 JWT · async pool |
| **note-service** | 🐹 Go 1.25 | Gin | `8001` | per-user JWT isolation · pgxpool · graceful shutdown |
| **user-service** | ☕ Java 17 | Spring Boot 3.5 | `8002` | JPA + HikariCP · ECS structured logs |
| **analytics-service** | 🟢 Node 20 | Express | `8003` | event ingestion · live stats |
| **collab-service** | 🟢 Node 20 | Hocuspocus + Yjs | `8004` | real-time multiplayer over WebSocket · CRDT merge · Postgres-persisted |
| **frontend** | ⚛️ TypeScript | Next.js 16 | `3000` | TipTap editor · AI · live co-editing · the whole UX |

Every HTTP backend exposes `GET /v1/health-status` (DB-aware) and Prometheus metrics. There's even a live **health dashboard** at `/health`. The collab-service speaks **WebSocket** (Yjs sync protocol) and authorizes every connection with the same JWT / share-token rules as note-service — view-only shares stay read-only, and cross-user access is rejected.

---

## 🚀 Quick start

> _"The best time to plant a tree was 20 years ago. The second best time is now."_

### Option A — the whole stack, one command

```bash
cp .env.example .env          # set a JWT_SECRET (≥ 32 chars!) and DB password
docker compose up --build     # ☕ grab a coffee while it builds
```

Open **http://localhost:3000**, create an account, and start writing.

### Option B — run services à la carte (no Docker)

```bash
# 🐘 a database first
docker run -d --name pg -e POSTGRES_USER=cloudnotes -e POSTGRES_PASSWORD=cloudnotes \
  -e POSTGRES_DB=cloudnotes -p 5432:5432 postgres:16-alpine

export DATABASE_URL="postgresql://cloudnotes:cloudnotes@localhost:5432/cloudnotes"
export JWT_SECRET="cloudnotes-dev-secret-please-change-me-32+"

# 🐍 Auth
cd src/auth-service && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --port 8000

# 🐹 Notes
cd src/note-service && go run .

# ☕ Users
cd src/user-service && ./mvnw spring-boot:run

# 🟢 Analytics
cd src/analytics-service && npm install && node index.js

# ⚡ Collab (real-time editing — needs the same DATABASE_URL + JWT_SECRET)
cd src/collab-service && npm install && node index.js   # listens on :8004

# ⚛️ Frontend
cd src/frontend && npm install && npm run dev
```

> 🔌 The frontend reaches the collab server via `NEXT_PUBLIC_COLLAB_URL` (default `ws://localhost:8004`). It's a **browser-side** WebSocket, so in Docker it must point at the host, not the compose network name.

> 💡 **Heads up:** `JWT_SECRET` must be **≥ 32 characters** — it's shared across services and HS256 demands it. Generate one with `openssl rand -base64 48`.

---

## 🔌 API at a glance

<details>
<summary><b>🐍 Auth — :8000</b></summary>

```bash
# Register → returns a JWT
curl -X POST localhost:8000/register -H 'Content-Type: application/json' \
  -d '{"username":"ada","email":"ada@cloudnotes.dev","password":"superSecret1"}'

# Login → returns a JWT
curl -X POST localhost:8000/login -H 'Content-Type: application/json' \
  -d '{"username":"ada","password":"superSecret1"}'
```
</details>

<details>
<summary><b>🐹 Notes — :8001</b> (JWT required — every note scoped to <code>you</code>)</summary>

```bash
TOKEN="<jwt from login>"
curl -X POST localhost:8001/v1/notes -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"My first note","content":{},"tags":["Ideas"],"icon":"🚀"}'

curl localhost:8001/v1/notes -H "Authorization: Bearer $TOKEN"
```
</details>

<details>
<summary><b>☕ Users — :8002</b> · <b>🟢 Analytics — :8003</b></summary>

```bash
curl localhost:8002/v1/users -H "Authorization: Bearer $TOKEN"

curl -X POST localhost:8003/v1/events -H 'Content-Type: application/json' \
  -d '{"event_type":"note_created","user_id":"ada","payload":{}}'
curl localhost:8003/v1/stats
```
</details>

---

## 👀 Observability — because hope is not a strategy

> _"The best alert is the one that never fires. The second best is the one where the runbook already exists."_

- **Metrics** — every service exports the Four Golden Signals (latency, traffic, errors, saturation) at `/metrics` (`/actuator/prometheus` for Java). Scrape with Prometheus, graph with Grafana.
- **Logs** — structured **JSON on stdout**, ready for **PLG / ELK / CloudWatch**. The Java service speaks **ECS** (Elastic Common Schema) out of the box.
- **Tracing-ready** — request logs carry a `trace_id` passthrough, waiting for Jaeger / OpenTelemetry.
- **Health UI** — `/health` shows all four services live, auto-refreshing every 10s.

---

## 🧭 Infrastructure

Everything below exists **as code** in this repo — the next chapter is making it real.

```
kubernetes/   Helm charts per service · ArgoCD ApplicationSet · Prometheus/Loki/Grafana
terraform/    VPC · EKS · RDS · Secrets Manager · multi-env (dev / staging / prod)
.github/      CI: build · test · Trivy scan · gitleaks · push · GitOps sync
```

> _"Infrastructure as code means your servers have a `git blame`."_

---

## 🗺️ Roadmap

- [x] 5 microservices on PostgreSQL with JWT + connection pooling
- [x] Rich editor: tables, media, diagrams, AI assist, tags, import/export
- [x] Structured logging + Prometheus metrics on every service
- [x] ⚡ Real-time collaborative editing (Yjs CRDT · live cursors · Postgres-persisted)
- [ ] 📈 OpenTelemetry → Jaeger distributed tracing
- [ ] 🔄 CI/CD green end-to-end (GitHub Actions → ArgoCD)
- [ ] ☸️ First real `kubectl apply` to a cluster
- [ ] 🌍 `terraform apply` to real cloud
- [ ] 🪣 S3/GCS for large attachments
- [ ] 📊 Analytics dashboard in the UI

---

## 💜 The philosophy

CloudNotes believes:

- **Your notes belong to you** — export everything, anytime, in open formats.
- **Boring infra beats clever code** — until the clever code has tests _and_ a runbook.
- **Every deploy should be traceable to a ticket**, and every incident to a postmortem.
- **Learning happens by building**, breaking, and fixing — not by reading slides.

> _"We are what we repeatedly do. Excellence, then, is not an act, but a habit."_
> — **Will Durant** (on Aristotle)

---

## 🤝 Contributing

This is a learning playground — PRs, issues, and wild ideas are all welcome. Branch from `dev`, keep services cloud-agnostic, and add a metric + a log line for anything new. 🌱

## 📜 License

Released under the **MIT License** — take it, learn from it, build something you love.

<div align="center">

---

**Built with curiosity, caffeine, and four programming languages.** ☕🐍🐹☕🟢

_If this project helped you learn something, give it a ⭐ — it makes a 3 a.m. commit feel worth it._

</div>
