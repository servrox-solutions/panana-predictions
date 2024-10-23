import { AvailableMarket } from "@/lib/get-available-markets";
import { Address, EventMarketData, EventMarketType } from "@/lib/types/market";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getEventMarketType } from "@/lib/get-event-market-type";
import { initializeEventMarket } from "@/lib/initialize-event-market";
import { EventMarketInfo } from "@/components/eventmarket/event-market-info";

export default async function Market(
  props: {
    params: Promise<{ address: string }>;
  }
) {
  const params = await props.params;
  const marketType = await getEventMarketType(params.address as Address);

  const availableMarket: AvailableMarket<EventMarketType> = {
    address: params.address as Address,
    type: marketType,
  };
  const marketData: EventMarketData = await initializeEventMarket(
    availableMarket
  );



  return (
    <div className="container flex flex-col gap-4 mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        linkHref="/eventmarkets"
        linkTitle="Event Markets"
        pageName={marketData?.name ?? 'Undefined'}
      />

      <EventMarketInfo
        availableMarket={availableMarket}
        initialMarketData={marketData}
      ></EventMarketInfo>

    </div>
  );
}
