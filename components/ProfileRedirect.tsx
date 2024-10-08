"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export function ProfileRedirect() {
  const wallet = useWallet();

  useEffect(() => {
    if (wallet.account?.address) {
      redirect(`/profile/${wallet.account.address}`);
    }
  }, [wallet.account?.address]);

  return <></>;
}
