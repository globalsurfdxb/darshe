const dubaiDateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateOnly = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC", // move-in dates are stored as UTC midnight of the chosen calendar day
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** e.g. "12 Nov 2026, 16:08" in Dubai time. */
export function formatDubai(date: Date): string {
  return dubaiDateTime.format(date);
}

export function formatDate(date: Date): string {
  return dateOnly.format(date);
}

/** Builds a wa.me link from a phone number as typed by the visitor (UAE-aware). */
export function whatsappUrl(phone: string): string | null {
  const trimmed = phone.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (trimmed.startsWith("+")) {
    // already international
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = `971${digits.slice(1)}`; // local UAE number such as 050 123 4567
  }
  return digits.length >= 7 ? `https://wa.me/${digits}` : null;
}

/** Escapes a CSV cell and neutralises spreadsheet formula injection. */
export function csvCell(value: string | number | null | undefined): string {
  let s = value == null ? "" : String(value);
  // Leave plain international phone numbers (e.g. "+971 50 123 4567") untouched.
  const isPhoneLike = /^\+[\d\s-]+$/.test(s);
  if (!isPhoneLike && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
