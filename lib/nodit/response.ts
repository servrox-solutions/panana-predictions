export interface StatisticsPageResponse {
  data: Data
}

export interface Data {
  created_markets: CreatedMarkets
  market_interactions: MarketInteractions
  event_market_interactions: MarketInteractions
  total_votes: TotalVotes
  apt: unknown[]
  btc: unknown[]
  eth: unknown[]
  sol: unknown[]
  usdc: unknown[]
  apt_placed: EventData[];
  btc_placed: EventData[];
  eth_placed: EventData[];
  sol_placed: EventData[];
  usdc_placed: EventData[];
  placed_bets: PlacedBets
}

export interface EventData {
  data: Data2
}

export interface Data2 {
  up: boolean
  bet: string
  market: Market
  account: string
  marketplace: Marketplace
  betted_at_timestamp: string
}

export interface Market {
  inner: string
}

export interface Marketplace {
  inner: string
}

export interface PlacedBets {
  aggregate: Aggregate & {
    sum: {
      amount: number;
    }
  }
}

export interface Aggregate {
  count: number
}

export interface CreatedMarkets {
  aggregate: Aggregate
}

export interface MarketInteractions {
  aggregate: Aggregate3
}

export interface Aggregate3 {
  count: number
}

export interface TotalVotes {
  aggregate: Aggregate4
}

export interface Aggregate4 {
  count: number
}

