"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function AptUsdChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: "BINANCE:APTUSD",
        interval: "D",
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        calendar: false,
        support_host: "https://www.tradingview.com",
      });
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        const script = containerRef.current.querySelector("script");
        if (script) {
          containerRef.current.removeChild(script);
        }
      }
    };
  }, []);

  return (
    <div className="w-full h-[600px] bg-white">
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full h-full"
      >
        <div className="tradingview-widget-container__widget w-full h-full"></div>
      </div>
    </div>
  );
}
