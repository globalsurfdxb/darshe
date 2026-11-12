import { siteConfig } from "@/lib/site-config";
import { EnquiryForm } from "./EnquiryForm";

const steps = [
  "Your enquiry goes straight to the DarShe team.",
  `We reach out within ${siteConfig.responseTime} to talk through rooms and availability.`,
  "Visit in person, meet the community, and make it home.",
];

export function Enquire() {
  return (
    <section id="enquire" className="scroll-mt-20 section-y">
      <div className="container-page grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div data-reveal>
          <p className="eyebrow">Register your interest</p>
          <h2 className="text-4xl leading-tight sm:text-5xl">Let&apos;s find your place at DarShe.</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-body-muted">
            We&apos;d love to get to know you. Share a few details about yourself and how you like
            to live. It takes under a minute, and it helps us suggest the room and stay that suit
            you best. There&apos;s no commitment, just the start of a conversation.
          </p>

          <div className="mt-10 max-w-xl rounded-3xl border border-line bg-card/60 p-7">
            <h3 className="text-2xl">What happens next</h3>
            <ol className="mt-5 space-y-4">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta text-sm font-semibold text-card"
                  >
                    {i + 1}
                  </span>
                  <span className="pt-1 leading-snug text-ink">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <EnquiryForm />
      </div>
    </section>
  );
}
