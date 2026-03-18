"use client";
import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function AuthModal({ onClose }) {
  const { login, signup, loginWithGoogle, loginWithGitHub } = useAuth();
  const [mode,     setMode]     = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [oauthLoading, setOAuthLoading] = useState("");
  const [success,  setSuccess]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(name, email, password);
        setSuccess(true); // show "check your email" message
      } else {
        await login(email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider) {
    setError("");
    setOAuthLoading(provider);
    try {
      if (provider === "google") await loginWithGoogle();
      else await loginWithGitHub();
      // Redirect happens automatically — no need to call onClose
    } catch (err) {
      setError(err.message);
      setOAuthLoading("");
    }
  }

  if (success) {
    return (
      <>
        <div className="modal-overlay" onClick={onClose} />
        <div className="modal-box">
          <button className="modal-close" onClick={onClose}>✕</button>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 className="modal-title">Check your email</h2>
            <p className="modal-sub">
              We sent a confirmation link to <strong>{email}</strong>.<br />
              Click the link to activate your account, then sign in.
            </p>
            <button className="form-submit" onClick={() => { setSuccess(false); setMode("login"); }}>
              Back to Sign In
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal-logo">
          <span className="logo-dot" />web<em>grid</em>
        </div>

        <h2 className="modal-title">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="modal-sub">
          {mode === "login"
            ? "Sign in to access your bookmarks from any device."
            : "Save and organise websites. Download bookmarks for your browser."}
        </p>

        {/* OAuth buttons */}
        <div className="oauth-row">
          <button
            className="oauth-btn"
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
          </button>
          <button
            className="oauth-btn"
            onClick={() => handleOAuth("github")}
            disabled={!!oauthLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            {oauthLoading === "github" ? "Redirecting…" : "Continue with GitHub"}
          </button>
        </div>

        <div className="modal-divider"><span>or</span></div>

        {/* Email/password form */}
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          {mode === "signup" && (
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Alex Smith"
                value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </div>
          )}
          <div className="form-field">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              autoFocus={mode === "login"} />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input className="form-input" type="password"
              placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <div className="form-error">⚠ {error}</div>}

          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="modal-switch">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }}>Sign up free</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
            </>
          )}
        </div>

        <div className="modal-note">
          🔒 Secured by Supabase. Your data is encrypted and private.
        </div>
      </div>
    </>
  );
}
