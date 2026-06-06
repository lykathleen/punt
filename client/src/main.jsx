import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { apiRequest } from "./api/apiRequest.js";
import { AuthForm } from "./components/AuthForm/index.js";
import { GlobalLeaderboard } from "./components/GlobalLeaderboard/index.js";
import { Layout } from "./components/Layout/index.js";
import "./styles.css";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Checking your session...");

  useEffect(() => {
    async function loadCurrentUser() {
      const loginToken = new URLSearchParams(window.location.search).get("token");

      try {
        if (window.location.pathname === "/auth/verify" && loginToken) {
          setLoadingMessage("Signing you in...");
          const data = await apiRequest("/api/auth/verify", {
            method: "POST",
            body: JSON.stringify({ token: loginToken })
          });

          window.history.replaceState({}, "", "/");
          setUser(data.user);
          return;
        }

        const data = await apiRequest("/api/auth/me");
        setUser(data.user);
      } catch (_error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function handleLogout() {
    await apiRequest("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  if (isLoading) {
    return (
      <main className="app-shell">
        <section className="loading-panel">{loadingMessage}</section>
      </main>
    );
  }

  return (
    <main className={user ? "authenticated-shell" : "app-shell"}>
      {user ? (
        <Layout title="Leaderboard" user={user} onLogout={handleLogout}>
          <GlobalLeaderboard />
        </Layout>
      ) : (
        <AuthForm />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
