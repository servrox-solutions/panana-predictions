import { Banana } from "lucide-react";
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/">
      <div className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
        <Banana className="h-5 w-5 transition-all group-hover:scale-110" />
        <span className="sr-only">Panana Pre.</span>
      </div>
    </Link>
  );
}
