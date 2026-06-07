import { supabase } from "../supabase.js";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function apiRequest(path, options = {}) {
  const { data: sessionData } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const accessToken = sessionData.session?.access_token;

  const response = await fetch(`${apiUrl}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers
    },
    ...options
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json()
        : null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Something went wrong.");
  }

  if (!contentType.includes("application/json")) {
    throw new Error("The API returned a non-JSON response. Check that the Express server is running on port 3001.");
  }

  return data;
}
