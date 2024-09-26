'use client';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { WalletSelector } from './wallet-selector';
import Image from 'next/image';
import { Card } from './ui/card';
import LoadingSpinner from './loadingspinner';

export function ProfileRedirect() {
    const wallet = useWallet();

    useEffect(() => {
        if (wallet.account?.address) {
            redirect(`/profile/${wallet.account.address}`);
        }
    }, [wallet.account?.address]);

    if (wallet.isLoading) {
        return <LoadingSpinner />;
    }

    if (!wallet.account?.address) {
        return <div className="p-4 sm:px-6 sm:py-0 w-full flex justify-center">
            <Card className="py-8 flex w-full max-w-[500px] margin-auto flex-col gap-4 justify-center items-center h-full">
                <Image className="rounded-full" src="/profile_pic.jpg" width="120" height="120" alt="Mr. Peeltos" />
                <p className="max-w-[70%] text-center">Please log in to access and view your profile.</p>
                <WalletSelector />
            </Card>
        </div>
    }
}
