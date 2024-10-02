"use client";

import { MoonPayBuyWidget } from "@moonpay/moonpay-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export const MoonPayBuyWidgetButton = ({
  className,
}: {
  className?: string;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <MoonPayBuyWidget
        variant="overlay"
        baseCurrencyCode="usd"
        baseCurrencyAmount="100"
        defaultCurrencyCode="apt"
        visible={visible}
      />
      <Button
        onClick={() => setVisible(!visible)}
        className={cn("", className)}
      >
        <Coins className="mr-2 h-4 w-4" /> Open MoonPay
      </Button>
    </>
  );
};
