export type Address = `0x${string}`;

export interface MarketData {
  name: string;
  address: Address;
  tradingPair: { one: MarketType; two: string };
  creator: Address;
  createdAt: number;
  startPrice: number;
  startTime: number;
  resolvedAt: number | null;
  endTime: number;
  endPrice: number | null;
  minBet: number;
  upBetsSum: number;
  downBetsSum: number;
  fee: number;
  upBets: Map<Address, number>;
  downBets: Map<Address, number>;
  userVotes: Map<Address, boolean>;
  upVotesSum: number;
  downVotesSum: number;
  upWinFactor: number;
  downWinFactor: number;
}

export const marketTypes = [`BTC`, `APT`, `SOL`, `USDC`, `ETH`] as const;

export type MarketType = (typeof marketTypes)[number];

export interface MarketOld {
  key: string;
  tradingPair: string;
  store: {
    start_price: bigint;
    start_time: number;
    end_time: number;
    min_bet: number;
    up_bets_sum: number;
    down_bets_sum: number;
    up_bets: Map<
      string,
      {
        amount: number;
        timestamp: number;
      }
    >;
    down_bets: Map<
      string,
      {
        amount: number;
        timestamp: number;
      }
    >;
  };
}
