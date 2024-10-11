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
import { TruncatedText } from "../truncated-text";
import { MarketOld } from "../../lib/types/market";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import { MODULE_ADDRESS_FROM_ABI, aptos } from "@/lib/aptos";
import { createEntryPayload } from "@thalalabs/surf";
import { ABI as MarketAbi } from "@/lib/market-abi";

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

export function MarketCardOld({ market }: { market: MarketOld }) {
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

  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now() / 1000);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(timer);
  }, []);

  // Wallet and transaction handling
  const { account, signAndSubmitTransaction } = useWallet();

  // Define the Zod schema for form validation
  const betSchema = z.object({
    betDirection: z.enum(["up", "down"], {
      required_error: "Please select a bet direction",
    }),
    betAmount: z
      .string()
      .min(1, "Bet amount is required")
      .refine((val) => !isNaN(Number(val)), "Bet amount must be a number")
      .transform((val) => Number(val))
      .refine(
        (val) => val >= min_bet,
        `Bet amount must be at least ${min_bet}`
      ),
  });

  type BetFormValues = z.infer<typeof betSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BetFormValues>({
    resolver: zodResolver(betSchema),
  });

  const handleBet = async (data: BetFormValues) => {
    setMessage(null);

    if (!account) {
      setMessage("Please connect your wallet!");
      return;
    }

    setIsPending(true);

    try {
      const moduleAddress =
        MODULE_ADDRESS_FROM_ABI;

      const payload = createEntryPayload(MarketAbi, {
        function: "place_bet",
        typeArguments: [`${moduleAddress}::switchboard_asset::APT`],
        functionArguments: [
          `0xbc8ac73627b1be317b44fdd6bd8025b5a974dc9d45d43ae7c2e0de2790657f32`,
          data.betDirection === "up",
          data.betAmount.toString(),
        ],
      });

      const transactionResponse = await signAndSubmitTransaction({
        sender: account.address,
        data: payload,
      });

      console.log("🍧", transactionResponse);

      const committedTransactionResponse = await aptos.waitForTransaction(
        transactionResponse.hash
      );

      console.log("🍧", committedTransactionResponse);

      setMessage(`Transaction submitted! Hash: ${transactionResponse.hash}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setMessage(`Failed to place bet: ${error.message}`);
    } finally {
      setIsPending(false);
    }
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
          {/* Existing market details */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
              Start Price
            </span>
            <span className="text-muted-foreground block">
              <TruncatedText text={start_price.toString()} maxLength={15} />
            </span>
          </div>
          {/* Start Time */}
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
          {/* End Time */}
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
          {/* Minimum Bet */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
              Minimum Bet
            </span>
            <span className="text-muted-foreground block">{min_bet}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {/* Up Bets Sum */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              Up Bets Sum:
            </span>
            <span className="text-muted-foreground">{up_bets_sum}</span>
          </div>
          {/* Down Bets Sum */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              Down Bets Sum:
            </span>
            <span className="text-muted-foreground">{down_bets_sum}</span>
          </div>
          {/* Up Betters */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-1" />
              Up Betters:
            </span>
            <span className="text-muted-foreground">{up_bets.size}</span>
          </div>
          {/* Down Betters */}
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-1" />
              Down Betters:
            </span>
            <span className="text-muted-foreground">{down_bets.size}</span>
          </div>
        </div>
        {/* Betting Form */}
        <form onSubmit={handleSubmit(handleBet)} className="space-y-4">
          <div className="flex items-center space-x-4">
            {/* Bet Direction */}
            <div className="flex items-center justify-between">
              <Label>Bet Direction</Label>
              <Controller
                name="betDirection"
                control={control}
                defaultValue={undefined}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="up" id={`up-${key}`} />
                      <Label
                        htmlFor={`up-${key}`}
                        className="flex items-center"
                      >
                        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                        Up
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="down" id={`down-${key}`} />
                      <Label
                        htmlFor={`down-${key}`}
                        className="flex items-center"
                      >
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                        Down
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            {errors.betDirection && (
              <p className="text-red-500 text-sm">
                {errors.betDirection.message}
              </p>
            )}
            {/* Bet Amount */}
            <div className="space-y-2 flex-1">
              <Label htmlFor={`betAmount-${key}`}>Bet Amount</Label>
              <Input
                id={`betAmount-${key}`}
                type="number"
                min={min_bet}
                step="1"
                {...register("betAmount")}
              />
              {errors.betAmount && (
                <p className="text-red-500 text-sm">
                  {errors.betAmount.message}
                </p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Placing Bet..." : "Place Bet"}
          </Button>
        </form>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}
