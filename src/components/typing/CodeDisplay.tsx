"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Language } from "@/types";
import { tokenize, TOKEN_COLORS, Token } from "@/lib/snippets/tokenizer";

// Blend a hex colour toward the editor background at the given opacity (0–1)
function dimColor(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Mix with editor bg #1e1e1c
  const bg = { r: 0x1e, g: 0x1e, b: 0x1c };
  const mix = (c: number, bgC: number) => Math.round(bgC + (c - bgC) * opacity);
  return `rgb(${mix(r, bg.r)}, ${mix(g, bg.g)}, ${mix(b, bg.b)})`;
}

interface Props {
  code: string;
  language: Language;
  position: number;      // current typed position
  errorMap: Record<number, number>;
  isLocked: boolean;     // cursor locked on error
  fontSize: number;
}

export default function CodeDisplay({
  code,
  language,
  position,
  errorMap,
  isLocked,
  fontSize,
}: Props) {
  const tokens = useMemo(() => tokenize(code, language), [code, language]);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Scroll cursor into view
  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [position]);

  // Build a flat char→token map for O(1) lookup
  const charTokenMap = useMemo(() => {
    const map: Token[] = new Array(code.length);
    for (const tok of tokens) {
      for (let i = tok.start; i < tok.end; i++) {
        map[i] = tok;
      }
    }
    return map;
  }, [tokens, code.length]);

  const chars = useMemo(() => {
    return code.split("").map((ch, idx) => {
      const tok = charTokenMap[idx];
      const tokenColor = tok ? TOKEN_COLORS[tok.type] : TOKEN_COLORS.plain;

      const isTyped   = idx < position;
      const isCursor  = idx === position;
      const hasError  = errorMap[idx] > 0;

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
        // Untyped — dim version of the token colour so it's readable but clearly not yet typed
        color = dimColor(tokenColor, 0.35);
      }

      // Render whitespace visually
      if (ch === "\n") {
        const showCursor = isCursor;
        return (
          <React.Fragment key={idx}>
            {showCursor && (
              <span
                ref={cursorRef}
                style={{ display: "inline-block", width: "2px", height: `${fontSize}px`,
                  backgroundColor: isLocked ? "#9e5a5a" : "#c96a2a",
                  animation: isLocked ? "none" : "cursorBlink 1s step-end infinite",
                  verticalAlign: "text-bottom", marginRight: "1px" }}
              />
            )}
            {"\n"}
          </React.Fragment>
        );
      }

      if (ch === " " || ch === "\t") {
        return (
          <span key={idx} style={{ position: "relative", display: "inline-block" }}>
            {isCursor && (
              <span
                ref={cursorRef}
                style={{ position: "absolute", left: 0, top: 0, width: "2px",
                  height: "100%", backgroundColor: isLocked ? "#9e5a5a" : "#c96a2a",
                  animation: isLocked ? "none" : "cursorBlink 1s step-end infinite" }}
              />
            )}
            <span
              style={{
                color: isTyped ? (hasError ? "#9e5a5a" : "#3a3a36") : "#1e1e1c",
                fontSize: ch === "\t" ? "0.7em" : undefined,
              }}
            >
              {ch === "\t" ? "\t" : " "}
            </span>
          </span>
        );
      }

      return (
        <span
          key={idx}
          style={{
            position: "relative",
            display: "inline",
            color,
            backgroundColor: bg,
            borderBottom,
          }}
        >
          {isCursor && (
            <span
              ref={isCursor ? cursorRef : undefined}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "2px",
                height: "100%",
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
  }, [code, position, errorMap, isLocked, charTokenMap, fontSize]);

  return (
    <pre
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: "1.8",
        fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
        margin: 0,
        padding: "24px 32px",
        overflowX: "auto",
        whiteSpace: "pre",
        tabSize: 4,
        background: "#1e1e1c",
        borderRadius: "0 0 6px 6px",
        minHeight: "200px",
        cursor: "text",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      {chars}
    </pre>
  );
}
