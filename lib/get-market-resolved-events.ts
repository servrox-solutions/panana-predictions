import { aptos } from './aptos';

export interface MarketResolvedEventData {
  market: {
    inner: string;
  }
  dissolved: boolean;
  market_cap: string;
  marketplace: {
    inner: string;
  }
  end_time_timestamp: string;
  start_time_timestamp: string;
}
export const getMarketResolvedEvents = async (moduleId: string, assetType: string, limit = 10) => (await aptos.getModuleEventsByEventType({
    eventType: `${moduleId}::market::ResolveMarket<${assetType}>`,
    options: {
      orderBy: [{
        'transaction_block_height': 'desc',
      }],
      limit,
    }
  })).map(x => x.data as MarketResolvedEventData)