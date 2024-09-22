import { DateTime } from "luxon";
import { getAccountBalance } from "./get-account-balance";
import { getMarketRessource } from "./get-market-ressource";
import { AvailableMarket } from "./get-available-markets";
import { calculateOdds } from "./utils";
import { Address, BetInfo, MarketData } from "@/lib/types/market";

export const initializeMarket = async (
  availableMarket: AvailableMarket
): Promise<MarketData> => {
  const market = await getMarketRessource(availableMarket);
  const pool = await getAccountBalance(availableMarket.address);

  const creator = market.creator as Address;
  const startPrice = Number(market.start_price);
  const startTime = Number(market.start_time);
  const endTime = Number(market.end_time);
  const minBet = Number(market.min_bet);
  const upBetsSum = Number(market.up_bets_sum);
  const downBetsSum = Number(market.down_bets_sum);
  const fee = Number(market.fee.numerator) / Number(market.fee.denominator);
  const priceUp =
    market.price_up.vec[0] === "true"
      ? true
      : market.price_up.vec[0] === "false"
      ? false
      : null;
  const priceDelta =
    Number(market.price_delta.numerator) /
    Number(market.price_delta.denominator);
  const upBets = new Map<Address, BetInfo>(
    market.up_bets.data.map((bet: any) => [
      bet.creator,
      { amount: bet.amount, timestamp: bet.timestamp },
    ])
  );
  const downBets = new Map<Address, BetInfo>(
    market.down_bets.data.map((bet: any) => [
      bet.creator,
      { amount: bet.amount, timestamp: bet.timestamp },
    ])
  );
  const userVotes = new Map(
    market.user_votes.data.map((vote: any) => [vote.creator, vote.vote])
  );
  const upVotesSum = Number(market.up_votes_sum);
  const downVotesSum = Number(market.down_votes_sum);

  const name = `${priceDelta > 0 ? priceDelta : ""}% ${
    priceUp ? "Up" : "Down"
  } ${availableMarket.type}/USD by ${DateTime.fromSeconds(
    endTime
  ).toLocaleString()}`;

  const tradingPair = {
    one: availableMarket.type,
    two: "USD",
  };

  const { oddsUp, oddsDown } = calculateOdds(upBetsSum, downBetsSum);

  const newMarketData: MarketData = {
    name,
    address: availableMarket.address,
    tradingPair,
    creator,
    startPrice,
    startTime,
    endTime,
    minBet,
    upBetsSum,
    downBetsSum,
    fee,
    pool,
    priceUp,
    priceDelta,
    upBets,
    downBets,
    userVotes,
    upVotesSum,
    downVotesSum,
    oddsUp,
    oddsDown,
  };

  return newMarketData;
};
