# Mentiqor – JEE Mains Preparation Platform

**🔗 Live Demo: [https://mentiqor.vercel.app](https://mentiqor.vercel.app)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Crack JEE Mains** with chapter‑wise practice, real‑exam analysis, PYQ PDFs, and topic‑wise video playlists – all in one place.

Mentiqor helps JEE aspirants practice effectively, track performance, and access high‑quality study materials. Built with React (Vite), Node.js/Express, Supabase (PostgreSQL + Storage), and the YouTube Data API.

![Dashboard Screenshot](./screenshots/dashboard.png)  
*Dashboard showing accuracy trends and weak topics* – *placeholder*

---

## ✨ Features

- **🎯 Adaptive Quiz** – Filter by subject & chapters, timed mock tests, instant scoring.
- **📊 Performance Dashboard** – Accuracy trends, subject breakdown, weak topics, session history.
- **📚 Study Materials**  
  - **PYQ Papers (shift‑wise)** – Download official JEE Main question papers (2022–2025) from Supabase Storage.  
  - **Video Playlists** – Two modes per topic: **One‑Shot (detailed)** + **⚡ Revision (10 min)**.  
  - **Smart YouTube fallback** – If no manual link, the YouTube Data API finds the best video.  
  - **Mark as done** – Track your progress with toggles and progress bars (persists per user).
- **💬 Motivational Quote** – Daily inspiration from ZenQuotes API.
- **🌙 Dark Mode** – Warm brown theme (no harsh blue/purple).

![Materials Page Screenshot](./screenshots/materials.png)  
*Materials page with PYQ cards and video playlists* – *placeholder*

---

## 🛠️ Tech Stack

| Category       | Technologies |
|----------------|--------------|
| Frontend       | React 18, Vite, CSS variables, Recharts |
| Backend        | Node.js, Express, PostgreSQL (via Supabase) |
| Authentication | Supabase Auth (Row Level Security) |
| Storage        | Supabase Storage (public bucket for PDFs) |
| APIs           | YouTube Data API v3, ZenQuotes API |
| Deployment     | Frontend: Vercel, Backend: Render, UptimeRobot (keep‑alive) |

---

## 🚀 Live Demo

- **Frontend:** [https://mentiqor.vercel.app](https://mentiqor.vercel.app)
- **Backend API:** [https://mentiqor-backend.onrender.com](https://mentiqor-backend.onrender.com)

> Use a test account or sign up – all features are free.

---

## 📦 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- Google Cloud project with YouTube Data API v3 enabled

### 1. Clone repositories

```bash
git clone https://github.com/Vignesh-P-C/Mentiqor.git
cd Mentiqor
```
The repo contains both mentiqor-frontend and mentiqor-backend folders.
2. Set up environment variables

Frontend (.env inside mentiqor-frontend/)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_YOUTUBE_API_KEY=your-youtube-api-key
VITE_API_URL=http://localhost:5000   # for local backend
```

Backend (.env inside mentiqor-backend/)

```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-xxx.pooler.supabase.com:5432/postgres
PORT=5000
```

3. Install dependencies

```bash
cd mentiqor-frontend && npm install
cd ../mentiqor-backend && npm install
```

4. Run database migrations

Open your Supabase SQL Editor.

Run the migration from migration.sql (provided in the backend folder or the README section below).

This creates the user_completions table for progress tracking.

5. Set up Supabase Storage

Create a public bucket named pyq-papers.

Inside, create folders 2022, 2023, 2024, 2025.

Upload PDFs with naming pattern: {month}{day}_shift{shift}.pdf (e.g., jan22_shift1.pdf).

6. Run locally

Backend:

```bash
cd mentiqor-backend
npm start
```

Frontend:

```bash
cd mentiqor-frontend
npm run dev
```

Visit http://localhost:5173.

🗄️ Database Migration (SQL)

```sql
-- user_completions table for marking PYQ/video as done
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
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

🔧 Deployment

Frontend (Vercel)

Connect your GitHub repo.

Set Root Directory to mentiqor-frontend.

Add environment variables (same as local .env).

Build command: npm run build, output directory: dist.

Backend (Render)

Create a new Web Service, point to the mentiqor-backend folder.

Set build command: npm install, start command: npm start.

Add environment variables (DATABASE_URL, PORT).

Keep backend awake – use UptimeRobot to ping /health every 5 minutes.

YouTube API Key Restrictions

In Google Cloud Console, add your Vercel domain (e.g., https://mentiqor.vercel.app/*) to the HTTP referrers.

📸 Screenshots

Dashboard	Quiz	Materials
https://./screenshots/dashboard.png	https://./screenshots/quiz.png	https://./screenshots/materials.png
(Add your screenshots to a screenshots/ folder and update the links.)

🤝 Contributing

Contributions are welcome! To contribute:

Fork the repository.

Create a feature branch (git checkout -b feature/amazing-feature).

Commit your changes (git commit -m 'Add some amazing feature').

Push to the branch (git push origin feature/amazing-feature).

Open a Pull Request.

For major changes, please open an issue first to discuss what you would like to change.

📝 Upcoming Features

✅ More questions and PYQ papers (2021–2025).

📈 Enhanced analytics (chapter-wise accuracy, improvement graphs).

📅 Timetable planner – auto-schedule weak topics and daily revision.

📄 License

Distributed under the MIT License. See LICENSE file for more information.

👤 Author

Vignesh P C

GitHub: @Vignesh-P-C

🙏 Acknowledgements

Supabase for database, auth, and storage.

YouTube Data API for video search.

ZenQuotes API for motivational quotes.

Vercel and Render for hosting.

Happy cracking JEE Mains! 🚀
