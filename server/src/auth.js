import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing SUPABASE_URL or SUPABASE_ANON_KEY. Protected routes will reject requests.");
}

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false
      }
    })
  : null;

function getBearerToken(request) {
  const [scheme, token] = (request.headers.authorization ?? "").split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(request, response, next) {
  try {
    const token = getBearerToken(request);

    if (!token || !supabase) {
      response.status(401).json({ message: "You need to log in first." });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      response.status(401).json({ message: "Your session has expired. Please log in again." });
      return;
    }

    request.auth = {
      sub: data.user.id,
      email: data.user.email,
      user: data.user
    };
    next();
  } catch (error) {
    next(error);
  }
}
