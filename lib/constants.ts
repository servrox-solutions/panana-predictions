import { MarketOld } from "@/lib/types/market";

export const tradingPairs = [
  "BTC/USD",
  "APT/USD",
  "SOL/USD",
  "USDC/USD",
  "ETH/USD",
];

export const sampleMarkets: MarketOld[] = [
  {
    key: "MARKET_001",
    tradingPair: "BTC/USD",
    store: {
      start_price: BigInt("50000000000000000000000"),
      start_time: Date.now() / 1000 - 3600,
      end_time: Date.now() / 1000 + 3600,
      min_bet: 100,
      up_bets_sum: 5000,
      down_bets_sum: 4500,
      up_bets: new Map([
        ["0x123", { amount: 1000, timestamp: Date.now() / 1000 - 1800 }],
        ["0x456", { amount: 2000, timestamp: Date.now() / 1000 - 900 }],
      ]),
      down_bets: new Map([
        ["0x789", { amount: 1500, timestamp: Date.now() / 1000 - 2700 }],
        ["0xabc", { amount: 1000, timestamp: Date.now() / 1000 - 1350 }],
      ]),
    },
  },
  {
    key: "MARKET_002",
    tradingPair: "ETH/USD",
    store: {
      start_price: BigInt("2000000000000000000000"),
      start_time: Date.now() / 1000 - 7200,
      end_time: Date.now() / 1000 + 7200,
      min_bet: 200,
      up_bets_sum: 10000,
      down_bets_sum: 8000,
      up_bets: new Map([
        ["0xdef", { amount: 3000, timestamp: Date.now() / 1000 - 3600 }],
        ["0xghi", { amount: 4000, timestamp: Date.now() / 1000 - 1800 }],
      ]),
      down_bets: new Map([
        ["0xjkl", { amount: 2500, timestamp: Date.now() / 1000 - 5400 }],
        ["0xmno", { amount: 2000, timestamp: Date.now() / 1000 - 2700 }],
      ]),
    },
  },
];
