"use client";

import { useRouter } from "next/navigation";

/**
 * Table row that opens `href` when clicked anywhere. Each row should still
 * contain a real link to `href` (keyboard and screen-reader users use that),
 * so this only adds the mouse shortcut. Clicks on links, buttons and form
 * controls inside the row, and text selection, are left alone.
 */
export function ClickableRow({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      className={`cursor-pointer ${className}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button, input, select, textarea, label")) return;
        if (window.getSelection()?.toString()) return;
        if (e.metaKey || e.ctrlKey) {
          window.open(href, "_blank", "noopener");
          return;
        }
        router.push(href);
      }}
    >
      {children}
    </tr>
  );
}
