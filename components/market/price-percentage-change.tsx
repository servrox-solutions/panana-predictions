import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export interface PricePercentageChangeProps {
  tradingPair: string;
  createdAt: number;
  startTime: number;
  endTime: number;
}

export async function PricePercentageChange({
  tradingPair,
  createdAt,
  startTime,
  endTime,
}: PricePercentageChangeProps) {
  const [priceChange, setPriceChange] = useState<{
    priceChangePhaseOne: number;
    priceChangePhaseTwo: number;
  } | null>(null);

  const getPriceChange = async () => {
    const priceChangeResponse = await fetch(
      new URL(
        "/api/market/price-percentage",
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://app.panana-predictions.xyz"
      ),
      {
        method: "POST",
        body: JSON.stringify({
          tradingPair,
          createdAt,
          startTime,
          endTime,
        }),
      }
    );
    const priceChange = await priceChangeResponse.json();
    setPriceChange(priceChange);
  };

  useEffect(() => {
    getPriceChange();
  }, []);

  return (
    <>
      {priceChange && (
        <div className="flex items-center">
          {(() => {
            const changeValue =
              priceChange.priceChangePhaseTwo ??
              priceChange.priceChangePhaseOne;
            const isNegative = changeValue < 0;
            const Icon = isNegative ? TrendingDown : TrendingUp;
            const color = isNegative ? "#ef0b6e" : "#00a291";
            const gradientFrom = isNegative
              ? "from-negative-1"
              : "from-positive-1";
            const gradientTo = isNegative ? "to-negative-2" : "to-positive-2";

            return (
              <>
                <Icon className="w-4 h-4" color={color} />
                <span
                  className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} inline-block text-transparent bg-clip-text text-xs pl-1`}
                >
                  {changeValue.toFixed(2)}%
                </span>
              </>
            );
          })()}
        </div>
      )}
    </>
  );
}
