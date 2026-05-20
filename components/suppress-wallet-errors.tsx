"use client";

import { useEffect } from "react";

const SUPPRESSED_ORIGINS = ["aptosconnect.app", "posthog.com", "proxy.mz.xyz"];

export function SuppressWalletErrors() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message ?? "";
      if (msg === "Failed to fetch" || msg.includes("message channel closed")) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (SUPPRESSED_ORIGINS.some((o) => event.filename?.includes(o))) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
