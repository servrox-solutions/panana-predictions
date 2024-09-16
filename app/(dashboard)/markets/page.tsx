import MarketOrganizer from "@/components/market-organizer";
import { surfClient } from "@/lib/aptos";

export default function Markets() {
  // const [balance] = await surfClient.resource.

  return (
    <div className="pl-4">
      <MarketOrganizer />
    </div>
  );
}
