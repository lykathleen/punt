import React from "react";
import { AccountMenu } from "../AccountMenu/index.js";
import { ThemeToggle } from "./ThemeToggle.jsx";
import "./Layout.css";

export function Layout({ primary, secondary, title = "Leaderboard", user, onLogout }) {
  return (
    <div className="punt-app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="logo">
              <svg className="logo-mark" viewBox="0 0 64 64" aria-hidden="true">
                <circle className="ring-track" cx="32" cy="32" r="20" fill="none" strokeWidth="6" />
                <circle
                  className="ring-arc"
                  cx="32"
                  cy="32"
                  r="20"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="86 126"
                  transform="rotate(-90 32 32)"
                />
                <circle className="ball" cx="32" cy="32" r="10.5" />
                <path className="panel" d="M32 27 L36.3 30.1 L34.6 35.2 L29.4 35.2 L27.7 30.1 Z" />
              </svg>
              <span>PUNT</span>
            </div>
            <p>World Cup 2026 · Knockout-stage score predictions</p>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <AccountMenu user={user} onLogout={onLogout} />
          </div>
        </div>
      </header>

      <div className="layout-wrap">
        <div className="layout-shell">
          <section className="layout-primary" aria-label="Round predictions">
            {primary}
          </section>

          <aside className="layout-main" aria-label={title}>
            {secondary}
          </aside>
        </div>
      </div>
    </div>
  );
}
