import { createEntryPayload } from "@thalalabs/surf";
import { MARKET_ABI } from "@/lib/aptos";
import { MarketData } from "@/lib/types/market";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const useSubmitVote = () => {
  const { account, signAndSubmitTransaction } = useWallet();

  const submitVote = async (
    marketData: MarketData,
    isVoteUp: boolean
  ): Promise<void> => {
    if (!account || !marketData) return;

    try {
      const payload = createEntryPayload(MARKET_ABI, {
        function: "vote",
        typeArguments: [
          `${MARKET_ABI.address}::switchboard_asset::${marketData.tradingPair.one}`,
        ],
        functionArguments: [marketData.address, isVoteUp],
      });

      await signAndSubmitTransaction({
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
    } catch (error: any) {
      console.error("Transaction failed:", error);
    }
  };

  return { submitVote };
};
