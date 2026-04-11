# Mentiqor – Frontend

> React + Vite frontend for the [Mentiqor](https://mentiqor.vercel.app) JEE Mains preparation platform.  
> Provides adaptive quizzes, a performance dashboard, and a study materials hub.

[![Live](https://img.shields.io/badge/Live-mentiqor.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://mentiqor.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![JSX](https://img.shields.io/badge/JSX-Component%20Syntax-61DAFB?style=for-the-badge&logo=react)](https://react.dev/learn/writing-markup-with-jsx)
[![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

---

## 🛠️ Tech Stack

| Library / Service | Purpose |
|---|---|
| [React 18](https://reactjs.org) | UI framework |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Recharts](https://recharts.org) | Performance dashboard charts |
| [Supabase Auth & Storage](https://supabase.com/docs) | Authentication + PDF storage |
| [YouTube Data API v3](https://developers.google.com/youtube/v3) | Topic video search fallback |
| [ZenQuotes API](https://zenquotes.io) | Daily motivational quotes |

---

## 📁 Folder Structure

```
src/
├── components/     # Reusable UI components (Options, Sidebar, etc.)
├── hooks/          # useAuth, useTheme
├── pages/          # Auth, Quiz, Dashboard, Materials
├── services/       # API calls, Supabase client
├── Styles/         # Tokens, base, components, utilities
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `mentiqor-frontend/` folder:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_YOUTUBE_API_KEY=your-youtube-api-key
VITE_API_URL=https://your-backend-url.onrender.com   # or http://localhost:5000 for local dev
```

> 💡 Get your Supabase credentials from **Project Settings → API** in your [Supabase dashboard](https://app.supabase.com).  
> 💡 Get a YouTube API key from [Google Cloud Console](https://console.cloud.google.com) — enable the **YouTube Data API v3**.

---

## 🚀 Local Development

```bash
npm install
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)**

> Make sure the backend is running at the URL set in `VITE_API_URL`. See the [backend README](../mentiqor-backend/README.md) to get it started.

---

## 📦 Production Build

```bash
npm run build
```

Output is generated in the `dist/` folder, ready to be served by any static host.

---

## ☁️ Deployment (Vercel)

1. Import your GitHub repository on the [Vercel dashboard](https://vercel.com/new).
2. Set **Root Directory** → `mentiqor-frontend`.
3. Add all `VITE_*` environment variables in the Vercel project settings.
4. **Build command:** `npm run build`
5. **Output directory:** `dist`

> ⚠️ If you're using the YouTube API, remember to add your Vercel domain (e.g. `https://mentiqor.vercel.app/*`) to the **HTTP referrers** allowlist in [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).

---

## 📝 Notes

- The frontend expects a backend API running at `VITE_API_URL` for quiz and history endpoints.
- PYQ PDFs are served from the Supabase Storage bucket named `pyq-papers`.
- The YouTube API fallback is only active when `VITE_YOUTUBE_API_KEY` is set.

---

## 📄 License

MIT — see the [root LICENSE](../LICENSE) file.
