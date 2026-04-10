# Mentiqor – JEE Mains Preparation Platform

<div align="center">

**🔗 [mentiqor.vercel.app](https://mentiqor.vercel.app)**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://mentiqor.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

> **Crack JEE Mains** with chapter‑wise practice, real‑exam analysis, PYQ PDFs, and topic‑wise video playlists – all in one place.

![Dashboard Screenshot](./screenshots/dashboard.png)
*Dashboard showing accuracy trends and weak topics*

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Adaptive Quiz** | Filter by subject & chapters, timed mock tests, instant scoring |
| 📊 **Performance Dashboard** | Accuracy trends, subject breakdown, weak topics, session history |
| 📄 **PYQ Papers** | Download official JEE Main shift‑wise papers (2022–2025) |
| 🎥 **Video Playlists** | One‑Shot (detailed) + ⚡ Revision (10 min) modes per topic |
| 🔍 **Smart YouTube Fallback** | Auto‑finds the best video via YouTube Data API if no manual link set |
| ✅ **Progress Tracking** | Mark PYQs and videos as done; progress bars persist per user |
| 💬 **Daily Quote** | Motivational inspiration via [ZenQuotes API](https://zenquotes.io) |
| 🌙 **Dark Mode** | Warm brown theme – easy on the eyes during long study sessions |

---

## 📸 Screenshots

| Dashboard | Quiz | Materials |
|:---------:|:----:|:---------:|
| ![Dashboard](./screenshots/dashboard.png) | ![Quiz](./screenshots/quiz.png) | ![Materials](./screenshots/materials.png) |
| Accuracy trends & weak topics | Timed adaptive mock tests | PYQ cards & video playlists |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [React 18](https://reactjs.org), [Vite](https://vitejs.dev), CSS Variables, [Recharts](https://recharts.org) |
| **Backend** | [Node.js](https://nodejs.org), [Express](https://expressjs.com), [PostgreSQL](https://www.postgresql.org) via Supabase |
| **Auth** | [Supabase Auth](https://supabase.com/docs/guides/auth) with Row Level Security |
| **Storage** | [Supabase Storage](https://supabase.com/docs/guides/storage) – public bucket for PDFs |
| **APIs** | [YouTube Data API v3](https://developers.google.com/youtube/v3), [ZenQuotes API](https://zenquotes.io) |
| **Deployment** | Frontend: [Vercel](https://vercel.com) · Backend: [Render](https://render.com) · Uptime: [UptimeRobot](https://uptimerobot.com) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/en/download)
- [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com)
- [Supabase](https://supabase.com) account (free tier works)
- [Google Cloud](https://console.cloud.google.com) project with [YouTube Data API v3](https://developers.google.com/youtube/v3/getting-started) enabled

### 1. Clone the repository

```bash
git clone https://github.com/Vignesh-P-C/Mentiqor.git
cd Mentiqor
```

> The repo contains both `mentiqor-frontend/` and `mentiqor-backend/` folders.

### 2. Configure environment variables

**Frontend** – create `mentiqor-frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_YOUTUBE_API_KEY=your-youtube-api-key
VITE_API_URL=http://localhost:5000
```

**Backend** – create `mentiqor-backend/.env`:

```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-xxx.pooler.supabase.com:5432/postgres
PORT=5000
```

> 💡 Get your Supabase credentials from **Project Settings → API** in your [Supabase dashboard](https://app.supabase.com).

### 3. Install dependencies

```bash
# Frontend
cd mentiqor-frontend && npm install

# Backend
cd ../mentiqor-backend && npm install
```

### 4. Run database migration

Open your [Supabase SQL Editor](https://app.supabase.com) and run:

```sql
-- user_completions table for marking PYQ / video as done
CREATE TABLE IF NOT EXISTS user_completions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_type  text NOT NULL CHECK (completion_type IN ('pyq', 'video')),
  item_identifier  text NOT NULL,
  completed_at     timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_completion UNIQUE (user_id, completion_type, item_identifier)
);

ALTER TABLE user_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own completions" ON user_completions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 5. Set up Supabase Storage

1. Create a **public bucket** named `pyq-papers`.
2. Inside it, create folders: `2022/`, `2023/`, `2024/`, `2025/`.
3. Upload PDFs using the naming pattern: `{month}{day}_shift{shift}.pdf`
   - Example: `jan22_shift1.pdf`

### 6. Start the development servers

```bash
# Terminal 1 – Backend
cd mentiqor-backend && npm start

# Terminal 2 – Frontend
cd mentiqor-frontend && npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** 🎉

---

## ☁️ Deployment

### Frontend – [Vercel](https://vercel.com)

1. Import your GitHub repo on the [Vercel dashboard](https://vercel.com/new).
2. Set **Root Directory** → `mentiqor-frontend`.
3. Add all `VITE_*` environment variables.
4. Build command: `npm run build` · Output directory: `dist`.

### Backend – [Render](https://render.com)

1. Create a new **Web Service**, point it to `mentiqor-backend`.
2. Build command: `npm install` · Start command: `npm start`.
3. Add `DATABASE_URL` and `PORT` environment variables.
4. **Keep-alive:** Set up a free [UptimeRobot](https://uptimerobot.com) monitor to ping `https://mentiqor-backend.onrender.com/health` every 5 minutes so the free instance doesn't spin down.

### YouTube API – Key Restrictions

In [Google Cloud Console](https://console.cloud.google.com), go to **APIs & Services → Credentials** and add your Vercel domain (e.g. `https://mentiqor.vercel.app/*`) to the **HTTP referrers** allowlist for your API key.

---

## 📅 Roadmap

- [x] Chapter‑wise adaptive quizzes
- [x] Performance dashboard with weak-topic detection
- [x] PYQ papers (2022–2025) with progress tracking
- [x] Topic‑wise video playlists with YouTube fallback
- [ ] More PYQ papers covering 2021
- [ ] Enhanced analytics – chapter‑wise accuracy & improvement graphs
- [ ] Timetable planner – auto‑schedule weak topics and daily revision sessions

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository.
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a [Pull Request](https://github.com/Vignesh-P-C/Mentiqor/pulls).

For major changes, please [open an issue](https://github.com/Vignesh-P-C/Mentiqor/issues) first to discuss your idea.

---

## 📄 License

Distributed under the [MIT License](./LICENSE).

---

## 👤 Author

**Vignesh P C**

[![GitHub](https://img.shields.io/badge/GitHub-Vignesh--P--C-181717?style=flat&logo=github)](https://github.com/Vignesh-P-C)

---

## 🙏 Acknowledgements

- [Supabase](https://supabase.com) – database, auth, and storage
- [YouTube Data API](https://developers.google.com/youtube/v3) – video search
- [ZenQuotes API](https://zenquotes.io) – motivational quotes
- [Vercel](https://vercel.com) & [Render](https://render.com) – hosting
- [Recharts](https://recharts.org) – performance charts
