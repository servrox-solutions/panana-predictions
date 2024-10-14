import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useCallback } from "react";
import { SimpleContainerDropdown } from "../simple-container-dropdown";
import { Button } from "../ui/button";

export interface VoteDropdownProps {
  upVotesSum: number;
  downVotesSum: number;
  onVote: (vote: boolean) => void;
}

export const VoteDropdown = ({
  upVotesSum,
  downVotesSum,
  onVote,
}: VoteDropdownProps) => {
  const handleVoteUp = useCallback(() => onVote(true), [onVote]);
  const handleVoteDown = useCallback(() => onVote(false), [onVote]);

  return (
    <SimpleContainerDropdown
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hover:bg-primary/20"
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
      }
      buttons={[
        <Button
          variant="ghost"
          size="icon"
          className="group hover:text-green-500 hover:bg-green-500/20"
          onClick={handleVoteUp}
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="text-xs dark:text-neutral-400 group-hover:text-green-500 pl-1">
            {upVotesSum}
          </span>
        </Button>,
        <Button
          variant="ghost"
          size="icon"
          className="group hover:text-red-500 hover:bg-red-500/20"
          onClick={handleVoteDown}
        >
          <ThumbsDown className="h-4 w-4" />
          <span className="text-xs dark:text-neutral-400 group-hover:text-red-500 pl-1">
            {downVotesSum}
          </span>
        </Button>,
      ]}
      className="grid-cols-2 min-w-fit"
    />
  );
};
