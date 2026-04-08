"use client";

import { useState } from "react";
import { Language, Difficulty, Snippet } from "@/types";
import { getLanguageCounts } from "@/lib/snippets/data";

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

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner:     "#5a9e6a",
  intermediate: "#c98a4a",
  advanced:     "#9e5a5a",
  custom:       "#5a7a9e",
};

interface Props {
  snippets: Snippet[];
  activeLanguage: Language;
  activeSnippetId: string | null;
  onSelectSnippet: (id: string) => void;
  onSelectLanguage: (lang: Language) => void;
  onOpenGenerate: () => void;
  onOpenCustomSnippet: () => void;
  onEditSnippet: (id: string) => void;
  onDeleteSnippet: (id: string) => void;
}

export default function Sidebar({
  snippets,
  activeLanguage,
  activeSnippetId,
  onSelectSnippet,
  onSelectLanguage,
  onOpenGenerate,
  onOpenCustomSnippet,
  onEditSnippet,
  onDeleteSnippet,
}: Props) {
  const [langsOpen,   setLangsOpen]   = useState(true);
  const [builtInOpen, setBuiltInOpen] = useState(true);
  const [customOpen,  setCustomOpen]  = useState(true);
  const [hoveredId,   setHoveredId]   = useState<string | null>(null);

  const counts = getLanguageCounts();

  // Show a language if it has built-in snippets OR any snippet exists for it in the current session
  const sessionCounts = snippets.reduce((acc, s) => {
    acc[s.language] = (acc[s.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const visibleLanguages = LANGUAGES.filter(
    (l) => (counts[l.id] ?? 0) > 0 || (sessionCounts[l.id] ?? 0) > 0
  );

  const forLanguage = snippets.filter((s) => s.language === activeLanguage);
  const isUserSnippet = (id: string) => id.startsWith("custom-") || id.startsWith("generated-");
  const builtInSnippets = forLanguage.filter((s) => !isUserSnippet(s.id));
  const customSnippets  = forLanguage.filter((s) =>  isUserSnippet(s.id));

  const activeLangLabel  = visibleLanguages.find((l) => l.id === activeLanguage)?.label ?? activeLanguage;
  const activeSnippet    = snippets.find((s) => s.id === activeSnippetId);
  const activeIsCustom   = activeSnippet ? isUserSnippet(activeSnippet.id) : false;
  const hasAnyCustom     = snippets.some((s) => isUserSnippet(s.id));

  const plusBtnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#3a3a36",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: 1,
    padding: "0 2px",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div
      style={{
        width: "200px",
        minWidth: "200px",
        backgroundColor: "#141412",
        borderRight: "1px solid #2a2a26",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Languages — single select */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid #2a2a26" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 12px 6px", gap: "4px" }}>
          <button
            onClick={() => setLangsOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              padding: 0,
            }}
          >
            <span
              style={{
                fontSize: "8px",
                color: "#3a3a36",
                transform: langsOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
                display: "inline-block",
                lineHeight: 1,
              }}
            >
              ▶
            </span>
            {langsOpen ? (
              <span style={{ fontSize: "9px", color: "#5a5a54", letterSpacing: "0.1em" }}>LANGUAGES</span>
            ) : (
              <span style={{ fontSize: "11px", color: "#c96a2a", fontFamily: "monospace" }}>{activeLangLabel}</span>
            )}
          </button>
          <button
            onClick={onOpenGenerate}
            title="Generate a snippet with AI"
            style={plusBtnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c96a2a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a36")}
          >
            +
          </button>
        </div>
        {langsOpen && visibleLanguages.map((lang) => {
          const active = lang.id === activeLanguage;
          return (
            <button
              key={lang.id}
              onClick={() => onSelectLanguage(lang.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "6px 12px",
                backgroundColor: active ? "#1e1e1c" : "transparent",
                border: "none",
                borderLeft: active ? "2px solid #c96a2a" : "2px solid transparent",
                cursor: "pointer",
                color: active ? "#e8d5b0" : "#5a5a54",
                fontSize: "12px",
                fontFamily: "monospace",
                textAlign: "left",
              }}
            >
              <span>{lang.label}</span>
              <span style={{ fontSize: "10px", color: active ? "#c96a2a" : "#3a3a36" }}>
                {counts[lang.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Snippet list — only for active language */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>

        {/* ── Built-in snippets ── */}
        <div style={{ display: "flex", alignItems: "center", padding: "4px 12px 6px", gap: "4px" }}>
          <button
            onClick={() => setBuiltInOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              padding: 0,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: "8px",
                color: "#3a3a36",
                transform: builtInOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
                display: "inline-block",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ▶
            </span>
            {builtInOpen ? (
              <>
                <span style={{ fontSize: "9px", color: "#5a5a54", letterSpacing: "0.1em" }}>SNIPPETS</span>
                <span style={{ fontSize: "9px", color: "#3a3a36", marginLeft: "auto" }}>{builtInSnippets.length}</span>
              </>
            ) : (
              <span style={{ fontSize: "11px", color: !activeIsCustom && activeSnippet ? "#e8d5b0" : "#5a5a54", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {!activeIsCustom && activeSnippet ? activeSnippet.topic : "SNIPPETS"}
              </span>
            )}
          </button>
          <button
            onClick={onOpenCustomSnippet}
            title="Add your own snippet"
            style={plusBtnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c96a2a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a36")}
          >
            +
          </button>
        </div>

        {builtInOpen && builtInSnippets.map((s) => {
          const isActive = s.id === activeSnippetId;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSnippet(s.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                padding: "6px 12px",
                backgroundColor: isActive ? "#1e1e1c" : "transparent",
                border: "none",
                borderLeft: isActive ? "2px solid #c96a2a" : "2px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                gap: "2px",
              }}
            >
              <span style={{ fontSize: "12px", color: isActive ? "#e8d5b0" : "#5a5a54", fontFamily: "monospace" }}>
                {s.topic}
              </span>
              <span style={{ fontSize: "9px", color: DIFFICULTY_COLORS[s.difficulty] }}>
                {s.difficulty}
              </span>
            </button>
          );
        })}

        {/* ── Custom snippets — only shown once at least one exists ── */}
        {hasAnyCustom && (
          <>
            <div style={{ margin: "8px 12px 0", borderTop: "1px solid #2a2a26" }} />
            <div style={{ display: "flex", alignItems: "center", padding: "8px 12px 6px", gap: "4px" }}>
              <button
                onClick={() => setCustomOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flex: 1,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  padding: 0,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: "8px",
                    color: "#3a3a36",
                    transform: customOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                    display: "inline-block",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ▶
                </span>
                {customOpen ? (
                  <>
                    <span style={{ fontSize: "9px", color: "#5a5a54", letterSpacing: "0.1em" }}>YOUR SNIPPETS</span>
                    <span style={{ fontSize: "9px", color: "#3a3a36", marginLeft: "auto" }}>{customSnippets.length || ""}</span>
                  </>
                ) : (
                  <span style={{ fontSize: "11px", color: activeIsCustom && activeSnippet ? "#e8d5b0" : "#5a5a54", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {activeIsCustom && activeSnippet ? activeSnippet.topic : "YOUR SNIPPETS"}
                  </span>
                )}
              </button>
            </div>

            {customOpen && (
              customSnippets.length === 0 ? (
                <p style={{ fontSize: "10px", color: "#3a3a36", margin: "0 12px", fontFamily: "monospace" }}>
                  none for this language
                </p>
              ) : (
                customSnippets.map((s) => {
                  const isActive  = s.id === activeSnippetId;
                  const isHovered = s.id === hoveredId;
                  return (
                    <div
                      key={s.id}
                      onMouseEnter={() => setHoveredId(s.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        backgroundColor: isActive ? "#1e1e1c" : "transparent",
                        borderLeft: isActive ? "2px solid #c96a2a" : "2px solid transparent",
                      }}
                    >
                      <button
                        onClick={() => onSelectSnippet(s.id)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                          minWidth: 0,
                          padding: "6px 4px 6px 12px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          gap: "2px",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: isActive ? "#e8d5b0" : "#5a5a54", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.topic}
                        </span>
                        <span style={{ fontSize: "9px", color: DIFFICULTY_COLORS[s.difficulty] }}>
                          {s.difficulty}
                        </span>
                      </button>
                      {/* Edit / Delete — visible on hover */}
                      <div style={{ display: "flex", gap: "2px", padding: "0 6px", opacity: isHovered ? 1 : 0, transition: "opacity 0.1s", flexShrink: 0 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditSnippet(s.id); }}
                          title="Edit snippet"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#5a5a54", fontSize: "11px", padding: "2px 3px", lineHeight: 1 }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#c96a2a")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a54")}
                        >
                          ✎
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteSnippet(s.id); }}
                          title="Delete snippet"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#5a5a54", fontSize: "11px", padding: "2px 3px", lineHeight: 1 }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#9e5a5a")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a54")}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
