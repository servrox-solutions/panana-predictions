import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export interface DepositBetProps {
  defaultValue?: number;
  onChangeAmount: (amount: number) => void;
  currency?: string;
}

export default function DepositBet({
  defaultValue = 0,
  onChangeAmount,
  currency = "$",
}: DepositBetProps) {
  const [amount, setAmount] = useState(defaultValue);

  const handleIncrement = useCallback((value: number) => {
    setAmount((prev) => Math.min(prev + value, 100));
  }, []);

  const handleSliderChange = useCallback((value: number[]) => {
    setAmount(value[0]);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value.replace(/[^0-9.]/g, ""));
      setAmount(Math.min(value, 100));
    },
    []
  );

  useEffect(() => {
    onChangeAmount(amount);
  }, [amount, onChangeAmount]);

  const sliderValue = useMemo(() => [amount], [amount]);

  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <div className="absolute text-xs left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {currency}
        </div>
        <Input
          type="text"
          inputMode="decimal"
          value={amount.toFixed(2)}
          step={0.01}
          onChange={handleInputChange}
          className="w-full pl-10 pr-20 bg-gray-800 text-white border-gray-700 focus:border-blue-500"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
          <Button
            onClick={() => handleIncrement(0.1)}
            variant="ghost"
            className="h-6 px-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700"
          >
            +0.1
          </Button>
          <Button
            onClick={() => handleIncrement(1)}
            variant="ghost"
            className="h-6 px-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700"
          >
            +1
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          max={10}
          step={0.01}
          className="w-full "
        />
      </div>
    </div>
  );
}
