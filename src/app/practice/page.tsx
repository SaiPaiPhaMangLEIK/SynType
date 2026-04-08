"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Language, Snippet } from "@/types";
import { SNIPPETS } from "@/lib/snippets/data";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { useKeyboardSound } from "@/hooks/useKeyboardSound";
import { createClient } from "@/lib/supabase/client";
import CodeDisplay, { DescriptionInfo } from "@/components/typing/CodeDisplay";
import LiveStats from "@/components/typing/LiveStats";
import SummaryScreen from "@/components/typing/SummaryScreen";
import KeyboardDashboard from "@/components/keyboard/KeyboardDashboard";
import Sidebar from "@/components/sidebar/Sidebar";
import SettingsPanel from "@/components/ui/SettingsPanel";
import GenerateSnippet from "@/components/ui/GenerateSnippet";
import CustomSnippet from "@/components/ui/CustomSnippet";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     "#5a9e6a",
  intermediate: "#c98a4a",
  advanced:     "#9e5a5a",
  custom:       "#5a7a9e",
};

const LANG_ICONS: Record<string, string> = {
  python:     "PY",
  javascript: "JS",
  go:         "GO",
  typescript: "TS",
  rust:       "RS",
  c:          "C",
  cpp:        "C++",
};

export default function PracticePage() {
  const { settings, updateSettings, loaded } = useSettings();
  const { user, loading: authLoading, signOut } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    try {
      const saved = localStorage.getItem("syntype_custom_snippets");
      if (saved) return [...SNIPPETS, ...JSON.parse(saved)];
    } catch {}
    return SNIPPETS;
  });
  // Track the single active language separately from settings.selectedLanguages
  const [activeLanguage, setActiveLanguage] = useState<Language>(
    (settings.selectedLanguages[0] as Language) ?? "python"
  );
  const [activeSnippetId, setActiveSnippetId] = useState<string>(() => {
    if (typeof window === "undefined") return SNIPPETS[0].id;
    const saved = localStorage.getItem("syntype_active_snippet");
    if (saved) {
      if (SNIPPETS.some((s) => s.id === saved)) return saved;
      try {
        const custom = JSON.parse(localStorage.getItem("syntype_custom_snippets") ?? "[]") as Snippet[];
        if (custom.some((s) => s.id === saved)) return saved;
      } catch {}
    }
    return SNIPPETS[0].id;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showCustomSnippet, setShowCustomSnippet] = useState(false);
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);
  const [descInfo, setDescInfo] = useState<DescriptionInfo | null>(null);

  const saveCustomSnippets = useCallback((all: Snippet[]) => {
    const custom = all.filter((s) => s.id.startsWith("custom-") || s.id.startsWith("generated-"));
    localStorage.setItem("syntype_custom_snippets", JSON.stringify(custom));
  }, []);

  const snippet = snippets.find((s) => s.id === activeSnippetId) ?? snippets[0];
  // If allowBackspace is false, override mode to "hard"
  const effectiveBackspaceMode = settings.allowBackspace ? settings.backspaceMode : "hard";
  const { state, handleKey, reset, nextChar } = useTypingEngine(snippet.code, effectiveBackspaceMode);

  const { playClick } = useKeyboardSound(settings.soundEnabled);

  const containerRef = useRef<HTMLDivElement>(null);
  const dashboardWrapRef = useRef<HTMLDivElement>(null);
  const [dashboardHeight, setDashboardHeight] = useState<number | null>(null);
  const [dashboardMinimized, setDashboardMinimized] = useState(false);
  const preMinimizeHeight = useRef<number | null>(null);

  const handleMinimize = useCallback(() => {
    if (!dashboardMinimized) {
      preMinimizeHeight.current = dashboardWrapRef.current?.getBoundingClientRect().height ?? null;
      setDashboardMinimized(true);
    } else {
      setDashboardMinimized(false);
      setDashboardHeight(preMinimizeHeight.current);
    }
  }, [dashboardMinimized]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = dashboardWrapRef.current?.getBoundingClientRect().height ?? 200;

    // Progressive auto-toggle only when BOTH panels are on at drag start
    const bothOn = settings.showKeyboard && settings.showFingerGuide;
    const fullHeight = bothOn ? startHeight : null; // hard ceiling when both on

    // Thresholds relative to full height (with hysteresis: hide-down < show-up)
    const fingerHideH  = fullHeight ? fullHeight * 0.72 : null;
    const fingerShowH  = fullHeight ? fullHeight * 0.82 : null;
    const keyboardHideH = fullHeight ? fullHeight * 0.28 : null;
    const keyboardShowH = fullHeight ? fullHeight * 0.38 : null;

    // Local mutable state to avoid stale closures across rapid moves
    let curFingers  = settings.showFingerGuide;
    let curKeyboard = settings.showKeyboard;

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      const delta = startY - ev.clientY; // up = positive = taller
      const maxH = fullHeight ?? 600;
      const newHeight = Math.max(36, Math.min(maxH, startHeight + delta));
      setDashboardHeight(newHeight);

      if (!bothOn || !fullHeight) return;

      // Dragging DOWN — hide finger guide first, then keyboard
      if (newHeight < fingerHideH! && curFingers) {
        curFingers = false;
        updateSettings({ showFingerGuide: false });
      }
      if (newHeight < keyboardHideH! && curKeyboard) {
        curKeyboard = false;
        updateSettings({ showKeyboard: false });
      }

      // Dragging UP — restore keyboard first, then finger guide
      if (newHeight > keyboardShowH! && !curKeyboard) {
        curKeyboard = true;
        updateSettings({ showKeyboard: true });
      }
      if (newHeight > fingerShowH! && !curFingers) {
        curFingers = true;
        updateSettings({ showFingerGuide: true });
      }
    };

    const onUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [settings.showKeyboard, settings.showFingerGuide, updateSettings]);

  // Persist active snippet to localStorage and sync sidebar language highlight
  useEffect(() => {
    localStorage.setItem("syntype_active_snippet", activeSnippetId);
    const s = snippets.find((x) => x.id === activeSnippetId);
    if (s) setActiveLanguage(s.language as Language);
  }, [activeSnippetId, snippets]);

  // Focus capture — intercept all key presses
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Intercept F5 / Ctrl+R / Cmd+R → soft reset (typing only, no page reload)
      const isRefresh = e.key === "F5" || ((e.ctrlKey || e.metaKey) && e.key === "r");
      if (isRefresh) {
        e.preventDefault();
        reset();
        return;
      }

      // Escape → also soft reset
      if (e.key === "Escape") {
        reset();
        return;
      }

      if (state.isComplete) return;
      if (showSettings || showGenerate || showCustomSnippet) return;

      // Prevent all navigation/scroll keys from hijacking the page while typing
      const scrollKeys = [" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", "Tab"];
      if (scrollKeys.includes(e.key)) e.preventDefault();

      // Steal focus away from any interactive element (sidebar buttons, etc.)
      // so the user's keypresses always go to the typing engine, not the UI
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== document.body && active.tagName !== "INPUT" && active.tagName !== "TEXTAREA") {
        active.blur();
      }

      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter" || e.key === "Tab") {
        const key = e.key === "Enter" ? "\n" : e.key;

        if (e.key === "Backspace") {
          playClick("backspace");
        } else if (state.isLocked || key !== nextChar) {
          playClick("error");
        } else if (key === " ") {
          playClick("space");
        } else {
          playClick("normal");
        }

        handleKey(key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.isComplete, state.isLocked, reset, showSettings, showGenerate, showCustomSnippet, handleKey, playClick, nextChar]);

  const handleSelectLanguage = useCallback((lang: Language) => {
    setActiveLanguage(lang);
    updateSettings({ selectedLanguages: [lang] });
    const first = snippets.find((s) => s.language === lang);
    if (first) setActiveSnippetId(first.id);
    reset();
  }, [snippets, updateSettings, reset]);

  const goToNext = useCallback(() => {
    const filtered = snippets.filter((s) => s.language === activeLanguage);
    const idx = filtered.findIndex((s) => s.id === activeSnippetId);
    const next = filtered[(idx + 1) % filtered.length];
    setActiveSnippetId(next.id);
    reset();
  }, [snippets, activeSnippetId, activeLanguage, reset]);

  const handleSelectSnippet = useCallback((id: string) => {
    setActiveSnippetId(id);
    reset();
  }, [reset]);

  const addGeneratedSnippet = useCallback((s: Snippet) => {
    setSnippets((prev) => {
      const next = [...prev, s];
      saveCustomSnippets(next);
      return next;
    });
    setActiveSnippetId(s.id);
    reset();
    setShowGenerate(false);
  }, [reset, saveCustomSnippets]);

  const handleEditSnippet = useCallback((id: string) => {
    setEditingSnippetId(id);
    setShowCustomSnippet(true);
  }, []);

  const handleDeleteSnippet = useCallback((id: string) => {
    setSnippets((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveCustomSnippets(next);
      return next;
    });
    if (activeSnippetId === id) {
      const fallback = snippets.find((s) => s.id !== id && !s.id.startsWith("custom-")) ?? snippets[0];
      setActiveSnippetId(fallback.id);
      reset();
    }
  }, [activeSnippetId, snippets, reset]);

  const handleSaveCustomSnippet = useCallback((s: Snippet) => {
    if (editingSnippetId) {
      setSnippets((prev) => {
        const next = prev.map((x) => x.id === s.id ? s : x);
        saveCustomSnippets(next);
        return next;
      });
      setEditingSnippetId(null);
    } else {
      setSnippets((prev) => {
        const next = [...prev, s];
        saveCustomSnippets(next);
        return next;
      });
      setActiveSnippetId(s.id);
      reset();
    }
    setShowCustomSnippet(false);
  }, [editingSnippetId, reset, saveCustomSnippets]);

  // Save completed session to Supabase
  const saveSession = useCallback(async (wpm: number, accuracy: number, errors: number, durationMs: number) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("sessions").insert({
      user_id: user.id,
      snippet_id: snippet.id,
      language: snippet.language,
      wpm,
      accuracy,
      errors,
      duration_ms: durationMs,
    });
    // Upsert leaderboard if this is a personal best
    const { data: existing } = await supabase
      .from("leaderboard")
      .select("best_wpm")
      .eq("user_id", user.id)
      .eq("language", snippet.language)
      .single();
    if (!existing || wpm > existing.best_wpm) {
      await supabase.from("leaderboard").upsert({
        user_id: user.id,
        language: snippet.language,
        best_wpm: wpm,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,language" });
    }
  }, [user, snippet]);

  // Trigger session save when typing completes
  const savedRef = useRef(false);
  useEffect(() => {
    if (state.isComplete && !savedRef.current && state.startTime && state.endTime) {
      savedRef.current = true;
      saveSession(state.wpm, state.accuracy, state.errors, state.endTime - state.startTime);
    }
    if (!state.isComplete) savedRef.current = false;
  }, [state.isComplete, state.wpm, state.accuracy, state.errors, state.startTime, state.endTime, saveSession]);

  if (!loaded) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#1a1a18",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        overflow: "hidden",
      }}
    >
      {/* ── Titlebar ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "38px",
          backgroundColor: "#141412",
          borderBottom: "1px solid #2a2a26",
          padding: "0 16px",
          flexShrink: 0,
        }}
      >
        {/* macOS dots + sidebar toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {["#c0392b", "#e67e22", "#27ae60"].map((c, i) => (
              <div key={i} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: c }} />
            ))}
          </div>
          {/* Sidebar toggle icon */}
          <button
            onClick={() => updateSettings({ showSidebar: !settings.showSidebar })}
            title="Toggle sidebar"
            style={{
              background: "none",
              border: "none",
              padding: "2px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              opacity: settings.showSidebar ? 1 : 0.4,
            }}
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="17" height="13" rx="2" stroke="#5a5a54" strokeWidth="1"/>
              <line x1="6" y1="1" x2="6" y2="13" stroke="#5a5a54" strokeWidth="1"/>
              <rect x="1" y="1" width="5" height="12" rx="1.5" fill={settings.showSidebar ? "#5a5a54" : "none"}/>
            </svg>
          </button>
        </div>

        {/* App name */}
        <div style={{ flex: 1, textAlign: "center", fontSize: "12px", color: "#5a5a54" }}>
          <span style={{ color: "#c96a2a", fontWeight: "600" }}>Syn</span>
          <span>Type</span>
          <span style={{ margin: "0 8px", color: "#2e2e2a" }}>—</span>
          <span style={{ color: "#3a3a36" }}>{snippet.topic}</span>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Backspace toggle */}
          <button
            onClick={() => updateSettings({ allowBackspace: !settings.allowBackspace })}
            title={settings.allowBackspace ? "Backspace on — click to disable" : "Backspace off — click to enable"}
            style={{
              fontSize: "10px", fontFamily: "monospace",
              backgroundColor: settings.allowBackspace ? "#1e1e1c" : "#2a0e0e",
              border: `1px solid ${settings.allowBackspace ? "#2a2a26" : "#5a2a2a"}`,
              color: settings.allowBackspace ? "#5a5a54" : "#9e5a5a",
              padding: "3px 8px", borderRadius: "3px", cursor: "pointer",
            }}
          >
            ⌫ {settings.allowBackspace ? "on" : "off"}
          </button>
          {/* Difficulty badge */}
          <span
            style={{
              fontSize: "10px",
              color: DIFFICULTY_COLORS[snippet.difficulty],
              border: `1px solid ${DIFFICULTY_COLORS[snippet.difficulty]}44`,
              padding: "2px 8px",
              borderRadius: "3px",
            }}
          >
            {snippet.difficulty}
          </span>
          {/* Language badge */}
          <span
            style={{
              fontSize: "10px",
              color: "#c96a2a",
              border: "1px solid #c96a2a44",
              padding: "2px 8px",
              borderRadius: "3px",
            }}
          >
            {LANG_ICONS[snippet.language] ?? snippet.language.toUpperCase()}
          </span>
          {/* Generate button */}
          <button
            onClick={() => setShowGenerate(true)}
            style={{
              fontSize: "11px", fontFamily: "monospace",
              backgroundColor: "#1e1e1c", border: "1px solid #2a2a26",
              color: "#5a5a54", padding: "3px 10px", borderRadius: "3px", cursor: "pointer",
            }}
          >
            + Generate
          </button>
          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              fontSize: "11px", fontFamily: "monospace",
              backgroundColor: "#1e1e1c", border: "1px solid #2a2a26",
              color: "#5a5a54", padding: "3px 10px", borderRadius: "3px", cursor: "pointer",
            }}
          >
            ⚙
          </button>
          {/* Auth */}
          {!authLoading && (
            user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", borderLeft: "1px solid #2a2a26", paddingLeft: "8px" }}>
                <span style={{ fontSize: "11px", color: "#5a9e6a" }}>
                  {user.user_metadata?.user_name ?? user.email?.split("@")[0] ?? "user"}
                </span>
                <button
                  onClick={signOut}
                  title="Sign out"
                  style={{
                    fontSize: "10px", fontFamily: "monospace",
                    background: "none", border: "1px solid #2a2a26",
                    color: "#5a5a54", padding: "2px 7px", borderRadius: "3px", cursor: "pointer",
                  }}
                >
                  ↩
                </button>
              </div>
            ) : (
              <a
                href="/auth/login"
                style={{
                  fontSize: "11px", fontFamily: "monospace",
                  backgroundColor: "#2a1e08", border: "1px solid #c96a2a",
                  color: "#c96a2a", padding: "3px 10px", borderRadius: "3px",
                  textDecoration: "none", borderLeft: "1px solid #2a2a26", marginLeft: "2px",
                }}
              >
                Sign in
              </a>
            )
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        {settings.showSidebar && (
          <Sidebar
            snippets={snippets}
            activeLanguage={activeLanguage}
            activeSnippetId={activeSnippetId}
            onSelectSnippet={handleSelectSnippet}
            onSelectLanguage={handleSelectLanguage}
            onOpenGenerate={() => setShowGenerate(true)}
            onOpenCustomSnippet={() => { setEditingSnippetId(null); setShowCustomSnippet(true); }}
            onEditSnippet={handleEditSnippet}
            onDeleteSnippet={handleDeleteSnippet}
          />
        )}

        {/* Main editor area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {state.isComplete ? (
            <SummaryScreen
              snippet={snippet}
              wpm={state.wpm}
              accuracy={state.accuracy}
              errors={state.errors}
              startTime={state.startTime!}
              endTime={state.endTime!}
              errorMap={state.errorMap}
              onNext={goToNext}
              onRetry={reset}
            />
          ) : (
            <>
              {/* Live stats bar */}
              <LiveStats
                wpm={state.wpm}
                accuracy={state.accuracy}
                errors={state.errors}
                startTime={state.startTime}
                endTime={state.endTime}
                showWpm={settings.showLiveWpm}
              />

              {/* Code area */}
              <div
                ref={containerRef}
                style={{ flex: 1, overflowY: "auto", cursor: "text" }}
              >
                <CodeDisplay
                  code={snippet.code}
                  language={snippet.language as Language}
                  position={state.position}
                  errorMap={state.errorMap}
                  isLocked={state.isLocked}
                  fontSize={settings.fontSize}
                  onDescriptionChange={setDescInfo}
                />
              </div>

              {/* ── Description bar — always above the dashboard ── */}
              <div style={{
                flexShrink: 0,
                height: "28px",
                backgroundColor: "#141412",
                borderTop: "1px solid #2a2a26",
                borderBottom: "1px solid #2a2a26",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                gap: "10px",
                overflow: "hidden",
              }}>
                {descInfo ? (
                  descInfo.mode === "word" ? (
                    <>
                      <span style={{
                        fontSize: "9px", color: descInfo.color,
                        border: `1px solid ${descInfo.color}55`,
                        padding: "1px 5px", borderRadius: "3px",
                        fontFamily: "monospace", flexShrink: 0,
                      }}>
                        {descInfo.label}
                      </span>
                      <code style={{ fontSize: "11px", color: descInfo.color, fontFamily: "var(--font-jetbrains-mono, monospace)", flexShrink: 0 }}>
                        {descInfo.value}
                      </code>
                      <span style={{ color: "#2a2a26", fontSize: "10px", flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: "11px", color: "#8a7a60", fontFamily: "var(--font-jetbrains-mono, monospace)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {descInfo.text}
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "10px", color: "#3a3a36", fontFamily: "monospace", flexShrink: 0 }}>
                        line {descInfo.lineNum}
                      </span>
                      <span style={{ color: "#2a2a26", fontSize: "10px", flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: "11px", color: "#8a7a60", fontFamily: "var(--font-jetbrains-mono, monospace)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {descInfo.text}
                      </span>
                    </>
                  )
                ) : (
                  <span style={{ fontSize: "10px", color: "#2a2a26", fontFamily: "monospace" }}>
                    hover a line · click a keyword to learn more
                  </span>
                )}
              </div>

              {/* Keyboard dashboard — always rendered so drag stays live */}
              <div
                ref={dashboardWrapRef}
                style={{
                  flexShrink: 0,
                  height: dashboardMinimized ? "auto" : (dashboardHeight ?? "auto"),
                  overflow: "hidden",
                }}
              >
                <KeyboardDashboard
                  keyStates={state.keyStates}
                  nextChar={nextChar}
                  showKeyboard={settings.showKeyboard}
                  showFingerGuide={settings.showFingerGuide}
                  heatmapMode={settings.heatmapMode}
                  isMinimized={dashboardMinimized}
                  onToggleKeyboard={() => { updateSettings({ showKeyboard: !settings.showKeyboard }); setDashboardHeight(null); preMinimizeHeight.current = null; }}
                  onToggleFingerGuide={() => { updateSettings({ showFingerGuide: !settings.showFingerGuide }); setDashboardHeight(null); preMinimizeHeight.current = null; }}
                  onToggleHeatmap={() => updateSettings({ heatmapMode: !settings.heatmapMode })}
                  onMinimize={handleMinimize}
                  onResizeStart={dashboardMinimized ? undefined : handleResizeStart}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Prompt bar ───────────────────────────────────────────── */}
      <div
        style={{
          height: "28px",
          backgroundColor: "#141412",
          borderTop: "1px solid #2a2a26",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#5a9e6a", fontSize: "11px" }}>$</span>
        <span style={{ color: "#5a5a54", fontSize: "11px" }}>
          syntype · {snippet.language} · {state.isComplete ? "complete" : state.startTime ? "typing" : "ready"}
        </span>
        {state.isLocked && (
          <span style={{ color: "#9e5a5a", fontSize: "11px" }}>
            ✗ error — press correct key
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ color: "#2e2e2a", fontSize: "11px" }}>esc / ctrl+r to reset</span>
        <span style={{ color: "#3a3a36", fontSize: "11px" }}>
          {state.position}/{snippet.code.length} chars
        </span>
      </div>

      {/* Overlays */}
      {showSettings && (
        <SettingsPanel settings={settings} onUpdate={updateSettings} onClose={() => setShowSettings(false)} />
      )}
      {showGenerate && (
        <GenerateSnippet onAdd={addGeneratedSnippet} onClose={() => setShowGenerate(false)} />
      )}
      {showCustomSnippet && (
        <CustomSnippet
          defaultLanguage={activeLanguage}
          editSnippet={editingSnippetId ? snippets.find((s) => s.id === editingSnippetId) : undefined}
          onAdd={handleSaveCustomSnippet}
          onClose={() => { setShowCustomSnippet(false); setEditingSnippetId(null); }}
        />
      )}
    </div>
  );
}
