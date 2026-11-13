import type { Metadata } from "next";
import Link from "next/link";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Women's Housing Survey | DarShe",
  description:
    "Help shape DarShe, a women-only co-living residence for working women in Dubai. Share how you live today and what you would want from a home.",
  // A link shared directly with respondents; not meant to be found through search.
  robots: { index: false, follow: false },
};

export default function SurveyPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-cream/95">
        <div className="container-page flex h-[72px] items-center justify-between">
          <Link href="/" aria-label="DarShe home">
            <Logo />
          </Link>
          <Link href="/" className="text-[0.95rem] font-medium text-body-muted hover:text-terracotta-dark">
            Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 text-center">
          <p className="eyebrow">Women&apos;s Housing Survey</p>
          <h1 className="text-4xl leading-tight sm:text-5xl">Help us shape DarShe.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-body-muted">
            Tell us how you live today and what you would want from a women-only residence in Dubai.
          </p>
        </div>

        <SurveyForm />
      </main>

      <footer className="pb-12 text-center text-sm text-body-muted">
        © {year} DarShe. Co-living for working women in Dubai.
      </footer>
    </div>
  );
}
