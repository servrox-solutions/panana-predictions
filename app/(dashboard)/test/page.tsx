import { TelegramTest } from "@/components/telegram-test";
import { WalletConnection } from "@/components/wallet-connection";

export default function Test() {

  return (
    <div className="p-4">
      <div className="text-xl">Test Page</div>
      <TelegramTest />
      <br />
      <WalletConnection />
    </div>
  );
}
