import { createEntryPayload } from "@thalalabs/surf";
import { aptos, MARKET_ABI } from "@/lib/aptos";
import { Address, MarketType } from "@/lib/types/market";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getMarketType } from "../get-market-type";
import { toast } from "react-toastify";

export const useResolveMarket = () => {
  const { account, signAndSubmitTransaction } = useWallet();

  const resolveMarket = async (
    marketAddress: Address,
    marketType?: MarketType
  ): Promise<void> => {
    if (!account?.address) {
      toast.info("Please connect your wallet first.");
      return;
    }

    if (!marketType) {
      marketType = await getMarketType(marketAddress);
    }

    try {
      const payload = createEntryPayload(MARKET_ABI, {
        function: "resolve_market",
        typeArguments: [
          `${MARKET_ABI.address}::switchboard_asset::${marketType}`,
        ],
        functionArguments: [marketAddress],
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

  return { resolveMarket };
};
