"use client";

import { useRef, useCallback } from "react";

type SoundType = "normal" | "space" | "error" | "backspace";

export function useKeyboardSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playClick = useCallback(
    (type: SoundType = "normal") => {
      if (!enabled) return;

      try {
        const ctx = getCtx();
        const now = ctx.currentTime;

        // ── Noise burst (the "click" / snap of the switch) ──────────
        const clickDuration = type === "space" ? 0.06 : 0.04;
        const clickSamples = Math.floor(ctx.sampleRate * clickDuration);
        const clickBuf = ctx.createBuffer(1, clickSamples, ctx.sampleRate);
        const clickData = clickBuf.getChannelData(0);

        for (let i = 0; i < clickSamples; i++) {
          // Exponential decay envelope on white noise
          const decay = Math.pow(1 - i / clickSamples, 6);
          clickData[i] = (Math.random() * 2 - 1) * decay;
        }

        const clickSrc = ctx.createBufferSource();
        clickSrc.buffer = clickBuf;

        const clickFilter = ctx.createBiquadFilter();
        clickFilter.type = "bandpass";

        // Frequency shaping per sound type
        if (type === "error") {
          clickFilter.frequency.value = 600;
          clickFilter.Q.value = 0.4;
        } else if (type === "space") {
          clickFilter.frequency.value = 400;
          clickFilter.Q.value = 0.6;
        } else if (type === "backspace") {
          clickFilter.frequency.value = 700;
          clickFilter.Q.value = 0.5;
        } else {
          clickFilter.frequency.value = 2000;
          clickFilter.Q.value = 0.4;
        }

        const clickGain = ctx.createGain();
        const clickVol = type === "error" ? 0.25 : type === "space" ? 0.22 : 0.18;
        clickGain.gain.setValueAtTime(clickVol, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + clickDuration);

        clickSrc.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickSrc.start(now);
        clickSrc.stop(now + clickDuration + 0.01);

        // ── Thud (bottom-out resonance) ──────────────────────────────
        // Only for normal/space keys — errors skip the satisfying thud
        if (type !== "error") {
          const thudDuration = type === "space" ? 0.09 : 0.07;
          const thudSamples = Math.floor(ctx.sampleRate * thudDuration);
          const thudBuf = ctx.createBuffer(1, thudSamples, ctx.sampleRate);
          const thudData = thudBuf.getChannelData(0);

          for (let i = 0; i < thudSamples; i++) {
            const decay = Math.pow(1 - i / thudSamples, 4);
            thudData[i] = (Math.random() * 2 - 1) * decay;
          }

          const thudSrc = ctx.createBufferSource();
          thudSrc.buffer = thudBuf;

          const thudFilter = ctx.createBiquadFilter();
          thudFilter.type = "lowpass";
          thudFilter.frequency.value = type === "space" ? 180 : 220;
          thudFilter.Q.value = 2.5;

          const thudGain = ctx.createGain();
          const thudVol = type === "space" ? 0.28 : type === "backspace" ? 0.12 : 0.16;
          thudGain.gain.setValueAtTime(thudVol, now + 0.005);
          thudGain.gain.exponentialRampToValueAtTime(0.001, now + thudDuration);

          thudSrc.connect(thudFilter);
          thudFilter.connect(thudGain);
          thudGain.connect(ctx.destination);
          thudSrc.start(now + 0.005);
          thudSrc.stop(now + thudDuration + 0.01);
        }
      } catch {
        // AudioContext unavailable (SSR, permissions denied, etc.)
      }
    },
    [enabled, getCtx]
  );

  return { playClick };
}
