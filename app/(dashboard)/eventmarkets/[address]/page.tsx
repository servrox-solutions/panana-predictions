import { Card } from "@/components/ui/card";
import { AvailableMarket } from "@/lib/get-available-markets";
import { Address, EventMarketData } from "@/lib/types/market";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getEventMarketType } from "@/lib/get-event-market-type";
import { initializeEventMarket } from "@/lib/initialize-event-market";
import { EventMarketCardExtendedUi } from "@/components/eventmarket/event-market-card-extended-ui";
import Linkify from "linkify-react";
import { EventMarketInfo } from "@/components/eventmarket/event-market-info";

export default async function Market({
  params,
}: {
  params: { address: string };
}) {
  const marketType = await getEventMarketType(params.address as Address);

  const availableMarket: AvailableMarket = {
    address: params.address as Address,
    type: marketType as any,
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
        pageName={marketData.name}
      />

      <div className="grid items-start md:grid-cols-2 gap-4">
        {marketData && (
          <EventMarketCardExtendedUi
            name={marketData.name}
            address={marketData.address}
            creator={marketData.creator}
            createdAt={marketData.createdAt}
            minBet={marketData.minBet}
            fee={marketData.fee}
            userVotes={marketData.userVotes}
            upVotesSum={marketData.upVotesSum}
            downVotesSum={marketData.downVotesSum}
            upWinFactor={marketData.upWinFactor}
            downWinFactor={marketData.downWinFactor}
            totalBets={marketData.totalBets}
            answers={marketData.answers}
            accepted={marketData.accepted}
            rejectionReason={marketData.rejectionReason}
            question={marketData.question}
            rules={marketData.rules}
          />
        )}

        <div className="flex flex-col gap-4">
          <Card className="flex gap-4 flex-col break-words max-w-full">
            <h1 className="text-xl font-bold">Rules</h1>
            <div className="w-full break-all md:break-normal overflow-hidden max-w-full">
              {" "}
              {/* Set width to full */}
              <Linkify
                className="break-all"
                options={{
                  className: {
                    url: "underline",
                  },
                }}
              >
                {marketData.rules}
              </Linkify>
            </div>
          </Card>

          <EventMarketInfo
            availableMarket={availableMarket}
            initialMarketData={marketData}
          ></EventMarketInfo>
        </div>
      </div>
    </div>
  );
}
