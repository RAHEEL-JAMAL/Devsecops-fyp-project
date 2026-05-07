# FYP : Secure one click Dual mode deployement dashbaord with live monitoring of lgs and pipeline 

A production-grade full-stack deployment dashboard.

## Architecture

```
Host Machine
├── Frontend (React + Vite) → :5173
└── Backend (Express + Socket.IO) → :3001
         │
         └─ SSH ──► Ubuntu VM (192.168.122.127)
                        ├── Jenkins (in Docker) → :8080
                        ├── Docker Engine
                        └── Deployed App Containers
```

## Folder Structure

```
fyp-dashboard/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── DeployForm.jsx
│   │   │   ├── PipelineViewer.jsx
│   │   │   ├── LogTerminal.jsx
│   │   │   ├── DeployStatusCard.jsx
│   │   │   ├── SystemMetrics.jsx
│   │   │   ├── ContainersPanel.jsx
│   │   │   └── DeployHistory.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   └── useDeploy.js
│   │   ├── services/
│   │   │   ├── socket.js
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/                # Express + Socket.IO
    ├── services/
    │   ├── sshService.js       ← SSH connection to VM
    │   ├── jenkinsService.js   ← Trigger + stream Jenkins
    │   ├── metricsService.js   ← CPU/RAM/Temp via SSH
    │   ├── dockerService.js    ← Docker containers via SSH
    │   ├── healthService.js    ← Health broadcast
    │   └── historyStore.js     ← In-memory deployment history
    ├── routes/
    │   ├── deploy.js
    │   ├── health.js
    │   ├── metrics.js
    │   ├── containers.js
    │   └── history.js
    ├── server.js
    └── package.json
```

## Setup

### 1. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
VM_HOST=192.168.122.127
VM_USER=ubuntu
VM_PASSWORD=your_vm_password

JENKINS_URL=http://192.168.122.127:8080
JENKINS_USER=admin
JENKINS_TOKEN=your_jenkins_api_token
JENKINS_JOB_NAME=deploy-pipeline

PORT=3001
FRONTEND_URL=http://localhost:5173
```

To get your Jenkins API token:
1. Login to Jenkins → Click your username (top right)
2. Configure → API Token → Add new Token → Copy it

### 2. Configure frontend environment

```bash
cd frontend
cp .env.example .env
```

### 3. Install dependencies

```bash
# From root
npm run install:all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Run development servers

```bash
# From root (runs both together)
npm run dev

# Or separately:
cd backend && npm run dev       # :3001
cd frontend && npm run dev      # :5173
```

Open: http://localhost:5173

## Jenkins Pipeline Log Format

Your existing Jenkinsfile must emit these markers for the dashboard to work:

```groovy
echo "[STAGE_START] Init"
// ... do work ...
echo "[STAGE_SUCCESS] Init"

echo "[META] PORT=3001"
echo "[META] STACK=vite"
echo "[META] URL=http://192.168.122.127:3001"

echo "[DEPLOY_SUCCESS]"
// or
echo "[DEPLOY_FAILED]"
```

## Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `health:update` | Server → Client | `{ backend, vm, jenkins, docker }` |
| `metrics:update` | Server → Client | `{ cpu, mem, temp, uptime }` |
| `containers:update` | Server → Client | `{ containers[] }` |
| `pipeline:update` | Server → Client | `{ deployId, event, stage }` |
| `log:new` | Server → Client | `{ deployId, line, timestamp }` |
| `deploy:meta` | Server → Client | `{ deployId, key, value }` |
| `deploy:status` | Server → Client | `{ deployId, status, buildNumber? }` |

## Notes

- Deployment history is in-memory. Add a database (SQLite/MongoDB) for persistence.
- SSH password auth is used. For production, use SSH key auth.
- Jenkins API token should have at minimum "Read" + "Build" permissions on the job.
