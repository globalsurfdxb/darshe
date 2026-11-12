"use client";

import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";
import {
  LENGTHS_OF_STAY,
  OCCUPATIONS,
  ROOM_PREFERENCES,
  enquirySchema,
  fieldErrors,
  todayInDubai,
} from "@/lib/enquiry-schema";
import { siteConfig } from "@/lib/site-config";

type Values = {
  fullName: string;
  occupation: string;
  email: string;
  phone: string;
  roomPreference: string;
  moveInDate: string;
  lengthOfStay: string;
  message: string;
  consent: boolean;
  company: string; // honeypot
};

const EMPTY: Values = {
  fullName: "",
  occupation: "",
  email: "",
  phone: "",
  roomPreference: "",
  moveInDate: "",
  lengthOfStay: "",
  message: "",
  consent: false,
  company: "",
};

type Status = "idle" | "submitting" | "success" | "error" | "rate-limited";

const FIELD_ORDER = [
  "fullName",
  "occupation",
  "email",
  "phone",
  "roomPreference",
  "moveInDate",
  "lengthOfStay",
  "message",
  "consent",
];

function validate(values: Values) {
  const result = enquirySchema.safeParse({
    ...values,
    message: values.message || undefined,
  });
  return result.success ? {} : fieldErrors(result.error);
}

export function EnquiryForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [minDate, setMinDate] = useState<string | undefined>();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Computed on the client so a statically rendered page never ships a stale "today".
  useEffect(() => setMinDate(todayInDubai()), []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    // Once a field has shown an error, re-check live so the message clears as soon as it is fixed.
    if (errors[key as string]) {
      const fresh = validate(next);
      setErrors((prev) => {
        const copy = { ...prev };
        if (fresh[key as string]) copy[key as string] = fresh[key as string];
        else delete copy[key as string];
        return copy;
      });
    }
  }

  function focusFirstError(errs: Record<string, string>) {
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (!first) return;
    const el =
      first === "roomPreference"
        ? formRef.current?.querySelector<HTMLElement>('input[name="roomPreference"]')
        : formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }

    setStatus("submitting");
    try {
      const source = new URLSearchParams(window.location.search).get("utm_source") ?? undefined;
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, message: values.message || undefined, source }),
      });

      if (res.status === 201 || res.ok) {
        setStatus("success");
        return;
      }
      if (res.status === 400) {
        const data = (await res.json().catch(() => null)) as { errors?: Record<string, string> } | null;
        if (data?.errors) {
          setErrors(data.errors);
          setStatus("idle");
          focusFirstError(data.errors);
          return;
        }
      }
      setStatus(res.status === 429 ? "rate-limited" : "error");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-line bg-card p-8 text-center sm:p-12" role="status">
        <LogoMark className="mx-auto h-12 w-auto text-terracotta" />
        <h3
          ref={successRef}
          tabIndex={-1}
          className="mt-6 scroll-mt-32 text-3xl leading-snug outline-none sm:text-4xl"
        >
          Thank you, we&apos;ve received your enquiry.
        </h3>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-body-muted">
          The DarShe team will be in touch soon to talk through rooms, availability and a visit. We
          can&apos;t wait to welcome you home.
        </p>
        <button type="button" onClick={reset} className="btn-outline mt-8">
          Send another enquiry
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";
  const describe = (name: string) => (errors[name] ? `enq-${name}-error` : undefined);
  const invalid = (name: string) => (errors[name] ? true : undefined);

  const ErrorText = ({ name }: { name: string }) =>
    errors[name] ? (
      <p id={`enq-${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-line bg-card p-6 sm:p-9"
      aria-labelledby="enquiry-card-title"
    >
      <h3 id="enquiry-card-title" className="text-3xl">
        Quick enquiry
      </h3>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="enq-fullName" className="field-label">
            Full name
          </label>
          <input
            id="enq-fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={values.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            aria-invalid={invalid("fullName")}
            aria-describedby={describe("fullName")}
            className="field-input"
          />
          <ErrorText name="fullName" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="enq-occupation" className="field-label">
            I am a…
          </label>
          <select
            id="enq-occupation"
            name="occupation"
            required
            value={values.occupation}
            onChange={(e) => set("occupation", e.target.value)}
            aria-invalid={invalid("occupation")}
            aria-describedby={describe("occupation")}
            className="field-input"
          >
            <option value="">Select…</option>
            {OCCUPATIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <ErrorText name="occupation" />
        </div>

        <div>
          <label htmlFor="enq-email" className="field-label">
            Email
          </label>
          <input
            id="enq-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={invalid("email")}
            aria-describedby={describe("email")}
            className="field-input"
          />
          <ErrorText name="email" />
        </div>

        <div>
          <label htmlFor="enq-phone" className="field-label">
            Phone / WhatsApp
          </label>
          <input
            id="enq-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+971"
            required
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            aria-invalid={invalid("phone")}
            aria-describedby={describe("phone")}
            className="field-input"
          />
          <ErrorText name="phone" />
        </div>

        <fieldset
          className="sm:col-span-2"
          aria-describedby={describe("roomPreference")}
          aria-invalid={invalid("roomPreference")}
        >
          <legend className="field-label">Room preference</legend>
          <div className="flex flex-wrap gap-2.5">
            {ROOM_PREFERENCES.map((r, i) => (
              <label key={r} className="cursor-pointer">
                <input
                  type="radio"
                  name="roomPreference"
                  value={r}
                  checked={values.roomPreference === r}
                  onChange={() => set("roomPreference", r)}
                  required={i === 0}
                  className="peer sr-only"
                />
                <span className="inline-flex rounded-full border border-input-border bg-white px-5 py-2.5 text-[0.95rem] text-ink transition-colors peer-checked:border-terracotta peer-checked:bg-terracotta peer-checked:text-card peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-terracotta-dark">
                  {r}
                </span>
              </label>
            ))}
          </div>
          <ErrorText name="roomPreference" />
        </fieldset>

        <div>
          <label htmlFor="enq-moveInDate" className="field-label">
            Preferred move-in date
          </label>
          <input
            id="enq-moveInDate"
            name="moveInDate"
            type="date"
            required
            min={minDate}
            value={values.moveInDate}
            onChange={(e) => set("moveInDate", e.target.value)}
            aria-invalid={invalid("moveInDate")}
            aria-describedby={describe("moveInDate")}
            className="field-input"
          />
          <ErrorText name="moveInDate" />
        </div>

        <div>
          <label htmlFor="enq-lengthOfStay" className="field-label">
            Length of stay
          </label>
          <select
            id="enq-lengthOfStay"
            name="lengthOfStay"
            required
            value={values.lengthOfStay}
            onChange={(e) => set("lengthOfStay", e.target.value)}
            aria-invalid={invalid("lengthOfStay")}
            aria-describedby={describe("lengthOfStay")}
            className="field-input"
          >
            <option value="">Select…</option>
            {LENGTHS_OF_STAY.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <ErrorText name="lengthOfStay" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="enq-message" className="field-label">
            Message (optional)
          </label>
          <textarea
            id="enq-message"
            name="message"
            rows={4}
            maxLength={1000}
            placeholder="Anything you'd like us to know"
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            aria-invalid={invalid("message")}
            aria-describedby={describe("message")}
            className="field-input resize-y"
          />
          <ErrorText name="message" />
        </div>

        {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
        <div className="sr-only-field" aria-hidden="true">
          <label htmlFor="enq-company">Company</label>
          <input
            id="enq-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-start gap-3">
            <input
              id="enq-consent"
              name="consent"
              type="checkbox"
              required
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
              aria-invalid={invalid("consent")}
              aria-describedby={describe("consent")}
              className="mt-1 h-5 w-5 shrink-0 rounded border-input-border accent-terracotta"
            />
            <label htmlFor="enq-consent" className="text-[0.95rem] leading-snug text-ink">
              I agree to be contacted by DarShe about my enquiry.
            </label>
          </div>
          <ErrorText name="consent" />
        </div>
      </div>

      <div aria-live="polite" className="mt-5">
        {status === "error" && (
          <p role="alert" className="rounded-xl border border-[#B3261E]/40 bg-[#B3261E]/5 px-4 py-3 text-sm text-[#8C1D18]">
            Something went wrong. Please try again or email us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="underline">
              {siteConfig.email}
            </a>
            .
          </p>
        )}
        {status === "rate-limited" && (
          <p role="alert" className="rounded-xl border border-[#B3261E]/40 bg-[#B3261E]/5 px-4 py-3 text-sm text-[#8C1D18]">
            We&apos;ve received several enquiries from this connection recently. Please try again
            later or email us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="underline">
              {siteConfig.email}
            </a>
            .
          </p>
        )}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full">
        {submitting ? (
          <>
            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Sending…
          </>
        ) : (
          "Send my enquiry"
        )}
      </button>
      <p className="mt-4 text-center text-sm text-body-muted">
        Your details go directly to the DarShe team at {siteConfig.email}.
      </p>
    </form>
  );
}
