"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren, useEffect } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { toast } from "react-toastify";
import { useAutoConnect } from "./auto-connect-provider";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const notifyError = (msg: string) => toast.error(msg);

  const { autoConnect } = useAutoConnect();

  return (
    <AptosWalletAdapterProvider
      autoConnect={autoConnect}
      dappConfig={{
        network: (process.env.NEXT_PUBLIC_APP_NETWORK ?? "testnet") as Network,
        aptosApiKey: process.env.NEXT_PUBLIC_APTOS_API_KEY,
        aptosConnect: { dappId: "f44746dc-fd46-4765-a37c-f1b61fee51fa" },
        mizuwallet: {
          manifestURL:
            "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
        },
      }}
      onError={(error) => notifyError(error || "Unknown wallet error")}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
