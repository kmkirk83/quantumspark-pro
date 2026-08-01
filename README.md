# QuantumSpark Pro

QuantumSpark Pro is a monorepo with three app surfaces:

- `app/`, `components/`, `lib/`: Next.js 15 / React 19 Mission Control app
- `frontend/`: vanilla JavaScript trading dashboard
- `backend/`: Express.js API server

## Install

Run installs from each project root:

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

## Mission Control launch control

The root Next.js app now includes an interactive launch-readiness workspace that:

- surfaces the highest-priority market-readiness blockers found in the repository
- lets you track fix progress in-browser with per-step checklists
- shows absolute file evidence for each recommendation
- provides copyable validation commands for the affected surface

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
- The root lockfile must stay in sync with `package.json` because CI uses `npm ci` for the Mission Control app.
