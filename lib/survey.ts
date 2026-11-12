import { z } from "zod";

/**
 * DarShe Women's Housing Survey: questions, sections and validation.
 * Shared by the browser form, POST /api/survey and the admin views, so the
 * wording and rules live in exactly one place.
 */

export type QuestionType = "single" | "multi" | "text";

export interface Question {
  /** Stable key used in stored answers, e.g. "q12". */
  id: string;
  /** Number shown to the respondent (matches the original questionnaire). */
  n: number;
  type: QuestionType;
  label: string;
  hint?: string;
  options?: readonly string[];
  /** multi only: maximum selections. */
  max?: number;
  /** multi only: options that cannot be combined with any other. */
  exclusive?: readonly string[];
  /** text only */
  input?: "text" | "email" | "tel";
  autoComplete?: string;
  optional?: boolean;
}

export interface Section {
  id: string;
  title: string;
  intro?: string;
  questions: Question[];
}

const AREAS_CURRENT = [
  "Al Barsha",
  "Arjan / Al Barsha South",
  "JVC",
  "JVT",
  "Dubai Silicon Oasis",
  "Dubai Investment Park",
  "Dubai South",
  "International City",
  "Deira",
  "Bur Dubai",
  "Downtown / Business Bay",
  "Dubai Marina / JLT",
  "Other",
  "Not currently living in Dubai",
] as const;

const BUDGET_BANDS = [
  "Below 1,000",
  "1,000–1,499",
  "1,500–1,999",
  "2,000–2,499",
  "2,500–2,999",
  "3,000–3,499",
  "3,500–3,999",
  "4,000 or above",
] as const;

const LIKERT_APPEAL = [
  "Very appealing",
  "Somewhat appealing",
  "Neutral",
  "Not very appealing",
  "Not appealing at all",
] as const;

export const SURVEY_SECTIONS: Section[] = [
  {
    id: "about",
    title: "About you",
    questions: [
      {
        id: "q1",
        n: 1,
        type: "single",
        label: "What is your age group?",
        options: ["18–21", "22–25", "26–30", "31–35", "36–40", "41–50", "Above 50"],
      },
      {
        id: "q2",
        n: 2,
        type: "single",
        label: "What is your current employment status?",
        options: [
          "Employed full-time",
          "Employed part-time",
          "Self-employed / Freelancer",
          "Student",
          "Looking for employment",
          "Not currently working",
          "Other",
        ],
      },
      {
        id: "q3",
        n: 3,
        type: "single",
        label: "What is your monthly personal income (AED)?",
        options: [
          "No income",
          "Below 3,000",
          "3,000–4,999",
          "5,000–6,999",
          "7,000–9,999",
          "10,000–12,999",
          "13,000–15,999",
          "Above 15,000",
          "Prefer not to say",
        ],
      },
      {
        id: "q4",
        n: 4,
        type: "single",
        label: "How long have you been living in Dubai?",
        options: [
          "Not yet relocated",
          "Less than 6 months",
          "6–12 months",
          "1–3 years",
          "3–5 years",
          "More than 5 years",
        ],
      },
      {
        id: "q5",
        n: 5,
        type: "single",
        label: "What best describes your current living arrangement?",
        options: [
          "Living alone",
          "Living with family",
          "Living with friends",
          "Living with roommates",
          "Employer-provided accommodation",
          "Other",
        ],
      },
    ],
  },
  {
    id: "accommodation",
    title: "Current accommodation",
    questions: [
      {
        id: "q6",
        n: 6,
        type: "single",
        label: "Which area of Dubai do you currently live in?",
        options: AREAS_CURRENT,
      },
      {
        id: "q7",
        n: 7,
        type: "single",
        label: "What type of accommodation do you currently live in?",
        options: [
          "Private studio",
          "Private apartment",
          "Shared apartment",
          "Shared villa",
          "Shared bedroom / Bedspace",
          "Partitioned room",
          "Employer-provided accommodation",
          "Family residence",
          "Other",
        ],
      },
      {
        id: "q8",
        n: 8,
        type: "single",
        label: "How many people share your bedroom, including yourself?",
        options: ["1", "2", "3", "4", "5 or more"],
      },
      {
        id: "q9",
        n: 9,
        type: "single",
        label: "How much do you personally pay for accommodation per month (AED)?",
        options: [
          "Nothing – Family or employer provided",
          "Below 1,000",
          "1,000–1,499",
          "1,500–1,999",
          "2,000–2,499",
          "2,500–2,999",
          "3,000–3,999",
          "4,000 or above",
        ],
      },
      {
        id: "q10",
        n: 10,
        type: "multi",
        label: "What is included in your current accommodation cost?",
        hint: "Select all that apply",
        options: [
          "Electricity and water",
          "Wi-Fi",
          "Air conditioning",
          "Cleaning",
          "Laundry",
          "Meals",
          "Gym",
          "Parking",
          "None of the above",
          "Other",
        ],
        exclusive: ["None of the above"],
      },
      {
        id: "q11",
        n: 11,
        type: "single",
        label: "How satisfied are you with your current accommodation?",
        options: ["Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"],
      },
    ],
  },
  {
    id: "challenges",
    title: "Housing challenges",
    questions: [
      {
        id: "q12",
        n: 12,
        type: "multi",
        label: "What are your biggest challenges with your current accommodation?",
        hint: "Select up to three",
        max: 3,
        options: [
          "High rental costs",
          "Lack of privacy",
          "Safety concerns",
          "Poor cleanliness or hygiene",
          "Inadequate facilities",
          "Roommate issues",
          "Poor property maintenance",
          "Long commuting distance",
          "Lack of community or social connections",
          "Hidden charges",
          "No significant challenges",
          "Other",
        ],
        exclusive: ["No significant challenges"],
      },
      {
        id: "q13",
        n: 13,
        type: "multi",
        label: "What are the three most important factors when choosing accommodation?",
        hint: "Select up to three",
        max: 3,
        options: [
          "Affordable rent",
          "Safety and security",
          "Privacy",
          "Location",
          "Cleanliness",
          "Public transport accessibility",
          "Amenities",
          "Community and social interaction",
          "Flexible rental terms",
          "Professional management",
        ],
      },
      {
        id: "q14",
        n: 14,
        type: "single",
        label: "How long is your usual one-way commute to work or university?",
        options: [
          "Less than 15 minutes",
          "15–30 minutes",
          "31–45 minutes",
          "46–60 minutes",
          "More than 60 minutes",
          "Not applicable",
        ],
      },
      {
        id: "q15",
        n: 15,
        type: "single",
        label: "How important is living in a women-only residential environment to you?",
        options: [
          "Not important",
          "Slightly important",
          "Moderately important",
          "Very important",
          "Extremely important",
        ],
      },
      {
        id: "q16",
        n: 16,
        type: "single",
        label:
          "How interested are you in living within a community that organises networking, wellness and social activities?",
        options: [
          "Very interested",
          "Somewhat interested",
          "Neutral",
          "Not very interested",
          "Not interested at all",
        ],
      },
    ],
  },
  {
    id: "preferences",
    title: "Living preferences",
    questions: [
      {
        id: "q17",
        n: 17,
        type: "single",
        label: "Which room arrangement would you prefer?",
        options: [
          "Private bedroom",
          "Shared bedroom with 1 other woman",
          "Shared bedroom with 2 other women",
          "Shared bedroom with 3 other women",
          "Depends on price",
          "Would not consider shared accommodation",
        ],
      },
      {
        id: "q18",
        n: 18,
        type: "multi",
        label: "Which facilities would you consider essential?",
        hint: "Select up to five",
        max: 5,
        options: [
          "Ensuite bathroom",
          "Shared kitchen",
          "Laundry facilities",
          "High-speed Wi-Fi",
          "Housekeeping",
          "24-hour security",
          "Gym",
          "Communal lounge",
          "Co-working / Study space",
          "Parking",
          "Public transport accessibility",
          "Outdoor recreational space",
        ],
      },
      {
        id: "q19",
        n: 19,
        type: "single",
        label: "How important is having an ensuite bathroom?",
        options: [
          "Essential",
          "Strongly preferred",
          "Preferred if affordable",
          "Comfortable sharing a bathroom",
        ],
      },
      {
        id: "q20",
        n: 20,
        type: "multi",
        label: "Which additional services would you be willing to pay for?",
        hint: "Select all that apply",
        options: [
          "Daily meal plans",
          "Laundry and ironing",
          "Housekeeping",
          "Gym / Fitness programmes",
          "Transportation / Shuttle service",
          "Community events",
          "None",
          "Other",
        ],
        exclusive: ["None"],
      },
      {
        id: "q21",
        n: 21,
        type: "single",
        label: "What would be your preferred rental commitment?",
        options: [
          "Month-to-month",
          "3 months",
          "6 months",
          "12 months",
          "Flexible depending on price",
        ],
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & affordability",
    questions: [
      {
        id: "q22",
        n: 22,
        type: "single",
        label:
          "What is your maximum comfortable monthly accommodation budget, including utilities and Wi-Fi (AED)?",
        options: BUDGET_BANDS,
      },
      {
        id: "q23",
        n: 23,
        type: "single",
        label:
          "What monthly rent per person would you consider reasonable for a 4-person shared bedroom with an ensuite bathroom, utilities, Wi-Fi and access to shared kitchen and laundry facilities (AED)?",
        options: [
          "Below 1,000",
          "1,000–1,199",
          "1,200–1,499",
          "1,500–1,799",
          "1,800 or above",
          "Would not consider this room type",
        ],
      },
      {
        id: "q24",
        n: 24,
        type: "single",
        label:
          "What monthly rent per person would you consider reasonable for a 2-person shared bedroom with an ensuite bathroom, utilities, Wi-Fi and access to shared kitchen and laundry facilities (AED)?",
        options: [
          "Below 1,500",
          "1,500–1,999",
          "2,000–2,399",
          "2,400–2,799",
          "2,800 or above",
          "Would not consider this room type",
        ],
      },
      {
        id: "q25",
        n: 25,
        type: "single",
        label:
          "What monthly rent would you consider reasonable for a private bedroom with an ensuite bathroom, utilities, Wi-Fi and access to shared kitchen and laundry facilities (AED)?",
        options: [
          "Below 2,500",
          "2,500–2,999",
          "3,000–3,499",
          "3,500–3,999",
          "4,000 or above",
          "Would not consider this room type",
        ],
      },
    ],
  },
  {
    id: "concept",
    title: "The DarShe concept",
    intro:
      "DarShe is a proposed women-focused co-living concept in Dubai offering private and shared rooms, ensuite bathrooms, communal kitchens, laundry facilities, professionally managed accommodation and opportunities for community engagement.",
    questions: [
      {
        id: "q26",
        n: 26,
        type: "single",
        label: "How appealing do you find this accommodation concept?",
        options: LIKERT_APPEAL,
      },
      {
        id: "q27",
        n: 27,
        type: "single",
        label:
          "If accommodation matching your preferences were available within your budget, how likely would you be to consider living at DarShe?",
        options: [
          "Definitely would consider",
          "Probably would consider",
          "Unsure",
          "Probably would not consider",
          "Definitely would not consider",
        ],
      },
      {
        id: "q28",
        n: 28,
        type: "multi",
        label: "Which locations in Dubai would you consider for this type of accommodation?",
        hint: "Select all that apply",
        options: [
          "Al Barsha",
          "Arjan / Al Barsha South",
          "JVC",
          "JVT",
          "Dubai Investment Park",
          "Dubai Silicon Oasis",
          "Dubai South",
          "Other",
          "None of the above",
        ],
        exclusive: ["None of the above"],
      },
      {
        id: "q29",
        n: 29,
        type: "single",
        label: "What would be your biggest concern about choosing this type of accommodation?",
        options: [
          "Lack of privacy",
          "Sharing accommodation",
          "Rental pricing",
          "Location and commuting distance",
          "Cleanliness and hygiene",
          "Security",
          "Roommate compatibility",
          "Rental terms",
          "No major concerns",
          "Other",
        ],
      },
      {
        id: "q30",
        n: 30,
        type: "single",
        label:
          "Would you be interested in receiving future updates about DarShe or participating in further research?",
        options: ["Yes", "No"],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact details",
    intro:
      "This last section is optional. Share your details only if you would like to hear from the DarShe team.",
    questions: [
      {
        id: "q31",
        n: 31,
        type: "text",
        label: "First name",
        hint: "Optional",
        input: "text",
        autoComplete: "given-name",
        optional: true,
      },
      {
        id: "q32",
        n: 32,
        type: "text",
        label: "Email address",
        hint: "Optional",
        input: "email",
        autoComplete: "email",
        optional: true,
      },
      {
        id: "q33",
        n: 33,
        type: "text",
        label: "WhatsApp number",
        hint: "Optional",
        input: "tel",
        autoComplete: "tel",
        optional: true,
      },
      {
        id: "q34",
        n: 34,
        type: "single",
        label:
          "Do you consent to being contacted by the DarShe team regarding future research and project updates?",
        hint: "Required if you share an email address or WhatsApp number",
        options: ["Yes", "No"],
        optional: true,
      },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = SURVEY_SECTIONS.flatMap((s) => s.questions);

export type Answers = Record<string, string | string[]>;

/** Id of the question that carries each contact field. */
export const CONTACT = { firstName: "q31", email: "q32", whatsapp: "q33", consent: "q34" } as const;

function questionSchema(q: Question): z.ZodType<unknown> {
  if (q.type === "single") {
    const opts = q.options as unknown as [string, ...string[]];
    return z.enum(opts, { error: "Please choose an option." });
  }

  if (q.type === "multi") {
    const opts = q.options as unknown as [string, ...string[]];
    const max = q.max ?? opts.length;
    return z
      .array(z.enum(opts, { error: "Please choose from the listed options." }), {
        error: "Please select at least one option.",
      })
      .min(1, "Please select at least one option.")
      .max(max, `Please select no more than ${max}.`)
      .refine((v) => new Set(v).size === v.length, "Each option can only be chosen once.")
      .refine(
        (v) => !v.some((x) => q.exclusive?.includes(x)) || v.length === 1,
        "That option can't be combined with others.",
      );
  }

  // text (always optional in this survey)
  if (q.input === "email") {
    return z
      .string()
      .trim()
      .max(254, "That email address is too long.")
      .refine((v) => v === "" || z.email().safeParse(v).success, "Please enter a valid email address.");
  }
  if (q.input === "tel") {
    return z
      .string()
      .trim()
      .refine(
        (v) => v === "" || /^[0-9+\-\s]{7,20}$/.test(v),
        "Use 7–20 characters: digits, spaces, + and - only.",
      );
  }
  return z.string().trim().max(80, "Please keep this under 80 characters.");
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

/**
 * Validates the given questions against the answers. Returns the first error
 * per question id. Used for one step in the browser and for the whole survey
 * on the server.
 */
export function validateQuestions(
  questions: Question[],
  answers: Answers,
): { errors: Record<string, string>; cleaned: Answers } {
  const errors: Record<string, string> = {};
  const cleaned: Answers = {};

  for (const q of questions) {
    const value = answers[q.id];

    if (isEmpty(value)) {
      if (!q.optional) errors[q.id] = q.type === "multi" ? "Please select at least one option." : "Please choose an option.";
      continue;
    }

    const parsed = questionSchema(q).safeParse(value);
    if (!parsed.success) {
      errors[q.id] = parsed.error.issues[0]?.message ?? "Please check this answer.";
      continue;
    }
    cleaned[q.id] = parsed.data as string | string[];
  }

  // Consent is needed when the respondent leaves contact details.
  const hasContact = ["q32", "q33"].some((id) => !isEmpty(answers[id]) && !errors[id]);
  if (hasContact && questions.some((q) => q.id === CONTACT.consent) && isEmpty(answers[CONTACT.consent])) {
    errors[CONTACT.consent] = "Please tell us whether we may contact you.";
  }

  // Drop empty optional text answers from the cleaned output.
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === "") delete cleaned[key];
  }

  return { errors, cleaned };
}

/** Pulls plain answers out of an untrusted JSON body: only known question ids, only strings / string arrays. */
export function pickAnswers(input: unknown): Answers {
  const out: Answers = {};
  if (typeof input !== "object" || input === null) return out;
  const raw = input as Record<string, unknown>;
  for (const q of ALL_QUESTIONS) {
    const v = raw[q.id];
    if (typeof v === "string") out[q.id] = v;
    else if (Array.isArray(v) && v.every((x) => typeof x === "string")) out[q.id] = v as string[];
  }
  return out;
}

export function formatAnswer(value: string | string[] | undefined): string {
  if (value === undefined) return "";
  return Array.isArray(value) ? value.join("; ") : value;
}
