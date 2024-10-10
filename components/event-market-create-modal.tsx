"use client";

import { Banana, Trash } from "lucide-react";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
} from "./ui/animated-modal";

import { Button } from "./ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormMessage, Form } from "./ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Input } from "./ui/input";
import { AvailableMarketplace } from "@/lib/get-available-marketplaces";
import { toast } from "react-toastify";
import { useCallback, useMemo, useState } from "react";
import { creatEventMarket } from '@/lib/create-event-market';
import { Textarea } from './ui/textarea';

export interface EventMarketCreateModalProps {
  marketplaces: AvailableMarketplace[];
  onMarketCreated?: () => void;
}


export function EventMarketCreateModal({
  marketplaces,
  onMarketCreated,
}: EventMarketCreateModalProps) {
  const { account, signAndSubmitTransaction } = useWallet();

  const FormSchema = z.object({
    eventType: z.string(),
    question: z.string().min(10, 'Question must be at least 10 characters.'),
    rules: z.string().min(100, 'Rules must be at least 100 characters.'),
    answers: z.array(z.object({
      value: z.string().min(2, 'Anser must be at least 2 characters.')
    })).min(2, 'Must provide at least 2 answers.').max(6, 'Must provide max 6 answers.'),
    minBet: z.coerce.number().gte(0.01, {
      message: `Minimal bet is ${Number(0.01).toLocaleString()}`,
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      eventType: marketplaces?.[0]?.typeArgument ?? 'Sports', // use first marketplace as default
      question: undefined,
      rules: undefined,
      answers: [{ value: '' }, { value: '' }],
      minBet: 0.01,
    },
  });


  // useFieldArray for managing dynamic array fields
  const answersArray = useFieldArray<any, 'answers'>({
    control: form.control,
    name: 'answers',
  });

  const eventTypes = useMemo(
    () =>
      marketplaces.map((marketplace) => ({
        label: marketplace.typeArgument.split("::").pop()!,
        value: marketplace.typeArgument,
      })),
    [marketplaces]
  );

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!account) return;

    const res = await creatEventMarket(account, signAndSubmitTransaction, {
      type: data.eventType as `${string}::${string}::${string}`,
      marketplace: marketplaces.find((x) => x.typeArgument === data.eventType)!
        .address,
      answers: data.answers.map(answer => answer.value),
      rules: data.rules,
      question: data.question,
      minBet: data.minBet * 10 ** 9,
    });
    console.log(res);

    onMarketCreated?.();

    window.location.reload(); // TODO: fix this
  };

  const handleEventChange = useCallback(
    (eventType: string) => {
      form.setValue("eventType", eventType);
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

  const scrollIntoView = useCallback(() => {
    // need to postpone the scroll to next render since the element is not found until the popover was rendered.
    setTimeout(() => {
      const el = document.getElementById(form.getValues("eventType"));
      el?.scrollIntoView({ block: "center" });
    }, 0);
  }, []);

  const addAnswer = () => {
    if (answersArray.fields.length <= 5) {
      answersArray.append({ value: '' });
      return;
    }
    toast.info('Maximum 6 answers possible.');
  }

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
              <form onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6">
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem className={`flex flex-col`}>
                      <FormLabel>Category</FormLabel>
                      <div className="max-w-full overflow-auto">
                        <div className="flex gap-5">
                          {eventTypes.map((asset) => (
                            <Button
                              type="button"
                              variant="outline"
                              key={asset.value}
                              id={asset.value}
                              className={`${field.value === asset.value
                                ? "bg-primary text-secondary"
                                : ""
                                }`}
                              onClick={() => handleEventChange(asset.value)}
                            >
                              {asset.label}
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
                  name="question"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Question</FormLabel>
                      <Input {...form.register(`question`)} placeholder="Ask the market's question." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rules"
                  render={() => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Rules</FormLabel>
                      <Textarea {...form.register(`rules`)} placeholder="Describe the market and especially the ressources taken into account to resolve the market." />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {
                    answersArray.fields.map((answer, idx) => (
                      <FormField
                        key={answer.id}
                        control={form.control}
                        name="answers"
                        render={() => (
                          <FormItem className="flex flex-col">
                            <div className="flex">
                              <Input {...form.register(`answers.${idx}.value`)} placeholder={`Answer ${idx + 1}`} className="rounded-r-none" />
                              <Button type='button' size='icon' className="rounded-l-none" disabled={idx < 2 && answersArray.fields.length <= 2} onClick={() => answersArray.remove(idx)}>
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))
                  }
                </div>
                <Button type='button' onClick={() => addAnswer()}>Add Answer</Button>
                <Button type='submit'>Create Market</Button>
              </form>
            </Form>
          </ModalContent>
          {/* <ModalFooter className="gap-4 flex flex-col">
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
          </ModalFooter> */}
        </ModalBody>
      </Modal>
    </>
  );
}
