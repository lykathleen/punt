import jwt from "jsonwebtoken";

const authCookieName = "punt_token";
const jwtSecret = process.env.JWT_SECRET ?? "development-only-change-me";
const tokenMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

export function createAuthToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email
    },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

export function setAuthCookie(response, token) {
  response.cookie(authCookieName, token, {
    httpOnly: true,
    maxAge: tokenMaxAgeMs,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function clearAuthCookie(response) {
  response.clearCookie(authCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function requireAuth(request, response, next) {
  const token = request.cookies?.[authCookieName];

  if (!token) {
    response.status(401).json({ message: "You need to log in first." });
    return;
  }

  try {
    request.auth = jwt.verify(token, jwtSecret);
    next();
  } catch (_error) {
    clearAuthCookie(response);
    response.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}
