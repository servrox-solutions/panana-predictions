import { createEntryPayload } from "@thalalabs/surf";
import { MARKET_ABI } from "@/lib/aptos";
import { MarketData } from "@/lib/types/market";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const usePlaceBet = () => {
  const { account, signAndSubmitTransaction } = useWallet();

  const placeBet = async (
    marketData: MarketData,
    betUp: boolean,
    amount: number
  ): Promise<boolean> => {
    if (!account || !marketData) return false;

    try {
      const payload = createEntryPayload(MARKET_ABI, {
        function: "place_bet",
        typeArguments: [
          `${MARKET_ABI.address}::switchboard_asset::${marketData.tradingPair.one}`,
        ],
        functionArguments: [
          marketData.address,
          betUp,
          Math.floor(amount).toString(),
        ],
      });

      const transactionResponse = await signAndSubmitTransaction({
        sender: account.address,
        data: payload,
      });

      // const transactionResponse = await signAndSubmitTransaction({
      //   sender: account.address,
      //   data: payload,
      // });

      // const committedTransactionResponse = await aptos.waitForTransaction({
      //   transactionHash: transactionResponse.hash,
      // });
      return true;
    } catch (error: any) {
      console.error("Transaction failed:", error);
      return false;
    }
  };

  return { placeBet };
};
