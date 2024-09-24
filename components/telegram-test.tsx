"use client";

import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";
import { useTelegram } from "./providers/telegram-provider";
import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";

export function TelegramTest() {
  const { user, webApp } = useTelegram();
  console.log(user);

  const [aptosConnectUrl, setAptosConnectUrl] = useState<string | null>(null);
  const { connect } = useWallet();

  const handleConnect = async () => {
    (function () {
      const originalWindowOpen = window.open;

      window.open = function (...args) {
        const newWindow = originalWindowOpen.apply(this, args);
        if (args[0]) {
          setAptosConnectUrl(`${args[0]}`);
        }
        return newWindow;
      };
    })();

    try {
      await connect(
        "Continue with Google" as WalletName<"Continue with Google">
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <Button onClick={handleConnect}>Test</Button>
          <br />
          {aptosConnectUrl && (
            <>
              <Link href={aptosConnectUrl}>
                <Button>next/link</Button>
              </Link>
              <br />
              <Button
                onClick={() => (webApp as any)?.openLink(aptosConnectUrl)}
              >
                Open link in external browser
              </Button>
              <br />
              <Button
                onClick={() =>
                  (webApp as any)?.openLink(aptosConnectUrl, {
                    try_instant_view: true,
                  })
                }
              >
                Open link inside Telegram webview
              </Button>
            </>
          )}
          <br />
          <h1>Welcome {user?.username}</h1>
          User data:
          <pre>{JSON.stringify(user, null, 2)}</pre>
          Eniter Web App data:
          <pre>{JSON.stringify(webApp, null, 2)}</pre>
        </div>
      ) : (
        <div>Make sure web app is opened from telegram client.</div>
      )}
    </div>
  );
}
