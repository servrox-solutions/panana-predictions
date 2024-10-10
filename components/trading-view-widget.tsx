"use client";

import { MarketType } from "@/lib/types/market";
import { useTheme } from "next-themes";
import { useRef, useEffect, memo } from "react";

function AdvancedChart({ marketType }: { marketType: MarketType }) {
  const container = useRef<HTMLDivElement>(null);
  const scriptAppendedRef = useRef(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (
      !(resolvedTheme === "dark" || resolvedTheme === "light") ||
      !container.current ||
      scriptAppendedRef.current
    )
      return;
    console.log(resolvedTheme);

    scriptAppendedRef.current = true;

    const config = {
      autosize: true,
      symbol:
        marketType === "USDC" ? `CRYPTO:USDCUSD` : `COINBASE:${marketType}USD`,
      range: "1D", // TODO: make this dynamic based on market data https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
      // interval: "D",
      timezone: "Etc/UTC",
      theme: resolvedTheme,
      style: "1",
      locale: "en",
      withdateranges: true,
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    };

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `${JSON.stringify(config)}`;
    container.current.appendChild(script);
  }, [resolvedTheme, container.current]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{
          height: "calc(100% - 32px)",
          width: "100%",
        }}
      ></div>
      {/* <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div> */}
    </div>
  );
}

export const TradingViewWidget = memo(AdvancedChart, (prevProps, nextProps) => {
  return prevProps.marketType === nextProps.marketType;
});
