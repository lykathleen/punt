import crypto from "node:crypto";
import { Router } from "express";
import { clearAuthCookie, createAuthToken, requireAuth, setAuthCookie } from "../auth.js";
import { getDatabaseStatus } from "../db.js";
import { sendMagicLink } from "../email.js";
import { LoginToken, User } from "../models/index.js";

export const authRouter = Router();

const loginTokenTtlMs = 15 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email) {
  return email?.trim().toLowerCase();
}

function fallbackDisplayName(email) {
  return email.split("@")[0];
}

function serializeUser(user) {
  return {
    id: user._id,
    displayName: user.displayName,
    email: user.email
  };
}

function requireDatabaseConnection(response) {
  if (getDatabaseStatus() === "connected") {
    return true;
  }

  response.status(503).json({
    message: "MongoDB is not connected. Check your Atlas Network Access IP whitelist and restart the API.",
    database: "disconnected"
  });
  return false;
}

authRouter.post("/magic-link", async (request, response, next) => {
  try {
    if (!requireDatabaseConnection(response)) {
      return;
    }

    const email = normalizeEmail(request.body.email);
    const displayName = request.body.displayName?.trim();

    if (!email) {
      response.status(400).json({ message: "Email is required." });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + loginTokenTtlMs);
    const appUrl = process.env.APP_URL ?? "http://localhost:5173";
    const magicLink = `${appUrl}/auth/verify?token=${rawToken}`;

    await LoginToken.create({
      email,
      displayName,
      tokenHash,
      expiresAt
    });

    await sendMagicLink({ email, magicLink });

    response.status(202).json({
      message: "If that email can log in, a link has been sent."
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/verify", async (request, response, next) => {
  try {
    if (!requireDatabaseConnection(response)) {
      return;
    }

    const rawToken = request.body.token;

    if (!rawToken) {
      response.status(400).json({ message: "Login token is required." });
      return;
    }

    const loginToken = await LoginToken.findOne({
      tokenHash: hashToken(rawToken),
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    });

    if (!loginToken) {
      response.status(401).json({ message: "This login link is invalid or has expired." });
      return;
    }

    const user = await User.findOneAndUpdate(
      { email: loginToken.email },
      {
        $setOnInsert: {
          email: loginToken.email,
          displayName: loginToken.displayName || fallbackDisplayName(loginToken.email)
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    loginToken.usedAt = new Date();
    await loginToken.save();

    const sessionToken = createAuthToken(user);

    setAuthCookie(response, sessionToken);
    response.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (_request, response) => {
  clearAuthCookie(response);
  response.status(204).send();
});

authRouter.get("/me", requireAuth, async (request, response, next) => {
  try {
    if (!requireDatabaseConnection(response)) {
      return;
    }

    const user = await User.findById(request.auth.sub);

    if (!user) {
      clearAuthCookie(response);
      response.status(401).json({ message: "Your account could not be found." });
      return;
    }

    response.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});
