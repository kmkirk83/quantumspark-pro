# QuantumSpark Pro

QuantumSpark Pro is a monorepo with three app surfaces:

- `app/`, `components/`, `lib/`: Next.js 15 / React 19 Mission Control app
- `frontend/`: vanilla JavaScript trading dashboard
- `backend/`: modular Express.js API server

## Install

Run installs from each project root:

```bash
npm install
cd frontend && npm ci
cd ../backend && npm ci
```

## Environment and deployment

Copy `.env.example` into your local `.env` files and replace the placeholder values before running billing, auth, or GitHub integrations.

### Local defaults

- Mission Control: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Shared frontend redirect base: `FRONTEND_BASE_URL`

### Vercel

The repository now includes `vercel.json` so Mission Control installs with `npm ci` and builds with `npm run build`.

## Validation

### Mission Control (repository root)

```bash
npm run test:github-scanner
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

## Workflow tips

- Batch related file changes into one focused PR instead of splitting the same area across many short sessions.
- Open a draft PR early for multi-surface work so CI runs while implementation is still in progress.
- Update `PROGRESS.md` before handoff so the next session starts with the correct repository context.
- Use the PR template to capture validation, remaining work, and session handoff notes.

## Notes

- `lib/githubScanner.ts` fetches GitHub repository metadata and the latest workflow run for Mission Control.
- The root lockfile must stay in sync with `package.json` because CI uses `npm ci` for the Mission Control app.
- `backend/server.js` is now a thin entry point and route logic lives under `backend/src/` for smaller, safer changes.
