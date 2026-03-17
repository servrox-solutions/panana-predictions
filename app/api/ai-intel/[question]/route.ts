import { NextRequest, NextResponse } from "next/server";

async function getRealSentiment(question: string): Promise<{
  sentiment: "bullish" | "bearish" | "neutral";
  aiProb: number;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(
      "https://api-inference.huggingface.co/models/ProsusAI/finbert",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: question, options: { wait_for_model: true } }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    const result = await response.json();
    const scores = result[0];

    if (!scores) throw new Error("No scores returned");

    // FinBERT returns: positive, negative, neutral
    const positive = scores.find((s: any) => s.label === "positive")?.score ?? 0;
    const negative = scores.find((s: any) => s.label === "negative")?.score ?? 0;
    const neutral = scores.find((s: any) => s.label === "neutral")?.score ?? 0;

    let sentiment: "bullish" | "bearish" | "neutral" = "neutral";
    if (positive > negative && positive > neutral) sentiment = "bullish";
    else if (negative > positive && negative > neutral) sentiment = "bearish";

    const aiProb = Math.round(positive * 100);

    return { sentiment, aiProb };
  } catch (err) {
    // Fallback to keyword matching if HuggingFace fails
    const q = question.toLowerCase();
    if (q.includes("btc") || q.includes("bitcoin")) return { sentiment: "bearish", aiProb: 58 };
    if (q.includes("eth") || q.includes("ethereum")) return { sentiment: "bullish", aiProb: 71 };
    if (q.includes("apt") || q.includes("aptos")) return { sentiment: "bullish", aiProb: 65 };
    return { sentiment: "neutral", aiProb: 50 };
  }
}

function getInefficiency(marketProb: number, aiProb: number) {
  const diff = Math.abs(marketProb - aiProb);
  if (diff >= 15) return "HIGH";
  if (diff >= 8) return "MEDIUM";
  return "LOW";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ question: string }> }
) {
  const { question } = await params;
  const decoded = decodeURIComponent(question);
  const marketProb = Math.floor(Math.random() * 40) + 45;
  const { sentiment, aiProb } = await getRealSentiment(decoded);
  const inefficiency = getInefficiency(marketProb, aiProb);

  return NextResponse.json({
    question: decoded,
    marketProb,
    aiProb,
    sentiment,
    inefficiency,
    signal:
      marketProb > aiProb
        ? "Market over-optimistic → Short opportunity"
        : "Market under-pricing → Long opportunity",
    timestamp: new Date().toISOString(),
  });
}
