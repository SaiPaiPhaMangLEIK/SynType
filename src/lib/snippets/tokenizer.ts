import { Language } from "@/types";

export type TokenType =
  | "keyword"
  | "function"
  | "string"
  | "number"
  | "operator"
  | "comment"
  | "plain"
  | "whitespace";

export interface Token {
  type: TokenType;
  value: string;
  start: number; // char index in full code string
  end: number;
}

// ── Language rules ───────────────────────────────────────────────

const PYTHON_KEYWORDS = new Set([
  "def","class","return","if","elif","else","for","while","in","not","and",
  "or","import","from","as","pass","break","continue","try","except","raise",
  "with","lambda","None","True","False","self","yield","del","global","nonlocal",
  "is","assert","finally","async","await",
]);

const JS_KEYWORDS = new Set([
  "const","let","var","function","return","if","else","for","while","in","of",
  "new","this","class","extends","import","export","default","from","async",
  "await","try","catch","throw","typeof","instanceof","null","undefined","true",
  "false","break","continue","switch","case","do","delete","void","yield",
]);

const GO_KEYWORDS = new Set([
  "func","return","if","else","for","range","in","var","const","type","struct",
  "interface","map","chan","go","defer","select","case","default","break",
  "continue","package","import","make","new","append","len","cap","nil",
  "true","false","string","int","bool","error","any",
]);

const KEYWORDS: Record<Language, Set<string>> = {
  python:     PYTHON_KEYWORDS,
  javascript: JS_KEYWORDS,
  go:         GO_KEYWORDS,
  typescript: new Set(["const","let","var","function","return","if","else","for","while","in","of","new","this","class","extends","import","export","default","from","async","await","try","catch","throw","typeof","instanceof","null","undefined","true","false","break","continue","switch","case","do","delete","void","yield","type","interface","enum","readonly","as","keyof","infer","never","unknown","any","string","number","boolean","object","symbol"]),
  rust:       new Set(["fn","let","mut","if","else","for","while","loop","return","struct","enum","impl","trait","use","mod","pub","self","super","crate","match","ref","move","async","await","type","where","const","static","unsafe","extern","dyn","Box","Option","Result","Some","None","Ok","Err","true","false"]),
};

// ── Tokeniser ────────────────────────────────────────────────────

export function tokenize(code: string, language: Language): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const keywords = KEYWORDS[language] || new Set<string>();

  while (i < code.length) {
    // Newline
    if (code[i] === "\n") {
      tokens.push({ type: "whitespace", value: "\n", start: i, end: i + 1 });
      i++;
      continue;
    }

    // Comment: Python/JS/Go single-line
    if (
      (language === "python" && code[i] === "#") ||
      ((language === "javascript" || language === "typescript" || language === "go" || language === "rust") && code[i] === "/" && code[i + 1] === "/")
    ) {
      const start = i;
      while (i < code.length && code[i] !== "\n") i++;
      tokens.push({ type: "comment", value: code.slice(start, i), start, end: i });
      continue;
    }

    // String: single or double quote (including template literals)
    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const quote = code[i];
      const start = i;
      i++;
      while (i < code.length) {
        if (code[i] === "\\" && i + 1 < code.length) { i += 2; continue; }
        if (code[i] === quote) { i++; break; }
        i++;
      }
      tokens.push({ type: "string", value: code.slice(start, i), start, end: i });
      continue;
    }

    // Number
    if (/[0-9]/.test(code[i]) || (code[i] === "-" && /[0-9]/.test(code[i + 1] || ""))) {
      const start = i;
      if (code[i] === "-") i++;
      while (i < code.length && /[0-9._xXa-fA-FbBoO]/.test(code[i])) i++;
      tokens.push({ type: "number", value: code.slice(start, i), start, end: i });
      continue;
    }

    // Word (keyword or identifier/function)
    if (/[a-zA-Z_]/.test(code[i])) {
      const start = i;
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) i++;
      const word = code.slice(start, i);
      // Peek ahead — if followed by '(', it's a function call
      const afterSpace = code.slice(i).match(/^\s*\(/);
      const type: TokenType = keywords.has(word)
        ? "keyword"
        : afterSpace
        ? "function"
        : "plain";
      tokens.push({ type, value: word, start, end: i });
      continue;
    }

    // Operator / punctuation
    if (/[+\-*/%=<>!&|^~?:.,;()[\]{}@]/.test(code[i])) {
      tokens.push({ type: "operator", value: code[i], start: i, end: i + 1 });
      i++;
      continue;
    }

    // Whitespace (spaces/tabs)
    if (/[ \t]/.test(code[i])) {
      const start = i;
      while (i < code.length && /[ \t]/.test(code[i])) i++;
      tokens.push({ type: "whitespace", value: code.slice(start, i), start, end: i });
      continue;
    }

    // Fallback
    tokens.push({ type: "plain", value: code[i], start: i, end: i + 1 });
    i++;
  }

  return tokens;
}

export const TOKEN_COLORS: Record<TokenType, string> = {
  keyword:    "#c98a4a",
  function:   "#8ab4d4",
  string:     "#8aa882",
  number:     "#b8a0d8",
  operator:   "#787870",
  comment:    "#4a4a46",
  plain:      "#e8d5b0",
  whitespace: "transparent",
};
