import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function TruncatedText({
  text,
  maxLength = 20,
}: {
  text: string;
  maxLength?: number;
}) {
  const truncated =
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-help underline decoration-dotted">
          {truncated}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-sm">{text}</PopoverContent>
    </Popover>
  );
}
