'use client';
import { Banana } from 'lucide-react';
import { Modal, ModalTrigger, ModalBody, ModalContent, ModalFooter } from './ui/animated-modal';

import { DatePicker } from './ui/date-picker';
import { DateTime, Duration } from 'luxon';
import { Button } from './ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField, FormItem, FormLabel, FormDescription, FormMessage, Form } from './ui/form';
import { useForm } from 'react-hook-form';



export type address = `0x${string}`;

export interface MarketCreateModalProps {
    marketplaces: { [name: string]: address }
}



export function MarketCreateModal() {
    const FormSchema = z.object({
        asset: z.string().min(1, {
            message: "Asset cannot be empty."
        }),
        startTime: z.date().optional(),
        durationSeconds: z.number(),
    })
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            asset: "A::B::APT",
            startTime: undefined,
            durationSeconds: undefined,
        },
    })

    const durations = [
        Duration.fromObject({
            minute: 15,
        }),
        Duration.fromObject({
            minute: 30,
        }),
        Duration.fromObject({
            minute: 45,
        }),
        Duration.fromObject({
            hour: 1,
        }),
        Duration.fromObject({
            hour: 2,
        }),
        Duration.fromObject({
            hour: 4,
        }),
        Duration.fromObject({
            hour: 6,
        }),
        Duration.fromObject({
            hour: 12,
        }),
        Duration.fromObject({
            day: 1,
        }),
        Duration.fromObject({
            day: 3,
        }),
        Duration.fromObject({
            day: 7,
        }),
        Duration.fromObject({
            day: 14,
        }),
        Duration.fromObject({
            month: 1,
        }),
        Duration.fromObject({
            month: 3,
        }),
        Duration.fromObject({
            month: 6,
        }),
        Duration.fromObject({
            year: 1,
        }),
    ];

    const assets = [{
        label: "APT",
        value: "A::B::APT",
    },
    {
        label: "BTC",
        value: "B::C::BTC",
    },
    {
        label: "ETH",
        value: "B::C::ETH",
    },
    {
        label: "SOL",
        value: "B::C::SOL",
    },
    {
        label: "USDC",
        value: "B::C::USDC",
    },
    ];

    function formatDuration(duration: Duration) {
        // Switch case to format based on the unit
        console.log(Object.keys(duration.toObject())[0])
        switch (Object.keys(duration.toObject())[0]) {
            case 'minutes':
                return duration.toFormat("m 'min'");
            case 'hours':
                return duration.toFormat("h 'h'");
            case 'days':
                return duration.toFormat("d 'd'");
            case 'months':
                return duration.toFormat("M 'mo'");
            case 'years':
                return duration.toFormat("y 'y'");
            default:
                return "Invalid duration unit";
        }
    }


    const scrollIntoView = () => {
        // need to postpone the scroll to next render since the element is not found until the popover was rendered.
        setTimeout(() => {
            const el = document.getElementById('' + form.getValues('durationSeconds'));
            const el2 = document.getElementById(form.getValues('asset'));
            el?.scrollIntoView({ block: 'center' });
            el2?.scrollIntoView({ block: 'center' });
        }, 0);
    }


    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data);
    }

    // function getEndDate(date?: Date, durationSeconds?: number): DateTime | null {
    //     if (!date || !durationSeconds) {
    //         return null;
    //     }

    //     return DateTime.fromJSDate(date).plus({ seconds: durationSeconds });
    // }


    return (<>
        <Modal>
            <ModalTrigger className="flex justify-center">
                <div onClick={() => scrollIntoView()}>
                    <Banana className="inline h-5 w-5" /> Create New Market
                </div>
            </ModalTrigger>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <ModalBody closeOnClickOutside={false}>
                        <ModalContent className='bg-[transparent] overflow-auto flex flex-col gap-4'>
                            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                                Create a New Market
                            </h4>


                            <FormField
                                control={form.control}
                                name="asset"
                                render={({ field }) => (
                                    <FormItem className={`flex flex-col`}>
                                        <FormLabel>Asset</FormLabel>
                                        <div className="max-w-full overflow-auto">
                                            <div className="flex gap-5">
                                                {assets.map(asset => (
                                                    <Button variant="outline" key={asset.value} id={asset.value} className={`h-[60px] ${field.value === asset.value ? 'bg-primary text-secondary hover:bg-primary hover:text-secondary' : ''}`} onClick={() => {
                                                        form.setValue("asset", asset.value)
                                                    }}>
                                                        {asset.label}/USD
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <FormDescription>
                                            Bet on the change of this asset pair.
                                        </FormDescription>
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
                                            initialDate={form.getValues("startTime") && DateTime.fromJSDate(form.getValues("startTime")!)}
                                            onDateChange={date => {
                                                console.log('date', date);
                                                form.setValue("startTime", date?.toJSDate());
                                                form.trigger("startTime");
                                            }} />
                                        <FormDescription>
                                            This is the starting date of the market. After this date, no new bets can be placed.
                                        </FormDescription>
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
                                            <div className="grid grid-cols-8 lg:grid-cols-4 grid-rows-2 lg:grid-rows-4 min-w-[200%] lg:min-w-full grid-flow-col max-h-[140px] lg:max-h-[400px] gap-2 place-items-center ">
                                                {durations.map(i => (
                                                    <Button variant="outline" key={i.as('seconds')} id={`${i.as('seconds')}`} className={`w-full h-[60px] ${field.value === i.as('seconds') ? 'bg-primary text-secondary hover:bg-primary hover:text-secondary' : ''}`} onClick={() => {
                                                        form.setValue('durationSeconds', i.as('seconds'));
                                                    }}>
                                                        {formatDuration(i)}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <FormDescription>
                                            No bets can be placed for the given duration.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <div>
                                StartDate:{form.getValues("startTime") && DateTime.fromJSDate(form.getValues("startTime")!).toLocaleString(DateTime.DATETIME_MED) ?? 'tbd.'}
                            </div>
                            <div>
                                EndDate:{getEndDate(form.getValues("startTime"), form.getValues("durationSeconds"))?.toLocaleString(DateTime.DATETIME_MED) ?? 'tbd.'}
                            </div> */}


                            {/* 
                    <div className="flex flex-col justify-center items-center">


                        Min. Bet: <Input type='number' />

                 
                    </div> */}
                            {/* <div className="py-10 flex flex-wrap gap-x-4 gap-y-6 items-start justify-start max-w-sm mx-auto">
                                <div className="flex  items-center justify-center">
                                    <PlaneIcon className="mr-1 text-neutral-700 dark:text-neutral-300 h-4 w-4" />
                                    <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                                        5 connecting flights
                                    </span>
                                </div>
                                <div className="flex items-center justify-center">
                                    
                                    <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                                        12 hotels
                                    </span>
                                </div>
                                <div className="flex items-center justify-center">
                                    
                                    <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                                        69 visiting spots
                                    </span>
                                </div>
                                <div className="flex  items-center justify-center">
                                    
                                    <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                                        Good food everyday
                                    </span>
                                </div>
                                <div className="flex items-center justify-center">
                                    <MicIcon className="mr-1 text-neutral-700 dark:text-neutral-300 h-4 w-4" />
                                    <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                                        Open Mic
                                    </span>
                                </div>
                                <div className="flex items-center justify-center">
                                    
                                    <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                                        Paragliding
                                    </span>
                                </div>
                            </div> */}
                        </ModalContent>
                        <ModalFooter className="gap-4">
                            <button className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
                                Cancel
                            </button>
                            <Button type="submit">Create Market</Button>
                        </ModalFooter>
                    </ModalBody>
                </form>
            </Form>
        </Modal>
    </>
    );
}


{/* <FormField
    control={form.control}
    name="asset"
    render={({ field }) => (
        <FormItem className="flex flex-col">
            <FormLabel>Asset</FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                                "w-[200px] justify-between",
                                !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value
                                ? assets.find(
                                    (asset) => asset.value === field.value
                                )?.label
                                : "Select asset"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandEmpty>No language found.</CommandEmpty>
                            <CommandGroup>
                                {assets.map((asset) => (
                                    <CommandItem
                                        value={asset.label}
                                        key={asset.value}
                                        onSelect={() => {
                                            form.setValue("asset", asset.value)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                asset.value === field.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {asset.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <FormDescription>
                This is the language that will be used in the dashboard.
            </FormDescription>
            <FormMessage />
        </FormItem>
    )}
/> */}