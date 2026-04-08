"use client";

import { Snippet } from "@/types";
import { useMemo } from "react";

interface Props {
  snippet: Snippet;
  wpm: number;
  accuracy: number;
  errors: number;
  startTime: number;
  endTime: number;
  errorMap: Record<number, number>;
  onNext: () => void;
  onRetry: () => void;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div
      style={{
        backgroundColor: "#1e1e1c",
        border: "1px solid #2a2a26",
        borderRadius: "6px",
        padding: "16px 20px",
        minWidth: "110px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <span style={{ fontSize: "28px", fontWeight: "700", color, fontFamily: "monospace", lineHeight: 1 }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: "10px", color: "#5a5a54" }}>{sub}</span>}
      <span style={{ fontSize: "11px", color: "#5a5a54" }}>{label}</span>
    </div>
  );
}

function ActionButton({
  label, onClick, primary,
}: { label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 20px",
        borderRadius: "4px",
        border: primary ? "1px solid #c96a2a" : "1px solid #2a2a26",
        backgroundColor: primary ? "#2a1e08" : "#1e1e1c",
        color: primary ? "#c96a2a" : "#5a5a54",
        fontSize: "13px",
        fontFamily: "monospace",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.backgroundColor = primary ? "#3a2e12" : "#2a2a26";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.backgroundColor = primary ? "#2a1e08" : "#1e1e1c";
      }}
    >
      {label}
    </button>
  );
}

export default function SummaryScreen({
  snippet, wpm, accuracy, errors, startTime, endTime, errorMap, onNext, onRetry,
}: Props) {
  const totalSecs = Math.round((endTime - startTime) / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const wpmColor = wpm >= 60 ? "#5a9e6a" : wpm >= 30 ? "#c98a4a" : "#9e5a5a";
  const accColor = accuracy >= 95 ? "#5a9e6a" : accuracy >= 80 ? "#c98a4a" : "#9e5a5a";
  const errColor = errors === 0 ? "#5a9e6a" : errors < 5 ? "#c98a4a" : "#9e5a5a";

  // Build annotated code lines for error overlay
  const annotatedCode = useMemo(() => {
    return snippet.code.split("").map((ch, idx) => ({
      ch,
      hasError: (errorMap[idx] ?? 0) > 0,
      errorCount: errorMap[idx] ?? 0,
    }));
  }, [snippet.code, errorMap]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        backgroundColor: "#1a1a18",
      }}
    >
      {/* Title */}
      <div>
        <h2 style={{ margin: 0, fontSize: "18px", color: "#e8d5b0", fontFamily: "monospace" }}>
          Session Complete
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#5a5a54" }}>
          {snippet.topic} · {snippet.language} · {snippet.difficulty}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <StatCard label="WPM" value={wpm.toString()} color={wpmColor} />
        <StatCard label="ACCURACY" value={`${accuracy}%`} color={accColor} />
        <StatCard label="ERRORS" value={errors.toString()} color={errColor} />
        <StatCard label="TIME" value={timeStr} color="#5a5a54" />
      </div>

      {/* Error heatmap */}
      {errors > 0 && (
        <div>
          <p style={{ fontSize: "11px", color: "#5a5a54", marginBottom: "8px" }}>ERROR HEATMAP</p>
          <pre
            style={{
              backgroundColor: "#1e1e1c",
              border: "1px solid #2a2a26",
              borderRadius: "6px",
              padding: "16px",
              fontSize: "13px",
              lineHeight: "1.8",
              fontFamily: "monospace",
              overflowX: "auto",
              margin: 0,
            }}
          >
            {annotatedCode.map(({ ch, hasError }, idx) => (
              <span
                key={idx}
                style={{
                  color: hasError ? "#9e5a5a" : "#2e2e2a",
                  borderBottom: hasError ? "2px solid #9e5a5a" : "none",
                  backgroundColor: hasError ? "#2a0e0e44" : "transparent",
                }}
              >
                {ch}
              </span>
            ))}
          </pre>
        </div>
      )}

      {/* Explanation */}
      <div
        style={{
          backgroundColor: "#0e1e0e",
          border: "1px solid #1a3a1a",
          borderRadius: "6px",
          padding: "16px 20px",
        }}
      >
        <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#5a9e6a", letterSpacing: "0.05em" }}>
          WHAT THIS CODE DOES
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#8aa882", lineHeight: "1.7" }}>
          {snippet.explanation}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        <ActionButton label="→ Next snippet" onClick={onNext} primary />
        <ActionButton label="↺ Retry" onClick={onRetry} />
      </div>
    </div>
  );
}
