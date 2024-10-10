import { createEntryPayload } from "@thalalabs/surf";
import { EVENT_MARKET_ABI, MARKET_ABI } from "@/lib/aptos";
import { Address } from "@/lib/types/market";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const useSubmitVote = () => {
  const { account, signAndSubmitTransaction } = useWallet();

  const submitVote = async (
    type: `${string}::${string}::${string}`,
    marketAddress: Address,
    isVoteUp: boolean
  ): Promise<boolean> => {
    if (!account) return false;
    const marketType = type.split("::")[1];
    const abi = marketType === 'switchboard_asset' ? MARKET_ABI : EVENT_MARKET_ABI;

    try {
      const payload = createEntryPayload(abi, {
        function: "vote",
        typeArguments: [type],
        functionArguments: [marketAddress, isVoteUp],
      });

      await signAndSubmitTransaction({
        sender: account.address,
        data: payload,
      });
      return true;

      // const transactionResponse = await signAndSubmitTransaction({
      //   sender: account.address,
      //   data: payload,
      // });

      // const committedTransactionResponse = await aptos.waitForTransaction({
      //   transactionHash: transactionResponse.hash,
      // });
    } catch (error: any) {
      console.error("Transaction failed:", error);
      return false;
    }
  };

  return { submitVote };
};
