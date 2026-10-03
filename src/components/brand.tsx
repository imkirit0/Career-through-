import Link from "next/link";
import { LogoMark } from "./logo-mark";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5 font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
      <LogoMark className="h-8 w-auto shrink-0 transition-transform duration-500 group-hover:scale-110" />
      <span className="font-heading whitespace-nowrap text-xl font-bold tracking-tight text-foreground">
        Career <span className="bg-gradient-to-r from-[#1d6bfb] via-[#5b4dfb] to-[#9a45fc] bg-clip-text text-transparent">Through</span>
      </span>
    </Link>
  );
}
