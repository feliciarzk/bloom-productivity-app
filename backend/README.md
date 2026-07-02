# Bloom Backend

Small Express API that sits alongside the Supabase-powered frontend. It doesn't
replace Supabase — the frontend still talks to Supabase directly for normal
CRUD (creating tasks, habits, etc). This backend exists for the two things
that shouldn't happen on the client:

1. **Service-role Supabase access** — uses the `service_role` key (bypasses
   Row Level Security), so it must never run in the browser.
2. **Aggregated / computed data** — stats that used to be calculated in
   `Progress.jsx` and `Dashboard.jsx` (streaks, weekly totals, best day) are
   now computed server-side and returned as ready-to-render JSON.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from your Supabase project settings
npm run dev
```

Server runs on `http://localhost:4000` by default.

## Required table columns

The controllers filter by `user_id`, so make sure `tasks` and `habit_logs`
have a `user_id` column (uuid, references `auth.users.id`). If your tables
don't have this yet, add it and backfill / set it on insert from the frontend.

## Endpoints

All endpoints require an `Authorization: Bearer <access_token>` header —
the token comes from the logged-in Supabase session on the frontend.

| Method | Route                    | Returns                                              |
|--------|---------------------------|-------------------------------------------------------|
| GET    | `/api/health`             | `{ status: "ok" }` — no auth required                 |
| GET    | `/api/dashboard/summary`  | total tasks, completed tasks, progress %, activity    |
| GET    | `/api/progress/summary`   | 7-day garden data, streak, best day, today's %         |

## Calling it from the frontend

```js
import supabase from "../lib/supabase";

async function fetchDashboardSummary() {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch("http://localhost:4000/api/dashboard/summary", {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}
```

Swap the direct Supabase queries in `Dashboard.jsx` / `Progress.jsx` for a
call to this API if/when you want the frontend to stop doing the math itself.

## Folder structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js       # admin client (service role key)
│   ├── middleware/
│   │   └── auth.js           # verifies Supabase JWT, attaches req.user
│   ├── controllers/
│   │   ├── dashboard.controller.js
│   │   └── progress.controller.js
│   ├── routes/
│   │   ├── dashboard.routes.js
│   │   └── progress.routes.js
│   ├── app.js                 # express app + middleware wiring
│   └── server.js              # entry point
├── .env.example
├── .gitignore
└── package.json
```

## Ideas to extend (good for portfolio depth)

- Email reminder cron job (e.g. `node-cron` + Resend) for incomplete habits
- Rate limiting (`express-rate-limit`) on public-facing endpoints
- Input validation (`zod`) once you add POST/PUT endpoints
- Tests for the streak/aggregation logic (it's pure functions — easy to unit test)
