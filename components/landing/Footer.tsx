import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark bg-espresso text-card">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <span className="text-card">
            <Logo className="!text-card" />
          </span>
          <p className="mt-4 font-display text-xl italic text-card/90">{siteConfig.tagline}</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] !text-card/80 !font-sans">Visit</h2>
          <address className="mt-4 not-italic leading-relaxed text-card/90">
            {siteConfig.location}
          </address>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] !text-card/80 !font-sans">Contact</h2>
          <ul className="mt-4 space-y-2 text-card/90">
            <li>
              <a href={`mailto:${siteConfig.email}`} className="underline-offset-4 hover:underline">
                {siteConfig.email}
              </a>
            </li>
            <li>
              <Link href="/survey" className="underline underline-offset-4 hover:no-underline">
                Take the survey
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-card/20">
        <p className="container-page py-6 text-sm text-card/80">
          © {year} DarShe. Co-living for working women in Dubai.
        </p>
      </div>
    </footer>
  );
}
