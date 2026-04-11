# Mentiqor – Backend

> Node.js + Express REST API for the [Mentiqor](https://mentiqor.vercel.app) platform.  
> Handles quiz data, user attempts, statistics, progress tracking, and more.

[![API](https://img.shields.io/badge/API-mentiqor--backend.onrender.com-blue?style=for-the-badge&logo=render)](https://mentiqor-backend.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4479A1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/docs/guides/database)
[![SQL](https://img.shields.io/badge/SQL-Migrations%20%26%20RLS-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🛠️ Tech Stack

| Library / Service | Purpose |
|---|---|
| [Node.js 18+](https://nodejs.org) | Runtime |
| [Express](https://expressjs.com) | HTTP server & routing |
| [PostgreSQL](https://www.postgresql.org) via [Supabase](https://supabase.com) | Database |
| [`pg`](https://node-postgres.com) | PostgreSQL connection pool |

---

## ⚙️ Environment Variables

Create a `.env` file in the `mentiqor-backend/` folder:

```env
DATABASE_URL=postgresql://user:pass@host:5432/database
PORT=5000
```

> 💡 Get your `DATABASE_URL` from **Project Settings → Database → Connection string (URI)** in your [Supabase dashboard](https://app.supabase.com). Use the **pooler** URL for better performance on free-tier hosting.

---

## 🗄️ Database Setup

1. Create the required tables in [Supabase SQL Editor](https://app.supabase.com): `questions`, `attempts`, `sessions`, `user_completions`.
2. Run `migration.sql` (located in the root of this folder) to create the `user_completions` table and its [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) policies.

```bash
# Or apply it directly via psql
psql $DATABASE_URL -f migration.sql
```

---

## 🚀 Local Development

```bash
npm install
npm start
```

Server runs at **[http://localhost:5000](http://localhost:5000)**

> Make sure the frontend's `VITE_API_URL` points to this address. See the [frontend README](../mentiqor-frontend/README.md).

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/questions` | Fetch questions (optional `subject` / `chapter` query filters) |
| `POST` | `/attempt` | Submit an answer – returns correctness & explanation |
| `GET` | `/stats/:user_id` | Overall and subject‑wise accuracy stats |
| `GET` | `/weak-topics/:user_id` | Chapters with accuracy below threshold (default 60%) |
| `GET` | `/sessions/:user_id` | All past quiz sessions for a user |
| `POST` | `/session` | Save a completed quiz session |
| `GET` | `/completions/:user_id` | Get completed items (`?type=pyq\|video`) |
| `POST` | `/completion` | Toggle an item as done / undone |
| `GET` | `/quote` | Proxy for [ZenQuotes API](https://zenquotes.io) |
| `GET` | `/health` | Health check ping (used by [UptimeRobot](https://uptimerobot.com)) |

---

## ☁️ Deployment (Render)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository and set **Root Directory** → `mentiqor-backend`.
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add environment variables: `DATABASE_URL`, `PORT`.
6. **Keep-alive:** Set up a free [UptimeRobot](https://uptimerobot.com) monitor to ping `/health` every 5 minutes so the free instance doesn't spin down.

---

## 📝 Notes

- [CORS](https://expressjs.com/en/resources/middleware/cors.html) is enabled for the frontend domain — update the allowed origin in `server.js` if your frontend URL changes.
- The backend connects to Supabase PostgreSQL with SSL (`rejectUnauthorized: false`) for compatibility with Render's free tier.
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security) is enabled on `user_completions` via the provided migration — recommended for all tables in production.

---

## 📄 License

MIT — see the [root LICENSE](../LICENSE) file.
