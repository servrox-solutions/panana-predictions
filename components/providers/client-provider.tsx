"use client";

import { Fragment, PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { AutoConnectProvider } from "./auto-connect-provider";
import { WalletProvider } from "./wallet-provider";

import { Telegram } from "@twa-dev/types";
import { SDKProvider } from "@telegram-apps/sdk-react";
import { TelegramProvider } from "./telegram-provider";

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
          <TelegramProvider>
            <AutoConnectProvider>
              <WalletProvider>{children}</WalletProvider>
            </AutoConnectProvider>
          </TelegramProvider>
        </SDKProvider>
      </ThemeProvider>
    </Fragment>
  );
}
