import { ModeToggle } from "@/components/mode-toggle";
import ProfileCard from "@/components/profile-card";
import Statistics from "@/components/profile-statistics";
import { Card } from "@/components/ui/card";
import { WalletReconnect } from "@/components/wallet-reconnect";
import { MODULE_ADDRESS_FROM_ABI, isValidAddress } from "@/lib/aptos";
import { getAccountBalance } from "@/lib/get-account-balance";
import {
  getLatestNAccountTransactions,
  getTotalTransactionCount,
} from "@/lib/get-account-transactions";
import { marketTypes } from "@/lib/get-available-markets";
import { Address } from "@/lib/types/market";
import { extractAsset } from "@/lib/utils";

export default async function Profile({
  params,
}: {
  params: { address: string };
}) {
  if (!isValidAddress(params.address)) {
    return <>Please Login First</>;
  }

  const balance = await getAccountBalance(params.address);
  const totalTransactions = await getTotalTransactionCount(params.address);
  const res = await getLatestNAccountTransactions(
    params.address,
    500,
    totalTransactions
  );

  const pananaTransactions = res.filter(
    (x) => x.success && x.payload.function.startsWith(MODULE_ADDRESS_FROM_ABI)
  );
  console.log(JSON.stringify(pananaTransactions));
  const betTransactions = pananaTransactions.filter(
    (x) =>
      x.payload.function === `${MODULE_ADDRESS_FROM_ABI}::market::place_bet`
  );
  const voteTransactions = pananaTransactions.filter(
    (x) => x.payload.function === `${MODULE_ADDRESS_FROM_ABI}::market::vote`
  );
  const createMarketTransactions = pananaTransactions.filter(
    (x) =>
      x.payload.function === `${MODULE_ADDRESS_FROM_ABI}::market::create_market`
  );
  const placedBetsAmount = betTransactions.length;
  const bettedMarketplaces = new Set(
    betTransactions.map((x) => x.payload.arguments[0].inner)
  );

  const totalBettingAmount = betTransactions.reduce(
    (prev, cur) => prev + (+cur.payload.arguments[2] as unknown as number),
    0
  );
  const totalVotes = {
    up: voteTransactions.filter(
      (x) => x.payload.arguments[1] as unknown as boolean
    ).length,
    down: voteTransactions.filter(
      (x) => !(x.payload.arguments[1] as unknown as boolean)
    ).length,
  };

  const createdMarkets = marketTypes.reduce(
    (prev, cur) => ({ ...prev, [cur]: 0 }),
    {}
  ) as { [key in (typeof marketTypes)[number]]: number };

  createMarketTransactions.forEach((t) => {
    const asset = extractAsset(t.payload.type_arguments[0]);
    createdMarkets[asset]++;
  });
  // res.map(x => x)
  // const filteredTransactions = res.filter(x => x.)

  return (
    <div className="flex justify-center items-center pb-16 h-full">
      <div className="max-w-[1200px] grid grid-cols-1 flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ProfileCard
            className="col-span-1"
            address={params.address as Address}
            balance={balance / 10 ** 8}
            totalTransactions={totalTransactions}
          />
          <Card className="p-4 flex flex-col gap-2">
            <span className="text-sm text-gray-500">Settings</span>
            <div className="mt-2 flex gap-2 items-center">
              <ModeToggle className="w-[60px]" />{" "}
              <span className="col-span-4">Light/Dark Mode</span>
            </div>
            <div className="flex gap-2 items-center">
              <WalletReconnect className="w-[60px] flex justify-center gap-0" />{" "}
              <span className="col-span-4">
                Reconnect wallet on page reload
              </span>
            </div>
          </Card>
        </div>
        <Statistics
          createdMarkets={createdMarkets}
          placedBetsAmount={placedBetsAmount}
          totalBettingAmount={totalBettingAmount}
          totalVotes={totalVotes}
        />
      </div>
    </div>
  );
}
