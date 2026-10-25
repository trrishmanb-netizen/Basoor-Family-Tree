"use client";

import { useState } from "react";
import { apiFetch, onGithubPages, setAuthToken } from "../lib/api-client";

export default function Signin({ onSignedIn }: { onSignedIn?: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await apiFetch(`/api/auth/${mode === "login" ? "login" : "signup"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { error?: string; token?: string };
      if (!response.ok) {
        setMessage(result.error || "Please try again.");
        return;
      }
      if (onGithubPages()) {
        if (!result.token) throw new Error("Sign-in token is missing.");
        setAuthToken(result.token);
      }
      if (onSignedIn) onSignedIn();
      else window.location.href = "/#account";
    } catch {
      setMessage("Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="page-shell sign-in-page">
    <div className="page-head">
      <div className="eyebrow">FAMILY ACCOUNT</div>
      <h1>{mode === "login" ? "Welcome back" : "Join the family portal"}</h1>
      <div className="ornament">❦</div>
      <p>Create an account to see the private gallery and share family events. Trrishman manages family profiles and can remove account access.</p>
    </div>
    <div className="panel" style={{ maxWidth: 530, margin: "auto" }}>
      <div className="controls-row" style={{ justifyContent: "center" }}>
        <button type="button" className={mode === "login" ? "gold-button" : "outline-button"} onClick={() => { setMode("login"); setMessage(""); }}>Sign in</button>
        <button type="button" className={mode === "signup" ? "gold-button" : "outline-button"} onClick={() => { setMode("signup"); setMessage(""); }}>Create account</button>
      </div>
      <form className="form-stack" onSubmit={submit}>
        {mode === "signup" && <div><label className="form-label">Your name</label><input className="field" name="name" required maxLength={100} autoComplete="name" /></div>}
        <div><label className="form-label">Email</label><input className="field" type="email" name="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={200} autoComplete="email" /></div>
        <div><label className="form-label">Password</label><input className="field" type="password" name="password" required minLength={mode === "signup" ? 12 : 1} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} />{mode === "signup" && <small>Use at least 12 characters.</small>}</div>
        {mode === "signup" && email.trim().toLowerCase() === "trrishman.b@gmail.com" && <div><label className="form-label">Administrator setup code</label><input className="field" type="password" name="adminSetupCode" required autoComplete="off" /></div>}
        <button className="gold-button" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
      </form>
      {message && <p className="status">{message}</p>}
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 23 }}>New accounts get access immediately. Trrishman manages the family profiles and account access.</p>
    </div>
  </div>;
}
