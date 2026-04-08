"use client";

import { useState } from "react";
import { Snippet, Language, Difficulty } from "@/types";

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "python",     label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "go",         label: "Go" },
  { id: "rust",       label: "Rust" },
  { id: "c",          label: "C" },
  { id: "cpp",        label: "C++" },
  { id: "json",       label: "JSON" },
  { id: "html",       label: "HTML" },
  { id: "css",        label: "CSS" },
  { id: "tailwind",   label: "Tailwind CSS" },
  { id: "java",       label: "Java" },
];
const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

interface Props {
  onAdd: (snippet: Snippet) => void;
  onClose: () => void;
}

export default function GenerateSnippet({ onAdd, onClose }: Props) {
  const [language, setLanguage] = useState<Language>("python");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-snippet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, topic, difficulty }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Unknown error");
      onAdd(data.snippet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#00000088",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#141412",
          border: "1px solid #2a2a26",
          borderRadius: "8px",
          padding: "24px",
          width: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 8px 32px #000000aa",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", color: "#e8d5b0" }}>Generate Snippet</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#5a5a54", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>

        {/* Language */}
        <div>
          <label style={{ fontSize: "10px", color: "#5a5a54", display: "block", marginBottom: "6px" }}>LANGUAGE</label>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "3px",
                  border: `1px solid ${language === l.id ? "#c96a2a" : "#2a2a26"}`,
                  backgroundColor: language === l.id ? "#2a1e08" : "#1e1e1c",
                  color: language === l.id ? "#c96a2a" : "#5a5a54",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  cursor: "pointer",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label style={{ fontSize: "10px", color: "#5a5a54", display: "block", marginBottom: "6px" }}>TOPIC (optional)</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. binary tree, LRU cache..."
            style={{
              width: "100%",
              padding: "8px 10px",
              backgroundColor: "#1e1e1c",
              border: "1px solid #2a2a26",
              borderRadius: "4px",
              color: "#e8d5b0",
              fontSize: "12px",
              fontFamily: "monospace",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#c96a2a")}
            onBlur={(e) => (e.target.style.borderColor = "#2a2a26")}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label style={{ fontSize: "10px", color: "#5a5a54", display: "block", marginBottom: "6px" }}>DIFFICULTY</label>
          <div style={{ display: "flex", gap: "6px" }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  flex: 1,
                  padding: "4px",
                  borderRadius: "3px",
                  border: `1px solid ${difficulty === d ? "#c96a2a" : "#2a2a26"}`,
                  backgroundColor: difficulty === d ? "#2a1e08" : "#1e1e1c",
                  color: difficulty === d ? "#c96a2a" : "#5a5a54",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ fontSize: "11px", color: "#9e5a5a", margin: 0 }}>{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #c96a2a",
            backgroundColor: loading ? "#1e1e1c" : "#2a1e08",
            color: loading ? "#5a5a54" : "#c96a2a",
            fontSize: "13px",
            fontFamily: "monospace",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {loading ? "Generating..." : "Generate →"}
        </button>
      </div>
    </div>
  );
}
