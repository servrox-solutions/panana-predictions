import { aptos } from './aptos';

export interface MarketCreatedEventData {
  market: {
    inner: string;
  },
  marketplace: {
    inner: string;
  },
  end_time_timestamp: string,
  start_time_timestamp: string;
}

export const getMarketCreatedEvents = async (moduleId: string, assetType: string, limit = 10) => (await aptos.getModuleEventsByEventType({
    eventType: `${moduleId}::market::CreateMarket<${assetType}>`,
    options: {
      orderBy: [{
        'transaction_block_height': 'desc',
      }],
      limit,
    }
  })).map(x => x.data as MarketCreatedEventData)