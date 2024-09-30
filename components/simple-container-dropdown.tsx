import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Share2 } from "lucide-react";
import { Button } from "./ui/button";

interface SocialShareDropdownProps {
  containers: React.ReactNode[];
}

export const SimpleContainerDropdown: React.FC<SocialShareDropdownProps> = ({
  containers,
}) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hover:bg-primary/20"
          disabled={containers.length === 0}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        {containers.map((item, idx) => (
          <DropdownMenuItem
            className="focus:bg-initial"
            key={idx}
            onSelect={(event) => event.preventDefault()}
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
