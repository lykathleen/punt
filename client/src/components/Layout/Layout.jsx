import React from "react";
import { AccountMenu } from "../AccountMenu/index.js";
import "./Layout.css";

export function Layout({ primary, secondary, title = "Leaderboard", user, onLogout }) {
  return (
    <div className="layout-shell">
      <section className="layout-primary" aria-label="Round predictions">
        <header className="layout-brand">
          <div>
            <p className="eyebrow">Punt</p>
            <h1>Punt</h1>
          </div>

          <nav className="layout-nav" aria-label="Main navigation">
            <a aria-current="page" href="/">
              Rounds
            </a>
          </nav>
        </header>

        <div className="layout-primary-content">{primary}</div>
      </section>

      <section className="layout-main" aria-label="Application workspace">
        <header className="layout-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>{title}</h2>
          </div>
          <AccountMenu user={user} onLogout={onLogout} />
        </header>

        <div className="layout-content">{secondary}</div>
      </section>
    </div>
  );
}
