"use client";

import { Fragment, PropsWithChildren, memo, lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { AutoConnectProvider } from "./auto-connect-provider";
import { WalletProvider } from "./wallet-provider";

import { SDKProvider } from "@telegram-apps/sdk-react";

const TelegramProvider = lazy(() =>
  import("./telegram-provider").then((module) => ({
    default: module.TelegramProvider,
  }))
);
const MemoizedTelegramProvider = memo(TelegramProvider);

export function ClientProvider({ children, ...props }: PropsWithChildren) {
  return (
    <Fragment {...props}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <SDKProvider acceptCustomStyles>
          {/* Use Suspense to handle the lazy-loaded TelegramProvider */}
          <Suspense fallback={<div>Loading...</div>}>
            <MemoizedTelegramProvider>
              <AutoConnectProvider>
                <WalletProvider>{children}</WalletProvider>
              </AutoConnectProvider>
            </MemoizedTelegramProvider>
          </Suspense>
        </SDKProvider>
      </ThemeProvider>
    </Fragment>
  );
}
