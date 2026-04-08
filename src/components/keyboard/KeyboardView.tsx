"use client";

import { KeyStates } from "@/types";

const ROWS: string[][] = [
  ["`","1","2","3","4","5","6","7","8","9","0","-","=","Backspace"],
  ["Tab","q","w","e","r","t","y","u","i","o","p","[","]","\\"],
  ["Caps","a","s","d","f","g","h","j","k","l",";","'","Enter"],
  ["Shift","z","x","c","v","b","n","m",",",".","/","Shift"],
  ["Space"],
];

const KEY_WIDTH: Record<string, string> = {
  "Backspace": "80px",
  "Tab":       "60px",
  "Caps":      "66px",
  "Enter":     "76px",
  "Shift":     "96px",
  "Space":     "300px",
};

function getKeyColor(key: string, states: KeyStates, nextChar: string | null, heatmap: boolean): {
  bg: string; border: string; text: string; animation?: string;
} {
  const k = key.toLowerCase();
  const mappedKey = k === "space" ? " " : k === "enter" ? "\n" : k === "tab" ? "\t" : k;
  const isNext = nextChar === mappedKey || (k === "space" && nextChar === " ")
    || (k === "enter" && nextChar === "\n") || (k === "tab" && nextChar === "\t");

  const state = states[k];

  if (isNext) {
    return { bg: "#2a1e08", border: "#c96a2a", text: "#e8d5b0", animation: "keyPulse 1.5s ease-in-out infinite" };
  }

  if (!state || (state.correct === 0 && state.errors === 0)) {
    return { bg: "#1e1e1c", border: "#2a2a26", text: "#5a5a54" };
  }

  if (heatmap) {
    const intensity = Math.min(state.correct / 10, 1);
    const r = Math.round(30 + intensity * 40);
    const g = Math.round(30 + intensity * 80);
    const b = Math.round(30);
    return { bg: `rgb(${r},${g},${b})`, border: "#3a3a36", text: "#e8d5b0" };
  }

  if (state.errors > 0 && state.correct === 0) {
    return { bg: "#2a0e0e", border: "#5a2a2a", text: "#9e5a5a" };
  }
  if (state.errors > 0) {
    return { bg: "#1a1a0e", border: "#3a3a26", text: "#c98a4a" };
  }
  return { bg: "#0e2a1a", border: "#1a4a2a", text: "#5a9e6a" };
}

interface KeyProps {
  label: string;
  states: KeyStates;
  nextChar: string | null;
  heatmap: boolean;
}

function Key({ label, states, nextChar, heatmap }: KeyProps) {
  const { bg, border, text, animation } = getKeyColor(label, states, nextChar, heatmap);
  const width = KEY_WIDTH[label] ?? "36px";
  const displayLabel = label === "Backspace" ? "⌫"
    : label === "Tab" ? "⇥"
    : label === "Caps" ? "⇪"
    : label === "Enter" ? "↵"
    : label === "Shift" ? "⇧"
    : label === "Space" ? ""
    : label;

  const state = states[label.toLowerCase()];

  return (
    <div
      style={{
        width,
        minWidth: width,
        height: "36px",
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        color: text,
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        animation,
        position: "relative",
        userSelect: "none",
        flexShrink: 0,
        transition: "background-color 0.15s, border-color 0.15s",
      }}
    >
      {displayLabel}
      {state?.errors > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "14px",
            height: "14px",
            backgroundColor: "#9e5a5a",
            borderRadius: "50%",
            fontSize: "8px",
            color: "#e8d5b0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          {state.errors > 9 ? "9+" : state.errors}
        </span>
      )}
    </div>
  );
}

interface Props {
  keyStates: KeyStates;
  nextChar: string | null;
  heatmap: boolean;
}

export default function KeyboardView({ keyStates, nextChar, heatmap }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-4">
      <style>{`
        @keyframes keyPulse {
          0%, 100% { background-color: #2a1e08; border-color: #c96a2a; }
          50% { background-color: #3a2e12; border-color: #e8841a; }
        }
      `}</style>
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map((key, ki) => (
            <Key key={`${ri}-${ki}`} label={key} states={keyStates} nextChar={nextChar} heatmap={heatmap} />
          ))}
        </div>
      ))}
    </div>
  );
}
