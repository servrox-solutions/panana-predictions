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
import { Market } from "./types/market";
import { TruncatedText } from "./truncated-text";

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
              Start Price:
            </span>
            <span className="text-muted-foreground">
              <TruncatedText text={start_price.toString()} maxLength={15} />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              Start Time:
            </span>
            <span className="text-muted-foreground">
              <TruncatedText
                text={new Date(start_time * 1000).toLocaleString()}
                maxLength={20}
              />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              End Time:
            </span>
            <span className="text-muted-foreground">
              <TruncatedText
                text={new Date(end_time * 1000).toLocaleString()}
                maxLength={20}
              />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
              Minimum Bet:
            </span>
            <span className="text-muted-foreground">{min_bet}</span>
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
            <div className="space-y-2">
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
