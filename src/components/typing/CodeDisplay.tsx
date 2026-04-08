"use client";

import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Language } from "@/types";
import { tokenize, TOKEN_COLORS, Token } from "@/lib/snippets/tokenizer";
import { describeCodeLine } from "@/lib/snippets/lineDescriptions";
import { getTokenInfo } from "@/lib/snippets/tokenDescriptions";

export interface DescriptionInfo {
  mode: "word" | "line";
  lineNum?: number;   // line mode
  label?: string;     // word mode — badge text
  color?: string;     // word mode — token colour
  value?: string;     // word mode — token text
  text: string;       // description sentence
}

// Blend a hex colour toward the editor background at the given opacity (0–1)
function dimColor(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const bg = { r: 0x1e, g: 0x1e, b: 0x1c };
  const mix = (c: number, bgC: number) => Math.round(bgC + (c - bgC) * opacity);
  return `rgb(${mix(r, bg.r)}, ${mix(g, bg.g)}, ${mix(b, bg.b)})`;
}

interface Props {
  code: string;
  language: Language;
  position: number;
  errorMap: Record<number, number>;
  isLocked: boolean;
  fontSize: number;
  onDescriptionChange?: (info: DescriptionInfo | null) => void;
}

/** Renders backtick-wrapped identifiers in the accent colour. */
function DescriptionText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} style={{ color: "#c96a2a", fontFamily: "inherit", fontSize: "inherit" }}>
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function CodeDisplay({
  code,
  language,
  position,
  errorMap,
  isLocked,
  fontSize,
  onDescriptionChange,
}: Props) {
  const tokens = useMemo(() => tokenize(code, language), [code, language]);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // ── Line hover (mouse move) ───────────────────────────────────
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const codeLines = useMemo(() => code.split("\n"), [code]);

  // Precompute where each line starts in the flat char array
  const lineStartPositions = useMemo(() => {
    const positions: number[] = [0];
    for (let i = 0; i < code.length - 1; i++) {
      if (code[i] === "\n") positions.push(i + 1);
    }
    return positions;
  }, [code]);

  const lineDescription = useMemo(() => {
    if (hoveredLine === null) return null;
    return describeCodeLine(codeLines[hoveredLine] ?? "", language);
  }, [hoveredLine, codeLines, language]);

  // ── Word click ────────────────────────────────────────────────
  const [selectedCharIdx, setSelectedCharIdx] = useState<number | null>(null);

  // Clear selection when snippet changes
  useEffect(() => { setSelectedCharIdx(null); }, [code]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only act if a word span (data-idx) was clicked — ignore whitespace / empty areas
      const el = (e.target as HTMLElement).closest("[data-idx]");
      if (!el) return;
      const rawIdx = parseInt(el.getAttribute("data-idx") ?? "-1");
      if (rawIdx < 0) return;
      // Toggle: clicking the same word again clears it
      setSelectedCharIdx((prev) => (prev === rawIdx ? null : rawIdx));
    },
    []
  );

  // Scroll cursor into view
  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [position]);

  // Build a flat char→token map for O(1) lookup
  const charTokenMap = useMemo(() => {
    const map: Token[] = new Array(code.length);
    for (const tok of tokens) {
      for (let i = tok.start; i < tok.end; i++) map[i] = tok;
    }
    return map;
  }, [tokens, code.length]);

  // Derive selected token info
  const selectedToken     = selectedCharIdx !== null ? (charTokenMap[selectedCharIdx] ?? null) : null;
  const selectedTokenInfo = selectedToken ? getTokenInfo(selectedToken, language) : null;
  const hlStart = selectedToken?.start ?? -1;
  const hlEnd   = selectedToken?.end   ?? -1;

  const chars = useMemo(() => {
    return code.split("").map((ch, idx) => {
      const tok = charTokenMap[idx];
      const tokenColor = tok ? TOKEN_COLORS[tok.type] : TOKEN_COLORS.plain;

      const isTyped  = idx < position;
      const isCursor = idx === position;
      const hasError = errorMap[idx] > 0;
      const isInHL   = hlStart >= 0 && idx >= hlStart && idx < hlEnd;

      let color: string;
      let bg: string = "transparent";
      let borderBottom = "none";

      if (isTyped) {
        color = hasError ? "#9e5a5a" : tokenColor;
        if (hasError) borderBottom = "2px solid #9e5a5a";
      } else if (isCursor) {
        color = tokenColor;
        bg = isLocked ? "#3a0e0e" : "transparent";
      } else {
        color = dimColor(tokenColor, 0.35);
      }

      // Underline the clicked word
      if (isInHL && !hasError && tok?.type !== "whitespace") {
        borderBottom = `1px solid ${TOKEN_COLORS[tok!.type]}88`;
      }

      if (ch === "\n") {
        // Only render the cursor indicator; the newline itself is implicit in line-based layout
        return (
          <React.Fragment key={idx}>
            {isCursor && (
              <span
                ref={cursorRef}
                style={{
                  display: "inline-block", width: "2px", height: `${fontSize}px`,
                  backgroundColor: isLocked ? "#9e5a5a" : "#c96a2a",
                  animation: isLocked ? "none" : "cursorBlink 1s step-end infinite",
                  verticalAlign: "text-bottom", marginRight: "1px",
                }}
              />
            )}
          </React.Fragment>
        );
      }

      if (ch === " " || ch === "\t") {
        return (
          <span key={idx} style={{ position: "relative", display: "inline-block" }}>
            {isCursor && (
              <span
                ref={cursorRef}
                style={{
                  position: "absolute", left: 0, top: 0, width: "2px", height: "100%",
                  backgroundColor: isLocked ? "#9e5a5a" : "#c96a2a",
                  animation: isLocked ? "none" : "cursorBlink 1s step-end infinite",
                }}
              />
            )}
            <span style={{ color: isTyped ? (hasError ? "#9e5a5a" : "#3a3a36") : "#1e1e1c", fontSize: ch === "\t" ? "0.7em" : undefined }}>
              {ch === "\t" ? "\t" : " "}
            </span>
          </span>
        );
      }

      // Word characters carry data-idx so clicks can be detected
      return (
        <span
          key={idx}
          data-idx={idx}
          style={{ position: "relative", display: "inline", color, backgroundColor: bg, borderBottom }}
        >
          {isCursor && (
            <span
              ref={isCursor ? cursorRef : undefined}
              style={{
                position: "absolute", left: 0, top: 0, width: "2px", height: "100%",
                backgroundColor: isLocked ? "#9e5a5a" : "#c96a2a",
                animation: isLocked ? "none" : "cursorBlink 1s step-end infinite",
                pointerEvents: "none",
              }}
            />
          )}
          {ch}
        </span>
      );
    });
  }, [code, position, errorMap, isLocked, charTokenMap, fontSize, hlStart, hlEnd]);

  // Notify parent of the current description whenever it changes
  const wordDesc = selectedTokenInfo?.description ?? null;
  useEffect(() => {
    if (wordDesc) {
      onDescriptionChange?.({
        mode: "word",
        label: selectedTokenInfo!.label,
        color: selectedTokenInfo!.color,
        value: selectedToken!.value,
        text: wordDesc,
      });
    } else if (lineDescription) {
      onDescriptionChange?.({
        mode: "line",
        lineNum: (hoveredLine ?? 0) + 1,
        text: lineDescription,
      });
    } else {
      onDescriptionChange?.(null);
    }
  }, [wordDesc, lineDescription, hoveredLine, selectedToken, selectedTokenInfo, onDescriptionChange]);

  const lineNumWidth = `${Math.max(2, String(codeLines.length).length)}ch`;

  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: "1.8",
        fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
        margin: 0,
        paddingTop: "16px",
        paddingBottom: "16px",
        background: "#1e1e1c",
        borderRadius: "0 0 6px 6px",
        minHeight: "200px",
        cursor: "text",
        userSelect: "none",
        overflowX: "auto",
      }}
      onMouseLeave={() => setHoveredLine(null)}
      onClick={handleClick}
    >
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      {codeLines.map((line, lineIdx) => {
        const lineStart = lineStartPositions[lineIdx];
        // slice includes the \n position (cursor-only element) for non-last lines
        const lineChars = chars.slice(lineStart, lineStart + line.length + 1);

        return (
          <div
            key={lineIdx}
            style={{ display: "flex", alignItems: "baseline" }}
            onMouseEnter={() => setHoveredLine(lineIdx)}
          >
            {/* Gutter */}
            <span
              style={{
                flexShrink: 0,
                width: lineNumWidth,
                textAlign: "right",
                paddingLeft: "24px",
                paddingRight: "20px",
                color: "#4e4e4c",
                fontSize: "0.88em",
                userSelect: "none",
              }}
            >
              {lineIdx + 1}
            </span>
            {/* Subtle gutter separator */}
            <span
              style={{
                flexShrink: 0,
                width: "1px",
                alignSelf: "stretch",
                background: "#2a2a28",
                marginRight: "20px",
              }}
            />
            {/* Code */}
            <pre
              style={{
                margin: 0,
                padding: 0,
                paddingRight: "32px",
                fontFamily: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit",
                whiteSpace: "pre",
                tabSize: 4,
                background: "transparent",
                flex: 1,
              }}
            >
              {lineChars}
            </pre>
          </div>
        );
      })}
    </div>
  );
}
