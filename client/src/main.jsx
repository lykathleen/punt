import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function App() {
  const [apiState, setApiState] = useState({
    status: "loading",
    database: "checking",
    message: "Loading from the MERN API..."
  });

  useEffect(() => {
    async function loadHelloWorld() {
      try {
        const response = await fetch(`${apiUrl}/api/hello`);

        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const data = await response.json();
        setApiState({
          status: "online",
          database: data.database,
          message: data.message
        });
      } catch (error) {
        setApiState({
          status: "offline",
          database: "disconnected",
          message: error.message
        });
      }
    }

    loadHelloWorld();
  }, []);

  const isConnected = apiState.database === "connected";

  return (
    <main className="app-shell">
      <section className="hello-panel" aria-label="MERN hello world">
        <div className="status-row">
          <span className={isConnected ? "status-dot connected" : "status-dot"} />
          <span>API {apiState.status}</span>
          <span>MongoDB {apiState.database}</span>
        </div>

        <h1>Hello, MERN.</h1>
        <p className="lead">
          React is rendering this page, Express is serving the API, Node is running the server,
          and MongoDB is wired through Mongoose.
        </p>

        <div className="message-box">
          <span>Database message</span>
          <p>{apiState.message}</p>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
