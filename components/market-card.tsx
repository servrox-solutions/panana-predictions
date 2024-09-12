"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, DollarSign, ArrowUp, ArrowDown, Users } from "lucide-react";

interface BetInfo {
  amount: number;
  timestamp: number;
}

interface Market {
  key: string;
  store: {
    start_price: bigint;
    start_time: number;
    end_time: number;
    min_bet: number;
    up_bets_sum: number;
    down_bets_sum: number;
    up_bets: Map<string, BetInfo>;
    down_bets: Map<string, BetInfo>;
  };
}

const defaultMarket: Market = {
  key: "SAMPLE_MARKET_001",
  store: {
    start_price: BigInt("1000000000000000000"),
    start_time: Date.now() / 1000 - 3600, // 1 hour ago
    end_time: Date.now() / 1000 + 3600, // 1 hour from now
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
};

export default function MarketComponent({
  market = defaultMarket,
}: {
  market?: Market;
}) {
  const {
    key,
    store: {
      start_price,
      start_time,
      end_time,
      min_bet,
      up_bets_sum,
      down_bets_sum,
      up_bets,
      down_bets,
    },
  } = market;

  const [betDirection, setBetDirection] = useState<"up" | "down" | null>(null);
  const [betAmount, setBetAmount] = useState<number>(min_bet);
  const [message, setMessage] = useState<string | null>(null);

  const handleBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!betDirection) {
      setMessage("Please select a bet direction");
      return;
    }
    if (betAmount < min_bet) {
      setMessage(`Bet amount must be at least ${min_bet}`);
      return;
    }
    setMessage(`Placed a ${betDirection} bet of ${betAmount}`);
    // Here you would typically call an API to place the bet
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Market: {key}</CardTitle>
        <CardDescription>
          Market details and betting information
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Start Price:</span>
            <span className="text-sm text-muted-foreground">
              {start_price.toString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Start Time:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(start_time * 1000).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">End Time:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(end_time * 1000).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Minimum Bet:</span>
            <span className="text-sm text-muted-foreground">{min_bet}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Up Bets Sum:</span>
              <span className="text-sm text-muted-foreground">
                {up_bets_sum}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Up Betters:</span>
              <span className="text-sm text-muted-foreground">
                {up_bets.size}
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <ArrowDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Down Bets Sum:</span>
              <span className="text-sm text-muted-foreground">
                {down_bets_sum}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Down Betters:</span>
              <span className="text-sm text-muted-foreground">
                {down_bets.size}
              </span>
            </div>
          </div>
        </div>
        <form onSubmit={handleBet} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Label>Bet Direction</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setBetDirection(value as "up" | "down")
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="up" id="up" />
                  <Label htmlFor="up" className="flex items-center">
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    Up
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="down" id="down" />
                  <Label htmlFor="down" className="flex items-center">
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    Down
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="betAmount">Bet Amount</Label>
              <Input
                id="betAmount"
                type="number"
                min={min_bet}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Place Bet
          </Button>
        </form>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}
