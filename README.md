# 🧠 Mentiqor — JEE Mains Practice Platform

Mentiqor is a full-stack practice platform designed to help students prepare for **JEE Mains** through structured quizzes, performance tracking, and detailed analytics.

It focuses on **real exam simulation**, **topic-wise practice**, and **data-driven improvement**.

---

## 🚀 Features

### 🔐 Authentication

* Secure user authentication (Sign up / Sign in)
* Persistent sessions using Supabase Auth
* User-specific data tracking (no shared progress)

---

### 📝 Practice System

* Start quizzes with:

  * Subject selection (Physics, Chemistry, Mathematics)
  * Chapter-wise filtering
  * Adjustable time limits (30 min → 3 hours)
* Smart question distribution based on JEE patterns
* Shuffled questions for realistic practice

---

### ⏱️ Quiz Interface

* Real-time countdown timer
* Question navigation panel (jump to any question)
* Answer, skip, and revisit functionality
* Progress tracking:

  * Answered
  * Skipped
  * Pending
* Smooth navigation (Previous / Next)

---

### 📊 Performance Dashboard

* Session-based analytics
* Metrics tracked:

  * Total attempts
  * Accuracy %
  * Total marks
  * Correct vs Incorrect

#### 📈 Visual Insights

* Accuracy trends over sessions
* Attempt breakdown (correct vs incorrect)
* Subject-wise accuracy comparison

---

### 🎯 Weak Topic Detection

* Automatically identifies topics with low accuracy
* Helps focus on high-impact improvement areas

---

### 🕘 Session History

* View recent quiz attempts
* Track:

  * Accuracy
  * Score changes
  * Chapters attempted
  * Date of attempt

---

## 🖥️ UI Overview

### 🔑 Authentication Screen

Clean and minimal login/signup interface.

### 🎯 Practice Setup

Select subject, chapters, and time before starting a quiz.

### 📊 Dashboard

Detailed analytics with charts and performance breakdown.

### 🧠 Quiz Interface

Distraction-free exam environment with full navigation support.

---

## 🛠️ Tech Stack

### Frontend

* React
* Tailwind CSS
* Vite

### Backend / Database

* Supabase (Auth + Database)

### Other

* Charting library for analytics
* Modular component architecture

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mentiqor.git
cd mentiqor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Run the project

```bash
npm run dev
```

---

## 📌 Future Improvements

* Adaptive difficulty (AI-based question selection)
* Leaderboards & competitive mode
* Detailed solution explanations
* Mobile responsiveness improvements
* AI-based performance insights

---

## 🎯 Goal

Mentiqor aims to become a **complete JEE preparation ecosystem**, combining:

* Practice
* Analytics
* Personalization

to help students improve efficiently.

---

## 👨‍💻 Author

Developed by Vignesh
B.Tech Student @ VIT Vellore

---

## ⭐ If you like this project

Give it a star on GitHub — it helps a lot!
