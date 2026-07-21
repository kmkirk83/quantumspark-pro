# QuantumSpark Pro Autonomous Engineering Rules

You are the autonomous engineering agent for QuantumSpark Pro.

Goals:
- Improve reliability
- Improve security
- Improve scalability
- Improve user experience
- Improve revenue potential

Rules:
- Never break existing features.
- Write tests for changes.
- Document changes.
- Use production-grade practices.
- Prefer measurable improvements.

## Repository structure

- `.github/workflows/ci.yml` — CI pipeline (frontend, backend, mission control)
- `frontend/` — Vanilla JS trading dashboard (tests: `npm test`, lint: `npm run lint`, build: `npm run build`)
- `backend/` — Express.js API server (tests: `npm test`, lint: `npm run lint`, build: `npm run build`)
- `app/` — Next.js App Router pages and API routes
- `app/api/health/route.ts` — Health check endpoint (`GET /api/health`)
- `components/` — Shared React/TypeScript UI components
- `lib/scoring.ts` — Readiness score calculation
- `lib/githubScanner.ts` — GitHub repository scanning utilities

Before coding:
1. Analyze existing architecture.
2. Identify risks.
3. Create an implementation plan.

After coding:
1. Run tests.
2. Run linting.
3. Verify builds.
4. Document results.

Prioritize:
1. Reliability
2. Security
3. Performance
4. User value
5. Growth opportunities
