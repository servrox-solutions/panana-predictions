"use client";

import { Banana, Lock, PartyPopper } from "lucide-react";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
} from "../ui/animated-modal";

import { DatePicker } from "../ui/date-picker";
import { DateTime, Duration } from "luxon";
import { Button } from "../ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormMessage, Form } from "../ui/form";
import { useForm } from "react-hook-form";
import { createMarket } from "@/lib/create-market";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS_FROM_ABI, aptToOctas } from "@/lib/aptos";
import { Input } from "../ui/input";
import { AvailableMarketplace } from "@/lib/get-available-marketplaces";
import { toast } from "react-toastify";
import { useCallback, useMemo } from "react";

export interface MarketCreateModalProps {
  marketplaces: AvailableMarketplace[];
  onMarketCreated?: () => void;
}

function getEarliestStartDate(): DateTime {
  const now = DateTime.now();
  return now
    .plus({ hours: 1, minutes: 15 - (now.minute % 15) })
    .set({ second: 0, millisecond: 0 });
}

export function MarketCreateModal({
  marketplaces,
  onMarketCreated,
}: MarketCreateModalProps) {
  const { account, signAndSubmitTransaction } = useWallet();

  const FormSchema = z.object({
    asset: z.string().min(1, {
      message: "Asset cannot be empty.",
    }),
    startTime: z.date().refine(
      (date) => {
        return (
          DateTime.fromJSDate(date)
            .diff(getEarliestStartDate())
            .as("seconds") >= 0
        );
      },
      {
        message: `Earliest start is ${getEarliestStartDate().toLocaleString(
          DateTime.DATETIME_MED
        )}`,
      }
    ),
    durationSeconds: z.number().gt(0, {
      message: "Duration must be set",
    }),
    minBet: z.coerce.number().gte(0.01, {
      message: `Minimal bet is ${Number(0.01).toLocaleString()}`,
    }),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      asset: marketplaces?.[0]?.typeArgument ?? 'APT', // use first marketplace as default
      startTime: undefined,
      durationSeconds: undefined,
      minBet: 0.01,
    },
  });

  const durations = useMemo(
    () => [
      Duration.fromObject({ minute: 15 }),
      Duration.fromObject({ minute: 30 }),
      Duration.fromObject({ minute: 45 }),
      Duration.fromObject({ hour: 1 }),
      Duration.fromObject({ hour: 2 }),
      Duration.fromObject({ hour: 4 }),
      Duration.fromObject({ hour: 6 }),
      Duration.fromObject({ hour: 12 }),
      Duration.fromObject({ day: 1 }),
      Duration.fromObject({ day: 3 }),
      Duration.fromObject({ day: 7 }),
      Duration.fromObject({ day: 14 }),
      Duration.fromObject({ month: 1 }),
      Duration.fromObject({ month: 3 }),
      Duration.fromObject({ month: 6 }),
      Duration.fromObject({ year: 1 }),
    ],
    []
  );

  const assets = useMemo(
    () =>
      marketplaces.map((marketplace) => ({
        label: marketplace.typeArgument.split("::").pop()!,
        value: marketplace.typeArgument,
      })),
    [marketplaces]
  );

  const formatDuration = useCallback((duration: Duration) => {
    // Switch case to format based on the unit
    switch (Object.keys(duration.toObject())[0]) {
      case "minutes":
        return duration.toFormat("m 'min'");
      case "hours":
        return duration.toFormat("h 'h'");
      case "days":
        return duration.toFormat("d 'd'");
      case "months":
        return duration.toFormat("M 'mo'");
      case "years":
        return duration.toFormat("y 'y'");
      default:
        return "Invalid duration unit";
    }
  }, []);

  const scrollIntoView = useCallback(() => {
    // need to postpone the scroll to next render since the element is not found until the popover was rendered.
    setTimeout(() => {
      const el = document.getElementById(
        "" + form.getValues("durationSeconds")
      );
      const el2 = document.getElementById(form.getValues("asset"));
      el?.scrollIntoView({ block: "center" });
      el2?.scrollIntoView({ block: "center" });
    }, 0);
  }, []);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!account) {
      // TODO: handle user not logged in
      return;
    }
    console.log(MODULE_ADDRESS_FROM_ABI);
    const startTime = DateTime.fromJSDate(data.startTime);
    const endTime = startTime.plus({ seconds: data.durationSeconds });
    const res = await createMarket(account, signAndSubmitTransaction, {
      type: data.asset as `${string}::${string}::${string}`,
      marketplace: marketplaces.find((x) => x.typeArgument === data.asset)!
        .address,
      startTimeTimestampSeconds: Math.floor(startTime.toSeconds()),
      endTimeTimestampSeconds: Math.floor(endTime.toSeconds()),
      minBet: aptToOctas(data.minBet),
    });
    console.log(res);

    onMarketCreated?.();

    window.location.reload(); // TODO: fix this
  };

  const handleAssetChange = useCallback(
    (assetValue: string) => {
      form.setValue("asset", assetValue);
    },
    [form]
  );

  const handleDurationChange = useCallback(
    (durationValue: number) => {
      form.setValue("durationSeconds", durationValue);
      form.trigger("durationSeconds");
    },
    [form]
  );

  const handleDateChange = useCallback(
    (date?: DateTime) => {
      if (form.getValues().startTime === date?.toJSDate()) {
        return;
      }
      date && form.setValue("startTime", date.toJSDate());
      console.log("start Time trigger");
      form.trigger("startTime");
    },
    [form]
  );

  const handleModalTriggerClick = useCallback(
    (open: () => void) => {
      if (!account?.address) {
        toast.info("Please connect your wallet first.");
        return;
      }
      open();
    },
    [account]
  );

  // Memoizing the initialDate calculation
  const initialDate = useMemo(() => {
    const startTime = form.getValues("startTime");
    return startTime ? DateTime.fromJSDate(startTime) : undefined;
  }, [form.getValues("startTime")]);

  return (
    <>
      <Modal>
        <ModalTrigger
          className="h-8 flex justify-center"
          onClick={(evt, open) => handleModalTriggerClick(open)}
        >
          <div
            onClick={() => scrollIntoView()}
            className="flex items-center gap-1 text-font-primary dark:text-secondary"
          >
            <Banana className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create Market
            </span>
          </div>
        </ModalTrigger>

        <ModalBody
          closeOnClickOutside={false}
          className="bg-popover rounded-3xl shadow-lg border border-white border-opacity-20"
        >
          <ModalContent className="overflow-auto flex flex-col gap-4 ">
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-4">
              Create a New Market
            </h4>
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="asset"
                  render={({ field }) => (
                    <FormItem className={`flex flex-col`}>
                      <FormLabel>Asset</FormLabel>
                      <div className="max-w-full overflow-auto">
                        <div className="flex gap-5">
                          {assets.map((asset) => (
                            <Button
                              type="button"
                              variant="outline"
                              key={asset.value}
                              id={asset.value}
                              className={`${field.value === asset.value
                                ? "bg-primary text-secondary"
                                : ""
                                }`}
                              onClick={() => handleAssetChange(asset.value)}
                            >
                              {asset.label}/USD
                            </Button>
                          ))}
                        </div>
                      </div>
                      {/* <FormDescription>
                                                Bet on the change of this asset pair.
                                            </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={() => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start</FormLabel>
                      <DatePicker
                        initialDate={initialDate} // Use memoized initialDate
                        onDateChange={handleDateChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationSeconds"
                  render={({ field }) => (
                    <FormItem className={`flex flex-col`}>
                      <FormLabel>Duration</FormLabel>
                      <div className="max-w-full overflow-auto">
                        <div className="grid grid-cols-8 grid-rows-2 min-w-[200%] lg:min-w-full grid-flow-col max-h-[140px] lg:max-h-[400px] gap-2 place-items-center ">
                          {durations.map((i) => (
                            <Button
                              type="button"
                              variant="outline"
                              key={i.as("seconds")}
                              id={`${i.as("seconds")}`}
                              className={`w-full ${field.value === i.as("seconds")
                                ? "bg-primary text-secondary hover:bg-primary hover:text-secondary"
                                : ""
                                }`}
                              onClick={() =>
                                handleDurationChange(i.as("seconds"))
                              }
                            >
                              {formatDuration(i)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {/* <FormDescription>
                                                No bets can be placed for the given duration.
                                            </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minBet"
                  render={({ field }) => (
                    <FormItem className={`flex flex-col`}>
                      <FormLabel>Min Bet (APT)</FormLabel>
                      <div className="max-w-full overflow-auto">
                        <Input type="number" step="0.01" {...field} />
                      </div>
                      {/* <FormDescription>
                                                No bets can be placed for the given duration.
                                            </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ModalContent>
          <ModalFooter className="gap-4 flex flex-col">
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid grid-cols-2 lg:grid-cols-3">
                  <div className="items-center hidden lg:flex">
                    <Banana className="h-4 w-4 mx-4" />
                    <div className="flex flex-col">
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                        Start betting:
                      </span>
                      <span>Now</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mx-4" />
                    <div className="flex flex-col">
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                        End betting:
                      </span>
                      <span>
                        {form.getValues("startTime")
                          ? DateTime.fromJSDate(
                            form.getValues("startTime")!
                          ).toLocaleString(DateTime.DATETIME_SHORT)
                          : "tbd."}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <PartyPopper className="h-4 w-4 mx-4" />
                    <div className="flex flex-col">
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                        Market resolution:
                      </span>
                      <span>
                        {form.getValues("durationSeconds") &&
                          form.getValues("startTime")
                          ? DateTime.fromJSDate(form.getValues("startTime"))
                            .plus({
                              second: form.getValues("durationSeconds"),
                            })
                            ?.toLocaleString(DateTime.DATETIME_SHORT)
                          : "tbd."}
                      </span>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  <Banana className="w-4 h-4 mx-2" />
                  Create Market
                </Button>
              </form>
            </Form>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </>
  );
}
