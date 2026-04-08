"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BackspaceMode, KeyStates } from "@/types";

export interface TypingState {
  typed: string;
  position: number;
  errors: number;
  errorMap: Record<number, number>;
  isLocked: boolean;
  isComplete: boolean;
  startTime: number | null;
  endTime: number | null;
  wpm: number;
  accuracy: number;
  keyStates: KeyStates;
  flowPenalty: number;
}

const initialState = (): TypingState => ({
  typed: "",
  position: 0,
  errors: 0,
  errorMap: {},
  isLocked: false,
  isComplete: false,
  startTime: null,
  endTime: null,
  wpm: 0,
  accuracy: 100,
  keyStates: {},
  flowPenalty: 0,
});

function calcWpm(chars: number, startMs: number, nowMs: number, penalty = 0): number {
  const minutes = (nowMs - startMs) / 60000;
  if (minutes < 0.001) return 0;
  return Math.max(0, Math.round(chars / 5 / minutes - penalty));
}

// Returns index past the leading-space indentation on the current line, or null.
function getIndentEnd(code: string, pos: number): number | null {
  if (code[pos] !== " ") return null;
  let lineStart = pos;
  while (lineStart > 0 && code[lineStart - 1] !== "\n") lineStart--;
  for (let i = lineStart; i < pos; i++) {
    if (code[i] !== " ") return null;
  }
  let end = pos;
  while (end < code.length && code[end] === " ") end++;
  return end;
}

export function useTypingEngine(code: string, backspaceMode: BackspaceMode) {
  const [state, setState] = useState<TypingState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Always-current refs — handleKey reads from these so it never goes stale
  const codeRef = useRef(code);
  const backspaceModeRef = useRef(backspaceMode);
  codeRef.current = code;
  backspaceModeRef.current = backspaceMode;

  // Auto-reset whenever the snippet (code) changes
  const prevCodeRef = useRef(code);
  useEffect(() => {
    if (prevCodeRef.current !== code) {
      prevCodeRef.current = code;
      setState(initialState());
    }
  }, [code]);

  // Live WPM ticker
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.startTime && !state.isComplete) {
      intervalRef.current = setInterval(() => {
        const s = stateRef.current;
        if (!s.startTime) return;
        const wpm = calcWpm(s.position, s.startTime, Date.now(), s.flowPenalty);
        const accuracy = s.position > 0
          ? Math.round(((s.position - s.errors) / s.position) * 100)
          : 100;
        setState((prev) => ({ ...prev, wpm, accuracy }));
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.startTime, state.isComplete]);

  // Stable handleKey — reads code/backspaceMode from refs, no recreations on snippet change
  const handleKey = useCallback((key: string) => {
    setState((prev) => {
      if (prev.isComplete) return prev;

      const code = codeRef.current;
      const backspaceMode = backspaceModeRef.current;
      const target = code[prev.position];
      const now = Date.now();
      const startTime = prev.startTime ?? now;

      // ── Backspace ────────────────────────────────────────────────
      if (key === "Backspace") {
        if (backspaceMode === "hard") return prev;
        if (prev.position === 0) return prev;
        const flowPenalty = backspaceMode === "flow" ? prev.flowPenalty + 2 : prev.flowPenalty;
        return {
          ...prev,
          position: prev.position - 1,
          typed: prev.typed.slice(0, -1),
          isLocked: false,
          flowPenalty,
        };
      }

      // ── Tab key ──────────────────────────────────────────────────
      if (key === "Tab") {
        if (target === "\t") {
          // fall through to normal match below
        } else {
          const indentEnd = getIndentEnd(code, prev.position);
          if (indentEnd !== null && indentEnd > prev.position) {
            const spacesCount = indentEnd - prev.position;
            const newPos = indentEnd;
            const isComplete = newPos >= code.length;
            return {
              ...prev,
              typed: prev.typed + " ".repeat(spacesCount),
              position: newPos,
              startTime,
              endTime: isComplete ? now : null,
              isLocked: false,
              isComplete,
              wpm: calcWpm(newPos, startTime, now, prev.flowPenalty),
              accuracy: Math.round(((newPos - prev.errors) / newPos) * 100),
            };
          }
          // Tab not at indentation → error
          const errMap = { ...prev.errorMap };
          errMap[prev.position] = (errMap[prev.position] || 0) + 1;
          return { ...prev, startTime, isLocked: true, errors: prev.errors + 1, errorMap: errMap };
        }
      }

      const effectiveKey = key === "Tab" ? "\t" : key;

      // ── Wrong key ────────────────────────────────────────────────
      if (effectiveKey !== target) {
        const errMap = { ...prev.errorMap };
        errMap[prev.position] = (errMap[prev.position] || 0) + 1;
        const keyStates = { ...prev.keyStates };
        const k = effectiveKey.toLowerCase();
        keyStates[k] = { correct: keyStates[k]?.correct ?? 0, errors: (keyStates[k]?.errors ?? 0) + 1, isNext: false };
        return { ...prev, startTime, isLocked: true, errors: prev.errors + 1, errorMap: errMap, keyStates };
      }

      // ── Correct key ──────────────────────────────────────────────
      let newPos = prev.position + 1;
      let newTyped = prev.typed + effectiveKey;

      const keyStates = { ...prev.keyStates };
      const k = effectiveKey === "\n" ? "enter" : effectiveKey === "\t" ? "tab" : effectiveKey === " " ? "space" : effectiveKey.toLowerCase();
      keyStates[k] = { correct: (keyStates[k]?.correct ?? 0) + 1, errors: keyStates[k]?.errors ?? 0, isNext: false };

      // Auto-skip indentation after Enter
      if (effectiveKey === "\n") {
        let indentEnd = newPos;
        while (indentEnd < code.length && code[indentEnd] === " ") indentEnd++;
        if (indentEnd > newPos) {
          newTyped += " ".repeat(indentEnd - newPos);
          newPos = indentEnd;
        }
      }

      const isComplete = newPos >= code.length;
      return {
        ...prev,
        typed: newTyped,
        position: newPos,
        startTime,
        endTime: isComplete ? now : null,
        isLocked: false,
        isComplete,
        wpm: calcWpm(newPos, startTime, now, prev.flowPenalty),
        accuracy: Math.round(((newPos - prev.errors) / newPos) * 100),
        keyStates,
      };
    });
  }, []); // stable — reads code/backspaceMode from refs

  const reset = useCallback(() => setState(initialState()), []);

  const nextChar = !state.isComplete ? code[state.position] : null;

  return { state, handleKey, reset, nextChar };
}
