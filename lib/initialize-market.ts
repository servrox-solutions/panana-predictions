import { DateTime } from "luxon";
import { getMarketRessource } from "./get-market-ressource";
import { AvailableMarket } from "./get-available-markets";
import { calculateWinFactors } from "./utils";
import { Address, MarketData, MarketType } from "@/lib/types/market";

export const initializeMarket = async (
  availableMarket: AvailableMarket<MarketType>
): Promise<MarketData> => {
  const market = await getMarketRessource(availableMarket);

  const creator = market.creator as Address;
  const createdAt = Number(market.created_at_timestamp);
  const startPrice = Number(market.start_price.vec[0]);
  const startTime = Number(market.start_time);
  const endTime = Number(market.end_time);
  const minBet = Number(market.min_bet);
  const upBetsSum = Number(market.up_bets_sum);
  const downBetsSum = Number(market.down_bets_sum);
  const fee = Number(market.fee.numerator) / Number(market.fee.denominator);
  const resolvedAt = market.resolved_at.vec[0]
    ? Number(market.resolved_at.vec[0])
    : null;
  const endPrice = market.end_price.vec[0]
    ? Number(market.end_price.vec[0])
    : null;

  const upBets = new Map<Address, number>(
    market.up_bets.data.map((bet) => [bet.key as Address, Number(bet.value)])
  );
  const downBets = new Map<Address, number>(
    market.down_bets.data.map((bet) => [bet.key as Address, Number(bet.value)])
  );

  const userVotes = new Map<Address, boolean>(
    market.user_votes.data.map((vote) => [vote.key as Address, vote.value])
  );

  const upVotesSum = Number(market.up_votes_sum);
  const downVotesSum = Number(market.down_votes_sum);

  const name = `${
    availableMarket.type
  }/USD by ${DateTime.fromSeconds(endTime).toLocaleString()}`;

  const tradingPair = {
    one: availableMarket.type,
    two: "USD",
  };

  const [upWinFactor, downWinFactor] = calculateWinFactors([
    upBetsSum,
    downBetsSum
  ]);

  const newMarketData: MarketData = {
    name,
    address: availableMarket.address,
    tradingPair,
    creator,
    createdAt,
    startPrice,
    startTime,
    endTime,
    minBet,
    upBetsSum,
    downBetsSum,
    fee,
    upBets,
    downBets,
    userVotes,
    upVotesSum,
    downVotesSum,
    upWinFactor,
    downWinFactor,
    resolvedAt,
    endPrice,
  };

  return newMarketData;
};
