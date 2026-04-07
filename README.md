# 🧠 Mentiqor — Intelligent Academic Practice & Analytics Platform

Mentiqor is a full-stack web application designed to help students practice MCQs, track performance, and identify weak areas using data-driven insights.

It combines a **React frontend**, **Node.js backend**, and **Supabase PostgreSQL database** to deliver a seamless and scalable learning experience.

---

# 🚀 Features

## 🎯 Core Functionality

* Practice MCQs with instant feedback
* JEE-style marking scheme (+4 / -1)
* Explanation after each question
* Randomized question delivery
* Persistent user tracking

## 📊 Analytics (Backend Ready)

* Overall performance stats
* Subject-wise accuracy tracking
* Weak topic detection
* Marks aggregation

## 🧑‍💻 User Handling

* Auto-generated user ID using `localStorage`
* Tracks attempts per user without authentication system (for now)

---

# 🏗️ Tech Stack

## Frontend

* React (Vite)
* React Router DOM
* Vanilla CSS (custom styling)

## Backend

* Node.js
* Express.js
* PostgreSQL (via Supabase)
* pg (node-postgres)

## Database

* Supabase (hosted PostgreSQL)

---

# 🗂️ Project Structure

```
mentiqor/
│
├── mentiqor-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Quiz.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── mentiqor-backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── index.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── server.js
│
└── README.md
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone the Repository

```
git clone <your-repo-url>
cd mentiqor
```

---

## 2️⃣ Backend Setup

```
cd mentiqor-backend
npm install
```

### Create `.env` file

```
DATABASE_URL=your_supabase_connection_string
PORT=5000
```

---

## 🧠 Supabase Setup

### Step 1: Create Project

* Go to https://supabase.com
* Create a new project

---

### Step 2: Get Connection String

Go to:

```
Project Settings → Database → Connection string → URI
```

Use this as your `DATABASE_URL`

---

### Step 3: Create Tables

#### 🧾 questions table

```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct CHAR(1),
  explanation TEXT,
  subject TEXT,
  chapter TEXT
);
```

---

#### 📊 attempts table

```sql
CREATE TABLE attempts (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  question_id INT REFERENCES questions(id),
  selected CHAR(1),
  is_correct BOOLEAN,
  marks INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ▶️ Run Backend

```
node src/server.js
```

Expected:

```
Server running on port 5000
```

---

## 3️⃣ Frontend Setup

```
cd ../mentiqor-frontend
npm install
npm install react-router-dom
npm run dev
```

---

# 🔌 API Endpoints

## GET `/questions`

Fetch questions (supports filters)

Query params:

* `subject`
* `chapter`
* `limit`

---

## POST `/attempt`

Request:

```json
{
  "user_id": "abc123",
  "question_id": 1,
  "selected": "A"
}
```

Response:

```json
{
  "is_correct": true,
  "correct_option": "A",
  "marks_awarded": 4,
  "explanation": "..."
}
```

---

## GET `/stats/:user_id`

Returns:

* Total attempted
* Accuracy %
* Total marks
* Subject breakdown

---

## GET `/weak-topics/:user_id`

Returns:

* Chapters with accuracy below threshold (default 60%)

---

# 🎨 UI Overview

* Clean quiz interface
* Instant feedback system
* Dark-mode compatible styling (planned dashboard UI)
* Modular React components

---

# 🧪 Current Status

✅ Quiz system fully working
✅ Backend API complete
✅ Supabase integration working
⚠️ Dashboard UI (in progress)
⚠️ Authentication (not implemented yet)

---

# 🧠 Future Improvements

* Full analytics dashboard (charts, graphs)
* Authentication (JWT / Supabase Auth)
* Adaptive difficulty system
* AI-based question recommendations
* Timed quizzes
* Leaderboards

---

# ⚠️ Known Limitations

* No login system (user tracked via localStorage)
* No pagination for questions
* Basic UI (can be enhanced further)

---

# 🤝 Contribution

This project is currently under active development.

Feel free to:

* Suggest improvements
* Report bugs
* Extend features

---

# 📌 Author

Vignesh
B.Tech CSE — VIT Vellore

---

# ⭐ Final Note

Mentiqor is not just a quiz app —
it is designed to evolve into a **data-driven academic intelligence system**.

---
