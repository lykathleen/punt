import React, { useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../supabase.js";
import "./AuthForm.css";

const resendCooldownMs = 60 * 1000;

export function AuthForm() {
  const [form, setForm] = useState({
    displayName: "",
    email: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);

  function updateField(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitLock.current) {
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);
    submitLock.current = true;

    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the client environment.");
      }

      const lastRequestAt = Number(window.localStorage.getItem("punt_last_magic_link_request") ?? 0);
      const cooldownRemainingMs = resendCooldownMs - (Date.now() - lastRequestAt);

      if (cooldownRemainingMs > 0) {
        const seconds = Math.ceil(cooldownRemainingMs / 1000);
        throw new Error(`Please wait ${seconds}s before requesting another login link.`);
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: form.displayName.trim()
          }
        }
      });

      if (signInError) {
        throw signInError;
      }

      window.localStorage.setItem("punt_last_magic_link_request", String(Date.now()));
      setMessage("Check your email for your secure login link.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
      submitLock.current = false;
    }
  }

  return (
    <section className="auth-panel" aria-label="Email login">
      <div>
        <p className="eyebrow">Punt</p>
        <h1>Check your inbox.</h1>
        <p className="lead">
          Enter your email and we will send you a secure one-time link to get into your prediction
          league.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-heading">
          <h2>Log in with email</h2>
          <p>New users are created automatically the first time they use a valid link.</p>
        </div>

        {!isSupabaseConfigured && (
          <p className="form-error">
            Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the
            client environment, then redeploy.
          </p>
        )}

        <label>
          Display name
          <input
            autoComplete="name"
            name="displayName"
            onChange={updateField}
            placeholder="Used for new accounts"
            type="text"
            value={form.displayName}
          />
        </label>

        <label>
          Email
          <input
            autoComplete="email"
            name="email"
            onChange={updateField}
            required
            type="email"
            value={form.email}
          />
        </label>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending..." : "Send login link"}
        </button>
      </form>
    </section>
  );
}
