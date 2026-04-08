import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a code snippet generator for a typing practice app.
Return ONLY valid JSON in this exact shape — no markdown, no explanation:
{
  "language": "python" | "javascript" | "go" | "typescript" | "rust" | "c" | "cpp" | "json" | "html" | "css" | "tailwind" | "java",
  "topic": "<short topic name>",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "code": "<the code snippet, 10-30 lines, real working code>",
  "explanation": "<2-3 sentence plain-English explanation of what the code does>"
}
Rules:
- code must be real, idiomatic code or markup
- for html: return a realistic HTML structure or component (no imports needed)
- for css: return real CSS rules with selectors and properties
- for tailwind: return an HTML snippet using Tailwind CSS utility classes
- for json: return a realistic JSON data structure (config, API response, schema, etc.)
- for other languages: no imports unless absolutely necessary
- max 30 lines
- explanation must be plain English, no markdown`;

async function generate(language: string, topic: string, difficulty: string) {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a ${difficulty} ${language} snippet about: ${topic || "any interesting algorithm or pattern"}`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  return JSON.parse(text.trim());
}

export async function POST(req: NextRequest) {
  try {
    const { language = "python", topic = "", difficulty = "intermediate" } = await req.json();

    let snippet;
    try {
      snippet = await generate(language, topic, difficulty);
    } catch {
      // Retry once on parse failure
      snippet = await generate(language, topic, difficulty);
    }

    // Validate required fields
    const required = ["language", "topic", "difficulty", "code", "explanation"];
    for (const field of required) {
      if (!snippet[field]) throw new Error(`Missing field: ${field}`);
    }

    snippet.id = `generated-${Date.now()}`;
    return NextResponse.json({ snippet });
  } catch (err) {
    console.error("Generate snippet error:", err);
    return NextResponse.json({ error: "Failed to generate snippet" }, { status: 500 });
  }
}
