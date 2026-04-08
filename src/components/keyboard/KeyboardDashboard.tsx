"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { KeyStates } from "@/types";
import KeyboardView from "./KeyboardView";
import FingerGuide from "./FingerGuide";

// Width thresholds (px) below which each panel is force-hidden
const FINGER_HIDE_WIDTH = 680;
const KEYBOARD_HIDE_WIDTH = 500;

interface Props {
  keyStates: KeyStates;
  nextChar: string | null;
  showKeyboard: boolean;
  showFingerGuide: boolean;
  heatmapMode: boolean;
  isMinimized?: boolean;
  onToggleKeyboard: () => void;
  onToggleFingerGuide: () => void;
  onToggleHeatmap: () => void;
  onMinimize?: () => void;
  onResizeStart?: (e: ReactMouseEvent) => void;
}

function PillToggle({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Too narrow to display" : undefined}
      style={{
        padding: "3px 10px",
        borderRadius: "20px",
        border: `1px solid ${disabled ? "#222220" : active ? "#c96a2a" : "#2a2a26"}`,
        backgroundColor: disabled ? "#141412" : active ? "#2a1e08" : "#1e1e1c",
        color: disabled ? "#333330" : active ? "#c96a2a" : "#5a5a54",
        fontSize: "11px",
        fontFamily: "monospace",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

export default function KeyboardDashboard({
  keyStates,
  nextChar,
  showKeyboard,
  showFingerGuide,
  heatmapMode,
  isMinimized = false,
  onToggleKeyboard,
  onToggleFingerGuide,
  onToggleHeatmap,
  onMinimize,
  onResizeStart,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(Infinity);
  const [handleHovered, setHandleHovered] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  // Auto-hide panels when container is too narrow
  const fingerTooNarrow = containerWidth < FINGER_HIDE_WIDTH;
  const keyboardTooNarrow = containerWidth < KEYBOARD_HIDE_WIDTH;

  const effectiveShowKeyboard = showKeyboard && !keyboardTooNarrow;
  const effectiveShowFingerGuide = showFingerGuide && !fingerTooNarrow;

  const nothingVisible = !effectiveShowKeyboard && !effectiveShowFingerGuide;

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: "#141412", position: "relative" }}
    >
      {/* Drag handle — overlays the top border */}
      <div
        onMouseDown={onResizeStart}
        onMouseEnter={() => setHandleHovered(true)}
        onMouseLeave={() => setHandleHovered(false)}
        style={{
          position: "absolute",
          top: "-4px",
          left: 0,
          right: 0,
          height: "9px",
          cursor: "row-resize",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "3px",
            borderRadius: "2px",
            backgroundColor: handleHovered ? "#4a4a44" : "transparent",
            transition: "background-color 0.15s",
          }}
        />
      </div>

      {/* Top border */}
      <div style={{ borderTop: "1px solid #2a2a26" }} />

      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 16px",
          borderBottom: (nothingVisible || isMinimized) ? "none" : "1px solid #2a2a26",
        }}
      >
        <span style={{ fontSize: "10px", color: "#5a5a54", fontFamily: "monospace", marginRight: "4px" }}>
          DASHBOARD
        </span>
        <PillToggle
          label="keyboard"
          active={showKeyboard && !keyboardTooNarrow}
          disabled={keyboardTooNarrow}
          onClick={onToggleKeyboard}
        />
        <PillToggle
          label="fingers"
          active={showFingerGuide && !fingerTooNarrow}
          disabled={fingerTooNarrow}
          onClick={onToggleFingerGuide}
        />
        {effectiveShowKeyboard && !isMinimized && (
          <PillToggle label="heatmap" active={heatmapMode} onClick={onToggleHeatmap} />
        )}

        {/* Spacer + minimize button */}
        <div style={{ flex: 1 }} />
        {onMinimize && (
          <button
            onClick={onMinimize}
            title={isMinimized ? "Expand dashboard" : "Minimize dashboard"}
            style={{
              background: "none",
              border: "none",
              padding: "2px 4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4a4a44",
              transition: "color 0.15s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8a8a7e"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#4a4a44"; }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transform: isMinimized ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="2,4 6,8 10,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      {!nothingVisible && !isMinimized && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {effectiveShowKeyboard && (
            <KeyboardView keyStates={keyStates} nextChar={nextChar} heatmap={heatmapMode} />
          )}
          {effectiveShowFingerGuide && (
            <FingerGuide nextChar={nextChar} />
          )}
        </div>
      )}
    </div>
  );
}
