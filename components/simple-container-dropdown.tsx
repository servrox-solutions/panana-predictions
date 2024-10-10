import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Share2 } from "lucide-react";
import { Button } from "./ui/button";

interface SocialShareDropdownProps {
  shareButtons: React.ReactNode[];
}

export const SimpleContainerDropdown: React.FC<SocialShareDropdownProps> = ({
  shareButtons,
}) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hover:bg-primary/20"
          disabled={shareButtons.length === 0}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-popover grid grid-cols-3 gap-2 p-2"
      >
        {shareButtons.map((item, idx) => (
          <DropdownMenuItem
            className="focus:bg-initial"
            key={idx}
            onSelect={(event) => event.preventDefault()}
            asChild
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
