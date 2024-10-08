"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
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
        network:
          (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? Network.TESTNET,
        aptosApiKey: process.env.NEXT_PUBLIC_APTOS_API_KEY,
        aptosConnect: {
          dappId: "6a12f6e7-bfdc-4401-b019-a0bea0260cf3",
          dappName: "Panana Predictions",
          dappImageURI: "https://app.panana-predictions.xyz/mr_peeltos.png",
          frontendBaseURL: "https://app.panana-predictions.xyz",
          backendBaseURL: "https://app.panana-predictions.xyz",
        },
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
