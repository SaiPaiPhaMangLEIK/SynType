"use client";

import { useState, useEffect } from "react";

interface Props {
  wpm: number;
  accuracy: number;
  errors: number;
  startTime: number | null;
  endTime: number | null;
  showWpm: boolean;
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-muted text-xs">{label}</span>
      <span style={{ color }} className="text-xs font-medium tabular-nums">{value}</span>
    </div>
  );
}

function ElapsedTimer({ startTime, endTime }: { startTime: number | null; endTime: number | null }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startTime || endTime) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [startTime, endTime]);

  if (!startTime) return <Stat label="TIME" value="0:00" color="#5a5a54" />;
  const totalMs = (endTime ?? now) - startTime;
  const secs = Math.floor(totalMs / 1000);
  const mins = Math.floor(secs / 60);
  const s = (secs % 60).toString().padStart(2, "0");
  return <Stat label="TIME" value={`${mins}:${s}`} color="#5a5a54" />;
}

export default function LiveStats({ wpm, accuracy, errors, startTime, endTime, showWpm }: Props) {
  const accColor = accuracy >= 95 ? "#5a9e6a" : accuracy >= 80 ? "#c98a4a" : "#9e5a5a";
  const errColor = errors === 0 ? "#5a9e6a" : "#9e5a5a";

  return (
    <div className="flex items-center gap-6 px-4 py-2 border-b border-border bg-bg-panel">
      {showWpm && <Stat label="WPM" value={wpm.toString()} color="#c96a2a" />}
      <Stat label="ACC" value={`${accuracy}%`} color={accColor} />
      <Stat label="ERR" value={errors.toString()} color={errColor} />
      <ElapsedTimer startTime={startTime} endTime={endTime} />
    </div>
  );
}
