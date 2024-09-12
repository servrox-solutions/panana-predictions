"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock, DollarSign, ArrowUp, ArrowDown, Users } from "lucide-react";
import { TruncatedText } from "./truncated-text";
import { Market } from "./types/market";

function formatDuration(seconds: number): string {
  const absSeconds = Math.abs(seconds);
  const days = Math.floor(absSeconds / 86400);
  const hours = Math.floor((absSeconds % 86400) / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const remainingSeconds = Math.floor(absSeconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0)
    parts.push(`${remainingSeconds}s`);

  return parts.join(" ");
}

export function MarketCard({ market }: { market: Market }) {
  const {
    key,
    tradingPair,
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
  const [now, setNow] = useState(Date.now() / 1000);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(timer);
  }, []);

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
    setMessage(`Placed a ${betDirection} bet of ${betAmount} on market ${key}`);
  };

  const startDiff = start_time - now;
  const endDiff = end_time - now;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Market: {key}</span>
          <span className="text-lg font-semibold bg-primary text-primary-foreground px-2 py-1 rounded">
            {tradingPair}
          </span>
        </CardTitle>
        <CardDescription>
          Market details and betting information
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
              Start Price
            </span>
            <span className="text-muted-foreground block">
              <TruncatedText text={start_price.toString()} maxLength={15} />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              Start
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <span className="text-muted-foreground block cursor-help underline decoration-dotted">
                  {startDiff > 0
                    ? `In ${formatDuration(startDiff)}`
                    : `${formatDuration(startDiff)} ago`}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                {new Date(start_time * 1000).toLocaleString()}
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              End
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <span className="text-muted-foreground block cursor-help underline decoration-dotted">
                  {endDiff > 0
                    ? `In ${formatDuration(endDiff)}`
                    : `${formatDuration(endDiff)} ago`}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                {new Date(end_time * 1000).toLocaleString()}
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
              Minimum Bet
            </span>
            <span className="text-muted-foreground block">{min_bet}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              Up Bets Sum:
            </span>
            <span className="text-muted-foreground">{up_bets_sum}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              Down Bets Sum:
            </span>
            <span className="text-muted-foreground">{down_bets_sum}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-1" />
              Up Betters:
            </span>
            <span className="text-muted-foreground">{up_bets.size}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-1" />
              Down Betters:
            </span>
            <span className="text-muted-foreground">{down_bets.size}</span>
          </div>
        </div>
        <form onSubmit={handleBet} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-between">
              <Label>Bet Direction</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setBetDirection(value as "up" | "down")
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="up" id={`up-${key}`} />
                  <Label htmlFor={`up-${key}`} className="flex items-center">
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    Up
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="down" id={`down-${key}`} />
                  <Label htmlFor={`down-${key}`} className="flex items-center">
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    Down
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor={`betAmount-${key}`}>Bet Amount</Label>
              <Input
                id={`betAmount-${key}`}
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
