"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full max-w-[500px] margin-auto absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
      <Card className="flex flex-col justify-center items-center gap-4 m-2">
        <Image
          width="300"
          height="300"
          src="/mr_peeltos.png"
          alt="Mr_Peeltos"
        />
        <h2 className="font-bold text-xl text-center">
          Ups, this should not have happened.
        </h2>
        <Button onClick={() => reset()}>Try again</Button>
      </Card>
    </div>
  );
}
