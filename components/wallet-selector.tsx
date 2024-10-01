"use client";

import React, { useCallback, useState, Suspense, memo } from "react";
import {
  APTOS_CONNECT_ACCOUNT_URL,
  isAptosConnectWallet,
  truncateAddress,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { Copy, LogOut, User } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Dialog, DialogTrigger } from "./ui/dialog";

const ConnectWalletDialog = React.lazy(() =>
  import("./connect-wallet-dialog").then((module) => ({
    default: memo(module.ConnectWalletDialog),
  }))
);

export function WalletSelector() {
  const { account, connected, disconnect, wallet } = useWallet();
  const notifySuccess = (message: string) => toast.success(message);
  const notifyError = (message: string) => toast.error(message);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const copyAddress = useCallback(async () => {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address);
      notifySuccess("Copied wallet address to clipboard.");
    } catch {
      notifyError("Failed to copy wallet address.");
    }
  }, [account?.address]);

  return connected ? (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button>
          {account?.ansName || truncateAddress(account?.address) || "Unknown"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={copyAddress} className="gap-2">
          <Copy className="h-4 w-4" /> Copy address
        </DropdownMenuItem>
        {wallet && isAptosConnectWallet(wallet) && (
          <DropdownMenuItem asChild>
            <a
              href={APTOS_CONNECT_ACCOUNT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2"
            >
              <User className="h-4 w-4" /> Account
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={disconnect} className="gap-2">
          <LogOut className="h-4 w-4" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-[#321575] via-[#8D0B93] to-[#9c0f85] text-[#e6c8ff]">
            {/* {isLoading ? 'Connecting Wallet...' : 'Connect a Wallet'} TODO: uncomment as soon as https://github.com/aptos-labs/aptos-wallet-adapter/issues/259 is fixed */}
            Connect a Wallet
          </Button>
        </DialogTrigger>

        {/* Use Suspense to handle the lazy loading */}
        <Suspense fallback={<div>Loading...</div>}>
          <ConnectWalletDialog close={closeDialog} />
        </Suspense>
      </Dialog>
    </>
  );
}
