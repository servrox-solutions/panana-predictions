'use client';
import { PropsWithChildren } from "react";
import { AptosWalletAdapterProvider, Network } from "@aptos-labs/wallet-adapter-react";

import { toast } from 'react-toastify';

export function WalletProvider({ children }: PropsWithChildren) {
    const notifyError = (msg: string) => toast.error(msg);

    return (
        <AptosWalletAdapterProvider
            autoConnect={true}
            dappConfig={{ network: (process.env.NEXT_PUBLIC_APP_NETWORK ?? 'testnet') as Network}}
            onError={(error) => notifyError(error || "Unknown wallet error")}
        >
            {children}
        </AptosWalletAdapterProvider>
    );
}
