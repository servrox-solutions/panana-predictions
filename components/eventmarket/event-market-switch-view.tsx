"use client";

import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useEventMarketDataStore } from '@/lib/atoms/useEventMarketDataStore';

export function EventMarketSwitchView() {
  const { displayMarketData, setDisplayMarketData } = useEventMarketDataStore();

  // Define handlers outside of the render to avoid inline functions
  const handleOpenMarketsClick = () => setDisplayMarketData("accepted");
  const handleRequesteddMarketsClick = () => setDisplayMarketData("requested");
  const handleRejectedMarketsClick = () => setDisplayMarketData("rejected");

  return (
    <Tabs
      defaultValue={displayMarketData}
    >
      <TabsList>
        <TabsTrigger
          value="accepted"
          onClick={handleOpenMarketsClick}
        >
          Open
        </TabsTrigger>
        <TabsTrigger
          value="requested"
          onClick={handleRequesteddMarketsClick}
        >
          Requested
        </TabsTrigger>
        <TabsTrigger
          value="rejected"
          onClick={handleRejectedMarketsClick}
        >
          Rejected
        </TabsTrigger>
      </TabsList>
    </Tabs >
  );
}
