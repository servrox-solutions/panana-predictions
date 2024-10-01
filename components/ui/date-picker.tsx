"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "./scroll-area";
import { DateObjectUnits, DateTime } from "luxon";
import { useEffect } from "react";

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

  const scrollIntoView = (smooth: boolean, d?: DateTime) => {
    if (!d) {
      d = getEarliestStartDate();
    }
    // need to postpone the scroll to next render since the element is not found until the popover was rendered.
    setTimeout(() => {
      const el = document.getElementById(`${d?.hour}:${d?.minute}`);
      el?.scrollIntoView({
        block: "center",
        behavior: smooth ? "smooth" : "instant",
      });
    }, 0);
  };

  const getEarliestStartDate = (): DateTime => {
    const now = DateTime.now();
    return now
      .plus({ hours: 1, minutes: 15 - (now.minute % 15) })
      .set({ second: 0, millisecond: 0 });
  };

  const isTimeDisabled = (i: { hour: number; minute: number }): boolean => {
    const { hour, minute } = i;
    const earliestDate = getEarliestStartDate();
    if (!date) {
      // if no date is selected (initial state), disable all time slots before earliest start date
      return (
        DateTime.now().set({ hour, minute }).diff(earliestDate).as("minutes") <=
        0
      );
    }
    const selectedTime = DateTime.now().set({
      hour,
      minute,
      second: 0,
      millisecond: 0,
    });
    const enabled =
      date.year > earliestDate.year ||
      date.month > earliestDate.month ||
      date.day > earliestDate.day ||
      (date.year === earliestDate.year &&
        date.month === earliestDate.month &&
        date.day === earliestDate.day &&
        selectedTime.diff(earliestDate).as("minutes") >= 0);
    return !enabled;
  };

  const memoizedOnSelect = React.useCallback(
    (newDate?: Date) => {
      if (!newDate) {
        setDate(undefined);
        return;
      }
      const newLuxonDate = DateTime.fromJSDate(newDate);
      const { day, month, year } = newLuxonDate;
      const earliestStartDate = getEarliestStartDate();
      const d = date || earliestStartDate;
      let update: DateObjectUnits = { day, month, year };

      if (newLuxonDate < earliestStartDate) {
        update = {
          ...update,
          hour: earliestStartDate.hour,
          minute: earliestStartDate.minute,
          second: 0,
          millisecond: 0,
        };
      }
      setDate(d.set(update));

      scrollIntoView(true, d);
    },
    [date]
  );

  const memoizedSelectedDate = React.useMemo(() => date?.toJSDate(), [date]);

  const memoizedDisabledDates = React.useMemo(
    () => ({
      before: getEarliestStartDate().toJSDate(),
    }),
    []
  );
  return (
    <Popover onOpenChange={(e) => e && scrollIntoView(false, date)}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          // onClick={scrollIntoView}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            date.toLocaleString(DateTime.DATETIME_MED)
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex max-h-[300px]">
        <Calendar
          mode="single"
          selected={date?.toJSDate()}
          required={true}
          disabled={memoizedDisabledDates}
          onSelect={memoizedOnSelect}
          initialFocus
        />
        <ScrollArea>
          <div className="flex flex-col flex-shrink flex-grow-0 gap-2">
            {times.map((i) => (
              <Button
                variant="outline"
                id={`${i.hour}:${i.minute}`}
                key={`${i.hour}:${i.minute}`}
                disabled={isTimeDisabled(i)}
                className={
                  date?.hour === i.hour && date.minute == i.minute
                    ? "bg-primary text-secondary hover:bg-primary hover:text-secondary"
                    : ""
                }
                onClick={() =>
                  setDate(
                    (date || DateTime.now()).set({
                      minute: i.minute,
                      hour: i.hour,
                    })
                  )
                }
              >
                {i.hour.toString().padStart(2, "0")}:
                {i.minute.toString().padStart(2, "0")}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
