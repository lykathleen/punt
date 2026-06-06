import React from "react";
import { AccountMenu } from "../AccountMenu/index.js";
import "./Layout.css";

export function Layout({ children, title = "Leaderboard", user, onLogout }) {
  return (
    <div className="layout-shell">
      <aside className="layout-brand" aria-label="Punt navigation">
        <div>
          <p className="eyebrow">Punt</p>
          <h1>Punt</h1>
        </div>

        <nav className="layout-nav" aria-label="Main navigation">
          <a aria-current="page" href="/">
            Leaderboard
          </a>
        </nav>
      </aside>

      <section className="layout-main" aria-label="Application workspace">
        <header className="layout-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>{title}</h2>
          </div>
          <AccountMenu user={user} onLogout={onLogout} />
        </header>

        <div className="layout-content">{children}</div>
      </section>
    </div>
  );
}
