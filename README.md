# QuantumSpark Pro

AI trading platform delivered as a monorepo containing three surfaces:

- **Mission Control** (`app/`, `components/`, `lib/`) — Next.js 15 / React 19 operational console
- **Frontend** — Vanilla JavaScript trading dashboard
- **Backend** — Express.js API server

## Features

- Interactive launch-readiness workspace
- Highest-priority market-readiness blocker tracking
- Per-step checklists with file-level evidence
- Copyable validation commands
- GitHub repository and workflow metadata scanning

## Tech Stack

| Surface          | Technology                     |
|------------------|--------------------------------|
| Mission Control  | Next.js 15, React 19, TypeScript |
| Frontend         | Vanilla JavaScript             |
| Backend          | Express.js                     |
| CI / Deploy      | GitHub Actions, Vercel         |

## Installation

Install dependencies from each project root:

```bash
npm install
cd frontend && npm ci
cd ../backend && npm ci
```

## Validation

### Mission Control (repository root)

```bash
npm test
npm run lint
npm run build
```

### Frontend

```bash
cd frontend
npm test
npm run lint
npm run build
```

### Backend

```bash
cd backend
npm test
npm run lint
npm run build
```

## Notes

- `lib/githubScanner.ts` fetches GitHub repository metadata and the latest workflow run for Mission Control.
- Keep the root lockfile synchronized with `package.json`; CI uses `npm ci` for the Mission Control app.

## License

Proprietary / to be confirmed.
