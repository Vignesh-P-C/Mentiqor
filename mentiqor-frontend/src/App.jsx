import { useState } from "react";
import Quiz from "./pages/Quiz";
import Dashboard from "./pages/Dashboard";
import "./App.css";

// Hardcoded for now — swap with auth user ID later
const USER_ID = "user_001";

export default function App() {
  const [page, setPage] = useState("quiz");

  return (
    <div className="app">
      <nav className="navbar">
        <span className="brand">
          <span className="brand-dot" />
          Mentiqor
        </span>

        <div className="nav-links">
          <button
            className={`nav-btn ${page === "quiz" ? "active" : ""}`}
            onClick={() => setPage("quiz")}
          >
            Practice
          </button>
          <button
            className={`nav-btn ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
        </div>

        <span className="user-chip">{USER_ID}</span>
      </nav>

      <main className="main-content">
        {page === "quiz"
          ? <Quiz userId={USER_ID} onNavigate={setPage} />
          : <Dashboard userId={USER_ID} onNavigate={setPage} />
        }
      </main>
    </div>
  );
}