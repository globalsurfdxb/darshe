"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type Result = { ok: boolean; error?: string };

/**
 * Two-step delete: the first click asks for confirmation, the second deletes.
 * Cancel is focused by default and Escape cancels, so a stray keypress can't delete.
 */
export function DeleteButton({
  action,
  itemLabel,
  redirectTo,
  compact = false,
}: {
  /** Server action, already bound to the record id. */
  action: () => Promise<Result>;
  /** Used in accessible names, e.g. "survey response from 12 Nov". */
  itemLabel: string;
  /** Where to go after deleting. Omit to stay on the page and refresh it. */
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
    else if (wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        setError(res.error ?? "Could not delete. Please try again.");
        return;
      }
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  const size = compact ? "!px-4 !py-1.5 text-xs" : "!py-2.5 text-sm";

  if (!confirming) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${itemLabel}`}
        className={`btn border border-[#B3261E] text-[#B3261E] hover:bg-[#B3261E] hover:text-card ${size}`}
      >
        Delete
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={`Confirm deleting ${itemLabel}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !pending) setConfirming(false);
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <span className={compact ? "text-xs font-medium text-[#8C1D18]" : "text-sm font-medium text-[#8C1D18]"}>
        Delete permanently?
      </span>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={`btn bg-[#B3261E] text-card hover:bg-[#8C1D18] ${size}`}
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        ref={cancelRef}
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className={`btn border border-input-border text-espresso hover:bg-cream ${size}`}
      >
        Cancel
      </button>
      {error && (
        <p role="alert" className="w-full text-xs text-[#B3261E]">
          {error}
        </p>
      )}
    </div>
  );
}
