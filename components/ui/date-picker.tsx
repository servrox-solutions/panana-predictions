"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from './scroll-area'
import { DateTime } from 'luxon'
import { useEffect } from 'react'

export interface DatePickerProps {
    onDateChange: (date?: DateTime) => void;
    initialDate?: DateTime;
}

export function DatePicker(props: DatePickerProps) {
    const { onDateChange, initialDate } = props;
    const [date, setDate] = React.useState<DateTime | undefined>(initialDate);

    const times = [];
    for (let hour = 0; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            times.push({
                hour,
                minute,
            });
        }
    }

    useEffect(() => {
        onDateChange(date);
    }, [date]);

    const scrollIntoView = () => {
        // need to postpone the scroll to next render since the element is not found until the popover was rendered.
        setTimeout(() => {
            console.log(`${date?.hour}:${date?.minute}`)
            const el = document.getElementById(`${date?.hour}:${date?.minute}`);
            console.log(el);
            el?.scrollIntoView({ block: 'center' });
        }, 0);
    }

    return (
        <Popover onOpenChange={(e) => e && scrollIntoView()}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full h-[60px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                // onClick={scrollIntoView}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleString(DateTime.DATETIME_MED) : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex max-h-[300px]">
                <Calendar
                    mode="single"
                    selected={date?.toJSDate()}
                    onSelect={newDate => {
                        if (!newDate) {
                            setDate(undefined);
                            return;
                        }
                        const { day, month, year } = DateTime.fromJSDate(newDate);
                        const d = date || DateTime.now();
                        setDate(d.set({ day, month, year }))
                    }}
                    initialFocus
                />
                <ScrollArea>
                    <div className="flex flex-col flex-shrink flex-grow-0 gap-2">
                        {times.map((i) => (
                            <Button variant="outline"
                                id={`${i.hour}:${i.minute}`}
                                key={`${i.hour}:${i.minute}`}
                                className={date?.hour === i.hour && date.minute == i.minute ? "bg-primary text-secondary hover:bg-primary hover:text-secondary" : ''}
                                onClick={() => setDate((date || DateTime.now()).set({ minute: i.minute, hour: i.hour }))}>
                                {i.hour.toString().padStart(2, '0')}:{i.minute.toString().padStart(2, '0')}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
