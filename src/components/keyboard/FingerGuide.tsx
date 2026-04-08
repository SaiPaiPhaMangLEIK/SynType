"use client";

import { getFingerForKey, FINGER_COLORS, FINGER_NAMES } from "@/lib/fingerMap";

const FINGER_LABELS = ["P", "R", "M", "I", "T"];

interface FingerProps {
  fingerIdx: number; // 0-4 (left) or 0-4 (right, mapped from 5-9)
  isActive: boolean;
}

function Finger({ fingerIdx, isActive }: FingerProps) {
  const color = FINGER_COLORS[fingerIdx];
  const label = FINGER_LABELS[fingerIdx];
  const opacity = isActive ? 1 : 0.3;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", opacity }}>
      {/* Fingertip */}
      <div
        style={{
          width: "22px",
          height: "28px",
          backgroundColor: color,
          borderRadius: "11px 11px 4px 4px",
          border: isActive ? `2px solid #c96a2a` : `1px solid ${color}88`,
          boxShadow: isActive ? `0 0 8px ${color}88` : "none",
          transition: "all 0.15s",
        }}
      />
      {/* Palm knuckle */}
      <div
        style={{
          width: "26px",
          height: "20px",
          backgroundColor: `${color}88`,
          borderRadius: "3px",
          border: `1px solid ${color}44`,
        }}
      />
      <span style={{ fontSize: "9px", color: isActive ? "#c96a2a" : "#5a5a54", fontFamily: "monospace" }}>
        {label}
      </span>
    </div>
  );
}

interface HandProps {
  side: "left" | "right";
  activeFingerGlobal: number | null; // 0-9 global finger index
}

function Hand({ side, activeFingerGlobal }: HandProps) {
  // For right hand display, fingers go pinky→thumb (right to left), so we reverse
  const displayFingers = side === "right" ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "10px", color: "#5a5a54", fontFamily: "monospace" }}>
        {side === "left" ? "LEFT" : "RIGHT"}
      </span>
      <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
        {displayFingers.map((fi) => {
          const globalFi = side === "left" ? fi : fi + 5;
          const isActive = activeFingerGlobal === globalFi;
          return (
            <Finger
              key={fi}
              fingerIdx={fi}
              isActive={isActive}
            />
          );
        })}
      </div>
      {/* Palm base */}
      <div
        style={{
          width: "160px",
          height: "14px",
          backgroundColor: "#2a2a26",
          borderRadius: "0 0 8px 8px",
          border: "1px solid #3a3a36",
        }}
      />
    </div>
  );
}

interface Props {
  nextChar: string | null;
}

export default function FingerGuide({ nextChar }: Props) {
  const activeGlobalFinger = nextChar !== null ? getFingerForKey(nextChar) : null;

  // Color legend
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Legend */}
      <div className="flex items-center gap-4">
        {FINGER_NAMES.map((name, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: FINGER_COLORS[i],
                borderRadius: "50%",
              }}
            />
            <span style={{ fontSize: "10px", color: "#5a5a54", fontFamily: "monospace" }}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Hands */}
      <div className="flex items-start gap-12">
        <Hand side="left" activeFingerGlobal={activeGlobalFinger} />
        <Hand side="right" activeFingerGlobal={activeGlobalFinger} />
      </div>
    </div>
  );
}
