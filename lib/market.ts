/* eslint-disable @typescript-eslint/no-explicit-any */
import { AvailableMarket, marketTypes } from "./get-available-markets";

import { DateTime } from "luxon";
import { getMarketRessource } from "./get-market-ressource";

export interface BetInfo {
  amount: number;
  timestamp: number;
}

export type Address = `0x${string}`;

export class Market {
  name: string;
  address: Address;
  tradingPair: { one: (typeof marketTypes)[number]; two: string };
  creator: Address;
  startPrice: number;
  startTime: number;
  endTime: number;
  minBet: number;
  upBetsSum: number;
  downBetsSum: number;
  fee: number;
  priceUp: boolean | null;
  priceDelta: number;
  upBets: Map<Address, BetInfo>;
  downBets: Map<Address, BetInfo>;
  userVotes: Map<Address, boolean>;
  upVotesSum: number;
  downVotesSum: number;
  private fetchIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(availableMarket: AvailableMarket, autoRefreshInterval?: number) {
    this.name = `🍌 ${availableMarket.type} / USD`;
    this.address = availableMarket.address;
    this.tradingPair = {
      one: availableMarket.type,
      two: "USD",
    };
    this.creator = "" as Address;
    this.startPrice = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.minBet = 0;
    this.upBetsSum = 0;
    this.downBetsSum = 0;
    this.fee = 0;
    this.priceUp = null;
    this.priceDelta = 0;
    this.upBets = new Map();
    this.downBets = new Map();
    this.userVotes = new Map();
    this.upVotesSum = 0;
    this.downVotesSum = 0;

    if (autoRefreshInterval) {
      this.setupAutoRefresh(autoRefreshInterval);
    }
  }

  async initialize(availableMarket: AvailableMarket): Promise<void> {
    const market = await getMarketRessource(availableMarket);

    this.creator = market.creator as Address;
    this.startPrice = Number(market.start_price);
    this.startTime = Number(market.start_time);
    this.endTime = Number(market.end_time);
    this.minBet = Number(market.min_bet);
    this.upBetsSum = Number(market.up_bets_sum);
    this.downBetsSum = Number(market.down_bets_sum);
    this.fee = Number(market.fee.numerator) / Number(market.fee.denominator);
    this.priceUp = market.price_up.vec[0] === "true" ? true : false;
    this.priceDelta =
      Number(market.price_delta.numerator) /
      Number(market.price_delta.denominator);
    this.upBets = new Map<Address, BetInfo>(
      market.up_bets.data.map((bet: any) => [
        bet.creator,
        { amount: bet.amount, timestamp: bet.timestamp },
      ])
    );
    this.downBets = new Map<Address, BetInfo>(
      market.down_bets.data.map((bet: any) => [
        bet.creator,
        { amount: bet.amount, timestamp: bet.timestamp },
      ])
    );
    this.userVotes = new Map(
      market.user_votes.data.map((vote: any) => [vote.creator, vote.vote])
    );
    this.upVotesSum = Number(market.up_votes_sum);
    this.downVotesSum = Number(market.down_votes_sum);

    this.name = `${this.priceDelta > 0 ? this.priceDelta : ""}% ${
      this.priceUp ? "Up" : "Down"
    } ${availableMarket.type}/USD by ${DateTime.fromSeconds(
      this.endTime
    ).toLocaleString()}`;
  }

  // Exposed method to manually refresh the Market's attributes
  async refreshAttributes(): Promise<void> {
    await this.initialize({
      address: this.address,
      type: this.tradingPair.one,
    });
    console.log("Market attributes updated.");
  }

  // Set up automatic refresh based on interval
  private setupAutoRefresh(interval: number): void {
    this.fetchIntervalId = setInterval(() => {
      this.refreshAttributes().catch((err) =>
        console.error("Error refreshing market:", err)
      );
    }, interval);

    console.log(`Market will refresh every ${interval} ms.`);
  }

  // Stop the auto-refresh if needed
  stopAutoRefresh(): void {
    if (this.fetchIntervalId) {
      clearInterval(this.fetchIntervalId);
      this.fetchIntervalId = null;
      console.log("Auto-refresh stopped.");
    }
  }

  calculateOdds(): { oddsUp: string; oddsDown: string } {
    const totalSum = this.upBetsSum + this.downBetsSum;

    // Check if there are any bets
    if (totalSum === 0) {
      throw new Error("There are no bets yet.");
    }

    // Probability for Up and Down
    const probabilityUp = this.upBetsSum / totalSum;
    const probabilityDown = this.downBetsSum / totalSum;

    // Calculate odds (1 / probability)
    const oddsUp = 1 / probabilityUp;
    const oddsDown = 1 / probabilityDown;

    // Return results, rounded to 2 decimal places
    return {
      oddsUp: oddsUp.toFixed(2),
      oddsDown: oddsDown.toFixed(2),
    };
  }
}
