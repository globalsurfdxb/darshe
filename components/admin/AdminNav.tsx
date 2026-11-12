"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/survey", label: "Survey" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex items-center gap-1">
      {items.map((i) => {
        const active = pathname === i.href || pathname.startsWith(`${i.href}/`);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-terracotta text-card" : "text-body-muted hover:text-terracotta-dark"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
