"use client";

import { useState } from "react";
import { Snippet, Language, Difficulty } from "@/types";

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "python",     label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "go",         label: "Go" },
  { id: "typescript", label: "TypeScript" },
  { id: "rust",       label: "Rust" },
  { id: "c",          label: "C" },
  { id: "cpp",        label: "C++" },
];

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced", "custom"];

interface Props {
  defaultLanguage?: Language;
  editSnippet?: Snippet;
  onAdd: (snippet: Snippet) => void;
  onClose: () => void;
}

export default function CustomSnippet({ defaultLanguage = "python", editSnippet, onAdd, onClose }: Props) {
  const isEditing = !!editSnippet;

  const [language, setLanguage]     = useState<Language>(editSnippet?.language ?? defaultLanguage);
  const [difficulty, setDifficulty] = useState<Difficulty>(editSnippet?.difficulty ?? "intermediate");
  const [name, setName]             = useState(editSnippet?.topic ?? "");
  const [code, setCode]             = useState(editSnippet?.code ?? "");
  const [error, setError]           = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);
    if (!name.trim()) { setError("Please give your snippet a name."); return; }
    if (!code.trim()) { setError("Please paste some code."); return; }

    const snippet: Snippet = {
      id: editSnippet?.id ?? `custom-${Date.now()}`,
      language,
      topic: name.trim(),
      difficulty,
      code: code.trimEnd(),
      explanation: "Custom snippet",
    };
    onAdd(snippet);
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    backgroundColor: "#1e1e1c",
    border: "1px solid #2a2a26",
    borderRadius: "4px",
    color: "#e8d5b0",
    fontSize: "12px",
    fontFamily: "monospace",
    outline: "none",
    boxSizing: "border-box" as const,
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
          width: "480px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 8px 32px #000000aa",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", color: "#e8d5b0" }}>{isEditing ? "Edit Snippet" : "Add Custom Snippet"}</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#5a5a54", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>

        {/* Name */}
        <div>
          <label style={{ fontSize: "10px", color: "#5a5a54", display: "block", marginBottom: "6px", letterSpacing: "0.1em" }}>
            NAME
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Binary Search"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#c96a2a")}
            onBlur={(e)  => (e.target.style.borderColor = "#2a2a26")}
          />
        </div>

        {/* Language */}
        <div>
          <label style={{ fontSize: "10px", color: "#5a5a54", display: "block", marginBottom: "6px", letterSpacing: "0.1em" }}>
            LANGUAGE
          </label>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                style={{
                  padding: "4px 10px",
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

        {/* Difficulty */}
        <div>
          <label style={{ fontSize: "10px", color: "#5a5a54", display: "block", marginBottom: "6px", letterSpacing: "0.1em" }}>
            DIFFICULTY
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            style={{
              ...inputStyle,
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235a5a54'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              paddingRight: "28px",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#c96a2a")}
            onBlur={(e)  => (e.target.style.borderColor = "#2a2a26")}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d} style={{ backgroundColor: "#1e1e1c", color: "#e8d5b0", textTransform: "capitalize" }}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Code */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "10px", color: "#5a5a54", letterSpacing: "0.1em" }}>
            CODE
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={10}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: "1.6",
              whiteSpace: "pre",
              overflowX: "auto",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#c96a2a")}
            onBlur={(e)  => (e.target.style.borderColor = "#2a2a26")}
          />
        </div>

        {error && (
          <p style={{ fontSize: "11px", color: "#9e5a5a", margin: 0 }}>{error}</p>
        )}

        <button
          onClick={handleAdd}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #c96a2a",
            backgroundColor: "#2a1e08",
            color: "#c96a2a",
            fontSize: "13px",
            fontFamily: "monospace",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {isEditing ? "Save Changes →" : "Add Snippet →"}
        </button>
      </div>
    </div>
  );
}
