import { Router } from "express";
import { requireAuth } from "../auth.js";
import { getDatabaseStatus } from "../db.js";
import { User } from "../models/index.js";

export const authRouter = Router();

function fallbackDisplayName(email) {
  return email?.split("@")[0] ?? "Player";
}

function getSupabaseDisplayName(supabaseUser) {
  const metadata = supabaseUser?.user_metadata ?? {};

  return (
    metadata.display_name?.trim() ||
    metadata.displayName?.trim() ||
    metadata.name?.trim() ||
    fallbackDisplayName(supabaseUser?.email)
  );
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

authRouter.get("/me", requireAuth, async (request, response, next) => {
  try {
    if (!requireDatabaseConnection(response)) {
      return;
    }

    const email = request.auth.email?.trim().toLowerCase();

    if (!email) {
      response.status(401).json({ message: "Your Supabase account is missing an email address." });
      return;
    }

    const user = await User.findOneAndUpdate(
      {
        $or: [{ supabaseUserId: request.auth.sub }, { email }]
      },
      {
        $set: {
          supabaseUserId: request.auth.sub,
          email
        },
        $setOnInsert: {
          displayName: getSupabaseDisplayName(request.auth.user)
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    response.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});
