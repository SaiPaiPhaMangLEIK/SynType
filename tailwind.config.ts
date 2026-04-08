import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        // Backgrounds
        "bg-deep":    "#1a1a18",
        "bg-panel":   "#141412",
        "bg-editor":  "#1e1e1c",
        // Accent
        accent:       "#c96a2a",
        // Borders
        border:       "#2a2a26",
        // Text
        "text-primary": "#e8d5b0",
        "text-muted":   "#5a5a54",
        "text-ghost":   "#2e2e2a",
        // Status
        "syn-green":  "#5a9e6a",
        "syn-red":    "#9e5a5a",
        // Syntax tokens
        "tok-keyword":  "#c98a4a",
        "tok-function": "#8ab4d4",
        "tok-string":   "#8aa882",
        "tok-number":   "#b8a0d8",
        "tok-operator": "#787870",
        "tok-comment":  "#4a4a46",
      },
      animation: {
        "cursor-blink": "cursorBlink 1s step-end infinite",
        "key-pulse":    "keyPulse 1.5s ease-in-out infinite",
        "key-error":    "keyError 0.15s ease-out",
      },
      keyframes: {
        cursorBlink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        keyPulse: {
          "0%, 100%": { backgroundColor: "#2a1e08", borderColor: "#c96a2a" },
          "50%":      { backgroundColor: "#3a2e12", borderColor: "#e8841a" },
        },
        keyError: {
          "0%":   { backgroundColor: "#3a0e0e" },
          "100%": { backgroundColor: "#2a0e0e" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
