import { siteConfig } from "@/lib/site-config";

const ARCH_PATH =
  "M24 50H6V25C6 17 14 13 21 9C25 7 28 4.5 30 2.5C32 4.5 35 7 39 9C46 13 54 17 54 25V50H36V37A6 6 0 0 0 24 37Z";

/** Onion-dome arch with a door opening. Inherits colour from `currentColor`. */
export function LogoMark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 52"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={ARCH_PATH} />
    </svg>
  );
}

export function Logo({
  className = "",
  markClassName = "h-8 w-auto",
  textClassName = "text-[1.75rem]",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3 text-terracotta ${className}`}>
      <LogoMark className={markClassName} />
      <span className={`font-display leading-none ${textClassName}`}>{siteConfig.name}</span>
    </span>
  );
}
