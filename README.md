# QuantumSpark Pro

QuantumSpark Pro contains three primary apps:

- `app/` + `components/` + `lib/`: Next.js Mission Control app (root project)
- `frontend/`: Vanilla JS trading dashboard
- `backend/`: Express.js API

## Validation commands

### Root (Mission Control)

```bash
npm ci
npm test
npm run lint
npm run build
```

### Frontend

```bash
cd frontend
npm ci
npm test
npm run lint
npm run build
```

### Backend

```bash
cd backend
npm ci
npm test
npm run lint
npm run build
```

## Recent reliability fix

- Fixed `lib/githubScanner.ts` so `fetchRepoInfo()` initializes `headers` before applying an optional authorization header.
- Added `tests/githubScanner.test.mjs` to guard against regressions in this code path.
