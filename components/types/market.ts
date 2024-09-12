export interface BetInfo {
  amount: number;
  timestamp: number;
}

export interface Market {
  key: string;
  tradingPair: string;
  store: {
    start_price: bigint;
    start_time: number;
    end_time: number;
    min_bet: number;
    up_bets_sum: number;
    down_bets_sum: number;
    up_bets: Map<string, BetInfo>;
    down_bets: Map<string, BetInfo>;
  };
}
