import { z } from "zod";

/**
 * Shared between the browser form and POST /api/enquiries so both sides
 * enforce exactly the same rules.
 */

export const OCCUPATIONS = ["Working professional", "Teacher", "Student", "Other"] as const;
export const ROOM_PREFERENCES = ["Private room", "Shared room", "Open to both"] as const;
export const LENGTHS_OF_STAY = ["1–3 months", "3–6 months", "6–12 months", "12 months +"] as const;

/** Today's date (YYYY-MM-DD) in Dubai, so client and server agree on "today". */
export function todayInDubai(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function isRealDate(value: string): boolean {
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export const enquirySchema = z.object({
  fullName: z
    .string({ error: "Please enter your full name." })
    .trim()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(100, "Your name can be up to 100 characters."),

  occupation: z.enum(OCCUPATIONS, { error: "Please choose what describes you best." }),

  email: z
    .string({ error: "Please enter your email address." })
    .trim()
    .min(1, "Please enter your email address.")
    .max(254, "That email address is too long.")
    .pipe(z.email("Please enter a valid email address.")),

  phone: z
    .string({ error: "Please enter your phone or WhatsApp number." })
    .trim()
    .min(7, "Please enter a number with at least 7 characters.")
    .max(20, "Please enter a number with no more than 20 characters.")
    .regex(/^[0-9+\-\s]+$/, "Use digits, spaces, + and - only."),

  roomPreference: z.enum(ROOM_PREFERENCES, { error: "Please choose a room preference." }),

  moveInDate: z
    .string({ error: "Please choose a move-in date." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a move-in date.")
    .refine(isRealDate, "Please choose a valid date.")
    .refine((v) => v >= todayInDubai(), "Please choose today or a later date."),

  lengthOfStay: z.enum(LENGTHS_OF_STAY, { error: "Please choose a length of stay." }),

  message: z.string().trim().max(1000, "Your message can be up to 1000 characters.").optional(),

  consent: z.literal(true, { error: "Please confirm you agree to be contacted." }),

  /** UTM source captured from the page URL, if present. */
  source: z.string().trim().max(100).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

/** First error message per field, keyed by field name. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
