import { Spot } from "@theothergothamdev/mexc-sdk";

const apiKey = "mx0vgl27jh4DraY03X";
const apiSecret = "d4204383b98e4da4801109590e4a1bd2";

const client = new Spot(apiKey, apiSecret);

function chooseBestInterval(startTime: number, endTime: number): string {
  const timeDifference = endTime - startTime;
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;
  const oneWeek = 7 * oneDay;

  if (timeDifference <= 1 * oneHour) {
    return "1m";
  } else if (timeDifference <= 4 * oneHour) {
    return "5m";
  } else if (timeDifference <= 12 * oneHour) {
    return "15m";
  } else if (timeDifference <= 1 * oneDay) {
    return "30m";
  } else if (timeDifference <= 3 * oneDay) {
    return "4h";
  } else if (timeDifference <= 7 * oneDay) {
    return "8h";
  } else if (timeDifference <= oneWeek) {
    return "1d";
  } else if (timeDifference <= 4 * oneWeek) {
    return "1W";
  } else {
    return "1M";
  }
}

export async function getPricePercentageChange(
  symbol: string,
  startTime: number,
  endTime: number
): Promise<number | null> {
  try {
    const interval = chooseBestInterval(startTime, endTime);
    const data = await client.klines(symbol, interval, {
      startTime: startTime,
      endTime: endTime,
    });

    if (data.length === 0) return null;

    const firstCandle = data[0];
    const lastCandle = data[data.length - 1];

    const openPrice = parseFloat(firstCandle[1]);
    const closePrice = parseFloat(lastCandle[4]);

    const percentageChange = ((closePrice - openPrice) / openPrice) * 100;

    return percentageChange;
  } catch (error) {
    console.error("Error fetching klines from mexc:", error);
    return null;
  }
}
