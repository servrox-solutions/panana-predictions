"use client";

import { storeUserWallet } from "@/lib/supabase/store-user-wallet";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import { Fragment, PropsWithChildren, useEffect } from "react";

export function PersistenceProvider({ children, ...props }: PropsWithChildren) {
  const { account, wallet } = useWallet();
  const launchParams = useLaunchParams(true);
  const initData = useInitData(true);

  useEffect(() => {
    if (account?.address && wallet?.name) {
      const telegramUserId =
        launchParams?.platform !== "mock" ? initData?.user?.id : undefined;
      storeUserWallet(account.address, wallet.name, telegramUserId);
    }
  }, [account?.address, wallet]);

  return <Fragment {...props}>{children}</Fragment>;
}
