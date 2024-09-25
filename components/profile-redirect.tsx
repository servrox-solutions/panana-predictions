'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { WalletSelector } from './wallet-selector';

export function ProfileRedirect() {
  const wallet = useWallet();

  useEffect(() => {
    if (wallet.account?.address) {
      redirect(`/profile/${wallet.account.address}`)
    }
  }, [wallet.account?.address]);

  if (!wallet.account?.address) {
    return <div className="flex flex-col gap-4 justify-center items-center pb-16 h-full">
      <span>Please login to see your profile</span>
      <WalletSelector />
    </div>;
  }
}
