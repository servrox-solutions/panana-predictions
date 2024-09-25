"use client";

import { Fragment, PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { AutoConnectProvider } from "./auto-connect-provider";
import { WalletProvider } from "./wallet-provider";

import Script from "next/script";
import { Telegram } from "@twa-dev/types";

declare global {
  interface Window {
    Telegram: Telegram | undefined;
  }
}

export function ClientProvider({ children, ...props }: PropsWithChildren) {
  return (
    <Fragment {...props}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AutoConnectProvider>
          <WalletProvider>{children}</WalletProvider>
        </AutoConnectProvider>
      </ThemeProvider>
      <Script
        id="TelegramWebApp"
        src="/telegram-web-apps.js"
        onReady={() => {
          window.Telegram?.WebApp.ready();
          window.Telegram?.WebApp.expand();
          window.Telegram?.WebApp.setHeaderColor("#ffc80a");
          window.Telegram?.WebApp.setBackgroundColor("#ffc80a");
          window.Telegram?.WebApp.setBottomBarColor("#ffc80a");
        }}
      />
    </Fragment>
  );
}
