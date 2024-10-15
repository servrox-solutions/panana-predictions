'use client';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button } from './ui/button'
import { aptos } from '@/lib/aptos';
import { toast } from 'react-toastify';
import { HandCoins } from 'lucide-react';


export const FundWalletButton = () => {
    const wallet = useWallet();

    const fundWallet = async () => {
        if (!wallet.account?.address) {
            return;
        }
        const toastId = toast.info('Funding wallet...');
        try {
            await aptos.fundAccount({ accountAddress: wallet.account.address, amount: 10 ** 8 })
            toast.dismiss(toastId);
            toast.success('Wallet funded with 1 APT.')
        } catch (err: unknown) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error('Funding wallet failed.');
        }
    }

    return wallet.account?.address ?
        (
            <Button size="icon" variant={'outline'} className="" onClick={() => fundWallet()}>
                <div className="flex flex-col">
                    <span><HandCoins className="w-4 h-4" /></span>
                </div>
            </Button>
        ) :
        <></>;
}