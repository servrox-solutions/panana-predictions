export interface ResolveMarketEvent {
    marketplace: {inner: string};
    market: {inner: string};
    start_time_timestamp: string;
    end_time_timestamp: string;
    market_cap: string;
    dissolved: boolean;
}