import { getPricePercentageChange } from "@/lib/get-price-percentage-change";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { tradingPair, createdAt, startTime, endTime } = await request.json();

  const priceChangePhaseOne = await getPricePercentageChange(
    `${tradingPair}USDT`,
    createdAt * 1000,
    startTime * 1000
  );

  const priceChangePhaseTwo = await getPricePercentageChange(
    `${tradingPair}USDT`,
    startTime * 1000,
    endTime * 1000
  );

  return NextResponse.json({
    priceChangePhaseOne,
    priceChangePhaseTwo,
  });
}
