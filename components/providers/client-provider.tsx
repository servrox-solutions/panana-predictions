"use client";

import { Fragment, PropsWithChildren } from "react";
import WebApp from "@twa-dev/sdk";
import { ThemeProvider } from "next-themes";
import { AutoConnectProvider } from "./auto-connect-provider";
import { WalletProvider } from "./wallet-provider";

export function ClientProvider({ children, ...props }: PropsWithChildren) {
  if (typeof window !== "undefined") {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor("##ffc80a");
    WebApp.setBackgroundColor("##ffc80a");
    WebApp.setBottomBarColor("##ffc80a");
  }

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
    </Fragment>
  );
}
