"use client";

import { useState, useTransition } from "react";
import { updateStatus } from "./actions";

type Option = { value: string; label: string };

export function StatusSelect({
  id,
  current,
  options,
}: {
  id: string;
  current: string;
  options: Option[];
}) {
  const [value, setValue] = useState(current);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const previous = value;
    setValue(next);
    setMessage(null);
    startTransition(async () => {
      const res = await updateStatus(id, next);
      if (res.ok) setMessage({ text: "Status updated.", error: false });
      else {
        setValue(previous);
        setMessage({ text: res.error ?? "Could not update the status.", error: true });
      }
    });
  }

  return (
    <div>
      <label htmlFor="status" className="field-label">
        Status
      </label>
      <select
        id="status"
        value={value}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="field-input max-w-xs"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p role="status" aria-live="polite" className={`mt-2 min-h-5 text-sm ${message?.error ? "text-[#B3261E]" : "text-body-muted"}`}>
        {pending ? "Saving…" : message?.text}
      </p>
    </div>
  );
}
