import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/">
      <div className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
        <div className="relative h-10 w-10">
          {/* Flip container */}
          <div className="absolute inset-0 h-full w-full [transform-style:preserve-3d] animate-flip">
            {/* Front of the card */}
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <Image
                src="/profile_pp.jpg"
                alt="Panana Pre"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            {/* Back of the card */}
            <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <Image
                src="/profile_pic.jpg"
                alt="Profile Pic"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
        <span className="sr-only">Panana Pre.</span>
      </div>
    </Link>
  );
}
