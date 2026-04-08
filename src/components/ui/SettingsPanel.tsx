"use client";

import { Settings, BackspaceMode } from "@/types";

interface Props {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e1e1c" }}>
      <span style={{ fontSize: "12px", color: "#5a5a54" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: "32px", height: "18px",
        backgroundColor: checked ? "#c96a2a" : "#2a2a26",
        borderRadius: "9px",
        cursor: "pointer",
        position: "relative",
        transition: "background-color 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: checked ? "16px" : "2px",
          width: "14px", height: "14px",
          backgroundColor: "#e8d5b0",
          borderRadius: "50%",
          transition: "left 0.2s",
        }}
      />
    </div>
  );
}

export default function SettingsPanel({ settings, onUpdate, onClose }: Props) {
  const bsModes: BackspaceMode[] = ["free", "hard", "flow"];

  return (
    <div
      style={{
        position: "fixed",
        top: 0, right: 0,
        width: "300px",
        height: "100vh",
        backgroundColor: "#141412",
        borderLeft: "1px solid #2a2a26",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-4px 0 20px #00000088",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #2a2a26" }}>
        <span style={{ fontSize: "13px", color: "#e8d5b0", fontFamily: "monospace" }}>Settings</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#5a5a54", cursor: "pointer", fontSize: "16px" }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* Backspace mode */}
        <p style={{ fontSize: "9px", color: "#5a5a54", letterSpacing: "0.1em", margin: "16px 0 8px" }}>BACKSPACE MODE</p>
        <div style={{ display: "flex", gap: "8px" }}>
          {bsModes.map((mode) => (
            <button
              key={mode}
              onClick={() => onUpdate({ backspaceMode: mode })}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "4px",
                border: `1px solid ${settings.backspaceMode === mode ? "#c96a2a" : "#2a2a26"}`,
                backgroundColor: settings.backspaceMode === mode ? "#2a1e08" : "#1e1e1c",
                color: settings.backspaceMode === mode ? "#c96a2a" : "#5a5a54",
                fontSize: "11px",
                fontFamily: "monospace",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {mode}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "10px", color: "#3a3a36", margin: "4px 0 0" }}>
          {settings.backspaceMode === "free" && "Backspace always works"}
          {settings.backspaceMode === "hard" && "No backspace — errors lock in"}
          {settings.backspaceMode === "flow" && "Backspace deducts from WPM"}
        </p>

        {/* Font size */}
        <p style={{ fontSize: "9px", color: "#5a5a54", letterSpacing: "0.1em", margin: "16px 0 8px" }}>FONT SIZE</p>
        <Row label={`${settings.fontSize}px`}>
          <input
            type="range"
            min={12}
            max={18}
            value={settings.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            style={{ accentColor: "#c96a2a", width: "120px" }}
          />
        </Row>

        {/* Backspace allow toggle */}
        <p style={{ fontSize: "9px", color: "#5a5a54", letterSpacing: "0.1em", margin: "16px 0 8px" }}>BACKSPACE</p>
        <Row label="Allow backspace">
          <Toggle checked={settings.allowBackspace} onChange={() => onUpdate({ allowBackspace: !settings.allowBackspace })} />
        </Row>

        {/* Toggles */}
        <p style={{ fontSize: "9px", color: "#5a5a54", letterSpacing: "0.1em", margin: "16px 0 8px" }}>DISPLAY</p>
        <Row label="Sidebar">
          <Toggle checked={settings.showSidebar} onChange={() => onUpdate({ showSidebar: !settings.showSidebar })} />
        </Row>
        <Row label="Live WPM">
          <Toggle checked={settings.showLiveWpm} onChange={() => onUpdate({ showLiveWpm: !settings.showLiveWpm })} />
        </Row>
        <Row label="Keyboard">
          <Toggle checked={settings.showKeyboard} onChange={() => onUpdate({ showKeyboard: !settings.showKeyboard })} />
        </Row>
        <Row label="Finger guide">
          <Toggle checked={settings.showFingerGuide} onChange={() => onUpdate({ showFingerGuide: !settings.showFingerGuide })} />
        </Row>
        <Row label="Heatmap">
          <Toggle checked={settings.heatmapMode} onChange={() => onUpdate({ heatmapMode: !settings.heatmapMode })} />
        </Row>
        <Row label="Sound">
          <Toggle checked={settings.soundEnabled} onChange={() => onUpdate({ soundEnabled: !settings.soundEnabled })} />
        </Row>
      </div>
    </div>
  );
}
