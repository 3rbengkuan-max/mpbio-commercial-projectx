import Anthropic from "@anthropic-ai/sdk";
import {
  SIGNAL_CATEGORIES,
  SIGNAL_TYPES,
  type ResearchDraft,
} from "@/lib/types";

/**
 * Ask Claude to find real, current life-science market signals via web search
 * and return them as structured drafts. Server-side only — the API key never
 * reaches the browser (docs/SECURITY.md).
 *
 * Nothing here writes to the database: docs/AGENTIC_LAYER.md classes drafting
 * from research as a medium-risk action that a human confirms before insert.
 */

const SYSTEM = `You are a market-intelligence researcher for MP Biomedicals (MPbio),
a life-science company selling reagents, antibodies, immunoassays, cell-culture
products and diagnostics. Your job is to find REAL, RECENT, verifiable market
signals and return them as structured data.

Rules:
- Use web search to find genuine, recent items. Never invent a signal or a URL.
- Every signal must have a real source_url taken from a search result.
- Focus on what matters to MPbio: competitor moves (Thermo Fisher, Bio-Rad,
  Merck/Sigma-Aldrich, Bio-Techne/BioLegend, Danaher, QIAGEN, Illumina),
  customer/market demand (CROs, academic and pharma labs, diagnostics),
  research-funding trends (NIH and equivalents), and geopolitical/supply-chain
  shifts affecting reagents and lab consumables.
- Categorise each with category ∈ {competitor, customer, trend, geopolitical}
  and signal_type ∈ {opportunity, threat} from MPbio's point of view.`;

const INSTRUCTION = `Find 6 distinct, real, recent signals relevant to MPbio,
spread across the four categories where possible. For each, write a 1–2 sentence
summary of what happened and why it matters to MPbio.

When done, output ONLY a JSON array (inside a \`\`\`json code block) of objects with
exactly these fields:
- "title": string (headline style)
- "category": one of competitor | customer | trend | geopolitical
- "signal_type": one of opportunity | threat
- "source_name": string (publication or origin)
- "source_url": string (a real URL from your search)
- "signal_date": string "YYYY-MM-DD" (best estimate of when it happened)
- "summary": string

Do not include any signal you could not find a real source for.`;

type Result = {
  drafts: ResearchDraft[];
  searchCount: number;
};

export async function researchSignals(): Promise<Result> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "Research is not configured: ANTHROPIC_API_KEY is not set in the environment.",
    );
  }

  const client = new Anthropic();

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: INSTRUCTION },
  ];

  let searchCount = 0;
  // Server tools can pause the turn when their internal loop hits its cap;
  // resume by re-sending until the model finishes (bounded so we never spin).
  for (let i = 0; i < 4; i++) {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 6000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: SYSTEM,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
      messages,
    });

    for (const block of response.content) {
      if (block.type === "server_tool_use" && block.name === "web_search") {
        searchCount += 1;
      }
    }

    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return { drafts: parseDrafts(text), searchCount };
  }

  throw new Error("Research did not finish in time. Please try again.");
}

/** Pull the JSON array out of the model's reply and keep only valid rows. */
function parseDrafts(text: string): ResearchDraft[] {
  const raw = extractJsonArray(text);
  if (!Array.isArray(raw)) return [];

  const drafts: ResearchDraft[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;

    const title = str(o.title);
    const category = str(o.category).toLowerCase();
    const signalType = str(o.signal_type).toLowerCase();

    // Drop anything that doesn't fit the schema rather than trust it blindly.
    if (!title) continue;
    if (!SIGNAL_CATEGORIES.includes(category as never)) continue;
    if (!SIGNAL_TYPES.includes(signalType as never)) continue;

    drafts.push({
      title: title.slice(0, 300),
      category,
      signal_type: signalType,
      source_name: nullable(str(o.source_name)),
      source_url: validUrl(str(o.source_url)),
      signal_date: validDate(str(o.signal_date)),
      summary: nullable(str(o.summary).slice(0, 2000)),
    });
  }
  return drafts;
}

function extractJsonArray(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function nullable(v: string): string | null {
  return v === "" ? null : v;
}

function validUrl(v: string): string | null {
  return /^https?:\/\/\S+$/i.test(v) ? v : null;
}

function validDate(v: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}
