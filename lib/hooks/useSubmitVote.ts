import { createEntryPayload } from "@thalalabs/surf";
import { aptos, MARKET_ABI } from "@/lib/aptos";
import { MarketData } from "@/lib/types/market";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const useSubmitVote = () => {
  const { account, signAndSubmitTransaction } = useWallet(); // extract wallet data inside the hook

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

      const transactionResponse = await signAndSubmitTransaction({
        sender: account.address,
        data: payload,
      });

      console.log("🍧 vote transactionResponse", transactionResponse);

      const committedTransactionResponse = await aptos.waitForTransaction({
        transactionHash: transactionResponse.hash,
      });

      console.log(
        "🍧 vote committedTransactionResponse",
        committedTransactionResponse
      );
    } catch (error: any) {
      console.error("Transaction failed:", error);
    }
  };

  return { submitVote };
};
