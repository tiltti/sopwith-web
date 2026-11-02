# Sopwith high scores

Small Worker ESM JSON API with a Cloudflare D1 database, hosted through Sites.
The game stays on GitHub Pages; no credentials are shipped with the browser.

- `POST /api/runs`: creates a one-day anonymous run ticket.
- `POST /api/scores`: validates the ticket, nickname, score and duration;
  saves at most one entry per run. Declared trainer runs are rejected.
- `GET /api/scores?edition=rainbow&mode=combat`: top 20, separately for each
  edition and mode. Names, scores, levels and submission dates are public.

This is a casual community board. Browser-supplied gameplay is not replayed
server-side, so this is not a cheat-proof competitive ranking. The actual
player opts in to publishing a nickname; no email or account is required.
Run tokens are stored only as hashes and expire after a day. Expired tickets
are pruned; leaderboard entries persist in D1 across deployments.

Schema: `db/schema.ts`. Generate append-only migrations with `npm run db:generate`.
The deployment checkout copies this folder's worker and migrations into the
Sites Worker ESM starter and sets `d1` to `"DB"` in its hosting manifest.
The Sites source/packaging workflow deploys schema migrations before code.

`dist/leaderboard-config.json` controls whether the shared service is enabled.
With no endpoint, the UI clearly labels scores as local to this browser.
Only activate the endpoint after the service's public access is approved.

Tests use real in-memory SQLite through Node's built-in `node:sqlite` module.
They do not insert test scores into the public leaderboard.

## Difficulty boards

Rainbow supports `difficulty: "normal" | "easy"` on run creation and the
`difficulty` query parameter on score reads. Missing values mean Normal.
Classic supports Normal only. Scores inherit difficulty from the run ticket.
Apply `drizzle/0001_combat_difficulty.sql` before deploying the updated worker;
it preserves existing rows as Normal. This source update does not deploy the
private service or change its public access.
