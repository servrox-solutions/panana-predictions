import { getEventMarketRessource } from "./get-event-market-ressource";

import { calculateWinFactors } from "./utils";
import { AvailableMarket } from './get-available-markets';
import { EventMarketData, Address, EventMarketType } from './types/market';

export const initializeEventMarket = async (
  availableMarket: AvailableMarket<EventMarketType>
): Promise<EventMarketData> => {
  const market = await getEventMarketRessource(availableMarket);

  const creator = market.creator as Address;
  const createdAt = Number(market.created_at_timestamp);
  const minBet = Number(market.min_bet);
  const fee = Number(market.fee.numerator) / Number(market.fee.denominator);
  const resolvedAt = market.resolved_at.vec.length
    ? Number(market.resolved_at.vec[0])
    : undefined;
  const acceptedAt = market.accepted_or_rejected_at.vec.length
    ? Number(market.accepted_or_rejected_at.vec[0])
    : undefined;
  const winningAnswerIdx = market.winning_answer_idx.vec.length
    ? Number(market.winning_answer_idx.vec[0])
    : undefined;

  const totalBets = market.total_bets.map(Number);

  const userVotes = new Map<Address, any>(
    market.user_votes.data.map((vote) => [vote.key as Address, vote.value])
  );

  const upVotesSum = Number(market.up_votes_sum);
  const downVotesSum = Number(market.down_votes_sum);

  const name = `Event: ${market.question}`;

  const accepted = market.accepted.vec?.length > 0 ? market.accepted.vec[0] : undefined;
  const rejectionReason: string = market.rejection_reason.vec?.length > 0 ? market.rejection_reason.vec[0] : undefined;

  const question = market.question;

  const distribution = calculateWinFactors(market.total_bets.map(x => +x));

  const newMarketData: EventMarketData = {
    name,
    answers: market.answers,
    address: availableMarket.address,
    question,
    creator,
    createdAt,
    minBet,
    fee,
    userVotes,
    upVotesSum,
    downVotesSum,
    distribution,
    resolvedAt,
    acceptedAt,
    winningAnswerIdx,
    totalBets,
    accepted,
    rejectionReason,
    rules: market.rules,
    category: availableMarket.type,
  };

  return newMarketData;
};
