"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const LANGS = ["python", "javascript", "go", "typescript", "rust"];
const LANG_ICONS: Record<string, string> = {
  python: "PY", javascript: "JS", go: "GO", typescript: "TS", rust: "RS",
};

interface LeaderboardRow {
  rank: number;
  username: string;
  best_wpm: number;
  language: string;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("python");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("leaderboard")
          .select("best_wpm, language, profiles(username)")
          .eq("language", activeTab)
          .order("best_wpm", { ascending: false })
          .limit(20);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: LeaderboardRow[] = ((data ?? []) as any[]).map((r, i) => ({
          rank: i + 1,
          username: r.profiles?.username ?? "anonymous",
          best_wpm: r.best_wpm,
          language: r.language,
        }));
        setRows(mapped);
      } catch {}
      setLoading(false);
    }
    load();
  }, [activeTab]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1a18",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Titlebar */}
      <div
        style={{
          height: "38px",
          backgroundColor: "#141412",
          borderBottom: "1px solid #2a2a26",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "16px",
        }}
      >
        <Link href="/practice" style={{ fontSize: "11px", color: "#5a5a54", textDecoration: "none" }}>
          ← Practice
        </Link>
        <span style={{ fontSize: "12px", color: "#e8d5b0" }}>
          <span style={{ color: "#c96a2a" }}>Syn</span>Type · Leaderboard
        </span>
      </div>

      <div style={{ flex: 1, maxWidth: "700px", margin: "0 auto", padding: "32px 20px", width: "100%" }}>
        <h1 style={{ fontSize: "20px", color: "#e8d5b0", marginBottom: "8px" }}>Leaderboard</h1>
        <p style={{ fontSize: "12px", color: "#5a5a54", marginBottom: "24px" }}>Top WPM per language</p>

        {/* Language tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {LANGS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              style={{
                padding: "6px 14px",
                borderRadius: "4px",
                border: `1px solid ${activeTab === lang ? "#c96a2a" : "#2a2a26"}`,
                backgroundColor: activeTab === lang ? "#2a1e08" : "#1e1e1c",
                color: activeTab === lang ? "#c96a2a" : "#5a5a54",
                fontSize: "11px",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              {LANG_ICONS[lang]} {lang}
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            backgroundColor: "#1e1e1c",
            border: "1px solid #2a2a26",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 100px",
              padding: "10px 16px",
              borderBottom: "1px solid #2a2a26",
            }}
          >
            {["#", "User", "WPM"].map((h) => (
              <span key={h} style={{ fontSize: "10px", color: "#5a5a54", letterSpacing: "0.05em" }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#5a5a54", fontSize: "12px" }}>
              Loading...
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#5a5a54", fontSize: "12px" }}>
              No entries yet. Be the first!
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row.rank}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 100px",
                  padding: "10px 16px",
                  borderBottom: "1px solid #1a1a18",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: row.rank <= 3 ? "#c96a2a" : "#5a5a54", fontWeight: row.rank <= 3 ? "700" : "400" }}>
                  {row.rank <= 3 ? ["🥇", "🥈", "🥉"][row.rank - 1] : row.rank}
                </span>
                <span style={{ fontSize: "12px", color: "#e8d5b0" }}>{row.username}</span>
                <span style={{ fontSize: "14px", color: "#c96a2a", fontWeight: "600" }}>{row.best_wpm}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Prompt bar */}
      <div
        style={{
          height: "28px",
          backgroundColor: "#141412",
          borderTop: "1px solid #2a2a26",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "12px",
        }}
      >
        <span style={{ color: "#5a9e6a", fontSize: "11px" }}>$</span>
        <span style={{ color: "#5a5a54", fontSize: "11px" }}>syntype · leaderboard · {activeTab}</span>
      </div>
    </div>
  );
}
