"use client";

import { useEffect, useState } from "react";
import "./AIIntel.css";

interface AIIntelData {
  question: string;
  marketProb: number;
  aiProb: number;
  sentiment: string;
  inefficiency: string;
  signal: string;
}

export default function AIIntel({ question }: { question: string }) {
  const [data, setData] = useState<AIIntelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const encoded = encodeURIComponent(question);
        const res = await fetch(`/api/ai-intel/${encoded}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("AI Intel fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [question]);

  if (loading) return (
    <div className="ai-intel-card loading">
      🤖 Analyzing market...
    </div>
  );

  if (!data) return null;

  const isOverpriced = data.marketProb > data.aiProb;

  return (
    <div className="ai-intel-card">
      <div className="ai-intel-header">
        🤖 AI Market Intelligence
      </div>

      <div className="ai-intel-row">
        <div className="ai-intel-stat">
          <span className="label">Market</span>
          <span className="value market">{data.marketProb}%</span>
        </div>
        <div className="ai-intel-divider">vs</div>
        <div className="ai-intel-stat">
          <span className="label">AI</span>
          <span className={`value ${isOverpriced ? "ai-low" : "ai-high"}`}>
            {data.aiProb}%
          </span>
        </div>
      </div>

      <div className="ai-intel-row">
        <div className="ai-intel-badge sentiment">
          {data.sentiment === "bullish" ? "🟢" : data.sentiment === "bearish" ? "🔴" : "🟡"}
          {" "}{data.sentiment}
        </div>
        <div className={`ai-intel-badge edge edge-${data.inefficiency.toLowerCase()}`}>
          ⚡ Edge: {data.inefficiency}
        </div>
      </div>

      <div className="ai-intel-signal">
        💡 {data.signal}
      </div>
    </div>
  );
}