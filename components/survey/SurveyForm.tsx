"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";
import {
  SURVEY_SECTIONS,
  validateQuestions,
  type Answers,
  type Question,
} from "@/lib/survey";
import { siteConfig } from "@/lib/site-config";

const DRAFT_KEY = "darshe-survey-draft-v1";
const TOTAL = SURVEY_SECTIONS.length;

type Status = "idle" | "submitting" | "success" | "error" | "rate-limited";

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 text-card opacity-0 group-has-[:checked]:opacity-100" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 4.8" />
    </svg>
  );
}

function OptionRow({
  type,
  name,
  value,
  checked,
  disabled,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`group flex min-h-[48px] items-center gap-3 rounded-xl border border-input-border bg-white px-4 py-3 text-[0.95rem] leading-snug text-ink transition-colors has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/10 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-terracotta-dark ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-terracotta"
      }`}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      {type === "radio" ? (
        <span
          aria-hidden="true"
          className="h-5 w-5 shrink-0 rounded-full border border-input-border bg-white group-has-[:checked]:border-terracotta group-has-[:checked]:bg-terracotta group-has-[:checked]:shadow-[inset_0_0_0_3px_#FFFBF5]"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-input-border bg-white group-has-[:checked]:border-terracotta group-has-[:checked]:bg-terracotta"
        >
          <Check />
        </span>
      )}
      <span>{value}</span>
    </label>
  );
}

function QuestionBlock({
  q,
  value,
  error,
  onChange,
}: {
  q: Question;
  value: string | string[] | undefined;
  error?: string;
  onChange: (id: string, v: string | string[]) => void;
}) {
  const errId = `${q.id}-error`;
  const hintId = `${q.id}-hint`;
  const describedBy = [q.hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") || undefined;

  if (q.type === "text") {
    return (
      <div>
        <label htmlFor={q.id} className="block font-medium text-espresso">
          <span className="mr-2 text-terracotta-dark">{q.n}.</span>
          {q.label}
          {q.hint && <span className="ml-2 text-sm font-normal text-body-muted">({q.hint})</span>}
        </label>
        <input
          id={q.id}
          name={q.id}
          type={q.input ?? "text"}
          autoComplete={q.autoComplete}
          inputMode={q.input === "tel" ? "tel" : undefined}
          placeholder={q.input === "tel" ? "+971" : undefined}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(q.id, e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className="field-input mt-3 max-w-md"
        />
        {error && (
          <p id={errId} className="field-error">
            {error}
          </p>
        )}
      </div>
    );
  }

  const options = q.options ?? [];
  const selected = Array.isArray(value) ? value : typeof value === "string" && value ? [value] : [];
  const limitReached = q.type === "multi" && q.max !== undefined && selected.length >= q.max;

  function toggle(option: string) {
    if (q.type === "single") {
      onChange(q.id, option);
      return;
    }
    if (selected.includes(option)) {
      onChange(q.id, selected.filter((s) => s !== option));
    } else if (q.exclusive?.includes(option)) {
      onChange(q.id, [option]);
    } else {
      onChange(q.id, [...selected.filter((s) => !q.exclusive?.includes(s)), option]);
    }
  }

  return (
    <fieldset
      className="min-w-0"
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
    >
      <legend className="font-medium leading-snug text-espresso">
        <span className="mr-2 text-terracotta-dark">{q.n}.</span>
        {q.label}
      </legend>
      {q.hint && (
        <p id={hintId} className="mt-1 text-sm text-body-muted">
          {q.hint}
          {q.type === "multi" && q.max !== undefined && (
            <span aria-live="polite"> · {selected.length} of {q.max} selected</span>
          )}
        </p>
      )}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => {
          const checked = selected.includes(o);
          return (
            <OptionRow
              key={o}
              type={q.type === "single" ? "radio" : "checkbox"}
              name={q.id}
              value={o}
              checked={checked}
              disabled={q.type === "multi" && limitReached && !checked}
              onChange={() => toggle(o)}
            />
          );
        })}
      </div>
      {error && (
        <p id={errId} className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function SurveyForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [company, setCompany] = useState(""); // honeypot
  const [restored, setRestored] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  // Restore an unfinished survey (browser storage may be unavailable: ignore failures).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { step?: number; answers?: Answers };
        if (d.answers && typeof d.answers === "object") setAnswers(d.answers);
        if (typeof d.step === "number" && d.step >= 0 && d.step < TOTAL) setStep(d.step);
      }
    } catch {
      /* ignore */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored || status === "success") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, answers }));
    } catch {
      /* ignore */
    }
  }, [answers, step, restored, status]);

  // Move to the top of the card when the step changes.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (status === "success") {
      successRef.current?.focus();
      window.scrollTo({ top: 0 });
    }
  }, [status]);

  const section = SURVEY_SECTIONS[step];
  const isLast = step === TOTAL - 1;
  const submitting = status === "submitting";

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  function focusFirstError(errs: Record<string, string>, questions: Question[]) {
    const first = questions.find((q) => errs[q.id]);
    if (!first) return;
    const el = document.querySelector<HTMLElement>(`[name="${first.id}"]`);
    el?.focus({ preventScroll: true });
    el?.closest("fieldset, div")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  async function submit() {
    setStatus("submitting");
    try {
      const source = new URLSearchParams(window.location.search).get("utm_source") ?? undefined;
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, company, source }),
      });
      if (res.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        setStatus("success");
        return;
      }
      if (res.status === 400) {
        const data = (await res.json().catch(() => null)) as { errors?: Record<string, string> } | null;
        if (data?.errors) {
          // Jump back to the first step that has a problem.
          const stepIndex = SURVEY_SECTIONS.findIndex((s) => s.questions.some((q) => data.errors?.[q.id]));
          setErrors(data.errors);
          setStatus("idle");
          if (stepIndex >= 0) setStep(stepIndex);
          return;
        }
      }
      setStatus(res.status === 429 ? "rate-limited" : "error");
    } catch {
      setStatus("error");
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const { errors: errs } = validateQuestions(section.questions, answers);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs, section.questions);
      return;
    }
    if (isLast) void submit();
    else setStep((s) => s + 1);
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-line bg-card p-8 text-center sm:p-14" role="status">
        <LogoMark className="mx-auto h-12 w-auto text-terracotta" />
        <h2 ref={successRef} tabIndex={-1} className="mt-6 text-3xl leading-snug outline-none sm:text-4xl">
          Thank you for taking part.
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-body-muted">
          Your responses have been recorded. They will help shape how DarShe is planned for working
          women in Dubai.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Back to DarShe
        </Link>
      </div>
    );
  }

  const percent = Math.round(((step + 1) / TOTAL) * 100);

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-line bg-card p-6 sm:p-10 lg:p-12">
      <div className="mb-8">
        <div className="flex items-baseline justify-between gap-4 text-sm font-medium text-body-muted">
          <span>
            Section {step + 1} of {TOTAL}
          </span>
          <span>{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Survey progress"
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-valuenow={step + 1}
          aria-valuetext={`Section ${step + 1} of ${TOTAL}: ${section.title}`}
          className="mt-2 h-2 overflow-hidden rounded-full bg-line"
        >
          <div
            className="h-full rounded-full bg-terracotta transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="scroll-mt-24 text-3xl outline-none sm:text-4xl"
      >
        {section.title}
      </h2>
      {section.intro && (
        <p className="mt-4 rounded-2xl bg-cream/70 p-5 leading-relaxed text-body-muted">{section.intro}</p>
      )}

      <div className="mt-8">
        {section.questions.map((q) => (
          <div key={q.id} className="border-t border-line py-6 first:border-t-0 first:pt-0 last:pb-0">
            <QuestionBlock q={q} value={answers[q.id]} error={errors[q.id]} onChange={setAnswer} />
          </div>
        ))}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className="sr-only-field" aria-hidden="true">
        <label htmlFor="survey-company">Company</label>
        <input
          id="survey-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div aria-live="polite" className="mt-6">
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="rounded-xl border border-[#B3261E]/40 bg-[#B3261E]/5 px-4 py-3 text-sm text-[#8C1D18]">
            Please answer the highlighted questions to continue.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="mt-3 rounded-xl border border-[#B3261E]/40 bg-[#B3261E]/5 px-4 py-3 text-sm text-[#8C1D18]">
            Something went wrong. Please try again or email us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="underline">
              {siteConfig.email}
            </a>
            .
          </p>
        )}
        {status === "rate-limited" && (
          <p role="alert" className="mt-3 rounded-xl border border-[#B3261E]/40 bg-[#B3261E]/5 px-4 py-3 text-sm text-[#8C1D18]">
            We&apos;ve received several submissions from this connection recently. Please try again
            later.
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => {
              setErrors({});
              setStep((s) => s - 1);
            }}
            disabled={submitting}
            className="btn-outline"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={submitting} className="btn-primary min-w-[9rem]">
          {submitting ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Sending…
            </>
          ) : isLast ? (
            "Submit survey"
          ) : (
            "Next"
          )}
        </button>
      </div>
    </form>
  );
}
