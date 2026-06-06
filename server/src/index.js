import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase, getDatabaseStatus } from "./db.js";
import { helloRouter } from "./routes/hello.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const clientOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const isLocalViteOrigin = /^http:\/\/(localhost|127\.0\.0\.1):517\d$/.test(origin ?? "");

      if (!origin || clientOrigins.includes(origin) || isLocalViteOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    }
  })
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    database: getDatabaseStatus()
  });
});

app.use("/api/hello", helloRouter);

app.use((error, _request, response, _next) => {
  response.status(500).json({
    message: error.message,
    database: getDatabaseStatus()
  });
});

async function startServer() {
  try {
    await connectDatabase();
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error.message);
  }

  app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
  });
}

startServer();
