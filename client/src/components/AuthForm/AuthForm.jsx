import React, { useState } from "react";
import { supabase } from "../../supabase.js";
import "./AuthForm.css";

export function AuthForm() {
  const [form, setForm] = useState({
    displayName: "",
    email: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
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

      setMessage("Check your email for your secure login link.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
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
