import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface SocialShareDropdownProps {
  trigger: React.ReactNode;
  buttons: React.ReactNode[];
  className?: string;
}

export const SimpleContainerDropdown: React.FC<SocialShareDropdownProps> = ({
  trigger,
  buttons,
  className,
}) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("bg-popover grid grid-cols-3 gap-2 p-2", className)}
      >
        {buttons.map((item, idx) => (
          <DropdownMenuItem
            className="focus:bg-initial"
            key={idx}
            // onSelect={(event) => event.preventDefault()} // TODO: why was this here?
            asChild
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
