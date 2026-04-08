"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "auth_failed") setError("Authentication failed. Please try again.");
  }, [searchParams]);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push("/practice");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { user_name: username } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data.user && !data.session) {
        setMessage("Check your email to confirm your account.");
      } else {
        router.push("/practice");
      }
    }
    setLoading(false);
  };

  const handleGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    backgroundColor: "#1e1e1c",
    border: "1px solid #2a2a26",
    borderRadius: "4px",
    color: "#e8d5b0",
    fontSize: "13px",
    fontFamily: "var(--font-jetbrains-mono, monospace)",
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1a18",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        padding: "20px",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
          <span style={{ color: "#c96a2a" }}>Syn</span>
          <span style={{ color: "#e8d5b0" }}>Type</span>
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#5a5a54" }}>
          Code typing practice
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "#141412",
          border: "1px solid #2a2a26",
          borderRadius: "8px",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Mode tabs */}
        <div style={{ display: "flex", gap: "0", border: "1px solid #2a2a26", borderRadius: "4px", overflow: "hidden" }}>
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setMessage(null); }}
              style={{
                flex: 1,
                padding: "8px",
                backgroundColor: mode === m ? "#1e1e1c" : "transparent",
                border: "none",
                color: mode === m ? "#e8d5b0" : "#5a5a54",
                fontSize: "12px",
                fontFamily: "monospace",
                cursor: "pointer",
                borderBottom: mode === m ? "2px solid #c96a2a" : "2px solid transparent",
                textTransform: "capitalize",
              }}
            >
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* GitHub OAuth */}
        <button
          onClick={handleGitHub}
          style={{
            width: "100%",
            padding: "9px",
            backgroundColor: "#1e1e1c",
            border: "1px solid #2a2a26",
            borderRadius: "4px",
            color: "#e8d5b0",
            fontSize: "12px",
            fontFamily: "monospace",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#5a5a54")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a26")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8d5b0">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#2a2a26" }} />
          <span style={{ fontSize: "10px", color: "#3a3a36" }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#2a2a26" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {mode === "signup" && (
            <div>
              <label style={{ fontSize: "10px", color: "#5a5a54", display: "block", marginBottom: "5px", letterSpacing: "0.05em" }}>USERNAME</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_handle"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#c96a2a")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2a26")}
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: "10px", color: "#5a5a54", display: "block", marginBottom: "5px", letterSpacing: "0.05em" }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#c96a2a")}
              onBlur={(e) => (e.target.style.borderColor = "#2a2a26")}
            />
          </div>
          <div>
            <label style={{ fontSize: "10px", color: "#5a5a54", display: "block", marginBottom: "5px", letterSpacing: "0.05em" }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#c96a2a")}
              onBlur={(e) => (e.target.style.borderColor = "#2a2a26")}
            />
          </div>

          {error && (
            <p style={{ fontSize: "11px", color: "#9e5a5a", margin: 0, padding: "8px 10px", backgroundColor: "#2a0e0e", borderRadius: "4px", border: "1px solid #5a2a2a" }}>
              {error}
            </p>
          )}
          {message && (
            <p style={{ fontSize: "11px", color: "#5a9e6a", margin: 0, padding: "8px 10px", backgroundColor: "#0e2a1a", borderRadius: "4px", border: "1px solid #1a5a2a" }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: loading ? "#1e1e1c" : "#2a1e08",
              border: "1px solid #c96a2a",
              borderRadius: "4px",
              color: loading ? "#5a5a54" : "#c96a2a",
              fontSize: "13px",
              fontFamily: "monospace",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
              transition: "all 0.15s",
            }}
          >
            {loading ? "..." : mode === "login" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        {/* Guest link */}
        <p style={{ fontSize: "11px", color: "#3a3a36", textAlign: "center", margin: 0 }}>
          <a href="/practice" style={{ color: "#5a5a54", textDecoration: "none" }}>
            Continue as guest
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
