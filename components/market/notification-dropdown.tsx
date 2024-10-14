import { AlarmClock, AlarmClockCheck, BellRing } from "lucide-react";
import { useCallback } from "react";
import { SimpleContainerDropdown } from "../simple-container-dropdown";
import { Button } from "../ui/button";
import { MessageKind } from "@/lib/types/market";

export interface NotificationDropdownProps {
  onSetupNotification: (messageKind: MessageKind) => void;
}

export const NotificationDropdown = ({
  onSetupNotification,
}: NotificationDropdownProps) => {
  const handleSetupNotification = useCallback(
    (messageKind: MessageKind) => onSetupNotification(messageKind),
    [onSetupNotification]
  );

  return (
    <SimpleContainerDropdown
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hover:bg-primary/20"
        >
          <BellRing className="h-4 w-4" />
        </Button>
      }
      buttons={[
        <Button
          variant="ghost"
          className="group hover:text-green-500 hover:bg-yellow-500/20"
          onClick={() =>
            handleSetupNotification(MessageKind.FIVE_MINUTES_BEFORE_BET_CLOSE)
          }
        >
          <AlarmClock className="h-4 w-4" />
          <span className="text-xs dark:text-neutral-400 group-hover:text-yellow-500 pl-1">
            5 Min before prediction closing
          </span>
        </Button>,
        <Button
          variant="ghost"
          className="group hover:text-green-500 hover:bg-orange-500/20"
          onClick={() =>
            handleSetupNotification(MessageKind.FIVE_MINUTES_BEFORE_MARKET_END)
          }
        >
          <AlarmClockCheck className="h-4 w-4" />
          <span className="text-xs dark:text-neutral-400 group-hover:text-orange-500 pl-1">
            5 Min before market resolving
          </span>
        </Button>,
      ]}
      className="grid-rows-2 grid-cols-1 min-w-fit place-items-start"
    />
  );
};
