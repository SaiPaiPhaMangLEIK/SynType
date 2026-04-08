export type Language = "python" | "javascript" | "go" | "typescript" | "rust" | "c" | "cpp" | "json" | "html" | "css" | "tailwind" | "java";
export type Difficulty = "beginner" | "intermediate" | "advanced" | "custom";
export type BackspaceMode = "free" | "hard" | "flow";

export interface Snippet {
  id: string;
  language: Language;
  topic: string;
  difficulty: Difficulty;
  code: string;
  explanation: string;
}

export interface TypingSession {
  snippetId: string;
  startTime: number;
  endTime?: number;
  wpm: number;
  accuracy: number;
  errors: number;
  errorMap: Record<number, number>; // charIndex -> errorCount
}

export interface Settings {
  backspaceMode: BackspaceMode;
  allowBackspace: boolean;     // quick toggle; false = same as "hard"
  showLiveWpm: boolean;
  fontSize: number;
  showKeyboard: boolean;
  showFingerGuide: boolean;
  showSidebar: boolean;
  heatmapMode: boolean;
  soundEnabled: boolean;
  selectedLanguages: Language[];
}

export const DEFAULT_SETTINGS: Settings = {
  backspaceMode: "free",
  allowBackspace: true,
  showLiveWpm: true,
  fontSize: 14,
  showKeyboard: true,
  showFingerGuide: true,
  showSidebar: true,
  heatmapMode: false,
  soundEnabled: false,
  selectedLanguages: ["python", "javascript", "go"],
};

export interface KeyState {
  correct: number;   // times typed correctly
  errors: number;    // times errored
  isNext: boolean;   // is the next key to press
}

export type KeyStates = Record<string, KeyState>;
