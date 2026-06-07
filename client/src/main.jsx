import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { apiRequest } from "./api/apiRequest.js";
import { AuthForm } from "./components/AuthForm/index.js";
import { GlobalLeaderboard } from "./components/GlobalLeaderboard/index.js";
import { Layout } from "./components/Layout/index.js";
import { RoundCards } from "./components/RoundCards/index.js";
import { supabase } from "./supabase.js";
import "./styles.css";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Checking your session...");

  useEffect(() => {
    let isMounted = true;

    async function loadApplicationUser(session) {
      try {
        if (!session) {
          setUser(null);
          return;
        }

        const data = await apiRequest("/api/auth/me");
        if (isMounted) {
          setUser(data.user);
        }
      } catch (_error) {
        if (isMounted) {
          setUser(null);
        }
      }
    }

    async function loadCurrentUser() {
      try {
        const { data } = await supabase.auth.getSession();
        await loadApplicationUser(data.session);
      } catch (_error) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCurrentUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoadingMessage("Signing you in...");
      loadApplicationUser(session).finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
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
        <Layout
          primary={<RoundCards />}
          secondary={<GlobalLeaderboard />}
          title="Leaderboard"
          user={user}
          onLogout={handleLogout}
        />
      ) : (
        <AuthForm />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
